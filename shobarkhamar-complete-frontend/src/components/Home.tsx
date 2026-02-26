import { Link } from 'react-router';
import { Fish, Bird, Microscope, Stethoscope, Search, Pill, BookOpen, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { LoginModal } from './LoginModal';
import logoImage from 'figma:asset/7d3279b2af8dc97a9d0e82a307a6444d8edea422.png';
import fishImage from 'figma:asset/62f52d45234fa34e0569cc9cc6fc66e654838740.png';
import poultryImage from 'figma:asset/42eeaf1bf402682fb5a784bdf4ac8a449b212110.png';

export function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [headerStyle, setHeaderStyle] = useState('light');
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight;
      
      if (scrollPosition < heroHeight - 100) {
        setHeaderStyle('dark'); // Hero section
      } else if (scrollPosition < heroHeight * 2 - 100) {
        setHeaderStyle('dark'); // Find disease section
      } else if (scrollPosition < heroHeight * 3 - 100) {
        setHeaderStyle('dark'); // Treat livestock section
      } else if (scrollPosition < heroHeight * 4 - 100) {
        setHeaderStyle('dark'); // Learn more section
      } else {
        setHeaderStyle('light'); // Footer
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className={`border-b fixed top-0 w-full z-50 transition-all duration-300 ${
        headerStyle === 'dark' 
          ? 'bg-black/30 backdrop-blur-md border-white/20' 
          : 'bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src={logoImage} className="w-12 h-12" alt="Logo" />
              <span 
                className={`text-3xl font-medium transition-colors duration-300 ${
                  headerStyle === 'dark' ? 'text-white' : 'text-slate-900'
                }`} 
                style={{fontFamily: 'DM Sans'}}
              >
                Shobar Khamar
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors ${
                  headerStyle === 'dark' 
                    ? 'text-white hover:text-green-300' 
                    : 'text-gray-900 hover:text-green-600'
                }`}
              >
                Home
              </Link>
              <button 
                onClick={() => setShowLoginModal(true)}
                className={`transition-colors ${
                  headerStyle === 'dark' 
                    ? 'text-white/80 hover:text-green-300' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Diagnose tool
              </button>
              <Link 
                to="/about" 
                className={`transition-colors ${
                  headerStyle === 'dark' 
                    ? 'text-white/80 hover:text-green-300' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                About us
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLoginModal(true)}
                className={`font-medium transition-colors ${
                  headerStyle === 'dark' 
                    ? 'text-white/80 hover:text-green-300' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Register
              </button>
              <button 
                onClick={() => setShowLoginModal(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  headerStyle === 'dark'
                    ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-screen bg-gradient-to-r from-blue-900/70 to-green-900/70 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2">
          <div 
            className="bg-cover bg-center opacity-50"
            style={{ backgroundImage: `url(${fishImage})` }}
          />
          <div 
            className="bg-cover bg-center opacity-50"
            style={{ backgroundImage: `url(${poultryImage})` }}
          />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-20">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to shobarkhamar
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4">
              Diagnostic software for fish and poultry diseases
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-2xl">
              Diagnose parasitic, bacterial, viral, nutritional and health problems 
              in tropical fish and poultry with AI-powered analysis.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-block bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg hover:bg-white hover:text-green-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              GET STARTED
            </button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white text-sm">Scroll to explore</div>
          <div className="w-6 h-10 border-2 border-white rounded-full mx-auto mt-2 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Section 1: Find Disease */}
      <div 
        ref={(el) => (sectionsRef.current[0] = el)}
        className="relative h-screen flex items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${fishImage})`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`max-w-2xl transition-all duration-1000 ${activeSection >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
                <Search className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Find disease</h2>
            <p className="text-xl text-white/90 mb-6">
              Use our diagnose tool to search in a comprehensive database of symptoms and diseases 
              for both fish and poultry health issues.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-lg flex items-center gap-3">
                <Fish className="w-8 h-8 text-blue-300" />
                <span className="text-white font-medium">Fish Diseases</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-lg flex items-center gap-3">
                <Bird className="w-8 h-8 text-green-300" />
                <span className="text-white font-medium">Poultry Diseases</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Treat Your Livestock */}
      <div 
        ref={(el) => (sectionsRef.current[1] = el)}
        className="relative h-screen flex items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${poultryImage})`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`max-w-2xl ml-auto transition-all duration-1000 ${activeSection >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
                <Pill className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Treat your livestock</h2>
            <p className="text-xl text-white/90 mb-6">
              Get disease treatments which may include medicines, water treatment, 
              dietary recommendations and prevention strategies.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-lg flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-red-300" />
                <span className="text-white font-medium">Expert Treatment Plans</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Learn More */}
      <div 
        ref={(el) => (sectionsRef.current[2] = el)}
        className="relative h-screen flex items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900"
        />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
               style={{ backgroundImage: `url(${fishImage})` }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`max-w-2xl transition-all duration-1000 ${activeSection >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Learn more</h2>
            <p className="text-xl text-white/90 mb-6">
              Browse our extensive list of fish and poultry diseases to find out 
              more about causes, prognosis and treatment options.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-lg flex items-center gap-3">
                <Microscope className="w-8 h-8 text-purple-300" />
                <span className="text-white font-medium">Research Database</span>
              </div>
            </div>
            <Link
              to="/disease-database"
              className="inline-block mt-6 bg-white text-purple-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Browse Disease Database →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="text-lg">© 2026 shobarkhamar. Helping farmers maintain healthy livestock.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(12px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}