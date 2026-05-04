import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import instance from "../utils/http";
import "./Powder.css";

const { Text, Title } = Typography;
const { Option } = Select;

const SUPPLIERS = [
  { label: "Sherwin William", value: "sw" },
  { label: "Tiger", value: "Tiger" },
  { label: "Prism", value: "Prism" },
];

const LOW_STOCK_QTY = 5;

const getSupplierLabel = (value) =>
  SUPPLIERS.find((supplier) => supplier.value === value)?.label || value || "-";

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

const Powder = () => {
  const [list, setList] = useState([]);
  const [editingCode, setEditingCode] = useState(null);
  const [editQty, setEditQty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [form] = Form.useForm();

  const fetchPowderList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instance.get("/powder");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setList(
        [...data].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        )
      );
    } catch (error) {
      console.error("Error fetching powder data:", error);
      message.error("Failed to fetch powder data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPowderList();
  }, [fetchPowderList]);

  const filteredList = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return list.filter((item) => {
      const matchesSearch =
        !search ||
        [item.code, item.desc, getSupplierLabel(item.supplier)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      const matchesSupplier =
        supplierFilter === "all" || item.supplier === supplierFilter;

      return matchesSearch && matchesSupplier;
    });
  }, [list, searchText, supplierFilter]);

  const summary = useMemo(() => {
    const totalQty = list.reduce((total, item) => {
      const qty = Number(item.qty);
      return Number.isFinite(qty) ? total + qty : total;
    }, 0);
    const lowStockCount = list.filter(
      (item) => Number(item.qty) <= LOW_STOCK_QTY
    ).length;
    const supplierCount = new Set(list.map((item) => item.supplier).filter(Boolean))
      .size;

    return {
      totalColors: list.length,
      totalQty,
      lowStockCount,
      supplierCount,
    };
  }, [list]);

  const handleDownloadExcel = async () => {
    try {
      const response = await instance.get("/powder/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "powder_inventory.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      message.error("Failed to download Excel file");
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const res = await instance.post("/powder/add", values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.data?.code === 0) {
        form.resetFields();
        await fetchPowderList();
        message.success("Powder added successfully");
      } else {
        message.error(res.data?.message || "Failed to add powder");
      }
    } catch (error) {
      console.error("Error submitting powder:", error);
      message.error("Failed to add powder");
    }
  };

  const handleDelete = async (code) => {
    try {
      const result = await instance.post("/powder/delete", { code });
      if (result.data?.code === 0) {
        await fetchPowderList();
        message.success("Powder deleted successfully");
      } else {
        message.error(result.data?.message || "Failed to delete powder");
      }
    } catch (error) {
      console.error("Error deleting powder:", error);
      message.error("Failed to delete powder");
    }
  };

  const startEdit = (record) => {
    setEditingCode(record.code);
    setEditQty(Number(record.qty));
  };

  const cancelEdit = () => {
    setEditingCode(null);
    setEditQty(null);
  };

  const handleUpdate = async (record) => {
    if (editQty === null || editQty === undefined || editQty < 0) {
      message.warning("Enter a valid quantity");
      return;
    }

    try {
      const updatedData = {
        code: record.code,
        qty: editQty,
        desc: record.desc,
        supplier: record.supplier,
      };

      const res = await instance.post("/powder/update", updatedData);
      if (res.data?.code === 0) {
        setEditingCode(null);
        setEditQty(null);
        await fetchPowderList();
        message.success("Quantity updated successfully");
      } else {
        message.error(res.data?.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating powder:", error);
      message.error("Failed to update quantity");
    }
  };

  const columns = [
    {
      title: "Color Code",
      dataIndex: "code",
      key: "code",
      width: 160,
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: "Description",
      dataIndex: "desc",
      key: "desc",
      ellipsis: true,
      render: (value) => value || "-",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 140,
      render: (value, record) => {
        if (editingCode === record.code) {
          return (
            <InputNumber
              min={0}
              value={editQty}
              onChange={setEditQty}
              className="powder-qty-edit"
            />
          );
        }

        const qty = Number(value);
        const isLowStock = Number.isFinite(qty) && qty <= LOW_STOCK_QTY;
        return (
          <Tag color={isLowStock ? "volcano" : "blue"} className="qty-tag">
            {value ?? 0}
          </Tag>
        );
      },
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      width: 170,
      render: (value) => getSupplierLabel(value),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 170,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size={6}>
          {editingCode === record.code ? (
            <>
              <Tooltip title="Save quantity">
                <Button
                  type="primary"
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={() => handleUpdate(record)}
                />
              </Tooltip>
              <Button size="small" onClick={cancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="Edit quantity">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => startEdit(record)}
                />
              </Tooltip>
              <Popconfirm
                title="Delete powder"
                description={`Delete ${record.code}?`}
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(record.code)}
              >
                <Tooltip title="Delete">
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="powder-page">
      <header className="powder-page-header">
        <div>
          <Text className="powder-kicker">Inventory</Text>
          <Title level={2} className="powder-title">
            Powder Inventory
          </Title>
        </div>
        <Space className="powder-header-actions" wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPowderList}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadExcel}
          >
            Export Excel
          </Button>
        </Space>
      </header>

      <section className="powder-stat-grid">
        <Card className="powder-stat-card">
          <Statistic title="Colors" value={summary.totalColors} />
        </Card>
        <Card className="powder-stat-card">
          <Statistic title="Total Qty" value={summary.totalQty} />
        </Card>
        <Card className="powder-stat-card">
          <Statistic title="Low Stock" value={summary.lowStockCount} />
        </Card>
        <Card className="powder-stat-card">
          <Statistic title="Suppliers" value={summary.supplierCount} />
        </Card>
      </section>

      <Card
        className="powder-card powder-add-card"
        title={
          <span className="powder-card-title">
            <PlusOutlined />
            Add Powder
          </span>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          className="powder-form"
        >
          <Row gutter={[12, 0]} align="bottom">
            <Col xs={24} md={6}>
              <Form.Item
                name="code"
                label="Code#"
                rules={[{ required: true, message: "Enter powder code" }]}
              >
                <Input placeholder="Powder code" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="qty"
                label="Quantity"
                rules={[{ required: true, message: "Enter quantity" }]}
              >
                <InputNumber min={0} placeholder="Qty" className="full-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="desc"
                label="Description"
                rules={[{ required: true, message: "Enter description" }]}
              >
                <Input placeholder="Color description" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: "Select supplier" }]}
              >
                <Select placeholder="Supplier">
                  {SUPPLIERS.map((supplier) => (
                    <Option key={supplier.value} value={supplier.value}>
                      {supplier.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                  Add
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        className="powder-card powder-table-card"
        title={
          <span className="powder-card-title">
            <InboxOutlined />
            Inventory List
          </span>
        }
      >
        <div className="powder-toolbar">
          <Space wrap>
            <Input
              placeholder="Search code, description, supplier"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              allowClear
              className="powder-search"
            />
            <Select
              value={supplierFilter}
              onChange={setSupplierFilter}
              className="powder-supplier-filter"
            >
              <Option value="all">All suppliers</Option>
              {SUPPLIERS.map((supplier) => (
                <Option key={supplier.value} value={supplier.value}>
                  {supplier.label}
                </Option>
              ))}
            </Select>
          </Space>
          <Text className="powder-list-status">
            Showing {filteredList.length} of {list.length}
          </Text>
        </div>

        <Table
          columns={columns}
          rowKey={(record) => record._id || record.code}
          dataSource={filteredList}
          pagination={false}
          loading={loading}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Powder;
