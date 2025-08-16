import React, { useState, useEffect, useRef } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  FileOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Layout,
  Menu,
  theme,
  Space,
  Typography,
  message,
  Spin,
  Badge,
} from "antd";
import { AmplifyAuthService } from "../../services/amplifyAuth";
import { useMessageStore } from "../../../app/store/messageStore";
import { useProfileStore } from "../../../app/store/profileStore";
import { useMaterialStore } from "../../../app/store/materialStore";
import { useClassStore } from "../../../app/store/classStore";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
// 移除这个静态的 items 数组，我们将在组件内部动态创建

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const siderRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const {
    messages,
    loading: messageLoading,
    error: messageError,
    fetchDashboardStats,
  } = useMessageStore();
  const {
    loading: profileLoading,
    error: profileError,
    fetchProfile,
  } = useProfileStore();
  const {
    loading: materialLoading,
    error: materialError,
    fetchMaterials,
  } = useMaterialStore();
  const {
    loading: classLoading,
    error: classError,
    fetchClasses,
  } = useClassStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
    fetchMaterials();
    fetchClasses();
  }, []);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 动态创建菜单项，这样可以访问到 messages.pendingHomework
  const items = [
    {
      key: "/dashboard",
      icon: <MessageOutlined />,
      label: <Link to="/dashboard">消息中心</Link>,
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">我的信息</Link>,
    },
    {
      key: "/classes",
      icon: <TeamOutlined />,
      label: <Link to="/classes">我的班级</Link>,
    },
    {
      key: "/homework",
      icon:
        messages.pendingHomework > 0 || messages.pendingGrading > 0 ? (
          <Badge dot offset={[-24, -16]} style={{ position: "relative" }}>
            <UploadOutlined />
          </Badge>
        ) : (
          <UploadOutlined style={{ fontSize: "16px" }} />
        ),
      label: <Link to="/homework">我的作业</Link>,
    },
    {
      key: "/materials",
      icon: <FileOutlined />,
      label: <Link to="/materials">学习资料</Link>,
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">我的设置</Link>,
    },
  ];

  const loc = useLocation();
  const selected =
    items.find((i) => loc.pathname.startsWith(i.key))?.key || "/dashboard";

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await AmplifyAuthService.getCurrentUserInfo();
        if (user && !user.message) {
          setUserInfo(user);
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // 点击页面非侧边区域时自动收起 Sider
  useEffect(() => {
    const handleDocMouseDown = (e) => {
      if (collapsed) return;
      const siderNode =
        siderRef.current || document.querySelector(".ant-layout-sider");
      const toggleNode = toggleBtnRef.current;
      const target = e.target;
      if (!siderNode) return;
      const clickedInsideSider = siderNode.contains(target);
      const clickedToggle = toggleNode && toggleNode.contains(target);
      if (!clickedInsideSider && !clickedToggle) {
        setCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleDocMouseDown);
    return () => document.removeEventListener("mousedown", handleDocMouseDown);
  }, [collapsed]);

  // 退出登录
  const handleLogout = async () => {
    setLoading(true);
    try {
      const result = await AmplifyAuthService.logout();
      if (result.success) {
        message.success("退出成功");
        navigate("/auth/login");
      } else {
        message.error("退出失败：" + result.message);
      }
    } catch (error) {
      message.error("退出过程中发生错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={160}
        collapsedWidth={64}
        ref={siderRef}
      >
        <div
          className="demo-logo-vertical"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selected]}
          items={items}
          style={{
            height: "calc(100% - 64px)",
            fontSize: "16px",
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, padding: "0 16px 0 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Space size="middle" align="center">
              {
                <Space size="middle">
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <Text>{userInfo?.username || <Spin />}</Text>
                </Space>
              }
              <Button
                type="primary"
                danger
                onClick={handleLogout}
                loading={loading}
                size="middle"
              >
                <LogoutOutlined />
              </Button>
            </Space>
          </div>
        </Header>
        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: "#eee",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
export default AppLayout;
