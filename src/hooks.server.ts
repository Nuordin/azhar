// src/hooks.server.ts
import { auth } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getAvailableLocales, dirForLocale } from '$lib/i18n/locales.server';

// First path segments that must never be treated as a locale (or redirected).
const RESERVED = new Set(['dashboard', 'api', 'sitemap.xml', 'robots.txt', 'uploads', '_app']);

/** يختار اللغة المفضّلة من الكوكيز إن كانت متاحة، وإلا اللغة الافتراضية. */
function preferredLocale(cookieLocale: string | undefined): string {
	const available = getAvailableLocales();
	if (cookieLocale && available.some((l) => l.code === cookieLocale)) return cookieLocale;
	return available.some((l) => l.code === DEFAULT_LOCALE) ? DEFAULT_LOCALE : (available[0]?.code ?? DEFAULT_LOCALE);
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (event.url.pathname.startsWith('/dashboard') && !event.url.pathname.startsWith('/dashboard/sign-in')) {
		// 3. The Bouncer Logic: Redirect if no session OR not an admin 🛡️
		if (!session || session.user.role !== 'admin') {
			throw redirect(302, '/dashboard/sign-in');
		}
	}

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// إعادة التوجيه إلى الرابط ذي بادئة اللغة عند غياب اللغة (الجذر والروابط القديمة)
	// Only for real page navigations, so assets/data requests are untouched.
	const first = event.url.pathname.split('/')[1] ?? '';
	const wantsHtml = event.request.headers.get('accept')?.includes('text/html');
	const isKnownLocale = getAvailableLocales().some((l) => l.code === first);
	if (
		event.request.method === 'GET' &&
		wantsHtml &&
		!isKnownLocale &&
		!RESERVED.has(first) &&
		!first.startsWith('@') // vite internals in dev
	) {
		const locale = preferredLocale(event.cookies.get('locale'));
		const rest = event.url.pathname === '/' ? '' : event.url.pathname;
		throw redirect(301, `/${locale}${rest}${event.url.search}`);
	}

	// اتجاه/لغة عنصر <html> ديناميكيًا حسب بادئة اللغة
	const locale = isKnownLocale ? first : preferredLocale(event.cookies.get('locale'));
	const dir = dirForLocale(locale);

	const response = await svelteKitHandler({
		event,
		resolve: (ev) =>
			resolve(ev, {
				transformPageChunk: ({ html }) => html.replace('%lang%', locale).replace('%dir%', dir)
			}),
		auth,
		building
	});

	// حماية إضافية: منع فهرسة لوحة التحكم حتى لو تجاوزت الصفحة وسم الميتا
	if (event.url.pathname.startsWith('/dashboard')) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
};

export const handle: Handle = handleBetterAuth;
