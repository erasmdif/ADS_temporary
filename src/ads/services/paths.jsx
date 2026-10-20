import React from 'react';

export function localUrl(path = '/') {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (base && (path === base || path.startsWith(base + '/'))) return path;
  return base + '/' + path.replace(/^\//, '');
}
export const assetUrl = localUrl;

// Gatsby Link replacement: ordinary links work with static Astro routes.
export function Link({ to, children, ...props }) {
  return <a href={localUrl(to)} {...props}>{children}</a>;
}
