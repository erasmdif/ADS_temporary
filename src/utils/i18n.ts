/**
 * Site-side multilingual routing helpers.
 *
 * Deliberately not built on Astro's built-in `i18n` config: this project uses
 * a single `src/pages/[locale]/...` dynamic-route layer (one set of route
 * files, not one physical folder per locale), and Astro's automatic i18n
 * routing/fallback is tied to its own locale-folder convention and doesn't
 * support "render the default-locale content inline with a warning" the way
 * `localizeCollection` below does. Plain `[locale]` params are simpler to
 * reason about and keep this fully under our own control.
 */

export const LOCALES = ['en', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Display names for <LocaleSwitcher>, each written in its own language (not translated). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Splits a locale-prefixed collection entry id (e.g. "en/guides/foo") into its locale and the rest of the path. */
export function splitLocaleId(id: string): { locale: string; rest: string } {
  const slashIndex = id.indexOf('/');
  if (slashIndex === -1) return { locale: id, rest: '' };
  return { locale: id.slice(0, slashIndex), rest: id.slice(slashIndex + 1) };
}

export interface LocalizedEntry<T> {
  locale: Locale;
  /** The entry's path with the locale segment stripped — stable across locales for the same piece of content. */
  slug: string;
  entry: T;
  /** True when this locale has no translation of its own and `entry` is the default-locale content instead. */
  isFallback: boolean;
}

/**
 * Pairs every content-collection entry (id-prefixed with its locale, e.g.
 * "it/guides/foo") with every configured locale, falling back to
 * `DEFAULT_LOCALE`'s entry — with a build-time warning — when a locale has
 * no translation of its own for a given slug.
 */
export function localizeCollection<T extends { id: string }>(
  entries: T[],
  collectionName: string,
  locales: readonly Locale[] = LOCALES,
  defaultLocale: Locale = DEFAULT_LOCALE
): LocalizedEntry<T>[] {
  const bySlug = new Map<string, Map<string, T>>();
  for (const entry of entries) {
    const { locale, rest: slug } = splitLocaleId(entry.id);
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)!.set(locale, entry);
  }

  const result: LocalizedEntry<T>[] = [];
  for (const [slug, byLocale] of bySlug) {
    const fallbackEntry = byLocale.get(defaultLocale);
    for (const locale of locales) {
      const entry = byLocale.get(locale) ?? fallbackEntry;
      if (!entry) continue; // no translation in this locale, and no default-locale entry to fall back to
      const isFallback = !byLocale.has(locale);
      if (isFallback) {
        console.warn(`[i18n] Missing "${locale}" translation for ${collectionName}/${slug} — falling back to "${defaultLocale}".`);
      }
      result.push({ locale, slug, entry, isFallback });
    }
  }
  return result;
}

interface LinkLike {
  href?: string;
  match?: string;
  children?: LinkLike[];
}

/** Prepends `/{locale}` to every href/match in a menu tree, so menu.yaml itself stays locale-agnostic. */
export function withLocalePrefix<T extends LinkLike>(items: T[], locale: Locale): T[] {
  return items.map(item => ({
    ...item,
    href: item.href ? `/${locale}${item.href}` : item.href,
    match: item.match ? `/${locale}${item.match}` : item.match,
    children: item.children ? withLocalePrefix(item.children, locale) : undefined,
  }));
}
