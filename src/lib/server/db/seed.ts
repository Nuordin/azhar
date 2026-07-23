// src/lib/server/db/seed.ts
// بذرة بيانات تجريبية: تحذف المشاريع والوحدات والمقالات ووسائطها وترجماتها
// ثم تُنشئ 20 مشروعاً و40 وحدة و3 مقالات ببيانات عربية وإنجليزية وصور بديلة،
// وتُنشئ حساب المدير (admin@onewayestate.com).
// التشغيل:  pnpm db:seed   (يعتمد على db + schema فقط، لا يحتاج وقت تشغيل SvelteKit)
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { db } from './index';
import {
	projects,
	projectTranslations,
	units,
	unitTranslations,
	locations,
	locationTranslations,
	blogs,
	blogTranslations,
	media,
	user,
	account
} from './schema';

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

// بيانات ثنائية اللغة (عربي/إنجليزي)
type Bi = { ar: string; en: string };

// شجرة المواقع ثنائية اللغة وفق التقسيم الإداري العُماني
// (محافظة > ولاية > مدينة > حي). تُدرَج قبل المشاريع والوحدات، والولايات/المدن/الأحياء
// فقط هي القابلة للإسناد للمشاريع والوحدات.
type LocType = 'governorate' | 'wilayat' | 'city' | 'district';
type LocNode = { ar: string; en: string; type: LocType; hasDedicatedPage?: boolean; children?: LocNode[] };

const locationTree: LocNode[] = [
	{
		ar: 'مسقط',
		en: 'Muscat',
		type: 'governorate',
		children: [
			{
				ar: 'بوشر',
				en: 'Bawshar',
				type: 'wilayat',
				children: [
					{
						ar: 'مدينة السلطان هيثم المستقبلية',
						en: 'Sultan Haitham Future City',
						type: 'city',
						hasDedicatedPage: true,
						children: [
							{ ar: 'الحي التجاري', en: 'Commercial District', type: 'district' },
							{ ar: 'الحي السكني', en: 'Residential District', type: 'district' }
						]
					},
					{ ar: 'الغبرة', en: 'Al Ghubrah', type: 'district' }
				]
			},
			{
				ar: 'السيب',
				en: 'As Seeb',
				type: 'wilayat',
				children: [
					{ ar: 'الموالح', en: 'Al Mawaleh', type: 'district' },
					{ ar: 'المعبيلة', en: 'Al Maabilah', type: 'district' }
				]
			},
			{ ar: 'قريات', en: 'Quriyat', type: 'wilayat' }
		]
	},
	{
		ar: 'ظفار',
		en: 'Dhofar',
		type: 'governorate',
		children: [{ ar: 'صلالة', en: 'Salalah', type: 'wilayat' }]
	},
	{
		ar: 'شمال الباطنة',
		en: 'North Al Batinah',
		type: 'governorate',
		children: [{ ar: 'صحار', en: 'Sohar', type: 'wilayat' }]
	},
	{
		ar: 'جنوب الباطنة',
		en: 'South Al Batinah',
		type: 'governorate',
		children: [
			{ ar: 'الرستاق', en: 'Ar Rustaq', type: 'wilayat' },
			{ ar: 'بركاء', en: 'Barka', type: 'wilayat' }
		]
	},
	{
		ar: 'الداخلية',
		en: 'Ad Dakhiliyah',
		type: 'governorate',
		children: [{ ar: 'نزوى', en: 'Nizwa', type: 'wilayat' }]
	},
	{
		ar: 'جنوب الشرقية',
		en: 'South Ash Sharqiyah',
		type: 'governorate',
		children: [{ ar: 'صور', en: 'Sur', type: 'wilayat' }]
	},
	{
		ar: 'البريمي',
		en: 'Al Buraimi',
		type: 'governorate',
		children: [{ ar: 'البريمي', en: 'Al Buraimi', type: 'wilayat' }]
	},
	{
		ar: 'الظاهرة',
		en: 'Ad Dhahirah',
		type: 'governorate',
		children: [{ ar: 'عبري', en: 'Ibri', type: 'wilayat' }]
	}
];

// المواقع القابلة للإسناد (ولاية/مدينة/حي)، تُملأ أثناء الإدراج بمعرّفاتها
const assignableLocations: { id: number; ar: string; en: string }[] = [];

/** يُدرج شجرة المواقع وترجماتها (ar/en) ويجمع المواقع القابلة للإسناد. */
function seedLocations() {
	const insert = (node: LocNode, parentId: number | null) => {
		const { id } = db
			.insert(locations)
			.values({
				parentId,
				type: node.type,
				hasDedicatedPage: node.hasDedicatedPage ?? false,
				isPublished: true
			})
			.returning({ id: locations.id })
			.get();
		db.insert(locationTranslations)
			.values([
				{ locationId: id, locale: 'ar', name: node.ar },
				{ locationId: id, locale: 'en', name: node.en }
			])
			.run();
		if (node.type !== 'governorate') assignableLocations.push({ id, ar: node.ar, en: node.en });
		for (const child of node.children ?? []) insert(child, id);
	};
	for (const root of locationTree) insert(root, null);
}
const developers: Bi[] = [
	{ ar: 'شركة الأزهر العقارية', en: 'Al Azhar Real Estate Co.' },
	{ ar: 'المسار الموحد العقارية', en: 'One Way Estate' },
	{ ar: 'مجموعة الخليج للتطوير', en: 'Gulf Development Group' },
	{ ar: 'إعمار عُمان', en: 'Emaar Oman' },
	{ ar: 'دار جلوبل للتطوير', en: 'Dar Global Development' },
	{ ar: 'مجموعة ظفار العقارية', en: 'Dhofar Real Estate Group' },
	{ ar: 'الأزهر للاستثمار', en: 'Al Azhar Investment' }
];
const projectPrefixes: Bi[] = [
	{ ar: 'واحة', en: 'Oasis' },
	{ ar: 'تلال', en: 'Hills' },
	{ ar: 'برج', en: 'Tower' },
	{ ar: 'ضفاف', en: 'Shores' },
	{ ar: 'مرتفعات', en: 'Heights' },
	{ ar: 'حدائق', en: 'Gardens' },
	{ ar: 'بوابة', en: 'Gateway' },
	{ ar: 'نسيم', en: 'Breeze' },
	{ ar: 'لؤلؤة', en: 'Pearl' },
	{ ar: 'مجمع', en: 'Complex' },
	{ ar: 'مروج', en: 'Meadows' },
	{ ar: 'أفق', en: 'Horizon' }
];
const projectSuffixes: Bi[] = [
	{ ar: 'السكني', en: 'Residences' },
	{ ar: 'الفاخر', en: 'Luxury' },
	{ ar: 'الجديد', en: 'New' },
	{ ar: 'بلازا', en: 'Plaza' },
	{ ar: 'ريزيدنس', en: 'Residence' },
	{ ar: 'هايتس', en: 'Heights' }
];

const amenitiesPool: { title: string; titleEn: string; icon: string }[] = [
	{ title: 'أمن وحراسة على مدار الساعة', titleEn: '24/7 Security', icon: 'ShieldCheck' },
	{ title: 'نادٍ رياضي مجهّز', titleEn: 'Fully-equipped Gym', icon: 'Dumbbell' },
	{ title: 'مسبح إنفينيتي', titleEn: 'Infinity Pool', icon: 'WavesHorizontal' },
	{ title: 'مواقف سيارات خاصة', titleEn: 'Private Parking', icon: 'CircleParking' },
	{ title: 'حدائق ومساحات خضراء', titleEn: 'Gardens & Green Spaces', icon: 'TreePine' },
	{ title: 'منطقة لعب أطفال', titleEn: "Kids' Play Area", icon: 'Baby' },
	{ title: 'مطاعم ومقاهٍ', titleEn: 'Restaurants & Cafés', icon: 'UtensilsCrossed' },
	{ title: 'مسارات مشي', titleEn: 'Walking Trails', icon: 'Footprints' },
	{ title: 'مركز تسوّق', titleEn: 'Shopping Center', icon: 'Handbag' },
	{ title: 'مظلات ومناطق استراحة', titleEn: 'Shaded Lounge Areas', icon: 'Parasol' },
	{ title: 'مسارات دراجات', titleEn: 'Cycling Tracks', icon: 'Bike' },
	{ title: 'برج مراقبة وإطلالة', titleEn: 'Observation Tower', icon: 'TowerControl' }
];
/** يبني قائمة المرافق حسب اللغة من عناصر المجمّع الثنائية. */
const amenitiesFor = (items: { title: string; titleEn: string; icon: string }[], locale: 'ar' | 'en') =>
	items.map((a) => ({ title: locale === 'ar' ? a.title : a.titleEn, icon: a.icon }));

const projectDescriptions: Bi[] = [
	{
		ar: 'مجتمع سكني متكامل يجمع بين الرفاهية والخصوصية، بتصاميم عصرية ومساحات خضراء واسعة تطل على أجمل المواقع.',
		en: 'An integrated residential community that blends luxury and privacy, with modern designs and vast green spaces overlooking the finest locations.'
	},
	{
		ar: 'وجهة عمرانية مميّزة توفّر أسلوب حياة راقٍ مع مرافق متكاملة وخدمات على مستوى عالٍ في قلب المدينة.',
		en: 'A distinctive urban destination offering an elegant lifestyle with fully integrated facilities and high-end services in the heart of the city.'
	},
	{
		ar: 'مشروع رائد يعيد تعريف المعيشة الحديثة عبر وحدات مصمّمة بعناية ومرافق ترفيهية ومساحات مفتوحة.',
		en: 'A pioneering project that redefines modern living through carefully designed units, recreational facilities, and open spaces.'
	},
	{
		ar: 'مجمّع فاخر بموقع استراتيجي قريب من الخدمات والطرق الرئيسية، مثالي للسكن والاستثمار على حدّ سواء.',
		en: 'A premium complex in a strategic location close to services and main roads — ideal for both living and investment.'
	}
];
const unitDescriptions: Bi[] = [
	{
		ar: 'وحدة أنيقة بتشطيبات فاخرة وإطلالات مفتوحة، توفّر مساحة معيشة مريحة تناسب العائلات العصرية.',
		en: 'An elegant unit with premium finishes and open views, offering a comfortable living space suited to modern families.'
	},
	{
		ar: 'خيار مثالي لمن يبحث عن الجودة والموقع، بتصميم عملي يستفيد من كل مساحة وإضاءة طبيعية وفيرة.',
		en: 'A perfect choice for those seeking quality and location, with a practical design that makes the most of every space and abundant natural light.'
	},
	{
		ar: 'وحدة بمواصفات راقية ضمن مجتمع متكامل الخدمات، جاهزة لتلبية تطلعاتك السكنية أو الاستثمارية.',
		en: 'A high-spec unit within a fully-serviced community, ready to meet your residential or investment aspirations.'
	},
	{
		ar: 'مساحة مصمّمة بذوق رفيع مع أفضل الخامات، وقربها من المرافق يجعلها فرصة لا تُفوّت.',
		en: 'A tastefully designed space with the finest materials; its proximity to amenities makes it an opportunity not to be missed.'
	}
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
const typeLabelsEn: Record<UnitType, string> = {
	apartment: 'Apartment',
	standalone_villa: 'Standalone Villa',
	twin_villa: 'Twin Villa',
	townhouse: 'Townhouse',
	penthouse: 'Penthouse',
	duplex: 'Duplex',
	studio: 'Studio',
	office: 'Office',
	retail: 'Retail Shop',
	showroom: 'Showroom',
	whole_building: 'Whole Building',
	residential_land: 'Residential Land',
	commercial_land: 'Commercial Land',
	residential_commercial_land: 'Residential/Commercial Land',
	industrial_land: 'Industrial Land',
	agricultural_land: 'Agricultural Land',
	chalet: 'Chalet',
	istiraha: 'Rest House',
	hotel_apartment: 'Hotel Apartment',
	warehouse: 'Warehouse',
	labour_camp: 'Labour Camp'
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

const directions: Bi[] = [
	{ ar: 'شمالي', en: 'North' },
	{ ar: 'جنوبي', en: 'South' },
	{ ar: 'شرقي', en: 'East' },
	{ ar: 'غربي', en: 'West' }
];

const paymentPlansAr = [
	{ title: 'دفعة الحجز', description: '10% عند توقيع العقد' },
	{ title: 'أثناء الإنشاء', description: '40% على أقساط ربع سنوية' },
	{ title: 'عند التسليم', description: '50% دفعة أخيرة' }
];
const paymentPlansEn = [
	{ title: 'Booking Payment', description: '10% upon signing the contract' },
	{ title: 'During Construction', description: '40% in quarterly installments' },
	{ title: 'On Handover', description: '50% final payment' }
];

// دائماً 3 صور لكل عنصر (وسائط لا تقل عن 3)
function mediaRows(target: { projectId?: number; unitId?: number; blogId?: number }) {
	const imgs = shuffle(PLACEHOLDER_IMAGES);
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

// المقالات: ثنائية اللغة، منشورة، بصور
const blogPosts: {
	category: 'real_estate_tips' | 'market_news' | 'development' | 'investment' | 'company_news';
	ar: { title: string; excerpt: string; content: string };
	en: { title: string; excerpt: string; content: string };
}[] = [
	{
		category: 'real_estate_tips',
		ar: {
			title: 'خمس نصائح ذهبية قبل شراء عقارك الأول',
			excerpt: 'دليل عملي مختصر يساعدك على اتخاذ قرار شراء واعٍ وتجنّب الأخطاء الشائعة عند اقتناء أول عقار.',
			content:
				'# خمس نصائح ذهبية قبل شراء عقارك الأول\n\nشراء العقار الأول قرار كبير يستحق التخطيط الجيد. إليك أهم ما ينبغي مراعاته:\n\n## 1. حدّد ميزانيتك بواقعية\nاحسب المبلغ المتاح للدفعة الأولى والأقساط الشهرية دون إرهاق دخلك.\n\n## 2. تحقّق من الموقع\nالموقع هو العامل الأهم في قيمة العقار مستقبلاً، فانظر إلى القرب من الخدمات والطرق.\n\n## 3. افحص العقار جيداً\nلا تكتفِ بالصور، وقم بزيارة ميدانية للتأكد من جودة التشطيبات والمرافق.\n\n## 4. راجع الأوراق القانونية\nتأكد من سلامة سند الملكية وخلوّ العقار من أي التزامات.\n\n## 5. فكّر في المستقبل\nاختر عقاراً يلبّي احتياجاتك على المدى الطويل ويحافظ على قيمته.'
		},
		en: {
			title: 'Five Golden Tips Before Buying Your First Property',
			excerpt:
				'A concise, practical guide to help you make an informed purchase decision and avoid the common mistakes of first-time buyers.',
			content:
				'# Five Golden Tips Before Buying Your First Property\n\nBuying your first property is a major decision that deserves careful planning. Here is what matters most:\n\n## 1. Set a realistic budget\nWork out what you can afford for the down payment and monthly installments without straining your income.\n\n## 2. Check the location\nLocation is the biggest driver of future value — look at proximity to services and main roads.\n\n## 3. Inspect the property thoroughly\nDo not rely on photos alone; visit in person to verify the quality of finishes and amenities.\n\n## 4. Review the legal paperwork\nMake sure the title deed is valid and the property is free of any obligations.\n\n## 5. Think ahead\nChoose a property that meets your long-term needs and holds its value.'
		}
	},
	{
		category: 'market_news',
		ar: {
			title: 'اتجاهات سوق العقار في عُمان لعام 2026',
			excerpt: 'نظرة على أبرز المؤشرات والتوجّهات التي تشكّل ملامح السوق العقاري العُماني هذا العام.',
			content:
				'# اتجاهات سوق العقار في عُمان لعام 2026\n\nيشهد السوق العقاري في السلطنة تطورات لافتة مدفوعة بمشاريع التطوير الكبرى والتحفيزات الاستثمارية.\n\n## نمو المشاريع المتكاملة\nتتجه السوق نحو المجتمعات السكنية المتكاملة التي تجمع السكن والخدمات في مكان واحد.\n\n## إقبال المستثمرين الأجانب\nساهمت أنظمة التملّك الحرّ في جذب شريحة أوسع من المستثمرين من مختلف الجنسيات.\n\n## التركيز على الاستدامة\nأصبحت المعايير البيئية وكفاءة الطاقة عاملاً أساسياً في تصميم المشاريع الجديدة.'
		},
		en: {
			title: 'Oman Real Estate Market Trends for 2026',
			excerpt: 'A look at the key indicators and trends shaping the Omani real estate market this year.',
			content:
				'# Oman Real Estate Market Trends for 2026\n\nThe Sultanate’s real estate market is seeing notable momentum driven by major development projects and investment incentives.\n\n## Growth of integrated developments\nThe market is shifting toward integrated residential communities that combine homes and services in one place.\n\n## Rising foreign investor interest\nFreehold ownership regulations have attracted a wider pool of investors from various nationalities.\n\n## A focus on sustainability\nEnvironmental standards and energy efficiency have become central to the design of new projects.'
		}
	},
	{
		category: 'investment',
		ar: {
			title: 'لماذا يُعد الاستثمار العقاري في عُمان فرصة واعدة؟',
			excerpt: 'أسباب تجعل من العقار العُماني خياراً جذّاباً للمستثمرين الباحثين عن عوائد مستقرة ونمو طويل الأمد.',
			content:
				'# لماذا يُعد الاستثمار العقاري في عُمان فرصة واعدة؟\n\nيتمتع السوق العُماني بمقوّمات تجعله وجهة استثمارية جاذبة على المدى الطويل.\n\n## استقرار اقتصادي وتشريعي\nتوفّر البيئة التنظيمية الواضحة حماية لحقوق المستثمرين وتشجّع على ضخّ رؤوس الأموال.\n\n## موقع استراتيجي\nيمنح موقع السلطنة على خطوط الملاحة العالمية ميزة تنافسية للقطاعين السياحي والتجاري.\n\n## عوائد إيجارية مجزية\nتشهد المدن الرئيسية طلباً متنامياً على الإيجار يوفّر دخلاً مستقراً للمستثمرين.'
		},
		en: {
			title: 'Why Real Estate Investment in Oman Is a Promising Opportunity',
			excerpt:
				'The reasons that make Omani property an attractive choice for investors seeking stable returns and long-term growth.',
			content:
				'# Why Real Estate Investment in Oman Is a Promising Opportunity\n\nThe Omani market has fundamentals that make it an appealing long-term investment destination.\n\n## Economic and legal stability\nA clear regulatory environment protects investor rights and encourages capital inflows.\n\n## Strategic location\nThe Sultanate’s position on global shipping routes offers a competitive edge for tourism and commerce.\n\n## Attractive rental yields\nMajor cities are seeing growing rental demand that provides investors with steady income.'
		}
	}
];

async function seedAdmin() {
	const email = 'admin@onewayestate.com';
	const password = 'password123';

	// حذف أي حساب مدير سابق بنفس البريد لضمان ثبات بيانات الدخول (حذف المستخدم يحذف حسابه وجلساته)
	const existing = db.select({ id: user.id }).from(user).where(eq(user.email, email)).all();
	for (const u of existing) {
		db.delete(user).where(eq(user.id, u.id)).run();
	}

	const id = randomUUID();
	const now = new Date();
	db.insert(user)
		.values({ id, name: 'Azhar', email, emailVerified: true, role: 'admin', createdAt: now, updatedAt: now })
		.run();

	const hash = await hashPassword(password);
	db.insert(account)
		.values({
			id: randomUUID(),
			accountId: id,
			providerId: 'credential',
			userId: id,
			password: hash,
			createdAt: now,
			updatedAt: now
		})
		.run();

	console.log(`👤 حساب المدير جاهز: ${email}`);
}

async function main() {
	console.log('🌱 حذف البيانات القديمة...');
	db.delete(media).run();
	db.delete(unitTranslations).run();
	db.delete(units).run();
	db.delete(projectTranslations).run();
	db.delete(projects).run();
	db.delete(locationTranslations).run();
	db.delete(locations).run();
	db.delete(blogTranslations).run();
	db.delete(blogs).run();

	console.log('📍 إنشاء شجرة المواقع...');
	seedLocations();

	const NUM_PROJECTS = 20;
	const NUM_UNITS = 40;

	const projectMeta: {
		id: number;
		title: string;
		titleEn: string;
		location: { id: number; ar: string; en: string };
	}[] = [];

	console.log(`🏗️  إنشاء ${NUM_PROJECTS} مشروعاً...`);
	for (let i = 0; i < NUM_PROJECTS; i++) {
		const loc = pick(assignableLocations);
		const developer = pick(developers);
		const prefix = pick(projectPrefixes);
		const suffix = pick(projectSuffixes);
		const title = `${prefix.ar} ${loc.ar} ${suffix.ar}`;
		const titleEn = `${prefix.en} ${loc.en} ${suffix.en}`;
		const status = pick([...constructionStatuses]);
		const completion = pick(completionByStatus[status]);
		const isFeatured = i < 6; // أول 6 مشاريع مميّزة
		const startingPrice = int(25, 250) * 1000;
		const desc = pick(projectDescriptions);
		const amenities = shuffle(amenitiesPool).slice(0, int(4, 6));
		const unitsCount = int(20, 300);

		const { id } = db
			.insert(projects)
			.values({
				ownershipType: pick([...ownershipTypes]),
				constructionStatus: status,
				completionPercentage: completion,
				totalArea: int(2, 60) * 1000,
				startingPrice,
				deliveryDate: deliveryFor(status),
				locationId: loc.id,
				isPublished: true,
				isFeatured,
				featuredOrder: isFeatured ? i : 0
			})
			.returning({ id: projects.id })
			.get();

		db.insert(projectTranslations)
			.values([
				{
					projectId: id,
					locale: 'ar',
					title,
					description: desc.ar,
					developerName: developer.ar,
					amenities: amenitiesFor(amenities, 'ar'),
					paymentPlans: paymentPlansAr,
					details: [
						{ title: 'المطوّر', description: developer.ar },
						{ title: 'الموقع', description: loc.ar },
						{ title: 'عدد الوحدات', description: `${unitsCount} وحدة` }
					]
				},
				{
					projectId: id,
					locale: 'en',
					title: titleEn,
					description: desc.en,
					developerName: developer.en,
					amenities: amenitiesFor(amenities, 'en'),
					paymentPlans: paymentPlansEn,
					details: [
						{ title: 'Developer', description: developer.en },
						{ title: 'Location', description: loc.en },
						{ title: 'Number of Units', description: `${unitsCount} units` }
					]
				}
			])
			.run();

		db.insert(media)
			.values(mediaRows({ projectId: id }))
			.run();
		projectMeta.push({ id, title, titleEn, location: loc });
	}

	console.log(`🏠 إنشاء ${NUM_UNITS} وحدة...`);
	for (let i = 0; i < NUM_UNITS; i++) {
		const parent = projectMeta[i % NUM_PROJECTS]; // وحدتان لكل مشروع
		const type = pick([...unitTypes]);
		const offer = pick(['rent', 'sale'] as const);
		const status = pick([...constructionStatuses]);
		const rooms = hasRooms(type);
		const price = offer === 'rent' ? int(2, 20) * 100 : int(30, 400) * 1000;
		const developer = pick(developers);
		const desc = pick(unitDescriptions);
		const amenities = shuffle(amenitiesPool).slice(0, int(3, 5));
		const floor = int(1, 20);
		const direction = pick(directions);

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
				locationId: parent.location.id,
				isPublished: true
			})
			.returning({ id: units.id })
			.get();

		db.insert(unitTranslations)
			.values([
				{
					unitId: id,
					locale: 'ar',
					title: `${typeLabels[type]} في ${parent.title}`,
					developer: developer.ar,
					description: desc.ar,
					amenities: amenitiesFor(amenities, 'ar'),
					paymentPlans: paymentPlansAr,
					details: [
						{ title: 'رقم الوحدة', description: `U-${1000 + i}` },
						{ title: 'الطابق', description: `${floor}` },
						{ title: 'الاتجاه', description: direction.ar }
					]
				},
				{
					unitId: id,
					locale: 'en',
					title: `${typeLabelsEn[type]} in ${parent.titleEn}`,
					developer: developer.en,
					description: desc.en,
					amenities: amenitiesFor(amenities, 'en'),
					paymentPlans: paymentPlansEn,
					details: [
						{ title: 'Unit Number', description: `U-${1000 + i}` },
						{ title: 'Floor', description: `${floor}` },
						{ title: 'Orientation', description: direction.en }
					]
				}
			])
			.run();

		db.insert(media)
			.values(mediaRows({ unitId: id }))
			.run();
	}

	console.log(`📝 إنشاء ${blogPosts.length} مقالات...`);
	for (const post of blogPosts) {
		const { id } = db
			.insert(blogs)
			.values({
				category: post.category,
				isPublished: true,
				publishedAt: new Date()
			})
			.returning({ id: blogs.id })
			.get();

		db.insert(blogTranslations)
			.values([
				{ blogId: id, locale: 'ar', title: post.ar.title, excerpt: post.ar.excerpt, content: post.ar.content },
				{ blogId: id, locale: 'en', title: post.en.title, excerpt: post.en.excerpt, content: post.en.content }
			])
			.run();

		db.insert(media)
			.values(mediaRows({ blogId: id }))
			.run();
	}

	await seedAdmin();

	const projectCount = db.select({ id: projects.id }).from(projects).all().length;
	const unitCount = db.select({ id: units.id }).from(units).all().length;
	const blogCount = db.select({ id: blogs.id }).from(blogs).all().length;
	console.log(`✅ تمّت البذرة: ${projectCount} مشروع و ${unitCount} وحدة و ${blogCount} مقالات.`);
	process.exit(0);
}

main();
