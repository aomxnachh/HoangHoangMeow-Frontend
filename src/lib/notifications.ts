import { writable } from 'svelte/store';
import { api, getSession } from '$lib/api';

export type DueReminder = { id: number; title: string; petName: string; scheduledAt: string; snoozedUntil?: string; description?: string; reminderMinutes?: number; status: string; overdue?: boolean };
export const dueReminders = writable<DueReminder[]>([]);
export const notificationError = writable('');

export function startNotifications() {
 let rows: DueReminder[] = [];
 let stopped = false;
 let token = '';
 let busy = false;
 let seen = new Set<string>();
 function tick() {
  const session = getSession();
  if (!session || session.token !== token) { rows = []; dueReminders.set([]); return; }
  const now = Date.now();
  const due = rows.filter(r => r.status === 'PENDING' && new Date(r.snoozedUntil || r.scheduledAt).valueOf() - (r.snoozedUntil ? 0 : (r.reminderMinutes || 0) * 60000) <= now).map(r => ({ ...r, overdue: new Date(r.snoozedUntil || r.scheduledAt).valueOf() < now }));
  dueReminders.set(due);
  for (const row of due) {
   const key = `${session.user.id}:${row.id}:${row.snoozedUntil || row.scheduledAt}`;
   if (seen.has(key)) continue;
   seen.add(key);
   try {
    if ('Notification' in window && Notification.permission === 'granted') {
     const n = new Notification(`${row.petName}: ${row.title}`, { body: row.description || 'ถึงเวลาแล้ว เปิดรายการเพื่อทำแล้วหรือเลื่อนเวลา', tag: key });
     n.onclick = () => { window.focus(); window.location.assign('/reminders'); n.close(); };
    }
   } catch { /* The persistent in-app notification remains available. */ }
  }
 }
 async function refresh() {
  const session = getSession();
  if (!session) { rows = []; token = ''; seen.clear(); dueReminders.set([]); notificationError.set(''); return; }
  if (session.token !== token) { token = session.token; rows = []; seen.clear(); }
  if (busy) return;
  busy = true;
  const requestedToken = token;
  try {
   const result = await api<{ reminders: DueReminder[] }>('/api/reminders');
   if (!stopped && getSession()?.token === requestedToken) { rows = result.reminders; notificationError.set(''); tick(); }
  } catch { if (!stopped && getSession()) notificationError.set('อัปเดตการแจ้งเตือนไม่ได้ ระบบจะลองอีกครั้งเมื่อเชื่อมต่อได้'); }
  finally { busy = false; }
 }
 const update = () => { void refresh(); };
 const visibility = () => { if (document.visibilityState === 'visible') update(); };
 update();
 const polling = window.setInterval(update, 30000);
 const ticking = window.setInterval(tick, 1000);
 window.addEventListener('api_updated', update);
 window.addEventListener('session_updated', update);
 window.addEventListener('online', update);
 document.addEventListener('visibilitychange', visibility);
 return () => { stopped = true; clearInterval(polling); clearInterval(ticking); window.removeEventListener('api_updated', update); window.removeEventListener('session_updated', update); window.removeEventListener('online', update); document.removeEventListener('visibilitychange', visibility); dueReminders.set([]); };
}
