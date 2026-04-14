import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, CheckCircle2, Building2, UserCircle2, Eye, EyeOff } from 'lucide-react';

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
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = (pass: string) => {
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[@$!%*#?&]/.test(pass);
        const isLongEnough = pass.length >= 8;
        return hasNumber && hasSpecial && isLongEnough;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validatePassword(formData.password)) {
            setError({ message: 'Le mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial (@$!%*#?&).' });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError({ message: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        setLoading(true);

        try {
            await api.post('/register', { ...formData, project_origin: 'evenia' });
            // After register, we need to verify email
            localStorage.setItem('pending_verification_email', formData.email);
            navigate('/verify-email', { state: { email: formData.email, isNewRegistration: true } });
        } catch (err: any) {
            setError(err.response?.data?.errors || { message: err.response?.data?.message || 'Erreur lors de l\'inscription' });
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
        <div className="flex items-center justify-center min-h-[90vh] px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 md:p-12 max-w-2xl w-full shadow-2xl space-y-10"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter">Créer un compte</h2>
                    <p className="text-[var(--text-muted)] font-medium">Rejoignez la plus grande communauté d'événements</p>
                </div>

                {error && typeof error === 'object' && error.message && (
                    <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
                        <AlertCircle className="w-5 h-5" />
                        {error.message}
                    </div>
                )}

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
                                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${formData.role === opt.id
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl mb-4 w-fit ${formData.role === opt.id ? 'bg-primary text-white' : 'bg-[var(--surface)] text-primary border border-[var(--border)]'}`}>
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

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Prénom</label>
                            <input
                                required
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                placeholder="Jean"
                                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-medium"
                            />
                            {error?.first_name && <p className="text-xs text-danger font-bold mt-1">{error.first_name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Nom</label>
                            <input
                                required
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                placeholder="Dupont"
                                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-medium"
                            />
                            {error?.last_name && <p className="text-xs text-danger font-bold mt-1">{error.last_name[0]}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="votre@email.com"
                                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-medium"
                            />
                            {error?.email && <p className="text-xs text-danger font-bold mt-1">{error.email[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+237 6xx xxx xxx"
                                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 pr-12 focus:border-primary transition-all outline-none font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {error?.password && <p className="text-xs text-danger font-bold mt-1">{error.password[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Confirmer</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 pr-12 focus:border-primary transition-all outline-none font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40"
                    >
                        {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                        {loading ? 'Création du compte...' : 'Créer mon compte'}
                    </button>

                    <div className="text-center text-sm font-medium">
                        <span className="text-[var(--text-muted)] font-bold">Déjà inscrit ?</span>{" "}
                        <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">Connectez-vous ici</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
