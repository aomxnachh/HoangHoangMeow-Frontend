<script lang="ts">
 let { value = $bindable(''), busy = $bindable(false) }: { value?: string; busy?: boolean } = $props();
 let error = $state('');
 async function select(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  error = '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { error = 'เลือกรูป JPEG PNG หรือ WebP ขนาดไม่เกิน 2 MB'; input.value = ''; return; }
  busy = true;
  const url = URL.createObjectURL(file);
  try {
   const img = new Image(); img.src = url; await img.decode();
   const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
   const canvas = document.createElement('canvas');
   canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
   const ctx = canvas.getContext('2d'); if (!ctx) throw new Error();
   ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
   value = canvas.toDataURL('image/jpeg', 0.85);
  } catch { error = 'อ่านรูปภาพไม่ได้ กรุณาเลือกไฟล์อื่น'; }
  finally { URL.revokeObjectURL(url); busy = false; input.value = ''; }
 }
</script>
<div class="space-y-2">
 <label class="block text-sm font-medium text-gray-700">รูปสัตว์เลี้ยง
  <input type="file" accept="image/jpeg,image/png,image/webp" onchange={select} disabled={busy} class="mt-2 block w-full min-w-0 text-sm" />
 </label>
 <p class="text-xs text-gray-500">JPEG PNG หรือ WebP ไม่เกิน 2 MB</p>
 {#if value}<img src={value} alt="ตัวอย่างรูปสัตว์เลี้ยง" class="h-24 w-24 rounded-xl object-cover" /><button type="button" class="text-sm text-red-600" onclick={() => value = ''}>ลบรูป</button>{/if}
 {#if busy}<p role="status">กำลังอ่านรูปภาพ…</p>{/if}
 {#if error}<p role="alert" class="text-sm text-red-600">{error}</p>{/if}
</div>
