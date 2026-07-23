<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import logo from '$lib/assets/OneWayLogo.svg';
	import { MapPin, Phone, Mail } from '@lucide/svelte';
	import Whatsapp from '$lib/components/Icons/Whatsapp.svelte';
	import { whatsappLink } from '$lib/config';
	import { DEFAULT_LOCALE } from '$lib/i18n/config';

	const year = new Date().getFullYear();
	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);

	const quickLinks = $derived([
		{ name: $_('header.home'), href: `/${lang}` },
		{ name: $_('header.projects'), href: `/${lang}/projects` },
		{ name: $_('header.units'), href: `/${lang}/units` },
		{ name: $_('header.blog'), href: `/${lang}/blogs` },
		{ name: $_('header.about'), href: `/${lang}#about` },
		{ name: $_('header.services'), href: `/${lang}#serveice` },
		{ name: $_('header.contact'), href: `/${lang}#contact` }
	]);

	// بيانات تواصل مبدئية — استبدلها بالقيم الحقيقية قبل الإطلاق
	const phone = '+968 9000 0000';
	const email = 'info@onewayestate.com';
</script>

<footer class="bg-secondary-700 text-secondary-100 mt-32 px-4 md:px-16 lg:px-32 pt-14 pb-12">
	<div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
		<!-- العلامة -->
		<div class="space-y-4">
			<div class="inline-flex items-center justify-center rounded-2xl bg-secondary-100 p-2.5">
				<img src={logo} alt={$_('common.logo_alt')} class="h-10 w-10 object-contain" />
			</div>
			<p class="max-w-xs text-sm leading-7 text-secondary-100/70">
				{$_('footer.tagline')}
			</p>
			<a
				href={whatsappLink($_('footer.whatsapp_message'))}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-700">
				<Whatsapp size={16} />
				{$_('footer.whatsapp_cta')}
			</a>
		</div>

		<!-- روابط سريعة -->
		<div>
			<h3 class="mb-4 text-lg font-black">{$_('footer.quick_links')}</h3>
			<ul class="space-y-2.5 text-sm text-secondary-100/75">
				{#each quickLinks as link (link.href)}
					<li>
						<a href={link.href} class="inline-block transition-colors hover:text-primary">{link.name}</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- معلومات التواصل -->
		<div>
			<h3 class="mb-4 text-lg font-black">{$_('common.contact_us')}</h3>
			<ul class="space-y-3 text-sm text-secondary-100/75">
				<li class="flex items-center gap-2">
					<MapPin class="h-4 w-4 shrink-0 text-primary" />
					<span>{$_('footer.address')}</span>
				</li>
				<li>
					<a href="tel:{phone.replace(/\s/g, '')}" class="flex items-center gap-2 transition-colors hover:text-primary">
						<Phone class="h-4 w-4 shrink-0 text-primary" />
						<span dir="ltr">{phone}</span>
					</a>
				</li>
				<li>
					<a href="mailto:{email}" class="flex items-center gap-2 transition-colors hover:text-primary">
						<Mail class="h-4 w-4 shrink-0 text-primary" />
						<span dir="ltr">{email}</span>
					</a>
				</li>
			</ul>
		</div>

		<!-- ساعات العمل -->
		<div>
			<h3 class="mb-4 text-lg font-black">{$_('footer.working_hours')}</h3>
			<ul class="space-y-2.5 text-sm text-secondary-100/75">
				<li class="flex items-center justify-between gap-4">
					<span>{$_('footer.days_sat_thu')}</span>
					<span dir="ltr">8:00 - 18:00</span>
				</li>
				<li class="flex items-center justify-between gap-4">
					<span>{$_('footer.friday')}</span>
					<span>{$_('footer.closed')}</span>
				</li>
			</ul>
		</div>
	</div>

	<!-- الشريط السفلي -->
	<div
		class="mt-12 flex flex-col items-center justify-between gap-3 border-t border-secondary-100/15 pt-6 text-center text-xs text-secondary-100/60 sm:flex-row sm:text-start">
		<span>{$_('footer.copyright', { values: { year } })}</span>
		<span class="font-inter" dir="ltr">One Way Estate</span>
	</div>
</footer>
