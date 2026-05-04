import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import instance from "../utils/http";
import styles from "../styles/coreclamp.module.scss";

const { Text, Title } = Typography;
const { TextArea } = Input;

const FILE_HOST = "https://192.168.1.169:8080";

const toArray = (value) => (Array.isArray(value) ? value : []);

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

const sumQty = (items) =>
  items.reduce((total, item) => {
    const qty = Number(item.qty);
    return Number.isFinite(qty) ? total + qty : total;
  }, 0);

function CoreClamp() {
  const [searchText, setSearchText] = useState("");
  const [todayComplete, setTodayComplete] = useState([]);
  const [formData, setFormData] = useState({});
  const [ccList, setCCList] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [currentTimer, setCurrentTimer] = useState(null);
  const [timerNotes, setTimerNotes] = useState("");
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timerLoading, setTimerLoading] = useState(false);

  const fetchTimerData = useCallback(async () => {
    try {
      const response = await instance.get("/coreclamp/timer/status");
      if (response.data?.code === 0 && response.data.data) {
        const { currentTimer, todayTimers } = response.data.data;
        setCurrentTimer(currentTimer || null);
        setTimeRecords(toArray(todayTimers));
      }
    } catch (error) {
      console.error("Error fetching timer data:", error);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [listResult, completedResult, todayResult, timerResult] =
        await Promise.allSettled([
          instance.get("/coreclamp/list"),
          instance.get("/coreclamp/completed"),
          instance.get("/coreclamp/todaycomplete"),
          instance.get("/coreclamp/timer/status"),
        ]);

      if (listResult.status === "fulfilled") {
        setCCList(toArray(listResult.value.data?.data));
      }

      if (completedResult.status === "fulfilled") {
        setCompletedList(toArray(completedResult.value.data?.data));
      }

      if (todayResult.status === "fulfilled") {
        setTodayComplete(toArray(todayResult.value.data?.data));
      }

      if (
        timerResult.status === "fulfilled" &&
        timerResult.value.data?.code === 0
      ) {
        const timerData = timerResult.value.data.data || {};
        setCurrentTimer(timerData.currentTimer || null);
        setTimeRecords(toArray(timerData.todayTimers));
      }
    } catch (error) {
      console.error("Error loading core clamp dashboard:", error);
      message.error("Failed to load core clamp data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const intervalId = setInterval(fetchTimerData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchTimerData]);

  useEffect(() => {
    setFormData((previous) =>
      todayComplete.reduce((nextFormData, item) => {
        nextFormData[item.wo] = previous[item.wo] || {
          comment: "",
        };
        return nextFormData;
      }, {})
    );
  }, [todayComplete]);

  const filteredWorkOrders = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return ccList;
    }

    return ccList.filter((item) =>
      [item.wo, item.qty, item.approvedBy]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [ccList, searchText]);

  const summary = useMemo(
    () => ({
      openJobs: ccList.length,
      openQty: sumQty(ccList),
      completedToday: todayComplete.length,
      completedQtyToday: sumQty(todayComplete),
      completedThisYear: completedList.length,
    }),
    [ccList, completedList, todayComplete]
  );

  const isTimerRunning = Boolean(currentTimer?.isRunning);

  const handleStartTimer = async () => {
    setTimerLoading(true);
    try {
      const response = await instance.post("/coreclamp/timer/start", {
        startTime: new Date(),
      });
      if (response.data?.code === 0) {
        const { currentTimer, todayTimers } = response.data.data || {};
        setCurrentTimer(currentTimer || null);
        setTimeRecords(toArray(todayTimers));
        message.success("Timer started");
      } else {
        message.error(response.data?.message || "Failed to start timer");
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      message.error("Failed to start timer");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleStopTimer = async () => {
    setTimerLoading(true);
    try {
      const response = await instance.post("/coreclamp/timer/stop", {
        notes: timerNotes,
        endTime: new Date(),
      });
      if (response.data?.code === 0) {
        const { todayTimers } = response.data.data || {};
        setCurrentTimer(null);
        setTimeRecords(toArray(todayTimers));
        setTimerNotes("");
        setIsStopModalVisible(false);
        message.success("Timer stopped");
      } else {
        message.error(response.data?.message || "Failed to stop timer");
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      message.error("Failed to stop timer");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleFinish = async (wo) => {
    try {
      const response = await instance.post("/coreclamp/finish", { wo });

      if (response.data?.code === 0) {
        const savedData = response.data.data;
        setCCList((previous) => previous.filter((item) => item.wo !== wo));
        setTodayComplete((previous) => {
          if (previous.some((item) => item.wo === savedData.wo)) {
            return previous;
          }
          return [savedData, ...previous];
        });
        message.success(`${wo} completed`);
      } else {
        message.error(response.data?.message || "Failed to complete item");
      }
    } catch (error) {
      console.error("Error completing item:", error);
      message.error("Failed to complete item");
    }
  };

  const handleCancel = async (wo) => {
    try {
      const response = await instance.post("/coreclamp/cancel", { wo });
      if (response.data?.code === 0 && response.data.data) {
        setTodayComplete((previous) =>
          previous.filter((item) => item.wo !== wo)
        );
        setFormData((previous) => {
          const nextFormData = { ...previous };
          delete nextFormData[wo];
          return nextFormData;
        });
        fetchDashboard();
        message.success(`${wo} moved back to open list`);
      } else {
        message.error(response.data?.message || "Failed to cancel");
      }
    } catch (error) {
      console.error("Error canceling item:", error);
      message.error("Failed to cancel");
    }
  };

  const handleSubmit = async () => {
    const submissionData = todayComplete.map((item) => ({
      wo: item.wo,
      qty: item.qty,
      updatedAt: item.updatedAt,
      comment: formData[item.wo]?.comment || "",
    }));

    try {
      const response = await instance.post(
        "/coreclamp/savetoexcel",
        submissionData
      );
      if (response.data?.code === 0) {
        message.success("Data saved to Excel successfully");
      } else {
        message.error(response.data?.message || "Failed to save data to Excel");
      }
    } catch (error) {
      console.error("Error saving to Excel:", error);
      message.error("Failed to save data to Excel");
    }
  };

  const workOrderColumns = [
    {
      title: "WO#",
      dataIndex: "wo",
      key: "wo",
      width: 150,
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 90,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.isComplete ? "success" : "processing"}>
          {record.isComplete ? "Completed" : "Open"}
        </Tag>
      ),
    },
    {
      title: "Files",
      dataIndex: "files",
      key: "files",
      render: (files) =>
        files?.length ? (
          <Space wrap size={4}>
            {files.map((file) => (
              <a
                key={file}
                href={`${FILE_HOST}/coreclamps/${encodeURIComponent(file)}`}
                target="_blank"
                rel="noreferrer"
                className={styles.fileLink}
              >
                <FileTextOutlined />
                {file}
              </a>
            ))}
          </Space>
        ) : (
          <Text type="secondary">No files</Text>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Finish work order"
          description={`Mark ${record.wo} as completed?`}
          okText="Finish"
          onConfirm={() => handleFinish(record.wo)}
        >
          <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
            Finish
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const completedTodayColumns = [
    {
      title: "WO#",
      dataIndex: "wo",
      key: "wo",
      width: 150,
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 90,
    },
    {
      title: "Completed",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 170,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Comment",
      key: "comment",
      render: (_, record) => (
        <Input
          placeholder="Optional comment"
          value={formData[record.wo]?.comment || ""}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              [record.wo]: {
                ...previous[record.wo],
                comment: event.target.value,
              },
            }))
          }
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Move back to open list"
          description={`Cancel completion for ${record.wo}?`}
          okText="Cancel Complete"
          onConfirm={() => handleCancel(record.wo)}
        >
          <Button size="small" icon={<CloseCircleOutlined />}>
            Cancel
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "WO#",
      dataIndex: "wo",
      key: "wo",
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 90,
    },
    {
      title: "Completed",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 170,
      render: (value) => formatDateTime(value),
    },
  ];

  return (
    <div className={styles.corePage}>
      <header className={styles.pageHeader}>
        <div>
          <Text className={styles.kicker}>Core Clamp</Text>
          <Title level={2} className={styles.pageTitle}>
            Work Orders
          </Title>
        </div>
        <Space className={styles.headerActions} wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDashboard}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleSubmit}
            disabled={!todayComplete.length}
          >
            Save Today Excel
          </Button>
        </Space>
      </header>

      <section className={styles.statGrid}>
        <Card className={styles.statCard}>
          <Statistic title="Open Jobs" value={summary.openJobs} />
        </Card>
        <Card className={styles.statCard}>
          <Statistic title="Open Qty" value={summary.openQty} />
        </Card>
        <Card className={styles.statCard}>
          <Statistic title="Finished Today" value={summary.completedToday} />
        </Card>
        <Card className={styles.statCard}>
          <Statistic title="Qty Today" value={summary.completedQtyToday} />
        </Card>
      </section>

      <section className={styles.controlGrid}>
        <Card
          className={`${styles.timerCard} ${
            isTimerRunning ? styles.timerRunning : styles.timerStopped
          }`}
        >
          <div className={styles.timerHeader}>
            <div>
              <span className={styles.panelLabel}>Line timer</span>
              <div className={styles.timerStatus}>
                {isTimerRunning ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                <span>{isTimerRunning ? "Running" : "Stopped"}</span>
              </div>
            </div>
            <Tag color={isTimerRunning ? "success" : "default"}>
              {timeRecords.length} sessions today
            </Tag>
          </div>
          <div className={styles.timerMeta}>
            <span>
              Current start:{" "}
              {currentTimer?.startTime
                ? formatDateTime(currentTimer.startTime)
                : "-"}
            </span>
            <span>
              Last record:{" "}
              {timeRecords[0]?.startTime ? formatDateTime(timeRecords[0].startTime) : "-"}
            </span>
          </div>
          {isTimerRunning ? (
            <Button
              danger
              icon={<StopOutlined />}
              loading={timerLoading}
              onClick={() => setIsStopModalVisible(true)}
            >
              Stop Timer
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={timerLoading}
              onClick={handleStartTimer}
            >
              Start Timer
            </Button>
          )}
        </Card>

        <Card className={styles.statusCard}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Statistic
                title="Completed This Year"
                value={summary.completedThisYear}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Timer Sessions"
                value={timeRecords.length}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Showing Open"
                value={filteredWorkOrders.length}
                prefix={<UnorderedListOutlined />}
              />
            </Col>
          </Row>
        </Card>
      </section>

      <Card
        className={styles.dashboardCard}
        title={
          <span className={styles.cardTitle}>
            <UnorderedListOutlined />
            To Do List
          </span>
        }
      >
        <div className={styles.tableToolbar}>
          <Input
            placeholder="Search WO, qty, approved by"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={styles.searchInput}
          />
          <Text className={styles.listStatus}>
            Showing {filteredWorkOrders.length} of {ccList.length}
          </Text>
        </div>
        <Table
          columns={workOrderColumns}
          dataSource={filteredWorkOrders}
          rowKey={(record) => record._id || record.wo}
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>

      <Card
        className={styles.dashboardCard}
        title="Finished Today"
        extra={
          <Space>
            <Tag>{todayComplete.length} orders</Tag>
            <Tooltip title="Save today's completed core clamps to Excel">
              <Button
                size="small"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleSubmit}
                disabled={!todayComplete.length}
              >
                Save Excel
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Table
          columns={completedTodayColumns}
          dataSource={todayComplete}
          rowKey={(record) => record._id || record.wo}
          loading={loading}
          pagination={false}
          scroll={{ x: 860 }}
          size="middle"
        />
      </Card>

      <Card
        className={styles.dashboardCard}
        title="History"
        extra={<Tag>{completedList.length} this year</Tag>}
      >
        <Table
          columns={historyColumns}
          dataSource={completedList}
          rowKey={(record) => record._id || record.wo}
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 520 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Stop Core Clamp Timer"
        open={isStopModalVisible}
        onOk={handleStopTimer}
        onCancel={() => {
          setIsStopModalVisible(false);
          setTimerNotes("");
        }}
        okText="Stop Timer"
        okButtonProps={{ danger: true, loading: timerLoading }}
      >
        <TextArea
          placeholder="Optional notes for this timer session"
          value={timerNotes}
          onChange={(event) => setTimerNotes(event.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
}

export default CoreClamp;
