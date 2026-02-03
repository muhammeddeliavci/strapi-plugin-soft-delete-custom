/**
 * RBAC permissions for soft delete plugin
 */
export const PERMISSIONS = {
  read: 'plugin::soft-delete-custom.read',
  restore: 'plugin::soft-delete-custom.restore',
  deletePermanently: 'plugin::soft-delete-custom.delete-permanently',
} as const;

export default [
  {
    action: PERMISSIONS.read,
    subject: null,
    properties: {},
    conditions: [],
    displayName: 'Read soft deleted entries',
    category: 'soft-delete',
  },
  {
    action: PERMISSIONS.restore,
    subject: null,
    properties: {},
    conditions: [],
    displayName: 'Restore soft deleted entries',
    category: 'soft-delete',
  },
  {
    action: PERMISSIONS.deletePermanently,
    subject: null,
    properties: {},
    conditions: [],
    displayName: 'Delete permanently',
    category: 'soft-delete',
  },
];
