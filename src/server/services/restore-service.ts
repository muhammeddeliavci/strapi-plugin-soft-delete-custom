import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async restore(uid: string, id: string | number) {
    strapi.log.info(`[Soft Delete] Restore - uid: ${uid}, id: ${id}, type: ${typeof id}`);
    
    // First, try to find using strapi.db.query with id
    let entity = await strapi.db.query(uid).findOne({
      where: {
        id: id,
        softDeletedAt: {
          $notNull: true,
        },
      },
    });
    
    strapi.log.info(`[Soft Delete] Search by id result: ${entity ? 'found' : 'not found'}`);
    
    // If not found, try with documentId
    if (!entity) {
      entity = await strapi.db.query(uid).findOne({
        where: {
          documentId: id,
          softDeletedAt: {
            $notNull: true,
          },
        },
      });
      strapi.log.info(`[Soft Delete] Search by documentId result: ${entity ? 'found' : 'not found'}`);
    }

    // If still not found, try finding all soft-deleted items and match
    if (!entity) {
      strapi.log.info(`[Soft Delete] Trying to find all soft-deleted items to debug...`);
      const allSoftDeleted = await strapi.db.query(uid).findMany({
        where: {
          softDeletedAt: {
            $notNull: true,
          },
        },
        limit: 10,
      });
      strapi.log.info(`[Soft Delete] Found ${allSoftDeleted.length} soft-deleted items`);
      allSoftDeleted.forEach((item: any) => {
        strapi.log.info(`[Soft Delete] Item - id: ${item.id}, documentId: ${item.documentId}`);
      });
    }

    if (!entity) {
      strapi.log.error(`[Soft Delete] Entity not found - uid: ${uid}, id: ${id}`);
      throw new Error('Entity not found or not soft-deleted');
    }
    
    strapi.log.info(`[Soft Delete] Found entity - id: ${entity.id}, documentId: ${entity.documentId}`);

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    strapi.log.info(`Soft Delete: Restoring ${uid}:${id} (db id: ${entity.id}) by user ${user?.id || 'system'}`);

    const restored = await strapi.db.query(uid).update({
      where: { id: entity.id },
      data: {
        softDeletedAt: null,
        softDeletedById: null,
        softDeletedByType: null,
      },
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
        softDeletedAt: {
          $notNull: true,
        },
      },
      data: {
        softDeletedAt: null,
        softDeletedById: null,
        softDeletedByType: null,
      },
    });

    return result;
  },
});
