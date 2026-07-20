import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * يحول عنواناً إلى مقطع رابط آمن (يحافظ على الأحرف العربية).
 * يستخدم لبناء روابط `/{section}/{slug}-{id}` وللتحقق من الرابط القانوني (canonical).
 */
export function slugify(title: string): string {
	return title
		.trim()
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u001f\\/?#%&"'<>]/g, ' ')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * يفكك مقطع رابط تفاصيل بصيغة `{slug}-{id}`.
 * موجه الـ SvelteKit يقسم `[title]-[id]` عند أول شرطة، لذا عند احتواء العنوان على
 * شرطات يجب إعادة تجميع المقطع واستخراج الرقم من نهايته.
 */
export function parseDetailParams(title: string, id: string): { id: number; slug: string } {
	const full = `${title}-${id}`;
	const match = full.match(/^(.*)-(\d+)$/);
	if (!match) return { id: NaN, slug: full };
	return { id: Number(match[2]), slug: match[1] };
}

/** يقص النص لوصف ميتا (~155 حرفاً) مع إزالة أسطر جديدة وإضافة "…" عند القص. */
export function truncateForMeta(text: string, maxLength: number = 155): string {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (clean.length <= maxLength) return clean;
	return clean.slice(0, maxLength - 1).trimEnd() + '…';
}

export const formatCurrency = (
	amount: number | null,
	locale: string = 'ar-OM',
	style: Intl.NumberFormatOptions = { style: 'currency', currency: 'OMR', maximumFractionDigits: 0 }
) => {
	if (!amount) return '-';
	return new Intl.NumberFormat(locale, style).format(amount);
};

export const unitTypes = [
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
];
export const unitStatus = ['available', 'reserved', 'sold'];
export const offers = ['rent', 'sale'];
export const constructionStatuses = ['off_plan', 'under_construction', 'ready'];
export const ownershipType = ['omani_only', 'gcc_only', 'all_nationalities'];
export const categoryTypes = ['residential', 'commercial', 'mixed', 'land', 'industrial'];

export const offerMap: Record<string, string> = {
	rent: 'للإيجار',
	sale: 'للبيع'
};
export const categoryTypeMap: Record<string, string> = {
	residential: 'سكني',
	commercial: ' تجاري',
	mixed: 'سكني/تجاري',
	land: 'أراضي',
	industrial: 'صناعي'
};

export const unitStatusMap: Record<string, string> = { available: 'متاح', reserved: 'محجوز', sold: 'مباع' };
export const constructionMap: Record<string, string> = {
	off_plan: 'مخطط',
	under_construction: 'قيد الإنشاء',
	ready: 'جاهز'
};
export const ownershipTypeMap: Record<string, string> = {
	omani_only: 'للعمانين',
	gcc_only: 'لمواطني دول الخليج',
	all_nationalities: 'جميع الجنسية'
};

export const unitTypesMap: Record<string, string> = {
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
	residential_commercial_land: 'أرض سكنية وتجارية',
	industrial_land: 'أرض صناعية',
	agricultural_land: 'أرض زراعية',
	chalet: 'شاليه',
	istiraha: 'استراحة',
	hotel_apartment: 'شقة فندقية',
	warehouse: 'مستودع',
	labour_camp: 'سكن عمال'
};
