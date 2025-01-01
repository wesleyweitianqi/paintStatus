import React, { useEffect, useState, useContext } from "react";

import PaintedTable from "./PaintedTable";
import instance from "../utils/http";
import { AppContext } from "../AppContext";

const Status = () => {
  const [todatCompleteCC, setTodayCompleteCC] = useState([]);
  const [currentPaint, setCurrentPaint] = useState("");
  const fetchTodayCompleteCC = async () => {
    const res = await instance.get("/coreclamp/todaycomplete");
    const ccArray = res.data.data.map((item) => item.wo);
    setTodayCompleteCC(ccArray);
  };

  const fetchCurrentPaint = async () => {
    try {
      const res = await instance.get("/paint/currentpaint");
      setCurrentPaint(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchTodayCompleteCC();
    fetchCurrentPaint();
  }, []);
  return (
    <div>
      <h4>Production Status</h4>
      <hr />
      <h4>
        Current Painting: <span style={{ color: "red" }}>{currentPaint}</span>
      </h4>
      <h4>This week painting shedule</h4>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Monday</th>
            <th scope="col">Tuesday</th>
            <th scope="col">Wednesday</th>
            <th scope="col">Thursday</th>
            <th scope="col">Friday</th>
            <th scope="col">Saturday</th>
            {/* <th scope="col">Action</th> */}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <h4>Core clamps cutting today</h4>
      <p>{todatCompleteCC.join(", ")}</p>
      <h4>WO paint completed Today</h4>
    </div>
  );
};

export default Status;
