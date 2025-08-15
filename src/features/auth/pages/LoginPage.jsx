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
} from "@ant-design/icons";
import NewUserLogin from "./NewUserLogin";
export default function LoginPage() {
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const getErrorMessage = (error) => {
    if (error === "Invalid credentials") {
      return "用户名或密码错误";
    }
    return error;
  };

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
        message.success("登录成功");
        const next = qp.get("next") || "/dashboard";
        nav(next, { replace: true });
      } else if (result.requiresNewPassword) {
        // 新用户需要设置密码
        setIsNewUser(true);
        setError("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("登录过程中发生错误，请稍后再试");
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
        message.success("密码设置成功");
        const next = qp.get("next") || "/dashboard";
        nav(next, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("设置密码过程中发生错误，请稍后再试");
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
          登录
        </Typography.Title>
        <Typography.Text
          style={{
            color: "rgb(26 110 227)",
            fontSize: "1rem",
            userSelect: "none",
          }}
        >
          欢迎回来，请输入账户信息
        </Typography.Text>
      </div>

      {/* 表单*/}
      <form onSubmit={handleSubmit} style={{ width: "86%" }}>
        {/* 用户名 */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#fff" }}>
            用户名
          </label>
          <input
            className={`glass-input ${
              nullFields.username ? "" : "error-placeholder"
            }`}
            name="username"
            placeholder="请输入用户名"
            onFocus={() => handleInputFocus("username")}
          />
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

        {/* 登录按钮 */}
        <button type="submit" disabled={loading} className="login-button">
          {loading ? "正在登录…" : "登录"}
        </button>
      </form>

      {/* 温馨提示 */}
      <div className="soft-tip">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        如需修改密码，请联系管理员
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
