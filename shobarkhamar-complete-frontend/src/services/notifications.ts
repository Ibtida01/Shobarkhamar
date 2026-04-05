// Notification system — localStorage based (no backend endpoint needed)

export interface AppNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  diagnosisId?: string;
}

const KEY = 'shobarkhamar_notifications';

function load(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(notifications: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(notifications));
}

export const notificationService = {
  getAll(): AppNotification[] {
    return load().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  getUnreadCount(): number {
    return load().filter((n) => !n.read).length;
  },

  add(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const all = load();
    all.push({
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
    save(all);
  },

  markAsRead(id: string) {
    const all = load().map((n) => (n.id === id ? { ...n, read: true } : n));
    save(all);
  },

  markAllAsRead() {
    const all = load().map((n) => ({ ...n, read: true }));
    save(all);
  },

  // Called after a successful diagnosis
  addDiagnosisNotification(
    isHealthy: boolean,
    diseaseName: string | undefined,
    animalType: string,
    diagnosisId?: string
  ) {
    if (isHealthy) {
      this.add({
        type: 'success',
        title: 'Diagnosis Complete — Healthy',
        message: `Your ${animalType} appears healthy. No disease detected.`,
        diagnosisId,
      });
    } else {
      this.add({
        type: 'warning',
        title: `Disease Detected: ${diseaseName}`,
        message: `A disease was detected in your ${animalType}. Check treatment recommendations.`,
        diagnosisId,
      });
    }
  },
};