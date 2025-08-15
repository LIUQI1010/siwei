import React, { useState } from "react";
import { message, Alert, Typography, Flex } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AmplifyAuthService } from "../../../shared/services/amplifyAuth";
import "./LoginPage.css";
import {
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PhoneOutlined,
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

  const getErrorMessage = (error) => {
    if (error === "Invalid credentials") {
      return "用户名或密码错误";
    }
    return error;
  };

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
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 8) {
      setError("密码长度不能小于8位");
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(password)) {
      setError("密码必须包含字母和数字");
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
          设置新密码
        </Typography.Title>
        <Typography.Text
          style={{
            color: "#fff",
            fontSize: "1rem",
            userSelect: "none",
          }}
        >
          首次登录，请设置您的账户密码
        </Typography.Text>
      </div>

      {/* 表单*/}
      <form onSubmit={handleSubmit} style={{ width: "86%" }}>
        {/* 手机号 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            <PhoneOutlined style={{ marginRight: 8 }} />
            手机号
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
              placeholder="请输入手机号"
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
            密码
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="请输入密码"
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
            确认密码
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="请再次输入密码"
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
          {loading ? "正在设置…" : "设置密码"}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => {
            setIsNewUser(false);
            setError("");
          }}
        >
          取消
        </button>
      </form>

      {/* 温馨提示 */}
      <div className="soft-tip">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        密码最少为8位, 需包含字母、数字
      </div>

      {/* 报错提示 */}
      {error && (
        <Alert
          className="error-tip"
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={getErrorMessage(error)}
        />
      )}
    </Flex>
  );
}
