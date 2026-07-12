export class propertiesFormState {
	isOpen = $state(false);
	currentStep = $state(1);

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
	}
}

export const propertiesForm = new propertiesFormState();
