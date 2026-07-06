import type { UserRole } from "@/types";

export const ROLE_HOME: Record<UserRole, string> = {
  tenant: "/",
  landlord: "/landlord-dashboard",
  manager: "/manager-dashboard",
};

export function canAccessRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function roleHome(role: UserRole): string {
  return ROLE_HOME[role];
}
