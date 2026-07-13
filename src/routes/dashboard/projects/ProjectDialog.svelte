<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { projectForm } from './state.svelte.js';
	import Icons from '$lib/components/Icons.svelte';
	import { Plus, Trash2, Upload, Video } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { invalidateAll } from '$app/navigation';
	let { parentProjects = [] } = $props();

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

	let currentParentLabel = $derived(
		projectForm.parentId === 'none'
			? 'مشروع رئيسي (مستقل)'
			: parentProjects.find((p) => p.id.toString() === projectForm.parentId)?.title || 'اختر المشروع'
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
	let isSubmitting = $state(false);

	async function submitForm() {
		isSubmitting = true;
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
		formData.append('locationName', projectForm.locationName);
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
				console.error('فشل الإرسال:', result);
			}
		} catch (error) {
			console.error('حدث خطأ أثناء الإرسال:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open={projectForm.isOpen}>
	<Dialog.Content class="sm:max-w-150 dark" interactOutsideBehavior="close">
		<Dialog.Header>
			<Dialog.Title class="text-right">{projectForm.projectId ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</Dialog.Title>
			<Dialog.Description class="text-right">
				الخطوة {projectForm.currentStep} من 4
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4 space-y-4" dir="rtl">
			{#if projectForm.currentStep === 1}
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
						<Label for="location" class="text-right">اسم الموقع / المنطقة</Label>
						<Input
							id="location"
							bind:value={projectForm.locationName}
							placeholder="مثال: غلا، مسقط"
							class="text-right" />
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
			{:else if projectForm.currentStep === 2}
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label class="text-right">يتبع لمشروع (اختياري)</Label>
						<Select.Root type="single" bind:value={projectForm.parentId}>
							<Select.Trigger class="text-right w-full">
								{currentParentLabel}
							</Select.Trigger>
							<Select.Content class="dark">
								<Select.Item value="none" class="text-right">مشروع رئيسي (مستقل)</Select.Item>
								{#each parentProjects as parent (parent.id)}
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
			{:else if projectForm.currentStep === 3}
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
										<Input
											bind:value={detail.description}
											placeholder="الوصف (مثال: 10 ر.ع شهرياً)"
											class="text-right" />
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
			{:else if projectForm.currentStep === 4}
				<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
					{#if projectForm.existingMedia.length > 0}
						<div class="space-y-2">
							<Label class="text-right font-bold">الصور الحالية</Label>
							<div class="grid grid-cols-3 gap-4">
								{#each projectForm.existingMedia as file (file.id)}
									<div
										class="relative group rounded-md border p-2 flex flex-col gap-2 transition-all {projectForm.mainExistingMediaId ===
											file.id && projectForm.thumbnailIndex === -1
											? 'border-primary ring-1 ring-primary bg-primary/5'
											: 'hover:border-muted-foreground/50'}">
										{#if file.type === 'image'}
											<img src={file.url} alt="preview" class="w-full h-24 object-cover rounded-sm border" />
										{:else}
											<div class="w-full h-24 bg-muted border flex items-center justify-center rounded-sm">
												<Video class="w-8 h-8 text-muted-foreground/50" />
											</div>
										{/if}

										<div class="flex items-center justify-between mt-auto pt-1">
											<button
												class="text-xs font-medium transition-colors {projectForm.mainExistingMediaId === file.id &&
												projectForm.thumbnailIndex === -1
													? 'text-primary'
													: 'text-muted-foreground hover:text-foreground'}"
												onclick={() => {
													projectForm.mainExistingMediaId = file.id;
													projectForm.thumbnailIndex = -1; // إلغاء تحديد الصورة الجديدة كرئيسية
												}}>
												{projectForm.mainExistingMediaId === file.id && projectForm.thumbnailIndex === -1
													? '★ الرئيسية'
													: 'تعيين كرئيسية'}
											</button>

											<Button
												variant="ghost"
												size="icon"
												class="h-6 w-6 text-destructive hover:bg-destructive/10"
												onclick={() => {
													projectForm.deletedMediaIds.push(file.id);
													projectForm.existingMedia = projectForm.existingMedia.filter((m) => m.id !== file.id);
												}}>
												<Trash2 class="w-3.5 h-3.5" />
											</Button>
										</div>
									</div>
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
									<div
										class="relative group rounded-md border p-2 flex flex-col gap-2 transition-all {projectForm.thumbnailIndex ===
										i
											? 'border-primary ring-1 ring-primary bg-primary/5'
											: 'hover:border-muted-foreground/50'}">
										{#if file.type.startsWith('image/')}
											<img
												src={URL.createObjectURL(file)}
												alt="preview"
												class="w-full h-24 object-cover rounded-sm border" />
										{:else}
											<div class="w-full h-24 bg-muted border flex items-center justify-center rounded-sm">
												<Video class="w-8 h-8 text-muted-foreground/50" />
											</div>
										{/if}

										<div class="flex items-center justify-between mt-auto pt-1">
											<button
												type="button"
												class="text-xs font-medium transition-colors {projectForm.thumbnailIndex === i
													? 'text-primary'
													: 'text-muted-foreground hover:text-foreground'}"
												onclick={() => {
													projectForm.thumbnailIndex = i;
													projectForm.mainExistingMediaId = null; // إلغاء تحديد الصورة القديمة كرئيسية
												}}>
												{projectForm.thumbnailIndex === i ? '★ الرئيسية' : 'تعيين كرئيسية'}
											</button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												class="h-6 w-6 text-destructive hover:bg-destructive/10"
												onclick={() => removeFile(i)}>
												<Trash2 class="w-3.5 h-3.5" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-between items-center w-full gap-2 mt-4" dir="rtl">
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
			</div>
			<Button type="button" variant="ghost" onclick={() => projectForm.closeDialog()}>إلغاء</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
