<script lang="ts">
	import { _ } from 'svelte-i18n';
	import logo from '$lib/assets/OneWayLogo.svg';
	import { MapPin, Phone, Mail } from '@lucide/svelte';
	import Whatsapp from '$lib/components/Icons/Whatsapp.svelte';
	import { whatsappLink } from '$lib/config';

	const year = new Date().getFullYear();

	const quickLinks = $derived([
		{ name: $_('header.home'), href: '/' },
		{ name: $_('header.projects'), href: '/projects' },
		{ name: $_('header.units'), href: '/units' },
		{ name: $_('header.blog'), href: '/blogs' },
		{ name: $_('header.about'), href: '/#about' },
		{ name: $_('header.services'), href: '/#serveice' },
		{ name: $_('header.contact'), href: '/#contact' }
	]);

	// بيانات تواصل مبدئية — استبدلها بالقيم الحقيقية قبل الإطلاق
	const phone = '+968 9000 0000';
	const email = 'info@onewayestate.com';
	const address = 'مسقط، سلطنة عُمان';
</script>

<footer dir="rtl" class="bg-secondary-700 text-secondary-100 px-4 md:px-16 lg:px-32 pt-14 pb-12">
	<div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
		<!-- العلامة -->
		<div class="space-y-4">
			<div class="inline-flex items-center justify-center rounded-2xl bg-secondary-100 p-2.5">
				<img src={logo} alt="OneWay Logo" class="h-10 w-10 object-contain" />
			</div>
			<p class="max-w-xs text-sm leading-7 text-secondary-100/70">
				وجهتك الأولى للعقارات الفاخرة في سلطنة عُمان — نساعدك على امتلاك مستقبلٍ سكنيٍ واستثماريٍ آمن.
			</p>
			<a
				href={whatsappLink('مرحباً، أرغب بالاستفسار عن خدماتكم العقارية.')}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-700">
				<Whatsapp size={16} /> تواصل عبر واتساب
			</a>
		</div>

		<!-- روابط سريعة -->
		<div>
			<h3 class="mb-4 text-lg font-black">روابط سريعة</h3>
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
			<h3 class="mb-4 text-lg font-black">تواصل معنا</h3>
			<ul class="space-y-3 text-sm text-secondary-100/75">
				<li class="flex items-center gap-2">
					<MapPin class="h-4 w-4 shrink-0 text-primary" />
					<span>{address}</span>
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
			<h3 class="mb-4 text-lg font-black">ساعات العمل</h3>
			<ul class="space-y-2.5 text-sm text-secondary-100/75">
				<li class="flex items-center justify-between gap-4">
					<span>السبت - الخميس</span>
					<span dir="ltr">8:00 - 18:00</span>
				</li>
				<li class="flex items-center justify-between gap-4">
					<span>الجمعة</span>
					<span>مغلق</span>
				</li>
			</ul>
		</div>
	</div>

	<!-- الشريط السفلي -->
	<div
		class="mt-12 flex flex-col items-center justify-between gap-3 border-t border-secondary-100/15 pt-6 text-center text-xs text-secondary-100/60 sm:flex-row sm:text-start">
		<span>© {year} المسار الموحد العقارية — جميع الحقوق محفوظة.</span>
		<span class="font-inter" dir="ltr">One Way Estate</span>
	</div>
</footer>
