import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Card,
  Typography,
  message,
  Row,
  Col,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import instance from "../utils/http";

const { Title } = Typography;
const { Option } = Select;

const Powder = () => {
  const [list, setList] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const fetchPowderList = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/powder");
      setList(res.data.data.reverse());
    } catch (e) {
      console.log(e);
      message.error("Failed to fetch powder data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowderList();
  }, []);

  // Filter the list based on search text matching description
  const filteredList = searchText
    ? list.filter(
        (item) =>
          item.desc &&
          item.desc.toLowerCase().includes(searchText.toLowerCase())
      )
    : list;

  // Function to download powder list as Excel
  const handleDownloadExcel = async () => {
    try {
      const response = await instance.get("/powder/export/excel", {
        responseType: "blob", // Important: Set response type to blob for file download
      });

      // Create a temporary URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "powder_inventory.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and remove the link
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
      fetchPowderList(); // Refresh the list
      form.resetFields();
      message.success("Powder added successfully");
    } catch (error) {
      console.error("Error submitting the request:", error);
      message.error("Failed to add powder");
    }
  };

  const handleDelete = async (key) => {
    try {
      const powderCode = list[key - 1].code;
      const result = await instance.post("/powder/delete", {
        code: powderCode,
      });
      if (result.data.data) {
        fetchPowderList(); // Refresh the list
        message.success("Powder deleted successfully");
      }
    } catch (error) {
      message.error("Failed to delete powder");
    }
  };

  const startEdit = (record) => {
    setEditingKey(record.key);
    setEditQty(record.qty);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditQty("");
  };

  const handleUpdate = async (record) => {
    try {
      const updatedData = {
        code: record.code,
        qty: editQty,
      };

      const res = await instance.post("/powder/update", updatedData);
      if (res.data.data) {
        setList(res.data.data);
        setEditingKey(null);
        setEditQty("");
        message.success("Quantity updated successfully");
      }
    } catch (error) {
      console.error("Error updating the item:", error);
      message.error("Failed to update quantity");
    }
  };

  const columns = [
    {
      title: "Color Code",
      dataIndex: "code",
      key: "code",
      width: "20%",
    },
    {
      title: "Description",
      dataIndex: "desc",
      key: "desc",
      width: "30%",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: "20%",
      render: (text, record) => {
        if (editingKey === record.key) {
          return (
            <Input
              type="text"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              style={{ width: "80px" }}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      width: "15%",
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          {editingKey === record.key ? (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleUpdate(record)}
              >
                Save
              </Button>
              <Button size="small" onClick={cancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => startEdit(record)}
                title="Edit"
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.key)}
                title="Delete"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 24, color: "#1890ff" }}>
        Powder Inventory
      </Title>

      <Card type="inner" title="Add New Powder" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="code"
                label="Code#"
                rules={[
                  { required: true, message: "Please input powder code!" },
                ]}
              >
                <Input placeholder="Enter powder code" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="qty"
                label="Quantity"
                rules={[{ required: true, message: "Please input quantity!" }]}
              >
                <Input placeholder="Enter quantity" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="desc"
                label="Description"
                rules={[
                  { required: true, message: "Please input description!" },
                ]}
              >
                <Input placeholder="Enter description" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[
                  { required: true, message: "Please select a supplier!" },
                ]}
              >
                <Select placeholder="Select supplier">
                  <Option value="sw">Sherwin William</Option>
                  <Option value="Tiger">Tiger</Option>
                  <Option value="Prism">Prism</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Add Powder
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        type="inner"
        title="Powder Inventory List"
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadExcel}
          >
            Export to Excel
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by color in description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <Table
          columns={columns}
          rowKey={(record) => record.key}
          dataSource={
            Array.isArray(filteredList) &&
            filteredList.map((item, index) => ({
              key: index + 1,
              code: item.code,
              desc: item.desc,
              qty: item.qty,
              supplier: item.supplier,
            }))
          }
          pagination={false}
          loading={loading}
        />
      </Card>
    </Card>
  );
};

export default Powder;
