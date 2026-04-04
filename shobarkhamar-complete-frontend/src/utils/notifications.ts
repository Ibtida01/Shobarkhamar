import type { DiagnosisResponse } from '../services/api';

export const READ_STORAGE_KEY = 'notificationReadState';
export const DISMISSED_STORAGE_KEY = 'dismissedNotifications';

export interface SystemNotificationState {
  id: string;
  read: boolean;
}

export function getStoredIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export function storeIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
}

export function getUnreadNotificationCount(
  diagnoses: DiagnosisResponse[],
  systemNotifications: SystemNotificationState[] = []
) {
  const readIds = new Set(getStoredIds(READ_STORAGE_KEY));
  const dismissedIds = new Set(getStoredIds(DISMISSED_STORAGE_KEY));

  const unreadDiagnoses = diagnoses.filter(
    diagnosis => !readIds.has(diagnosis.diagnosis_id) && !dismissedIds.has(diagnosis.diagnosis_id)
  ).length;

  const unreadSystem = systemNotifications.filter(
    notification =>
      !dismissedIds.has(notification.id) &&
      !readIds.has(notification.id) &&
      !notification.read
  ).length;

  return unreadDiagnoses + unreadSystem;
}
