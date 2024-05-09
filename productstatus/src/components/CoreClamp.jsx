import React, { useEffect, useState } from "react";

import "../styles/global.scss";
import { Link, useNavigate } from "react-router-dom";
import instance from "../utils/http";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { Button } from "antd";
// import styles from "../styles/bracketComplete.module.scss";
import _ from "lodash";

function CoreClamp() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [ccList, setCCList] = useState([]);
  const host = "https://192.168.1.169:8080";

  useEffect(() => {
    instance.get("/coreclamp/list").then((res) => {
      console.log(res.data.data);
      setCCList(res.data.data);
    });
  }, []);

  const dataSource = isSearchFocused ? searchResult : ccList;

  const dataSourceEle = dataSource?.map((item, index) => {
    const fileDom = _.isEmpty(item.files)
      ? null
      : item.files.map((one, index) => {
          return (
            <div key={index}>
              <Link
                to={`${host}/coreclamps/${encodeURIComponent(one)}`}
                target="_blank"
                rel="noreferrer"
                download
              >
                {one}
              </Link>
            </div>
          );
        });
    return (
      <tr key={index}>
        <th scope="row">{index}</th>
        <td>
          <Link to={`/data/${item.wo}`} className="fw-bold mb-1">
            {item.wo}
          </Link>
        </td>
        <td>{item.qty}</td>
        <td>
          {item.createdAt
            ? new Date(item.createdAt).toString().substring(0, 15)
            : new Date().toString().substring(0, 15)}
        </td>
        <td>{item.isComplete ? "Completed" : "producing"}</td>
        <td>{fileDom}</td>
      </tr>
    );
  });

  const handleInput = (e) => {
    setSearch(e.target.value);
    console.log(search);
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
  };

  const handleInputBlur = () => {
    setIsSearchFocused(false);
  };

  const handleClick = () => {
    navigate("/coreclamps/add");
  };

  const handleSubmit = () => {
    instance.post("/coreclamps/list", { wo: search }).then((res) => {
      const searchResult = res.data.data;
      if (!searchResult) {
        // toast(`${search} is not exist`);
      }
      setSearchResult(searchResult);
    });
  };

  return (
    <div>
      <h4>Core Clamps List</h4>
      <hr />
      <Button onClick={handleClick}>To add</Button>
      <div>
        <input
          name="bktSearch"
          value={search}
          type="text"
          onChange={handleInput}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button onClick={handleSubmit}>Search</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">CoreClamp WO#</th>
            <th scope="col">Quantity</th>
            <th scope="col">Create_time</th>
            <th scope="col">Status</th>
            <th scope="col">Files</th>
          </tr>
        </thead>
        <tbody>{dataSourceEle}</tbody>
      </table>
      {/* <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}
    </div>
  );
}

export default CoreClamp;
