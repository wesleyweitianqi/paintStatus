import React, { useState, useEffect } from "react";
import { Input, Radio, Space } from "antd";
import instance from "../utils/http.js";

const CurrentPaint = () => {
  const [currentPaint, setCurrentPaint] = useState(null);
  const [value, setValue] = useState(null);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    fetchCurrentPaint();
  }, []);

  const fetchCurrentPaint = async () => {
    try {
      const res = await instance.get("/paint/currentpaint");
      console.log("🚀 ~ fetchCurrentPaint ~ res:", res.data);
      setCurrentPaint(res.data.data);
      setValue(res.data.data);
    } catch (error) {
      console.error("Error fetching current paint:", error);
    }
  };

  const updateCurrentPaint = async (paint) => {
    try {
      await instance.post("/paint/currentpaint", { paint });
      setCurrentPaint(paint);
    } catch (error) {
      console.error("Error updating current paint:", error);
    }
  };

  const onChange = (e) => {
    const selectedValue = e.target.value;
    setValue(selectedValue);
    updateCurrentPaint(selectedValue);

    if (selectedValue !== "Special Color") {
      setCustomInput("");
    }
  };

  const onInputChange = (e) => {
    const inputValue = e.target.value;
    setCustomInput(inputValue);
    updateCurrentPaint(inputValue);
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical" style={{ textAlign: "left" }}>
          <Radio value="ASA61 GREY">ASA61 GREY</Radio>
          <Radio value="WHITE">WHITE</Radio>
          <Radio value="REX BLACK">REX BLACK</Radio>
          <Radio value="Special Color">
            Special Color
            {value === "Special Color" ? (
              <Input
                style={{
                  width: 100,
                  marginInlineStart: 10,
                }}
                value={customInput}
                onChange={onInputChange}
              />
            ) : null}
          </Radio>
        </Space>
      </Radio.Group>
    </div>
  );
};

export default CurrentPaint;
