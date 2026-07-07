// TODO: Improve How the locale loading works
// make the language JSON file [lang]-[dir]-[native-spelling].json
import { init, register, addMessages } from 'svelte-i18n';

type FetchFn = typeof globalThis.fetch;

export async function setupI18n(
	customFetch: FetchFn,
	activeLocale: string,
	availableLanguages: string[]
): Promise<void> {
	const primaryLocale = availableLanguages.includes(activeLocale) ? activeLocale : 'ar';

	// 1. EAGER LOAD the active language
	const activeRes = await customFetch(`/api/locales/${primaryLocale}.json`);
	const activeDictionary = await activeRes.json();
	addMessages(primaryLocale, activeDictionary);

	// 2. LAZY LOAD the rest using the array passed from the server
	availableLanguages.forEach((lang: string) => {
		if (lang !== primaryLocale) {
			register(lang, () => customFetch(`/api/locales/${lang}.json`).then((res) => res.json()));
		}
	});

	init({
		fallbackLocale: 'ar',
		initialLocale: primaryLocale
	});
}
