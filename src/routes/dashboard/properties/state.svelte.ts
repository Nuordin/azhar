export class propertiesFormState {
	isOpen = $state(false);
	currentStep = $state(1);
	mode = $state<'edit' | 'view'>('edit');

	// Form state
	unitId: string = $state('');
	parentId: string = $state('');
	name: string = $state('');
	developer: string = $state('');
	type: string = $state('');
	status: string = $state('');
	offerType: string = $state('');
	categoryType: string = $state('');
	description: string = $state('');
	location: string = $state('');
	price: string = $state('');
	ownershipType: string = $state('');
	deliveryDate: string = $state('');
	completionProgress: string = $state('');
	constructionStatus: string = $state('');
	bedroomCount: string = $state('');
	bathroomCount: string = $state('');
	area: string = $state('');
	amenities: { title: string; icon: string }[] = $state([]);
	paymentPlans: { title: string; description: string }[] = $state([]);
	details: { title: string; description: string }[] = $state([]);
	media = $state<File[]>([]);
	thumbnail: number = $state(0);
	isPublished: boolean = $state(true);

	existingMedia = $state<{ id: number; url: string; type: string; isMain: boolean }[]>([]);
	deletedMediaIds = $state<number[]>([]);
	mainExistingMediaId = $state<number | null>(null);

	openDialog() {
		this.mode = 'edit';
		this.isOpen = true;
		this.currentStep = 1;
	}

	// دالة تعبئة البيانات عند التعديل
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	populate(data: any) {
		this.unitId = String(data.unit.id);
		this.parentId = data.unit.projectId ? String(data.unit.projectId) : '';
		this.type = data.unit.type ?? '';
		this.status = data.unit.status ?? '';
		this.categoryType = data.unit.category ?? '';
		this.offerType = data.unit.offerType ?? '';
		this.ownershipType = data.unit.ownershipType ?? '';
		this.constructionStatus = data.unit.constructionStatus ?? '';
		this.completionProgress = data.unit.completionPercentage ?? '';
		this.price = String(data.unit.price ?? '');
		this.area = String(data.unit.area ?? '');
		this.bedroomCount = String(data.unit.bedrooms ?? '');
		this.bathroomCount = String(data.unit.bathrooms ?? '');
		this.deliveryDate = data.unit.deliveryDate
			? new Date(data.unit.deliveryDate).toISOString().split('T')[0]
			: '';
		this.isPublished = data.unit.isPublished;

		this.name = data.translations?.title || '';
		this.developer = data.translations?.developer || '';
		this.location = data.translations?.locationName || '';
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
		this.thumbnail = -1;
		this.media = [];
	}

	openView(data: unknown) {
		this.populate(data);
		this.mode = 'view';
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

	resetForm() {
		this.unitId = '';
		this.parentId = '';
		this.name = '';
		this.developer = '';
		this.type = '';
		this.status = '';
		this.offerType = '';
		this.categoryType = '';
		this.description = '';
		this.location = '';
		this.price = '';
		this.ownershipType = '';
		this.deliveryDate = '';
		this.completionProgress = '';
		this.constructionStatus = '';
		this.bedroomCount = '';
		this.bathroomCount = '';
		this.area = '';
		this.amenities = [];
		this.paymentPlans = [];
		this.details = [];
		this.media = [];
		this.thumbnail = 0;
		this.isPublished = true;
		this.mode = 'edit';
		this.existingMedia = [];
		this.deletedMediaIds = [];
		this.mainExistingMediaId = null;
	}
}

export const propertiesForm = new propertiesFormState();
