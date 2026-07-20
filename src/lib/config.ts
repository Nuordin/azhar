// ⚠️ TODO قبل الإطلاق: ضع رقم واتساب الأعمال الحقيقي مع رمز الدولة وبدون علامة "+".
// مثال لسلطنة عُمان: 96890000000
export const WHATSAPP_NUMBER = '96890000000';

export const SITE_NAME = 'one way | المسار الموحد';

// ⚠️ TODO قبل الإطلاق: مراجعة الوصف التسويقي للموقع (يظهر في نتائج البحث ومشاركات التواصل).
export const DEFAULT_DESCRIPTION =
	'منصة عقارية عمانية لتصفح المشاريع والوحدات السكنية والتجارية في سلطنة عمان، مع تفاصيل الأسعار وخطط الدفع والحجز المباشر.';

/**
 * يبني رابط محادثة واتساب مع رسالة مُرمّزة مسبقاً.
 * @param message نص الرسالة
 * @param number رقم الوجهة (يفترض رقم الأعمال الافتراضي)
 */
export function whatsappLink(message: string, number: string = WHATSAPP_NUMBER): string {
	return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
