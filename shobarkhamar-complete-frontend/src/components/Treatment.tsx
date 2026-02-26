import { useLocation, useNavigate, Link } from 'react-router';
import { ArrowLeft, Pill, AlertCircle, Fish, Bird, LogOut, ClipboardList, Syringe, Droplet, AlertTriangle, Info } from 'lucide-react';
import poultryIcon from 'figma:asset/36269bc95e30a658e2dbcacea10d1ccc3ac7bec8.png';
import fishSampleImage from 'figma:asset/81061a8ea05a453e7b182b6e9e85ca8c1777b806.png';
import poultrySampleImage from 'figma:asset/dfc44b2571f492b90efd940d77993d9db48d5a82.png';

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function Treatment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract state - use optional chaining safely
  const state = location.state as {
    type?: string;
    disease?: string;
    fullName?: string;
    treatment?: string;
    image?: string;
  } | undefined;

  // Get type from URL params as fallback
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  
  const type = state?.type || typeFromUrl || 'fish';
  const disease = state?.disease || (type === 'fish' ? 'EUS' : 'NVD');
  const fullName = state?.fullName || (type === 'fish' ? 'Epizootic Ulcerative Syndrome' : 'Newcastle Disease');
  const treatment = state?.treatment || (type === 'fish' ? 'Use insecticide' : 'Use antibiotics');
  const image = state?.image || (type === 'fish' ? fishSampleImage : poultrySampleImage);

  // Treatment details based on ERD structure
  const treatmentData = type === 'fish' ? {
    treatment_id: generateUUID(),
    treatment_name: 'EUS Treatment Protocol',
    medication_name: 'Trichlorfon + Oxytetracycline',
    application_method: 'IN_WATER',
    dosage_text: '1ml Trichlorfon per 10L water + 50mg Oxytetracycline per liter',
    duration_days: 10,
    precaution: 'Handle with care. Avoid direct skin contact with medication. Maintain proper water temperature (25-28°C). Do not feed fish 2 hours before treatment. Remove activated carbon from filters during treatment. Monitor dissolved oxygen levels closely.',
    alternatives_note: 'Alternative treatments include: Potassium permanganate bath (2-4 mg/L for 30-60 minutes), Salt treatment (5-10 ppt), or Malachite green (0.1-0.15 mg/L). Consult specialist before switching treatments.'
  } : {
    treatment_id: generateUUID(),
    treatment_name: 'NVD Treatment Protocol',
    medication_name: 'Oxytetracycline + Multivitamins',
    application_method: 'ORAL',
    dosage_text: '50mg Oxytetracycline per kg body weight + Vitamin A, D, E supplementation',
    duration_days: 7,
    precaution: 'Isolate infected birds immediately. Disinfect all equipment and housing. Use protective gear when handling birds. Ensure proper ventilation. Dispose of dead birds safely by burning or deep burial. Vaccination of healthy birds recommended.',
    alternatives_note: 'Alternative treatments include: Enrofloxacin (10mg/kg body weight), Tylosin (0.5g/L in drinking water), or Supportive therapy with electrolytes and immune boosters. Consider vaccination for flock protection.'
  };

  // Mock prescription details
  const prescription = {
    id: `RX-${Date.now()}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };

  const getApplicationMethodDisplay = (method: string) => {
    const methods: { [key: string]: { icon: any, text: string, description: string } } = {
      'IN_WATER': { icon: Droplet, text: 'In Water', description: 'Dissolve medication in water' },
      'ORAL': { icon: Pill, text: 'Oral', description: 'Mix with feed or direct administration' },
      'FEED': { icon: Pill, text: 'Feed', description: 'Mix with regular feed' },
      'TOPICAL': { icon: Syringe, text: 'Topical', description: 'Apply directly to affected area' },
      'INJECTION': { icon: Syringe, text: 'Injection', description: 'Intramuscular or subcutaneous injection' },
      'DIP': { icon: Droplet, text: 'Dip', description: 'Short-term immersion bath' },
      'SPRAY': { icon: Droplet, text: 'Spray', description: 'Spray application' },
      'EYE_DROPS': { icon: Droplet, text: 'Eye Drops', description: 'Direct application to eyes' },
      'BATH': { icon: Droplet, text: 'Bath', description: 'Extended immersion treatment' }
    };
    return methods[method] || methods['ORAL'];
  };

  const applicationMethod = getApplicationMethodDisplay(treatmentData.application_method);
  const ApplicationIcon = applicationMethod.icon;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleAnalyzeAnother = () => {
    navigate('/selection');
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
              <h1 className="text-2xl font-bold text-gray-900">Treatment Details</h1>
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
        {/* Disease Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            {type === 'fish' ? (
              <Fish className="w-8 h-8 text-blue-600" />
            ) : (
              <img src={poultryIcon} alt="Poultry" className="w-8 h-8 text-green-600" />
            )}
            <h2 className="text-3xl font-bold text-gray-900">Disease Summary</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={image}
                alt="Analyzed sample"
                className="w-full rounded-lg object-contain bg-gray-100 max-h-80"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-red-800 mb-1">Detected Disease</p>
                    <p className="text-3xl font-bold text-red-600 mb-2">{disease}</p>
                    <p className="text-gray-700">{fullName}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Sample Type:</span>{' '}
                  {type === 'fish' ? 'Fish' : 'Poultry'}
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <span className="font-semibold">Diagnosis Date:</span> {prescription.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 rounded-full p-3">
              <Pill className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Treatment Information</h2>
          </div>

          {/* Treatment ID & Name */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Treatment ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{treatmentData.treatment_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Treatment Name</p>
              <p className="text-xl font-bold text-gray-900">{treatmentData.treatment_name}</p>
            </div>
          </div>

          {/* Application Method */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ApplicationIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Application Method</h3>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-900 mb-1">{applicationMethod.text}</p>
              <p className="text-sm text-gray-700">{applicationMethod.description}</p>
            </div>
          </div>

          {/* Medication Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Medication Name</p>
              <p className="font-semibold text-gray-900">{treatmentData.medication_name}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-900">{treatmentData.duration_days} days</p>
            </div>
          </div>

          {/* Dosage Information */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Dosage Information</h3>
            <p className="text-gray-700">{treatmentData.dosage_text}</p>
          </div>

          {/* Precautions */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Precautions & Safety</h3>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">{treatmentData.precaution}</p>
            </div>
          </div>

          {/* Alternative Treatments */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Alternative Treatment Options</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">{treatmentData.alternatives_note}</p>
            </div>
          </div>

          {/* Treatment Protocol */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ClipboardList className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">Step-by-Step Protocol:</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Isolate affected animals immediately to prevent disease spread</li>
                  <li>Administer medication as per prescription ({treatmentData.dosage_text})</li>
                  <li>Use {applicationMethod.text.toLowerCase()} application method: {applicationMethod.description.toLowerCase()}</li>
                  <li>Maintain optimal environmental conditions (temperature, water quality, etc.)</li>
                  <li>Monitor animals daily for improvement or adverse reactions</li>
                  <li>Continue treatment for full {treatmentData.duration_days} days period</li>
                  <li>Schedule follow-up examination after treatment completion</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={handleAnalyzeAnother}
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
          >
            Analyze Another Sample
          </button>
          <Link
            to="/"
            className="bg-gray-200 text-gray-800 px-8 py-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}