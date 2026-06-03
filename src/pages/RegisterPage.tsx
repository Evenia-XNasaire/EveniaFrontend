import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, CheckCircle2, Building2, UserCircle2, Eye, EyeOff, X, ArrowRight } from 'lucide-react';
import authAfrican from '../assets/images/auth_african.png';

// ─── Password Strength Meter ─────────────────────────────────────────────────
const criteria = [
    { label: 'Au moins 8 caractères', test: (p: string) => p.length >= 8 },
    { label: 'Un chiffre', test: (p: string) => /\d/.test(p) },
    { label: 'Un caractère spécial (@$!%*#?&)', test: (p: string) => /[@$!%*#?&]/.test(p) },
    { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
];

const STRENGTH_LABELS = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Excellent'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6'];

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    if (!password) return null;
    const score = criteria.filter(c => c.test(password)).length;
    const color = STRENGTH_COLORS[score] || STRENGTH_COLORS[1];
    const label = STRENGTH_LABELS[score] || STRENGTH_LABELS[1];

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
        >
            {/* Progress bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Force</span>
                    <motion.span
                        key={label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color }}
                    >
                        {label}
                    </motion.span>
                </div>
                <div className="flex gap-1 h-1.5">
                    {criteria.map((_, i) => (
                        <div key={i} className="flex-1 bg-[var(--border)] overflow-hidden">
                            <motion.div
                                className="h-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: i < score ? 1 : 0 }}
                                transition={{ duration: 0.3, delay: i * 0.07 }}
                                style={{ backgroundColor: color, transformOrigin: 'left' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Criteria checklist */}
            <div className="grid grid-cols-2 gap-1">
                {criteria.map((c, i) => {
                    const ok = c.test(password);
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-1.5"
                        >
                            <motion.div
                                animate={{ scale: ok ? [1, 1.4, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {ok
                                    ? <CheckCircle2 size={12} className="text-emerald-500" />
                                    : <div className="w-3 h-3 rounded-full border border-[var(--border)]" />
                                }
                            </motion.div>
                            <span className={`text-[10px] font-bold leading-tight ${ok ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                                {c.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

// ─── Error Toast Popup ────────────────────────────────────────────────────────
const ErrorToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg mx-auto px-4"
    >
        <div className="bg-red-600 text-white p-4 shadow-2xl shadow-red-900/50 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-bold leading-relaxed">{message}</div>
            <button onClick={onClose} className="hover:bg-white/20 p-1 transition-colors flex-shrink-0">
                <X size={16} />
            </button>
        </div>
        {/* auto-close progress bar */}
        <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 6, ease: 'linear' }}
            className="h-1 bg-red-400 origin-left"
        />
    </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'client' as 'client' | 'organizer'
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Auto-dismiss error after 6s
    React.useEffect(() => {
        if (!errorMsg) return;
        const t = setTimeout(() => setErrorMsg(null), 6000);
        return () => clearTimeout(t);
    }, [errorMsg]);

    const validatePassword = (pass: string) => {
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[@$!%*#?&]/.test(pass);
        const isLongEnough = pass.length >= 8;
        return hasNumber && hasSpecial && isLongEnough;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setFieldErrors(null);

        if (!validatePassword(formData.password)) {
            setErrorMsg('Le mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial (@$!%*#?&).');
            return;
        }
        if (formData.password !== formData.password_confirmation) {
            setErrorMsg('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/register', { ...formData, project_origin: 'evenia' });
            localStorage.setItem('pending_verification_email', formData.email);
            navigate('/verify-email', { state: { email: formData.email, isNewRegistration: true } });
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
                // Show first error in toast
                const firstError = Object.values(data.errors)[0] as string[];
                setErrorMsg(firstError[0]);
            } else {
                setErrorMsg(data?.message || 'Une erreur est survenue lors de l\'inscription.');
            }
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        {
            id: 'client',
            label: 'Client / Participant',
            desc: 'Je souhaite découvrir des événements et acheter des billets.',
            icon: <UserCircle2 className="w-6 h-6" />
        },
        {
            id: 'organizer',
            label: 'Organisateur',
            desc: 'Je souhaite créer et gérer mes propres événements.',
            icon: <Building2 className="w-6 h-6" />
        }
    ];

    return (
        <div className="min-h-screen flex">
            {/* Error Toast Popup */}
            <AnimatePresence>
                {errorMsg && (
                    <ErrorToast message={errorMsg} onClose={() => setErrorMsg(null)} />
                )}
            </AnimatePresence>

            {/* LEFT — Form Panel */}
            <div className="w-full lg:w-3/5 flex items-start justify-center px-6 py-16 bg-[var(--background)] overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl space-y-10"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src="/logo.png" alt="Evenia" className="h-8 w-auto object-contain" />
                        <span className="font-black text-lg tracking-tighter">EVENIA TICKET</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter">Créer un compte</h1>
                        <p className="text-[var(--text-muted)] font-medium">Rejoignez la plus grande communauté d'événements au Cameroun.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Je suis un...</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {roleOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: opt.id as any })}
                                        className={`relative p-6 border-2 text-left transition-all duration-300 ${formData.role === opt.id
                                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                            : 'border-[var(--border)] bg-[var(--surface)] hover:border-primary/50'
                                            }`}
                                    >
                                        <div className={`p-3 mb-4 w-fit ${formData.role === opt.id ? 'bg-primary text-white' : 'bg-[var(--surface)] text-primary border border-[var(--border)]'}`}>
                                            {opt.icon}
                                        </div>
                                        <h4 className="font-black mb-1">{opt.label}</h4>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{opt.desc}</p>
                                        {formData.role === opt.id && (
                                            <CheckCircle2 className="absolute top-4 right-4 text-primary w-5 h-5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Prénom</label>
                                <input
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="Jean"
                                    className={`w-full bg-[var(--surface)] border p-4 focus:border-primary transition-all outline-none font-medium ${fieldErrors?.first_name ? 'border-red-500' : 'border-[var(--border)]'}`}
                                />
                                {fieldErrors?.first_name && <p className="text-xs text-red-500 font-bold">{fieldErrors.first_name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Nom</label>
                                <input
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="Dupont"
                                    className={`w-full bg-[var(--surface)] border p-4 focus:border-primary transition-all outline-none font-medium ${fieldErrors?.last_name ? 'border-red-500' : 'border-[var(--border)]'}`}
                                />
                                {fieldErrors?.last_name && <p className="text-xs text-red-500 font-bold">{fieldErrors.last_name[0]}</p>}
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="votre@email.com"
                                    className={`w-full bg-[var(--surface)] border p-4 focus:border-primary transition-all outline-none font-medium ${fieldErrors?.email ? 'border-red-500' : 'border-[var(--border)]'}`}
                                />
                                {fieldErrors?.email && <p className="text-xs text-red-500 font-bold">{fieldErrors.email[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Téléphone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+237 6xx xxx xxx"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] p-4 focus:border-primary transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className={`w-full bg-[var(--surface)] border p-4 pr-12 focus:border-primary transition-all outline-none font-medium ${fieldErrors?.password ? 'border-red-500' : 'border-[var(--border)]'}`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary transition-colors">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {fieldErrors?.password && <p className="text-xs text-red-500 font-bold">{fieldErrors.password[0]}</p>}
                                <AnimatePresence>
                                    {formData.password && <PasswordStrengthMeter password={formData.password} />}
                                </AnimatePresence>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Confirmer</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-[var(--surface)] border border-[var(--border)] p-4 pr-12 focus:border-primary transition-all outline-none font-medium"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary transition-colors">
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 text-base font-black flex items-center justify-center gap-3 group shadow-2xl shadow-primary/30"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Création du compte...</>
                            ) : (
                                <>Créer mon compte <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>

                        <div className="text-center text-sm font-medium">
                            <span className="text-[var(--text-muted)] font-bold">Déjà inscrit ? </span>
                            <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">Connectez-vous ici</Link>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* RIGHT — Image Panel */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden sticky top-0 h-screen">
                <img
                    src={authAfrican}
                    alt="Festival Africain Evenia"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-black/90 via-black/50 to-primary/20" />
                <div className="relative z-10 flex flex-col justify-between p-16 h-full">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Evenia" className="h-10 w-auto object-contain" />
                        <span className="text-white font-black text-xl tracking-tighter">EVENIA TICKET</span>
                    </div>
                    <div className="space-y-6">
                        <motion.h3
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-black text-white leading-tight tracking-tighter"
                        >
                            Votre billet,<br />
                            <span className="text-primary">toujours avec vous.</span>
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-white/70 font-medium leading-relaxed"
                        >
                            Accédez à vos événements avec un simple QR Code. Fini les billets papier perdus.
                        </motion.p>
                    </div>
                    <p className="text-white/30 text-xs font-bold">© 2025 Evenia Ticket</p>
                </div>
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
                />
            </div>
        </div>
    );
};

export default RegisterPage;
