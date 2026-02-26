import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, LogOut, Fish, Bird, Save, Loader2 } from 'lucide-react';
import { createFarm } from '../services/api';

export function FarmInfo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'fish';

  const [farmName, setFarmName] = useState('');
  const [address, setAddress] = useState('');
  const [areaSize, setAreaSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleSave = async () => {
    if (!farmName.trim()) {
      setError('Please enter a farm name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createFarm({
        farm_name: farmName.trim(),
        farm_type: type === 'fish' ? 'FISH' : 'POULTRY',
        address: address.trim() || undefined,
        area_size: areaSize ? parseFloat(areaSize) : undefined,
      });

      // Farm created — go straight to detection
      navigate(`/detection?type=${type}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create farm. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const accentColor = type === 'fish' ? 'blue' : 'green';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/selection" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-2">
                {type === 'fish'
                  ? <Fish className="w-6 h-6 text-blue-600" />
                  : <Bird className="w-6 h-6 text-green-600" />}
                <h1 className="text-2xl font-bold text-gray-900">
                  {type === 'fish' ? 'Fish' : 'Poultry'} Farm Information
                </h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" /><span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Register your {type === 'fish' ? 'fish' : 'poultry'} farm
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            You need a farm registered before running a disease detection.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Farm Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                placeholder={type === 'fish' ? 'e.g., Dhaka Fish Farm' : 'e.g., Dhaka Poultry Farm'}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                placeholder="e.g., Dhaka, Bangladesh"
              />
            </div>

            {/* Area Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Size (acres) <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={areaSize}
                onChange={(e) => setAreaSize(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                placeholder="e.g., 5"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Farm...</>
                : <><Save className="w-5 h-5" />Save & Continue</>}
            </button>
            <button
              onClick={() => navigate(`/detection?type=${type}`)}
              className="bg-gray-200 text-gray-800 px-6 py-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Skip
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A farm must be registered before you can run disease detection.
              You only need to do this once — next time just click Skip.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
