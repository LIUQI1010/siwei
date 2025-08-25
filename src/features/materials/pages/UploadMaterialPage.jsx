import React from "react";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function UploadMaterialPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t("uploadMaterialPage_title")}</h2>
    </div>
  );
}
