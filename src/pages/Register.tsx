// src/pages/Register.tsx
import { useState, useEffect } from "react";
import { useRegister } from "../hooks/useRegister";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const Register = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { register, isLoading, error } = useRegister();
    const navigate = useNavigate();

    // Show toast when register error occurs
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }
        
        // Validation
        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error("Lütfen tüm alanları doldurun");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Şifreler eşleşmiyor");
            return;
        }

        if (password.length < 6) {
            toast.error("Şifre en az 6 karakter olmalıdır");
            return;
        }

        try {
            await register(email.trim(), password, fullName.trim());
            toast.success("Kayıt başarılı! Lütfen e-postanızı doğrulayın.");
            navigate("/validation");
        } catch (error) {
            // Error will be shown via toast through error state
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen px-5 py-10"
            style={{
                background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 50%, #FFB300 100%)'
            }}
        >
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-5 animate-fade-in">
                <div className="mb-4 flex justify-center">
                    <div className="bg-white rounded-3xl shadow-xl p-3">
                        <div 
                            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: '#FFB300' }}
                        >
                            <img 
                                src="/DowryAppLogo.png" 
                                alt="DowryAppLogo" 
                                className="w-20 h-20 object-contain rounded-2xl" 
                            />
                        </div>
                    </div>
                </div>
                <h1 
                    className="text-3xl font-bold mb-1" 
                    style={{ 
                        color: '#2E2E2E',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' 
                    }}
                >
                    MyDowry
                </h1>
                <p className="text-sm font-medium" style={{ color: '#666' }}>
                    Değerli eşyalarınızı yönetin
                </p>
            </div>

            {/* Form Card */}
            <div 
                className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6"
                style={{
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }}
            >
                <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#2E2E2E' }}>
                    Hesap Oluştur
                </h2>
                <p className="text-sm font-medium text-center mb-6" style={{ color: '#666' }}>
                    Yeni bir hesap açın
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Input */}
                    <Input
                        type="text"
                        placeholder="Ad ve soyadınızı girin"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        leftIcon={<FontAwesomeIcon icon={faUser} />}
                        required
                        placeholderColor="#999"
                        focusBackground={true}
                    />

                    {/* Email Input */}
                    <Input
                        type="email"
                        placeholder="E-posta adresinizi girin"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
                        required
                        placeholderColor="#999"
                        focusBackground={true}
                    />

                    {/* Password Input */}
                    <Input
                        type="password"
                        placeholder="Şifrenizi girin"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<FontAwesomeIcon icon={faLock} />}
                        required
                        placeholderColor="#999"
                        focusBackground={true}
                    />

                    {/* Confirm Password Input */}
                    <Input
                        type="password"
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        leftIcon={<FontAwesomeIcon icon={faLock} />}
                        required
                        placeholderColor="#999"
                        focusBackground={true}
                    />

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full font-bold text-white py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: isLoading 
                                ? 'linear-gradient(90deg, #FFCC80 0%, #FFB74D 100%)'
                                : 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)',
                            boxShadow: '0 4px 16px rgba(255, 179, 0, 0.25)'
                        }}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Kayıt yapılıyor...
                            </span>
                        ) : (
                            'Kayıt Ol'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-sm font-medium text-gray-500">veya</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: '#666' }}>
                            Zaten hesabınız var mı?{' '}
                            <Link 
                                to="/"
                                className="font-bold hover:underline transition-colors"
                                style={{ color: '#F57C00' }}
                            >
                                Giriş Yap
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;