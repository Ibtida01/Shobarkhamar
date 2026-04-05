// Persistent read/dismissed tracking for notifications

export const READ_STORAGE_KEY = 'shobarkhamar_read_notifs';
export const DISMISSED_STORAGE_KEY = 'shobarkhamar_dismissed_notifs';

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

export function getUnreadNotificationCount(
  diagnoses: { diagnosis_id: string }[],
  systemNotifs: { id: string; read: boolean }[]
): number {
  const readIds = new Set(getStoredIds(READ_STORAGE_KEY));
  const dismissedIds = new Set(getStoredIds(DISMISSED_STORAGE_KEY));

  const unreadDiagnoses = diagnoses.filter(
    (d) => !readIds.has(d.diagnosis_id) && !dismissedIds.has(d.diagnosis_id)
  ).length;

  const unreadSystem = systemNotifs.filter(
    (n) => !n.read && !readIds.has(n.id) && !dismissedIds.has(n.id)
  ).length;

  return unreadDiagnoses + unreadSystem;
}