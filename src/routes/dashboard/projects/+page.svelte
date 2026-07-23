<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import Icons from '$lib/components/Icons.svelte';
	import LocationCombobox from '$lib/components/LocationCombobox.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	import { Plus, SquarePen, Trash2, Upload, Video, Eye } from '@lucide/svelte';
	import { projectForm } from './state.svelte.js';
	let { data } = $props();

	const formatCurrency = (amount: number | null) => {
		if (!amount) return '-';
		return new Intl.NumberFormat('ar-OM', { style: 'currency', currency: 'OMR' }).format(amount);
	};

	const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
		ready: { label: 'جاهز', variant: 'default' },
		under_construction: { label: 'قيد الإنشاء', variant: 'secondary' },
		off_plan: { label: 'مخطط', variant: 'outline' }
	};

	type Project = {
		id: number;
		title: string | null;
		developerName: string | null;
		completionPercentage: string | null;
		constructionStatus: 'ready' | 'under_construction' | 'off_plan' | null;
		startingPrice: number | null;
		isPublished: boolean;
	};

	const ownershipOptions = [
		{ value: 'omani_only', label: 'عمانيين' },
		{ value: 'gcc_only', label: 'خليجيين' },
		{ value: 'all_nationalities', label: 'جميع الجنسيات' }
	];

	const statusOptions = [
		{ value: 'off_plan', label: 'مخطط' },
		{ value: 'under_construction', label: 'قيد الإنشاء' },
		{ value: 'ready', label: 'جاهز' }
	];

	const percentageOptions = [
		{ value: '0', label: '0%' },
		{ value: '25', label: '25%' },
		{ value: '50', label: '50%' },
		{ value: '75', label: '75%' },
		{ value: '100', label: '100%' }
	];

	const availableIcons = [
		'Bike',
		'UtensilsCrossed',
		'Dumbbell',
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

	let currentParentLabel = $derived(
		projectForm.parentId === 'none'
			? 'مشروع رئيسي (مستقل)'
			: data.parentProjects.find((p) => p.id.toString() === projectForm.parentId)?.title || 'اختر المشروع'
	);

	let currentLocationLabel = $derived(
		data.locations.find((l) => l.id.toString() === projectForm.locationId)?.name || 'اختر الموقع'
	);

	let currentOwnershipLabel = $derived(
		ownershipOptions.find((o) => o.value === projectForm.ownershipType)?.label || 'اختر نوع التملك'
	);

	let currentStatusLabel = $derived(
		statusOptions.find((s) => s.value === projectForm.constructionStatus)?.label || 'اختر حالة البناء'
	);

	let currentPercentageLabel = $derived(
		percentageOptions.find((p) => p.value === String(projectForm.completionPercentage))?.label || 'اختر نسبة الإنجاز'
	);

	let isSubmitting = $state(false);
	let err_msg: string | null = $state(null);

	function addAmenity() {
		projectForm.amenities.push({ title: '', icon: availableIcons[0] });
	}

	function removeAmenity(index: number) {
		projectForm.amenities.splice(index, 1);
	}

	function addPaymentPlan() {
		projectForm.paymentPlans.push({ title: '', description: '' });
	}

	function removePaymentPlan(index: number) {
		projectForm.paymentPlans.splice(index, 1);
	}

	function addDetail() {
		projectForm.details.push({ title: '', description: '' });
	}

	function removeDetail(index: number) {
		projectForm.details.splice(index, 1);
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const newFiles = Array.from(input.files);
			projectForm.mediaFiles = [...projectForm.mediaFiles, ...newFiles];
		}
	}

	function removeFile(index: number) {
		projectForm.mediaFiles.splice(index, 1);

		if (projectForm.thumbnailIndex === index) {
			projectForm.thumbnailIndex = 0;
		} else if (projectForm.thumbnailIndex > index) {
			projectForm.thumbnailIndex -= 1;
		}
	}

	async function submitForm() {
		isSubmitting = true;
		err_msg = '';

		const formData = new FormData();
		if (projectForm.projectId) {
			formData.append('projectId', String(projectForm.projectId));
			formData.append('deletedMediaIds', JSON.stringify(projectForm.deletedMediaIds));
			if (projectForm.mainExistingMediaId) {
				formData.append('mainExistingMediaId', String(projectForm.mainExistingMediaId));
			}
		}
		formData.append('title', projectForm.title);
		formData.append('developerName', projectForm.developerName);
		formData.append('locationId', projectForm.locationId);
		formData.append('description', projectForm.description);

		formData.append('ownershipType', projectForm.ownershipType);
		formData.append('constructionStatus', projectForm.constructionStatus);
		formData.append('completionPercentage', projectForm.completionPercentage);
		if (projectForm.startingPrice) {
			formData.append('startingPrice', String(projectForm.startingPrice));
		}
		if (projectForm.deliveryDate) {
			formData.append('deliveryDate', projectForm.deliveryDate);
		}
		formData.append('isPublished', String(projectForm.isPublished));

		// إضافة الحقول الديناميكية (JSON)
		formData.append('amenities', JSON.stringify(projectForm.amenities));
		formData.append('paymentPlans', JSON.stringify(projectForm.paymentPlans));
		formData.append('details', JSON.stringify(projectForm.details));

		// إضافة الوسائط
		formData.append('thumbnailIndex', String(projectForm.thumbnailIndex));
		projectForm.mediaFiles.forEach((file) => {
			formData.append('mediaFiles', file);
		});

		try {
			const actionUrl = projectForm.projectId ? '?/updateProject' : '?/createProject';
			// إرسال البيانات إلى +page.server.ts
			const response = await fetch(actionUrl, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				// إغلاق النافذة وتحديث الجدول تلقائياً
				projectForm.resetForm();
				projectForm.closeDialog();
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
					<Breadcrumb.Page>إدارة المشاريع</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<!-- <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" /> -->
		<Button
			variant="outline"
			onclick={() => {
				projectForm.resetForm();
				projectForm.openDialog();
			}}>إضافة مشروع جديد<Plus /></Button>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 p-4 md:px-16" dir="rtl">
	<div class="rounded-2xl border bg-background">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">اسم المشروع</Table.Head>
					<Table.Head class="text-right">اسم المطور</Table.Head>
					<Table.Head class="text-right">حالة البناء</Table.Head>
					<Table.Head class="text-right">نسبة الإنجاز</Table.Head>
					<Table.Head class="text-right">السعر المبدئي</Table.Head>
					<Table.Head class="text-center">الحالة</Table.Head>
					<Table.Head class="text-left">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#each data.projects as project (project.id)}
					{@render row(project)}
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="text-center py-10 text-muted-foreground">
							<div class="flex flex-col items-center gap-4">
								<span class="mb-0"> لا توجد مشاريع مضافة حتى الآن.</span>
								<Button variant="outline" onclick={() => projectForm.openDialog()}>إضافة مشروع جديد<Plus /></Button>
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
					(إجمالي {data.pagination.totalCount} مشروع)
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						href="?page={data.pagination.currentPage - 1}"
						disabled={data.pagination.currentPage <= 1}>
						السابق
					</Button>
					<Button
						variant="outline"
						size="sm"
						href="?page={data.pagination.currentPage + 1}"
						disabled={data.pagination.currentPage >= data.pagination.totalPages}>
						التالي
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

{@render dialog()}

{#snippet row(project: Project)}
	<Table.Row>
		<Table.Cell class="font-medium">
			{project.title}
		</Table.Cell>

		<Table.Cell>
			{project.developerName}
		</Table.Cell>

		<Table.Cell>
			{#if project.constructionStatus && statusMap[project.constructionStatus]}
				<Badge variant={statusMap[project.constructionStatus].variant}>
					{statusMap[project.constructionStatus].label}
				</Badge>
			{:else}
				<Badge variant="outline">غير محدد</Badge>
			{/if}
		</Table.Cell>

		<Table.Cell class="w-50">
			<div class="flex items-center gap-3">
				<Progress value={Number(project.completionPercentage || 0)} class="h-2 w-full" />
				<span class="text-xs text-muted-foreground w-[3ch] text-left">
					{project.completionPercentage || 0}%
				</span>
			</div>
		</Table.Cell>

		<Table.Cell>
			{formatCurrency(project.startingPrice)}
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
				id="publish-form-{project.id}">
				<input type="hidden" name="id" value={project.id} />
				<input type="hidden" name="isPublished" value={!project.isPublished} />

				<Switch
					checked={project.isPublished}
					onclick={() => {
						const form = document.getElementById(`publish-form-${project.id}`) as HTMLFormElement;
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
							const res = await fetch(`/api/projects/${project.id}`);
							if (res.ok) {
								projectForm.openView(await res.json());
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
						btn.disabled = true; // لمنع الضغط المتكرر
						try {
							const res = await fetch(`/api/projects/${project.id}`);
							if (res.ok) {
								const fullData = await res.json();
								projectForm.populate(fullData);
								projectForm.openDialog();
							} else {
								alert('حدث خطأ أثناء جلب بيانات المشروع');
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
					action="?/deleteProject"
					use:enhance={() => {
						return async ({ update }) => {
							update(); // تحديث واجهة المستخدم
						};
					}}>
					<input type="hidden" name="id" value={project.id} />

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

{#snippet dialog()}
	<Dialog.Root bind:open={projectForm.isOpen}>
		<Dialog.Content class="sm:max-w-150 dark" interactOutsideBehavior="close">
			<Dialog.Header>
				<Dialog.Title class="text-right">
					{projectForm.mode === 'view'
						? 'تفاصيل المشروع'
						: projectForm.projectId
							? 'تعديل المشروع'
							: 'إضافة مشروع جديد'}
				</Dialog.Title>
				{#if projectForm.mode !== 'view'}
					<Dialog.Description class="text-right">الخطوة {projectForm.currentStep} من 4</Dialog.Description>
				{/if}
			</Dialog.Header>

			{#if projectForm.mode === 'view'}
				<div class="py-4 space-y-4" dir="rtl">
					{@render viewBody()}
				</div>
				<Dialog.Footer class="flex justify-end items-center w-full gap-2 mt-4" dir="rtl">
					<Button type="button" variant="ghost" onclick={() => projectForm.closeDialog()}>إغلاق</Button>
				</Dialog.Footer>
			{:else}
				<div class="py-4 space-y-4" dir="rtl">
					{#if projectForm.currentStep === 1}
						{@render firstInformationForm()}
					{:else if projectForm.currentStep === 2}
						{@render secondInformationForm()}
					{:else if projectForm.currentStep === 3}
						{@render amenityForm()}
					{:else if projectForm.currentStep === 4}
						{@render mediaUploadForm()}
					{/if}
				</div>

				<Dialog.Footer class="flex justify-between items-center w-full gap-2 mt-4" dir="rtl">
					<div class="flex grow gap-2">
						<div class="text-red-400 text-xs">{err_msg}</div>
					</div>
					<div class="flex gap-2">
						{#if projectForm.currentStep > 1}
							<Button type="button" variant="outline" onclick={() => projectForm.prevStep()}>السابق</Button>
						{/if}

						<Button
							type="button"
							onsubmit={(e) => e.preventDefault()}
							onclick={() => (projectForm.currentStep === 4 ? submitForm() : projectForm.nextStep())}
							disabled={isSubmitting}>
							{isSubmitting ? 'جاري الحفظ...' : projectForm.currentStep === 4 ? 'حفظ البيانات' : 'التالي'}
						</Button>
						<Button type="button" variant="ghost" onclick={() => projectForm.closeDialog()}>إلغاء</Button>
					</div>
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet firstInformationForm()}
	<div class="space-y-4">
		<div class="grid gap-2">
			<Label for="title" class="text-right">اسم المشروع</Label>
			<Input id="title" bind:value={projectForm.title} placeholder="مثال: مشروع تلال مسقط" class="text-right" />
		</div>

		<div class="grid gap-2">
			<Label for="developer" class="text-right">اسم المطور العقاري</Label>
			<Input
				id="developer"
				bind:value={projectForm.developerName}
				placeholder="مثال: الشركة العقارية الرائدة"
				class="text-right" />
		</div>

		<div class="grid gap-2">
			<Label class="text-right">الموقع</Label>
			<LocationCombobox locations={data.locations} bind:value={projectForm.locationId} showType />
		</div>

		<div class="grid gap-2">
			<Label for="desc" class="text-right">وصف المشروع</Label>
			<Textarea
				id="desc"
				bind:value={projectForm.description}
				placeholder="اكتب وصفاً تفصيلياً للمشروع المميزات المحيطة به..."
				class="text-right min-h-25 max-h-50" />
		</div>
	</div>
{/snippet}

{#snippet secondInformationForm()}
	<div class="grid grid-cols-2 gap-4">
		<div class="grid gap-2">
			<Label class="text-right">يتبع لمشروع (اختياري)</Label>
			<Select.Root type="single" bind:value={projectForm.parentId}>
				<Select.Trigger class="text-right w-full">
					{currentParentLabel}
				</Select.Trigger>
				<Select.Content class="dark">
					<Select.Item value="none" class="text-right">مشروع رئيسي (مستقل)</Select.Item>
					{#each data.parentProjects as parent (parent.id)}
						<Select.Item value={parent.id.toString()} class="text-right">{parent.title}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="grid gap-2">
			<Label class="text-right">نوع التملك</Label>
			<Select.Root type="single" bind:value={projectForm.ownershipType}>
				<Select.Trigger class="text-right w-full">
					{currentOwnershipLabel}
				</Select.Trigger>
				<Select.Content class="dark">
					{#each ownershipOptions as option (option.value)}
						<Select.Item value={option.value} class="text-right">{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid gap-2">
			<Label class="text-right">حالة البناء</Label>
			<Select.Root type="single" bind:value={projectForm.constructionStatus}>
				<Select.Trigger class="text-right w-full">
					{currentStatusLabel}
				</Select.Trigger>
				<Select.Content class="dark">
					{#each statusOptions as option (option.value)}
						<Select.Item value={option.value} class="text-right">{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid gap-2">
			<Label class="text-right">نسبة الإنجاز</Label>
			<Select.Root type="single" bind:value={projectForm.completionPercentage}>
				<Select.Trigger class="text-right w-full">
					{currentPercentageLabel}
				</Select.Trigger>
				<Select.Content class="dark">
					{#each percentageOptions as option (option.value)}
						<Select.Item value={option.value} class="text-right">{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="grid gap-2 col-span-2">
			<Label for="price" class="text-right">السعر المبدئي (ر.ع)</Label>
			<Input id="price" type="text" bind:value={projectForm.startingPrice} placeholder="0" class="text-right" />
		</div>

		<div class="grid gap-2 col-span-2">
			<Label for="delivery" class="text-right">تاريخ التسليم المتوقع</Label>
			<Input id="delivery" type="date" bind:value={projectForm.deliveryDate} class="text-right" />
		</div>

		<div class="flex items-center gap-2 pt-4 col-span-2">
			<input
				type="checkbox"
				id="publish"
				bind:checked={projectForm.isPublished}
				class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
			<Label for="publish" class="text-right cursor-pointer">نشر المشروع مباشرة في الموقع العام</Label>
		</div>
	</div>
{/snippet}

{#snippet amenityForm()}
	<div class="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		<div>
			<div class="flex justify-between items-center mb-4">
				<Label class="text-right font-bold text-lg">المرافق والخدمات</Label>
				<Button variant="outline" size="sm" onclick={addAmenity}>
					<Plus class="h-4 w-4 ml-2" /> إضافة
				</Button>
			</div>

			<div class="space-y-3">
				{#each projectForm.amenities as amenity, i (i)}
					<div class="flex gap-2 items-start bg-muted/30 p-3 rounded-md border">
						<div class="grid gap-2 flex-1">
							<Input bind:value={amenity.title} placeholder="العنوان (مثال: مسبح خاص)" class="text-right h-10" />
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
							onclick={() => removeAmenity(i)}
							class="text-destructive hover:bg-destructive/10 mt-0.5">
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				{#if projectForm.amenities.length === 0}
					<p class="text-sm text-muted-foreground text-center py-2">لا توجد مرافق مضافة.</p>
				{/if}
			</div>
		</div>

		<Separator />

		<div>
			<div class="flex justify-between items-center mb-4">
				<Label class="text-right font-bold text-lg">خطط الدفع</Label>
				<Button variant="outline" size="sm" onclick={addPaymentPlan}>
					<Plus class="h-4 w-4 ml-2" /> إضافة
				</Button>
			</div>

			<div class="space-y-3">
				{#each projectForm.paymentPlans as plan, i (i)}
					<div class="flex gap-2 items-start bg-muted/30 p-3 rounded-md border">
						<div class="grid gap-2 flex-1">
							<Input bind:value={plan.title} placeholder="عنوان الخطة (مثال: دفع كاش)" class="text-right" />
							<Textarea
								bind:value={plan.description}
								placeholder="التفاصيل (مثال: 10% مقدم و 90% عند الاستلام)"
								class="text-right text-sm min-h-15" />
						</div>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => removePaymentPlan(i)}
							class="text-destructive hover:bg-destructive/10 mt-0.5">
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				{#if projectForm.paymentPlans.length === 0}
					<p class="text-sm text-muted-foreground text-center py-2">لا توجد خطط دفع مضافة.</p>
				{/if}
			</div>
		</div>

		<Separator />

		<div>
			<div class="flex justify-between items-center mb-4">
				<Label class="text-right font-bold text-lg">تفاصيل إضافية</Label>
				<Button variant="outline" size="sm" onclick={addDetail}>
					<Plus class="h-4 w-4 ml-2" /> إضافة
				</Button>
			</div>

			<div class="space-y-3">
				{#each projectForm.details as detail, i (i)}
					<div class="flex gap-2 items-start bg-muted/30 p-3 rounded-md border">
						<div class="grid gap-2 flex-[0.4]">
							<Input bind:value={detail.title} placeholder="العنوان (مثال: رسوم الصيانة)" class="text-right" />
						</div>
						<div class="grid gap-2 flex-[0.6]">
							<Input bind:value={detail.description} placeholder="الوصف (مثال: 10 ر.ع شهرياً)" class="text-right" />
						</div>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => removeDetail(i)}
							class="text-destructive hover:bg-destructive/10 mt-0.5">
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				{#if projectForm.details.length === 0}
					<p class="text-sm text-muted-foreground text-center py-2">لا توجد تفاصيل إضافية مضافة.</p>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet mediaUploadForm()}
	<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		{#if projectForm.existingMedia.length > 0}
			<div class="space-y-2">
				<Label class="text-right font-bold">الصور الحالية</Label>
				<div class="grid grid-cols-3 gap-4">
					{#each projectForm.existingMedia as file (file.id)}
						{@render media(
							file.url,
							file.type === 'video',
							projectForm.mainExistingMediaId === file.id && projectForm.thumbnailIndex === -1,
							() => {
								projectForm.mainExistingMediaId = file.id;
								projectForm.thumbnailIndex = -1; // إلغاء تحديد الصورة الجديدة كرئيسية
							},
							() => {
								projectForm.deletedMediaIds.push(file.id);
								projectForm.existingMedia = projectForm.existingMedia.filter((m) => m.id !== file.id);
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
				<h3 class="font-medium text-lg">ارفع صور وفيديوهات المشروع</h3>
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
		{#if projectForm.mediaFiles.length > 0}
			<div class="space-y-2 mt-6">
				<Label class="text-right font-bold">الصور الجديدة المرفوعة</Label>
				<div class="grid grid-cols-3 gap-4">
					{#each projectForm.mediaFiles as file, i (i)}
						{@const src = URL.createObjectURL(file)}
						{@render media(
							src,
							!file.type.startsWith('image/'),
							projectForm.thumbnailIndex === i,
							() => {
								projectForm.thumbnailIndex = i;
								projectForm.mainExistingMediaId = null; // إلغاء تحديد الصورة القديمة كرئيسية
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

{#snippet viewField(label: string, value: string)}
	<div class="grid gap-1">
		<Label class="text-right text-muted-foreground text-xs">{label}</Label>
		<p class="text-right text-sm">{value || '-'}</p>
	</div>
{/snippet}

{#snippet viewBody()}
	<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" dir="rtl">
		<div class="grid grid-cols-2 gap-4">
			{@render viewField('اسم المشروع', projectForm.title)}
			{@render viewField('اسم المطور', projectForm.developerName)}
			{@render viewField('الموقع', currentLocationLabel)}
			{@render viewField('نوع التملك', currentOwnershipLabel)}
			{@render viewField('حالة البناء', currentStatusLabel)}
			{@render viewField('نسبة الإنجاز', currentPercentageLabel)}
			{@render viewField('السعر المبدئي', formatCurrency(projectForm.startingPrice ?? null))}
			{@render viewField('تاريخ التسليم', projectForm.deliveryDate)}
			<div class="grid gap-1">
				<Label class="text-right text-muted-foreground text-xs">حالة النشر</Label>
				<Badge variant={projectForm.isPublished ? 'default' : 'outline'} class="w-fit">
					{projectForm.isPublished ? 'منشور' : 'غير منشور'}
				</Badge>
			</div>
		</div>

		<div class="grid gap-1">
			<Label class="text-right text-muted-foreground text-xs">وصف المشروع</Label>
			<p class="text-right text-sm whitespace-pre-wrap">{projectForm.description || '-'}</p>
		</div>

		<Separator />
		<div>
			<Label class="text-right font-bold">المرافق والخدمات</Label>
			{#if projectForm.amenities.length > 0}
				<div class="grid grid-cols-2 gap-3 mt-3">
					{#each projectForm.amenities as amenity, i (i)}
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
			{#if projectForm.paymentPlans.length > 0}
				<div class="space-y-2 mt-3">
					{#each projectForm.paymentPlans as plan, i (i)}
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
			{#if projectForm.details.length > 0}
				<div class="space-y-2 mt-3">
					{#each projectForm.details as detail, i (i)}
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

		{#if projectForm.existingMedia.length > 0}
			<Separator />
			<div class="space-y-2">
				<Label class="text-right font-bold">الوسائط</Label>
				<div class="grid grid-cols-3 gap-4">
					{#each projectForm.existingMedia as file (file.id)}
						{@render media(
							file.url,
							file.type === 'video',
							projectForm.mainExistingMediaId === file.id,
							() => {},
							() => {},
							true
						)}
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/snippet}
