import React, { useState, useMemo } from "react";
import { message, Alert, Typography, Flex } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AmplifyAuthService } from "../../../shared/services/amplifyAuth";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

import "./LoginPage.css";
import {
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import NewUserLogin from "./NewUserLogin";
export default function LoginPage() {
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t, currentLanguage } = useTranslation();
  const [nullFields, setNullFields] = useState({
    username: true,
    password: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    phoneCode: "+86",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
  });

  const handleInputFocus = (field) => {
    setNullFields({
      ...nullFields,
      [field]: true,
    });
    setError("");
  };

  // 使用 useMemo 或直接在渲染中处理，确保语言切换时重新计算
  const getErrorMessage = useMemo(() => {
    if (!error) return "";

    // 处理错误代码，这些会根据语言切换自动更新
    const errorCodeMap = {
      LOGIN_ERROR: "loginPage_loginError",
      PASSWORD_SET_ERROR: "loginPage_passwordSetError",
      INVALID_CREDENTIALS: "loginPage_invalidCredentials",
      USER_NOT_EXIST: "loginPage_userNotExist",
      PASSWORD_ATTEMPTS_EXCEEDED: "loginPage_passwordAttemptsExceeded",
      // 新增的错误代码映射
      USER_NOT_CONFIRMED: "USER_NOT_CONFIRMED",
      USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
      CODE_MISMATCH: "CODE_MISMATCH",
      CODE_EXPIRED: "CODE_EXPIRED",
      LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
      NEW_PASSWORD_REQUIRED: "NEW_PASSWORD_REQUIRED",
      INVALID_PASSWORD_FORMAT: "INVALID_PASSWORD_FORMAT",
      LOGIN_FAILED: "LOGIN_FAILED",
      EMPTY_CREDENTIALS: "EMPTY_CREDENTIALS",
      EMPTY_PASSWORD: "EMPTY_PASSWORD",
      PASSWORD_SET_SUCCESS: "PASSWORD_SET_SUCCESS",
      PASSWORD_SET_FAILED: "PASSWORD_SET_FAILED",
      PHONE_NUMBER_MISSING: "PHONE_NUMBER_MISSING",
      INVALID_PARAMETER: "INVALID_PARAMETER",
      SESSION_EXPIRED: "SESSION_EXPIRED",
      SESSION_INVALID: "SESSION_INVALID",
      AUTH_FAILED: "AUTH_FAILED",
      UNKNOWN_ERROR: "UNKNOWN_ERROR",
    };

    if (errorCodeMap[error]) {
      const translationKey = errorCodeMap[error];
      return t(translationKey);
    }

    return error;
  }, [error, t, currentLanguage]); // 依赖于 error, t 和 currentLanguage

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") || "").toString().trim();
    const password = (formData.get("password") || "").toString().trim();

    if (!username || !password) {
      setNullFields({
        username: !!username,
        password: !!password,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await AmplifyAuthService.login(username, password);

      if (result.success) {
        message.success(t("loginPage_loginSuccess"));
        const next = qp.get("next") || "/dashboard";
        nav(next, { replace: true });
      } else if (result.requiresNewPassword) {
        // 新用户需要设置密码
        setIsNewUser(true);
        setError("");
      } else {
        // 将服务器错误消息转换为错误代码
        if (result.message === "Invalid credentials") {
          setError("INVALID_CREDENTIALS");
        } else if (result.message === "User does not exist") {
          setError("USER_NOT_EXIST");
        } else if (result.message === "Password attempts exceeded") {
          setError("PASSWORD_ATTEMPTS_EXCEEDED");
        } else {
          setError(result.message); // 对于未知错误，保持原样
        }
      }
    } catch (err) {
      setError("LOGIN_ERROR"); // 使用错误代码而不是翻译文本
    } finally {
      setLoading(false);
    }
  };

  // 新密码设置处理函数
  const handleNewPasswordSubmit = async (formData = null) => {
    // 如果传入了表单数据，使用传入的数据；否则使用 state 中的数据
    const data = formData || newPasswordData;
    const { phoneCode, phoneNumber, password, confirmPassword } = data;

    setLoading(true);
    try {
      const fullPhoneNumber = phoneCode + phoneNumber;

      const result = await AmplifyAuthService.setNewPassword(
        fullPhoneNumber,
        password
      );

      if (result.success) {
        message.success(t("loginPage_passwordSetSuccess"));
        const next = qp.get("next") || "/dashboard";
        nav(next, { replace: true });
      } else {
        // 将密码设置错误也转换为错误代码
        setError("PASSWORD_SET_ERROR");
      }
    } catch (err) {
      setError("PASSWORD_SET_ERROR"); // 使用错误代码
    } finally {
      setLoading(false);
    }
  };

  // 如果是新用户，显示新密码设置表单
  if (isNewUser) {
    return (
      <NewUserLogin
        newPasswordData={newPasswordData}
        setNewPasswordData={setNewPasswordData}
        handleNewPasswordSubmit={handleNewPasswordSubmit}
        loading={loading}
        error={error}
        setError={setError}
        setLoading={setLoading}
        isNewUser={isNewUser}
        setIsNewUser={setIsNewUser}
      />
    );
  }

  return (
    <Flex
      className="login-card glass-card card-animation"
      vertical
      gap="large"
      justify="center"
      align="center"
    >
      {/* 标题区 */}
      <div style={{ textAlign: "center" }}>
        <Typography.Title
          level={2}
          style={{
            color: "#fff",
            marginBottom: "8px",
            fontWeight: 500,
            userSelect: "none",
          }}
        >
          {t("loginPage_title")}
        </Typography.Title>
        <Typography.Text
          style={{
            color: "rgb(26 110 227)",
            fontSize: "1rem",
            userSelect: "none",
          }}
        >
          {t("loginPage_subtitle")}
        </Typography.Text>
      </div>

      {/* 表单*/}
      <form onSubmit={handleSubmit} style={{ width: "86%" }}>
        {/* 用户名 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            <UserOutlined style={{ marginRight: 8 }} />
            {t("loginPage_username")}
          </label>
          <input
            className={`glass-input ${
              nullFields.username ? "" : "error-placeholder"
            }`}
            name="username"
            placeholder={t("loginPage_usernamePlaceholder")}
            onFocus={() => handleInputFocus("username")}
          />
        </div>

        {/* 密码 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            <LockOutlined style={{ marginRight: 8 }} />
            {t("loginPage_password")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("loginPage_passwordPlaceholder")}
              className={`glass-input ${
                nullFields.password ? "" : "error-placeholder"
              }`}
              onFocus={() => handleInputFocus("password")}
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "rgba(255, 255, 255, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(255, 255, 255, 0.6)";
              }}
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>

        {/* 登录按钮 */}
        <button type="submit" disabled={loading} className="login-button">
          {loading
            ? t("loginPage_loginButtonLoading")
            : t("loginPage_loginButton")}
        </button>
      </form>

      {/* 温馨提示 */}
      <div className="soft-tip">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        {t("loginPage_tip")}
      </div>

      {/* 报错提示 */}
      {error && (
        <Alert
          className="error-tip"
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={getErrorMessage}
        />
      )}
    </Flex>
  );
}
