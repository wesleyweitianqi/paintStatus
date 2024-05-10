import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import classNames from "classnames";
import styles from "../styles/navi.module.scss";

const Navi = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("/paint"); // Initial active link

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  return (
    <div className={styles.naviContainer}>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link
            className="navbar-brand"
            to="/"
            onClick={() => setActiveLink("/paint")}
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
              <NavLink
                className={classNames("nav-link", {
                  [styles.active]: activeLink === "/paint",
                })}
                to="/paint"
              >
                Paint
              </NavLink>
              <NavLink
                className={classNames("nav-link", {
                  [styles.active]: activeLink === "/ship",
                })}
                to="/ship"
              >
                Shipping
              </NavLink>
              <NavLink
                className={classNames("nav-link", {
                  [styles.active]: activeLink === "/powder",
                })}
                to="/powder"
              >
                Powder
              </NavLink>
              <NavLink
                className={classNames("nav-link", {
                  [styles.active]: activeLink === "/coreclamp",
                })}
                to="/coreclamp"
              >
                CoreClamps
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navi;
