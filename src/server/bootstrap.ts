import { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // 1. Decorate Entity Service
  strapi.plugin('soft-delete').service('softDelete').decorateEntityService();

  // 2. Register Lifecycle Hooks
  strapi.plugin('soft-delete').service('softDelete').registerLifecycleHooks();

  // 3. Field Injection
  const contentTypes = strapi.contentTypes as any;

  for (const uid of Object.keys(contentTypes)) {
    if (!uid.startsWith('api::')) {
      continue;
    }

    const model = contentTypes[uid];
    const attributes = model.attributes;

    if (!attributes._softDeletedAt) {
      attributes._softDeletedAt = {
        type: 'datetime',
        configurable: false,
        visible: false,
        writable: true,
        private: true,
      };
    }
    if (!attributes._softDeletedById) {
      attributes._softDeletedById = {
        type: 'integer',
        configurable: false,
        visible: false,
        writable: true,
        private: true,
      };
    }
    if (!attributes._softDeletedByType) {
      attributes._softDeletedByType = {
        type: 'enumeration',
        enum: ['admin', 'api'],
        configurable: false,
        visible: false,
        writable: true,
        private: true,
      };
    }
  }
};
