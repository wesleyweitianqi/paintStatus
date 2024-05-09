import React, { useState, useEffect } from "react";
import { Table } from "antd";

const PaintedTable = (props) => {
  const { list, handleDelete } = props;

  const columns = [
    {
      title: "WO#",
      dataIndex: "wo",
      key: "wo",
    },
    {
      title: "Painted",
      dataIndex: "painted",
      key: "painted",
      render: (painted) => (painted ? "Yes" : "No"),
    },
    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (record) => (
        <button onClick={() => handleDelete(record.key)}>Delete</button>
      ),
    },
  ];

  const data =
    Array.isArray(list) &&
    list.map((item, index) => {
      return {
        key: index + 1,
        wo: item.wo,
        painted: item.painted !== undefined ? item.painted : false,
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
      />
    </div>
  );
};

export default PaintedTable;
