import type { Core } from '@strapi/strapi';

interface RestoreParams {
  contentType: string;
  id: string | number;
  user?: any;
}

interface BulkRestoreItem {
  contentType: string;
  id: string | number;
}

/**
 * Service for restoring soft deleted entries
 */
export function createRestoreService(strapi: Core.Strapi) {
  return {
    /**
     * Restore a single soft deleted entry
     */
    async restore({ contentType, id, user }: RestoreParams) {
      // Check if content type exists
      if (!(strapi.contentTypes as any)[contentType]) {
        throw new Error(`Content type ${contentType} not found`);
      }

      // Find the entry (including soft deleted)
      const entry = await strapi.db.query(contentType).findOne({
        where: { id },
      });

      if (!entry) {
        throw new Error(`Entry not found: ${contentType}:${id}`);
      }

      // Check if entry is actually soft deleted
      if (!entry._softDeletedAt) {
        return {
          success: true,
          message: 'Entry is already active',
          data: entry,
        };
      }

      // Restore by setting soft delete fields to null
      const restored = await (strapi.entityService as any).update(contentType, id, {
        data: {
          _softDeletedAt: null,
          _softDeletedById: null,
          _softDeletedByType: null,
        },
      });

      strapi.log.info(`[soft-delete] Restored ${contentType}:${id} by user ${user?.id || 'system'}`);

      return {
        success: true,
        message: 'Entry restored successfully',
        data: restored,
      };
    },

    /**
     * Restore multiple entries in bulk
     */
    async restoreBulk(items: BulkRestoreItem[], user?: any) {
      const results = [];
      const errors = [];

      for (const item of items) {
        try {
          const result = await this.restore({
            contentType: item.contentType,
            id: item.id,
            user,
          });
          results.push({
            contentType: item.contentType,
            id: item.id,
            success: true,
            data: result.data,
          });
        } catch (error: any) {
          errors.push({
            contentType: item.contentType,
            id: item.id,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        success: errors.length === 0,
        restored: results.length,
        failed: errors.length,
        results,
        errors,
      };
    },

    /**
     * Check if user has permission to restore
     */
    async checkRestorePermission(user: any, contentType: string) {
      if (!user) {
        throw new Error('Authentication required');
      }

      // Check plugin restore permission
      const hasPluginPermission = await strapi
        .plugin('users-permissions')
        .service('users-permissions')
        .checkPermission(user, 'plugin::soft-delete-custom.restore');

      if (!hasPluginPermission) {
        throw new Error('Insufficient permissions to restore entries');
      }

      // Also check if user can update the content type
      const hasUpdatePermission = await strapi
        .plugin('users-permissions')
        .service('users-permissions')
        .checkPermission(user, `${contentType}.update`);

      if (!hasUpdatePermission) {
        throw new Error(`Insufficient permissions to update ${contentType}`);
      }

      return true;
    },
  };
}
