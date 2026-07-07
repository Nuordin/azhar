import fs from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const LOCALES_DIR = path.resolve(process.cwd(), '../ASSETS/Locales');
export const GET: RequestHandler = ({ params }) => {
	const { lang } = params;

	if (!lang) {
		throw error(400, 'Language parameter is required');
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
