import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/priority.module.scss";
import instance from "../utils/http";
import { Table, Button, message, Popconfirm } from "antd";
const Priority = () => {
  const [priorityList, setPriorityList] = useState([]);
  console.log("🚀 ~ Priority ~ priorityList:", priorityList);
  useEffect(() => {
    const fetchPriorityList = async () => {
      const response = await instance.get("/paint/getpaintjob");
      setPriorityList(response.data.data);
    };
    fetchPriorityList();
  }, []);
  const handleFinish = async (record) => {
    const response = await instance.post("/paint/updatepaintjob", record);
    if (response.data.code === 0) {
      setPriorityList((prev) => {
        return prev.map((item) => {
          if (item.wo === record.wo) {
            return { ...item, complete: true };
          }
          return item;
        });
      });
      message.success("Marked as finished");
    }
  };
  const columns = [
    { title: "WO", dataIndex: "wo", key: "wo" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Qty", dataIndex: "qty", key: "qty" },
    { title: "Moved To", dataIndex: "movedTo", key: "movedTo" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
    {
      title: "Action",
      key: "action",
      width: "100px",
      render: (_, record) =>
        !record.finished && (
          <Popconfirm
            title="Mark as Finished"
            description="Are you sure to mark this as finished?"
            onConfirm={() => handleFinish(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" size="small" className="finish-button">
              Finish
            </Button>
          </Popconfirm>
        ),
    },
  ];

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
      <hr />

      <Table
        dataSource={priorityList.filter((item) => {
          return item.complete === false;
        })}
        columns={columns}
        pagination={false}
      />
    </div>
  );
};

export default Priority;
