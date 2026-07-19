/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/server/db';
import { projects, projectTranslations, media } from '$lib/server/db/schema';
import { and, asc, desc, eq, like, or, sql, type SQL } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const LOCALE = 'ar';
const LIMIT = 12;

type ProjectRow = {
	id: number;
	title: string | null;
	developer: string | null;
	description: string | null;
	city: string | null;
	constructionStatus: 'off_plan' | 'under_construction' | 'ready' | null;
	completionPercentage: string | null;
	startingPrice: number | null;
	deliveryDate: number | Date | null;
	isFeatured: boolean;
	image: string | null;
};

export const load: PageServerLoad = async ({ url }) => {
	const city = url.searchParams.get('city') ?? 'all';
	const construction = url.searchParams.get('status') ?? 'all';
	const priceRange = url.searchParams.get('price') ?? 'all';
	const sort = url.searchParams.get('sort') ?? 'all';
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const offset = (page - 1) * LIMIT;

	const conditions: SQL[] = [eq(projects.isPublished, true)];

	if (construction !== 'all') conditions.push(eq(projects.constructionStatus, construction as any));
	if (city !== 'all') conditions.push(eq(projectTranslations.locationName, city));

	if (priceRange !== 'all') {
		const [minStr, maxStr] = priceRange.split('-');
		const min = Number(minStr);
		const max = Number(maxStr);
		if (!isNaN(min) && min > 0) conditions.push(sql`${projects.startingPrice} >= ${min}`);
		if (maxStr && !isNaN(max)) conditions.push(sql`${projects.startingPrice} <= ${max}`);
	}

	if (q) {
		const term = `%${q}%`;
		const search = or(like(projectTranslations.title, term), like(projectTranslations.locationName, term));
		if (search) conditions.push(search);
	}

	const where = and(...conditions);

	const orderBy =
		sort === 'price_asc'
			? [asc(projects.startingPrice)]
			: sort === 'price_desc'
				? [desc(projects.startingPrice)]
				: sort === 'delivery'
					? [asc(projects.deliveryDate)]
					: [desc(projects.isFeatured), asc(projects.featuredOrder), desc(projects.createdAt)];

	try {
		const rows: ProjectRow[] = await db
			.select({
				id: projects.id,
				title: projectTranslations.title,
				developer: projectTranslations.developerName,
				description: projectTranslations.description,
				city: projectTranslations.locationName,
				constructionStatus: projects.constructionStatus,
				completionPercentage: projects.completionPercentage,
				startingPrice: projects.startingPrice,
				deliveryDate: projects.deliveryDate,
				isFeatured: projects.isFeatured,
				image: media.url
			})
			.from(projects)
			.leftJoin(
				projectTranslations,
				and(eq(projects.id, projectTranslations.projectId), eq(projectTranslations.locale, LOCALE))
			)
			.leftJoin(media, and(eq(projects.id, media.projectId), eq(media.isMain, true)))
			.where(where)
			.orderBy(...orderBy)
			.limit(LIMIT)
			.offset(offset);

		const projectList = rows.map((p) => ({
			id: p.id,
			title: p.title,
			description: p.description,
			developer: p.developer,
			city: p.city,
			image: p.image,
			constructionStatus: p.constructionStatus,
			completion: p.completionPercentage != null ? Number(p.completionPercentage) : null,
			startingPrice: p.startingPrice,
			deliveryYear: p.deliveryDate ? new Date(p.deliveryDate).getFullYear() : null,
			featured: p.isFeatured
		}));

		const totalCount = await db.$count(projects, where);
		const totalPages = Math.ceil(totalCount / LIMIT);

		// المدن المتاحة لعامل التصفية (قيم locationName الفريدة للمشاريع المنشورة)
		const cityRows = await db
			.selectDistinct({ city: projectTranslations.locationName })
			.from(projectTranslations)
			.innerJoin(projects, eq(projects.id, projectTranslations.projectId))
			.where(and(eq(projects.isPublished, true), eq(projectTranslations.locale, LOCALE)));
		const cities = cityRows.map((c) => c.city).filter((c): c is string => !!c);

		return {
			projects: projectList,
			cities,
			filters: { city, status: construction, price: priceRange, sort, q },
			pagination: { totalCount, totalPages, currentPage: page, limit: LIMIT }
		};
	} catch (error) {
		console.error(error);
		return {
			projects: [],
			cities: [],
			filters: { city, status: construction, price: priceRange, sort, q },
			pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit: LIMIT },
			error: 'تعذر تحميل المشاريع'
		};
	}
};
