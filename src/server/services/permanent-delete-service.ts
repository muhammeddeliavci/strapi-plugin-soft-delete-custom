import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async delete(uid: string, id: string | number, params: any = {}) {
    const { confirm } = params;
    if (!confirm) {
      throw new Error('Permanent delete requires confirm: true');
    }

    const entity = await strapi.entityService.findOne(uid as any, id, {
      filters: {
        _softDeletedAt: {
          $notNull: true,
        },
      },
    } as any);

    if (!entity) {
      throw new Error('Entity not found or not soft-deleted. Only soft-deleted entities can be permanently deleted.');
    }

    const service = strapi.entityService as any;
    const originalDelete = service.__originalDelete;

    if (!originalDelete) {
      throw new Error('Soft delete service not properly initialized (missing originalDelete)');
    }

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    strapi.log.info(`Soft Delete: Permanently deleting ${uid}:${id} by user ${user?.id || 'system'}`);

    return originalDelete.call(service, uid, id, params);
  },

  async bulkDelete(uid: string, ids: (string | number)[], params: any = {}) {
    const { confirm } = params;
    if (!confirm) {
      throw new Error('Permanent delete requires confirm: true');
    }

    const service = strapi.entityService as any;
    const originalDeleteMany = service.__originalDeleteMany;

    if (!originalDeleteMany) {
      throw new Error('Soft delete service not properly initialized');
    }

    const result = await originalDeleteMany.call(service, uid, {
      filters: {
        id: { $in: ids },
        _softDeletedAt: { $notNull: true },
      },
    });

    return result;
  },
});
