import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, Search, Fish, Bird, AlertCircle, Info, FileText, ShieldCheck, Pill, Sparkles, X } from 'lucide-react';

interface Disease {
  id: string;
  name: string;
  fullName: string;
  type: 'fish' | 'poultry';
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medication: string;
  precautions: string[];
  effectiveness: string;
}

export function DiseaseDatabase() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fish' | 'poultry'>('all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  // Mock disease database - reflects the Disease table structure from ERD
  const diseaseDatabase: Disease[] = [
    {
      id: '1',
      name: 'EUS',
      fullName: 'Epizootic Ulcerative Syndrome',
      type: 'fish',
      symptoms: [
        'Deep ulcers on body surface',
        'Reddish lesions around the ulcers',
        'Loss of scales',
        'Lethargy and reduced feeding',
        'Secondary fungal infections'
      ],
      diagnosis: 'Visual inspection of ulcerative lesions, microscopic examination of tissue samples, bacterial culture',
      treatment: 'Use insecticide, antibiotic treatment, improved water quality',
      medication: 'Trichlorfon 500mg - 1ml per 10L of water',
      precautions: [
        'Quarantine affected fish immediately',
        'Improve water quality and oxygenation',
        'Reduce stocking density',
        'Disinfect equipment and tanks',
        'Avoid introducing new fish during outbreak'
      ],
      effectiveness: 'High - 80-90% recovery rate with early intervention'
    },
    {
      id: '2',
      name: 'NVD',
      fullName: 'Newcastle Disease',
      type: 'poultry',
      symptoms: [
        'Respiratory distress and gasping',
        'Greenish watery diarrhea',
        'Twisted neck and paralysis',
        'Swelling around eyes and neck',
        'Sudden death in acute cases'
      ],
      diagnosis: 'Clinical signs, post-mortem examination, virus isolation, serological tests',
      treatment: 'Use antibiotics, supportive therapy, vaccination of healthy birds',
      medication: 'Oxytetracycline 250mg - 50mg per kg body weight',
      precautions: [
        'Immediate quarantine of affected birds',
        'Vaccinate all healthy birds',
        'Proper disposal of dead birds',
        'Enhanced biosecurity measures',
        'Thorough disinfection of premises'
      ],
      effectiveness: 'Moderate - 60-70% with treatment, prevention through vaccination is key'
    },
    {
      id: '3',
      name: 'Ich',
      fullName: 'Ichthyophthirius (White Spot Disease)',
      type: 'fish',
      symptoms: [
        'Small white spots on body and fins',
        'Fish rubbing against objects',
        'Rapid gill movement',
        'Loss of appetite',
        'Lethargy and hiding behavior'
      ],
      diagnosis: 'Visual identification of white cysts, microscopic examination of skin scraping',
      treatment: 'Temperature elevation, salt treatment, copper-based medications',
      medication: 'Malachite Green + Formalin combination',
      precautions: [
        'Raise water temperature gradually to 28-30°C',
        'Increase aeration',
        'Remove carbon from filters during treatment',
        'Quarantine new fish before introduction',
        'Maintain stable water parameters'
      ],
      effectiveness: 'Very High - 90-95% with proper treatment protocol'
    },
    {
      id: '4',
      name: 'Coccidiosis',
      fullName: 'Coccidiosis',
      type: 'poultry',
      symptoms: [
        'Bloody diarrhea',
        'Ruffled feathers and depression',
        'Reduced feed consumption',
        'Dehydration',
        'Poor growth rate'
      ],
      diagnosis: 'Fecal examination for oocysts, post-mortem intestinal lesions',
      treatment: 'Anticoccidial medication, supportive care',
      medication: 'Amprolium or Sulfonamides',
      precautions: [
        'Maintain dry litter conditions',
        'Proper ventilation',
        'Regular cleaning and disinfection',
        'Avoid overcrowding',
        'Prophylactic medication in feed'
      ],
      effectiveness: 'High - 85% recovery with early treatment'
    }
  ];

  const filteredDiseases = diseaseDatabase.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disease.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || disease.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/selection" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Disease Database</h1>
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

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Disease Information</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search by disease name..."
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'fish' | 'poultry')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="fish">Fish Only</option>
              <option value="poultry">Poultry Only</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => setSelectedDisease(disease)}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    disease.type === 'fish' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {disease.type === 'fish' ? (
                      <Fish className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Bird className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{disease.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{disease.fullName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        disease.type === 'fish' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {disease.type === 'fish' ? 'Fish Disease' : 'Poultry Disease'}
                      </span>
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDiseases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No diseases found matching your search</p>
            </div>
          )}
        </div>
      </main>

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <div className="fixed inset-0 bg-black/55 z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center">
            <div className="bg-white rounded-[28px] shadow-2xl max-w-5xl w-full my-4 sm:my-8 overflow-hidden border border-white/70">
            <div className={`px-8 py-8 sm:px-10 sticky top-0 z-10 border-b border-white/70 ${
              selectedDisease.type === 'fish'
                ? 'bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_40%),linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#ecfeff_100%)]'
                : 'bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.22),_transparent_40%),linear-gradient(135deg,#f0fdf4_0%,#ffffff_55%,#f0fdf4_100%)]'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-3xl shadow-sm ${
                    selectedDisease.type === 'fish' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedDisease.type === 'fish' ? (
                      <Fish className="w-9 h-9" />
                    ) : (
                      <Bird className="w-9 h-9" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full ${
                        selectedDisease.type === 'fish'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedDisease.type === 'fish' ? 'Fish Disease' : 'Poultry Disease'}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200">
                        Disease ID: {selectedDisease.id}
                      </span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-950 leading-tight">
                      {selectedDisease.name}
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 mt-2 max-w-3xl">
                      {selectedDisease.fullName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="w-11 h-11 rounded-full shadow-sm transition-colors flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #d1d5db',
                    color: '#111827',
                  }}
                  aria-label="Close disease details"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} style={{ color: '#111827' }} />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Basic Info</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Disease Name</p>
                  <p className="text-lg font-bold text-gray-900">{selectedDisease.name}</p>
                  <p className="text-sm text-gray-600 mt-2">{selectedDisease.fullName}</p>
                </div>

                <div className="bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Pill className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Medication</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Recommended</p>
                  <p className="text-base font-semibold text-gray-900 leading-relaxed">{selectedDisease.medication}</p>
                </div>

                <div className="bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Effectiveness</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Expected Result</p>
                  <p className="text-base font-semibold text-gray-900 leading-relaxed">{selectedDisease.effectiveness}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 sm:px-10 bg-white">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-red-50/80 border border-red-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Symptoms</h3>
                      <p className="text-sm text-gray-500">Common signs to watch for</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {selectedDisease.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-red-400 flex-shrink-0" />
                        <span className="leading-relaxed">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50/80 border border-blue-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Diagnosis Method</h3>
                      <p className="text-sm text-gray-500">How this disease is confirmed</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedDisease.diagnosis}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 mt-6">
                <div className="bg-emerald-50/80 border border-emerald-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Treatment Plan</h3>
                      <p className="text-sm text-gray-500">Recommended first-line approach</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedDisease.treatment}</p>

                  <div className="mt-5 bg-white/90 border border-emerald-200 rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-2">
                      Recommended Medication
                    </p>
                    <p className="font-semibold text-gray-900 leading-relaxed">{selectedDisease.medication}</p>
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Precautions & Prevention</h3>
                      <p className="text-sm text-gray-500">Important safety actions during treatment</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {selectedDisease.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="leading-relaxed">{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="px-6 py-3 rounded-2xl transition-colors font-semibold shadow-sm inline-flex items-center gap-2"
                  style={{
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    border: '1px solid #111827',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
