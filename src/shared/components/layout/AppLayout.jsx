import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { Button, Layout, Menu, theme } from "antd";
const { Header, Sider, Content, Footer } = Layout;
const items = [
  {
    key: "/dashboard",
    icon: <UserOutlined />,
    label: <Link to="/dashboard">仪表板</Link>,
  },
  {
    key: "/profile",
    icon: <UserOutlined />,
    label: <Link to="/profile">我的</Link>,
  },
  {
    key: "/classes",
    icon: <VideoCameraOutlined />,
    label: <Link to="/classes">班级</Link>,
  },
  {
    key: "/homework",
    icon: <UploadOutlined />,
    label: <Link to="/homework">作业</Link>,
  },
  {
    key: "/materials",
    icon: <UploadOutlined />,
    label: <Link to="/materials">资料</Link>,
  },
  { key: "/settings", label: <Link to="/settings">设置</Link> },
];

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const loc = useLocation();
  const selected =
    items.find((i) => loc.pathname.startsWith(i.key))?.key || "/dashboard";
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selected]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
        <Footer style={{ textAlign: "center" }}>Qi</Footer>
      </Layout>
    </Layout>
  );
};
export default AppLayout;
