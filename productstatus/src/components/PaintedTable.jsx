import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";

const PaintedTable = (props) => {
  const { list, handleDelete, handleEdit, descriptions, locations } = props;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const isToday = (date) => {
    const currentDate = new Date();
    const updatedDate = new Date(date);
    return updatedDate.toDateString() === currentDate.toDateString();
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      wo: record.wo,
      description: record.description,
      qty: record.qty,
      movedTo: record.movedTo,
      notes: record.notes
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Check if any field has changed
      const hasChanges = Object.keys(values).some(key => 
        values[key] !== editingRecord[key]
      );
      
      if (!hasChanges) {
        message.warning("No changes detected");
        return;
      }
      
      // Pass original WO for finding the record, and all form values for updating
      await handleEdit(editingRecord.wo, values);
      setIsEditModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "WO#",
      dataIndex: "wo",
      key: "wo",
      width: 100,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 100,
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 50,
    },
    {
      title: "Moved To",
      dataIndex: "movedTo",
      key: "movedTo",
      width: 150,
    },
    {
      title: "UpdatedAt",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      width: 300,
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (record) =>
        isToday(record.updatedAt) ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => handleEditClick(record)}>Edit</Button>
            <Button onClick={() => handleDelete(record.wo)}>Delete</Button>
          </div>
        ) : null,
    },
  ];

  const latest = Array.isArray(list)
    ? [...list]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 50)
    : [];

  const data =
    Array.isArray(latest) &&
    latest.map((item, index) => {
      return {
        key: index + 1,
        wo: item.wo,
        description: item.description,
        qty: item.qty,
        movedTo: item.movedTo,
        updatedAt: item.updatedAt,
        notes: item.notes,

        createdAt: item.createdAt,
      };
    });

  return (
    <div>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <p
              style={{
                margin: 0,
              }}
            >
              {record.description}
            </p>
          ),
          rowExpandable: (record) => record.name !== "Not Expandable",
        }}
        dataSource={data}
        pagination={false}
      />
      
      <Modal
        title="Edit Painted Part"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        okText="Update"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Work Order #"
            name="wo"
            rules={[{ required: true, message: "Please enter work order number" }]}
          >
            <Input placeholder="Enter work order number" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <Select placeholder="Select Description" allowClear>
              {descriptions?.map((description, index) => (
                <Select.Option key={index} value={description}>
                  {description}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Quantity"
            name="qty"
          >
            <Input type="number" min={0} placeholder="Enter quantity" />
          </Form.Item>
          
          <Form.Item
            label="Moved To"
            name="movedTo"
          >
            <Select placeholder="Select Location" allowClear>
              {locations?.map((location, index) => (
                <Select.Option key={index} value={location}>
                  {location}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Notes"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Enter notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaintedTable;
