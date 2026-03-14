export const permissions = {
  appointments: ["read", "write", "cancel"],
  records: ["read", "write"],
  messaging: ["read", "write"],
  billing: ["read", "write"],
  analytics: ["read"]
} as const;

export type PermissionGroup = keyof typeof permissions;
export type PermissionAction = (typeof permissions)[PermissionGroup][number];
