import { PLUGIN_ID } from './pluginId.js';
import { Trash } from '@strapi/icons';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: Trash,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Soft Deleted',
      },
      Component: async () => {
        const { Explorer } = await import('./pages/Explorer/index.js');
        return Explorer;
      },
      permissions: [
        {
          action: 'plugin::soft-delete.read',
          subject: null,
        },
      ],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'soft-delete',
    });
  },

  async bootstrap(app: any) {},
};
