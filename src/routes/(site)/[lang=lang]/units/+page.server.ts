/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/server/db';
import { units, unitTranslations, media } from '$lib/server/db/schema';
import { and, asc, desc, eq, like, or, sql, type SQL } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const LIMIT = 12;

export const load: PageServerLoad = async ({ url, params }) => {
	const LOCALE = params.lang;
	const category = url.searchParams.get('category') ?? 'all';
	const type = url.searchParams.get('type') ?? 'all';
	const construction = url.searchParams.get('status') ?? 'all';
	const offer = url.searchParams.get('offer') ?? 'all';
	const priceRange = url.searchParams.get('price') ?? 'all';
	const sort = url.searchParams.get('sort') ?? 'all';
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const offset = (page - 1) * LIMIT;

	// اجمع شروط التصفية الفعّالة فقط
	const conditions: SQL[] = [eq(units.isPublished, true)];

	if (category !== 'all') conditions.push(eq(units.category, category as any));
	if (type !== 'all') conditions.push(eq(units.type, type as any));
	if (construction !== 'all') conditions.push(eq(units.constructionStatus, construction as any));
	if (offer !== 'all') conditions.push(eq(units.offerType, offer as any));

	if (priceRange !== 'all') {
		const [minStr, maxStr] = priceRange.split('-');
		const min = Number(minStr);
		const max = Number(maxStr);
		if (!isNaN(min) && min > 0) conditions.push(sql`${units.price} >= ${min}`);
		if (maxStr && !isNaN(max)) conditions.push(sql`${units.price} <= ${max}`);
	}

	if (q) {
		const term = `%${q}%`;
		const search = or(like(unitTranslations.title, term), like(unitTranslations.locationName, term));
		if (search) conditions.push(search);
	}

	const where = and(...conditions);

	// الترتيب
	const orderBy =
		sort === 'price_asc'
			? asc(units.price)
			: sort === 'price_desc'
				? desc(units.price)
				: sort === 'delivery'
					? asc(units.deliveryDate)
					: desc(units.createdAt);

	try {
		const rows = await db
			.select({
				id: units.id,
				title: unitTranslations.title,
				developer: unitTranslations.developer,
				description: unitTranslations.description,
				city: unitTranslations.locationName,
				category: units.category,
				type: units.type,
				offerType: units.offerType,
				constructionStatus: units.constructionStatus,
				completionPercentage: units.completionPercentage,
				price: units.price,
				bedrooms: units.bedrooms,
				bathrooms: units.bathrooms,
				area: units.area,
				deliveryDate: units.deliveryDate,
				image: media.url
			})
			.from(units)
			.innerJoin(unitTranslations, and(eq(units.id, unitTranslations.unitId), eq(unitTranslations.locale, LOCALE)))
			.leftJoin(media, and(eq(units.id, media.unitId), eq(media.isMain, true)))
			.where(where)
			.orderBy(orderBy)
			.limit(LIMIT)
			.offset(offset);

		const totalCount = await db.$count(units, where);
		const totalPages = Math.ceil(totalCount / LIMIT);

		return {
			units: rows,
			filters: { category, type, status: construction, offer, price: priceRange, sort, q },
			pagination: { totalCount, totalPages, currentPage: page, limit: LIMIT }
		};
	} catch (error) {
		console.error(error);
		return {
			units: [],
			filters: { category, type, status: construction, offer, price: priceRange, sort, q },
			pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit: LIMIT },
			error: 'تعذر تحميل الوحدات'
		};
	}
};
