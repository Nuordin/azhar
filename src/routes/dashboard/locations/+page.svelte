<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import LocationCombobox from '$lib/components/LocationCombobox.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Plus, SquarePen, Trash2 } from '@lucide/svelte';

	let { data } = $props();

	type LocationRow = {
		id: number;
		parentId: number | null;
		type: string;
		hasDedicatedPage: boolean;
		isPublished: boolean;
		name: string | null;
	};

	const typeOptions = [
		{ value: 'governorate', label: 'محافظة' },
		{ value: 'wilayat', label: 'ولاية' },
		{ value: 'city', label: 'مدينة' },
		{ value: 'district', label: 'حي / منطقة' }
	];
	const typeLabel = (t: string | null) => typeOptions.find((o) => o.value === t)?.label || 'غير محدد';
	const nameById = (id: number | null) =>
		id == null ? '—' : (data.allLocations.find((l) => l.id === id)?.name ?? '—');

	// حالة النموذج (عربي فقط حالياً)
	let form = $state({
		id: null as number | null,
		isOpen: false,
		type: '',
		parentId: 'none',
		hasDedicatedPage: false,
		isPublished: true,
		name: ''
	});
	let isSubmitting = $state(false);
	let err_msg: string | null = $state(null);

	let currentTypeLabel = $derived(typeOptions.find((o) => o.value === form.type)?.label || 'اختر النوع');

	function openCreate() {
		form = { id: null, isOpen: true, type: '', parentId: 'none', hasDedicatedPage: false, isPublished: true, name: '' };
		err_msg = '';
	}

	function openEdit(loc: LocationRow) {
		form = {
			id: loc.id,
			isOpen: true,
			type: loc.type,
			parentId: loc.parentId ? String(loc.parentId) : 'none',
			hasDedicatedPage: loc.hasDedicatedPage,
			isPublished: loc.isPublished,
			name: loc.name ?? ''
		};
		err_msg = '';
	}

	async function submitForm() {
		isSubmitting = true;
		err_msg = '';

		const formData = new FormData();
		if (form.id) formData.append('locationId', String(form.id));
		formData.append('type', form.type);
		formData.append('parentId', form.parentId);
		formData.append('hasDedicatedPage', String(form.hasDedicatedPage));
		formData.append('isPublished', String(form.isPublished));
		formData.append('name', form.name);

		try {
			const actionUrl = form.id ? '?/updateLocation' : '?/createLocation';
			const response = await fetch(actionUrl, { method: 'POST', body: formData });
			const result = await response.json();

			if (result.type === 'success') {
				form.isOpen = false;
				await invalidateAll();
			} else {
				err_msg = JSON.parse(result.data)[1];
				console.error('فشل الإرسال:', result);
			}
		} catch (error) {
			console.error('حدث خطأ أثناء الإرسال:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
	<div class="flex items-center gap-2 px-16 w-full">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href="">إدارة الموقع</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block rotate-180" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>إدارة المواقع</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<Button variant="outline" onclick={openCreate}>إضافة موقع جديد<Plus /></Button>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 p-4 md:px-16" dir="rtl">
	<div class="rounded-2xl border bg-background">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">الاسم</Table.Head>
					<Table.Head class="text-right">النوع</Table.Head>
					<Table.Head class="text-right">تابع لـ</Table.Head>
					<Table.Head class="text-center">صفحة مخصّصة</Table.Head>
					<Table.Head class="text-center">الحالة</Table.Head>
					<Table.Head class="text-left">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#each data.locations as loc (loc.id)}
					{@render row(loc)}
				{:else}
					<Table.Row>
						<Table.Cell colspan={6} class="text-center py-10 text-muted-foreground">
							<div class="flex flex-col items-center gap-4">
								<span class="mb-0">لا توجد مواقع مضافة حتى الآن.</span>
								<Button variant="outline" onclick={openCreate}>إضافة موقع جديد<Plus /></Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if data.pagination.totalPages > 1}
			<div class="flex items-center justify-between px-4 py-4 border-t">
				<div class="text-sm text-muted-foreground">
					صفحة {data.pagination.currentPage} من {data.pagination.totalPages}
					(إجمالي {data.pagination.totalCount} موقع)
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						href="?page={data.pagination.currentPage - 1}"
						disabled={data.pagination.currentPage <= 1}>السابق</Button>
					<Button
						variant="outline"
						size="sm"
						href="?page={data.pagination.currentPage + 1}"
						disabled={data.pagination.currentPage >= data.pagination.totalPages}>التالي</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

{@render dialog()}

{#snippet row(loc: LocationRow)}
	<Table.Row>
		<Table.Cell class="font-medium">{loc.name}</Table.Cell>
		<Table.Cell><Badge variant="secondary">{typeLabel(loc.type)}</Badge></Table.Cell>
		<Table.Cell class="text-muted-foreground">{nameById(loc.parentId)}</Table.Cell>
		<Table.Cell class="text-center">
			{#if loc.hasDedicatedPage}
				<Badge>نعم</Badge>
			{:else}
				<span class="text-muted-foreground">—</span>
			{/if}
		</Table.Cell>
		<Table.Cell class="text-center">
			<form
				action="?/togglePublish"
				method="POST"
				use:enhance={() =>
					async ({ update }) =>
						await update({ invalidateAll: true })}
				id="publish-form-{loc.id}">
				<input type="hidden" name="id" value={loc.id} />
				<input type="hidden" name="isPublished" value={!loc.isPublished} />
				<Switch
					checked={loc.isPublished}
					onclick={() => {
						const f = document.getElementById(`publish-form-${loc.id}`) as HTMLFormElement;
						f?.requestSubmit();
					}} />
			</form>
		</Table.Cell>
		<Table.Cell class="text-left">
			<div class="flex justify-end gap-2">
				<Button variant="ghost" size="icon" title="تعديل" onclick={() => openEdit(loc)}>
					<SquarePen class="h-4 w-4 text-muted-foreground" />
				</Button>
				<form
					method="POST"
					action="?/deleteLocation"
					use:enhance={() =>
						async ({ update }) =>
							update()}>
					<input type="hidden" name="id" value={loc.id} />
					<Button
						type="submit"
						variant="ghost"
						size="icon"
						title="حذف"
						class="hover:text-destructive hover:bg-destructive/10"
						onclick={(e) => {
							if (
								!confirm('هل أنت متأكد من حذف هذا الموقع؟ سيُزال ارتباطه من المشاريع والوحدات (تُضبط على بدون موقع).')
							) {
								e.preventDefault();
							}
						}}>
						<Trash2 class="h-4 w-4" />
					</Button>
				</form>
			</div>
		</Table.Cell>
	</Table.Row>
{/snippet}

{#snippet dialog()}
	<Dialog.Root bind:open={form.isOpen}>
		<Dialog.Content class="sm:max-w-125 dark" interactOutsideBehavior="close">
			<Dialog.Header>
				<Dialog.Title class="text-right">{form.id ? 'تعديل الموقع' : 'إضافة موقع جديد'}</Dialog.Title>
				<Dialog.Description class="text-right">تُضاف الترجمة العربية فقط حالياً.</Dialog.Description>
			</Dialog.Header>

			<div class="py-4 space-y-4" dir="rtl">
				<div class="grid gap-2">
					<Label class="text-right">الاسم (بالعربية)</Label>
					<Input bind:value={form.name} placeholder="مثال: مدينة السلطان هيثم المستقبلية" class="text-right" />
				</div>

				<div class="grid gap-2">
					<Label class="text-right">النوع</Label>
					<Select.Root type="single" bind:value={form.type}>
						<Select.Trigger class="text-right w-full">{currentTypeLabel}</Select.Trigger>
						<Select.Content class="dark">
							{#each typeOptions as opt (opt.value)}
								<Select.Item value={opt.value} class="text-right">{opt.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="grid gap-2">
					<Label class="text-right">تابع لـ (اختياري)</Label>
					<LocationCombobox
						locations={data.allLocations}
						bind:value={form.parentId}
						noneLabel="بدون (موقع جذر)"
						excludeId={form.id}
						showType />
				</div>

				<div class="flex items-center justify-between">
					<Label class="text-right">لديه صفحة مخصّصة</Label>
					<Switch bind:checked={form.hasDedicatedPage} />
				</div>

				<div class="flex items-center justify-between">
					<Label class="text-right">منشور</Label>
					<Switch bind:checked={form.isPublished} />
				</div>

				{#if err_msg}
					<p class="text-sm text-destructive text-right">{err_msg}</p>
				{/if}
			</div>

			<Dialog.Footer class="flex justify-end items-center w-full gap-2 mt-4" dir="rtl">
				<Button type="button" variant="ghost" onclick={() => (form.isOpen = false)}>إلغاء</Button>
				<Button type="button" onclick={submitForm} disabled={isSubmitting}>
					{isSubmitting ? 'جارٍ الحفظ...' : form.id ? 'حفظ التعديلات' : 'إضافة'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}
