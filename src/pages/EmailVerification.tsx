import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Mail, ArrowRight, RefreshCcw, CheckCircle2, AlertCircle, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authConcert from '../assets/images/auth_concert.png';

const EmailVerification: React.FC = () => {
    const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [sessionTimer, setSessionTimer] = useState(600); // 10 minutes
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const email = location.state?.email || localStorage.getItem('pending_verification_email');
    const isNewRegistration = location.state?.isNewRegistration || false;

    useEffect(() => {
        if (!email) navigate('/login');
    }, [email, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTimer((prev) => {
                if (prev <= 1) { clearInterval(timer); navigate('/'); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    useEffect(() => {
        let timer: any;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
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
            pastedCode.forEach((char, i) => { if (index + i < 8) newCode[index + i] = char; });
            setCode(newCode);
            return;
        }
        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);
        if (value && index < 7) document.getElementById(`code-${index + 1}`)?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 8) { setError('Veuillez entrer le code complet à 8 chiffres.'); return; }
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/verify-code', { email, code: verificationCode });
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
            setSuccess('Un nouveau code a été envoyé à votre adresse email.');
            setResendCooldown(60);
            setSessionTimer(600);
            setTimeout(() => setSuccess(''), 5000);
        } catch {
            setError('Erreur lors de l\'envoi du code.');
        }
    };

    const filledCount = code.filter(c => c !== '').length;
    const progress = (filledCount / 8) * 100;

    return (
        <div className="min-h-screen flex">
            {/* LEFT — Image Panel */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
                <img
                    src={authConcert}
                    alt="Evenia Ticket"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-primary/30" />
                <div className="relative z-10 flex flex-col justify-between p-16 h-full">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Evenia" className="h-10 w-auto object-contain" />
                        <span className="text-white font-black text-xl tracking-tighter">EVENIA TICKET</span>
                    </div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-20 h-20 bg-primary/20 border border-primary/40 flex items-center justify-center"
                        >
                            <ShieldCheck className="text-primary w-10 h-10" />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl font-black text-white leading-tight tracking-tighter"
                        >
                            Sécurisez<br />
                            <span className="text-primary">votre compte.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-white/70 font-medium leading-relaxed"
                        >
                            La vérification en deux étapes protège votre compte et garantit que seul vous pouvez y accéder.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="space-y-3"
                        >
                            {[
                                '🔐 Accès sécurisé à vos billets',
                                '🎫 Historique de vos événements',
                                '💳 Paiements protégés',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <span className="text-white/80 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <p className="text-white/30 text-xs font-bold">© 2025 Evenia Ticket. Cameroun 🇨🇲</p>
                </div>

                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
                />
            </div>

            {/* RIGHT — Form Panel */}
            <div className="w-full lg:w-3/5 flex items-center justify-center px-6 py-16 bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg space-y-8"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src="/logo.png" alt="Evenia" className="h-8 w-auto object-contain" />
                        <span className="font-black text-lg tracking-tighter">EVENIA TICKET</span>
                    </div>

                    {/* Welcome banner for new registrations */}
                    <AnimatePresence>
                        {isNewRegistration && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/30 p-5 flex items-center gap-4"
                            >
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-emerald-400 text-sm">Bienvenue dans la famille Evenia !</h3>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Votre compte est créé. Validez votre email pour commencer.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center">
                                <Mail size={24} />
                            </div>
                            {/* Timer */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase border ${sessionTimer < 60 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'}`}>
                                <Clock className={`w-3 h-3 ${sessionTimer < 60 ? 'animate-pulse' : ''}`} />
                                {formatTime(sessionTimer)}
                            </div>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">Vérification email</h1>
                        <p className="text-[var(--text-muted)] font-medium">
                            Code envoyé à <span className="text-primary font-black">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Code inputs */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Entrez votre code à 8 caractères</label>
                            <div className="grid grid-cols-8 gap-2">
                                {code.map((char, index) => (
                                    <motion.input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={char}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`w-full h-14 bg-[var(--surface)] border-2 text-center text-xl font-black outline-none transition-all ${
                                            char ? 'border-primary text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]'
                                        } focus:border-primary`}
                                    />
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="h-1 bg-[var(--border)]">
                                    <motion.div
                                        className="h-full bg-primary"
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    {filledCount}/8 caractères saisis
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/30 p-4 text-sm font-bold"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm font-bold"
                                >
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading || filledCount !== 8}
                            className="btn-primary w-full py-5 text-base font-black flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><RefreshCcw className="w-5 h-5 animate-spin" /> Vérification...</>
                            ) : (
                                <>Vérifier mon compte <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>

                        {/* Resend */}
                        <div className="pt-2 border-t border-[var(--border)] text-center">
                            <p className="text-sm text-[var(--text-muted)] font-medium">
                                Vous n'avez pas reçu le code ?{' '}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className="text-primary font-black hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1.5"
                                >
                                    {resendCooldown > 0 ? (
                                        <><RefreshCcw className="w-3 h-3 animate-spin" /> Renvoyer dans {resendCooldown}s</>
                                    ) : 'Renvoyer le code'}
                                </button>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EmailVerification;
