import services from './services/index.js';
import bootstrap from './bootstrap.js';
import register from './register.js';
import destroy from './destroy.js';
import controllers from './controllers/index.js';
import routes from './routes/index.js';

export default {
  services,
  bootstrap,
  register,
  controllers,
  routes,
  destroy,
  config: {
    default: {},
    validator() {},
  },
  contentTypes: {},
  policies: {},
  middlewares: {},
};
