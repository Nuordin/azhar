import { db } from '$lib/server/db';
import {
	blogs,
	blogTranslations,
	media,
	projects,
	projectTranslations,
	locations,
	locationTranslations
} from '$lib/server/db/schema';
import { and, asc, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

// شكل بطاقة المشروع كما يتوقعه ProjectCard
const projectCardSelect = {
	id: projects.id,
	title: projectTranslations.title,
	description: projectTranslations.description,
	developer: projectTranslations.developerName,
	city: locationTranslations.name,
	constructionStatus: projects.constructionStatus,
	completionPercentage: projects.completionPercentage,
	startingPrice: projects.startingPrice,
	deliveryDate: projects.deliveryDate,
	isFeatured: projects.isFeatured,
	image: media.url
};

type ProjectCardRow = {
	id: number;
	title: string | null;
	description: string | null;
	developer: string | null;
	city: string | null;
	constructionStatus: 'off_plan' | 'under_construction' | 'ready' | null;
	completionPercentage: string | null;
	startingPrice: number | null;
	deliveryDate: number | Date | null;
	isFeatured: boolean;
	image: string | null;
};

const shape = (rows: ProjectCardRow[]) =>
	rows.map((p) => ({
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

export const load: PageServerLoad = async ({ params }) => {
	const LOCALE = params.lang;
	// المشاريع المميّزة (تُعرض في قسم "عقارات مميزة")
	const featuredRows: ProjectCardRow[] = await db
		.select(projectCardSelect)
		.from(projects)
		.innerJoin(
			projectTranslations,
			and(eq(projects.id, projectTranslations.projectId), eq(projectTranslations.locale, LOCALE))
		)
		.leftJoin(
			locationTranslations,
			and(eq(projects.locationId, locationTranslations.locationId), eq(locationTranslations.locale, LOCALE))
		)
		.leftJoin(media, and(eq(projects.id, media.projectId), eq(media.isMain, true)))
		.where(and(eq(projects.isPublished, true), eq(projects.isFeatured, true)))
		.orderBy(asc(projects.featuredOrder), desc(projects.createdAt))
		.limit(6);

	// أحدث المشاريع (تُعرض في قسم "أحدث المشاريع")
	const latestRows: ProjectCardRow[] = await db
		.select(projectCardSelect)
		.from(projects)
		.innerJoin(
			projectTranslations,
			and(eq(projects.id, projectTranslations.projectId), eq(projectTranslations.locale, LOCALE))
		)
		.leftJoin(
			locationTranslations,
			and(eq(projects.locationId, locationTranslations.locationId), eq(locationTranslations.locale, LOCALE))
		)
		.leftJoin(media, and(eq(projects.id, media.projectId), eq(media.isMain, true)))
		.where(eq(projects.isPublished, true))
		.orderBy(desc(projects.createdAt))
		.limit(3);

	// أحدث مقالات المدونة المنشورة (قسم "أحدث المقالات")
	const latestBlogs = await db
		.select({
			id: blogs.id,
			category: blogs.category,
			publishedAt: blogs.publishedAt,
			title: blogTranslations.title,
			excerpt: blogTranslations.excerpt,
			image: media.url
		})
		.from(blogs)
		.innerJoin(blogTranslations, and(eq(blogs.id, blogTranslations.blogId), eq(blogTranslations.locale, LOCALE)))
		.leftJoin(media, and(eq(blogs.id, media.blogId), eq(media.isMain, true)))
		.where(eq(blogs.isPublished, true))
		.orderBy(desc(blogs.publishedAt), desc(blogs.createdAt))
		.limit(3);

	// قائمة المواقع المنشورة لعنصر البحث في الصفحة الرئيسية (القيمة = معرّف الموقع)
	const searchLocationRows = await db
		.select({ id: locations.id, name: locationTranslations.name })
		.from(locations)
		.innerJoin(
			locationTranslations,
			and(eq(locations.id, locationTranslations.locationId), eq(locationTranslations.locale, LOCALE))
		)
		.where(eq(locations.isPublished, true))
		.orderBy(asc(locationTranslations.name));

	const featuredProjects = shape(featuredRows);
	// إن لم توجد مشاريع مميّزة، اعرض أحدث المشاريع بدل ترك القسم فارغاً
	return {
		featuredProjects: featuredProjects.length > 0 ? featuredProjects : shape(latestRows),
		latestProjects: shape(latestRows),
		blogs: latestBlogs,
		searchLocations: searchLocationRows
	};
};
