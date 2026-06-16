"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { can, type Permission, roleLabels, roleColors, restrictedRoutes } from "@/lib/permissions"
import type { UserRole } from "@/types"

export function useRole(): UserRole | undefined {
  const { data: session } = useSession()
  return (session?.user as any)?.role as UserRole | undefined
}

export function useCan(permission: Permission): boolean {
  const role = useRole()
  return can(role, permission)
}

export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hasAccess = useCan(permission)
  if (!hasAccess) return fallback ?? null
  return <>{children}</>
}

export function RoleBadge({ role }: { role?: UserRole | string }) {
  if (!role) return null
  const color = roleColors[role as UserRole] || "text-gray-600 bg-gray-100"
  const label = roleLabels[role as UserRole] || role
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${color}`}>
      {label}
    </span>
  )
}

export function usePageGuard(requiredPermission?: Permission) {
  const role = useRole()
  const router = useRouter()
  const hasAccess = requiredPermission ? can(role, requiredPermission) : true

  useEffect(() => {
    if (!hasAccess && role !== undefined) {
      router.push("/")
    }
  }, [hasAccess, role, router])

  return { role, hasAccess }
}
