import type { Core } from '@strapi/strapi';

/**
 * Add soft delete fields to all content type schemas
 * This function modifies schemas at runtime during plugin registration
 */
export function addSoftDeleteFields(strapi: Core.Strapi) {
  const contentTypes = strapi.contentTypes;

  for (const [uid, contentType] of Object.entries(contentTypes)) {
    // Only process collection types and single types (exclude components)
    if (contentType.kind === 'collectionType' || contentType.kind === 'singleType') {
      const schema = contentType as any;

      // Add soft delete fields if not already present
      if (!schema.attributes._softDeletedAt) {
        schema.attributes._softDeletedAt = {
          type: 'datetime',
          private: true,
          configurable: false,
        };
      }

      if (!schema.attributes._softDeletedById) {
        schema.attributes._softDeletedById = {
          type: 'biginteger',
          private: true,
          configurable: false,
        };
      }

      if (!schema.attributes._softDeletedByType) {
        schema.attributes._softDeletedByType = {
          type: 'string',
          private: true,
          configurable: false,
        };
      }

      strapi.log.debug(`[soft-delete] Added soft delete fields to ${uid}`);
    }
  }

  strapi.log.info('[soft-delete] Schema decoration complete');
}
