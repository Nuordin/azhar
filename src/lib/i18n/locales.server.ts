// Server-only: discovers the available languages by reading the dictionary
// filenames in ../ASSETS/Locales. The FILENAME is the single source of truth for
// which languages exist and their direction + native name:
//   [code]-[nativeName]-[dir].json   e.g.  ar-العربية-rtl.json   en-english-ltr.json
import fs from 'fs';
import path from 'path';

export const LOCALES_DIR = path.resolve(process.cwd(), '../ASSETS/Locales');

export interface LocaleMeta {
	/** short code, e.g. "ar" — used as the URL prefix and the svelte-i18n locale key */
	code: string;
	/** native display name, e.g. "العربية" — shown in the language switcher */
	nativeName: string;
	/** text direction */
	dir: 'rtl' | 'ltr';
	/** full filename stem `code-nativeName-dir` — used to build the /api/locales URL */
	slug: string;
}

/** يفكك اسم الملف `code-nativeName-dir` إلى بياناته الوصفية. */
function parseLocaleFilename(stem: string): LocaleMeta | null {
	const first = stem.indexOf('-');
	const last = stem.lastIndexOf('-');
	if (first === -1 || last === -1 || first === last) return null; // needs at least two hyphens

	const code = stem.slice(0, first);
	const nativeName = stem.slice(first + 1, last);
	const dir = stem.slice(last + 1);
	if (!code || !nativeName) return null;
	if (dir !== 'rtl' && dir !== 'ltr') return null;

	return { code, nativeName, dir, slug: stem };
}

let cache: LocaleMeta[] | null = null;

/** قائمة اللغات المتاحة (مقروءة من مجلد اللغات، مع تخزين مؤقت). */
export function getAvailableLocales(): LocaleMeta[] {
	if (cache) return cache;
	const result: LocaleMeta[] = [];
	try {
		for (const file of fs.readdirSync(LOCALES_DIR)) {
			if (!file.endsWith('.json')) continue;
			const meta = parseLocaleFilename(file.slice(0, -'.json'.length));
			if (meta) result.push(meta);
			else console.warn(`Ignoring malformed locale filename: ${file}`);
		}
	} catch (error) {
		console.error('Could not read locales directory:', error);
	}
	cache = result;
	return result;
}

/** يعيد البيانات الوصفية للغة برمزها القصير. */
export function getLocaleMeta(code: string): LocaleMeta | undefined {
	return getAvailableLocales().find((l) => l.code === code);
}

/** اتجاه اللغة (rtl/ltr) برمزها القصير. */
export function dirForLocale(code: string): 'rtl' | 'ltr' {
	return getLocaleMeta(code)?.dir ?? 'rtl';
}

/** المقطع الكامل `code-nativeName-dir` للغة برمزها القصير. */
export function localeSlug(code: string): string | undefined {
	return getLocaleMeta(code)?.slug;
}
