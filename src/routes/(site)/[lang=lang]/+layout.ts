import { setupI18n } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data }) => {
	// Pass the discovered locale metadata into the svelte-i18n setup.
	await setupI18n(fetch, data.locale, data.availableLanguages);

	return {
		locale: data.locale,
		dir: data.dir,
		availableLanguages: data.availableLanguages
	};
};
