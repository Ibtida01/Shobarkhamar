import { useLocation, Link } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle, Pill } from 'lucide-react';

interface DetectionResult {
  isHealthy: boolean;
  disease?: string;
  symptoms: string[];
  treatment: {
    immediate: string[];
    medication: string[];
    prevention: string[];
  };
}

export function Results() {
  const location = useLocation();
  const { result, image, type } = location.state as {
    result: DetectionResult;
    image: string;
    type: string;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/detection" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Detection Results</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Uploaded Image</h3>
            <img
              src={image}
              alt="Analyzed sample"
              className="w-full rounded-lg object-contain bg-gray-100 max-h-80"
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Analysis Summary</h3>
            
            {result.isHealthy ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Healthy</p>
                  <p className="text-sm text-green-700">
                    No diseases detected. Your {type} appears to be healthy!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 border rounded-lg mb-4 text-red-600 bg-red-50 border-red-200">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{result.disease}</p>
                  <p className="text-sm mt-1">A disease was detected in this sample.</p>
                </div>
              </div>
            )}

            {!result.isHealthy && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Observed Symptoms:</h4>
                  <ul className="space-y-1">
                    {result.symptoms.map((symptom, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {!result.isHealthy && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <Pill className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">Treatment Recommendations</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  Immediate Actions
                </h4>
                <ul className="space-y-2">
                  {result.treatment.immediate.map((action, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Medication
                </h4>
                <ul className="space-y-2">
                  {result.treatment.medication.map((med, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      {med}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  Prevention
                </h4>
                <ul className="space-y-2">
                  {result.treatment.prevention.map((prev, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">→</span>
                      {prev}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> These are general recommendations. Please consult with a
                veterinarian or aquaculture/poultry specialist for proper diagnosis and treatment
                specific to your situation.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/detection"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Analyze Another Sample
          </Link>
          <Link
            to="/"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
