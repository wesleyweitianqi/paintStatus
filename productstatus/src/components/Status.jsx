import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  FileImageOutlined,
  SaveOutlined,
  ToolOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import instance from "../utils/http";
import "./Status.css";

const { Text, Title } = Typography;
const { TextArea } = Input;

const PLANNED_SHIFT_MINUTES = 8 * 60;
const ERROR_CATEGORIES = [
  "Mechanical",
  "Electrical",
  "Software / PLC",
  "Human Error",
  "Material Shortage",
  "Quality Inspection",
  "Maintenance",
  "Other",
];

const toArray = (value) => (Array.isArray(value) ? value : []);

const getTodayValue = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
};

const parseShiftDateTime = (shiftDate, timeValue) => {
  if (!shiftDate || !timeValue) {
    return null;
  }

  const parsed = new Date(`${shiftDate}T${timeValue}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getShiftWindow = ({ shiftDate, startTime, endTime }) => {
  const start = parseShiftDateTime(shiftDate, startTime);
  const end = parseShiftDateTime(shiftDate, endTime);

  if (!start || !end) {
    return null;
  }

  let actualEnd = end;
  if (actualEnd <= start) {
    actualEnd = new Date(actualEnd.getTime() + 24 * 60 * 60 * 1000);
  }

  return { start, end: actualEnd };
};

const formatDuration = (minutes) => {
  const safeMinutes = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(photoUrl)) {
    return photoUrl;
  }

  return `${instance.defaults.baseURL || ""}${photoUrl}`;
};

const getCategoryColor = (category) => {
  if (category === "Mechanical") {
    return "volcano";
  }
  if (category === "Electrical") {
    return "gold";
  }
  if (category === "Software / PLC") {
    return "purple";
  }
  if (category === "Maintenance") {
    return "blue";
  }
  return "default";
};

const Status = () => {
  const [shiftForm] = Form.useForm();
  const [errorForm] = Form.useForm();
  const [paintRecords, setPaintRecords] = useState([]);
  const [shiftRecords, setShiftRecords] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingShift, setSavingShift] = useState(false);
  const [savingError, setSavingError] = useState(false);
  const [photoList, setPhotoList] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [shiftValues, setShiftValues] = useState({
    shiftDate: getTodayValue(),
    startTime: "",
    endTime: "",
  });

  const fetchDashboard = useCallback(async () => {
    const [paintResult, shiftResult, errorLogResult] = await Promise.allSettled([
      instance.get("/paint"),
      instance.get("/shiftefficiency"),
      instance.get("/errorlog"),
    ]);

    if (paintResult.status === "fulfilled") {
      setPaintRecords(toArray(paintResult.value.data?.data));
    }

    if (shiftResult.status === "fulfilled") {
      setShiftRecords(toArray(shiftResult.value.data?.data));
    }

    if (errorLogResult.status === "fulfilled") {
      setErrorLogs(toArray(errorLogResult.value.data?.data));
    }

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  const fetchShiftRecords = useCallback(async () => {
    try {
      const res = await instance.get("/shiftefficiency");
      setShiftRecords(toArray(res.data?.data));
    } catch (error) {
      console.error("Error fetching shift efficiency records:", error);
      message.error("Failed to load shift history");
    }
  }, []);

  const fetchErrorLogs = useCallback(async () => {
    try {
      const res = await instance.get("/errorlog");
      setErrorLogs(toArray(res.data?.data));
    } catch (error) {
      console.error("Error fetching error logs:", error);
      message.error("Failed to load error logs");
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const shiftPreview = useMemo(() => {
    const window = getShiftWindow(shiftValues);

    if (!window) {
      return {
        runtimeMinutes: 0,
        downtimeMinutes: PLANNED_SHIFT_MINUTES,
        runtimePercentage: 0,
        paintRecordCount: 0,
        paintQty: 0,
        isReady: false,
      };
    }

    const runtimeMinutes = Math.round(
      (window.end.getTime() - window.start.getTime()) / 60000
    );
    const downtimeMinutes = Math.max(
      PLANNED_SHIFT_MINUTES - runtimeMinutes,
      0
    );
    const runtimePercentage = Math.round(
      (runtimeMinutes / PLANNED_SHIFT_MINUTES) * 1000
    ) / 10;

    const recordsInShift = paintRecords.filter((record) => {
      const recordDate = new Date(record.createdAt || record.updatedAt);
      if (Number.isNaN(recordDate.getTime())) {
        return false;
      }

      return recordDate >= window.start && recordDate <= window.end;
    });

    const paintQty = recordsInShift.reduce((total, record) => {
      const qty = Number(record.qty);
      return Number.isFinite(qty) ? total + qty : total;
    }, 0);

    return {
      runtimeMinutes,
      downtimeMinutes,
      runtimePercentage,
      paintRecordCount: recordsInShift.length,
      paintQty,
      isReady: true,
    };
  }, [paintRecords, shiftValues]);

  const handleShiftSubmit = async (values) => {
    setSavingShift(true);
    try {
      const res = await instance.post("/shiftefficiency", values);
      if (res.data?.code === 0) {
        message.success("Shift efficiency record saved");
        fetchShiftRecords();
      } else {
        message.error(res.data?.message || "Failed to save shift record");
      }
    } catch (error) {
      console.error("Error saving shift efficiency record:", error);
      message.error("Failed to save shift record");
    } finally {
      setSavingShift(false);
    }
  };

  const handleErrorSubmit = async (values) => {
    const payload = new FormData();

    [
      "maintenance",
      "category",
      "startTime",
      "endTime",
      "rootCause",
      "solution",
    ].forEach((field) => {
      if (values[field]) {
        payload.append(field, values[field]);
      }
    });

    if (photoList[0]?.originFileObj) {
      payload.append("photo", photoList[0].originFileObj);
    }

    setSavingError(true);
    try {
      const res = await instance.post("/errorlog", payload);
      if (res.data?.code === 0) {
        message.success("Error log saved");
        errorForm.resetFields();
        setPhotoList([]);
        fetchErrorLogs();
      } else {
        message.error(res.data?.message || "Failed to save error log");
      }
    } catch (error) {
      console.error("Error saving error log:", error);
      message.error("Failed to save error log");
    } finally {
      setSavingError(false);
    }
  };

  const uploadProps = {
    accept: "image/*",
    beforeUpload: () => false,
    fileList: photoList,
    maxCount: 1,
    onChange: ({ fileList }) => setPhotoList(fileList.slice(-1)),
  };

  const shiftColumns = [
    {
      title: "Shift Date",
      dataIndex: "shiftDate",
      key: "shiftDate",
      width: 120,
    },
    {
      title: "Start",
      dataIndex: "startTime",
      key: "startTime",
      width: 150,
      render: (value) => formatDateTime(value),
    },
    {
      title: "End",
      dataIndex: "endTime",
      key: "endTime",
      width: 150,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Runtime",
      dataIndex: "runtimeMinutes",
      key: "runtimeMinutes",
      width: 110,
      render: (value) => formatDuration(value),
    },
    {
      title: "Run %",
      dataIndex: "runtimePercentage",
      key: "runtimePercentage",
      width: 100,
      render: (value) => `${value}%`,
    },
    {
      title: "Paint Records",
      dataIndex: "paintRecordCount",
      key: "paintRecordCount",
      width: 130,
    },
    {
      title: "Paint Qty",
      dataIndex: "paintQty",
      key: "paintQty",
      width: 100,
    },
  ];

  const errorColumns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (value) => <Tag color={getCategoryColor(value)}>{value}</Tag>,
    },
    {
      title: "Maintenance",
      dataIndex: "maintenance",
      key: "maintenance",
      width: 150,
      render: (value) => value || "-",
    },
    {
      title: "Time",
      key: "time",
      width: 210,
      render: (_, record) => (
        <span>
          {formatDateTime(record.startTime)} - {formatDateTime(record.endTime)}
        </span>
      ),
    },
    {
      title: "Root Cause",
      dataIndex: "rootCause",
      key: "rootCause",
      ellipsis: true,
      render: (value) => value || "-",
    },
    {
      title: "Solution",
      dataIndex: "solution",
      key: "solution",
      ellipsis: true,
      render: (value) => value || "-",
    },
    {
      title: "Photo",
      key: "photo",
      width: 100,
      render: (_, record) =>
        record.photo?.url ? (
          <Button
            type="link"
            icon={<FileImageOutlined />}
            href={getPhotoUrl(record.photo.url)}
            target="_blank"
            rel="noreferrer"
          >
            View
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="line-dashboard">
      <header className="line-dashboard-header">
        <div>
          <Text className="dashboard-kicker">Paint Line Control</Text>
          <Title level={2} className="dashboard-title">
            Shift Efficiency Log
          </Title>
        </div>
        <Text className="dashboard-refresh">
          Last refresh: {lastUpdated ? formatDateTime(lastUpdated) : "Loading"}
        </Text>
      </header>

      <section className="shift-entry-grid">
        <Card
          className="dashboard-card shift-form-card"
          title={
            <span className="card-title">
              <CalendarOutlined />
              Basic Shift Info
            </span>
          }
        >
          <Form
            form={shiftForm}
            layout="vertical"
            initialValues={shiftValues}
            onFinish={handleShiftSubmit}
            onValuesChange={(_, values) => setShiftValues(values)}
          >
            <Row gutter={[12, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Shift Date"
                  name="shiftDate"
                  rules={[{ required: true, message: "Select shift date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Start Time"
                  name="startTime"
                  rules={[{ required: true, message: "Enter start time" }]}
                >
                  <Input type="time" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="End Time"
                  name="endTime"
                  rules={[{ required: true, message: "Enter end time" }]}
                >
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>
            <Text className="shift-help">
              Planned shift is fixed at 8 hours. If end time is earlier than
              start time, it is treated as the next day.
            </Text>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={savingShift}
              block
            >
              Save Shift Record
            </Button>
          </Form>
        </Card>

        <Card className="dashboard-card efficiency-card">
          <div className="efficiency-heading">
            <DashboardOutlined />
            <span>Runtime percentage vs 8 hours</span>
          </div>
          <Progress
            percent={Math.min(shiftPreview.runtimePercentage, 100)}
            format={() => `${shiftPreview.runtimePercentage}%`}
            status={shiftPreview.runtimePercentage >= 100 ? "success" : "active"}
          />
          <div className="efficiency-detail">
            <span>Runtime: {formatDuration(shiftPreview.runtimeMinutes)}</span>
            <span>
              Downtime: {formatDuration(shiftPreview.downtimeMinutes)}
            </span>
          </div>
        </Card>
      </section>

      <section className="metric-grid compact">
        <Card className="metric-card">
          <Statistic
            title="Runtime"
            value={formatDuration(shiftPreview.runtimeMinutes)}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card className="metric-card">
          <Statistic
            title="Downtime"
            value={formatDuration(shiftPreview.downtimeMinutes)}
            prefix={<FieldTimeOutlined />}
          />
        </Card>
        <Card className="metric-card">
          <Statistic
            title="Paint records in shift"
            value={shiftPreview.paintRecordCount}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card className="metric-card">
          <Statistic
            title="Paint qty in shift"
            value={shiftPreview.paintQty}
            prefix={<BarChartOutlined />}
          />
        </Card>
      </section>

      <Card
        className="dashboard-card shift-history-card"
        title="Shift Efficiency History"
        extra={<Tag>{shiftRecords.length} records</Tag>}
      >
        <Table
          columns={shiftColumns}
          dataSource={shiftRecords}
          rowKey={(record) => record._id}
          loading={loading}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 860 }}
          size="middle"
        />
      </Card>

      <section className="error-log-grid">
        <Card
          className="dashboard-card error-form-card"
          title={
            <span className="card-title">
              <ToolOutlined />
              Post-Activity Error Log
            </span>
          }
        >
          <Form form={errorForm} layout="vertical" onFinish={handleErrorSubmit}>
            <Row gutter={[12, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Maintenance" name="maintenance">
                  <Input placeholder="Maintainer or owner" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: "Select a category" }]}
                >
                  <Select placeholder="Select category">
                    {ERROR_CATEGORIES.map((category) => (
                      <Select.Option key={category} value={category}>
                        {category}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Start Time" name="startTime">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="End Time" name="endTime">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Root Cause" name="rootCause">
                  <TextArea rows={3} placeholder="What caused the issue?" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Solution" name="solution">
                  <TextArea rows={3} placeholder="What fixed it?" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Photo">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select Photo</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              icon={<CameraOutlined />}
              loading={savingError}
              block
            >
              Save Error Log
            </Button>
          </Form>
        </Card>

        <Card
          className="dashboard-card error-table-card"
          title="Recent Error Logs"
          extra={<Tag>{errorLogs.length} logged</Tag>}
        >
          <Table
            columns={errorColumns}
            dataSource={errorLogs}
            rowKey={(record) => record._id}
            loading={loading}
            pagination={{ pageSize: 6 }}
            scroll={{ x: 900 }}
            size="middle"
          />
        </Card>
      </section>
    </div>
  );
};

export default Status;
