import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AmplifyAuthService } from "../../services/amplifyAuth";
import { Spin } from "antd";

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const loc = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await AmplifyAuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("🔐 AuthGuard: 认证检查错误:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
        <div style={{ marginLeft: "16px" }}>验证身份中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/login?next=${encodeURIComponent(loc.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
