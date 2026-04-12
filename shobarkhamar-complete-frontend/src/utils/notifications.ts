// Persistent read/dismissed tracking for notifications

export const READ_STORAGE_KEY = 'shobarkhamar_read_notifs';
export const DISMISSED_STORAGE_KEY = 'shobarkhamar_dismissed_notifs';
export const CLEARED_AT_STORAGE_KEY = 'shobarkhamar_notifications_cleared_at';

export function getStoredIds(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function storeIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
}

export function getClearedAt(): number {
  const raw = localStorage.getItem(CLEARED_AT_STORAGE_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function setClearedAt(timestamp: number) {
  localStorage.setItem(CLEARED_AT_STORAGE_KEY, String(timestamp));
}

export function isClearedNotification(timestamp: string | number | Date): boolean {
  const clearedAt = getClearedAt();
  const notificationTime =
    timestamp instanceof Date ? timestamp.getTime() :
    typeof timestamp === 'string' ? new Date(timestamp).getTime() :
    timestamp;

  return Number.isFinite(notificationTime) && notificationTime <= clearedAt;
}

export function getUnreadNotificationCount(
  diagnoses: { diagnosis_id: string }[],
  systemNotifs: { id: string; read: boolean }[]
): number {
  const readIds = new Set(getStoredIds(READ_STORAGE_KEY));
  const dismissedIds = new Set(getStoredIds(DISMISSED_STORAGE_KEY));

  const unreadDiagnoses = diagnoses.filter(
    (d) => !readIds.has(d.diagnosis_id) && !dismissedIds.has(d.diagnosis_id) && !isClearedNotification(new Date())
  ).length;

  const unreadSystem = systemNotifs.filter(
    (n) => !n.read && !readIds.has(n.id) && !dismissedIds.has(n.id)
  ).length;

  return unreadDiagnoses + unreadSystem;
}
