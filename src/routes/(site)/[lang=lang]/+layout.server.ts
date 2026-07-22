import { error } from '@sveltejs/kit';
import { getAvailableLocales } from '$lib/i18n/locales.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params, cookies }) => {
	const available = getAvailableLocales();

	// Authoritative locale validation (the [lang] matcher is only a shape check).
	const current = available.find((l) => l.code === params.lang);
	if (!current) {
		throw error(404, 'اللغة غير متوفرة');
	}

	// Remember the last-viewed locale so the root/legacy redirect can prefer it.
	cookies.set('locale', current.code, { path: '/', maxAge: 60 * 60 * 24 * 365 });

	return {
		locale: current.code,
		dir: current.dir,
		// only the fields the client needs (code/nativeName/dir/slug)
		availableLanguages: available.map(({ code, nativeName, dir, slug }) => ({
			code,
			nativeName,
			dir,
			slug
		}))
	};
};
