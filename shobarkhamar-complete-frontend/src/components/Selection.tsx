import { Link, useNavigate } from 'react-router';
import { Fish, Bird, LogOut, ArrowLeft, User, Clock, Bell, Building2, BookOpen, MessageSquare } from 'lucide-react';
import fishImage from 'figma:asset/62f52d45234fa34e0569cc9cc6fc66e654838740.png';
import poultryImage from 'figma:asset/42eeaf1bf402682fb5a784bdf4ac8a449b212110.png';

export function Selection() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {userName}</p>
              </div>
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

      {/* Quick Access Menu */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link
            to="/profile"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center"
          >
            <User className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-900">My Profile</span>
          </Link>
          
          <Link
            to="/notifications"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center relative"
          >
            <Bell className="w-8 h-8 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">Notifications</span>
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              2
            </span>
          </Link>

          <Link
            to="/disease-database"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center"
          >
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <span className="text-sm font-medium text-gray-900">Diseases</span>
          </Link>

          <Link
            to="/feedback"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center"
          >
            <MessageSquare className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-900">Feedback</span>
          </Link>

          <Link
            to="/about"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center"
          >
            <Building2 className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">About</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose What You Want to Diagnose
          </h2>
          <p className="text-xl text-gray-600">
            Select fish or poultry to begin disease detection
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link
            to="/farm-info?type=fish"
            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="relative h-80 overflow-hidden">
              <img
                src={fishImage}
                alt="Fish"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
              <div className="bg-blue-500 rounded-full p-6 mb-4 group-hover:bg-blue-600 transition-colors">
                <Fish className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Fish</h3>
              <p className="text-white/90 text-center">
                Diagnose diseases in fish by uploading images
              </p>
            </div>
          </Link>

          <Link
            to="/farm-info?type=poultry"
            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="relative h-80 overflow-hidden">
              <img
                src={poultryImage}
                alt="Poultry"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
              <div className="bg-green-500 rounded-full p-6 mb-4 group-hover:bg-green-600 transition-colors">
                <Bird className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Poultry</h3>
              <p className="text-white/90 text-center">
                Diagnose diseases in poultry by uploading faeces images
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}