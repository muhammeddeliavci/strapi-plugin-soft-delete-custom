import { Trash } from '@strapi/icons';
import permissions from './permissions';

export default {
  register(app: any) {
    // Register plugin menu link
    app.addMenuLink({
      to: '/plugins/soft-delete-custom',
      icon: Trash,
      intlLabel: {
        id: 'soft-delete-custom.plugin.name',
        defaultMessage: 'Soft Delete',
      },
      permissions: [
        {
          action: 'plugin::soft-delete-custom.read',
          subject: null,
        },
      ],
      Component: async () => {
        const component = await import('./soft-delete-explorer');
        return component.default;
      },
    });

    // Register permissions
    app.registerPlugin({
      id: 'soft-delete-custom',
      initializer: () => null,
      isReady: true,
      name: 'soft-delete-custom',
    });
  },

  bootstrap(app: any) {
    // Inject permissions into Strapi's permission system
    app.getPlugin('content-manager')?.injectContentManagerComponent?.('editView', {
      name: 'soft-delete-info',
      Component: () => null, // Placeholder for future content manager integration
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data,
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
