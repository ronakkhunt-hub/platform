import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ImportExport.css";

const ImportExport = () => {
  const [file, setFile] = useState("");
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);

  useEffect(() => {
    async function getDataFromDatabase() {
      const result = await axios.get("http://localhost:8000/getData");
      const filteredArray = result.data.data.map((item) => {
        return {
          ...item,
          selected: false,
        };
      });
      setData(filteredArray);
    }
    getDataFromDatabase();
  }, []);

  async function uploadFile() {
    const form = new FormData();
    form.append("upload", file);
    if (form) {
      await axios.post("http://localhost:8000/imports", form);
    }
  }

  async function exportFile() {
    await axios.post("http://localhost:8000/exports", data);
  }

  async function deleteSheetData() {
    await axios.post("http://localhost:8000/delete-sheetdata", {
      data: selectedData,
    });
  }

  function selectOptionHanlder(index, item) {
    const { _id, name, age, phoneno, selected } = item;
    data.splice(index, 1, { _id, name, age, phoneno, selected: !selected });
    const findData = data.find((item) => item._id === _id);
    if (findData.selected) {
      setSelectedData([...selectedData, item]);
    } else {
      const newArray = selectedData.filter((item) => item !== findData._id);
      setSelectedData(newArray);
    }
    setData([...data]);
  }

  function handleAllChecked(event) {
    const result = data.map((item) => {
      return {
        ...item,
        selected: event.target.checked,
      };
    });
    setSelectedData(result);
    setData(result);
  }

  return (
    <>
      <div className="mainContainer">
        <div className="headerSection">
          <div className="importExportSection">
            <div className="importSection">
              <input
                type="file"
                name="upload"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button className="importBtn" onClick={uploadFile}>
                Import
              </button>
            </div>
            <button className="exportBtn" onClick={deleteSheetData}>
              Delete
            </button>
            <button className="exportBtn" onClick={exportFile}>
              Export
            </button>
          </div>
        </div>

        <table className="tableWrapper">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkBox"
                  name="checkexport"
                  onChange={(e) => handleAllChecked(e)}
                  defaultValue="checkedall"
                />
              </th>
              <th>Name</th>
              <th>Age</th>
              <th>Phone No</th>
            </tr>
          </thead>
          <tbody>
            {data.length &&
              data.map((item, i) => (
                <tr key={i} className="tableData">
                  <td>
                    <input
                      type="checkbox"
                      className="checkBox"
                      name="checktoexport"
                      onChange={() => selectOptionHanlder(i, item)}
                      checked={item.selected}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.age}</td>
                  <td>{item.phoneno}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ImportExport;
