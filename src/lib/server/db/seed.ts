// src/lib/server/db/seed.ts
// بذرة بيانات تجريبية: تحذف المشاريع والوحدات ووسائطها وترجماتها (دون المساس بحساب المدير)
// ثم تُنشئ 20 مشروعاً و40 وحدة ببيانات عربية وصور بديلة.
// التشغيل:  pnpm db:seed   (يعتمد على db + schema فقط، لا يحتاج وقت تشغيل SvelteKit)
import 'dotenv/config';
import { db } from './index';
import { projects, projectTranslations, units, unitTranslations, media } from './schema';

// مولّد أرقام شبه عشوائي ثابت لضمان تكرار نفس النتائج
function mulberry32(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rand = mulberry32(20260720);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const shuffle = <T>(arr: T[]): T[] => {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

// صور بديلة (منسوخة من src/lib/assets/tmp إلى ASSETS/uploads)
const PLACEHOLDER_IMAGES = ['/uploads/seed-1.avif', '/uploads/seed-2.avif', '/uploads/seed-3.avif'];

const cities = [
	'مسقط',
	'صلالة',
	'صحار',
	'نزوى',
	'صور',
	'قريات',
	'البريمي',
	'الرستاق',
	'بركاء',
	'عبري',
	'السيب',
	'بوشر'
];
const developers = [
	'شركة الأزهر العقارية',
	'المسار الموحد العقارية',
	'مجموعة الخليج للتطوير',
	'إعمار عُمان',
	'دار جلوبل للتطوير',
	'مجموعة ظفار العقارية',
	'الأزهر للاستثمار'
];
const projectPrefixes = [
	'واحة',
	'تلال',
	'برج',
	'ضفاف',
	'مرتفعات',
	'حدائق',
	'بوابة',
	'نسيم',
	'لؤلؤة',
	'مجمع',
	'مروج',
	'أفق'
];

const amenitiesPool = [
	{ title: 'أمن وحراسة على مدار الساعة', icon: 'ShieldCheck' },
	{ title: 'نادٍ رياضي مجهّز', icon: 'Dumbbell' },
	{ title: 'مسبح إنفينيتي', icon: 'WavesHorizontal' },
	{ title: 'مواقف سيارات خاصة', icon: 'CircleParking' },
	{ title: 'حدائق ومساحات خضراء', icon: 'TreePine' },
	{ title: 'منطقة لعب أطفال', icon: 'Baby' },
	{ title: 'مطاعم ومقاهٍ', icon: 'UtensilsCrossed' },
	{ title: 'مسارات مشي', icon: 'Footprints' },
	{ title: 'مركز تسوّق', icon: 'Handbag' },
	{ title: 'مظلات ومناطق استراحة', icon: 'Parasol' },
	{ title: 'مسارات دراجات', icon: 'Bike' },
	{ title: 'برج مراقبة وإطلالة', icon: 'TowerControl' }
];

const projectDescriptions = [
	'مجتمع سكني متكامل يجمع بين الرفاهية والخصوصية، بتصاميم عصرية ومساحات خضراء واسعة تطل على أجمل المواقع.',
	'وجهة عمرانية مميّزة توفّر أسلوب حياة راقٍ مع مرافق متكاملة وخدمات على مستوى عالٍ في قلب المدينة.',
	'مشروع رائد يعيد تعريف المعيشة الحديثة عبر وحدات مصمّمة بعناية ومرافق ترفيهية ومساحات مفتوحة.',
	'مجمّع فاخر بموقع استراتيجي قريب من الخدمات والطرق الرئيسية، مثالي للسكن والاستثمار على حدّ سواء.'
];
const unitDescriptions = [
	'وحدة أنيقة بتشطيبات فاخرة وإطلالات مفتوحة، توفّر مساحة معيشة مريحة تناسب العائلات العصرية.',
	'خيار مثالي لمن يبحث عن الجودة والموقع، بتصميم عملي يستفيد من كل مساحة وإضاءة طبيعية وفيرة.',
	'وحدة بمواصفات راقية ضمن مجتمع متكامل الخدمات، جاهزة لتلبية تطلعاتك السكنية أو الاستثمارية.',
	'مساحة مصمّمة بذوق رفيع مع أفضل الخامات، وقربها من المرافق يجعلها فرصة لا تُفوّت.'
];

const ownershipTypes = ['omani_only', 'gcc_only', 'all_nationalities'] as const;
const constructionStatuses = ['off_plan', 'under_construction', 'ready'] as const;
const completionByStatus: Record<string, ('0' | '25' | '50' | '75' | '100')[]> = {
	off_plan: ['0', '25'],
	under_construction: ['50', '75'],
	ready: ['100']
};

const unitTypes = [
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
] as const;
type UnitType = (typeof unitTypes)[number];

const typeLabels: Record<UnitType, string> = {
	apartment: 'شقة',
	standalone_villa: 'فيلا مستقلة',
	twin_villa: 'توين فيلا',
	townhouse: 'تاون هاوس',
	penthouse: 'بنتهاوس',
	duplex: 'دوبلكس',
	studio: 'استوديو',
	office: 'مكتب',
	retail: 'محل تجاري',
	showroom: 'معرض',
	whole_building: 'مبنى كامل',
	residential_land: 'أرض سكنية',
	commercial_land: 'أرض تجارية',
	residential_commercial_land: 'أرض سكنية تجارية',
	industrial_land: 'أرض صناعية',
	agricultural_land: 'أرض زراعية',
	chalet: 'شاليه',
	istiraha: 'استراحة',
	hotel_apartment: 'شقة فندقية',
	warehouse: 'مستودع',
	labour_camp: 'سكن عمال'
};
const typeCategory: Record<UnitType, 'residential' | 'commercial' | 'mixed' | 'land' | 'industrial'> = {
	apartment: 'residential',
	standalone_villa: 'residential',
	twin_villa: 'residential',
	townhouse: 'residential',
	penthouse: 'residential',
	duplex: 'residential',
	studio: 'residential',
	chalet: 'residential',
	istiraha: 'residential',
	hotel_apartment: 'residential',
	office: 'commercial',
	retail: 'commercial',
	showroom: 'commercial',
	whole_building: 'commercial',
	residential_land: 'land',
	commercial_land: 'land',
	agricultural_land: 'land',
	residential_commercial_land: 'mixed',
	industrial_land: 'industrial',
	warehouse: 'industrial',
	labour_camp: 'industrial'
};
const hasRooms = (t: UnitType) => typeCategory[t] === 'residential';

const paymentPlans = [
	{ title: 'دفعة الحجز', description: '10% عند توقيع العقد' },
	{ title: 'أثناء الإنشاء', description: '40% على أقساط ربع سنوية' },
	{ title: 'عند التسليم', description: '50% دفعة أخيرة' }
];

function mediaRows(target: { projectId?: number; unitId?: number }) {
	const imgs = shuffle(PLACEHOLDER_IMAGES).slice(0, int(2, 3));
	return imgs.map((url, i) => ({
		...target,
		url,
		type: 'image' as const,
		isMain: i === 0,
		sortOrder: i
	}));
}

function deliveryFor(status: (typeof constructionStatuses)[number]) {
	const now = new Date();
	if (status === 'ready') return new Date(now.getFullYear() - int(0, 1), int(0, 11), 1 + int(0, 27));
	if (status === 'under_construction') return new Date(now.getFullYear() + int(1, 2), int(0, 11), 1 + int(0, 27));
	return new Date(now.getFullYear() + int(2, 3), int(0, 11), 1 + int(0, 27));
}

function main() {
	console.log('🌱 حذف البيانات القديمة (مع الحفاظ على حساب المدير)...');
	db.delete(media).run();
	db.delete(unitTranslations).run();
	db.delete(units).run();
	db.delete(projectTranslations).run();
	db.delete(projects).run();

	const NUM_PROJECTS = 20;
	const NUM_UNITS = 40;

	const projectMeta: { id: number; title: string; city: string }[] = [];

	console.log(`🏗️  إنشاء ${NUM_PROJECTS} مشروعاً...`);
	for (let i = 0; i < NUM_PROJECTS; i++) {
		const city = pick(cities);
		const developer = pick(developers);
		const title = `${pick(projectPrefixes)} ${city} ${pick(['السكني', 'الفاخر', 'الجديد', 'بلازا', 'ريزيدنس', 'هايتس'])}`;
		const status = pick([...constructionStatuses]);
		const completion = pick(completionByStatus[status]);
		const isFeatured = i < 6; // أول 6 مشاريع مميّزة
		const startingPrice = int(25, 250) * 1000;

		const { id } = db
			.insert(projects)
			.values({
				ownershipType: pick([...ownershipTypes]),
				constructionStatus: status,
				completionPercentage: completion,
				totalArea: int(2, 60) * 1000,
				startingPrice,
				deliveryDate: deliveryFor(status),
				isPublished: true,
				isFeatured,
				featuredOrder: isFeatured ? i : 0
			})
			.returning({ id: projects.id })
			.get();

		db.insert(projectTranslations)
			.values({
				projectId: id,
				locale: 'ar',
				title,
				description: pick(projectDescriptions),
				locationName: city,
				developerName: developer,
				amenities: shuffle(amenitiesPool).slice(0, int(4, 6)),
				paymentPlans,
				details: [
					{ title: 'المطوّر', description: developer },
					{ title: 'المدينة', description: city },
					{ title: 'عدد الوحدات', description: `${int(20, 300)} وحدة` }
				]
			})
			.run();

		db.insert(media)
			.values(mediaRows({ projectId: id }))
			.run();
		projectMeta.push({ id, title, city });
	}

	console.log(`🏠 إنشاء ${NUM_UNITS} وحدة...`);
	for (let i = 0; i < NUM_UNITS; i++) {
		const parent = projectMeta[i % NUM_PROJECTS]; // وحدتان لكل مشروع
		const type = pick([...unitTypes]);
		const offer = pick(['rent', 'sale'] as const);
		const status = pick([...constructionStatuses]);
		const rooms = hasRooms(type);
		const price = offer === 'rent' ? int(2, 20) * 100 : int(30, 400) * 1000;
		const typeLabel = typeLabels[type];

		const { id } = db
			.insert(units)
			.values({
				projectId: parent.id,
				type,
				status: pick(['available', 'reserved', 'sold'] as const),
				category: typeCategory[type],
				completionPercentage: pick(completionByStatus[status]),
				constructionStatus: status,
				ownershipType: pick([...ownershipTypes]),
				offerType: offer,
				price,
				area: int(60, 600),
				bedrooms: rooms ? int(1, 5) : 0,
				bathrooms: rooms ? int(1, 4) : 0,
				deliveryDate: deliveryFor(status),
				isPublished: true
			})
			.returning({ id: units.id })
			.get();

		db.insert(unitTranslations)
			.values({
				unitId: id,
				locale: 'ar',
				title: `${typeLabel} في ${parent.title}`,
				developer: pick(developers),
				description: pick(unitDescriptions),
				locationName: parent.city,
				amenities: shuffle(amenitiesPool).slice(0, int(3, 5)),
				paymentPlans,
				details: [
					{ title: 'رقم الوحدة', description: `U-${1000 + i}` },
					{ title: 'الطابق', description: `${int(1, 20)}` },
					{ title: 'الاتجاه', description: pick(['شمالي', 'جنوبي', 'شرقي', 'غربي']) }
				]
			})
			.run();

		db.insert(media)
			.values(mediaRows({ unitId: id }))
			.run();
	}

	const projectCount = db.select({ id: projects.id }).from(projects).all().length;
	const unitCount = db.select({ id: units.id }).from(units).all().length;
	console.log(`✅ تمّت البذرة: ${projectCount} مشروع و ${unitCount} وحدة.`);
	process.exit(0);
}

main();
