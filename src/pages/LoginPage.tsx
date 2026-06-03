import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, X, ArrowRight } from 'lucide-react';
import authTicket from '../assets/images/auth_ticket.png';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/login', { ...formData, project_origin: 'evenia' });
            login(response.data.access_token, response.data.user);

            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath);
            } else if (response.data.user.role === 'organizer') {
                navigate('/organizer');
            } else {
                navigate('/my-tickets');
            }
        } catch (err: any) {
            if (err.response?.status === 403 && err.response?.data?.requires_verification) {
                localStorage.setItem('pending_verification_email', formData.email);
                navigate('/verify-email', { state: { email: formData.email } });
                return;
            }
            setError(err.response?.data?.message || 'Identifiants invalides');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* LEFT — Image Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src={authTicket}
                    alt="Evenia Ticket App"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-primary/40" />
                <div className="relative z-10 flex flex-col justify-between p-16 h-full">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Evenia" className="h-10 w-auto object-contain" />
                        <span className="text-white font-black text-xl tracking-tighter">EVENIA TICKET</span>
                    </div>
                    <div className="space-y-6">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl font-black text-white leading-tight tracking-tighter"
                        >
                            Vos billets,<br />
                            <span className="text-primary">en un clic.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/70 font-medium text-lg leading-relaxed"
                        >
                            Rejoignez des milliers de fans qui découvrent et réservent leurs événements préférés sur Evenia Ticket.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex gap-4"
                        >
                            {['Concerts', 'Matchs', 'Cinéma', 'Conférences'].map((tag) => (
                                <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/80 px-3 py-1.5 border border-white/20">
                                    {tag}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                    <p className="text-white/30 text-xs font-bold">© 2025 Evenia Ticket. Tous droits réservés.</p>
                </div>
                {/* Animated floating elements */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/3 right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute bottom-1/3 left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl"
                />
            </div>

            {/* RIGHT — Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-10"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src="/logo.png" alt="Evenia" className="h-8 w-auto object-contain" />
                        <span className="font-black text-lg tracking-tighter">EVENIA TICKET</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter">Connexion</h1>
                        <p className="text-[var(--text-muted)] font-medium">Bienvenue ! Connectez-vous pour continuer.</p>
                    </div>

                    {/* Error Popup */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 flex items-start gap-3 text-sm font-bold"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="flex-1">{error}</span>
                                <button onClick={() => setError(null)} className="hover:text-red-300 transition-colors flex-shrink-0">
                                    <X size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="votre@email.com"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] p-4 pl-12 focus:border-primary transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Mot de passe</label>
                                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">Oublié ?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] p-4 pl-12 pr-12 focus:border-primary transition-all outline-none font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-base font-black flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</>
                            ) : (
                                <>Se connecter <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>

                        <div className="text-center text-sm font-medium pt-2">
                            <span className="text-[var(--text-muted)] font-bold">Pas encore de compte ? </span>
                            <Link to="/register" className="text-primary font-black hover:underline underline-offset-4">Créer un compte</Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
