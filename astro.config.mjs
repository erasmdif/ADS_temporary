import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import rehypeSlug from 'rehype-slug';
import { unified } from '@astrojs/markdown-remark';
import { userConfig } from './src/user.config.mjs';
import { scms } from '@lad-sapienza/scms-core/scms';

const coreAlias = {
  '@user': fileURLToPath(new URL('./src', import.meta.url)),
  '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
  '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
  '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
};

const {
  rehypePlugins: userRehypePlugins,
  remarkPlugins: userRemarkPlugins,
  remarkRehype: userRemarkRehype,
  ...userMarkdownConfig
} = userConfig.markdown || {};

export default defineConfig({
  srcDir: './src/ads',
  site: userConfig.site ?? 'https://scms.lad-sapienza.it/',
  base: userConfig.base,
  output: 'static',

  markdown: {
    ...userMarkdownConfig,
    processor: unified({
      remarkPlugins: [...(userRemarkPlugins || [])],
      rehypePlugins: [rehypeSlug, ...(userRehypePlugins || [])],
      ...(userRemarkRehype ? { remarkRehype: userRemarkRehype } : {}),
    }),
  },

  integrations: [
    ...scms({ contentDir: 'src/ads/content', pagesDir: 'src/ads/pages', galleriesDir: 'src/ads/galleries' }),
    ...(userConfig.integrations || []),
  ],

  vite: {
    ...(userConfig.vite || {}),
    esbuild: {
      target: 'es2022',
      ...(userConfig.vite?.esbuild || {}),
    },
    resolve: {
      ...(userConfig.vite?.resolve || {}),
      alias: {
        ...coreAlias,
        ...(userConfig.vite?.resolve?.alias || {}),
      },
    },
  },
});
