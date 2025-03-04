import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Row,
  Col,
  Select,
  InputNumber,
  Table,
} from "antd";
import instance from "../utils/http";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/bend.module.scss";
import { loadDescriptionList, loadLocationList } from "../utils/constants.js";
import PaintedTable from "./PaintedTable";

const { Option } = Select;

const Bending = () => {
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  console.log("🚀 ~ Bending ~ list:", list);
  const [locations, setLocations] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const handleFinish = async (values) => {
    try {
      const res = await instance.post("/bend", values);
      setList(res.data.data);
    } catch (error) {
      console.error("Error submitting the request:", error);
    }
  };
  const handleDelete = async (index) => {
    console.log(index);
    try {
      const newList = [...list];
      console.log("🚀 ~ handleDelete ~ newList:", newList);
      const [item] = newList.splice(index - 1, 1);
      await instance.post("/bend/delete", { wo: item.wo });
      setList(newList);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  useEffect(() => {
    // Load descriptions and locations from constants.js
    setDescriptions(loadDescriptionList());
    setLocations(loadLocationList());
    instance.get("/bend").then((res) => {
      setList(res.data.data);
    });
  }, []);

  const columns = [
    { title: "Work Order", dataIndex: "wo", key: "wo" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Quantity", dataIndex: "qty", key: "qty" },
    { title: "Priority", dataIndex: "priority", key: "priority" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleDelete(record)}>
          Delete
        </Button>
      ),
    },
  ];

  const handleWOChange = (e) => {
    form.setFieldsValue({ wo: e.target.value.toUpperCase() });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Record Bending Part Information</h2>
      <Form
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          wo: "",
          description: "",
          qty: "",
          priority: 1,
          notes: "",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="WO#"
              name="wo"
              rules={[{ required: true, message: "Please enter WO#" }]}
            >
              <Input onChange={handleWOChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Description" name="description">
              <Select placeholder="Select Description">
                {descriptions.map((description, index) => (
                  <Option key={index} value={description}>
                    {description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Quantity" name="qty">
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Priority"
              name="priority"
              // className={styles.priority}
            >
              <InputNumber min={1} max={3} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Notes" name="notes">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit
          </Button>
        </Form.Item>
      </Form>
      <h4>Bended Job Record</h4>
      <Table dataSource={list} columns={columns} />
      <hr />
    </div>
  );
};

export default Bending;
