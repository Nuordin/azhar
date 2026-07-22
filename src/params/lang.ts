import { looksLikeLocale } from '$lib/i18n/config';
import type { ParamMatcher } from '@sveltejs/kit';

// Loose shape check only, so this segment doesn't shadow /dashboard, /api, /sitemap.xml, etc.
// The authoritative validation (against the discovered locale list) happens in
// (site)/[lang]/+layout.server.ts, which 404s on an unknown locale.
export const match: ParamMatcher = (param) => looksLikeLocale(param);
