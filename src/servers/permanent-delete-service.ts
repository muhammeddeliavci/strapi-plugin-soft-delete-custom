import type { Core } from '@strapi/strapi';

interface PermanentDeleteParams {
  contentType: string;
  id: string | number;
  user?: any;
}

interface BulkPermanentDeleteItem {
  contentType: string;
  id: string | number;
}

/**
 * Service for permanently deleting soft deleted entries
 */
export function createPermanentDeleteService(strapi: Core.Strapi) {
  return {
    /**
     * Permanently delete a single entry
     */
    async deletePermanently({ contentType, id, user }: PermanentDeleteParams) {
      // Check if content type exists
      if (!strapi.contentTypes[contentType]) {
        throw new Error(`Content type ${contentType} not found`);
      }

      // Find the entry (including soft deleted)
      const entry = await strapi.db.query(contentType).findOne({
        where: { id },
      });

      if (!entry) {
        throw new Error(`Entry not found: ${contentType}:${id}`);
      }

      // Validate that entry is soft deleted
      if (!entry._softDeletedAt) {
        throw new Error('Entry must be soft deleted before permanent deletion');
      }

      // Use original delete method (bypassing decorator)
      const originalDelete = (strapi.entityService as any)._originalDelete;

      if (!originalDelete) {
        throw new Error('Original delete method not found');
      }

      const result = await originalDelete(contentType, id);

      // Audit log
      strapi.log.warn(
        `[soft-delete] PERMANENT DELETE: ${contentType}:${id} by user ${user?.id || 'system'}`
      );

      return {
        success: true,
        message: 'Entry permanently deleted',
        data: result,
      };
    },

    /**
     * Permanently delete multiple entries in bulk
     */
    async deletePermanentlyBulk(items: BulkPermanentDeleteItem[], user?: any) {
      const results = [];
      const errors = [];

      for (const item of items) {
        try {
          const result = await this.deletePermanently({
            contentType: item.contentType,
            id: item.id,
            user,
          });
          results.push({
            contentType: item.contentType,
            id: item.id,
            success: true,
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
        deleted: results.length,
        failed: errors.length,
        results,
        errors,
      };
    },

    /**
     * Check if user has permission to permanently delete
     */
    async checkDeletePermanentlyPermission(user: any) {
      if (!user) {
        throw new Error('Authentication required');
      }

      // Check plugin delete-permanently permission
      const hasPermission = await strapi
        .plugin('users-permissions')
        .service('users-permissions')
        .checkPermission(user, 'plugin::soft-delete-custom.delete-permanently');

      if (!hasPermission) {
        throw new Error('Insufficient permissions to permanently delete entries');
      }

      return true;
    },
  };
}
