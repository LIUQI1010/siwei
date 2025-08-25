import React, { useState } from "react";
import ProfileCard from "../card/ProfileCard";
import EditProfileCard from "../card/EditProfileCard";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <EditProfileCard setIsEditing={setIsEditing} />
  ) : (
    <ProfileCard setIsEditing={setIsEditing} />
  );
}
