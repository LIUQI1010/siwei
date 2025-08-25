import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "../../i18n/hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher";

export default function AuthLayout() {
  const { t } = useTranslation();

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
