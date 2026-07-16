<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Icons from '$lib/components/Icons.svelte';
	import { propertiesForm } from './state.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Plus, Trash2, Upload, Video, Eye, SquarePen } from '@lucide/svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import {
		constructionMap,
		constructionStatuses,
		unitTypesMap,
		unitTypes,
		unitStatusMap,
		unitStatus,
		ownershipTypeMap,
		ownershipType,
		categoryTypeMap,
		categoryTypes,
		offers,
		offerMap
	} from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let { unitList, projectList, pagination } = $derived(data);
	let isSubmitting = $state(false);
	const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
		ready: { label: 'جاهز', variant: 'default' },
		under_construction: { label: 'قيد الإنشاء', variant: 'secondary' },
		off_plan: { label: 'مخطط', variant: 'outline' }
	};
	const formatCurrency = (amount: number | null) => {
		if (!amount) return '-';
		return new Intl.NumberFormat('ar-OM', { style: 'currency', currency: 'OMR' }).format(amount);
	};

	const availableIcons = [
		'UtensilsCrossed',
		'Dumbbell',
		'Bike',
		'TreePine',
		'WavesHorizontal',
		'TowerControl',
		'Handbag',
		'Parasol',
		'Footprints',
		'ShieldCheck',
		'Baby',
		'CircleParking'
	];
	type Project = {
		id: number;
		title: string | null;
		developer: string | null;
		completionPercentage: '0' | '25' | '50' | '75' | '100' | null;
		constructionStatus: 'ready' | 'under_construction' | 'off_plan' | null;
		price: number | null;
		isPublished: boolean;
	};

	const percentageOptions = [
		{ value: '0', label: '0%' },
		{ value: '25', label: '25%' },
		{ value: '50', label: '50%' },
		{ value: '75', label: '75%' },
		{ value: '100', label: '100%' }
	];

	let parent = $derived(projectList?.find((project) => project.id.toString() === propertiesForm.parentId));

	let err_msg: string | null = $state(null);
	function addAmenity() {
		propertiesForm.amenities.push({ title: '', icon: availableIcons[0] });
	}

	function removeAmenity(index: number) {
		propertiesForm.amenities.splice(index, 1);
	}

	function addPaymentPlan() {
		propertiesForm.paymentPlans.push({ title: '', description: '' });
	}

	function removePaymentPlan(index: number) {
		propertiesForm.paymentPlans.splice(index, 1);
	}

	function addDetail() {
		propertiesForm.details.push({ title: '', description: '' });
	}

	function removeDetail(index: number) {
		propertiesForm.details.splice(index, 1);
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const newFiles = Array.from(input.files);
			propertiesForm.media = [...propertiesForm.media, ...newFiles];
		}
	}

	function removeFile(index: number) {
		propertiesForm.media.splice(index, 1);

		if (propertiesForm.thumbnail === index) {
			propertiesForm.thumbnail = 0;
		} else if (propertiesForm.thumbnail > index) {
			propertiesForm.thumbnail -= 1;
		}
	}

	async function submitForm() {
		isSubmitting = true;
		err_msg = '';

		const formData = new FormData();
		formData.append('unit_id', propertiesForm.unitId);
		formData.append('parent_id', propertiesForm.parentId);
		formData.append('name', propertiesForm.name);
		formData.append('developer', propertiesForm.developer);
		formData.append('unit_type', propertiesForm.type);
		formData.append('unit_status', propertiesForm.status);
		formData.append('category_type', propertiesForm.categoryType);
		formData.append('offer_type', propertiesForm.offerType);
		formData.append('description', propertiesForm.description);
		formData.append('location', propertiesForm.location);
		formData.append('price', propertiesForm.price);
		formData.append('ownership_type', propertiesForm.ownershipType);
		formData.append('delivery_date', propertiesForm.deliveryDate);
		formData.append('completion_progress', propertiesForm.completionProgress);
		formData.append('construction_status', propertiesForm.constructionStatus);
		formData.append('bedroom_count', propertiesForm.bedroomCount);
		formData.append('bathroom_count', propertiesForm.bathroomCount);
		formData.append('area', propertiesForm.area);
		formData.append('amenities', JSON.stringify(propertiesForm.amenities));
		formData.append('payment_plans', JSON.stringify(propertiesForm.paymentPlans));
		formData.append('details', JSON.stringify(propertiesForm.details));
		formData.append('thumbnail', propertiesForm.thumbnail.toString());
		formData.append('is_published', propertiesForm.isPublished.toString());
		if (propertiesForm.unitId) {
			formData.append('deletedMediaIds', JSON.stringify(propertiesForm.deletedMediaIds));
			if (propertiesForm.mainExistingMediaId) {
				formData.append('mainExistingMediaId', String(propertiesForm.mainExistingMediaId));
			}
		}
		propertiesForm.media.forEach((file) => {
			formData.append(`media`, file);
		});

		try {
			const actionUrl = propertiesForm.unitId ? '?/updateUnit' : '?/createUnit';
			const response = await fetch(actionUrl, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				propertiesForm.resetForm();
				propertiesForm.closeDialog();
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
				<Breadcrumb.Page class="hidden md:block">إدارة الوحدات</Breadcrumb.Page>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
		<Button
			variant="outline"
			onclick={() => {
				propertiesForm.resetForm();
				propertiesForm.openDialog();
			}}>إضافة وحدة جديد<Plus /></Button>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 p-4 md:px-16" dir="rtl">
	<div class="rounded-2xl border bg-background">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">اسم الوحدة</Table.Head>
					<Table.Head class="text-right">اسم المطور</Table.Head>
					<Table.Head class="text-right">حالة البناء</Table.Head>
					<Table.Head class="text-right">نسبة الإنجاز</Table.Head>
					<Table.Head class="text-right">السعر</Table.Head>
					<Table.Head class="text-center">حالة النشر</Table.Head>
					<Table.Head class="text-left">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each unitList as unit, idx (idx)}
					{@render row(unit)}
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="text-center py-10 text-muted-foreground">
							<div class="flex flex-col items-center gap-4">
								<span class="mb-0"> لا توجد وحدات مضافة حتى الآن. </span>
								<Button
									variant="outline"
									onclick={() => {
										propertiesForm.resetForm();
										propertiesForm.openDialog();
									}}>إضافة وحدة جديد<Plus /></Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if pagination && pagination.totalPages > 1}
			<div class="flex items-center justify-between px-4 py-4 border-t">
				<div class="text-sm text-muted-foreground">
					صفحة {pagination.currentPage} من {pagination.totalPages}
					(إجمالي {pagination.totalCount} مشروع)
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						href="?page={pagination.currentPage - 1}"
						disabled={pagination.currentPage <= 1}>
						السابق
					</Button>
					<Button
						variant="outline"
						size="sm"
						href="?page={pagination.currentPage + 1}"
						disabled={pagination.currentPage >= pagination.totalPages}>
						التالي
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

{#snippet row(unit: Project)}
	<Table.Row>
		<Table.Cell class="font-medium">
			{unit.title}
		</Table.Cell>

		<Table.Cell>
			{unit.developer}
		</Table.Cell>

		<Table.Cell>
			{#if unit.constructionStatus && statusMap[unit.constructionStatus]}
				<Badge variant={statusMap[unit.constructionStatus].variant}>
					{statusMap[unit.constructionStatus].label}
				</Badge>
			{:else}
				<Badge variant="outline">غير محدد</Badge>
			{/if}
		</Table.Cell>

		<Table.Cell class="w-50">
			<div class="flex items-center gap-3">
				<Progress value={Number(unit.completionPercentage || 0)} class="h-2 w-full" />
				<span class="text-xs text-muted-foreground w-[3ch] text-left">
					{unit.completionPercentage || 0}%
				</span>
			</div>
		</Table.Cell>

		<Table.Cell>
			{formatCurrency(unit.price)}
		</Table.Cell>

		<Table.Cell class="text-center">
			<form
				action="?/togglePublish"
				method="POST"
				use:enhance={() => {
					return async ({ update }) => {
						await update({ invalidateAll: true });
					};
				}}
				id="publish-form-{unit.id}">
				<input type="hidden" name="id" value={unit.id} />
				<input type="hidden" name="isPublished" value={!unit.isPublished} />
				<Switch
					bind:checked={unit.isPublished}
					onclick={() => {
						const form = document.getElementById(`publish-form-${unit.id}`) as HTMLFormElement;
						if (form) {
							form.requestSubmit();
						}
					}} />
			</form>
		</Table.Cell>

		<Table.Cell class="text-left">
			<div class="flex justify-end gap-2">
				<Button
					variant="ghost"
					size="icon"
					title="عرض"
					onclick={async (e) => {
						const btn = e.currentTarget as HTMLButtonElement;
						btn.disabled = true;
						try {
							const res = await fetch(`/api/units/${unit.id}`);
							if (res.ok) {
								propertiesForm.openView(await res.json());
							} else {
								alert('حدث خطأ أثناء جلب البيانات');
							}
						} catch (err) {
							console.error(err);
						} finally {
							btn.disabled = false;
						}
					}}>
					<Eye class="h-4 w-4 text-muted-foreground" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					title="تعديل"
					onclick={async (e) => {
						const btn = e.currentTarget as HTMLButtonElement;
						btn.disabled = true;
						try {
							const res = await fetch(`/api/units/${unit.id}`);
							if (res.ok) {
								propertiesForm.populate(await res.json());
								propertiesForm.openDialog();
							} else {
								alert('حدث خطأ أثناء جلب بيانات الوحدة');
							}
						} catch (err) {
							console.error(err);
						} finally {
							btn.disabled = false;
						}
					}}>
					<SquarePen class="h-4 w-4 text-muted-foreground" />
				</Button>

				<form
					method="POST"
					action="?/deleteUnit"
					use:enhance={() => {
						return async ({ update }) => {
							update(); // تحديث واجهة المستخدم
						};
					}}>
					<input type="hidden" name="id" value={unit.id} />

					<Button
						type="submit"
						variant="ghost"
						size="icon"
						title="حذف"
						class="hover:text-destructive hover:bg-destructive/10"
						onclick={(e) => {
							if (
								!confirm(
									'هل أنت متأكد من حذف هذا المشروع نهائياً؟ سيتم حذف جميع الصور والبيانات المرتبطة به ولن تتمكن من التراجع.'
								)
							) {
								e.preventDefault(); // إلغاء الإرسال إذا ضغط المستخدم "إلغاء"
							}
						}}>
						<Trash2 class="h-4 w-4" />
					</Button>
				</form>
			</div>
		</Table.Cell>
	</Table.Row>
{/snippet}
{@render dialog()}
{#snippet dialog()}
	<Dialog.Root bind:open={propertiesForm.isOpen}>
		<Dialog.Content class="dark max-h-[70vh] min-h-150 min-w-150 overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>
					{propertiesForm.mode === 'view'
						? 'تفاصيل الوحدة'
						: propertiesForm.unitId
							? 'تعديل وحدة'
							: 'إضافة وحدة'}
				</Dialog.Title>
				{#if propertiesForm.mode !== 'view'}
					<Dialog.Description>الخطوة {propertiesForm.currentStep} من 4</Dialog.Description>
				{/if}
			</Dialog.Header>
			{#if propertiesForm.mode === 'view'}
				<div class="space-y-4">
					{@render viewBody()}
				</div>
				<Dialog.Footer class="flex flex-row justify-end items-end gap-2">
					<Button variant="ghost" size="sm" class="cursor-pointer px-4" onclick={() => propertiesForm.closeDialog()}>
						إغلاق</Button>
				</Dialog.Footer>
			{:else}
				<div class="space-y-4">
					<!-- 1st Step -->
					{#if propertiesForm.currentStep === 1}
						{@render firstInformationForm()}
					{:else if propertiesForm.currentStep === 2}
						{@render secondInformationForm()}
					{:else if propertiesForm.currentStep === 3}
						{@render amenityForm()}
					{:else if propertiesForm.currentStep === 4}
						{@render mediaUploadForm()}
					{/if}
				</div>
				<Dialog.Footer class="flex flex-row justify-end  items-end gap-2">
					<div class="w-full text-red-400 text-xs">{err_msg}</div>
					{#if propertiesForm.currentStep > 1}
						<Button variant="outline" size="sm" class="cursor-pointer" onclick={() => propertiesForm.prevStep()}>
							السابق</Button>
					{/if}
					{#if propertiesForm.currentStep <= 3}
						<Button variant="outline" size="sm" class="cursor-pointer" onclick={() => propertiesForm.nextStep()}>
							التالي</Button>
					{:else}
						<Button
							variant="outline"
							size="sm"
							class="cursor-pointer"
							disabled={isSubmitting}
							onclick={() => submitForm()}>
							{isSubmitting ? 'جاري حفظ الوحدة...' : 'حفظ'}
						</Button>
					{/if}
					<Button variant="ghost" size="sm" class="cursor-pointer px-4" onclick={() => propertiesForm.closeDialog()}>
						إلغاء</Button>
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet viewField(label: string, value: string)}
	<div class="grid gap-1">
		<Label class="text-right text-muted-foreground text-xs">{label}</Label>
		<p class="text-right text-sm">{value || '-'}</p>
	</div>
{/snippet}

{#snippet viewBody()}
	<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" dir="rtl">
		<div class="grid grid-cols-2 gap-4">
			{@render viewField('اسم الوحدة', propertiesForm.name)}
			{@render viewField('اسم المطور', propertiesForm.developer)}
			{@render viewField('الموقع', propertiesForm.location)}
			{@render viewField('نوع الوحدة', unitTypesMap[propertiesForm.type])}
			{@render viewField('تصنيف الوحدة', categoryTypeMap[propertiesForm.categoryType])}
			{@render viewField('نوع العرض', offerMap[propertiesForm.offerType])}
			{@render viewField('حالة الوحدة', unitStatusMap[propertiesForm.status])}
			{@render viewField('نوع التملك', ownershipTypeMap[propertiesForm.ownershipType])}
			{@render viewField('حالة البناء', constructionMap[propertiesForm.constructionStatus])}
			{@render viewField('نسبة الإنجاز', propertiesForm.completionProgress ? `${propertiesForm.completionProgress}%` : '')}
			{@render viewField('السعر', formatCurrency(Number(propertiesForm.price) || null))}
			{@render viewField('المساحة', propertiesForm.area)}
			{@render viewField('عدد الغرف', propertiesForm.bedroomCount)}
			{@render viewField('عدد الحمامات', propertiesForm.bathroomCount)}
			{@render viewField('تاريخ التسليم', propertiesForm.deliveryDate)}
			<div class="grid gap-1">
				<Label class="text-right text-muted-foreground text-xs">حالة النشر</Label>
				<Badge variant={propertiesForm.isPublished ? 'default' : 'outline'} class="w-fit">
					{propertiesForm.isPublished ? 'منشورة' : 'غير منشورة'}
				</Badge>
			</div>
		</div>

		<div class="grid gap-1">
			<Label class="text-right text-muted-foreground text-xs">وصف الوحدة</Label>
			<p class="text-right text-sm whitespace-pre-wrap">{propertiesForm.description || '-'}</p>
		</div>

		<Separator />
		<div>
			<Label class="text-right font-bold">المرافق والخدمات</Label>
			{#if propertiesForm.amenities.length > 0}
				<div class="grid grid-cols-2 gap-3 mt-3">
					{#each propertiesForm.amenities as amenity, i (i)}
						<div class="flex items-center gap-2 bg-muted/30 p-2 rounded-md border">
							<Icons iconName={amenity.icon} />
							<span class="text-sm">{amenity.title}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground text-center py-2">لا توجد مرافق.</p>
			{/if}
		</div>

		<Separator />
		<div>
			<Label class="text-right font-bold">خطط الدفع</Label>
			{#if propertiesForm.paymentPlans.length > 0}
				<div class="space-y-2 mt-3">
					{#each propertiesForm.paymentPlans as plan, i (i)}
						<div class="bg-muted/30 p-3 rounded-md border">
							<p class="text-right font-medium text-sm">{plan.title}</p>
							<p class="text-right text-sm text-muted-foreground">{plan.description}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground text-center py-2">لا توجد خطط دفع.</p>
			{/if}
		</div>

		<Separator />
		<div>
			<Label class="text-right font-bold">تفاصيل إضافية</Label>
			{#if propertiesForm.details.length > 0}
				<div class="space-y-2 mt-3">
					{#each propertiesForm.details as detail, i (i)}
						<div class="bg-muted/30 p-3 rounded-md border">
							<p class="text-right font-medium text-sm">{detail.title}</p>
							<p class="text-right text-sm text-muted-foreground">{detail.description}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground text-center py-2">لا توجد تفاصيل إضافية.</p>
			{/if}
		</div>

		{#if propertiesForm.existingMedia.length > 0}
			<Separator />
			<div class="space-y-2">
				<Label class="text-right font-bold">الوسائط</Label>
				<div class="grid grid-cols-3 gap-4">
					{#each propertiesForm.existingMedia as file (file.id)}
						{@render media(file.url, file.type === 'video', propertiesForm.mainExistingMediaId === file.id, () => {}, () => {}, true)}
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet firstInformationForm()}
	<div class="grid grid-cols-2 gap-4">
		<Label class="grid gap-2">
			اسم الوحدة
			<Input type="text" placeholder="اسم الوحدة" bind:value={propertiesForm.name} required={true} />
		</Label>
		<Label class="grid gap-2">
			مطور الوحدة
			<Input type="text" placeholder="مطور الوحدة" bind:value={propertiesForm.developer} />
		</Label>
	</div>
	<div class="grid grid-cols-2 gap-4">
		<Label class="grid gap-2">
			نوع الوحدة
			<Select.Root type="single" bind:value={propertiesForm.type}>
				<Select.Trigger class="text-right dark  w-full">
					{unitTypesMap[propertiesForm.type] || 'نوع الوحدة'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each unitTypes as property (property)}
						<Select.Item value={property} class="text-right">{unitTypesMap[property]}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>
		<Label class="grid gap-2">
			حالة البناء
			<Select.Root type="single" bind:value={propertiesForm.constructionStatus}>
				<Select.Trigger class="text-right dark  w-full">
					{constructionMap[propertiesForm.constructionStatus] || 'جاهز'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each constructionStatuses as status, idx (idx)}
						<Select.Item value={status} class="text-right">{constructionMap[status]}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>

		<Label class="grid gap-2">
			تصنيف الوحدة
			<Select.Root type="single" bind:value={propertiesForm.categoryType}>
				<Select.Trigger class="text-right dark  w-full">
					{categoryTypeMap[propertiesForm.categoryType] || 'سكني'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each categoryTypes as catagory (catagory)}
						<Select.Item value={catagory} class="text-right">{categoryTypeMap[catagory]}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>

		<Label class="grid gap-2">
			نوع العرض
			<Select.Root type="single" bind:value={propertiesForm.offerType}>
				<Select.Trigger class="text-right dark  w-full">
					{offerMap[propertiesForm.offerType] || 'للبيع'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each offers as offer (offer)}
						<Select.Item value={offer} class="text-right">{offerMap[offer]}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>
		<Label class="grid gap-2 col-span-2">
			وصف الوحدة
			<Textarea
				placeholder="اكتب وصفاً تفصيلياً للوحدة"
				class="text-right min-h-25 max-h-25"
				bind:value={propertiesForm.description} />
		</Label>
		<Label><Checkbox bind:checked={propertiesForm.isPublished} />حالة نشر الوحدة</Label>
	</div>
{/snippet}

{#snippet secondInformationForm()}
	<div class="grid grid-cols-2 gap-4">
		<Label class="grid gap-2">
			الموقع
			<Input type="text" placeholder="الموقع" bind:value={propertiesForm.location} />
		</Label>
		<Label class="grid gap-2">
			السعر
			<Input type="text" placeholder="السعر" bind:value={propertiesForm.price} />
		</Label>
	</div>
	<div class="grid grid-cols-2 gap-4">
		<Label class="grid gap-2">
			المشروع الرئيسي
			<Select.Root type="single" bind:value={propertiesForm.parentId}>
				<Select.Trigger class="text-right dark  w-full">
					{parent?.title || 'وحدة مستقلة'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each projectList as project (project.id)}
						<Select.Item value={project.id.toString()} class="text-right">{project.title}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>

		<Label class="grid gap-2">
			نوع التملك
			<Select.Root type="single" bind:value={propertiesForm.ownershipType}>
				<Select.Trigger class="text-right dark  w-full">
					{ownershipTypeMap[propertiesForm.ownershipType] || 'للعمانين'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each ownershipType as nationality (nationality)}
						<Select.Item value={nationality} class="text-right">{ownershipTypeMap[nationality]}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>
	</div>
	<div class="grid grid-cols-2 gap-4">
		<Label class="grid gap-2">
			حالة الوحده
			<Select.Root type="single" bind:value={propertiesForm.status}>
				<Select.Trigger class="text-right dark  w-full">
					{unitStatusMap[propertiesForm.status] || 'متاح'}
				</Select.Trigger>
				<Select.Content class="max-h-60 dark">
					{#each unitStatus as status, idx (idx)}
						<Select.Item value={status} class="text-right">{unitStatusMap[status]}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>

		<Label class="text-right grid gap-2">
			نسبة الإنجاز
			<Select.Root type="single" bind:value={propertiesForm.completionProgress}>
				<Select.Trigger class="text-right  w-full">{propertiesForm.completionProgress || '100'}%</Select.Trigger>
				<Select.Content class="dark">
					{#each percentageOptions as option (option.value)}
						<Select.Item value={option.value} class="text-right">{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Label>
	</div>

	<Label class="text-right grid gap-2">
		تاريخ التسليم المتوقع
		<Input type="date" class="text-right" bind:value={propertiesForm.deliveryDate} />
	</Label>

	<div class="grid grid-cols-3 gap-4 col-span-2">
		<Label class="grid gap-2">
			عدد الغرف
			<Input type="text" placeholder="عدد الغرف" bind:value={propertiesForm.bedroomCount} />
		</Label>
		<Label class="grid gap-2">
			عدد الحمامات
			<Input type="text" placeholder="عدد الحمامات" bind:value={propertiesForm.bathroomCount} />
		</Label>
		<Label class="grid gap-2">
			مساحة الوحدة
			<Input type="text" placeholder="مساحة الوحدة" bind:value={propertiesForm.area} />
		</Label>
	</div>
{/snippet}

{#snippet amenityForm()}
	<div class="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		<div>
			<div class="flex justify-between items-center mb-4">
				<Label class="text-right font-bold text-lg">المرافق والخدمات</Label>
				<Button variant="outline" size="sm" onclick={addAmenity}>
					<Plus class="h-4 w-4 ml-0" /> إضافة
				</Button>
			</div>

			<div class="space-y-3">
				{#each propertiesForm.amenities as amenity, i (i)}
					<div class="flex gap-2 items-start bg-muted/30 p-3 rounded-md border">
						<div class="grid gap-2 flex-1">
							<Input bind:value={amenity.title} placeholder="الاسم (مثال: مسبح خاص)" class="text-right h-full" />
						</div>
						<div class="flex items-center justify-center">
							<Popover.Root>
								<Popover.Trigger
									class="inline-flex items-center justify-center rounded-md border bg-transparent h-10 w-10 hover:bg-muted transition-colors">
									<Icons iconName={amenity.icon} />
								</Popover.Trigger>
								<Popover.Content class="w-fit p-2 dark">
									<div class="grid grid-cols-4 gap-2">
										{#each availableIcons as icon (icon)}
											<Button
												variant={amenity.icon === icon ? 'default' : 'ghost'}
												size="icon"
												onclick={() => (amenity.icon = icon)}>
												<Icons iconName={icon} stroke={2} />
											</Button>
										{/each}
									</div>
								</Popover.Content>
							</Popover.Root>
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive hover:bg-destructive/10 mt-0.5"
							onclick={() => removeAmenity(i)}>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				{#if propertiesForm.amenities.length === 0}
					<p class="text-sm text-muted-foreground text-center py-2">لا توجد مرافق مضافة.</p>
				{/if}
			</div>
		</div>
		<Separator />
		<div>
			<div class="flex justify-between items-center mb-4">
				<Label class="text-right font-bold text-lg">خطط الدفع</Label>
				<Button variant="outline" size="sm" onclick={addPaymentPlan}>
					<Plus class="h-4 w-4 ml-0" /> إضافة
				</Button>
			</div>

			<div class="space-y-3">
				{#each propertiesForm.paymentPlans as plan, i (i)}
					<div class="flex gap-2 justify-center items-center bg-muted/30 p-3 rounded-md border">
						<div class="grid gap-2 flex-1">
							<Input bind:value={plan.title} placeholder="عنوان الخطة (مثال: دفع كاش)" class="text-right" />
							<Textarea
								bind:value={plan.description}
								placeholder="التفاصيل (مثال: 10% مقدم و 90% عند الاستلام)"
								class="text-right text-sm h-15" />
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive hover:bg-destructive/10 mt-0.5"
							onclick={() => removePaymentPlan(i)}>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				{#if propertiesForm.paymentPlans.length === 0}
					<p class="text-sm text-muted-foreground text-center py-2">لا توجد خطط دفع مضافة.</p>
				{/if}
			</div>
		</div>
		<Separator />
		<div>
			<div class="flex justify-between items-center mb-4">
				<Label class="text-right font-bold text-lg">تفاصيل إضافية</Label>
				<Button variant="outline" size="sm" onclick={addDetail}>
					<Plus class="h-4 w-4 ml-0" /> تفاصيل اضافية
				</Button>
			</div>

			<div class="space-y-3">
				{#each propertiesForm.details as detail, i (i)}
					<div class="flex gap-2 justify-center items-center bg-muted/30 p-3 rounded-md border">
						<div class="grid gap-2 flex-1">
							<Input bind:value={detail.title} placeholder="العنوان (مثال: رسوم الصيانة)" class="text-right" />
							<Textarea
								bind:value={detail.description}
								placeholder="الوصف (مثال: 10 ر.ع شهرياً)"
								class="text-right text-sm h-15" />
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive hover:bg-destructive/10 mt-0.5"
							onclick={() => removeDetail(i)}>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				{#if propertiesForm.details.length === 0}
					<p class="text-sm text-muted-foreground text-center py-2">لا توجد تفاصيل مضافة.</p>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet mediaUploadForm()}
	<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		{#if propertiesForm.existingMedia.length > 0}
			<div class="space-y-2">
				<Label class="text-right font-bold">الصور الحالية</Label>
				<div class="grid grid-cols-3 gap-4">
					{#each propertiesForm.existingMedia as file (file.id)}
						{@render media(
							file.url,
							file.type === 'video',
							propertiesForm.mainExistingMediaId === file.id && propertiesForm.thumbnail === -1,
							() => {
								propertiesForm.mainExistingMediaId = file.id;
								propertiesForm.thumbnail = -1;
							},
							() => {
								propertiesForm.deletedMediaIds.push(file.id);
								propertiesForm.existingMedia = propertiesForm.existingMedia.filter((m) => m.id !== file.id);
							}
						)}
					{/each}
				</div>
			</div>
			<Separator />
		{/if}
		<div
			class="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 gap-4 bg-muted/10 transition-colors hover:bg-muted/30">
			<div class="flex items-center justify-center w-14 h-14 rounded-full bg-background border shadow-sm">
				<Upload class="w-6 h-6 text-muted-foreground" />
			</div>
			<div class="text-center space-y-1">
				<h3 class="font-medium text-lg">ارفع صور وفيديوهات الوحدة</h3>
				<p class="text-sm text-muted-foreground">صيغ PNG, JPG, MP4 (الحد الأقصى 10MB)</p>
			</div>

			<Button variant="outline" class="relative overflow-hidden mt-2">
				تصفح الملفات
				<input
					type="file"
					multiple
					accept="image/*,video/*"
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					onchange={handleFileSelect} />
			</Button>
		</div>

		{#if propertiesForm.media.length > 0}
			<div class="space-y-2 mt-6">
				<Label class="text-right font-bold">الصور الجديدة المرفوعة</Label>
				<div class="grid grid-cols-3 gap-4">
					{#each propertiesForm.media as file, i (i)}
						{@const src = URL.createObjectURL(file)}
						{@render media(
							src,
							!file.type.startsWith('image/'),
							propertiesForm.thumbnail === i,
							() => {
								propertiesForm.thumbnail = i;
								propertiesForm.mainExistingMediaId = null;
							},
							() => removeFile(i)
						)}
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet media(
	src: string,
	isVideo: boolean,
	isThumbnail: boolean,
	onSetMain: () => void,
	onRemove: () => void,
	readOnly: boolean = false
)}
	<div
		class="relative group rounded-md border p-2 flex flex-col gap-2 transition-all {isThumbnail
			? 'border-primary ring-1 ring-primary bg-primary/5'
			: 'hover:border-muted-foreground/50'}">
		{#if !isVideo}
			<img {src} alt="preview" class="w-full h-24 object-cover rounded-sm border" />
		{:else}
			<div class="w-full h-24 bg-muted border flex items-center justify-center rounded-sm">
				<Video class="w-8 h-8 text-muted-foreground/50" />
			</div>
		{/if}

		<div class="flex items-center justify-between mt-auto pt-1">
			{#if readOnly}
				<span class="text-xs font-medium {isThumbnail ? 'text-primary' : 'text-muted-foreground'}">
					{isThumbnail ? '★ الرئيسية' : ''}
				</span>
			{:else}
				<button
					type="button"
					class="text-xs font-medium transition-colors {isThumbnail
						? 'text-primary'
						: 'text-muted-foreground hover:text-foreground'}"
					onclick={onSetMain}>
					{isThumbnail ? '★ الرئيسية' : 'تعيين كرئيسية'}
				</button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="h-6 w-6 text-destructive hover:bg-destructive/10"
					onclick={onRemove}>
					<Trash2 class="w-3.5 h-3.5" />
				</Button>
			{/if}
		</div>
	</div>
{/snippet}
