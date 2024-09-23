import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  message,
  Popconfirm,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import styles from "../styles/Shear.module.scss";
import moment from "moment";

const { Title } = Typography;

function Shear() {
  const [shearItems, setShearItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShearItems();
  }, []);

  const fetchShearItems = () => {
    setLoading(true);
    axios
      .get("https://localhost:8080/cutlist/cutorderlist")
      .then((response) => {
        setShearItems(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shear items:", error);
        setLoading(false);
      });
  };

  const handleFinishItem = async (orderId, sheetId) => {
    try {
      const response = await axios.post(
        "https://localhost:8080/cutlist/finishitem",
        {
          orderId,
          sheetId,
        }
      );
      if (response.data && response.data.code === 0) {
        fetchShearItems(); // Refresh the list
      }
    } catch (error) {
      console.error("Error finishing item:", error);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Shift",
      dataIndex: "shift",
      key: "shift",
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag
          color={
            status === "Pending"
              ? "blue"
              : status === "Completed"
              ? "green"
              : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const sheetColumns = [
      { title: "Work Order", dataIndex: "wo", key: "wo" },
      { title: "Description", dataIndex: "description", key: "description" },
      { title: "Quantity", dataIndex: "qty", key: "qty" },
      { title: "Cut Size", dataIndex: "cutSize", key: "cutSize" },
      { title: "Gauge", dataIndex: "guage", key: "guage" },
      { title: "Program", dataIndex: "program", key: "program" },
      {
        title: "Action",
        key: "action",
        render: (_, sheet) => (
          <Button
            type={sheet.completed ? "default" : "primary"}
            onClick={() => handleFinishItem(record._id, sheet._id)}
            disabled={sheet.completed}
            icon={sheet.completed ? <CheckOutlined /> : null}
          >
            {sheet.completed ? "Done" : "Finish"}
          </Button>
        ),
      },
    ];

    return (
      <div className={styles.expandedRow}>
        <Table
          columns={sheetColumns}
          dataSource={record.sheets}
          pagination={false}
          rowKey="_id"
        />
      </div>
    );
  };

  return (
    <div className={styles.shearContainer}>
      <div className={styles.header}>
        <Title level={2}>Production Status - Shearing</Title>
      </div>
      <Card>
        <Table
          className={styles.mainTable}
          columns={columns}
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <span onClick={(e) => onExpand(record, e)}>▼</span>
              ) : (
                <span onClick={(e) => onExpand(record, e)}>►</span>
              ),
          }}
          dataSource={shearItems}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default Shear;
