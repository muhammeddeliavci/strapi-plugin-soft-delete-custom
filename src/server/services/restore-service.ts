import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async restore(uid: string, id: string | number) {
    const entity = await strapi.entityService.findOne(uid as any, id, {
      filters: {
        _softDeletedAt: {
          $notNull: true,
        },
      },
    } as any);

    if (!entity) {
      throw new Error('Entity not found or not soft-deleted');
    }

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    strapi.log.info(`Soft Delete: Restoring ${uid}:${id} by user ${user?.id || 'system'}`);

    const restored = await strapi.entityService.update(uid as any, id, {
      data: {
        _softDeletedAt: null,
        _softDeletedById: null,
        _softDeletedByType: null,
      } as any,
    });

    return {
      data: restored,
      warnings: [],
    };
  },

  async bulkRestore(uid: string, ids: (string | number)[]) {
    if (!ids || ids.length === 0) return { count: 0 };

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    strapi.log.info(`Soft Delete: Bulk restoring ${ids.length} items in ${uid}`);

    const result = await strapi.db.query(uid).updateMany({
      where: {
        id: {
          $in: ids,
        },
        _softDeletedAt: {
          $notNull: true,
        },
      },
      data: {
        _softDeletedAt: null,
        _softDeletedById: null,
        _softDeletedByType: null,
      },
    });

    return result;
  },
});
