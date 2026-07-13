import { SvelteDate } from 'svelte/reactivity';

export class ProjectFormState {
	isOpen = $state(false);
	currentStep = $state(1);

	projectId = $state<number | null>(null);
	parentId = $state<string>('none');

	title = $state('');
	developerName = $state('');
	locationName = $state('');
	description = $state('');

	ownershipType = $state('');
	constructionStatus = $state('');
	completionPercentage = $state('');
	startingPrice = $state<number | undefined>(undefined);
	deliveryDate = $state('');
	isPublished = $state(true);

	amenities = $state<{ title: string; icon: string }[]>([]);
	paymentPlans = $state<{ title: string; description: string }[]>([]);
	details = $state<{ title: string; description: string }[]>([]);

	mediaFiles = $state<File[]>([]);
	thumbnailIndex = $state<number>(-1);

	existingMedia = $state<{ id: number; url: string; type: string; isMain: boolean }[]>([]);
	deletedMediaIds = $state<number[]>([]);
	mainExistingMediaId = $state<number | null>(null);

	openDialog() {
		this.isOpen = true;
		this.currentStep = 1;
	}

	closeDialog() {
		this.isOpen = false;
	}

	nextStep() {
		if (this.currentStep < 4) this.currentStep += 1;
	}

	prevStep() {
		if (this.currentStep > 1) this.currentStep -= 1;
	}

	// دالة تعبئة البيانات عند التعديل
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	populate(data: any) {
		this.projectId = data.project.id;
		this.parentId = data.project.parentId ? data.project.parentId.toString() : 'none';
		this.ownershipType = data.project.ownershipType;
		this.constructionStatus = data.project.constructionStatus;
		this.completionPercentage = data.project.completionPercentage;
		this.startingPrice = data.project.startingPrice;

		this.deliveryDate = data.project.deliveryDate
			? new SvelteDate(data.project.deliveryDate).toISOString().split('T')[0]
			: '';
		this.isPublished = data.project.isPublished;

		this.title = data.translations?.title || '';
		this.developerName = data.translations?.developerName || '';
		this.locationName = data.translations?.locationName || '';
		this.description = data.translations?.description || '';

		this.amenities = data.translations?.amenities || [];
		this.paymentPlans = data.translations?.paymentPlans || [];
		this.details = data.translations?.details || [];

		this.existingMedia = data.media || [];
		this.deletedMediaIds = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const mainMedia = this.existingMedia.find((m: any) => m.isMain);
		this.mainExistingMediaId = mainMedia
			? mainMedia.id
			: this.existingMedia.length > 0
				? this.existingMedia[0].id
				: null;
		this.thumbnailIndex = -1;
		this.mediaFiles = [];
	}

	resetForm() {
		this.projectId = null;
		this.currentStep = 1;
		this.parentId = 'none';
		this.title = '';
		this.developerName = '';
		this.locationName = '';
		this.description = '';
		this.ownershipType = '';
		this.constructionStatus = '';
		this.completionPercentage = '0';
		this.startingPrice = undefined;
		this.deliveryDate = '';
		this.isPublished = false;
		this.amenities = [];
		this.paymentPlans = [];
		this.details = [];
		this.mediaFiles = [];
		this.thumbnailIndex = 0; // افتراضياً للجديد
		this.existingMedia = [];
		this.deletedMediaIds = [];
		this.mainExistingMediaId = null;
	}
}

export const projectForm = new ProjectFormState();
