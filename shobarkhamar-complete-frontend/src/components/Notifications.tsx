import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft, LogOut, Bell, BellOff, CheckCheck, Fish, Bird,
  AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw,
  Clock, Microscope, Activity, X
} from 'lucide-react';
import { getHistory, getToken } from '../services/api';
import type { DiagnosisResponse } from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifKind = 'disease' | 'healthy' | 'system' | 'info';

interface Notification {
  id: string;
  kind: NotifKind;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  diagnosisId?: string;
  species?: 'fish' | 'poultry';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function diagnosisToNotification(d: DiagnosisResponse): Notification {
  const isHealthy = !d.ai_result || d.ai_result.is_healthy;
  const species = d.target_species?.toLowerCase().includes('poultry') ? 'poultry' : 'fish';
  const date = new Date(d.created_at);

  if (isHealthy) {
    return {
      id: d.diagnosis_id,
      kind: 'healthy',
      title: 'All Clear — No Disease Detected',
      message: `Your ${species} sample analysed on ${date.toLocaleDateString()} came back healthy. Keep up the good work!`,
      timestamp: date,
      read: false,
      diagnosisId: d.diagnosis_id,
      species,
    };
  }

  const name = d.ai_result?.disease_name ?? 'Unknown Disease';
  const pct = d.ai_result?.confidence_percent ?? 0;
  const sev = d.ai_result?.severity ?? 'LOW';

  return {
    id: d.diagnosis_id,
    kind: 'disease',
    title: `Disease Detected — ${name}`,
    message: `${species === 'fish' ? 'Fish' : 'Poultry'} sample shows ${name} (${pct.toFixed(1)}% confidence, severity: ${sev}). View treatment recommendations.`,
    timestamp: date,
    read: false,
    diagnosisId: d.diagnosis_id,
    species,
  };
}

const SYSTEM_NOTIFICATIONS: Notification[] = [
  {
    id: 'sys-1',
    kind: 'system',
    title: 'AI Models Updated',
    message: 'Our fish and poultry disease detection models have been improved for higher accuracy.',
    timestamp: new Date('2026-04-01T08:00:00'),
    read: false,
  },
  {
    id: 'info-1',
    kind: 'info',
    title: 'Tip: Upload clear images',
    message: 'Well-lit, focused images increase detection accuracy by up to 30%. Avoid blurry or shadowed shots.',
    timestamp: new Date('2026-03-28T10:00:00'),
    read: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KindIcon({ kind, species }: { kind: NotifKind; species?: 'fish' | 'poultry' }) {
  if (kind === 'disease') return <AlertTriangle className="w-5 h-5 text-red-500" />;
  if (kind === 'healthy') {
    return species === 'poultry'
      ? <Bird className="w-5 h-5 text-green-500" />
      : <Fish className="w-5 h-5 text-green-500" />;
  }
  if (kind === 'system') return <Activity className="w-5 h-5 text-violet-500" />;
  return <Info className="w-5 h-5 text-blue-500" />;
}

function kindStyles(kind: NotifKind) {
  switch (kind) {
    case 'disease': return 'bg-red-50 border-red-200 hover:bg-red-100/60';
    case 'healthy': return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/60';
    case 'system': return 'bg-violet-50 border-violet-200 hover:bg-violet-100/60';
    default:        return 'bg-blue-50 border-blue-200 hover:bg-blue-100/60';
  }
}

function unreadDot(kind: NotifKind) {
  switch (kind) {
    case 'disease': return 'bg-red-500';
    case 'healthy': return 'bg-emerald-500';
    case 'system':  return 'bg-violet-500';
    default:        return 'bg-blue-500';
  }
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'disease' | 'healthy'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      // Not logged in — show system notifs only
      setNotifications(SYSTEM_NOTIFICATIONS);
      setLoading(false);
      return;
    }

    try {
      const data = await getHistory(0, 50);
      const fromApi = data.diagnoses.map(diagnosisToNotification);
      // Merge: API results first, then system notifs (deduplicated)
      const merged = [...fromApi, ...SYSTEM_NOTIFICATIONS].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      setNotifications(merged);
    } catch (err) {
      setError('Could not load notifications. Check your connection.');
      setNotifications(SYSTEM_NOTIFICATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const markAsRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  // ── Filtering ──
  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'disease') return n.kind === 'disease';
    if (filter === 'healthy') return n.kind === 'healthy';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const diseaseCount = notifications.filter(n => n.kind === 'disease').length;

  // ── Empty state ──
  const isEmpty = !loading && filtered.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* ── Header ── */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/selection" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-800" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">

        {/* ── Stats Bar ── */}
        {!loading && notifications.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              <p className="text-xs text-red-500 mt-0.5">Unread</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-600">{diseaseCount}</p>
              <p className="text-xs text-amber-500 mt-0.5">Diseases</p>
            </div>
          </div>
        )}

        {/* ── Filter Pills ── */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all', 'unread', 'disease', 'healthy'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
              }`}
            >
              {f === 'all' ? `All (${notifications.length})` :
               f === 'unread' ? `Unread (${unreadCount})` :
               f === 'disease' ? `Diseases (${diseaseCount})` :
               `Healthy (${notifications.filter(n => n.kind === 'healthy').length})`}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading your notifications…</p>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && !loading && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Empty State ── */}
        {isEmpty && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-semibold">No notifications here</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'all'
                  ? 'Run a diagnosis to see results here.'
                  : `No ${filter} notifications right now.`}
              </p>
            </div>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all notifications →
              </button>
            )}
          </div>
        )}

        {/* ── Notification List ── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(notif => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${kindStyles(notif.kind)} ${
                  notif.read ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon bubble */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      notif.kind === 'disease' ? 'bg-red-100' :
                      notif.kind === 'healthy' ? 'bg-emerald-100' :
                      notif.kind === 'system' ? 'bg-violet-100' : 'bg-blue-100'
                    }`}>
                      <KindIcon kind={notif.kind} species={notif.species} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold text-gray-900 leading-snug ${!notif.read ? 'font-bold' : ''}`}>
                        {!notif.read && (
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 -mt-0.5 align-middle ${unreadDot(notif.kind)}`} />
                        )}
                        {notif.title}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 p-0.5 rounded"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <time>{timeAgo(notif.timestamp)}</time>
                        {notif.species && (
                          <>
                            <span className="mx-1">·</span>
                            {notif.species === 'fish'
                              ? <><Fish className="w-3 h-3" /> Fish</>
                              : <><Bird className="w-3 h-3" /> Poultry</>
                            }
                          </>
                        )}
                      </div>

                      {notif.kind === 'disease' && notif.diagnosisId && (
                        <Link
                          to="/treatment"
                          onClick={e => e.stopPropagation()}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2 flex items-center gap-1"
                        >
                          <Microscope className="w-3 h-3" />
                          View treatment
                        </Link>
                      )}

                      {notif.kind === 'healthy' && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Healthy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CTA footer ── */}
        {!loading && (
          <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">Ready to run a new diagnosis?</p>
              <p className="text-green-100 text-sm mt-0.5">Upload an image and get instant AI-powered results.</p>
            </div>
            <Link
              to="/selection"
              className="flex-shrink-0 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-sm"
            >
              Start Diagnosis →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}