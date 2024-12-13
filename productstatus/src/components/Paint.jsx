import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import PaintedTable from "./PaintedTable.jsx";
import { Link } from "react-router-dom";
import instance from "../utils/http.js";
import CurrentPaint from "./CurrentPaint.jsx";
import styles from "../styles/painted.module.scss";

const Status = () => {
  const [list, setList] = useState([]);

  const handleFinish = async (values) => {
    try {
      const res = await instance.post("/paint", values);
      setList(res.data.data); // Update list with server response
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
      await instance.post("/paint/delete", { deleteWo: item.wo });
      setList(newList);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    instance
      .get("/paint")
      .then((res) => {
        setList(res.data.data);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <div>
      <div className={styles.headContainer}>
        <h4>Painted Parts Entry</h4>
        <Link to="/priority">
          <Button>To Priority List</Button>
        </Link>
      </div>
      <Form
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          wo: "",
          description: "",
          qty: "",
          movedTo: "",
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
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Quantity" name="qty">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Moved To" name="movedTo">
              <Input />
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

      <hr />

      <h4>Current Paint</h4>
      <CurrentPaint />

      <h4>Painted List</h4>
      <PaintedTable list={list} handleDelete={handleDelete} />
    </div>
  );
};

export default Status;
