import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Calendar, Shield, LogOut, Trash2,
    Edit3, Save, X, AlertTriangle, CheckCircle2, Loader2, Eye, EyeOff
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await api.put('/profile', data);
            return response.data;
        },
        onSuccess: () => {
            setSuccess('Profil mis à jour avec succès !');
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
            setTimeout(() => setError(''), 3000);
        }
    });

    const deleteAccountMutation = useMutation({
        mutationFn: async (password: string) => {
            await api.post('/profile/delete', { password });
        },
        onSuccess: async () => {
            await logout();
            navigate('/');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Mot de passe incorrect');
            setTimeout(() => setError(''), 3000);
        }
    });

    const handleSave = () => {
        updateProfileMutation.mutate(formData);
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setIsEditing(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleDeleteAccount = () => {
        if (!deletePassword) {
            setError('Veuillez entrer votre mot de passe');
            return;
        }
        deleteAccountMutation.mutate(deletePassword);
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <DashboardLayout role={user.role as 'organizer' | 'client' | 'admin'}>
            <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
                <header className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">Mon Profil</h1>
                    <p className="text-[var(--text-muted)] font-medium">Gérez vos informations personnelles et paramètres de compte.</p>
                </header>

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-success/10 border border-success/20 text-success p-4 rounded-2xl flex items-center gap-3 font-bold"
                        >
                            <CheckCircle2 size={24} />
                            {success}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-2xl flex items-center gap-3 font-bold"
                        >
                            <AlertTriangle size={24} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="card-surface p-8 space-y-6 text-center">
                            <div className="w-32 h-32 mx-auto bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30">
                                {user.first_name[0]}{user.last_name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">{user.first_name} {user.last_name}</h2>
                                <p className="text-[var(--text-muted)] font-medium mt-1">{user.email}</p>
                                <span className="inline-block mt-3 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full">
                                    {user.role}
                                </span>
                            </div>
                            <div className="pt-6 border-t border-[var(--border)] space-y-3">
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl font-bold hover:border-primary/50 transition-all"
                                >
                                    <LogOut size={18} />
                                    Se déconnecter
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 text-danger rounded-xl font-bold hover:bg-danger/20 transition-all"
                                >
                                    <Trash2 size={18} />
                                    Supprimer le compte
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Information Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card-surface p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black">Informations Personnelles</h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-all"
                                    >
                                        <Edit3 size={18} />
                                        Modifier
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl font-bold hover:border-danger/50 text-[var(--text-muted)] transition-all"
                                        >
                                            <X size={18} />
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={updateProfileMutation.isPending}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {updateProfileMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            Enregistrer
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                                        <User size={14} />
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 font-bold outline-none focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                                        <User size={14} />
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 font-bold outline-none focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                                        <Mail size={14} />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 font-bold outline-none focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                                        <Phone size={14} />
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 font-bold outline-none focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card-surface p-8 space-y-4">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Shield size={24} className="text-primary" />
                                Informations du Compte
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Rôle</p>
                                    <p className="font-bold capitalize">{user.role}</p>
                                </div>
                                <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Membre depuis</p>
                                    <p className="font-bold">{format(new Date(user.created_at || new Date()), 'PPP', { locale: fr })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Confirmation Modal */}
                <AnimatePresence>
                    {showLogoutModal && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                                onClick={() => setShowLogoutModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            >
                                <div className="card-surface p-8 max-w-md w-full space-y-6">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                                        <LogOut size={32} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black">Se déconnecter ?</h3>
                                        <p className="text-[var(--text-muted)]">Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowLogoutModal(false)}
                                            className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl font-bold hover:border-primary/50 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
                                        >
                                            Confirmer
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Delete Account Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                                onClick={() => setShowDeleteModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            >
                                <div className="card-surface p-8 max-w-md w-full space-y-6">
                                    <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-danger">Supprimer le compte</h3>
                                        <p className="text-[var(--text-muted)]">
                                            Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                                            Confirmez avec votre mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                placeholder="Entrez votre mot de passe"
                                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 pr-12 font-bold outline-none focus:border-danger transition-all"
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
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setDeletePassword('');
                                            }}
                                            className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl font-bold hover:border-primary/50 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleteAccountMutation.isPending || !deletePassword}
                                            className="flex-1 px-4 py-3 bg-danger text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {deleteAccountMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Suppression...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={18} />
                                                    Supprimer
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
