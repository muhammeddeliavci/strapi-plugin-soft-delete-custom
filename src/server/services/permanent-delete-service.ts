import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async delete(uid: string, id: string | number, params: any = {}) {
    const { confirm } = params;
    if (!confirm) {
      throw new Error('Permanent delete requires confirm: true');
    }

    strapi.log.info(`[Soft Delete] Permanent delete - uid: ${uid}, id: ${id}`);
    
    // Strapi v5 uses documentId, try to find by documentId first
    let entity = await strapi.db.query(uid).findOne({
      where: {
        documentId: id,
        softDeletedAt: {
          $notNull: true,
        },
      },
    });
    
    // Fallback to id if documentId search fails
    if (!entity) {
      entity = await strapi.db.query(uid).findOne({
        where: {
          id: id,
          softDeletedAt: {
            $notNull: true,
          },
        },
      });
    }

    if (!entity) {
      strapi.log.error(`[Soft Delete] Entity not found for permanent delete - uid: ${uid}, id: ${id}`);
      throw new Error('Entity not found or not soft-deleted. Only soft-deleted entities can be permanently deleted.');
    }
    
    strapi.log.info(`[Soft Delete] Found entity for delete with internal id: ${entity.id}`);

    const service = strapi.entityService as any;
    const originalDelete = service.__originalDelete;

    if (!originalDelete) {
      throw new Error('Soft delete service not properly initialized (missing originalDelete)');
    }

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    strapi.log.info(`Soft Delete: Permanently deleting ${uid}:${id} (internal id: ${entity.id}) by user ${user?.id || 'system'}`);

    return originalDelete.call(service, uid, entity.id, params);
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
        softDeletedAt: { $notNull: true },
      },
    });

    return result;
  },
});
