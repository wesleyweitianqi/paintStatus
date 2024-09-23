import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header, Content } = Layout;

function MainLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { key: "/shear", label: "Shearing" },
    { key: "/paint", label: "Painting" },
    { key: "/powder", label: "Powder Coating" },
    { key: "/shipping", label: "Shipping" },
    // Add more menu items as needed
  ];

  return (
    <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
          {menuItems.map((item) => (
            <Menu.Item key={item.key}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      <Content>
        <div style={{ padding: "24px" }}>{children}</div>
      </Content>
    </Layout>
  );
}

export default MainLayout;
