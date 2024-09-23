import React, { useEffect, useState } from "react";
import styles from "../styles/status.module.scss";
import PaintedTable from "./PaintedTable.jsx";
import instance from "../utils/http.js";

const Status = () => {
  const [wo, setWo] = useState("");
  const [list, setList] = useState([]);
  const [isPainted, setIsPainted] = useState(false);

  const handleWoChange = (e) => {
    setWo(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const res = await instance.post("/paint", { wo, isPainted });
      setList([...res.data.data]); // Create a new array using the spread operator
    } catch (error) {
      console.error("Error submitting the request:", error);
    }
  };
  const handleDelete = async (e) => {
    const newList = [...list];
    const item = newList.splice(e - 1, 1);
    const deleteWo = item[0].wo;
    await instance.post("/paint/delete", { deleteWo });
    setList(newList);
  };

  const handleCheckboxChange = () => {
    setIsPainted(!isPainted);
  };

  useEffect(() => {
    instance
      .get("/paint")
      .then((res) => {
        setList(res.data.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    // Perform actions after state is updated
  }, [list]);

  return (
    <div className={styles.statusContainer}>
      <h3>Painted Parts Entry</h3>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="please enter WO#"
          value={wo}
          onChange={handleWoChange}
        />
        <button onClick={handleButtonClick}>Submit</button>
      </div>
      <div className={styles.checkBoxContainer}>
        <input
          type="checkbox"
          checked={isPainted}
          onChange={handleCheckboxChange}
        />
        <label>Painted</label>
      </div>
      <hr />
      <p>Painted List</p>
      <PaintedTable list={list} handleDelete={handleDelete} />
    </div>
  );
};

export default Status;
