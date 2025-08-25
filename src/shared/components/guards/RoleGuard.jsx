import React, { useEffect } from "react";
import { useProfileStore } from "../../../app/store/profileStore";
import { useTranslation } from "../../i18n/hooks/useTranslation";

export default function RoleGuard({ allowedRoles = [], children }) {
  const role = useProfileStore((state) => state.role);
  const { t } = useTranslation();

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
