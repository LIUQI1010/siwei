import React, { useState } from "react";
import { Form, Input, Button, message, Spin, Alert } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AmplifyAuthService } from "../../../shared/services/amplifyAuth";

export default function LoginPage() {
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      const result = await AmplifyAuthService.login(
        values.username,
        values.password
      );

      if (result.success) {
        message.success("登录成功");
        const next = qp.get("next") || "/dashboard";
        nav(next, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("登录过程中发生错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>登录</h2>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button type="link" onClick={() => nav("/auth/reset-password")}>
            忘记密码？
          </Button>
        </div>
      </Form>
    </div>
  );
}
