import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pill, AlertCircle, Fish, LogOut, ClipboardList, Syringe, Droplet, AlertTriangle, Info } from 'lucide-react';
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
  
  const state = location.state as {
    type?: string;
    disease?: string;
    fullName?: string;
    treatment?: string;
    image?: string;
    confidence?: number;
    severity?: string;
  } | undefined;

  const confidence = state?.confidence;
  const severity = state?.severity;

  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  
  const type = state?.type || typeFromUrl || 'fish';
  const disease = state?.disease || '';
  const image = state?.image || (type === 'fish' ? fishSampleImage : poultrySampleImage);
  const fullName = state?.fullName || (type === 'fish' ? 'Epizootic Ulcerative Syndrome' : 'Newcastle Disease');

  const diseaseKey = disease?.toLowerCase().replace(/\s+/g, '_') || '';

  const treatmentMap: Record<string, any> = {
    coccidiosis: {
      treatment_name: 'Coccidiosis Treatment Protocol',
      medication_name: 'Amprolium or Sulfonamides',
      application_method: 'ORAL',
      dosage_text: 'Amprolium: 0.012% in drinking water for 5–7 days',
      duration_days: 7,
      precaution: 'Keep litter dry. Isolate affected birds.',
      alternatives_note: 'Alternative: Toltrazuril.',
    },
    new_castle_disease: {
      treatment_name: 'Newcastle Disease Protocol',
      medication_name: 'Oxytetracycline + Multivitamins',
      application_method: 'ORAL',
      dosage_text: '50mg/kg body weight',
      duration_days: 7,
      precaution: 'Isolate infected birds.',
      alternatives_note: 'Use electrolytes.',
    }
  };

  const treatmentData = treatmentMap[diseaseKey] || {
    treatment_name: `${disease} Treatment Protocol`,
    medication_name: 'Consult a veterinarian',
    application_method: 'ORAL',
    dosage_text: 'Consult vet',
    duration_days: 7,
    precaution: 'Maintain hygiene.',
    alternatives_note: 'Consult expert.',
  };

  const prescription = {
    id: `RX-${Date.now()}`,
    date: new Date().toLocaleDateString(),
  };

  const getApplicationMethodDisplay = (method: string) => {
    const methods: any = {
      ORAL: { icon: Pill, text: 'Oral', description: 'Mix with feed' },
      BATH: { icon: Droplet, text: 'Bath', description: 'Immersion treatment' }
    };
    return methods[method] || methods.ORAL;
  };

  const applicationMethod = getApplicationMethodDisplay(treatmentData.application_method);
  const ApplicationIcon = applicationMethod.icon;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow flex justify-between">
        <Link to="/selection"><ArrowLeft /></Link>
        <button onClick={handleLogout}><LogOut /></button>
      </header>

      <main className="p-6">

        {/* Disease Box */}
        <div className="bg-red-50 p-6 rounded-lg mb-6">
          <AlertCircle className="text-red-600" />
          
          <p className="text-2xl font-bold text-red-600 mb-1 break-words">
            {disease || 'Unknown Disease'}
          </p>

          {confidence !== undefined && (
            <p className="text-sm text-gray-600">
              Confidence: {confidence}%
            </p>
          )}

          {severity && (
            <p className="text-sm font-semibold text-orange-600">
              Severity: {severity}
            </p>
          )}

          <p className="text-gray-700 mt-2">{fullName}</p>
        </div>

        {/* Treatment */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold">{treatmentData.treatment_name}</h2>

          <p>Medication: {treatmentData.medication_name}</p>
          <p>Duration: {treatmentData.duration_days} days</p>

          <div className="mt-4">
            <ApplicationIcon />
            <p>{applicationMethod.text}</p>
            <p>{applicationMethod.description}</p>
          </div>

          <div className="mt-4">
            <p>{treatmentData.dosage_text}</p>
          </div>
        </div>

      </main>
    </div>
  );
}