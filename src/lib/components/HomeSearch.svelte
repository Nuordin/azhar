<script lang="ts">
	let searchFormData = {
		location: [
			{ value: '', label: 'اختر المدينة' },
			{ value: 'مسقط', label: 'مسقط' },
			{ value: 'الخوض', label: 'الخوض' },
			{ value: 'المعبيلة', label: 'المعبيلة' },
			{ value: 'السيب', label: 'السيب' }
		],
		realestateType: [
			{ value: '', label: 'اختر نوع العقار' },
			{ value: 'سكني', label: 'سكني' },
			{ value: 'تجاري', label: 'تجاري' },
			{ value: 'صناعي', label: 'صناعي' }
		],
		unitType: [
			{ value: '', label: 'اختر نوع الوحدة' },
			{ value: 'فلل', label: 'فلل' },
			{ value: 'شقة', label: 'شقة' },
			{ value: 'اراضي', label: 'اراضي' }
		],
		price: [
			{ value: '', label: 'اختر سعر' },
			{ value: '100-500', label: '100 - 500' },
			{ value: '500-2000', label: '500 - 2000' },
			{ value: '2000-10000', label: '2000 - 10000' },
			{ value: '10000-', label: '10000+' }
		],
		roomsCount: [
			{ value: '', label: 'اختر عدد الغرف' },
			{ value: '1-2', label: '1-2' },
			{ value: '2-3', label: '2-3' },
			{ value: '3-4', label: '3-4' }
		],
		search: 'بحث'
	};
</script>

<form
	class="w-96 px-8 py-4 border border-gray-400/20 shadow mt-8 rounded-2xl mx-auto justify-center items-center">
	<h1 class="w-full text-center text-2xl font-black mb-4">ابحث عن مشاريعنا</h1>
	<div class="grid grid-cols-1 gap-8">
		{@render select('location', searchFormData.location)}
		{@render select('realestateType', searchFormData.realestateType)}
		{@render select('unitType', searchFormData.unitType)}
		{@render select('price', searchFormData.price)}
		{@render select('roomsCount', searchFormData.roomsCount)}
	</div>
	<button
		class="w-full px-10 mt-4 flex flex-row-reverse items-center justify-center gap-2 py-2 bg-primary text-secondary-100 rounded-xl font-aljazeera font-black text-xl">
		<!-- <SearchIcon /> -->
		{searchFormData.search}
	</button>
</form>

{#snippet select(name: string, options: { value: string; label: string }[])}
	<div class="flex justify-start items-start">
		<!-- <label for="price" class="px-4 leading-5">{label}</label> -->
		<select
			{name}
			id={name}
			class="w-full py-3 bg-secondary-100 border-gray-600/20 shadow rounded-2xl">
			<option value="">{options[0].label}</option>
			{#each options as option, idx (idx)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>
{/snippet}
