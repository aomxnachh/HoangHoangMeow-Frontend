<script lang="ts">
 import { dueReminders, notificationError } from '$lib/notifications';
</script>
{#if $dueReminders.length}
 <aside role="status" aria-label="รายการแจ้งเตือนที่ถึงเวลา" class="mx-4 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
  <a href="/reminders" class="block font-semibold">ถึงเวลาแล้ว {$dueReminders.length} รายการ — {$dueReminders[0].petName}: {$dueReminders[0].title}</a>
  <a href="/reminders" class="mt-1 inline-block underline">ดูรายละเอียด ทำแล้ว หรือเลื่อนเวลา</a>
 </aside>
{/if}
{#if $notificationError}<p role="status" class="mx-4 mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{$notificationError}</p>{/if}
