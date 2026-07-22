import fs from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';
import { LOCALES_DIR, getAvailableLocales } from '$lib/i18n/locales.server';
import type { RequestHandler } from './$types';

// The endpoint URL carries the full metadata form, e.g. /api/locales/ar-العربية-rtl.json
// so `params.lang` is the full `[code]-[nativeName]-[dir]` stem, not the short code.
export const GET: RequestHandler = ({ params }) => {
	const { lang } = params;

	if (!lang) {
		throw error(400, 'Language parameter is required');
	}

	// Only serve files that correspond to a discovered locale (defense-in-depth + no arbitrary reads).
	const isKnown = getAvailableLocales().some((l) => l.slug === lang);
	if (!isKnown) {
		throw error(404, `Translation file for ${lang} not found`);
	}

	const filePath = path.resolve(LOCALES_DIR, `${lang}.json`);

	if (!filePath.startsWith(LOCALES_DIR)) {
		throw error(403, 'Forbidden path');
	}

	try {
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		return Response.json(JSON.parse(fileContent));
	} catch {
		throw error(404, `Translation file for ${lang} not found`);
	}
};
