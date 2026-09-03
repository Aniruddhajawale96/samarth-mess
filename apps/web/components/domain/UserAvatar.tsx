import * as React from "react";
import { Avatar } from "../ui/Avatar";

interface UserAvatarProps {
  name?: string | null;
  profilePhotoUrl?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}

function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function UserAvatar({ name, profilePhotoUrl, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar
      src={profilePhotoUrl}
      fallback={initials(name)}
      size={size}
      className={className}
    />
  );
}
