export const i18n = {
  dashboard: {
    title: 'แดชบอร์ด',
    subtitle: 'ภาพรวมการดูแลสัตว์เลี้ยงของคุณ',
    greeting: (name: string) => `สวัสดี, ${name}! 👋`,
    petsCount: (count: number) => `สัตว์เลี้ยงของคุณทั้ง ${count} ตัวอยู่ภายใต้การดูแลที่ดี`,
    stats: {
      totalPets: 'สัตว์เลี้ยงทั้งหมด',
      upcomingVaccinations: 'วัคซีนที่ต้องฉีด',
      expenses: 'ค่าใช้จ่ายเดือนนี้',
      activeReminders: 'การแจ้งเตือนที่ใช้งาน'
    },
    myPets: 'สัตว์เลี้ยงของฉัน',
    viewAll: 'ดูทั้งหมด →',
    upcomingEvents: 'กำหนดการใกล้ถึง',
    expensesByCategory: 'ค่าใช้จ่ายตามหมวดหมู่',
    monthlyTrend: 'แนวโน้มรายเดือน',
    error: 'ไม่สามารถโหลดแดชบอร์ดได้'
  },
  care: {
    title: 'แผนดูแล',
    subtitle: 'แผนการดูแลและคำแนะนำสำหรับสัตว์เลี้ยงของคุณ'
  },
  pets: {
    title: 'จัดการสัตว์เลี้ยง',
    subtitle: 'จัดการข้อมูลสัตว์เลี้ยงทั้งหมดของคุณ'
  },
  login: {
    title: 'เข้าสู่ระบบ',
    subtitle: 'เข้าสู่ระบบเพื่อดูแลทุกเรื่องของสัตว์เลี้ยงคุณ'
  },
  register: {
    title: 'สมัครสมาชิก',
    subtitle: 'เริ่มต้นดูแลสัตว์เลี้ยงของคุณได้ทันที',
    namePlaceholder: 'ชื่อของคุณ'
  },
  common: {
    defaultUserName: 'เพื่อน'
  }
} as const;
