import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSoftDeletedItems(ctx: any) {
    const { modelUid, _q, _limit, _start } = ctx.query;

    strapi.log.info(`[Soft Delete] getSoftDeletedItems called with modelUid: ${modelUid}`);

    if (!modelUid) {
      strapi.log.warn('[Soft Delete] modelUid is required but not provided');
      return ctx.badRequest('modelUid is required');
    }

    const filters: any = {
      softDeletedAt: { $notNull: true },
    };

    if (_q) {
      // Basic search implementation if needed
    }

    strapi.log.info(`[Soft Delete] Querying with filters: ${JSON.stringify(filters)}`);

    try {
      const results = await strapi.entityService.findMany(modelUid as any, {
        filters,
        limit: _limit ? parseInt(_limit) : 10,
        start: _start ? parseInt(_start) : 0,
      } as any);

      strapi.log.info(`[Soft Delete] Found ${results?.length || 0} items`);

      const count = await strapi.entityService.count(modelUid as any, {
        filters,
      } as any);

      strapi.log.info(`[Soft Delete] Total count: ${count}`);

      return { data: results, pagination: { total: count } };
    } catch (error: any) {
      strapi.log.error(`[Soft Delete] Error fetching items: ${error.message}`);
      return ctx.badRequest(`Error fetching soft deleted items: ${error.message}`);
    }
  },

  async restore(ctx: any) {
    const { uid, id } = ctx.params;
    try {
      const result = await strapi.plugin('soft-delete').service('restore').restore(uid, id);
      return result;
    } catch (error: any) {
      return ctx.badRequest(error.message);
    }
  },

  async permanentDelete(ctx: any) {
    const { uid, id } = ctx.params;
    const { confirm } = ctx.request.body;
    
    strapi.log.info(`[Soft Delete] permanentDelete - uid: ${uid}, id: ${id}, confirm: ${confirm}`);
    
    try {
      const result = await strapi.plugin('soft-delete').service('permanentDelete').delete(uid, id, { confirm });
      return result;
    } catch (error: any) {
      strapi.log.error(`[Soft Delete] permanentDelete error: ${error.message}`);
      return ctx.badRequest(error.message);
    }
  },
});
