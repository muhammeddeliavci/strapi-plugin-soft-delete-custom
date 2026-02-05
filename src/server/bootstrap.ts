import { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // 1. Decorate DB Query (lowest level - catches everything)
  strapi.plugin('soft-delete').service('softDelete').decorateDbQuery();

  // 2. Decorate Entity Service
  strapi.plugin('soft-delete').service('softDelete').decorateEntityService();

  // 3. Register Lifecycle Hooks
  strapi.plugin('soft-delete').service('softDelete').registerLifecycleHooks();

  // 4. Field Injection
  const contentTypes = strapi.contentTypes as any;

  for (const uid of Object.keys(contentTypes)) {
    if (!uid.startsWith('api::')) {
      continue;
    }

    const model = contentTypes[uid];
    const attributes = model.attributes;

    if (!attributes.softDeletedAt) {
      attributes.softDeletedAt = {
        type: 'datetime',
        columnName: 'soft_deleted_at',
        configurable: false,
        visible: false,
        writable: true,
        private: true,
      };
    }
    if (!attributes.softDeletedById) {
      attributes.softDeletedById = {
        type: 'integer',
        columnName: 'soft_deleted_by_id',
        configurable: false,
        visible: false,
        writable: true,
        private: true,
      };
    }
    if (!attributes.softDeletedByType) {
      attributes.softDeletedByType = {
        type: 'string',
        columnName: 'soft_deleted_by_type',
        configurable: false,
        visible: false,
        writable: true,
        private: true,
      };
    }
  }
};
