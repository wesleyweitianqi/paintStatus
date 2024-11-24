import React, { useState, useRef, useEffect } from "react";
import { Table } from "antd";
import instance from "../utils/http";
import styles from "../styles/powder.module.scss";

const Powder = () => {
  const [list, setList] = useState([]);
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
      setList([...res.data.data]); // Create a new array using the spread operator
      formRef.current.reset();
    } catch (error) {
      console.error("Error submitting the request:", error);
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
      // render: (painted) => (painted ? "Yes" : "No"),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
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
  const data =
    Array.isArray(list) &&
    list.map((item, index) => {
      return {
        key: index + 1,
        code: item.code,
        desc: item.desc,
        qty: item.qty,
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
      <hr />
      {/* <div className={styles.detail}>
        <h4>Special paint requirement:</h4>
        <p>
          <li>Paint Chip</li>
          <li>Gloss</li>
          Note:
        </p>
        <p>Lead time: 2-3 weeks for match up</p>

        <h4>Price</h4>
        <ul>Special powder price: $35/kg. Minimum order: 25kg</ul>
        <ul>Special spray can: $25/can. Minimum order: 12 can</ul>
      </div> */}
      <Table
        columns={columns}
        rowKey={(record) => record.key}
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

export default Powder;
