import React, { useEffect, useState } from "react";
import "../styles/global.scss";
import { Link, useNavigate } from "react-router-dom";
import instance from "../utils/http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, List, Card, Row, Col } from "antd";
import styles from "../styles/coreclamp.module.scss";
import _ from "lodash";

function CoreClamp() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [todayComplete, setTodayComplete] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [ccList, setCCList] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeRecords, setTimeRecords] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const host = "https://192.168.1.169:8080";

  const fetchCCList = () => {
    instance
      .get("/coreclamp/list")
      .then((res) => {
        setCCList(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching ccList:", error);
        toast.error("Failed to fetch updated list.");
      });
  };

  useEffect(() => {
    fetchCCList();
    instance.get("/coreclamp/completed").then((res) => {
      setCompletedList(res.data.data);
    });
    instance.get("/coreclamp/todaycomplete").then((res) => {
      const data = res.data.data;
      setTodayComplete(data);
    });
    instance.get("/coreclamp/getTimeRecords").then((res) => {
      console.log(res.data.data);
      setTimeRecords(res.data.data);
    });
  }, []);

  useEffect(() => {
    const initialFormData = todayComplete.reduce((acc, item) => {
      if (!acc[item.wo]) {
        acc[item.wo] = {
          comment: "",
          completedAt: "",
        };
      }
      return acc;
    }, {});

    setFormData(initialFormData);
  }, [todayComplete]);

  const handleTimerClick = async () => {
    if (isTimerRunning) {
      // Stop the timer
      const endTime = new Date();
      const updatedRecords = [...timeRecords];
      const lastRecord = updatedRecords[updatedRecords.length - 1];
      lastRecord.endTime = endTime;

      // Update the end time in the backend
      await instance
        .post("/coreclamp/saveTimeRecords", lastRecord)
        .then((response) => {
          setIsTimerRunning(false);
          setTimeRecords(updatedRecords);
        })
        .catch((error) => {
          console.error("Error updating time records:", error);
        });
    } else {
      // Start the timer
      const newStartTime = new Date();
      const newRecord = { startTime: newStartTime, endTime: null };

      // Send the new record to the backend
      await instance
        .post("/coreclamp/saveTimeRecords", newRecord)
        .then((response) => {
          setIsTimerRunning(true);
          setTimeRecords([...timeRecords, newRecord]);
          console.log("Start time recorded:", response.data);
        })
        .catch((error) => {
          console.error("Error recording start time:", error);
        });
    }
  };

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
        <td>{item.wo}</td>
        <td>{item.qty}</td>
        <td>
          {item.createdAt
            ? new Date(item.createdAt).toString().substring(0, 15)
            : new Date().toString().substring(0, 15)}
        </td>
        <td>{item.isComplete ? "Completed" : "producing"}</td>
        <td>{fileDom}</td>
        <td>
          <Button onClick={() => finishHandler(item.wo)}>Finish</Button>
        </td>
      </tr>
    );
  });

  const cancelHandler = async (wo) => {
    instance.post("/coreclamp/cancel", { wo: wo }).then((res) => {
      console.log(res.data.data);
      if (res.data.data) {
        const newList = todayComplete.filter((i) => i.wo !== wo);
        setTodayComplete(newList);
        fetchCCList();
        setFormData((prevFormData) => {
          const updatedFormData = { ...prevFormData };
          delete updatedFormData[wo];
          return updatedFormData;
        });
      } else {
        toast.error("Failed to cancel");
      }
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDateTimeForInput = (date) => {
    return new Date(date).toISOString().slice(0, 19);
  };

  const todayCompleteEle = (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">CoreClamp WO#</th>
          <th scope="col">Quantity</th>
          <th scope="col">Completed Time</th>
          <th scope="col">Comment</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {todayComplete.map((item, index) => (
          <tr key={item.wo}>
            <th scope="row">{index + 1}</th>
            <td>{item.wo}</td>
            <td>{item.qty}</td>
            <td>{formatDateTime(item.updatedAt)}</td>
            <td>
              <input
                type="text"
                value={formData[item.wo]?.comment || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [item.wo]: {
                      ...prev[item.wo],
                      comment: e.target.value,
                    },
                  }))
                }
              />
            </td>
            <td>
              <Button variant="warning" onClick={() => cancelHandler(item.wo)}>
                Cancel
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const handleSubmit = async () => {
    const submissionData = todayComplete.map((item) => ({
      wo: item.wo,
      qty: item.qty,
      completedAt: item.completedAt || formData[item.wo]?.completedAt,
      comment: formData[item.wo]?.comment || "",
    }));

    try {
      const response = await instance.post(
        "/coreclamp/savetoexcel",
        submissionData
      );
      if (response.data.code === 0) {
        toast.success("Data saved to Excel successfully!");
      } else {
        toast.error("Failed to save data to Excel");
      }
    } catch (error) {
      console.error("Error saving to Excel:", error);
      toast.error("Failed to save data to Excel");
    }
  };

  const completedDataSource = completedList?.map((item, index) => {
    const list = "";
    return list + item.wo + "  ";
  });

  const finishHandler = async (wo) => {
    try {
      const response = await instance.post("/coreclamp/finish", { wo: wo });

      if (response.data.code === 0) {
        const savedData = response.data.data;
        toast.success(`${wo} completed`);

        fetchCCList();

        setTodayComplete((prev) => {
          const newList = [...prev];
          newList.unshift(savedData);
          return newList;
        });
      } else {
        toast.error("Failed to complete item");
      }
    } catch (error) {
      console.error("Error completing item:", error);
      toast.error("Failed to complete item");
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={handleTimerClick}
        className={isTimerRunning ? styles.stopButton : ""}
      >
        {isTimerRunning ? "Stop Timer" : "Start Timer"}
      </Button>
      <Card title="Time Records" style={{ marginTop: 20 }}>
        <List
          bordered
          dataSource={timeRecords}
          renderItem={(record, index) => (
            <List.Item
              key={index}
              style={{
                padding: "4px 8px", // Reduced padding
                margin: "2px 0", // Reduced margin
              }}
            >
              <Row style={{ width: "100%" }}>
                <Col span={12}>
                  <strong style={{ fontSize: "12px" }}>
                    Record {index + 1}
                  </strong>{" "}
                  {/* Smaller font size */}
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: "12px" }}>
                    {" "}
                    {/* Smaller font size */}
                    Start:{" "}
                    {record.startTime
                      ? new Date(record.startTime).toLocaleString()
                      : "N/A"}
                  </div>
                  <div style={{ fontSize: "12px" }}>
                    {" "}
                    {/* Smaller font size */}
                    End:{" "}
                    {record.endTime
                      ? new Date(record.endTime).toLocaleString()
                      : "In Progress"}
                  </div>
                </Col>
              </Row>
            </List.Item>
          )}
          style={{ margin: "0" }} // Remove extra margin around the List
        />
      </Card>
      <h4>To Do List</h4>
      <hr />
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">CoreClamp WO#</th>
            <th scope="col">Quantity</th>
            <th scope="col">Create_time</th>
            <th scope="col">Status</th>
            <th scope="col">Files</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>{dataSourceEle}</tbody>
      </table>
      <div className={styles.finishToday}>
        <h4>Finished Today</h4>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
      <div className={styles.todayCompleteContainer}>{todayCompleteEle}</div>
      <hr />
      <h4>History</h4>
      <hr />
      <p>All core clamps WOs completed this year:</p>
      <div className={styles.listContainer}>
        <p>{completedDataSource}</p>
      </div>
      <ToastContainer
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
      />
    </div>
  );
}

export default CoreClamp;
