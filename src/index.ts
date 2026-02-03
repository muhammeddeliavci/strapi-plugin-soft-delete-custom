import type { Core } from '@strapi/strapi';
import { addSoftDeleteFields } from './database/migrations';
import { decorateEntityService } from './servers/content-api';
import { createRestoreService } from './servers/restore-service';
import { createPermanentDeleteService } from './servers/permanent-delete-service';
import softDeleteController from './servers/controllers/soft-delete-controller';
import routes from './servers/routes';

export default {
  /**
   * Register phase - called when Strapi starts
   * Set up schema extensions and service decorations
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Add soft delete fields to all content type schemas
    addSoftDeleteFields(strapi);

    // Decorate entity service methods for soft delete behavior
    decorateEntityService(strapi);

    strapi.log.info('[soft-delete-custom] Plugin registered successfully');
  },

  /**
   * Bootstrap phase - called after all plugins are registered
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Initialize services
    strapi.plugin('soft-delete-custom').service('restore', () => createRestoreService(strapi));
    strapi.plugin('soft-delete-custom').service(
      'permanent-delete',
      () => createPermanentDeleteService(strapi)
    );

    strapi.log.info('[soft-delete-custom] Plugin bootstrapped successfully');
  },

  /**
   * Server-side configuration
   */
  async server() {
    return {
      routes,
      controllers: {
        'soft-delete-controller': softDeleteController,
      },
      services: {
        restore: createRestoreService,
        'permanent-delete': createPermanentDeleteService,
      },
      policies: {
        hasPermission: (policyContext: any, config: any) => {
          const { permission } = config;
          const user = policyContext.state.user;

          if (!user) {
            return false;
          }

          // Check if user has the required permission
          // This is a simplified check - in production you'd use Strapi's permission system
          return user.role?.permissions?.some((p: any) => p.action === permission);
        },
      },
    };
  },

  /**
   * Admin panel configuration
   */
  async admin() {
    return {
      // Admin panel will be configured in src/admin/index.ts
    };
  },
};
