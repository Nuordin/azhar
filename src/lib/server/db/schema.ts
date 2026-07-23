import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, type AnySQLiteColumn, real } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text('role'),
	banned: integer('banned', { mode: 'boolean' }).default(false),
	banReason: text('ban_reason'),
	banExpires: integer('ban_expires', { mode: 'timestamp_ms' })
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		scope: text('scope'),
		password: text('password'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

// Projects & Properties and their images taples start here

export const projects = sqliteTable(
	'projects',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		parentId: integer('parent_id').references((): AnySQLiteColumn => projects.id, {
			onDelete: 'cascade'
		}),
		ownershipType: text('ownership_type', { enum: ['omani_only', 'gcc_only', 'all_nationalities'] }).notNull(),
		constructionStatus: text('construction_status', { enum: ['off_plan', 'under_construction', 'ready'] }).notNull(),
		completionPercentage: text('completion_percentage', { enum: ['0', '25', '50', '75', '100'] }).default('0'),
		totalArea: real('total_area'),
		startingPrice: integer('starting_price'),
		deliveryDate: integer('delivery_date', { mode: 'timestamp_ms' }),
		latitude: real('latitude'),
		longitude: real('longitude'),
		locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
		isPublished: integer('is_published', { mode: 'boolean' }).default(true).notNull(),
		isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
		featuredOrder: integer('featured_order').default(0),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('projects_parentId_idx').on(table.parentId), index('projects_locationId_idx').on(table.locationId)]
);

export const projectTranslations = sqliteTable(
	'project_translations',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		projectId: integer('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		title: text('title').notNull(),
		description: text('description').notNull(),
		developerName: text('developer_name').notNull(),
		amenities: text('amenities', { mode: 'json' }),
		paymentPlans: text('payment_plans', { mode: 'json' }),
		details: text('details', { mode: 'json' })
	},
	(table) => [
		index('project_translations_projectId_idx').on(table.projectId),
		index('project_translations_locale_idx').on(table.locale)
	]
);

export const units = sqliteTable(
	'units',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
		type: text('type', {
			enum: [
				'apartment',
				'standalone_villa',
				'twin_villa',
				'townhouse',
				'penthouse',
				'duplex',
				'studio',
				'office',
				'retail',
				'showroom',
				'whole_building',
				'residential_land',
				'commercial_land',
				'residential_commercial_land',
				'industrial_land',
				'agricultural_land',
				'chalet',
				'istiraha',
				'hotel_apartment',
				'warehouse',
				'labour_camp'
			]
		}).notNull(),
		status: text('status', { enum: ['available', 'reserved', 'sold'] })
			.notNull()
			.default('available'),
		category: text('category', { enum: ['residential', 'commercial', 'mixed', 'land', 'industrial'] }).notNull(),
		completionPercentage: text('completion_percentage', { enum: ['0', '25', '50', '75', '100'] }).default('0'),
		constructionStatus: text('construction_status', { enum: ['off_plan', 'under_construction', 'ready'] }).notNull(),
		ownershipType: text('ownership_type', { enum: ['omani_only', 'gcc_only', 'all_nationalities'] }).notNull(),
		offerType: text('offer_type', { enum: ['rent', 'sale'] }).notNull(),
		price: integer('price'),
		area: real('area'),
		bedrooms: integer('bedrooms'),
		bathrooms: integer('bathrooms'),
		deliveryDate: integer('delivery_date', { mode: 'timestamp_ms' }),
		locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
		isPublished: integer('is_published', { mode: 'boolean' }).default(true).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('units_projectId_idx').on(table.projectId), index('units_locationId_idx').on(table.locationId)]
);

export const unitTranslations = sqliteTable(
	'unit_translations',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		unitId: integer('unit_id')
			.notNull()
			.references(() => units.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		title: text('title').notNull(),
		developer: text('developer').notNull(),
		description: text('description').notNull(),
		amenities: text('amenities', { mode: 'json' }),
		paymentPlans: text('payment_plans', { mode: 'json' }),
		details: text('details', { mode: 'json' })
	},
	(table) => [
		index('unit_translations_unitId_idx').on(table.unitId),
		index('unit_translations_locale_idx').on(table.locale)
	]
);

// Locations: a translatable, self-referencing entity following Oman's
// administrative hierarchy (governorate > wilayat > city > district).
// إحداثيات المشروع/الوحدة تبقى على جدوليهما — الموقع كيان مرجعي فقط.
export const locations = sqliteTable(
	'locations',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		parentId: integer('parent_id').references((): AnySQLiteColumn => locations.id, {
			onDelete: 'set null'
		}),
		type: text('type', { enum: ['governorate', 'wilayat', 'city', 'district'] }).notNull(),
		// علامة تمهيدية لصفحة الموقع المخصّصة (تُبنى لاحقاً)
		hasDedicatedPage: integer('has_dedicated_page', { mode: 'boolean' }).default(false).notNull(),
		isPublished: integer('is_published', { mode: 'boolean' }).default(true).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('locations_parentId_idx').on(table.parentId), index('locations_type_idx').on(table.type)]
);

export const locationTranslations = sqliteTable(
	'location_translations',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		locationId: integer('location_id')
			.notNull()
			.references(() => locations.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		name: text('name').notNull()
		// description مؤجّل إلى مهمة صفحة الموقع المخصّصة
	},
	(table) => [
		index('location_translations_locationId_idx').on(table.locationId),
		index('location_translations_locale_idx').on(table.locale)
	]
);

export const blogs = sqliteTable('blogs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	category: text('category', {
		enum: ['real_estate_tips', 'market_news', 'development', 'investment', 'company_news']
	})
		.notNull()
		.default('real_estate_tips'),
	// المقالات تُنشأ كمسودات غير منشورة (بعكس المشاريع والوحدات)
	isPublished: integer('is_published', { mode: 'boolean' }).default(false).notNull(),
	// يُحدد عند أول نشر فقط ولا يُعاد تعيينه بعد ذلك
	publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const blogTranslations = sqliteTable(
	'blog_translations',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		blogId: integer('blog_id')
			.notNull()
			.references(() => blogs.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		title: text('title').notNull(),
		excerpt: text('excerpt').notNull(),
		// نص المقال بصيغة Markdown، يُحوَّل إلى HTML آمن على الخادم
		content: text('content').notNull()
	},
	(table) => [
		index('blog_translations_blogId_idx').on(table.blogId),
		index('blog_translations_locale_idx').on(table.locale)
	]
);

export const media = sqliteTable(
	'media',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
		unitId: integer('unit_id').references(() => units.id, { onDelete: 'cascade' }),
		blogId: integer('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
		url: text('url').notNull(),
		type: text('type', { enum: ['image', 'video'] })
			.notNull()
			.default('image'),
		isMain: integer('is_main', { mode: 'boolean' }).default(false).notNull(),
		sortOrder: integer('sort_order').default(0),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('media_projectId_idx').on(table.projectId),
		index('media_unitId_idx').on(table.unitId),
		index('media_blogId_idx').on(table.blogId)
	]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
	parent: one(projects, {
		fields: [projects.parentId],
		references: [projects.id],
		relationName: 'project_parent_children'
	}),
	children: many(projects, {
		relationName: 'project_parent_children'
	}),
	location: one(locations, {
		fields: [projects.locationId],
		references: [locations.id]
	}),
	translations: many(projectTranslations),
	units: many(units),
	media: many(media)
}));

export const projectTranslationsRelations = relations(projectTranslations, ({ one }) => ({
	project: one(projects, {
		fields: [projectTranslations.projectId],
		references: [projects.id]
	})
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
	project: one(projects, {
		fields: [units.projectId],
		references: [projects.id]
	}),
	location: one(locations, {
		fields: [units.locationId],
		references: [locations.id]
	}),
	translations: many(unitTranslations),
	media: many(media)
}));

export const unitTranslationsRelations = relations(unitTranslations, ({ one }) => ({
	unit: one(units, {
		fields: [unitTranslations.unitId],
		references: [units.id]
	})
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
	parent: one(locations, {
		fields: [locations.parentId],
		references: [locations.id],
		relationName: 'location_parent_children'
	}),
	children: many(locations, {
		relationName: 'location_parent_children'
	}),
	translations: many(locationTranslations),
	projects: many(projects),
	units: many(units)
}));

export const locationTranslationsRelations = relations(locationTranslations, ({ one }) => ({
	location: one(locations, {
		fields: [locationTranslations.locationId],
		references: [locations.id]
	})
}));

export const mediaRelations = relations(media, ({ one }) => ({
	project: one(projects, {
		fields: [media.projectId],
		references: [projects.id]
	}),
	unit: one(units, {
		fields: [media.unitId],
		references: [units.id]
	}),
	blog: one(blogs, {
		fields: [media.blogId],
		references: [blogs.id]
	})
}));

export const blogsRelations = relations(blogs, ({ many }) => ({
	translations: many(blogTranslations),
	media: many(media)
}));

export const blogTranslationsRelations = relations(blogTranslations, ({ one }) => ({
	blog: one(blogs, {
		fields: [blogTranslations.blogId],
		references: [blogs.id]
	})
}));
