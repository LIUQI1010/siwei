import React, { useState } from "react";
import { Form, Input, Button, Radio, message, Alert, Steps } from "antd";
import { useNavigate } from "react-router-dom";
import { AmplifyAuthService } from "../../../shared/services/amplifyAuth";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

const { Step } = Steps;

export default function RegisterPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationData, setRegistrationData] = useState(null);
  const { t } = useTranslation();

  // 错误消息处理函数
  const getErrorMessage = (error) => {
    const errorCodeMap = {
      REGISTRATION_ERROR: "REGISTRATION_ERROR",
      VERIFICATION_ERROR: "VERIFICATION_ERROR",
      RESEND_CODE_ERROR: "RESEND_CODE_ERROR",
      // 通用错误代码
      INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
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
      return t(errorCodeMap[error]);
    }

    return error;
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      const result = await AmplifyAuthService.register(
        values.email,
        values.password,
        values.name,
        values.role
      );

      if (result.success) {
        setRegistrationData({ email: values.email, userId: result.userId });
        setCurrentStep(1);
        message.success(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("REGISTRATION_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmCode = async (values) => {
    setLoading(true);
    setError("");

    try {
      const result = await AmplifyAuthService.confirmRegistration(
        registrationData.email,
        values.code
      );

      if (result.success) {
        message.success(result.message);
        setCurrentStep(2);
        setTimeout(() => {
          nav("/auth/login");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("VERIFICATION_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const result = await AmplifyAuthService.resendCode(
        registrationData.email
      );
      if (result.success) {
        message.success(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("RESEND_CODE_ERROR");
    }
  };

  const steps = [
    {
      title: t("registerPage_step1Title"),
      content: (
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入您的姓名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 8, message: "密码至少8位" },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item
            name="role"
            initialValue="student"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Radio.Group>
              <Radio.Button value="student">学生</Radio.Button>
              <Radio.Button value="teacher">教师</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "验证邮箱",
      content: (
        <div>
          <Alert
            message="验证码已发送"
            description={`我们已向 ${registrationData?.email} 发送了验证码，请检查您的邮箱并输入验证码。`}
            type="info"
            showIcon
            style={{ marginBottom: "20px" }}
          />

          <Form layout="vertical" onFinish={onConfirmCode}>
            <Form.Item
              name="code"
              label="验证码"
              rules={[{ required: true, message: "请输入验证码" }]}
            >
              <Input placeholder="请输入6位验证码" maxLength={6} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                disabled={loading}
              >
                {loading ? "验证中..." : "验证"}
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button type="link" onClick={resendCode}>
                没有收到验证码？重新发送
              </Button>
            </div>
          </Form>
        </div>
      ),
    },
    {
      title: "注册完成",
      content: (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Alert
            message="注册成功！"
            description="您的账户已创建成功，正在跳转到登录页面..."
            type="success"
            showIcon
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        {t("registerPage_title")}
      </h2>

      <Steps current={currentStep} style={{ marginBottom: "30px" }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      {error && (
        <Alert
          message={getErrorMessage(error)}
          type="error"
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}

      <div>{steps[currentStep].content}</div>

      {currentStep === 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button type="link" onClick={() => nav("/auth/login")}>
            已有账户？立即登录
          </Button>
        </div>
      )}
    </div>
  );
}
