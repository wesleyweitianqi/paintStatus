import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";

const PaintedTable = (props) => {
  const { list, handleDelete } = props;
  const isToday = (date) => {
    const currentDate = new Date();
    const updatedDate = new Date(date);
    updatedDate.setHours(updatedDate.getHours() + 4);
    return (
      updatedDate.getFullYear() === currentDate.getFullYear() &&
      updatedDate.getMonth() === currentDate.getMonth() &&
      updatedDate.getDate() === currentDate.getDate()
    );
  };

  const columns = [
    {
      title: "WO#",
      dataIndex: "wo",
      key: "wo",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Moved To",
      dataIndex: "movedTo",
      key: "movedTo",
    },
    {
      title: "UpdatedAt",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (record) =>
        isToday(record.updatedAt) ? (
          <Button onClick={() => handleDelete(record.key)}>Delete</Button>
        ) : null,
    },
  ];

  const data =
    Array.isArray(list) &&
    list.map((item, index) => {
      return {
        key: index + 1,
        wo: item.wo,
        description: item.description,
        qty: item.qty,
        movedTo: item.movedTo,
        updatedAt: item.updatedAt.toString().substring(0, 10),
        notes: item.notes,

        createdAt: item.createdAt.toString().substring(0, 10),
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
