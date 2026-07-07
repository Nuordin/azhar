import { setupI18n } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data }) => {
	// Pass the pre-fetched array of languages into the setup function
	await setupI18n(fetch, data.locale, data.availableLanguages);

	return {
		locale: data.locale,
		availableLanguages: data.availableLanguages
	};
};
