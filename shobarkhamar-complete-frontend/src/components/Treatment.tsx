import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { ArrowLeft, Pill, AlertCircle, Fish, Bird, LogOut, ClipboardList, Syringe, Droplet, AlertTriangle, Info } from 'lucide-react';
import poultryIcon from 'figma:asset/36269bc95e30a658e2dbcacea10d1ccc3ac7bec8.png';
import fishSampleImage from 'figma:asset/81061a8ea05a453e7b182b6e9e85ca8c1777b806.png';
import poultrySampleImage from 'figma:asset/dfc44b2571f492b90efd940d77993d9db48d5a82.png';
import { API_ORIGIN, getDiagnosis } from '../services/api';

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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Extract state - use optional chaining safely
  const state = location.state as {
    from?: string;
    type?: string;
    disease?: string;
    // fullName?: string;
    treatment?: string;
    image?: string;
    diagnosisId?: string;
  } | undefined;

  // Get type from URL params as fallback
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  
  const type = state?.type || typeFromUrl || 'fish';
  const cameFromNotifications = state?.from === 'notifications';
  const disease = state?.disease || '';
  const diagnosisId = state?.diagnosisId;
  // const severity = state?.severity || '';
  // const confidence = state?.confidence || null;
  const image = uploadedImage || state?.image || (type === 'fish' ? fishSampleImage : poultrySampleImage);
  //const fullName = state?.fullName || (type === 'fish' ? 'Epizootic Ulcerative Syndrome' : 'Newcastle Disease');
  const treatment = state?.treatment || (type === 'fish' ? 'Use insecticide' : 'Use antibiotics');

  useEffect(() => {
    let isMounted = true;

    async function loadDiagnosisImage() {
      if (!diagnosisId) return;

      try {
        const diagnosis = await getDiagnosis(diagnosisId);
        const latestImage = diagnosis.images?.[0]?.image_url;
        if (!latestImage || !isMounted) return;

        const resolvedImage = latestImage.startsWith('http')
          ? latestImage
          : `${API_ORIGIN}${latestImage.startsWith('/') ? latestImage : `/${latestImage}`}`;

        setUploadedImage(resolvedImage);
      } catch {
        // Fall back to the route image or static preview if diagnosis lookup fails.
      }
    }

    loadDiagnosisImage();
    return () => {
      isMounted = false;
    };
  }, [diagnosisId]);

// ── Dynamic treatment based on actual AI disease ──
  const diseaseKey = disease?.toLowerCase().replace(/\s+/g, '_') || '';

  const treatmentMap: Record<string, any> = {
    coccidiosis: {
      treatment_id: 'TRT-POULTRY-COCCIDIOSIS',
      treatment_name: 'Coccidiosis Treatment Protocol',
      medication_name: 'Amprolium or Sulfonamides',
      application_method: 'ORAL',
      dosage_text: 'Amprolium: 0.012% in drinking water for 5–7 days',
      duration_days: 7,
      precaution: 'Keep litter dry. Isolate affected birds. Ensure clean water supply. Disinfect housing regularly.',
      alternatives_note: 'Alternative: Toltrazuril (25mg/kg bodyweight). Vitamin K supplement helps reduce bleeding.',
    },
    new_castle_disease: {
      treatment_id: 'TRT-POULTRY-NEWCASTLE',
      treatment_name: 'Newcastle Disease Protocol',
      medication_name: 'Oxytetracycline + Multivitamins',
      application_method: 'ORAL',
      dosage_text: '50mg Oxytetracycline per kg body weight + Vitamin A, D, E supplementation',
      duration_days: 7,
      precaution: 'Isolate infected birds immediately. Disinfect all equipment. Vaccinate healthy birds.',
      alternatives_note: 'Supportive therapy with electrolytes. Consider Enrofloxacin (10mg/kg) for secondary infections.',
    },
    salmonella: {
      treatment_id: 'TRT-POULTRY-SALMONELLA',
      treatment_name: 'Salmonellosis Treatment Protocol',
      medication_name: 'Enrofloxacin or Trimethoprim-Sulfamethoxazole',
      application_method: 'ORAL',
      dosage_text: 'Enrofloxacin: 10mg/kg bodyweight for 5 days',
      duration_days: 5,
      precaution: 'Strict biosecurity. Wash hands thoroughly. Disinfect all surfaces. Isolate affected birds.',
      alternatives_note: 'Alternative: Ampicillin or Chloramphenicol. Always do sensitivity testing before treatment.',
    },
    bacterial_red_disease: {
      treatment_id: 'TRT-FISH-RED-DISEASE',
      treatment_name: 'Bacterial Red Disease Protocol',
      medication_name: 'Oxytetracycline + Salt',
      application_method: 'IN_WATER',
      dosage_text: '50mg Oxytetracycline per liter + 3–5g salt per liter for 5 days',
      duration_days: 5,
      precaution: 'Improve water quality. Reduce stocking density. Remove dead fish immediately.',
      alternatives_note: 'Alternative: Florfenicol or Kanamycin. Consult specialist for dosage.',
    },
    bacterial_gill_disease: {
      treatment_id: 'TRT-FISH-GILL-DISEASE',
      treatment_name: 'Bacterial Gill Disease Protocol',
      medication_name: 'Chloramine-T or Potassium Permanganate',
      application_method: 'BATH',
      dosage_text: 'Chloramine-T: 10mg/L for 1 hour bath treatment',
      duration_days: 7,
      precaution: 'Improve aeration. Reduce organic load. Monitor ammonia levels closely.',
      alternatives_note: 'Alternative: Formalin bath (150–250mg/L for 30–60 min). Remove activated carbon during treatment.',
    },
    fungal_diseases_saprolegniasis: {
      treatment_id: 'TRT-FISH-SAPROLEGNIASIS',
      treatment_name: 'Saprolegniasis Treatment Protocol',
      medication_name: 'Potassium Permanganate or Salt',
      application_method: 'BATH',
      dosage_text: 'Potassium Permanganate: 2mg/L for 1 hour OR salt bath 30g/L for 10 minutes',
      duration_days: 10,
      precaution: 'Remove damaged or dead fish. Improve water quality. Avoid physical injury to fish.',
      alternatives_note: 'Alternative: Malachite green (0.1mg/L) where permitted. Bronopol-based products also effective.',
    },
    parasitic_diseases: {
      treatment_id: 'TRT-FISH-PARASITIC',
      treatment_name: 'Parasitic Disease Protocol',
      medication_name: 'Formalin + Malachite Green',
      application_method: 'BATH',
      dosage_text: 'Formalin 200mg/L for 30–60 minutes + Malachite Green 0.1mg/L',
      duration_days: 10,
      precaution: 'Remove carbon filters during treatment. Increase aeration. Quarantine new fish.',
      alternatives_note: 'Alternative: Praziquantel for flukes (2–10mg/L bath). Trichlorfon for crustacean parasites.',
    },
    viral_diseases_white_tail_disease: {
      treatment_id: 'TRT-FISH-WHITE-TAIL',
      treatment_name: 'White Tail Disease Supportive Care',
      medication_name: 'Antibiotic + Immunostimulant',
      application_method: 'ORAL',
      dosage_text: 'No direct antiviral. Oxytetracycline 50mg/L to prevent secondary bacterial infections.',
      duration_days: 14,
      precaution: 'No cure — prevention through vaccination and biosecurity is critical. Destroy severely infected fish.',
      alternatives_note: 'Focus on biosecurity. Vitamin C supplementation (500mg/kg feed) to boost immunity.',
    },
  };

  const treatmentData = treatmentMap[diseaseKey] || {
    treatment_id: `TRT-${generateUUID().slice(0, 8).toUpperCase()}`,
    treatment_name: `${disease} Treatment Protocol`,
    medication_name: 'Consult a veterinarian',
    application_method: null,
    dosage_text: 'Please consult a qualified veterinarian for proper dosage.',
    duration_days: null,
    precaution: 'Isolate affected animals. Maintain good hygiene. Monitor closely.',
    alternatives_note: 'A veterinarian can recommend the best treatment based on your specific situation.',
    requires_veterinarian: true,
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

  const requiresVeterinarian = Boolean(treatmentData.requires_veterinarian);
  const applicationMethod = treatmentData.application_method
    ? getApplicationMethodDisplay(treatmentData.application_method)
    : null;
  const ApplicationIcon = applicationMethod?.icon;
  const protocolSteps = useMemo(() => {
    if (requiresVeterinarian) {
      return [
        'Isolate the affected animal or birds and reduce contact with the rest of the flock or stock.',
        'Contact a qualified veterinarian or aquatic animal specialist for an examination.',
        'Share the uploaded image, symptoms, and farm conditions to help confirm the diagnosis.',
        'Do not start antibiotics or chemicals without professional guidance.',
        'Follow the veterinarian-prescribed medicine, dosage, and application method exactly.',
        'Monitor animals closely and return for follow-up if symptoms worsen.',
      ];
    }

    return [
      'Isolate affected animals immediately to prevent disease spread',
      `Administer medication as per prescription (${treatmentData.dosage_text})`,
      `Use ${applicationMethod?.text.toLowerCase()} application method: ${applicationMethod?.description.toLowerCase()}`,
      'Maintain optimal environmental conditions (temperature, water quality, etc.)',
      'Monitor animals daily for improvement or adverse reactions',
      `Continue treatment for full ${treatmentData.duration_days} days period`,
      'Schedule follow-up examination after treatment completion',
    ];
  }, [applicationMethod, requiresVeterinarian, treatmentData.dosage_text, treatmentData.duration_days]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleAnalyzeAnother = () => {
    navigate(`/detection?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={cameFromNotifications ? "/notifications" : "/selection"} className="text-gray-600 hover:text-gray-900">
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
                    {/* <p className="text-gray-700">{fullName}</p> */}
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
          {!requiresVeterinarian && applicationMethod && ApplicationIcon && (
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
          )}

          {/* Medication Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{requiresVeterinarian ? 'Recommendation' : 'Medication Name'}</p>
              <p className="font-semibold text-gray-900">{treatmentData.medication_name}</p>
            </div>
            {!requiresVeterinarian && treatmentData.duration_days && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">{treatmentData.duration_days} days</p>
              </div>
            )}
          </div>

          {/* Dosage Information */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{requiresVeterinarian ? 'Professional Guidance' : 'Dosage Information'}</h3>
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
                  {protocolSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
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
            to={cameFromNotifications ? "/notifications" : "/selection"}
            className="bg-gray-200 text-gray-800 px-8 py-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
