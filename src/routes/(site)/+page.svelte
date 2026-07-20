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
	import logo from '$lib/assets/OneWayLogo.svg';
	import brandImage from '$lib/assets/black_building.avif';

	let { data } = $props();

	const canonical = $derived(new URL('/', page.url.origin).href);
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
	{jsonLd} />

<SliderHero />
<HomeNewSearch />
<About />
<OurServices />
<SpecialEstates projectList={data.featuredProjects} />
<NewProjects projectList={data.latestProjects} />
<Sponsers />
<LatestBlogs blogs={data.blogs} />
