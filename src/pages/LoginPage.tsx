import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-[70vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 max-w-md w-full shadow-2xl space-y-8"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter">Bienvenue</h2>
                    <p className="text-[var(--text-muted)] font-medium">Connectez-vous pour continuer</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3 text-sm font-bold"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

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
                                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 pl-12 focus:border-primary transition-all outline-none font-medium"
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
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 pl-12 pr-12 focus:border-primary transition-all outline-none font-medium"
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
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div className="text-center text-sm font-medium">
                        <span className="text-[var(--text-muted)] font-bold">Pas de compte ?</span>{" "}
                        <Link to="/register" className="text-primary font-black hover:underline underline-offset-4">Inscrivez-vous</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
