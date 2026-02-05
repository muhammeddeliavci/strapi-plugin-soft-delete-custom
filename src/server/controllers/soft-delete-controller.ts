import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSoftDeletedItems(ctx: any) {
    const { modelUid, _q, _limit, _start } = ctx.query;

    if (!modelUid) {
      return ctx.badRequest('modelUid is required');
    }

    const filters: any = {
      _softDeletedAt: { $notNull: true },
    };

    if (_q) {
      // Basic search implementation if needed
    }

    const results = await strapi.entityService.findMany(modelUid as any, {
      filters,
      limit: _limit,
      start: _start,
    } as any);

    const count = await strapi.entityService.count(modelUid as any, {
      filters,
    } as any);

    return { data: results, pagination: { total: count } };
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
    try {
      const result = await strapi.plugin('soft-delete').service('permanentDelete').delete(uid, id, { confirm });
      return result;
    } catch (error: any) {
      return ctx.badRequest(error.message);
    }
  },
});
