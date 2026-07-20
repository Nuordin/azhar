import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function GET({ params }) {
	const { fileName } = params;
	const filePath = path.join(process.cwd(), '..', 'ASSETS', 'uploads', fileName);

	try {
		const fileBuffer = await fs.readFile(filePath);
		const ext = path.extname(fileName).toLowerCase();
		let contentType = 'application/octet-stream'; // نوع افتراضي
		if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
		else if (ext === '.png') contentType = 'image/png';
		else if (ext === '.webp') contentType = 'image/webp';
		else if (ext === '.avif') contentType = 'image/avif';
		else if (ext === '.gif') contentType = 'image/gif';
		else if (ext === '.svg') contentType = 'image/svg+xml';
		else if (ext === '.mp4') contentType = 'video/mp4';

		return new Response(fileBuffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (err) {
		console.error(err);
		throw error(404, 'الملف غير موجود');
	}
}
