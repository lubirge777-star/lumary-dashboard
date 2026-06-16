import type { UserRole } from "@/types"

export type Permission =
  | "manage:users"
  | "manage:settings"
  | "manage:clients"
  | "manage:projects"
  | "manage:payments"
  | "manage:expenses"
  | "manage:retainers"
  | "manage:messages"
  | "manage:automation"
  | "manage:appointments"
  | "view:analytics"
  | "view:finance"
  | "export:data"

const rolePermissions: Record<UserRole, Permission[]> = {
  OWNER: [
    "manage:users",
    "manage:settings",
    "manage:clients",
    "manage:projects",
    "manage:payments",
    "manage:expenses",
    "manage:retainers",
    "manage:messages",
    "manage:automation",
    "manage:appointments",
    "view:analytics",
    "view:finance",
    "export:data",
  ],
  AGENT: [
    "manage:clients",
    "manage:projects",
    "manage:payments",
    "manage:expenses",
    "manage:retainers",
    "manage:messages",
    "manage:automation",
    "manage:appointments",
    "view:analytics",
    "view:finance",
    "export:data",
  ],
  VIEWER: [
    "view:analytics",
    "view:finance",
  ],
}

export function can(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role) return false
  const perms = rolePermissions[role as UserRole]
  if (!perms) return false
  return perms.includes(permission)
}

export const roleLabels: Record<UserRole, string> = {
  OWNER: "Owner",
  AGENT: "Agent",
  VIEWER: "Viewer",
}

export const roleColors: Record<UserRole, string> = {
  OWNER: "text-amber-600 bg-amber-100",
  AGENT: "text-blue-600 bg-blue-100",
  VIEWER: "text-gray-600 bg-gray-100",
}

export const restrictedRoutes: Record<string, Permission> = {
  "/settings": "manage:settings",
  "/automation": "manage:automation",
}

export function getRestrictedRoutes(role: UserRole | string | undefined): string[] {
  return Object.entries(restrictedRoutes)
    .filter(([, perm]) => !can(role, perm))
    .map(([route]) => route)
}
