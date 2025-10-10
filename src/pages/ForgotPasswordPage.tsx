import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useForgotPassword } from '../hooks/useForgotPassword';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error, success } = useForgotPassword();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    try {
      await forgotPassword(email);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8E1' }}>
      <div className="w-full max-w-md px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity"
          style={{ color: '#8B4513' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Geri Dön</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2" style={{ borderColor: '#FFB300' }}>
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FFB300' }}>
              <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#8B4513' }}>
              Şifremi Unuttum
            </h1>
            <p className="text-sm" style={{ color: '#8B4513', opacity: 0.7 }}>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
            </p>
          </div>

          {success ? (
            // Success Message
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#4CAF50' }}>
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#4CAF50' }}>
                E-posta Gönderildi!
              </h2>
              <p className="text-sm mb-6" style={{ color: '#8B4513' }}>
                Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                <br />
                Lütfen e-postanızı kontrol edin.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)' }}
              >
                Giriş Sayfasına Dön
              </button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: '#8B4513' }}>
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#FFB300' }} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: error ? '#EF4444' : '#FFB300',
                      backgroundColor: '#FFF8E1'
                    }}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: isLoading || !email.trim()
                    ? '#CCC'
                    : 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)',
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Sıfırlama Bağlantısı Gönder
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;