import React, { useState, useContext, useEffect } from "react";
import { Input, Radio, Space } from "antd";
import { AppContext } from "../AppContext.js";
const CurrentPaint = () => {
  const [value, setValue] = useState(1);
  const { currentPaint, setCurrentPaint } = useContext(AppContext);
  useEffect(() => {
    setValue(currentPaint);
  }, []);
  const [customInput, setCustomInput] = useState("");

  const onChange = (e) => {
    setValue(e.target.value);
    setCurrentPaint(e.target.value);
    if (e.target.value !== 4) {
      setCustomInput("");
    }
  };

  const onInputChange = (e) => {
    setCustomInput(e.target.value);
  };
  return (
    <Radio.Group onChange={onChange} value={value}>
      <Space direction="vertical">
        <Radio value="ASA61 GREY">ASA61 GREY</Radio>
        <Radio value="WHITE">WHITE</Radio>
        <Radio value="REX BLACK">REX BLACK</Radio>
        <Radio value="Special Color">
          Special Color
          {value === 4 ? (
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
  );
};
export default CurrentPaint;
