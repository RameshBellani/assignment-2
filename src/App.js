import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faArchive,
  faCheck,
  faSearch,
  faPlus,
  faMinus,
  faFile,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";

const Breadcrumb = ({ path, onNavigate }) => {
  return (
    <nav>
      <ul className="breadcrumb">
        {path.map((folder, index) => (
          <li key={index}>
            <button onClick={() => onNavigate(index)}>{folder}</button>
            {index < path.length - 1 && " > "}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const App = () => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(["Home"]);
  const [currentFolderData, setCurrentFolderData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsToRemove, setItemsToRemove] = useState([]);
  const [selectedCheckboxState, setSelectedCheckboxState] =
    useState("unchecked");

  const checkboxRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://66cff61d181d059277dcc21e.mockapi.io/api/files/files")
      .then((response) => setFiles(response.data))
      .catch((error) => console.error("Error fetching files:", error));
  }, []);

  const handleFolderClick = (folder) => {
    setCurrentPath([...currentPath, folder.name]);
    setCurrentFolderData(folder.data || []);
  };

  const handleFileClick = (file) => {
    setCurrentPath([...currentPath, file.name]);
  };

  const handleNavigate = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    if (index === 0) {
      setCurrentFolderData([]);
    } else {
      const folder = files.find((file) => file.name === newPath[index]);
      setCurrentFolderData(folder.data || []);
    }
  };

  const handleCheckboxChange = (item, isFolder = false) => {
    const updatedItems = selectedItems.some(
      (selectedItem) => selectedItem.name === item.name
    )
      ? selectedItems.filter((selectedItem) => selectedItem.name !== item.name)
      : [...selectedItems, { name: item.name, isFolder, selected: true }];

    setSelectedItems(updatedItems);
  };

  const handleTopCheckboxChange = () => {
    const allSelected = selectedItems.every((item) => item.selected);
    const updatedItems = selectedItems.map((item) => ({
      ...item,
      selected: !allSelected,
    }));

    setSelectedItems(updatedItems);
  };

  const updateCheckboxState = useCallback(() => {
    const selectedCount = selectedItems.filter((item) => item.selected).length;
    if (selectedCount === 0) {
      setSelectedCheckboxState("unchecked");
    } else if (selectedCount === selectedItems.length) {
      setSelectedCheckboxState("checked");
    } else {
      setSelectedCheckboxState("indeterminate");
    }
  }, [selectedItems]);

  useEffect(() => {
    updateCheckboxState();
  }, [selectedItems, updateCheckboxState]);

  useEffect(() => {
    const checkbox = checkboxRef.current;
    if (checkbox) {
      checkbox.indeterminate = selectedCheckboxState === "indeterminate";
    }
  }, [selectedCheckboxState]);

  const handleSelectItemToRemove = (item) => {
    const updatedItemsToRemove = itemsToRemove.includes(item.name)
      ? itemsToRemove.filter((name) => name !== item.name)
      : [...itemsToRemove, item.name];

    setItemsToRemove(updatedItemsToRemove);
  };

  const handleRemoveSelectedItems = () => {
    const updatedSelectedItems = selectedItems.filter(
      (item) => !itemsToRemove.includes(item.name)
    );
    setSelectedItems(updatedSelectedItems);
    setItemsToRemove([]);
    setSelectedCheckboxState("unchecked");
  };
  const renderFiles = () => {
    const dateModified = new Date().toLocaleString();
    if (currentPath.length === 1) {
      return files.map((folder) => (
        <tr key={folder.id}>
          <td>
            <input
              type="checkbox"
              id={`folder-checkbox-${folder.id}`}
              name={`folder-checkbox-${folder.id}`}
              checked={selectedItems.some(
                (selectedItem) =>
                  selectedItem.name === folder.name && selectedItem.selected
              )}
              onChange={() => handleCheckboxChange(folder, true)}
            />
          </td>
          <td>
            <button onClick={() => handleFolderClick(folder)}>
              <FontAwesomeIcon icon={faFolder} /> {folder.name}
            </button>
          </td>
          <td>Folder</td>
          <td>{dateModified}</td>
        </tr>
      ));
    } else {
      return currentFolderData.map((file) => (
        <tr key={file.id}>
          <td>
            <input
              type="checkbox"
              id={`file-checkbox-${file.id}`}
              name={`file-checkbox-${file.id}`}
              checked={selectedItems.some(
                (selectedItem) =>
                  selectedItem.name === file.name && selectedItem.selected
              )}
              onChange={() => handleCheckboxChange(file)}
            />
          </td>
          <td>
            <button onClick={() => handleFileClick(file)}>
              <FontAwesomeIcon icon={faFile} /> {file.name}
            </button>
          </td>
          <td>File</td>
          <td>{dateModified}</td>
        </tr>
      ));
    }
  };

  const renderSelectedItems = () => {
    if (selectedItems.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="error-message">
            Add content to backup set
          </td>
        </tr>
      );
    }
    return selectedItems.map((item, index) => (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            id={`remove-item-checkbox-${index}`}
            name={`remove-item-checkbox-${index}`}
            checked={itemsToRemove.includes(item.name)}
            onChange={() => handleSelectItemToRemove(item)}
          />
        </td>
        <td>{item.name}</td>
        <td>-</td>
        <td>{`2024/08/30 11:56:42 AM`}</td>
      </tr>
    ));
  };

  return (
    <div className="app-container">
      <div className="division1">
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{
              display:"flex",
            }}>
              <FontAwesomeIcon icon={faHouse} /> 
              <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FontAwesomeIcon icon={faArchive} /> Archive |
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FontAwesomeIcon icon={faSearch} /> Search |
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FontAwesomeIcon icon={faPlus} /> Create New Backup Set
              </div>
            </div>
          </div>
        </div>
        <table className="file-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Type</th>
              <th>Date Modified</th>
            </tr>
          </thead>
          <tbody>{renderFiles()}</tbody>
        </table>
      </div>

      <div className="division2">
        <h2>Selected Items</h2>
        <div className="top-checkbox">
          <input
            ref={checkboxRef}
            type="checkbox"
            id="select-all-checkbox"
            name="select-all-checkbox"
            checked={selectedCheckboxState === "checked"}
            onChange={handleTopCheckboxChange}
          />
          <FontAwesomeIcon
            icon={
              selectedCheckboxState === "checked"
                ? faCheck
                : selectedCheckboxState === "indeterminate"
                ? faMinus
                : faCheck
            }
          />
          <button onClick={handleRemoveSelectedItems}>
            <FontAwesomeIcon icon={faArchive} /> Remove Selected
          </button>
        </div>
        <table className="selected-table">
          <thead>
            <tr>
              <th></th>
              <th>Selected File/Folder</th>
              <th>Size</th>
              <th>Date Modified</th>
            </tr>
          </thead>
          <tbody>{renderSelectedItems()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
