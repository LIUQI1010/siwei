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
import { useTranslation } from "../../i18n/hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
// 移除这个静态的 items 数组，我们将在组件内部动态创建

const AppLayout = ({ children }) => {
  // 检测是否为移动设备
  const isMobile = () => window.innerWidth <= 768;

  const [collapsed, setCollapsed] = useState(isMobile());
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const siderRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const { t } = useTranslation();
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
  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobile();
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

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
      label: <Link to="/dashboard">{t("appLayout_dashboard")}</Link>,
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">{t("appLayout_profile")}</Link>,
    },
    {
      key: "/classes",
      icon: <TeamOutlined />,
      label: <Link to="/classes">{t("appLayout_classes")}</Link>,
    },
    {
      key: homeworkpath,
      icon:
        messages.pendingHomework > 0 || messages.pendingGrading > 0 ? (
          <FormOutlined style={{ color: "red" }} />
        ) : (
          <FormOutlined />
        ),
      label: <Link to={homeworkpath}>{t("appLayout_homework")}</Link>,
    },
    {
      key: "/materials",
      icon: <FileOutlined />,
      label: <Link to="/materials">{t("appLayout_materials")}</Link>,
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">{t("appLayout_settings")}</Link>,
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
        console.error(t("appLayout_error"), error);
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
        message.success(t("appLayout_logoutSuccess"));
        navigate("/auth/login");
      } else {
        message.error(t("appLayout_logoutError") + ": " + result.message);
      }
    } catch (error) {
      message.error(t("appLayout_logoutError"));
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
        width={148}
        collapsedWidth={64}
        ref={siderRef}
      >
        <div
          className="demo-logo-vertical"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <Tooltip title={t("appLayout_menuExpand")} placement="bottom">
              <MenuUnfoldOutlined style={{ fontSize: 20 }} />
            </Tooltip>
          ) : (
            <Flex justify="space-between" style={{ width: "100%" }}>
              <img
                src="vite.svg"
                alt="logo"
                style={{ width: 24, height: 24 }}
              />
              <Tooltip title={t("appLayout_menuCollapse")} placement="bottom">
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
            fontSize: "14px",
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
