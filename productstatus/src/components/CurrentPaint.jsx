import React, { useState, useEffect } from "react";
import {
  Radio,
  Space,
  Input,
  Select,
  Button,
  Form,
  Card,
  Divider,
  message,
} from "antd";
import {
  ReloadOutlined,
  ScheduleOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import instance from "../utils/http.js";
import "./CurrentPaint.css";

const CurrentPaint = ({ onUpdate, onScheduleUpdate }) => {
  const [currentPaint, setCurrentPaint] = useState(null);
  const [value, setValue] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [scheduleForm] = Form.useForm();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    fetchCurrentPaint();
  }, []);

  const fetchCurrentPaint = async () => {
    try {
      const res = await instance.get("/paint/currentpaint");
      const paintValue = res.data?.data || res.data;
      setCurrentPaint(paintValue);

      if (["ASA61 GREY", "WHITE", "REX BLACK"].includes(paintValue)) {
        setValue(paintValue);
        setCustomInput("");
      } else if (paintValue) {
        setValue("Special Color");
        setCustomInput(paintValue);
      }
    } catch (error) {
      console.error("Error fetching current paint:", error);
      message.error("Failed to fetch current paint");
    }
  };

  const updateCurrentPaint = async (paint) => {
    try {
      await instance.post("/paint/currentpaint", { paint });
      setCurrentPaint(paint);

      if (["ASA61 GREY", "WHITE", "REX BLACK"].includes(paint)) {
        setValue(paint);
        setCustomInput("");
      } else {
        setValue("Special Color");
        setCustomInput(paint);
      }

      message.success("Paint updated successfully");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating current paint:", error);
      message.error("Failed to update paint");
    }
  };

  const handleScheduleSubmit = async (values) => {
    try {
      await instance.post("/paint/schedule", values);
      message.success("Schedule updated successfully");
      if (onScheduleUpdate) {
        onScheduleUpdate();
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      message.error("Failed to update schedule");
    }
  };

  const onChange = (e) => {
    const selectedValue = e.target.value;
    setValue(selectedValue);

    if (selectedValue !== "Special Color") {
      updateCurrentPaint(selectedValue);
      setCustomInput("");
    }
  };

  const onInputChange = (e) => {
    const inputValue = e.target.value;
    setCustomInput(inputValue);
    if (inputValue.trim()) {
      updateCurrentPaint(inputValue);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Paint Settings</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchCurrentPaint}
          type="text"
        >
          Refresh
        </Button>
      </div>

      <div className="settings-content">
        <Card className="settings-card">
          <div className="card-header">
            <BgColorsOutlined className="card-icon" />
            <h3>Current Paint Selection</h3>
          </div>
          <Divider />
          <Radio.Group
            onChange={onChange}
            value={value}
            className="paint-radio-group"
          >
            <Space direction="vertical" className="paint-options">
              <Radio value="ASA61 GREY">ASA61 GREY</Radio>
              <Radio value="WHITE">WHITE</Radio>
              <Radio value="REX BLACK">REX BLACK</Radio>
              <Radio value="Special Color">
                Special Color
                {value === "Special Color" && (
                  <Input
                    className="special-color-input"
                    value={customInput}
                    onChange={onInputChange}
                    placeholder="Enter color name"
                  />
                )}
              </Radio>
            </Space>
          </Radio.Group>
        </Card>

        <Card className="settings-card">
          <div className="card-header">
            <ScheduleOutlined className="card-icon" />
            <h3>Weekly Paint Schedule</h3>
          </div>
          <Divider />
          <Form
            form={scheduleForm}
            onFinish={handleScheduleSubmit}
            layout="vertical"
            className="schedule-form"
          >
            <div className="schedule-grid">
              {days.map((day) => (
                <Form.Item key={day} name={day} label={day}>
                  <Select>
                    <Select.Option value="ASA61 GREY">ASA61 GREY</Select.Option>
                    <Select.Option value="WHITE">WHITE</Select.Option>
                    <Select.Option value="REX BLACK">REX BLACK</Select.Option>
                    <Select.Option value="Special Color">
                      Special Color
                    </Select.Option>
                  </Select>
                </Form.Item>
              ))}
            </div>
            <Form.Item className="submit-button">
              <Button type="primary" htmlType="submit" block>
                Update Schedule
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CurrentPaint;
