import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import moment from "moment";
import {
  BarChartOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  FileImageOutlined,
  LockOutlined,
  SaveOutlined,
  ToolOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import instance from "../utils/http";
import "./Status.css";

const { Text, Title } = Typography;
const { TextArea } = Input;

const PLANNED_SHIFT_MINUTES = 8 * 60;
const SHIFT_INPUT_FORMATS = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DD HH:mm",
  "YYYY-MM-DD H:mm:ss",
  "YYYY-MM-DD H:mm",
];
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
const ERROR_LOG_FIELDS = [
  "maintenance",
  "category",
  "startTime",
  "endTime",
  "rootCause",
  "solution",
];
const MAX_ERROR_PHOTOS = 10;

const toArray = (value) => (Array.isArray(value) ? value : []);

const getTodayValue = () => moment().format("YYYY-MM-DD");
const getCurrentTimeValue = () => moment().format("HH:mm");
const hasField = (values, field) =>
  Object.prototype.hasOwnProperty.call(values, field);

const parseShiftDateTime = (shiftDate, timeValue) => {
  if (!shiftDate || !timeValue) {
    return null;
  }

  const parsed = moment(
    `${shiftDate} ${String(timeValue).trim()}`,
    SHIFT_INPUT_FORMATS,
    true
  );

  return parsed.isValid() ? parsed.toDate() : null;
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

  const parsedDate = moment(date);
  if (!parsedDate.isValid()) {
    return "-";
  }

  return parsedDate.format("MMM D, h:mm A");
};

const formatDateTimeInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = moment(date);
  return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DDTHH:mm") : "";
};

const formatShiftHistoryTime = (record, boundary) => {
  const isStart = boundary === "start";
  const dateField = isStart ? "startDateLocal" : "endDateLocal";
  const timeField = isStart ? "startTimeLocal" : "endTimeLocal";
  const timestampField = isStart ? "startTime" : "endTime";
  const localDate = record[dateField] || record.shiftDate;
  const localTime = record[timeField];

  if (localDate && localTime) {
    const parsedLocal = moment(
      `${localDate} ${localTime}`,
      SHIFT_INPUT_FORMATS,
      true
    );

    if (parsedLocal.isValid()) {
      return parsedLocal.format("MMM D, h:mm A");
    }
  }

  if (record.shiftDate && record[timestampField]) {
    const legacyUtc = moment.utc(record[timestampField]);

    if (legacyUtc.isValid()) {
      return legacyUtc.format("MMM D, h:mm A");
    }
  }

  return formatDateTime(record[timestampField]);
};

const getShiftEditValues = (record) => {
  const startDate = record.startDateLocal || record.shiftDate || "";
  const endDate = record.endDateLocal || record.shiftDate || "";
  const startTime =
    record.startTimeLocal ||
    (record.startTime && moment.utc(record.startTime).format("HH:mm")) ||
    "";
  const endTime =
    record.endTimeLocal ||
    (record.endTime && moment.utc(record.endTime).format("HH:mm")) ||
    "";

  return {
    shiftDate: startDate,
    startTime,
    endTime,
    endDate,
    password: "",
  };
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

const getPhotoKey = (photo, index = 0) =>
  String(photo?.url || photo?.filename || photo?._id || `photo-${index}`);

const isSamePhoto = (leftPhoto, rightPhoto) =>
  Boolean(
    leftPhoto &&
      rightPhoto &&
      ((leftPhoto.url && leftPhoto.url === rightPhoto.url) ||
        (leftPhoto.filename && leftPhoto.filename === rightPhoto.filename))
  );

const getRecordPhotos = (record) => {
  const photos = toArray(record?.photos).filter((photo) => photo?.url);
  const legacyPhoto = record?.photo;

  if (
    legacyPhoto?.url &&
    !photos.some((photo) => isSamePhoto(photo, legacyPhoto))
  ) {
    return [legacyPhoto, ...photos];
  }

  return photos;
};

const getPhotoFileList = (record) => {
  return getRecordPhotos(record).map((photo, index) => ({
    uid: getPhotoKey(photo, index),
    name: photo.originalName || photo.filename || `photo-${index + 1}`,
    status: "done",
    url: getPhotoUrl(photo.url),
  }));
};

const appendNewPhotos = (payload, files) => {
  toArray(files).forEach((file) => {
    if (file.originFileObj) {
      payload.append("photos", file.originFileObj);
    }
  });
};

const getKeptPhotoKeys = (files) =>
  toArray(files)
    .filter((file) => !file.originFileObj)
    .map((file) => String(file.uid));

const limitPhotoList = (fileList) => fileList.slice(0, MAX_ERROR_PHOTOS);

const Status = () => {
  const [shiftForm] = Form.useForm();
  const [editShiftForm] = Form.useForm();
  const [errorForm] = Form.useForm();
  const [editErrorForm] = Form.useForm();
  const [paintRecords, setPaintRecords] = useState([]);
  const [shiftRecords, setShiftRecords] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingShift, setSavingShift] = useState(false);
  const [isShiftEndManual, setIsShiftEndManual] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [updatingShift, setUpdatingShift] = useState(false);
  const [deleteShiftTarget, setDeleteShiftTarget] = useState(null);
  const [deleteShiftPassword, setDeleteShiftPassword] = useState("");
  const [deletingShift, setDeletingShift] = useState(false);
  const [savingError, setSavingError] = useState(false);
  const [photoList, setPhotoList] = useState([]);
  const [editPhotoList, setEditPhotoList] = useState([]);
  const [editingError, setEditingError] = useState(null);
  const [updatingError, setUpdatingError] = useState(false);
  const [deletingError, setDeletingError] = useState(false);
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

  useEffect(() => {
    if (!shiftValues.startTime || isShiftEndManual) {
      return undefined;
    }

    const syncEndTimeToNow = () => {
      const currentTime = getCurrentTimeValue();
      shiftForm.setFieldsValue({ endTime: currentTime });
      setShiftValues((prevValues) => {
        if (!prevValues.startTime || prevValues.endTime === currentTime) {
          return prevValues;
        }

        return {
          ...prevValues,
          endTime: currentTime,
        };
      });
    };

    syncEndTimeToNow();
    const interval = window.setInterval(syncEndTimeToNow, 30000);

    return () => window.clearInterval(interval);
  }, [isShiftEndManual, shiftForm, shiftValues.startTime]);

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
    const payload = {
      ...values,
      endTime: values.endTime || getCurrentTimeValue(),
    };

    setSavingShift(true);
    try {
      const res = await instance.post("/shiftefficiency", payload);
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

  const handleShiftValuesChange = (changedValues, values) => {
    const nextValues = { ...values };

    if (hasField(changedValues, "endTime")) {
      setIsShiftEndManual(Boolean(changedValues.endTime));
    }

    if (hasField(changedValues, "startTime") && !changedValues.startTime) {
      setIsShiftEndManual(false);
      nextValues.endTime = "";
      shiftForm.setFieldsValue({ endTime: "" });
    }

    if (
      hasField(changedValues, "startTime") &&
      changedValues.startTime &&
      !isShiftEndManual &&
      !nextValues.endTime
    ) {
      const currentTime = getCurrentTimeValue();
      nextValues.endTime = currentTime;
      shiftForm.setFieldsValue({ endTime: currentTime });
    }

    setShiftValues(nextValues);
  };

  const openEditShift = (record) => {
    setEditingShift(record);
    editShiftForm.setFieldsValue(getShiftEditValues(record));
  };

  const closeEditShift = () => {
    setEditingShift(null);
    editShiftForm.resetFields();
  };

  const handleShiftUpdate = async (values) => {
    if (!editingShift?._id) {
      return;
    }

    setUpdatingShift(true);
    try {
      const res = await instance.put(
        `/shiftefficiency/${editingShift._id}`,
        values
      );

      if (res.data?.code === 0) {
        message.success("Shift efficiency record updated");
        closeEditShift();
        fetchShiftRecords();
      } else {
        message.error(res.data?.message || "Failed to update shift record");
      }
    } catch (error) {
      console.error("Error updating shift efficiency record:", error);
      message.error(
        error.response?.data?.message || "Failed to update shift record"
      );
    } finally {
      setUpdatingShift(false);
    }
  };

  const openDeleteShift = (record) => {
    setDeleteShiftTarget(record);
    setDeleteShiftPassword("");
  };

  const closeDeleteShift = () => {
    setDeleteShiftTarget(null);
    setDeleteShiftPassword("");
  };

  const handleShiftDelete = async () => {
    if (!deleteShiftTarget?._id) {
      return;
    }

    if (!deleteShiftPassword) {
      message.warning("Enter the delete password");
      return;
    }

    setDeletingShift(true);
    try {
      const res = await instance.delete(
        `/shiftefficiency/${deleteShiftTarget._id}`,
        {
          data: { password: deleteShiftPassword },
        }
      );

      if (res.data?.code === 0) {
        message.success("Shift efficiency record deleted");
        closeDeleteShift();
        fetchShiftRecords();
      } else {
        message.error(res.data?.message || "Failed to delete shift record");
      }
    } catch (error) {
      console.error("Error deleting shift efficiency record:", error);
      message.error(
        error.response?.data?.message || "Failed to delete shift record"
      );
    } finally {
      setDeletingShift(false);
    }
  };

  const handleErrorSubmit = async (values) => {
    const payload = new FormData();

    ERROR_LOG_FIELDS.forEach((field) => {
      if (values[field]) {
        payload.append(field, values[field]);
      }
    });

    appendNewPhotos(payload, photoList);

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
      message.error(
        error.response?.data?.message || "Failed to save error log"
      );
    } finally {
      setSavingError(false);
    }
  };

  const openEditError = (record) => {
    setEditingError(record);
    setEditPhotoList(getPhotoFileList(record));
    editErrorForm.setFieldsValue({
      maintenance: record.maintenance || "",
      category: record.category,
      startTime: formatDateTimeInput(record.startTime),
      endTime: formatDateTimeInput(record.endTime),
      rootCause: record.rootCause || "",
      solution: record.solution || "",
      password: "",
    });
  };

  const closeEditError = () => {
    setEditingError(null);
    setEditPhotoList([]);
    editErrorForm.resetFields();
  };

  const handleErrorUpdate = async (values) => {
    if (!editingError?._id) {
      return;
    }

    const payload = new FormData();
    ERROR_LOG_FIELDS.forEach((field) => {
      payload.append(field, values[field] ?? "");
    });
    payload.append("password", values.password || "");

    appendNewPhotos(payload, editPhotoList);
    payload.append(
      "keptPhotoKeys",
      JSON.stringify(getKeptPhotoKeys(editPhotoList))
    );

    setUpdatingError(true);
    try {
      const res = await instance.put(`/errorlog/${editingError._id}`, payload);
      if (res.data?.code === 0) {
        message.success("Error log updated");
        closeEditError();
        fetchErrorLogs();
      } else {
        message.error(res.data?.message || "Failed to update error log");
      }
    } catch (error) {
      console.error("Error updating error log:", error);
      message.error(
        error.response?.data?.message || "Failed to update error log"
      );
    } finally {
      setUpdatingError(false);
    }
  };

  const handleErrorDelete = () => {
    if (!editingError?._id) {
      return;
    }

    const password = editErrorForm.getFieldValue("password");

    if (!password) {
      editErrorForm.validateFields(["password"]).catch(() => {});
      message.warning("Enter the delete password");
      return;
    }

    Modal.confirm({
      title: "Delete Error Log",
      content: "Delete this error log and its attached photos?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingError(true);
        try {
          const res = await instance.delete(`/errorlog/${editingError._id}`, {
            data: { password },
          });

          if (res.data?.code === 0) {
            message.success("Error log deleted");
            closeEditError();
            fetchErrorLogs();
          } else {
            message.error(res.data?.message || "Failed to delete error log");
          }
        } catch (error) {
          console.error("Error deleting error log:", error);
          message.error(
            error.response?.data?.message || "Failed to delete error log"
          );
        } finally {
          setDeletingError(false);
        }
      },
    });
  };

  const uploadProps = {
    accept: "image/*",
    beforeUpload: () => false,
    fileList: photoList,
    listType: "picture",
    maxCount: MAX_ERROR_PHOTOS,
    multiple: true,
    name: "photos",
    onChange: ({ fileList }) => setPhotoList(limitPhotoList(fileList)),
  };

  const editUploadProps = {
    accept: "image/*",
    beforeUpload: () => false,
    fileList: editPhotoList,
    listType: "picture",
    maxCount: MAX_ERROR_PHOTOS,
    multiple: true,
    name: "photos",
    onChange: ({ fileList }) => setEditPhotoList(limitPhotoList(fileList)),
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
      render: (_, record) => formatShiftHistoryTime(record, "start"),
    },
    {
      title: "End",
      dataIndex: "endTime",
      key: "endTime",
      width: 150,
      render: (_, record) => formatShiftHistoryTime(record, "end"),
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
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Edit shift record">
            <Button
              aria-label="Edit shift record"
              icon={<EditOutlined />}
              onClick={() => openEditShift(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Delete shift record">
            <Button
              aria-label="Delete shift record"
              danger
              icon={<DeleteOutlined />}
              onClick={() => openDeleteShift(record)}
              type="text"
            />
          </Tooltip>
        </Space>
      ),
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
      title: "Photos",
      key: "photos",
      width: 180,
      render: (_, record) => {
        const photos = getRecordPhotos(record);

        return photos.length ? (
          <Space size={4} wrap>
            {photos.map((photo, index) => (
              <Button
                key={getPhotoKey(photo, index)}
                type="link"
                icon={<FileImageOutlined />}
                href={getPhotoUrl(photo.url)}
                target="_blank"
                rel="noreferrer"
              >
                View {index + 1}
              </Button>
            ))}
          </Space>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Edit",
      key: "edit",
      width: 80,
      render: (_, record) => (
        <Tooltip title="Edit error log">
          <Button
            aria-label="Edit error log"
            icon={<EditOutlined />}
            onClick={() => openEditError(record)}
            type="text"
          />
        </Tooltip>
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
            onValuesChange={handleShiftValuesChange}
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
                  extra="Auto-fills to current time after start time is entered."
                  label="End Time"
                  name="endTime"
                >
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>
            <Text className="shift-help">
              Planned shift is fixed at 8 hours. End time follows current time
              until manually changed.
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
          scroll={{ x: 980 }}
          size="middle"
        />
      </Card>

      <Modal
        destroyOnClose
        footer={null}
        onCancel={closeEditShift}
        open={Boolean(editingShift)}
        title="Edit Shift Efficiency Record"
        width={680}
      >
        <Form
          form={editShiftForm}
          layout="vertical"
          onFinish={handleShiftUpdate}
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
            <Col xs={24}>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Enter edit password" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <div className="edit-modal-actions">
            <Button onClick={closeEditShift}>Cancel</Button>
            <Button
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updatingShift}
              type="primary"
            >
              Update Shift Record
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okButtonProps={{ danger: true, loading: deletingShift }}
        okText="Delete"
        onCancel={closeDeleteShift}
        onOk={handleShiftDelete}
        open={Boolean(deleteShiftTarget)}
        title="Delete Shift Efficiency Record"
      >
        <Text>
          Enter password to delete the{" "}
          <strong>{deleteShiftTarget?.shiftDate || "selected"}</strong> shift
          record.
        </Text>
        <Input.Password
          autoFocus
          className="delete-password-input"
          prefix={<LockOutlined />}
          placeholder="Password"
          value={deleteShiftPassword}
          onChange={(event) => setDeleteShiftPassword(event.target.value)}
          onPressEnter={handleShiftDelete}
        />
      </Modal>

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
                <Form.Item label="Photos">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select Photos</Button>
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
            scroll={{ x: 980 }}
            size="middle"
          />
        </Card>
      </section>

      <Modal
        destroyOnClose
        footer={null}
        onCancel={closeEditError}
        open={Boolean(editingError)}
        title="Edit Error Log"
        width={760}
      >
        <Form
          form={editErrorForm}
          layout="vertical"
          onFinish={handleErrorUpdate}
        >
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
            <Col xs={24} md={12}>
              <Form.Item label="Photos">
                <Upload {...editUploadProps}>
                  <Button icon={<UploadOutlined />}>Select Photos</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Enter edit password" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <div className="edit-modal-actions">
            <Button onClick={closeEditError}>Cancel</Button>
            <Button
              danger
              disabled={updatingError}
              icon={<DeleteOutlined />}
              loading={deletingError}
              onClick={handleErrorDelete}
            >
              Delete Error Log
            </Button>
            <Button
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updatingError}
              disabled={deletingError}
              type="primary"
            >
              Update Error Log
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Status;
