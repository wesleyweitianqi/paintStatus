import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Select } from "antd";
import PaintedTable from "./PaintedTable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"; // or free-regular-svg-icons

import { Link } from "react-router-dom";
import instance from "../utils/http.js";
import CurrentPaint from "./CurrentPaint.jsx";
import styles from "../styles/painted.module.scss";
import { loadDescriptionList, loadLocationList } from "../utils/constants.js";
const { Option } = Select;

const Status = () => {
  const [list, setList] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Load descriptions and locations from constants.js
    setDescriptions(loadDescriptionList());
    setLocations(loadLocationList());
  }, []);

  const handleFinish = async (values) => {
    try {
      const res = await instance.post("/paint", values);
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
      await instance.post("/paint/delete", { deleteWo: item.wo });
      setList(newList);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  const saveTOExcel = () => {
    instance.post("/paint/savetoexcel").then((res) => {
      if (res.data.code === 0) {
        alert(res.data.message);
      }
    });
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
        <Link to="/setting">
          <FontAwesomeIcon icon={faGear} size="2x" />
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
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Moved To" name="movedTo">
              <Select placeholder="Select Location">
                {locations.map((location, index) => (
                  <Option key={index} value={location}>
                    {location}
                  </Option>
                ))}
              </Select>
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
      <div className={styles.headContainer}>
        <h4>Painted List</h4>
        <Button onClick={() => saveTOExcel()}>Submit</Button>
      </div>
      <PaintedTable list={list} handleDelete={handleDelete} />
    </div>
  );
};

export default Status;
