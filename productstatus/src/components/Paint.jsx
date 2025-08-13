import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Select } from "antd";
import PaintedTable from "./PaintedTable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"; // or free-regular-svg-icons
import { message } from "antd";

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
  const [searchWo, setSearchWo] = useState("");
  const [isSearchResult, setIsSearchResult] = useState(false);

  useEffect(() => {
    // Load descriptions and locations from constants.js
    setDescriptions(loadDescriptionList());
    setLocations(loadLocationList());
  }, []);

  const handleFinish = async (values) => {
    try {
      const res = await instance.post("/paint", values);
      if(res.data.code === 0){
        message.success("Painted part added successfully");
      }
      setList(res.data.data);
    } catch (error) {
      console.error("Error submitting the request:", error);
    }
  };

  const handleDelete = async (wo) => {
    console.log(wo);
    try {
      const res = await instance.post("/paint/delete", { wo });
      if(res.data && res.data.code === 0){
        const newList = list.filter((item) => item.wo !== wo);
        setList(newList);
        message.success("Deleted successfully");
      } else {
        message.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error("Failed to delete");
    }
  };
  const saveTOExcel = () => {
    instance.post("/paint/savetoexcel").then((res) => {
      if (res.data.code === 0) {
        alert(res.data.message);
      }
    });
  };

  const handleSearch = async () => {
    try {
      const res = await instance.get(`/paint/search`, { params: { wo: searchWo } });
      const data = res.data?.data || [];
      if (data.length > 0) {
        setList(data);
        setIsSearchResult(true);
      } else {
        // reload full list if empty
        const all = await instance.get("/paint");
        setList(all.data?.data || []);
        setIsSearchResult(false);
        message.info("No results found; showing latest items");
      }
    } catch (e) {
      console.error(e);
      message.error("Search failed");
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
        <Link to="/priority" target="_blank" rel="noopener noreferrer">
          <Button>To Priority List</Button>
        </Link>
        <Link to="/setting" target="_blank" rel="noopener noreferrer">
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
              <Input type="number" min={0} />
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Input
            placeholder="Search WO#"
            value={searchWo}
            onChange={(e) => setSearchWo(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSearch}>Search</Button>
          <Button onClick={() => saveTOExcel()}>Submit</Button>
        </div>
      </div>
      <p>
        You will find the excel record at:{" "}
        <strong>"O:\1. PERSONAL FOLDERS\Wesley\PaintRecord"</strong>
      </p>
      <div style={{ marginBottom: isSearchResult ? "10%" : 0 }}>
        <PaintedTable list={list} handleDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Status;
