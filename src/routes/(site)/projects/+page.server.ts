import type { PageServerLoad } from './$types';

// بيانات وهمية للعرض فقط — غير متصلة بقاعدة البيانات
export type MockProject = {
	id: number;
	title: string;
	developer: string;
	city: string;
	description: string;
	type: 'residential' | 'commercial' | 'mixed' | 'land';
	unitType: 'villa' | 'apartment' | 'townhouse' | 'land' | 'shop';
	constructionStatus: 'off_plan' | 'under_construction' | 'ready';
	completion: number;
	startingPrice: number;
	bedrooms: number;
	deliveryYear: number;
	image: string;
	featured: boolean;
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

const projects: MockProject[] = [
	{
		id: 1,
		title: 'واحة الموج السكنية',
		developer: 'شركة الأزهر العقارية',
		city: 'مسقط',
		description: 'مجمع سكني فاخر يطل على البحر مع مرافق متكاملة وحدائق واسعة.',
		type: 'residential',
		unitType: 'apartment',
		constructionStatus: 'under_construction',
		completion: 65,
		startingPrice: 45000,
		bedrooms: 2,
		deliveryYear: 2026,
		image: img('almouj'),
		featured: true
	},
	{
		id: 2,
		title: 'فلل تلال قريات',
		developer: 'مجموعة الخليج للتطوير',
		city: 'قريات',
		description: 'فلل مستقلة بتصاميم عصرية ومساحات خضراء في قلب الطبيعة.',
		type: 'residential',
		unitType: 'villa',
		constructionStatus: 'off_plan',
		completion: 10,
		startingPrice: 120000,
		bedrooms: 4,
		deliveryYear: 2027,
		image: img('qurayat'),
		featured: true
	},
	{
		id: 3,
		title: 'برج الأعمال المركزي',
		developer: 'الأزهر للاستثمار',
		city: 'مسقط',
		description: 'مكاتب ومحلات تجارية في موقع استراتيجي بمنطقة الأعمال.',
		type: 'commercial',
		unitType: 'shop',
		constructionStatus: 'ready',
		completion: 100,
		startingPrice: 85000,
		bedrooms: 0,
		deliveryYear: 2024,
		image: img('business'),
		featured: false
	},
	{
		id: 4,
		title: 'تاون هاوس النسيم',
		developer: 'إعمار عُمان',
		city: 'صحار',
		description: 'وحدات تاون هاوس متلاصقة بأسعار تنافسية وتشطيبات راقية.',
		type: 'residential',
		unitType: 'townhouse',
		constructionStatus: 'under_construction',
		completion: 40,
		startingPrice: 68000,
		bedrooms: 3,
		deliveryYear: 2026,
		image: img('naseem'),
		featured: false
	},
	{
		id: 5,
		title: 'أراضي سكنية - نزوى',
		developer: 'الأزهر العقارية',
		city: 'نزوى',
		description: 'قطع أراضي سكنية جاهزة للبناء في مخطط معتمد بالخدمات.',
		type: 'land',
		unitType: 'land',
		constructionStatus: 'ready',
		completion: 100,
		startingPrice: 25000,
		bedrooms: 0,
		deliveryYear: 2024,
		image: img('nizwa'),
		featured: false
	},
	{
		id: 6,
		title: 'مجمع صلالة جاردنز',
		developer: 'مجموعة ظفار',
		city: 'صلالة',
		description: 'شقق عائلية محاطة بالحدائق قرب الشاطئ ومناطق الخدمات.',
		type: 'mixed',
		unitType: 'apartment',
		constructionStatus: 'off_plan',
		completion: 5,
		startingPrice: 38000,
		bedrooms: 2,
		deliveryYear: 2028,
		image: img('salalah'),
		featured: true
	},
	{
		id: 7,
		title: 'فلل الواجهة البحرية',
		developer: 'مجموعة الخليج للتطوير',
		city: 'صور',
		description: 'فلل فاخرة على الواجهة البحرية بمسابح خاصة وإطلالات مفتوحة.',
		type: 'residential',
		unitType: 'villa',
		constructionStatus: 'ready',
		completion: 100,
		startingPrice: 180000,
		bedrooms: 5,
		deliveryYear: 2023,
		image: img('waterfront'),
		featured: true
	},
	{
		id: 8,
		title: 'بلازا البريمي التجارية',
		developer: 'الأزهر للاستثمار',
		city: 'البريمي',
		description: 'محلات ومعارض تجارية في مركز حيوي بمساحات متنوعة.',
		type: 'commercial',
		unitType: 'shop',
		constructionStatus: 'under_construction',
		completion: 55,
		startingPrice: 52000,
		bedrooms: 0,
		deliveryYear: 2025,
		image: img('plaza'),
		featured: false
	},
	{
		id: 9,
		title: 'شقق المعبيلة الحديثة',
		developer: 'إعمار عُمان',
		city: 'مسقط',
		description: 'شقق ذكية بأسعار مناسبة للعائلات الشابة قرب كل الخدمات.',
		type: 'residential',
		unitType: 'apartment',
		constructionStatus: 'off_plan',
		completion: 20,
		startingPrice: 32000,
		bedrooms: 1,
		deliveryYear: 2027,
		image: img('maabela'),
		featured: false
	},
	{
		id: 10,
		title: 'مخطط أراضي صحار الصناعي',
		developer: 'مجموعة ظفار',
		city: 'صحار',
		description: 'أراضي بمساحات كبيرة ضمن المنطقة الصناعية بخدمات متكاملة.',
		type: 'land',
		unitType: 'land',
		constructionStatus: 'ready',
		completion: 100,
		startingPrice: 90000,
		bedrooms: 0,
		deliveryYear: 2024,
		image: img('industrial'),
		featured: false
	},
	{
		id: 11,
		title: 'فلل حدائق نزوى',
		developer: 'الأزهر العقارية',
		city: 'نزوى',
		description: 'فلل بتصميم تراثي عصري وحدائق خاصة في بيئة هادئة.',
		type: 'residential',
		unitType: 'villa',
		constructionStatus: 'under_construction',
		completion: 75,
		startingPrice: 105000,
		bedrooms: 4,
		deliveryYear: 2025,
		image: img('gardens'),
		featured: true
	},
	{
		id: 12,
		title: 'مركز صلالة المختلط',
		developer: 'مجموعة الخليج للتطوير',
		city: 'صلالة',
		description: 'مشروع متعدد الاستخدامات يجمع السكن والتجارة في مكان واحد.',
		type: 'mixed',
		unitType: 'townhouse',
		constructionStatus: 'off_plan',
		completion: 0,
		startingPrice: 60000,
		bedrooms: 3,
		deliveryYear: 2028,
		image: img('mixed'),
		featured: false
	}
];

export const load: PageServerLoad = async () => {
	// عينة وهمية فقط، بدون اتصال بقاعدة البيانات
	return { projects };
};
