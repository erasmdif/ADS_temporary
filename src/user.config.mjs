import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
const deploymentEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'ADS_');
export const userConfig = {
  site: 'https://erasmdif.github.io/ADS_temporary',
  base: '/ADS_temporary',
  i18n: { defaultLocale: 'it', locales: ['it'] },
  integrations: [],
  vite: { ssr: { noExternal: ['rc-slider'] }, resolve: { alias: {
    '@user': fileURLToPath(new URL('./ads', import.meta.url)),
    '@components': fileURLToPath(new URL('./ads/components', import.meta.url)),
    '@layouts': fileURLToPath(new URL('./ads/layouts', import.meta.url)),
    '@content': fileURLToPath(new URL('./ads/content', import.meta.url)),
  } } },
};
export const siteMetadata = {
  title: 'ADS', titleTemplate: '%s | ADS',
  description: 'Archivio Digitale Sabino',
  author: 'Erasmo di Fonso <erasmo.difonso@libero.it>',
  siteName: 'ADS: Archivio Digitale Sabino',
  defaultImage: '/images/logo_ADS.png',
};
