import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";

const PaintedTable = (props) => {
  const { list, handleDelete } = props;

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
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (record) => (
        <Button onClick={() => handleDelete(record.key)}>Delete</Button>
      ),
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
