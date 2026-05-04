import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, Radio, Select, Space, Tag, message } from "antd";
import {
  BgColorsOutlined,
  ReloadOutlined,
  SaveOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import instance from "../utils/http.js";
import "./CurrentPaint.css";

const STANDARD_PAINTS = ["ASA61 GREY", "WHITE", "REX BLACK"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const getPaintTagColor = (paint) => {
  if (paint === "ASA61 GREY") {
    return "blue";
  }
  if (paint === "REX BLACK") {
    return "default";
  }
  if (paint === "WHITE") {
    return "cyan";
  }
  return "gold";
};

const CurrentPaint = ({ onUpdate, onScheduleUpdate }) => {
  const [currentPaint, setCurrentPaint] = useState("");
  const [value, setValue] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [loadingPaint, setLoadingPaint] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleForm] = Form.useForm();

  const applyPaintValue = useCallback((paintValue) => {
    setCurrentPaint(paintValue || "");

    if (STANDARD_PAINTS.includes(paintValue)) {
      setValue(paintValue);
      setCustomInput("");
      return;
    }

    if (paintValue) {
      setValue("Special Color");
      setCustomInput(paintValue);
    }
  }, []);

  const fetchCurrentPaint = useCallback(async () => {
    setLoadingPaint(true);
    try {
      const res = await instance.get("/paint/currentpaint");
      const paintValue = res.data?.data || res.data;
      applyPaintValue(paintValue);
    } catch (error) {
      console.error("Error fetching current paint:", error);
      message.error("Failed to fetch current paint");
    } finally {
      setLoadingPaint(false);
    }
  }, [applyPaintValue]);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await instance.get("/paint/schedule");
      scheduleForm.setFieldsValue(res.data?.data || {});
    } catch (error) {
      console.error("Error fetching paint schedule:", error);
      message.error("Failed to fetch schedule");
    }
  }, [scheduleForm]);

  useEffect(() => {
    fetchCurrentPaint();
    fetchSchedule();
  }, [fetchCurrentPaint, fetchSchedule]);

  const updateCurrentPaint = async (paint) => {
    try {
      await instance.post("/paint/currentpaint", { paint });
      applyPaintValue(paint);
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
    setSavingSchedule(true);
    try {
      await instance.post("/paint/schedule", values);
      message.success("Schedule updated successfully");
      if (onScheduleUpdate) {
        onScheduleUpdate();
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      message.error("Failed to update schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handlePaintChange = (event) => {
    const selectedValue = event.target.value;
    setValue(selectedValue);

    if (selectedValue !== "Special Color") {
      updateCurrentPaint(selectedValue);
    }
  };

  const saveCustomPaint = () => {
    const nextPaint = customInput.trim();
    if (!nextPaint) {
      message.warning("Enter a paint color first");
      return;
    }

    updateCurrentPaint(nextPaint);
  };

  return (
    <section className="current-paint-panel">
      <div className="current-paint-header">
        <div>
          <span className="current-paint-kicker">Current Paint</span>
          <h3>
            <BgColorsOutlined />
            Paint Setup
          </h3>
        </div>
        <Space>
          <Tag color={getPaintTagColor(currentPaint)}>
            {currentPaint || "Not set"}
          </Tag>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchCurrentPaint();
              fetchSchedule();
            }}
            loading={loadingPaint}
          />
        </Space>
      </div>

      <Radio.Group
        onChange={handlePaintChange}
        value={value}
        optionType="button"
        buttonStyle="solid"
        className="paint-choice-group"
      >
        {STANDARD_PAINTS.map((paint) => (
          <Radio.Button key={paint} value={paint}>
            {paint}
          </Radio.Button>
        ))}
        <Radio.Button value="Special Color">Special</Radio.Button>
      </Radio.Group>

      {value === "Special Color" && (
        <Space.Compact className="special-color-row">
          <Input
            value={customInput}
            onChange={(event) => setCustomInput(event.target.value)}
            onPressEnter={saveCustomPaint}
            placeholder="Paint color"
          />
          <Button type="primary" onClick={saveCustomPaint}>
            Set
          </Button>
        </Space.Compact>
      )}

      <div className="schedule-header">
        <span>
          <ScheduleOutlined />
          Weekly Schedule
        </span>
      </div>

      <Form
        form={scheduleForm}
        onFinish={handleScheduleSubmit}
        layout="vertical"
        className="schedule-form"
      >
        <div className="schedule-grid">
          {DAYS.map((day) => (
            <Form.Item key={day} name={day} label={day.slice(0, 3)}>
              <Select size="small">
                {STANDARD_PAINTS.map((paint) => (
                  <Select.Option key={paint} value={paint}>
                    {paint}
                  </Select.Option>
                ))}
                <Select.Option value="Special Color">
                  Special Color
                </Select.Option>
              </Select>
            </Form.Item>
          ))}
        </div>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={savingSchedule}
          block
        >
          Save Schedule
        </Button>
      </Form>
    </section>
  );
};

export default CurrentPaint;
