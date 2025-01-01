import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Card,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import instance from "../utils/http";
import "./Powder.css";

const { Title } = Typography;

const Powder = () => {
  const [list, setList] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

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

  const handleButtonClick = async (e) => {
    e.preventDefault();
    const formData = {
      code: formRef.current.code.value,
      qty: formRef.current.qty.value,
      desc: formRef.current.desc.value,
      supplier: formRef.current.supplier.value,
    };

    try {
      const res = await instance.post("/powder/add", formData);
      setList([...res.data.data]);
      formRef.current.reset();
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
        const newList = [...list];
        newList.splice(key - 1, 1);
        setList(newList);
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
              className="qty-input"
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
        <div className="action-buttons">
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
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.key)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const data =
    Array.isArray(list) &&
    list.map((item, index) => ({
      key: index + 1,
      code: item.code,
      desc: item.desc,
      qty: item.qty,
      supplier: item.supplier,
    }));

  return (
    <div className="powder-container">
      <div className="powder-header">
        <Title level={2}>Powder Inventory</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchPowderList}
          className="refresh-button"
        >
          Refresh
        </Button>
      </div>

      <Card className="add-powder-card">
        <form
          ref={formRef}
          onSubmit={handleButtonClick}
          className="powder-form"
        >
          <div className="form-row">
            <div className="form-item">
              <label>Code#</label>
              <Input placeholder="Powder code" name="code" />
            </div>
            <div className="form-item">
              <label>Qty</label>
              <Input placeholder="Quantity" name="qty" />
            </div>
            <div className="form-item">
              <label>Description</label>
              <Input placeholder="Description" name="desc" />
            </div>
            <div className="form-item">
              <label>Supplier</label>
              <Select defaultValue="sw" name="supplier">
                <Select.Option value="sw">Sherwin William</Select.Option>
                <Select.Option value="Tiger">Tiger</Select.Option>
                <Select.Option value="Prism">Prism</Select.Option>
              </Select>
            </div>
          </div>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Add Powder
          </Button>
        </form>
      </Card>

      <Card className="powder-table-card">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={loading}
          scroll={{ x: 800, y: 500 }}
        />
      </Card>
    </div>
  );
};

export default Powder;
