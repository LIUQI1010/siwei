import React from "react";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t("resetPasswordPage_title")}</h2>
    </div>
  );
}
