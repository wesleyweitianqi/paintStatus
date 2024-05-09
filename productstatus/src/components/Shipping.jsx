import React, { useState, useEffect } from "react";
import styles from "../styles/shipping.module.scss";
import instance from "../utils/http";

const Shipping = () => {
  const [formData, setFormData] = useState({
    swo: "",
    ps: "",
    qty: "",
    customer: "",
    carrier: "",
    date: "",
  });
  const WoHandler = (e) => {
    setFormData({ ...formData, swo: e.target.value });
  };

  const carrierHandler = (e) => {
    setFormData({ ...formData, carrier: e.target.value });
  };

  useEffect(() => {
    // instance.get({ wo: formData.swo }).then();
  });

  return (
    <div className={styles.shippingContainer}>
      <h1>Shipped Record</h1>
      <form>
        <div className="row">
          <div className="form-floating mb-3 col">
            <input
              type="email"
              className="form-control"
              id="floatingWO"
              value={formData.wo}
              onChange={WoHandler}
              placeholder="Enter the WO#"
            />
            <label htmlFor="floatingWO">Enter the WO#</label>
          </div>
          <div className="form-floating col">
            <input
              type="text"
              className="form-control"
              id="floatingCarrier"
              placeholder="Eaton"
              onChange={carrierHandler}
              value={formData.carrier}
            />
            <label htmlFor="floatingCarrier">Eaton</label>
          </div>
          <button type="button" className="btn btn-primary col-1 mb-3">
            Submit
          </button>
        </div>
      </form>

      <hr />
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">SWO#</th>
            <th scope="col">P/S#</th>
            <th scope="col">QTY</th>
            <th scope="col">CUSTOMER NAME</th>
            <th scope="col">CARRIER</th>
            <th scope="col">DATE</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>
              <button type="button" className="btn btn-danger">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Shipping;
