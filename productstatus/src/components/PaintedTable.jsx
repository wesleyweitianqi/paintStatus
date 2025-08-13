import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";

const PaintedTable = (props) => {
  const { list, handleDelete } = props;
  const isToday = (date) => {
    const currentDate = new Date();
    const updatedDate = new Date(date);
    return updatedDate.toDateString() === currentDate.toDateString();
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
          <Button onClick={() => handleDelete(record.wo)}>Delete</Button>
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
    </div>
  );
};

export default PaintedTable;
