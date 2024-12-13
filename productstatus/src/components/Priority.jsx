import { Button } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/priority.module.scss";

const Priority = () => {
  return (
    <div className={styles.priorityContainer}>
      <div className={styles.headContainer}>
        <h4>Priority List</h4>
        <Link to="/paint" className={styles.link}>
          <Button>Back to paint log</Button>
        </Link>
      </div>
      <p>
        Priority list is submitted by sheet metal or Engineer for expediting
        purpose. Painters are supposed to check regularly and follow notes
        instructions strictly. Item finished will be logged as well.
      </p>
    </div>
  );
};

export default Priority;
