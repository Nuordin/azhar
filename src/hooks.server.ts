// src/hooks.server.ts
import { auth } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';

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

	const response = await svelteKitHandler({ event, resolve, auth, building });

	// حماية إضافية: منع فهرسة لوحة التحكم حتى لو تجاوزت الصفحة وسم الميتا
	if (event.url.pathname.startsWith('/dashboard')) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
};

export const handle: Handle = handleBetterAuth;
