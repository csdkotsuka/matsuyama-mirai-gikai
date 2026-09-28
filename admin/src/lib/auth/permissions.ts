export interface AdminUser {
  uid: string;
  email?: string;
  admin?: boolean;
  roles?: string[];
}

/**
 * ユーザーがadmin権限を持っているかチェック
 */
export function checkAdminPermission(user: AdminUser | null): boolean {
  if (!user) return false;
  if (user.admin === true) return true;
  const roles = user.roles || [];
  return roles.includes("admin");
}

/**
 * ユーザーがeditor権限を持っているかチェック (将来的に使用)
 */
export function checkEditorPermission(user: AdminUser | null): boolean {
  if (!user) return false;
  if (user.admin === true) return true;
  const roles = user.roles || [];
  return roles.includes("admin") || roles.includes("editor");
}
