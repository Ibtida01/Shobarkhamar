import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, Star, Send, CheckCircle, MessageSquareQuote } from 'lucide-react';

interface StoredFeedback {
  rating: number;
  feedback: string;
  timestamp: string;
  userName: string;
}

const FEEDBACK_STORAGE_KEY = 'userFeedback';

export function Feedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<StoredFeedback[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
      setFeedbackHistory(Array.isArray(stored) ? stored.reverse() : []);
    } catch {
      setFeedbackHistory([]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const feedbackData: StoredFeedback = {
      rating,
      feedback,
      timestamp: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Anonymous',
    };

    const existingFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    const updatedFeedback = [...existingFeedback, feedbackData];
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
    setFeedbackHistory([...updatedFeedback].reverse());
    setShowSuccessModal(true);
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    setRating(0);
    setFeedback('');
    setHoveredRating(0);
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
              <h1 className="text-2xl font-bold text-gray-900">Feedback & Rating</h1>
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
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                We Value Your Feedback
              </h2>
              <p className="text-gray-600">
                Help us improve our disease detection service
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4 text-center">
                  How would you rate our service?
                </label>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600">
                  {rating === 0 && 'Click to rate'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Share your experience with us
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Tell us what you think about our service, what we can improve, or any suggestions you have..."
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  {feedback.length} / 500 characters
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={rating === 0 || feedback.trim().length === 0}
                  className="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </button>
                <Link
                  to="/selection"
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Previous Feedback</h3>
                <p className="text-sm text-gray-500">Your earlier reviews stay here, and you can always add another one.</p>
              </div>
            </div>

            {feedbackHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <p className="font-semibold text-gray-700">No feedback submitted yet</p>
                <p className="text-sm text-gray-500 mt-1">Your submitted reviews will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                {feedbackHistory.map((entry, index) => (
                  <div key={`${entry.timestamp}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= entry.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{entry.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. You can add another review anytime.
              </p>
              <button
                onClick={handleSuccessOk}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
