import type { Core } from '@strapi/strapi';

/**
 * Soft Delete Controller
 * Handles API requests for soft delete operations
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/soft-delete-custom/list
   * List all soft deleted entries with pagination and filtering
   */
  async list(ctx: any) {
    try {
      const { page = 1, pageSize = 25, contentType, search } = ctx.query;

      const contentTypes = Object.keys(strapi.contentTypes).filter((uid) => {
        const ct = strapi.contentTypes[uid];
        return ct.kind === 'collectionType' || ct.kind === 'singleType';
      });

      const results = [];

      for (const uid of contentTypes) {
        if (contentType && uid !== contentType) continue;

        const query: any = {
          where: {
            _softDeletedAt: { $notNull: true },
          },
          limit: parseInt(pageSize as string),
          offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
          orderBy: { _softDeletedAt: 'desc' },
        };

        // Add search filter if provided
        if (search) {
          query.where.$or = [
            { id: { $containsi: search } },
            // Add more searchable fields dynamically based on content type
          ];
        }

        const entries = await strapi.db.query(uid).findMany(query);

        const count = await strapi.db.query(uid).count({
          where: { _softDeletedAt: { $notNull: true } },
        });

        results.push({
          contentType: uid,
          entries,
          count,
        });
      }

      ctx.send({
        data: results,
        meta: {
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
          },
        },
      });
    } catch (error: any) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * POST /api/soft-delete-custom/restore/:contentType/:id
   * Restore a single soft deleted entry
   */
  async restore(ctx: any) {
    try {
      const { contentType, id } = ctx.params;
      const user = ctx.state.user;

      const restoreService = strapi
        .plugin('soft-delete-custom')
        .service('restore');

      const result = await restoreService.restore({
        contentType,
        id,
        user,
      });

      ctx.send(result);
    } catch (error: any) {
      ctx.throw(400, error.message);
    }
  },

  /**
   * POST /api/soft-delete-custom/restore-bulk
   * Restore multiple entries in bulk
   */
  async restoreBulk(ctx: any) {
    try {
      const { items } = ctx.request.body;
      const user = ctx.state.user;

      if (!Array.isArray(items) || items.length === 0) {
        ctx.throw(400, 'Items array is required');
      }

      const restoreService = strapi
        .plugin('soft-delete-custom')
        .service('restore');

      const result = await restoreService.restoreBulk(items, user);

      ctx.send(result);
    } catch (error: any) {
      ctx.throw(400, error.message);
    }
  },

  /**
   * DELETE /api/soft-delete-custom/delete-permanently/:contentType/:id
   * Permanently delete an entry
   */
  async deletePermanently(ctx: any) {
    try {
      const { contentType, id } = ctx.params;
      const user = ctx.state.user;

      const permanentDeleteService = strapi
        .plugin('soft-delete-custom')
        .service('permanent-delete');

      const result = await permanentDeleteService.deletePermanently({
        contentType,
        id,
        user,
      });

      ctx.send(result);
    } catch (error: any) {
      ctx.throw(400, error.message);
    }
  },

  /**
   * DELETE /api/soft-delete-custom/delete-permanently-bulk
   * Permanently delete multiple entries
   */
  async deletePermanentlyBulk(ctx: any) {
    try {
      const { items } = ctx.request.body;
      const user = ctx.state.user;

      if (!Array.isArray(items) || items.length === 0) {
        ctx.throw(400, 'Items array is required');
      }

      const permanentDeleteService = strapi
        .plugin('soft-delete-custom')
        .service('permanent-delete');

      const result = await permanentDeleteService.deletePermanentlyBulk(items, user);

      ctx.send(result);
    } catch (error: any) {
      ctx.throw(400, error.message);
    }
  },
});
