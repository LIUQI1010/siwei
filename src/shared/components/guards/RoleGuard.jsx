import React, { useState, useEffect } from "react";
import { AmplifyAuthService } from "../../services/amplifyAuth";
import { Spin } from "antd";

export default function RoleGuard({ allowedRoles = [], children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      const userInfo = await AmplifyAuthService.getCurrentUserInfo();
      setRole(userInfo.role || "student");
    };
    getRole();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="small" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
