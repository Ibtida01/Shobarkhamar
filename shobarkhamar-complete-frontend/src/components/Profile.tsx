import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, User, Phone, Mail, MapPin, Save, Edit2, Loader2 } from 'lucide-react';
import { getToken } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  created_at: string;
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

async function updateProfile(data: { name?: string; phone?: string; address?: string }): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update profile');
  }
  return res.json();
}

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [edits, setEdits] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setProfile(p);
        setEdits({ name: p.name, phone: p.phone ?? '', address: p.address ?? '' });
        // Keep localStorage in sync for navbar display
        localStorage.setItem('userName', p.name);
        localStorage.setItem('userEmail', p.email);
      })
      .catch(() => setError('Could not load profile. Make sure you are logged in.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await updateProfile({
        name: edits.name || undefined,
        phone: edits.phone || undefined,
        address: edits.address || undefined,
      });
      setProfile(updated);
      setEdits({ name: updated.name, phone: updated.phone ?? '', address: updated.address ?? '' });
      localStorage.setItem('userName', updated.name);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/selection" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" /><span>Loading profile...</span>
          </div>
        ) : error && !profile ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        ) : profile ? (
          <div className="bg-white rounded-xl shadow-lg p-8">

            {/* Avatar + role */}
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-600 to-blue-600 p-4 rounded-full">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <span className="text-sm text-gray-500 capitalize">{profile.role} · Member since {new Date(profile.created_at).getFullYear()}</span>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className="ml-auto flex min-w-[108px] items-center justify-center gap-2 bg-green-600 px-6 py-3 text-base font-semibold text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                {saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            {/* Feedback messages */}
            {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{successMsg}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  value={isEditing ? edits.name : profile.name}
                  onChange={(e) => setEdits({ ...edits, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={isEditing ? edits.phone : (profile.phone ?? '—')}
                  onChange={(e) => setEdits({ ...edits, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g. +8801711111111"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4" /> Address
                </label>
                <textarea
                  value={isEditing ? edits.address : (profile.address ?? '—')}
                  onChange={(e) => setEdits({ ...edits, address: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Your full address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setIsEditing(false); setError(null); setEdits({ name: profile.name, phone: profile.phone ?? '', address: profile.address ?? '' }); }}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
