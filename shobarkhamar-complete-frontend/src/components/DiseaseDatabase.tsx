import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, Search, Fish, Bird, AlertCircle, Info, FileText } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 my-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-full ${
                  selectedDisease.type === 'fish' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {selectedDisease.type === 'fish' ? (
                    <Fish className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Bird className="w-8 h-8 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedDisease.name}</h2>
                  <p className="text-xl text-gray-600">{selectedDisease.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Symptoms */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Symptoms</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-2 bg-red-50 p-4 rounded-lg">
                  {selectedDisease.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>

              {/* Diagnosis */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Diagnosis Method</h3>
                </div>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{selectedDisease.diagnosis}</p>
              </div>

              {/* Treatment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Treatment</h3>
                </div>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg mb-3">{selectedDisease.treatment}</p>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Recommended Medication</p>
                  <p className="font-semibold text-gray-900">{selectedDisease.medication}</p>
                </div>
              </div>

              {/* Precautions */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Precautions & Prevention</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 bg-yellow-50 p-4 rounded-lg">
                  {selectedDisease.precautions.map((precaution, index) => (
                    <li key={index}>{precaution}</li>
                  ))}
                </ul>
              </div>

              {/* Effectiveness */}
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="text-sm text-purple-800 mb-1">Treatment Effectiveness</p>
                <p className="font-semibold text-gray-900">{selectedDisease.effectiveness}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedDisease(null)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
