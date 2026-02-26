import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, User, Phone, Mail, MapPin, Save, Edit2, Building2, MapPinned, Ruler, Fish, Bird, Activity } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    address: localStorage.getItem('userAddress') || '',
    phone: localStorage.getItem('userPhone') || '',
  });

  // Farm information state
  const [farmInfo, setFarmInfo] = useState({
    farmName: localStorage.getItem('farmName') || '',
    location: localStorage.getItem('farmLocation') || '',
    areaSize: localStorage.getItem('farmAreaSize') || '',
    farmType: localStorage.getItem('farmType') || 'fish',
    farmStatus: localStorage.getItem('farmStatus') || 'active'
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAddress');
    localStorage.removeItem('userPhone');
    navigate('/');
  };

  const handleSave = () => {
    // Save personal info
    localStorage.setItem('userName', profile.name);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('userAddress', profile.address);
    localStorage.setItem('userPhone', profile.phone);

    // Save farm info
    localStorage.setItem('farmName', farmInfo.farmName);
    localStorage.setItem('farmLocation', farmInfo.location);
    localStorage.setItem('farmAreaSize', farmInfo.areaSize);
    localStorage.setItem('farmType', farmInfo.farmType);
    localStorage.setItem('farmStatus', farmInfo.farmStatus);

    setIsEditing(false);
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
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-600 to-blue-600 p-4 rounded-full">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name || 'User'}</h2>
                <p className="text-gray-600">Farmer Account</p>
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" />
                  Edit
                </>
              )}
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Enter your complete address"
              />
            </div>
          </div>
        </div>

        {/* Farm Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <Building2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Farm Information</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                Farm Name
              </label>
              <input
                type="text"
                value={farmInfo.farmName}
                onChange={(e) => setFarmInfo({ ...farmInfo, farmName: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Enter farm name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPinned className="w-4 h-4" />
                Farm Location
              </label>
              <input
                type="text"
                value={farmInfo.location}
                onChange={(e) => setFarmInfo({ ...farmInfo, location: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Enter farm location"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4" />
                Area Size
              </label>
              <input
                type="text"
                value={farmInfo.areaSize}
                onChange={(e) => setFarmInfo({ ...farmInfo, areaSize: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="e.g., 5 acres, 2000 sqm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                {farmInfo.farmType === 'fish' ? <Fish className="w-4 h-4" /> : <Bird className="w-4 h-4" />}
                Farm Type
              </label>
              <select
                value={farmInfo.farmType}
                onChange={(e) => setFarmInfo({ ...farmInfo, farmType: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600 appearance-none bg-white cursor-pointer"
                style={{ backgroundImage: !isEditing ? 'none' : 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="fish">Fish</option>
                <option value="poultry">Poultry</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Activity className="w-4 h-4" />
                Farm Status
              </label>
              <select
                value={farmInfo.farmStatus}
                onChange={(e) => setFarmInfo({ ...farmInfo, farmStatus: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-600 appearance-none bg-white cursor-pointer"
                style={{ backgroundImage: !isEditing ? 'none' : 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">
                Status: <span className={`font-semibold ${farmInfo.farmStatus === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                  {farmInfo.farmStatus === 'active' ? '● Active' : '○ Inactive'}
                </span>
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}