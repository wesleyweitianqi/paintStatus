import React, { useEffect, useState } from "react";
import styles from "../styles/status.module.scss";
import PaintedTable from "./PaintedTable";

const Status = () => {
  return (
    <div>
      <h4>Production Status</h4>
      <hr />
      <p>
        Current Painting: <span>ASA 61 grey</span>
      </p>
      <p>This week painting shedule</p>
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
      <p>Core clamps cutting today</p>
      <p>WO completed Today</p>
    </div>
  );
};

export default Status;
