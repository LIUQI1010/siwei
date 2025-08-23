import React, { useEffect } from "react";
import { useProfileStore } from "../../../app/store/profileStore";

export default function RoleGuard({ allowedRoles = [], children }) {
  const role = useProfileStore((state) => state.role);

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
