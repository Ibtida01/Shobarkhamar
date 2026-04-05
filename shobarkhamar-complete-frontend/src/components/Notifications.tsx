import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, Bell, Clock, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { notificationService, AppNotification } from '../services/notifications';

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(notificationService.getAll());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getAll());
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getAll());
  };

  const clearAll = () => {
    localStorage.removeItem('shobarkhamar_notifications');
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'error':   return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBorder = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 border-l-4';
      case 'warning': return 'bg-yellow-50 border-yellow-200 border-l-4';
      case 'error':   return 'bg-red-50 border-red-200 border-l-4';
      default:        return 'bg-blue-50 border-blue-200 border-l-4';
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/selection" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-900" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" /><span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Notifications
              {unreadCount > 0 && (
                <span className="ml-3 text-sm font-normal text-gray-500">({unreadCount} unread)</span>
              )}
            </h2>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Clear all
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">No notifications yet</p>
              <p className="text-gray-400 text-sm">Notifications appear here after each diagnosis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`border rounded-lg p-5 transition-all cursor-pointer ${getBorder(n.type, n.read)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`text-gray-900 ${!n.read ? 'font-bold' : 'font-medium'}`}>
                          {n.title}
                          {!n.read && <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" />}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(n.timestamp)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}