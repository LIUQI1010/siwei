import React from "react";
import { Outlet } from "react-router-dom";
import LanguageSwitcher from "../LanguageSwitcher";

export default function AuthLayout() {
  return (
    <div
      className="auth-layout"
      style={{ position: "relative", minHeight: "100vh" }}
    >
      <Outlet />
      <LanguageSwitcher />
    </div>
  );
}
