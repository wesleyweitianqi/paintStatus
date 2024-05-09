import React, { useEffect, useState } from "react";
import styles from "../styles/navi.module.scss";
import { useNavigate, Link } from "react-router-dom";

const Navi = () => {
  const [activeLink, setActiveLink] = useState("/paint"); // Initial active link
  const navigate = useNavigate();
  const handleClick = (path) => {
    setActiveLink(path);
    navigate(path);
  };

  useEffect(() => {
    const href = "/" + document.location.href.split("/").pop();
    setActiveLink(href);
  }, []);
  return (
    <div className={styles.naviContainer}>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link
            className="navbar-brand"
            to="/"
            onClick={() => handleClick("/paint")}
          >
            Rex
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav nav-pills">
              <Link
                className={`nav-link ${
                  activeLink === "/paint" ? "active" : ""
                }`}
                aria-current="page"
                to="/paint"
                onClick={() => handleClick("/paint")}
              >
                Paint
              </Link>
              <Link
                className={`nav-link ${activeLink === "/ship" ? "active" : ""}`}
                aria-current="page"
                to="/ship"
                onClick={() => handleClick("/ship")}
              >
                Shipping
              </Link>
              <Link
                className={`nav-link ${
                  activeLink === "/powder" ? "active" : ""
                }`}
                aria-current="page"
                to="/powder"
                onClick={() => handleClick("/powder")}
              >
                Powder
              </Link>
              <Link
                className={`nav-link ${
                  activeLink === "/coreclamp" ? "active" : ""
                }`}
                aria-current="page"
                to="/coreclamp"
                onClick={() => handleClick("/coreclamp")}
              >
                CoreClamps
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navi;
