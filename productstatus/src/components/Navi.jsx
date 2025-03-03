import React from "react";
import { Link } from "react-router-dom";

function Navi() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Production
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/status">
                Status
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/paint">
                Painting
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/ship">
                Shipping
              </Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/powder">
                Powder
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/coreclamp">
                Core Clamp
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/shear">
                Shearing
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bend">
                Bending
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navi;
