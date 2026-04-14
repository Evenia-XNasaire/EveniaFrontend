import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Mail, ArrowRight, RefreshCcw, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';

const EmailVerification: React.FC = () => {
    const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [sessionTimer, setSessionTimer] = useState(300); // 5 minutes in seconds
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const email = location.state?.email || localStorage.getItem('pending_verification_email');
    const isNewRegistration = location.state?.isNewRegistration || false;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    // Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/'); // Redirect to home if expired
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    useEffect(() => {
        let timer: any;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            const pastedCode = value.slice(0, 8).toUpperCase().split('');
            const newCode = [...code];
            pastedCode.forEach((char, i) => {
                if (index + i < 8) newCode[index + i] = char;
            });
            setCode(newCode);
            return;
        }

        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);

        if (value && index < 7) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 8) {
            setError('Veuillez entrer le code complet à 8 chiffres.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/verify-code', {
                email,
                code: verificationCode,
            });

            setSuccess('Email vérifié avec succès ! Redirection...');
            login(response.data.access_token, response.data.user);
            localStorage.removeItem('pending_verification_email');

            setTimeout(() => {
                const role = response.data.user.role;
                if (role === 'admin') navigate('/admin');
                else if (role === 'organizer') navigate('/organizer');
                else navigate('/my-tickets');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Code invalide ou expiré.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await api.post('/resend-code', { email });
            setSuccess('Un nouveau code a été envoyé.');
            setResendCooldown(60);
            setSessionTimer(300); // Reset session timer too
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError('Erreur lors de l\'envoi du code.');
        }
    };

    return (
        <MainLayout>
            <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full">
                    {isNewRegistration && (
                        <div className="mb-8 bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-3 bg-indigo-500 rounded-2xl text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-white">Bienvenue parmi nous !</h3>
                                <p className="text-sm text-slate-400">Votre compte a été créé. Validez votre email pour commencer.</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                        {/* Session Timer Badge */}
                        <div className={`absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${sessionTimer < 60 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            <Clock className={`w-3 h-3 ${sessionTimer < 60 ? 'animate-pulse' : ''}`} />
                            {formatTime(sessionTimer)}
                        </div>

                        <div className="text-center mb-10 pt-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20 shadow-inner">
                                <Mail className="w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-3">Vérifiez votre email</h1>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                Nous avons envoyé un code de 8 caractères à <br />
                                <span className="text-indigo-400">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {code.map((char, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={char}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-full h-14 bg-slate-800/50 border border-slate-700 rounded-2xl text-center text-xl font-black text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                ))}
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-sm font-medium">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 p-4 rounded-2xl border border-emerald-400/20 text-sm font-medium">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                        <p>{success}</p>
                                    </div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <RefreshCcw className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Vérifier le compte
                                        <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center pt-8 border-t border-slate-800/50">
                            <p className="text-slate-400 text-sm font-medium">
                                Vous n'avez pas reçu le code ?{' '}
                                <button
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className="text-indigo-400 hover:text-indigo-300 font-black transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                    {resendCooldown > 0 ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCcw className="w-3 h-3 animate-spin" />
                                            Renvoyer ({resendCooldown}s)
                                        </span>
                                    ) : (
                                        'Renvoyer le code'
                                    )}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EmailVerification;
