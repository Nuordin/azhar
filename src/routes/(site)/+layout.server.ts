import fs from 'fs';
import path from 'path';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

const LOCALES_DIR = path.resolve(process.cwd(), '../ASSETS/Locales');

export const load: LayoutServerLoad = ({ cookies }) => {
	// 1. Get the active locale (from cookies or headers)
	let activeLocale = cookies.get('locale');
	if (!activeLocale) {
		activeLocale = 'ar';
	}

	// 2. Read the filesystem directly (No API fetch needed!)
	let availableLanguages: string[] = [];
	try {
		const files = fs.readdirSync(LOCALES_DIR);
		availableLanguages = files.filter((file) => file.endsWith('.json')).map((file) => file.replace('.json', ''));
	} catch (error) {
		console.error('Could not read locales directory:', error);
	}

	redirect(302, '/dashboard/properties');
	// Pass both the active language AND the array of available languages down
	return {
		locale: activeLocale,
		availableLanguages
	};
};
