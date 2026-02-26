import { Link } from 'react-router';
import { ArrowLeft, Target, Users, Microscope, Database, FileText, Bell, History } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">About shobarkhamar</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Empowering Farmers with AI Technology
          </h2>
          <p className="text-gray-700 mb-4">
            shobarkhamar is an innovative platform designed to help farmers detect and manage
            diseases in fish and poultry using advanced AI technology. Our mission is to make disease
            detection accessible, fast, and accurate for farmers worldwide.
          </p>
          <p className="text-gray-700">
            By simply uploading an image of your fish or poultry faeces, our system analyzes the
            visual indicators and provides instant diagnosis along with treatment recommendations,
            helping you take immediate action to protect your livestock.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Our Mission</h3>
            <p className="text-sm text-gray-700">
              To provide farmers with accessible, AI-powered tools for early disease detection and
              prevention in aquaculture and poultry farming.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Microscope className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Technology</h3>
            <p className="text-sm text-gray-700">
              Our platform uses advanced computer vision and machine learning algorithms trained on
              disease samples for accurate detection.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">For Farmers</h3>
            <p className="text-sm text-gray-700">
              Built by experts in aquaculture and poultry science, our platform is designed to be
              simple and accessible for farmers of all experience levels.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-lg p-3 h-fit">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Disease Database</h4>
                <p className="text-sm text-gray-700">
                  Access detailed information about fish and poultry diseases, including symptoms,
                  diagnosis methods, treatments, and prevention strategies.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-100 rounded-lg p-3 h-fit">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Digital Prescriptions</h4>
                <p className="text-sm text-gray-700">
                  Receive detailed prescriptions with medication names, dosages, frequencies,
                  and special instructions from certified specialists.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-yellow-100 rounded-lg p-3 h-fit">
                <History className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Diagnosis History</h4>
                <p className="text-sm text-gray-700">
                  Track all your past diagnoses, treatments, and outcomes to monitor your
                  farm's health over time and identify patterns.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-red-100 rounded-lg p-3 h-fit">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart Notifications</h4>
                <p className="text-sm text-gray-700">
                  Get timely reminders for medication schedules, follow-up examinations,
                  and treatment updates to ensure proper care.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Register & Setup Profile</h4>
                <p className="text-sm text-gray-700">
                  Create your account with personal details and farm information to personalize
                  your experience and track your farm's health records.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Select Animal Type</h4>
                <p className="text-sm text-gray-700">
                  Choose between fish or poultry diagnosis and provide relevant farm information
                  such as species, farm size, and culture type.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Upload Images</h4>
                <p className="text-sm text-gray-700">
                  Upload clear images of your fish or poultry faeces samples through our
                  easy-to-use drag-and-drop interface.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">AI Analysis & Diagnosis</h4>
                <p className="text-sm text-gray-700">
                  Our AI system analyzes the image, comparing it against a comprehensive database of
                  disease patterns and provides instant disease detection results.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Treatment & Prescription</h4>
                <p className="text-sm text-gray-700">
                  Receive detailed treatment recommendations from specialist veterinarians,
                  including medication prescriptions, dosages, and care instructions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                6
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Track & Monitor</h4>
                <p className="text-sm text-gray-700">
                  Monitor treatment progress, receive medication reminders via notifications,
                  and track recovery outcomes in your diagnosis history.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Data & Privacy</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Your data is secure:</strong> All user information, farm details, and diagnosis
              records are stored securely and used only to provide you with personalized disease
              detection and treatment services.
            </p>
            <p>
              <strong>Comprehensive tracking:</strong> Our system maintains detailed records of:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>User profiles (name, contact information, address)</li>
              <li>Farm information (species, size, culture type)</li>
              <li>Diagnosis history with timestamps</li>
              <li>Treatment logs and recovery outcomes</li>
              <li>Prescription records and medication details</li>
              <li>Specialist consultations and recommendations</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Supported Diseases</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Fish Diseases</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• EUS (Epizootic Ulcerative Syndrome)</li>
                <li>• Ich (White Spot Disease)</li>
                <li>• Bacterial infections</li>
                <li>• Parasitic diseases</li>
                <li>• Fungal infections</li>
                <li>...and more in our database</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-3">Poultry Diseases</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• NVD (Newcastle Disease)</li>
                <li>• Coccidiosis</li>
                <li>• Avian influenza</li>
                <li>• Bacterial infections</li>
                <li>• Nutritional deficiencies</li>
                <li>...and more in our database</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">Disclaimer</h3>
          <p className="text-sm text-blue-800">
            This platform is designed as a supportive tool for disease detection. While our AI
            provides accurate analysis based on visual indicators, it should not replace professional
            veterinary consultation. Always consult with qualified veterinarians or specialists for
            final diagnosis and treatment plans. The prescriptions and treatment recommendations are
            generated based on best practices but should be verified by licensed professionals.
          </p>
        </div>
      </main>
    </div>
  );
}