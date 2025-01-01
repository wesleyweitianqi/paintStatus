import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Typography,
  Divider,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  loadDescriptionList,
  loadLocationList,
  addDescription,
  removeDescription,
  addLocation,
  removeLocation,
} from "../utils/constants";
import "./Setting.css";

const { Title, Text } = Typography;

const Setting = () => {
  const [descriptions, setDescriptions] = useState(loadDescriptionList());
  const [locations, setLocations] = useState(loadLocationList());
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    setDescriptions(loadDescriptionList());
    setLocations(loadLocationList());
  }, []);

  const handleAddDescription = () => {
    if (newDescription.trim() && !descriptions.includes(newDescription)) {
      addDescription(newDescription);
      setDescriptions(loadDescriptionList());
      setNewDescription("");
      message.success("Description added successfully");
    } else if (descriptions.includes(newDescription)) {
      message.error("This description already exists");
    }
  };

  const handleDeleteDescription = (description) => {
    removeDescription(description);
    setDescriptions(loadDescriptionList());
    message.success("Description removed successfully");
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation)) {
      addLocation(newLocation);
      setLocations(loadLocationList());
      setNewLocation("");
      message.success("Location added successfully");
    } else if (locations.includes(newLocation)) {
      message.error("This location already exists");
    }
  };

  const handleDeleteLocation = (location) => {
    removeLocation(location);
    setLocations(loadLocationList());
    message.success("Location removed successfully");
  };

  return (
    <div className="settings-page">
      <Title level={2} className="settings-title">
        System Settings
      </Title>

      <div className="settings-grid">
        <Card
          className="settings-card"
          title={
            <div className="card-title">
              <FileTextOutlined className="card-icon" />
              <span>Description Collection</span>
            </div>
          }
        >
          <div className="input-group">
            <Input
              placeholder="Add new description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onPressEnter={handleAddDescription}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDescription}
            >
              Add
            </Button>
          </div>

          <List
            className="settings-list"
            dataSource={descriptions}
            renderItem={(description) => (
              <List.Item
                className="list-item"
                actions={[
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteDescription(description)}
                    />
                  </Tooltip>,
                ]}
              >
                <Text>{description}</Text>
              </List.Item>
            )}
          />
        </Card>

        <Card
          className="settings-card"
          title={
            <div className="card-title">
              <EnvironmentOutlined className="card-icon" />
              <span>Location Collection</span>
            </div>
          }
        >
          <div className="input-group">
            <Input
              placeholder="Add new location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onPressEnter={handleAddLocation}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddLocation}
            >
              Add
            </Button>
          </div>

          <List
            className="settings-list"
            dataSource={locations}
            renderItem={(location) => (
              <List.Item
                className="list-item"
                actions={[
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteLocation(location)}
                    />
                  </Tooltip>,
                ]}
              >
                <Text>{location}</Text>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default Setting;
