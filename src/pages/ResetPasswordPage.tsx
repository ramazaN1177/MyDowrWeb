import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faCheckCircle, faKey } from '@fortawesome/free-solid-svg-icons';
import { useResetPassword } from '../hooks/useResetPassword';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') || '';
  
  const { resetPassword, isLoading, error, success } = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!password.trim()) {
      setValidationError('Şifre gereklidir');
      return;
    }

    if (password.length < 6) {
      setValidationError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Şifreler eşleşmiyor');
      return;
    }

    if (!resetToken) {
      setValidationError('Geçersiz sıfırlama bağlantısı');
      return;
    }

    try {
      await resetPassword(resetToken, password);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8E1' }}>
      <div className="w-full max-w-md px-6">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2" style={{ borderColor: '#FFB300' }}>
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FFB300' }}>
              <FontAwesomeIcon icon={faKey} className="text-4xl text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#8B4513' }}>
              Yeni Şifre Belirle
            </h1>
            <p className="text-sm" style={{ color: '#8B4513', opacity: 0.7 }}>
              Lütfen yeni şifrenizi girin
            </p>
          </div>

          {success ? (
            // Success Message
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#4CAF50' }}>
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#4CAF50' }}>
                Şifre Değiştirildi!
              </h2>
              <p className="text-sm mb-6" style={{ color: '#8B4513' }}>
                Şifreniz başarıyla değiştirildi.
                <br />
                Artık yeni şifrenizle giriş yapabilirsiniz.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)' }}
              >
                Giriş Sayfasına Git
              </button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit}>
              {/* Password Input */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: '#8B4513' }}>
                  Yeni Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} style={{ color: '#FFB300' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: validationError || error ? '#EF4444' : '#FFB300',
                      backgroundColor: '#FFF8E1'
                    }}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <FontAwesomeIcon 
                      icon={showPassword ? faEyeSlash : faEye} 
                      style={{ color: '#8B4513' }}
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: '#8B4513' }}>
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} style={{ color: '#FFB300' }} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: validationError || error ? '#EF4444' : '#FFB300',
                      backgroundColor: '#FFF8E1'
                    }}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <FontAwesomeIcon 
                      icon={showConfirmPassword ? faEyeSlash : faEye} 
                      style={{ color: '#8B4513' }}
                    />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {(error || validationError) && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-600 text-center font-medium">
                    {validationError || error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                className="w-full py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: isLoading || !password.trim() || !confirmPassword.trim()
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
                    Değiştiriliyor...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faKey} />
                    Şifremi Değiştir
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

export default ResetPasswordPage;

