import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";

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
      notes: record.notes,
      address: record.address
    });
    setIsEditModalVisible(true);
  };
  
  // Specific function to edit only the address field
  const [isAddressEditModalVisible, setIsAddressEditModalVisible] = useState(false);
  const [editingAddressRecord, setEditingAddressRecord] = useState(null);
  const [addressForm] = Form.useForm();
  
  const handleAddressEditClick = (record) => {
    setEditingAddressRecord(record);
    addressForm.setFieldsValue({
      address: record.address
    });
    setIsAddressEditModalVisible(true);
  };
  
  const handleAddressEditModalOk = async () => {
    try {
      const values = await addressForm.validateFields();
      // Update only the address field
      const updateData = { address: values.address };
      await props.handleEdit(editingAddressRecord.wo, updateData);
      setIsAddressEditModalVisible(false);
      setEditingAddressRecord(null);
      addressForm.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleAddressEditModalCancel = () => {
    setIsAddressEditModalVisible(false);
    setEditingAddressRecord(null);
    addressForm.resetFields();
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
      width: 200,
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
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (value, record) => (
        <Space>
          {value || "-"}
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleAddressEditClick(record)}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (record) =>
        isToday(record.createdAt) ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => handleEditClick(record)}>Edit</Button>
            <Button onClick={() => handleDelete(record.wo)}>Delete</Button>
          </div>
        ) : null,
    },
  ];

  const latest = Array.isArray(list)
    ? [...list]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
        address: item.address,

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
          
          <Form.Item
            label="Address"
            name="address"
          >
            <Input placeholder="Enter address" />
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="Edit Address"
        open={isAddressEditModalVisible}
        onOk={handleAddressEditModalOk}
        onCancel={handleAddressEditModalCancel}
        okText="Update Address"
        cancelText="Cancel"
        width={400}
      >
        <Form form={addressForm} layout="vertical">
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaintedTable;
