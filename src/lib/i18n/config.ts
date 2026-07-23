// Universal i18n config (safe on both server and client — no Node APIs).
// The authoritative list of languages is NOT hardcoded here; it is discovered
// at runtime from the dictionary filenames in ../ASSETS/Locales (see locales.server.ts).
// Adding a language must stay zero-rebuild, so nothing in this file may enumerate locales.

export const DEFAULT_LOCALE = 'ar';

/** Public sections that live under a `[lang]` prefix. Segment names stay English in the URL. */
export type Section = 'projects' | 'units' | 'blogs';

/**
 * فحص شكل رمز اللغة فقط (حرفان أو ثلاثة). القائمة المعتمدة تُكتشف وقت التشغيل.
 * Shape check only — used by the `[lang]` param matcher so it doesn't shadow
 * `dashboard`/`api`/`sitemap.xml`. Real validation happens against the discovered list.
 */
export const looksLikeLocale = (p: string): boolean => /^[a-z]{2,3}$/.test(p);

/** يبني رابط تفاصيل `/{locale}/{section}/{slug}-{id}` مع ترميز المقطع النصي. */
export function localizedPath(locale: string, section: Section, slug: string, id: number | string): string {
	return `/${locale}/${section}/${encodeURIComponent(slug)}-${id}`;
}

/** يبني رابط قائمة القسم `/{locale}/{section}`. */
export function sectionListPath(locale: string, section: Section): string {
	return `/${locale}/${section}`;
}

/** يبني بادئة اللغة `/{locale}` (الصفحة الرئيسية). */
export function localeHome(locale: string): string {
	return `/${locale}`;
}

/**
 * يبدّل مقطع اللغة في المسار الحالي مع الحفاظ على بقية المسار.
 * في صفحات التفاصيل يبقى المقطع النصي بلغة المصدر؛ يتكفّل مُحمّل الصفحة بإعادة
 * التوجيه (301) إلى المقطع الصحيح للغة الهدف أو 404 إن لم تتوفر الترجمة.
 */
export function switchLocalePath(pathname: string, targetLocale: string): string {
	const parts = pathname.split('/');
	if (parts.length > 1 && parts[1]) {
		parts[1] = targetLocale;
		return parts.join('/');
	}
	return `/${targetLocale}`;
}
