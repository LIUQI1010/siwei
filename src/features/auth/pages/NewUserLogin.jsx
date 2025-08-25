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
  PhoneOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

export default function NewUserLogin({
  newPasswordData,
  setNewPasswordData,
  handleNewPasswordSubmit,
  loading,
  error,
  setError,
  setLoading,
  setIsNewUser,
}) {
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const { t, currentLanguage } = useTranslation();
  const [nullFields, setNullFields] = useState({
    phoneCode: true,
    phoneNumber: true,
    password: true,
    confirmPassword: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputFocus = (field) => {
    setNullFields({
      ...nullFields,
      [field]: true,
    });
    setError("");
  };

  // 使用 useMemo 确保错误消息响应语言切换
  const getErrorMessage = useMemo(() => {
    if (!error) return "";

    // 处理错误代码，这些会根据语言切换自动更新
    const errorCodeMap = {
      // NewUserLogin 特定的错误
      PASSWORD_MISMATCH: "newUserLogin_passwordMismatch",
      PASSWORD_TOO_SHORT: "newUserLogin_passwordTooShort",
      PASSWORD_REQUIREMENT: "newUserLogin_passwordRequirement",
      // 通用错误代码
      INVALID_CREDENTIALS: "loginPage_invalidCredentials",
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
  }, [error, t, currentLanguage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const newFormData = new FormData(e.currentTarget);
    const phoneCode = newFormData.get("phoneCode");
    const phoneNumber = newFormData.get("phoneNumber");
    const password = newFormData.get("password");
    const confirmPassword = newFormData.get("confirmPassword");
    if (!phoneCode || !phoneNumber || !password || !confirmPassword) {
      setNullFields({
        phoneCode: !!phoneCode,
        phoneNumber: !!phoneNumber,
        password: !!password,
        confirmPassword: !!confirmPassword,
      });
      return;
    }

    if (password !== confirmPassword) {
      setError("PASSWORD_MISMATCH");
      return;
    }

    if (password.length < 8) {
      setError("PASSWORD_TOO_SHORT");
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(password)) {
      setError("PASSWORD_REQUIREMENT");
      return;
    }

    // 先更新 state
    setNewPasswordData({
      phoneCode: phoneCode,
      phoneNumber: phoneNumber,
      password: password,
      confirmPassword: confirmPassword,
    });

    // 直接调用父组件的处理函数，传递当前表单数据
    handleNewPasswordSubmit({
      phoneCode: phoneCode,
      phoneNumber: phoneNumber,
      password: password,
      confirmPassword: confirmPassword,
    });
  };

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
            color: "rgb(26 110 227)",
            marginBottom: "8px",
            fontWeight: 500,
            userSelect: "none",
          }}
        >
          {t("newUserLogin_title")}
        </Typography.Title>
        <Typography.Text
          style={{
            color: "#fff",
            fontSize: "1rem",
            userSelect: "none",
          }}
        >
          {t("newUserLogin_subtitle")}
        </Typography.Text>
      </div>

      {/* 表单*/}
      <form onSubmit={handleSubmit} style={{ width: "86%" }}>
        {/* 手机号 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            <PhoneOutlined style={{ marginRight: 8 }} />
            {t("newUserLogin_phoneNumber")}
          </label>
          <div style={{ display: "flex", gap: "0px" }}>
            <input
              className={`glass-input ${
                nullFields.phoneCode ? "" : "error-placeholder"
              }`}
              name="phoneCode"
              placeholder="+86"
              defaultValue="+86"
              onFocus={() => handleInputFocus("phoneCode")}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9+]/g, "");
              }}
              style={{
                flex: 1,
                borderRadius: "10px 0 0 10px",
                paddingRight: "2px",
                borderRight: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            />
            <input
              className={`glass-input ${
                nullFields.phoneNumber ? "" : "error-placeholder"
              }`}
              name="phoneNumber"
              placeholder={t("newUserLogin_phoneNumberPlaceholder")}
              onFocus={() => handleInputFocus("phoneNumber")}
              onInput={(e) => {
                // 移除非数字字符
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              style={{
                flex: 6,
                borderRadius: "0 10px 10px 0",
                paddingLeft: "6px",
              }}
            />
          </div>
        </div>

        {/* 密码 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            <LockOutlined style={{ marginRight: 8 }} />
            {t("newUserLogin_password")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("newUserLogin_passwordPlaceholder")}
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

        {/* 确认密码 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            {t("newUserLogin_confirmPassword")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("newUserLogin_confirmPasswordPlaceholder")}
              className={`glass-input ${
                nullFields.confirmPassword ? "" : "error-placeholder"
              }`}
              onFocus={() => handleInputFocus("confirmPassword")}
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>

        {/* 提交按钮 */}
        <button type="submit" disabled={loading} className="login-button">
          {loading
            ? t("newUserLogin_submitButtonLoading")
            : t("newUserLogin_submitButton")}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => {
            setIsNewUser(false);
            setError("");
          }}
        >
          {t("newUserLogin_cancelButton")}
        </button>
      </form>

      {/* 温馨提示 */}
      <div className="soft-tip">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        {t("newUserLogin_tip")}
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
