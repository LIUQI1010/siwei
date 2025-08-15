import React from "react";
import { AmplifyAuthService } from "../../../shared/services/amplifyAuth";

export default function DashboardPage() {
  const isAuthenticated = AmplifyAuthService.isAuthenticated();
  return (
    <div>
      <h2>DashboardPage: {isAuthenticated ? "已认证" : "未认证"}</h2>
    </div>
  );
}
