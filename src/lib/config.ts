// ⚠️ TODO قبل الإطلاق: ضع رقم واتساب الأعمال الحقيقي مع رمز الدولة وبدون علامة "+".
// مثال لسلطنة عُمان: 96890000000
export const WHATSAPP_NUMBER = '96890000000';

/**
 * يبني رابط محادثة واتساب مع رسالة مُرمّزة مسبقاً.
 * @param message نص الرسالة
 * @param number رقم الوجهة (يفترض رقم الأعمال الافتراضي)
 */
export function whatsappLink(message: string, number: string = WHATSAPP_NUMBER): string {
	return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
