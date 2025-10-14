// src/pages/ValidationPage.tsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const ValidationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { verifyEmail, isLoading, verifyError, pendingVerificationEmail } = useAuth();
    const navigate = useNavigate();

    // Show toast when verify error occurs
    useEffect(() => {
        if (verifyError) {
            toast.error(verifyError);
        }
    }, [verifyError]);

    // Eğer pending verification yoksa login'e yönlendir
    useEffect(() => {
        if (!pendingVerificationEmail) {
            navigate("/");
        }
    }, [pendingVerificationEmail, navigate]);

    // İlk input'a otomatik focus
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        // Sadece rakam kabul et
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Otomatik bir sonraki input'a geç
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace ile önceki input'a git
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        
        // Sadece 6 haneli rakamları kabul et
        if (/^\d{6}$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setCode(newCode);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLoading) {
            return;
        }

        const fullCode = code.join('');
        
        if (fullCode.length !== 6) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            await verifyEmail(fullCode);
            toast.success('E-posta doğrulandı! Giriş yapabilirsiniz.');
            navigate("/");
        } catch (error) {
            // Error will be shown via toast through verifyError
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
                <div className="text-center mb-6">
                    <div 
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#FFF8E1' }}
                    >
                        <FontAwesomeIcon 
                            icon={faEnvelope} 
                            className="text-3xl"
                            style={{ color: '#FFB300' }}
                        />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#2E2E2E' }}>
                        E-posta Doğrulama
                    </h2>
                    <p className="text-sm font-medium mb-2" style={{ color: '#666' }}>
                        <span style={{ color: '#FFB300', fontWeight: '600' }}>
                            {pendingVerificationEmail}
                        </span>
                        <br />
                        adresine gönderilen doğrulama kodunu girin
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Verification Code Inputs */}
                    <div className="flex justify-center gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none"
                                style={{
                                    borderColor: digit ? '#FFB300' : '#E0E0E0',
                                    backgroundColor: digit ? '#FFF8E1' : '#F5F5F5',
                                    color: '#2E2E2E',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FFB300';
                                    e.target.style.backgroundColor = '#FFF8E1';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 179, 0, 0.2)';
                                }}
                                onBlur={(e) => {
                                    if (!digit) {
                                        e.target.style.borderColor = '#E0E0E0';
                                        e.target.style.backgroundColor = '#F5F5F5';
                                    }
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
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
                                Doğrulanıyor...
                            </span>
                        ) : (
                            'Doğrula'
                        )}
                    </button>

                    {/* Help Text */}
                    <div className="text-center mt-4">
                        <p className="text-xs" style={{ color: '#999' }}>
                            Kod gelmedi mi?{' '}
                            <button 
                                type="button"
                                className="font-bold hover:underline transition-colors"
                                style={{ color: '#F57C00' }}
                                onClick={() => toast.info('Kod tekrar gönderme özelliği yakında eklenecek')}
                            >
                                Tekrar Gönder
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ValidationPage;