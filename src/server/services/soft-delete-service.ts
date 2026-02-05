import { Core } from '@strapi/strapi';

/**
 * Service to manage soft delete decoration of the Strapi Entity Service.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Decorates DB Query methods to catch ALL operations at the lowest level
   */
  decorateDbQuery() {
    const originalQuery = strapi.db.query.bind(strapi.db);

    (strapi.db as any).query = (uid: string) => {
      const queryBuilder = originalQuery(uid);
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return queryBuilder;
      }

      // Store originals
      const originalDelete = queryBuilder.delete;
      const originalDeleteMany = queryBuilder.deleteMany;
      const originalFindOne = queryBuilder.findOne;
      const originalFindMany = queryBuilder.findMany;
      const originalCount = queryBuilder.count;

      // Override delete
      queryBuilder.delete = async function(params: any) {
        const ctx = strapi.requestContext.get();
        const user = ctx?.state?.user;
        const deletedByType = user ? 'admin' : 'api';

        strapi.log.debug(`Soft Delete: DB Query - intercepting delete on ${uid}`);

        return queryBuilder.update({
          ...params,
          data: {
            softDeletedAt: new Date(),
            softDeletedById: user?.id ?? null,
            softDeletedByType: deletedByType,
          },
        });
      };

      // Override deleteMany
      queryBuilder.deleteMany = async function(params: any) {
        const ctx = strapi.requestContext.get();
        const user = ctx?.state?.user;
        const deletedByType = user ? 'admin' : 'api';

        strapi.log.debug(`Soft Delete: DB Query - intercepting deleteMany on ${uid}`);

        return queryBuilder.updateMany({
          ...params,
          data: {
            softDeletedAt: new Date(),
            softDeletedById: user?.id ?? null,
            softDeletedByType: deletedByType,
          },
        });
      };

      // Override findOne - filter out soft deleted
      queryBuilder.findOne = async function(params: any = {}) {
        const where = params.where || {};
        if (where.softDeletedAt === undefined) {
          params.where = { ...where, softDeletedAt: null };
        }
        return originalFindOne.call(this, params);
      };

      // Override findMany - filter out soft deleted
      queryBuilder.findMany = async function(params: any = {}) {
        const where = params.where || {};
        if (where.softDeletedAt === undefined) {
          params.where = { ...where, softDeletedAt: null };
        }
        return originalFindMany.call(this, params);
      };

      // Override count - exclude soft deleted
      queryBuilder.count = async function(params: any = {}) {
        const where = params.where || {};
        if (where.softDeletedAt === undefined) {
          params.where = { ...where, softDeletedAt: null };
        }
        return originalCount.call(this, params);
      };

      return queryBuilder;
    };

    strapi.log.info('Soft Delete: DB Query decorated (delete + find filtering)');
  },

  /**
   * Decorates the entityService methods
   */
  decorateEntityService() {
    const service = strapi.entityService as any;

    if (service.isDecoratedWithSoftDelete) {
      return;
    }

    const originalDelete = service.delete;
    const originalDeleteMany = service.deleteMany;
    const originalFindOne = service.findOne;
    const originalFindMany = service.findMany;

    service.__originalDelete = originalDelete;
    service.__originalDeleteMany = originalDeleteMany;

    // DELETE
    service.delete = async (uid: string, id: string | number, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalDelete.call(service, uid, id, params);
      }

      const ctx = strapi.requestContext.get();
      const user = ctx?.state?.user;
      const deletedByType = user ? 'admin' : 'api';

      return service.update(uid, id, {
        data: {
          softDeletedAt: new Date(),
          softDeletedById: user?.id ?? null,
          softDeletedByType: deletedByType,
        },
      });
    };

    service.deleteMany = async (uid: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalDeleteMany.call(service, uid, params);
      }

      const ctx = strapi.requestContext.get();
      const user = ctx?.state?.user;
      const deletedByType = user ? 'admin' : 'api';

      return strapi.db.query(uid).updateMany({
        where: params.filters || params,
        data: {
          softDeletedAt: new Date(),
          softDeletedById: user?.id ?? null,
          softDeletedByType: deletedByType,
        },
      });
    };

    // FIND - Add filtering
    service.findOne = async (uid: string, id: string | number, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalFindOne.call(service, uid, id, params);
      }

      const filters = params.filters || {};
      if (filters.softDeletedAt === undefined) {
        params.filters = { ...filters, softDeletedAt: { $null: true } };
      }

      return originalFindOne.call(service, uid, id, params);
    };

    service.findMany = async (uid: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalFindMany.call(service, uid, params);
      }

      const filters = params.filters || {};
      if (filters.softDeletedAt === undefined) {
        params.filters = { ...filters, softDeletedAt: { $null: true } };
      }

      return originalFindMany.call(service, uid, params);
    };

    service.isDecoratedWithSoftDelete = true;
    strapi.log.info('Soft Delete: Entity Service decorated (delete + find filtering)');

    // Decorate Document Service (Strapi v5+)
    this.decorateDocumentService();
  },

  /**
   * Decorates the Document Service for Strapi v5+ Content Manager compatibility
   */
  decorateDocumentService() {
    const documentService = (strapi as any).documents;

    if (!documentService || documentService.isDecoratedWithSoftDelete) {
      return;
    }

    const originalDelete = documentService.delete;
    const originalDeleteMany = documentService.deleteMany;
    const originalFindOne = documentService.findOne;
    const originalFindMany = documentService.findMany;

    documentService.__originalDelete = originalDelete;
    documentService.__originalDeleteMany = originalDeleteMany;

    // DELETE
    documentService.delete = async (uid: string, documentId: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalDelete.call(documentService, uid, documentId, params);
      }

      const ctx = strapi.requestContext.get();
      const user = ctx?.state?.user;
      const deletedByType = user ? 'admin' : 'api';

      strapi.log.debug(`Soft Delete: Document Service - soft deleting ${uid}:${documentId}`);

      return documentService.update(uid, documentId, {
        ...params,
        data: {
          softDeletedAt: new Date(),
          softDeletedById: user?.id ?? null,
          softDeletedByType: deletedByType,
        },
      });
    };

    documentService.deleteMany = async (uid: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalDeleteMany.call(documentService, uid, params);
      }

      const ctx = strapi.requestContext.get();
      const user = ctx?.state?.user;
      const deletedByType = user ? 'admin' : 'api';

      strapi.log.debug(`Soft Delete: Document Service - soft deleting many ${uid}`);

      return strapi.db.query(uid).updateMany({
        where: params.filters || {},
        data: {
          softDeletedAt: new Date(),
          softDeletedById: user?.id ?? null,
          softDeletedByType: deletedByType,
        },
      });
    };

    // FIND - Add filtering
    documentService.findOne = async (uid: string, documentId: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalFindOne.call(documentService, uid, documentId, params);
      }

      const filters = params.filters || {};
      if (filters.softDeletedAt === undefined) {
        params.filters = { ...filters, softDeletedAt: { $null: true } };
      }

      return originalFindOne.call(documentService, uid, documentId, params);
    };

    documentService.findMany = async (uid: string, params: any = {}) => {
      const model = strapi.getModel(uid as any);
      const hasSoftDelete = model?.attributes && model.attributes['softDeletedAt'];

      if (!hasSoftDelete) {
        return originalFindMany.call(documentService, uid, params);
      }

      const filters = params.filters || {};
      if (filters.softDeletedAt === undefined) {
        params.filters = { ...filters, softDeletedAt: { $null: true } };
      }

      return originalFindMany.call(documentService, uid, params);
    };

    documentService.isDecoratedWithSoftDelete = true;
    strapi.log.info('Soft Delete: Document Service decorated (delete + find filtering)');
  },

  registerLifecycleHooks() {
    // Lifecycle hooks as backup
    const subscribe = (strapi.db as any).lifecycles.subscribe;

    subscribe({
      models: ['*'],
      async beforeFindOne(event: any) {
        const model = strapi.getModel(event.model.uid as any);
        if (model.attributes && model.attributes['softDeletedAt']) {
          const where = event.params.where || {};
          if (where.softDeletedAt === undefined) {
            event.params.where = { ...where, softDeletedAt: null };
          }
        }
      },
      async beforeFindMany(event: any) {
        const model = strapi.getModel(event.model.uid as any);
        if (model.attributes && model.attributes['softDeletedAt']) {
          const where = event.params.where || {};
          if (where.softDeletedAt === undefined) {
            event.params.where = { ...where, softDeletedAt: null };
          }
        }
      },
    });
    strapi.log.info('Soft Delete: Lifecycle hooks registered');
  },
});
