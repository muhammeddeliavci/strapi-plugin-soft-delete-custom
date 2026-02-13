import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'strapi-server': 'src/server/index.ts',
    'strapi-admin': 'src/admin/src/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs'
    };
  },
  external: [
    '@strapi/strapi',
    '@strapi/design-system',
    '@strapi/icons',
    'react',
    'react-dom',
    'react-router-dom',
    'styled-components'
  ]
});
