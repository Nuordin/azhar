<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { ChevronLeft, ChevronRight, X, ImageOff } from '@lucide/svelte';

	type Props = {
		open: boolean;
		images: string[];
		selected: string;
	};
	let { open = $bindable(false), images = [], selected = $bindable(images[0]) }: Props = $props();

	// الفهرس الحالي مشتق من الصورة المختارة
	let index = $derived(Math.max(0, images.indexOf(selected)));

	function close() {
		open = false;
	}

	function go(dir: number) {
		if (images.length === 0) return;
		const next = (index + dir + images.length) % images.length;
		selected = images[next];
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') close();
		// في الواجهة العربية (RTL) السهم الأيمن يعني السابق والأيسر يعني التالي
		else if (e.key === 'ArrowLeft') go(1);
		else if (e.key === 'ArrowRight') go(-1);
	}

	// قفل تمرير الصفحة أثناء فتح المعرض
	$effect(() => {
		if (open) document.body.classList.add('overflow-hidden');
		else document.body.classList.remove('overflow-hidden');
		return () => document.body.classList.remove('overflow-hidden');
	});
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-secondary-700/90 backdrop-blur-sm"
		dir="rtl"
		transition:fade={{ duration: 200 }}>
		<!-- الشريط العلوي: العدّاد وزر الإغلاق -->
		<div class="flex items-center justify-between p-4 text-secondary-100 shrink-0">
			<span class="text-sm font-bold tabular-nums font-inter">
				{images.length > 0 ? `${index + 1} / ${images.length}` : '0 / 0'}
			</span>
			<button onclick={close} class="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="إغلاق المعرض">
				<X class="w-6 h-6" />
			</button>
		</div>

		<!-- الصورة الرئيسية مع أزرار التنقّل -->
		<div class="relative flex-1 flex items-center justify-center min-h-0 px-4">
			{#if selected}
				{#key selected}
					<img
						src={selected}
						alt=""
						class="max-h-full max-w-full object-contain rounded-lg select-none"
						transition:fade={{ duration: 150 }} />
				{/key}
			{:else}
				<div class="flex flex-col items-center gap-2 text-secondary-300">
					<ImageOff class="w-12 h-12" />
					<span class="text-sm font-bold">لا توجد صورة</span>
				</div>
			{/if}

			{#if images.length > 1}
				<button
					onclick={() => go(-1)}
					class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-secondary-100 hover:bg-white/20 transition-colors"
					aria-label="الصورة السابقة">
					<ChevronRight class="w-7 h-7" />
				</button>
				<button
					onclick={() => go(1)}
					class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-secondary-100 hover:bg-white/20 transition-colors"
					aria-label="الصورة التالية">
					<ChevronLeft class="w-7 h-7" />
				</button>
			{/if}
		</div>

		<!-- شريط المصغّرات -->
		{#if images.length > 1}
			<div
				class="shrink-0 w-full flex gap-3 overflow-x-auto p-4 justify-center-safe"
				transition:fly={{ y: 20, duration: 200 }}>
				{#each images as image, i (image)}
					<button
						onclick={() => (selected = image)}
						class="h-20 w-28 shrink-0 rounded-lg overflow-hidden ring-2 transition-all {image === selected
							? 'ring-primary opacity-100'
							: 'ring-transparent opacity-60 hover:opacity-100'}"
						aria-label={`عرض الصورة ${i + 1}`}>
						<img src={image} alt="" class="w-full h-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
