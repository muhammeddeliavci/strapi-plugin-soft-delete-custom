import { Core } from '@strapi/strapi';

/**
 * Service to manage soft delete decoration of the Strapi Entity Service.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Decorates the entityService.delete and deleteMany methods to perform soft deletes.
   * Stores original methods in __originalDelete and __originalDeleteMany.
   */
  decorateEntityService() {
    const service = strapi.entityService as any;

    if (service.isDecoratedWithSoftDelete) {
      return;
    }

    const originalDelete = service.delete;
    const originalDeleteMany = service.deleteMany;

    service.__originalDelete = originalDelete;
    service.__originalDeleteMany = originalDeleteMany;

    service.delete = async (uid: string, id: string | number, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model.attributes && model.attributes['_softDeletedAt'];

      if (!hasSoftDelete) {
        return originalDelete.call(service, uid, id, params);
      }

      const ctx = strapi.requestContext.get();
      const user = ctx?.state?.user;
      const deletedByType = user ? 'admin' : 'api'; // Simple heuristic, can be improved

      return service.update(uid, id, {
        data: {
          _softDeletedAt: new Date(),
          _softDeletedById: user?.id ?? null,
          _softDeletedByType: deletedByType,
        },
      });
    };

    service.deleteMany = async (uid: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model.attributes && model.attributes['_softDeletedAt'];

      if (!hasSoftDelete) {
        return originalDeleteMany.call(service, uid, params);
      }

      const ctx = strapi.requestContext.get();
      const user = ctx?.state?.user;
      const deletedByType = user ? 'admin' : 'api';

      // Ensure we are targeting the correct records based on params
      // entityService.deleteMany(uid, { filters: { ... } })
      
      return strapi.db.query(uid).updateMany({
        where: params.filters || params,
        data: {
          _softDeletedAt: new Date(),
          _softDeletedById: user?.id ?? null,
          _softDeletedByType: deletedByType,
        },
      });
    };

    service.isDecoratedWithSoftDelete = true;
    strapi.log.info('Soft Delete: Entity Service decorated');
  },

  registerLifecycleHooks() {
    const subscribe = (strapi.db as any).lifecycles.subscribe;

    subscribe({
      models: ['*'],
      async beforeFindOne(event: any) {
        const model = strapi.getModel(event.model.uid as any);
        if (model.attributes && model.attributes['_softDeletedAt']) {
          const where = event.params.where || {};
          // Only add if not explicitly querying for it
          if (where._softDeletedAt === undefined) {
            event.params.where = { ...where, _softDeletedAt: null };
          }
        }
      },
      async beforeFindMany(event: any) {
        const model = strapi.getModel(event.model.uid as any);
        if (model.attributes && model.attributes['_softDeletedAt']) {
          const where = event.params.where || {};
          // Only add if not explicitly querying for it
          if (where._softDeletedAt === undefined) {
            event.params.where = { ...where, _softDeletedAt: null };
          }
        }
      },
    });
    strapi.log.info('Soft Delete: Lifecycle hooks registered');
  },
});
