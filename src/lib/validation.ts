export function localDate(value = new Date()) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
export const localTime = (value: Date) => `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
export function futureTime(date: string, time: string) {
  const when = new Date(`${date}T${time}`);
  return date && time && Number.isFinite(when.valueOf()) && when.valueOf() > Date.now() ? when : null;
}
export function petErrors(pet: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const field of ['name', 'breed', 'color']) {
    const value = String(pet[field] ?? '').trim();
    if (field === 'name' && !value) errors[field] = 'กรุณากรอกชื่อสัตว์เลี้ยง';
    else if (value && (!/^[\p{L}\p{M}\p{N}\s-]+$/u.test(value) || value.length > 100)) errors[field] = 'รูปแบบข้อมูลไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง';
  }
  const birthdate = String(pet.birthdate ?? '');
  const birth = new Date(`${birthdate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || !Number.isFinite(birth.valueOf()) || birth.toISOString().slice(0, 10) !== birthdate || birthdate < '1900-01-01' || birthdate > localDate()) errors.birthdate = 'กรุณากรอกวันเกิดที่ถูกต้องและไม่เกินวันนี้';
  if (!Number.isFinite(Number(pet.weight)) || Number(pet.weight) <= 0 || Number(pet.weight) > 9999.99) errors.weight = 'กรุณากรอกน้ำหนักมากกว่า 0 และไม่เกิน 9999.99 กก.';
  for (const field of ['allergies', 'notes']) if (String(pet[field] ?? '').trim().length > 500) errors[field] = 'กรุณากรอกไม่เกิน 500 ตัวอักษร';
  if (!['MALE', 'FEMALE', 'UNKNOWN'].includes(String(pet.gender || ''))) errors.gender = 'กรุณาเลือกเพศสัตว์เลี้ยง';
  return errors;
}
