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
  SoundFilled,
  FormOutlined,
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
  Tooltip,
  Flex,
} from "antd";
import { AmplifyAuthService } from "../../services/amplifyAuth";
import { useMessageStore } from "../../../app/store/messageStore";
import { useProfileStore } from "../../../app/store/profileStore";
import { useMaterialStore } from "../../../app/store/materialStore";
import { useClassStore } from "../../../app/store/classStore";
import { useHomeworkStore } from "../../../app/store/homeworkStore";
import LanguageSwitcher from "../LanguageSwitcher";

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
    role,
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
  const { fetchPendingHW, fetchOngoingHW } = useHomeworkStore();
  const [homeworkpath, setHomeworkpath] = useState("");
  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
    fetchMaterials();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (role === "student") {
      fetchPendingHW();
      setHomeworkpath("/homework");
    } else if (role === "teacher") {
      fetchOngoingHW();
      setHomeworkpath("/thomework");
    }
  }, [role]);

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
      key: homeworkpath,
      icon:
        messages.pendingHomework > 0 || messages.pendingGrading > 0 ? (
          <FormOutlined style={{ color: "red" }} />
        ) : (
          <FormOutlined />
        ),
      label: <Link to={homeworkpath}>我的作业</Link>,
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
        width={150}
        collapsedWidth={64}
        ref={siderRef}
      >
        <div
          className="demo-logo-vertical"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <Tooltip title="展开" placement="bottom">
              <MenuUnfoldOutlined style={{ fontSize: 20 }} />
            </Tooltip>
          ) : (
            <Flex justify="space-between" style={{ width: "100%" }}>
              <img
                src="vite.svg"
                alt="logo"
                style={{ width: 24, height: 24 }}
              />
              <Tooltip title="收起" placement="bottom">
                <MenuFoldOutlined style={{ fontSize: 20 }} />
              </Tooltip>
            </Flex>
          )}
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
            padding: 18,
            background: "rgb(240, 240, 240)",
            position: "relative",
          }}
        >
          {children}
          <LanguageSwitcher />
        </Content>
      </Layout>
    </Layout>
  );
};
export default AppLayout;
