// ============================================
// Mock Data for Pet Management Application
// ============================================

export interface Pet {
	id: string;
	name: string;
	species: string;
	breed: string;
	gender: string;
	age: string;
	weight: string;
	image: string;
	color: string;
	status: string;
}

export interface HealthRecord {
	id: string;
	petId: string;
	type: string;
	date: string;
	vet: string;
	description: string;
	cost: number;
}

export interface Expense {
	id: string;
	petId: string;
	category: string;
	description: string;
	date: string;
	amount: number;
}

export interface CarePlanItem {
	id: string;
	petId: string;
	title: string;
	frequency: string;
	nextDate: string;
	status: 'completed' | 'upcoming' | 'overdue';
	items: string[];
}

export interface CareRecommendation {
	id: string;
	petId: string;
	type: string;
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
	dueDate: string;
}

export interface Reminder {
	id: string;
	petId: string;
	petName: string;
	type: string;
	title: string;
	description: string;
	date: string;
	time: string;
	repeat: string;
	status: 'active' | 'completed' | 'snoozed';
}

// ============================================
// Pets
// ============================================
export const pets: Pet[] = [
	{
		id: '1',
		name: 'โมจิ',
		species: 'แมว',
		breed: 'สก็อตติชโฟลด์',
		gender: 'เพศเมีย',
		age: '2 ปี 3 เดือน',
		weight: '3.5 กก.',
		image: '🐱',
		color: 'ส้ม',
		status: 'ปกติ'
	},
	{
		id: '2',
		name: 'โบสัน',
		species: 'หมา',
		breed: 'โกลเดนรีทรีฟเวอร์',
		gender: 'เพศผู้',
		age: '4 ปี 1 เดือน',
		weight: '28.0 กก.',
		image: '🐕',
		color: 'ทอง',
		status: 'ปกติ'
	},
	{
		id: '3',
		name: 'ชาบู',
		species: 'แมว',
		breed: 'บริติชชอร์ตแฮร์',
		gender: 'เพศผู้',
		age: '1 ปี 6 เดือน',
		weight: '4.2 กก.',
		image: '🐈',
		color: 'เทา',
		status: 'ต้องฉีดวัคซีน'
	},
	{
		id: '4',
		name: 'โคโค่',
		species: 'หมา',
		breed: 'ปอมเมอเรเนียน',
		gender: 'เพศเมีย',
		age: '3 ปี',
		weight: '2.8 กก.',
		image: '🐶',
		color: 'น้ำตาล',
		status: 'ปกติ'
	},
	{
		id: '5',
		name: 'มิกกี้',
		species: 'กระต่าย',
		breed: 'ฮอลแลนด์ลอป',
		gender: 'เพศผู้',
		age: '8 เดือน',
		weight: '1.5 กก.',
		image: '🐰',
		color: 'ขาว-เทา',
		status: 'ปกติ'
	}
];

// ============================================
// Health Records
// ============================================
export const healthRecords: HealthRecord[] = [
	{
		id: 'hr1',
		petId: '1',
		type: 'วัคซีน',
		date: '2026-06-15',
		vet: 'คลินิกรักษ์สัตว์',
		description: 'ฉีดวัคซีนเริ่มต้น (FVRCP)',
		cost: 800
	},
	{
		id: 'hr2',
		petId: '1',
		type: 'ตรวจสุขภาพ',
		date: '2026-05-20',
		vet: 'คลินิกรักษ์สัตว์',
		description: 'ตรวจสุขภาพประจำปี ผลปกติ',
		cost: 500
	},
	{
		id: 'hr3',
		petId: '2',
		type: 'ทันตกรรม',
		date: '2026-06-01',
		vet: 'สัตว์พยาบาล คลินิก',
		description: 'ขัดฟันและตรวจช่องปาก',
		cost: 1200
	},
	{
		id: 'hr4',
		petId: '2',
		type: 'วัคซีน',
		date: '2026-04-10',
		vet: 'คลินิกรักษ์สัตว์',
		description: 'ฉีดวัคซีนพิษสุนัขบ้า (Rabies)',
		cost: 350
	},
	{
		id: 'hr5',
		petId: '3',
		type: 'วัคซีน',
		date: '2026-03-25',
		vet: 'สัตว์พยาบาล คลินิก',
		description: 'ฉีดวัคซีน FVRCP Booster',
		cost: 750
	},
	{
		id: 'hr6',
		petId: '4',
		type: 'ตรวจสุขภาพ',
		date: '2026-07-01',
		vet: 'คลินิกเพ็ทคาร์',
		description: 'ตรวจเลือดปกติ น้ำหนักตามเกณฑ์',
		cost: 650
	},
	{
		id: 'hr7',
		petId: '1',
		type: 'ขูดหู',
		date: '2026-07-05',
		vet: 'คลินิกรักษ์สัตว์',
		description: 'ทำความสะอาดหู เพื่อป้องกันเชื้อรา',
		cost: 300
	}
];

// ============================================
// Expenses
// ============================================
export const expenses: Expense[] = [
	{ id: 'ex1', petId: '1', category: 'อาหาร', description: 'อาหารเม็ดแมว Royal Canin', date: '2026-07-10', amount: 890 },
	{ id: 'ex2', petId: '2', category: 'อาหาร', description: 'อาหารหมาออริเจน 15kg', date: '2026-07-08', amount: 2500 },
	{ id: 'ex3', petId: '1', category: 'วัคซีน', description: 'ฉีดวัคซีน FVRCP', date: '2026-06-15', amount: 800 },
	{ id: 'ex4', petId: '2', category: 'ทันตกรรม', description: 'ขัดฟันและตรวจช่องปาก', date: '2026-06-01', amount: 1200 },
	{ id: 'ex5', petId: '3', category: 'อาหาร', description: 'อาหารเปียกแมว Whiskas', date: '2026-07-05', amount: 320 },
	{ id: 'ex6', petId: '4', category: 'ของเล่น', description: 'ของเล่นเหมือนจริง', date: '2026-07-02', amount: 450 },
	{ id: 'ex7', petId: '2', category: 'วัคซีน', description: 'ฉีดวัคซีนพิษสุนัขบ้า', date: '2026-04-10', amount: 350 },
	{ id: 'ex8', petId: '1', category: 'ขูดหู', description: 'ทำความสะอาดหู', date: '2026-07-05', amount: 300 },
	{ id: 'ex9', petId: '5', category: 'อาหาร', description: 'อาหารกระต่าย มัดผัก', date: '2026-07-09', amount: 200 },
	{ id: 'ex10', petId: '3', category: 'ยา', description: 'ยาถ่ายพยาธิ', date: '2026-06-20', amount: 280 },
	{ id: 'ex11', petId: '4', category: 'ตรวจสุขภาพ', description: 'ตรวจเลือดประจำปี', date: '2026-07-01', amount: 650 },
	{ id: 'ex12', petId: '2', category: 'อาหาร', description: 'ขนมรางวัลหมา', date: '2026-07-11', amount: 180 }
];

// ============================================
// Expense Summary (for dashboard)
// ============================================
export const expenseSummary = {
	totalThisMonth: 7920,
	averagePerMonth: 8500,
	byCategory: [
		{ category: 'อาหาร', amount: 4090, percentage: 51.6 },
		{ category: 'วัคซีน', amount: 1150, percentage: 14.5 },
		{ category: 'ทันตกรรม', amount: 1200, percentage: 15.2 },
		{ category: 'ตรวจสุขภาพ', amount: 650, percentage: 8.2 },
		{ category: 'อื่นๆ', amount: 830, percentage: 10.5 }
	],
	monthlyTrend: [
		{ month: 'ม.ค.', amount: 7200 },
		{ month: 'ก.พ.', amount: 5800 },
		{ month: 'มี.ค.', amount: 9100 },
		{ month: 'เม.ย.', amount: 6400 },
		{ month: 'พ.ค.', amount: 10200 },
		{ month: 'มิ.ย.', amount: 8500 },
		{ month: 'ก.ค.', amount: 7920 }
	]
};

// ============================================
// Care Plans
// ============================================
export const carePlans: CarePlanItem[] = [
	{
		id: 'cp1',
		petId: '1',
		title: 'แผนดูแลสุขภาพประจำเดือน',
		frequency: 'รายเดือน',
		nextDate: '2026-08-01',
		status: 'upcoming',
		items: ['ตรวจน้ำหนัก', 'เช็คสภาพขน', 'ทำความสะอาดหู', 'ตัดเล็บ']
	},
	{
		id: 'cp2',
		petId: '2',
		title: 'แผนออกกำลังกาย',
		frequency: 'รายวัน',
		nextDate: '2026-07-15',
		status: 'completed',
		items: ['เดินเล่น 30 นาที', 'วิ่งเล่นในสวน', 'ฝึกสั่งการ']
	},
	{
		id: 'cp3',
		petId: '1',
		title: 'แผนฉีดวัคซีนปี 2569',
		frequency: 'รายปี',
		nextDate: '2026-12-15',
		status: 'upcoming',
		items: ['FVRCP Booster', 'Rabies', 'FeLV']
	},
	{
		id: 'cp4',
		petId: '3',
		title: 'แผนดูแลสุขภาพเล็บ',
		frequency: 'ราย 2 สัปดาห์',
		nextDate: '2026-07-20',
		status: 'upcoming',
		items: ['ตัดเล็บ', 'เช็คตุ่มพยาธิ']
	},
	{
		id: 'cp5',
		petId: '5',
		title: 'แผนดูแลกระต่าย',
		frequency: 'รายสัปดาห์',
		nextDate: '2026-07-18',
		status: 'upcoming',
		items: ['ตรวจฟัน', 'เปลี่ยนรองกระต่าย', 'ตรวจน้ำหนัก']
	}
];

// ============================================
// Care Recommendations
// ============================================
export const careRecommendations: CareRecommendation[] = [
	{
		id: 'rec1',
		petId: '1',
		type: 'วัคซีน',
		title: 'ควรฉีดวัคซีน Booster ภายในเดือนธันวาคม',
		description: 'โมจิควรได้รับวัคซีน FVRCP Booster และ Rabies เพื่อป้องกันโรคติดเชื้อ',
		priority: 'medium',
		dueDate: '2026-12-15'
	},
	{
		id: 'rec2',
		petId: '2',
		type: 'ออกกำลังกาย',
		title: 'เพิ่มเวลาเดินเล่นให้โบสัน',
		description: 'โบสันมีน้ำหนักเกินเกณฑ์เล็กน้อย แนะนำให้เดินเล่นเพิ่มเป็น 45 นาที/วัน',
		priority: 'high',
		dueDate: '2026-07-30'
	},
	{
		id: 'rec3',
		petId: '3',
		type: 'สุขภาพ',
		title: 'นัดตรวจสุขภาพประจำปี',
		description: 'ชาบูควรตรวจสุขภาพประจำปีและฉีดวัคซีนเสริม',
		priority: 'high',
		dueDate: '2026-08-10'
	},
	{
		id: 'rec4',
		petId: '4',
		type: 'อาหาร',
		title: 'ปรับปริมาณอาหารโคโค่',
		description: 'โคโค่น้ำหนักเหมาะสม แต่ควรควบคุมขนมรางวัลไม่เกิน 2 ชิ้น/วัน',
		priority: 'low',
		dueDate: '2026-08-01'
	},
	{
		id: 'rec5',
		petId: '1',
		type: 'ทำความสะอาด',
		title: 'นัดอาบน้ำและตัดขน',
		description: 'แนะนำอาบน้ำทุก 2-3 สัปดาห์ เพื่อรักษาสุขภาพผิวหนังและขน',
		priority: 'low',
		dueDate: '2026-07-25'
	}
];

// ============================================
// Reminders
// ============================================
export const reminders: Reminder[] = [
	{
		id: 'rem1',
		petId: '1',
		petName: 'โมจิ',
		type: 'วัคซีน',
		title: 'ฉีดวัคซีน FVRCP Booster',
		description: 'นัดฉีดวัคซีนที่คลินิกรักษ์สัตว์',
		date: '2026-12-15',
		time: '10:00',
		repeat: 'ไม่ซ้ำ',
		status: 'active'
	},
	{
		id: 'rem2',
		petId: '2',
		petName: 'โบสัน',
		type: 'ออกกำลังกาย',
		title: 'เดินเล่นช่วงเช้า',
		description: 'เดินเล่น 45 นาทีในสวนสาธารณะ',
		date: '2026-07-15',
		time: '07:00',
		repeat: 'ทุกวัน',
		status: 'active'
	},
	{
		id: 'rem3',
		petId: '3',
		petName: 'ชาบู',
		type: 'ตรวจสุขภาพ',
		title: 'ตรวจสุขภาพประจำปี',
		description: 'นัดตรวจสุขภาพที่คลินิกเพ็ทคาร์',
		date: '2026-08-10',
		time: '14:00',
		repeat: 'ไม่ซ้ำ',
		status: 'active'
	},
	{
		id: 'rem4',
		petId: '1',
		petName: 'โมจิ',
		type: 'อาหาร',
		title: 'เติมอาหารเม็ด',
		description: 'เติมอาหารเม็ดแมว Royal Canin ในชาม',
		date: '2026-07-15',
		time: '08:00',
		repeat: 'ทุกวัน',
		status: 'active'
	},
	{
		id: 'rem5',
		petId: '5',
		petName: 'มิกกี้',
		type: 'ทำความสะอาด',
		title: 'เปลี่ยนรองกระต่าย',
		description: 'เปลี่ยนรองกระต่ายและทำความสะอาดกรง',
		date: '2026-07-16',
		time: '18:00',
		repeat: 'รายสัปดาห์',
		status: 'active'
	},
	{
		id: 'rem6',
		petId: '4',
		petName: 'โคโค่',
		type: 'ทำความสะอาด',
		title: 'อาบน้ำโคโค่',
		description: 'อาบน้ำและตัดขนที่ร้านกระดูกงาม',
		date: '2026-07-20',
		time: '11:00',
		repeat: 'รายเดือน',
		status: 'active'
	}
];

// ============================================
// Dashboard Stats
// ============================================
export const dashboardStats = {
	totalPets: 5,
	upcomingVaccinations: 3,
	thisMonthExpenses: 7920,
	activeReminders: 6
};

// ============================================
// Upcoming Events (for dashboard)
// ============================================
export const upcomingEvents = [
	{ id: 'ev1', petName: 'โมจิ', type: 'วัคซีน', title: 'ฉีดวัคซีน Booster', date: '15 ธ.ค. 2569', color: 'bg-blue-100 text-blue-700' },
	{ id: 'ev2', petName: 'ชาบู', type: 'ตรวจสุขภาพ', title: 'ตรวจสุขภาพประจำปี', date: '10 ส.ค. 2569', color: 'bg-green-100 text-green-700' },
	{ id: 'ev3', petName: 'โคโค่', type: 'ทำความสะอาด', title: 'อาบน้ำและตัดขน', date: '20 ก.ค. 2569', color: 'bg-purple-100 text-purple-700' },
	{ id: 'ev4', petName: 'โบสัน', type: 'ออกกำลังกาย', title: 'เพิ่มเวลาเดินเล่น', date: '30 ก.ค. 2569', color: 'bg-orange-100 text-orange-700' }
];
