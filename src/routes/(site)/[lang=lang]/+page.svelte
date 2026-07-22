<script>
	import { page } from '$app/state';
	import SliderHero from '$lib/components/SliderHero.svelte';
	import HomeNewSearch from '$lib/components/HomeNewSearch.svelte';
	import About from '$lib/components/About.svelte';
	import OurServices from '$lib/components/OurServices.svelte';
	import SpecialEstates from '$lib/components/SpecialEstates.svelte';
	import NewProjects from '$lib/components/NewProjects.svelte';
	import Sponsers from '$lib/components/Sponsers.svelte';
	import LatestBlogs from '$lib/components/LatestBlogs.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { SITE_NAME, DEFAULT_DESCRIPTION } from '$lib/config';
	import { DEFAULT_LOCALE, localeHome } from '$lib/i18n/config';
	import logo from '$lib/assets/OneWayLogo.svg';
	import brandImage from '$lib/assets/black_building.avif';

	let { data } = $props();

	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);
	const canonical = $derived(new URL(localeHome(lang), page.url.origin).href);
	const alternates = $derived([
		...page.data.availableLanguages.map((/** @type {{ code: string }} */ l) => ({
			hreflang: l.code,
			href: new URL(localeHome(l.code), page.url.origin).href
		})),
		{ hreflang: 'x-default', href: new URL(localeHome(DEFAULT_LOCALE), page.url.origin).href }
	]);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'RealEstateAgent',
		name: SITE_NAME,
		url: canonical,
		logo: new URL(logo, page.url.origin).href
	});
</script>

<Seo
	title={SITE_NAME}
	description={DEFAULT_DESCRIPTION}
	{canonical}
	ogImage={new URL(brandImage, page.url.origin).href}
	{jsonLd}
	{alternates}
	ogLocale={`${lang}_OM`} />

<SliderHero />
<HomeNewSearch />
<About />
<OurServices />
<SpecialEstates projectList={data.featuredProjects} />
<NewProjects projectList={data.latestProjects} />
<Sponsers />
<LatestBlogs blogs={data.blogs} />
