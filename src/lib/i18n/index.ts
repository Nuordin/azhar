import { init, register, addMessages, locale as i18nLocale, waitLocale } from 'svelte-i18n';
import { DEFAULT_LOCALE, type Section } from './config';
import type { LocaleMeta } from './locales.server';

export { DEFAULT_LOCALE };
export type { Section };

type FetchFn = typeof globalThis.fetch;

/** بيانات اللغة المطلوبة من طرف العميل: الرمز القصير + مقطع اسم الملف الكامل. */
export type LocaleInfo = Pick<LocaleMeta, 'code' | 'nativeName' | 'dir' | 'slug'>;

// Initialize synchronously at module import so `$locale` is never null when a
// component (e.g. the layout nav using `$_`) first renders. Without this, `$_`
// can run before the async `setupI18n` reaches its locale set, throwing
// "[svelte-i18n] Cannot format a message without first setting the initial locale."
// The real active locale is applied from the URL in `setupI18n` below.
init({ fallbackLocale: DEFAULT_LOCALE, initialLocale: DEFAULT_LOCALE });

export async function setupI18n(
	customFetch: FetchFn,
	activeLocale: string,
	availableLocales: LocaleInfo[]
): Promise<void> {
	const active =
		availableLocales.find((l) => l.code === activeLocale) ??
		availableLocales.find((l) => l.code === DEFAULT_LOCALE) ??
		availableLocales[0];

	const primaryCode = active?.code ?? DEFAULT_LOCALE;

	// Eager-load the active dictionary. The svelte-i18n key stays the SHORT code
	// (it must match the URL [lang] prefix); the fetch URL uses the full slug.
	// Adding the messages up front means setting this locale is synchronous
	// (no pending loader queue → no deferred/null-locale window).
	if (active) {
		addMessages(primaryCode, await customFetch(`/api/locales/${active.slug}.json`).then((r) => r.json()));
	}

	// Lazily register the OTHER locales (re-registered each call so the loader
	// always uses the current request's `fetch`, which matters on the server).
	for (const loc of availableLocales) {
		if (loc.code !== primaryCode) {
			register(loc.code, () => customFetch(`/api/locales/${loc.slug}.json`).then((res) => res.json()));
		}
	}

	// Apply the requested locale and wait until it (and its dictionary) is ready,
	// so `load` doesn't resolve until components can safely format messages.
	await i18nLocale.set(primaryCode);
	await waitLocale(primaryCode);
}
