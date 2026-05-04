import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Typography,
  message,
} from "antd";
import {
  FileExcelOutlined,
  OrderedListOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import PaintedTable from "./PaintedTable.jsx";
import CurrentPaint from "./CurrentPaint.jsx";
import instance from "../utils/http.js";
import styles from "../styles/painted.module.scss";
import { loadDescriptionList, loadLocationList } from "../utils/constants.js";

const { Option } = Select;
const { Text, Title } = Typography;

const isSameDay = (date) => {
  if (!date) {
    return false;
  }

  const today = new Date();
  const targetDate = new Date(date);
  return targetDate.toDateString() === today.toDateString();
};

const formatShortDateTime = (date) => {
  if (!date) {
    return "No data";
  }

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Paint = () => {
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchWo, setSearchWo] = useState("");
  const [isSearchResult, setIsSearchResult] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const fetchPaintList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await instance.get("/paint");
      setList(res.data?.data || []);
      setIsSearchResult(false);
    } catch (error) {
      console.error("Error fetching painted list:", error);
      message.error("Failed to load painted list");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    setDescriptions(loadDescriptionList());
    setLocations(loadLocationList());
    fetchPaintList();
  }, [fetchPaintList]);

  const paintList = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const summary = useMemo(() => {
    const todayItems = paintList.filter((item) =>
      isSameDay(item.createdAt || item.updatedAt)
    );
    const latestItem = [...paintList].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    )[0];

    const todayQty = todayItems.reduce((total, item) => {
      const qty = Number(item.qty);
      return Number.isFinite(qty) ? total + qty : total;
    }, 0);

    return {
      recordsShown: paintList.length,
      todayEntries: todayItems.length,
      todayQty,
      latestUpdate: formatShortDateTime(
        latestItem?.updatedAt || latestItem?.createdAt
      ),
    };
  }, [paintList]);

  const handleFinish = async (values) => {
    try {
      const res = await instance.post("/paint", values);
      if (res.data?.code === 0) {
        message.success("Painted part added successfully");
        setList(res.data?.data || []);
        setIsSearchResult(false);
        setSearchWo("");
        form.resetFields();
      } else {
        message.error(res.data?.message || "Failed to add painted part");
      }
    } catch (error) {
      console.error("Error submitting the request:", error);
      message.error("Failed to add painted part");
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const res = await instance.post("/paint/delete", { id: recordId });
      if (res.data?.code === 0) {
        await fetchPaintList();
        message.success("Work order deleted successfully");
      } else {
        message.error(res.data?.message || "Failed to delete work order");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error("Failed to delete work order");
    }
  };

  const handleEdit = async (originalWo, updateData) => {
    try {
      const res = await instance.post("/paint/changeorder", {
        originalWo,
        updateData,
      });
      if (res.data?.code === 0) {
        await fetchPaintList();
        message.success("Painted part updated successfully");
      } else {
        message.error(res.data?.message || "Failed to update painted part");
      }
    } catch (error) {
      console.error("Error updating painted part:", error);
      message.error("Failed to update painted part");
    }
  };

  const saveToExcel = async () => {
    try {
      const res = await instance.post("/paint/savetoexcel");
      if (res.data?.code === 0) {
        message.success(res.data.message || "Excel file saved successfully");
      } else {
        message.error(res.data?.message || "Failed to save Excel file");
      }
    } catch (error) {
      console.error("Error saving Excel file:", error);
      message.error("Failed to save Excel file");
    }
  };

  const handleSearch = async () => {
    const wo = searchWo.trim();
    if (!wo) {
      fetchPaintList();
      return;
    }

    setLoadingList(true);
    try {
      const res = await instance.get("/paint/search", { params: { wo } });
      const data = res.data?.data || [];
      if (data.length > 0) {
        setList(data);
        setIsSearchResult(true);
      } else {
        await fetchPaintList();
        message.info("No results found; showing latest items");
      }
    } catch (error) {
      console.error("Search failed:", error);
      message.error("Search failed");
    } finally {
      setLoadingList(false);
    }
  };

  const clearSearch = () => {
    setSearchWo("");
    fetchPaintList();
  };

  const listStatus = isSearchResult
    ? `${summary.recordsShown} result${summary.recordsShown === 1 ? "" : "s"} for "${searchWo}"`
    : `Showing latest ${Math.min(summary.recordsShown, 50)} of ${summary.recordsShown} records`;

  return (
    <div className={styles.paintPage}>
      <header className={styles.pageHeader}>
        <div>
          <Text className={styles.eyebrow}>Painting</Text>
          <Title level={2} className={styles.pageTitle}>
            Painted Parts
          </Title>
        </div>
        <Space className={styles.headerActions} wrap>
          <Link to="/priority" target="_blank" rel="noopener noreferrer">
            <Button icon={<OrderedListOutlined />}>Priority List</Button>
          </Link>
          <Link to="/setting" target="_blank" rel="noopener noreferrer">
            <Button icon={<SettingOutlined />}>Settings</Button>
          </Link>
        </Space>
      </header>

      <section className={styles.quickStats}>
        <Card className={styles.statCard}>
          <Statistic title="Records shown" value={summary.recordsShown} />
        </Card>
        <Card className={styles.statCard}>
          <Statistic title="Today entries" value={summary.todayEntries} />
        </Card>
        <Card className={styles.statCard}>
          <Statistic title="Qty today" value={summary.todayQty} />
        </Card>
        <Card className={styles.statCard}>
          <Statistic title="Last update" value={summary.latestUpdate} />
        </Card>
      </section>

      <section className={styles.workflowGrid}>
        <Card
          className={styles.entryCard}
          title={
            <span className={styles.cardTitle}>
              <PlusOutlined />
              Painted Part Entry
            </span>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className={styles.paintForm}
            initialValues={{
              wo: "",
              description: "",
              qty: "",
              movedTo: "",
              notes: "",
            }}
          >
            <Row gutter={[12, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="WO#"
                  name="wo"
                  rules={[{ required: true, message: "Please enter WO#" }]}
                >
                  <Input placeholder="Work order" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Description" name="description">
                  <Select placeholder="Description" showSearch>
                    {descriptions.map((description) => (
                      <Option key={description} value={description}>
                        {description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Moved To" name="movedTo">
                  <Select placeholder="Location" showSearch>
                    {locations.map((location) => (
                      <Option key={location} value={location}>
                        {location}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 0]} align="bottom">
              <Col xs={24} md={6}>
                <Form.Item label="Quantity" name="qty">
                  <Input type="number" min={0} placeholder="Qty" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Notes" name="notes">
                  <Input placeholder="Notes" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6} className={styles.submitCol}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                    block
                  >
                    Add
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <CurrentPaint />
      </section>

      <section className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              Painted List
            </Title>
            <Text className={styles.listStatus}>{listStatus}</Text>
          </div>

          <Space className={styles.tableActions} wrap>
            <Input
              placeholder="Search WO#"
              value={searchWo}
              onChange={(event) => setSearchWo(event.target.value)}
              onPressEnter={handleSearch}
              allowClear
              className={styles.searchInput}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loadingList}
            >
              Search
            </Button>
            {isSearchResult && <Button onClick={clearSearch}>Clear</Button>}
            <Button icon={<FileExcelOutlined />} onClick={saveToExcel}>
              Save Excel
            </Button>
          </Space>
        </div>

        <Text className={styles.exportHint}>
          Excel record path:{" "}
          <strong>O:\1. PERSONAL FOLDERS\Wesley\PaintRecord</strong>
        </Text>

        <div className={styles.tableWrap}>
          <PaintedTable
            list={paintList}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            descriptions={descriptions}
            locations={locations}
          />
        </div>
      </section>
    </div>
  );
};

export default Paint;
