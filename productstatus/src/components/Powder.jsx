import React, { useState, useRef, useEffect } from "react";
import { Table, Button } from "antd";
import instance from "../utils/http";
import styles from "../styles/powder.module.scss";

const Powder = () => {
  const [list, setList] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editQty, setEditQty] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    instance
      .get("/powder")
      .then((res) => {
        setList(res.data.data.reverse());
      })
      .catch((e) => {
        console.log(e);
      });
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
      const res = await instance.post("/powder/add", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setList([...res.data.data]);
      formRef.current.reset();
    } catch (error) {
      console.error("Error submitting the request:", error);
    }
  };

  const handleDelete = async (key) => {
    const powderCode = list[key - 1].code;
    const result = await instance.post(
      "/powder/delete",
      { code: powderCode },
      {
        Headers: {
          "content-type": "application/json",
        },
      }
    );
    if (result.data.data) {
      const newList = [...list];
      newList.splice(key - 1, 1);
      setList(newList);
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

      const res = await instance.post("/powder/update", updatedData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (res.data.data) {
        setList(res.data.data);
        setEditingKey(null);
        setEditQty("");
      }
    } catch (error) {
      console.error("Error updating the item:", error);
    }
  };

  const columns = [
    {
      title: "Color Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      render: (text, record) => {
        if (editingKey === record.key) {
          return (
            <input
              type="text"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              style={{ width: '100px' }}
            />
          );
        }
        return text;
      }
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {editingKey === record.key ? (
            <>
              <Button onClick={() => handleUpdate(record)}>Save</Button>
              <Button onClick={cancelEdit}>Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={() => startEdit(record)}>Update</Button>
              <Button danger onClick={() => handleDelete(record.key)}>Delete</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const data =
    Array.isArray(list) &&
    list.map((item, index) => {
      return {
        key: index + 1,
        code: item.code,
        desc: item.desc,
        qty: item.qty,
        supplier: item.supplier,
      };
    });

  return (
    <div>
      <h4>Powder Inventory</h4>
      <form
        className={styles.powderForm}
        ref={formRef}
        onSubmit={handleButtonClick}
      >
        <div className="col-2">
          <div className="row">
            <label>Code#</label>
            <input type="text" placeholder="powder code" name="code" />
          </div>
        </div>
        <div className="col-2">
          <div className="row">
            <label>Qty</label>
            <input type="text" placeholder="qty" name="qty" />
          </div>
        </div>
        <div className="col-2">
          <div className="row">
            <label>Description</label>
            <input type="text" placeholder="desc" name="desc" />
          </div>
        </div>
        <div className="col-2">
          <div className="row">
            <label>Supplier</label>
            <select id="supplier" name="supplier">
              <option value="sw">Sherwin William</option>
              <option value="Tiger">Tiger</option>
              <option value="Prism">prism</option>
            </select>
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
      <Table
        columns={columns}
        rowKey={(record) => record.key}
        dataSource={data}
        pagination={false}
      />
    </div>
  );
};

export default Powder;