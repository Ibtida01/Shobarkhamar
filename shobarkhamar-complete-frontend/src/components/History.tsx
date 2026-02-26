import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, Clock, Fish, Bird, AlertCircle, FileText, Filter } from 'lucide-react';

interface DiagnosisRecord {
  id: string;
  date: string;
  type: 'fish' | 'poultry';
  disease: string;
  fullName: string;
  treatment: string;
  outcome?: string;
  image?: string;
}

export function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'fish' | 'poultry'>('all');

  // Mock data - in a real app, this would come from a database
  const diagnosisHistory: DiagnosisRecord[] = [
    {
      id: '1',
      date: '2026-02-08',
      type: 'fish',
      disease: 'EUS',
      fullName: 'Epizootic Ulcerative Syndrome',
      treatment: 'Use insecticide',
      outcome: 'Recovered',
    },
    {
      id: '2',
      date: '2026-02-05',
      type: 'poultry',
      disease: 'NVD',
      fullName: 'Newcastle Disease',
      treatment: 'Use antibiotics',
      outcome: 'Under Treatment',
    },
    {
      id: '3',
      date: '2026-02-01',
      type: 'fish',
      disease: 'EUS',
      fullName: 'Epizootic Ulcerative Syndrome',
      treatment: 'Use insecticide',
      outcome: 'Recovered',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const filteredHistory = filter === 'all' 
    ? diagnosisHistory 
    : diagnosisHistory.filter(record => record.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/selection" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Diagnosis History</h1>
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

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Your Diagnosis Records</h2>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'fish' | 'poultry')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Records</option>
                <option value="fish">Fish Only</option>
                <option value="poultry">Poultry Only</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No diagnosis records found</p>
              <p className="text-gray-500 mb-6">Start by uploading an image to diagnose diseases</p>
              <Link
                to="/selection"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Start Diagnosis
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-full ${
                        record.type === 'fish' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {record.type === 'fish' ? (
                          <Fish className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Bird className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.type === 'fish' ? 'Fish' : 'Poultry'} Diagnosis
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-600">{record.disease}</p>
                            <p className="text-sm text-gray-600">{record.fullName}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-800 mb-1">Treatment</p>
                            <p className="text-sm font-medium text-gray-900">{record.treatment}</p>
                          </div>
                          
                          {record.outcome && (
                            <div className={`p-3 rounded-lg ${
                              record.outcome === 'Recovered' 
                                ? 'bg-blue-50' 
                                : 'bg-yellow-50'
                            }`}>
                              <p className={`text-xs mb-1 ${
                                record.outcome === 'Recovered' 
                                  ? 'text-blue-800' 
                                  : 'text-yellow-800'
                              }`}>
                                Status
                              </p>
                              <p className="text-sm font-medium text-gray-900">{record.outcome}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Treatment Logs Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {diagnosisHistory.filter(r => r.outcome === 'Recovered').length}
              </p>
              <p className="text-sm text-blue-800">Recovered</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {diagnosisHistory.filter(r => r.outcome === 'Under Treatment').length}
              </p>
              <p className="text-sm text-yellow-800">Under Treatment</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-600">{diagnosisHistory.length}</p>
              <p className="text-sm text-gray-800">Total Diagnoses</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
