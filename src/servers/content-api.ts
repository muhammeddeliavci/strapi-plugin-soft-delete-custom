import type { Core } from '@strapi/strapi';

/**
 * Decorate entity service methods to implement soft delete behavior
 */
export function decorateEntityService(strapi: Core.Strapi) {
  const originalDelete = strapi.entityService.delete.bind(strapi.entityService);
  const originalFindMany = strapi.entityService.findMany.bind(strapi.entityService);
  const originalFindOne = strapi.entityService.findOne.bind(strapi.entityService);
  const originalCount = strapi.entityService.count.bind(strapi.entityService);

  // Store original delete for permanent deletion
  (strapi.entityService as any)._originalDelete = originalDelete;

  /**
   * Override delete to perform soft delete instead
   */
  (strapi.entityService as any).delete = async (uid: string, entityId: any, params?: any) => {
    const contentType = (strapi.contentTypes as any)[uid];

    if (!contentType || (contentType.kind !== 'collectionType' && contentType.kind !== 'singleType')) {
      return originalDelete(uid as any, entityId, params);
    }

    const user = params?.state?.user || params?.user;
    const userId = user?.id || null;
    const userType = user?.type || 'api';

    // Convert delete to update with soft delete metadata
    const result = await (strapi.entityService as any).update(uid, entityId, {
      data: {
        _softDeletedAt: new Date(),
        _softDeletedById: userId,
        _softDeletedByType: userType,
      },
      ...params,
    });

    strapi.log.debug(`[soft-delete] Soft deleted ${uid}:${entityId}`);
    return result;
  };

  /**
   * Override findMany to exclude soft deleted entries
   */
  (strapi.entityService as any).findMany = async (uid: string, params?: any) => {
    const contentType = (strapi.contentTypes as any)[uid];

    if (!contentType || (contentType.kind !== 'collectionType' && contentType.kind !== 'singleType')) {
      return originalFindMany(uid as any, params);
    }

    const filters = params?.filters || {};
    const mergedParams = {
      ...params,
      filters: {
        ...filters,
        _softDeletedAt: { $null: true },
      },
    };

    return originalFindMany(uid as any, mergedParams);
  };

  /**
   * Override findOne to exclude soft deleted entries
   * Also handles single type scenario
   */
  (strapi.entityService as any).findOne = async (uid: string, entityId: any, params?: any) => {
    const contentType = (strapi.contentTypes as any)[uid];

    if (!contentType || (contentType.kind !== 'collectionType' && contentType.kind !== 'singleType')) {
      return originalFindOne(uid as any, entityId, params);
    }

    const filters = params?.filters || {};
    const mergedParams = {
      ...params,
      filters: {
        ...filters,
        _softDeletedAt: { $null: true },
      },
    };

    const result = await originalFindOne(uid as any, entityId, mergedParams);

    // For single types, return null if soft deleted
    if (contentType.kind === 'singleType' && result && (result as any)._softDeletedAt) {
      return null;
    }

    return result;
  };

  /**
   * Override count to exclude soft deleted entries
   */
  (strapi.entityService as any).count = async (uid: string, params?: any) => {
    const contentType = (strapi.contentTypes as any)[uid];

    if (!contentType || (contentType.kind !== 'collectionType' && contentType.kind !== 'singleType')) {
      return originalCount(uid as any, params);
    }

    const filters = params?.filters || {};
    const mergedParams = {
      ...params,
      filters: {
        ...filters,
        _softDeletedAt: { $null: true },
      },
    };

    return originalCount(uid as any, mergedParams);
  };

  strapi.log.info('[soft-delete] Entity service decoration complete');
}
