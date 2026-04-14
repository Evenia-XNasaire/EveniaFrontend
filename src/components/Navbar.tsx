import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { LogOut, Ticket, Menu, X, Sun, Moon, Bell, CheckCheck, Inbox, ShoppingBag, CheckCircle, UserPlus, UserMinus, PlusCircle, MinusCircle, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await api.get('/notifications?category=evenia');
            return response.data;
        },
        enabled: !!user,
        refetchInterval: 30000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.post(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await api.post('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const unreadCount = notifications.filter((n: any) => !n.read_at).length;

    return (
        <nav className="fixed top-0 left-0 z-50 w-full bg-[var(--glass)] backdrop-blur-xl border-b border-[var(--glass-border)] transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
                {/* Left: Logo & Nav Links */}
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                        <img
                            src="/logo.png"
                            alt="Evenia Ticket Logo"
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="text-lg sm:text-2xl font-black tracking-tighter">
                            Evenia<span className="text-primary">Ticket</span>
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        <Link to="/" className="text-sm font-bold text-primary hover:text-accent transition-colors">Événements</Link>
                        {user && (
                            <motion.div
                                animate={{
                                    scale: [1, 1.02, 1],
                                    filter: ['drop-shadow(0 0 0px var(--primary-shadow))', 'drop-shadow(0 0 8px var(--primary-shadow))', 'drop-shadow(0 0 0px var(--primary-shadow))']
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Link
                                    to={user.role === 'organizer' ? '/organizer' : '/my-tickets'}
                                    className="text-sm font-bold text-primary hover:text-accent transition-colors flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
                                >
                                    <LayoutDashboard size={14} className="animate-pulse" />
                                    Tableau de Bord
                                </Link>
                            </motion.div>
                        )}
                        <Link to="/how-it-works" className="text-sm font-bold text-[var(--text-muted)] hover:text-primary transition-colors">Aide & Guide</Link>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 sm:p-2.5 rounded-xl bg-[var(--surface)] text-[var(--text-muted)] hover:text-primary hover:bg-primary/10 transition-all border border-[var(--border)] cursor-pointer"
                        >
                            {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-2 sm:p-2.5 rounded-xl bg-[var(--surface)] text-[var(--text-muted)] hover:text-primary hover:bg-primary/10 transition-all border border-[var(--border)] cursor-pointer relative"
                                >
                                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-danger text-white text-[8px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--background)] px-1">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-4 w-80 sm:w-96 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
                                        >
                                            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]">
                                                <h3 className="font-black text-lg flex items-center gap-2">
                                                    <Bell size={18} className="text-primary" /> Notifications
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <button 
                                                        onClick={() => markAllAsReadMutation.mutate()}
                                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <CheckCheck size={14} /> Tout marquer lu
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-[var(--text-muted)] flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-[var(--border)] flex items-center justify-center">
                                                            <Inbox size={24} className="opacity-50" />
                                                        </div>
                                                        <p className="font-bold text-sm">Aucune notification</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-[var(--border)]">
                                                        {notifications.map((notification: any) => (
                                                            <div 
                                                                key={notification.id} 
                                                                className={`p-4 transition-colors hover:bg-[var(--background)] cursor-pointer flex gap-4 ${!notification.read_at ? 'bg-primary/5' : ''}`}
                                                                onClick={() => {
                                                                    if (!notification.read_at) {
                                                                        markAsReadMutation.mutate(notification.id);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex-shrink-0 mt-1">
                                                                    {notification.type.includes('Ticket') ? (
                                                                        <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center">
                                                                            <CheckCircle size={14} />
                                                                        </div>
                                                                    ) : notification.type.includes('Event') ? (
                                                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                                                            <PlusCircle size={14} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                                                                            <Bell size={14} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm ${!notification.read_at ? 'font-bold' : 'font-medium text-[var(--text-muted)]'}`}>
                                                                        {notification.data.message || 'Nouvelle notification'}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                                                    </p>
                                                                </div>
                                                                {!notification.read_at && (
                                                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 border-t border-[var(--border)] text-center bg-[var(--background)]">
                                                <button onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer px-4 py-2">
                                                    Fermer
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    <div className="h-6 sm:h-8 w-px bg-[var(--border)] mx-1 sm:mx-2 hidden sm:block" />

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden sm:flex flex-col items-end text-right">
                                <span className="text-sm font-bold leading-none">{user.first_name}</span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{user.role}</span>
                            </div>
                            <Link to={user.role === 'organizer' ? '/organizer' : '/profile'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-primary to-accent border-2 border-white/20 flex items-center justify-center text-white font-black shadow-lg hover:scale-105 transition-transform">
                                {user.first_name[0]}
                            </Link>
                            <button onClick={handleLogout} className="p-1.5 sm:p-2 text-danger/70 hover:text-danger hover:scale-110 transition-all cursor-pointer">
                                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="hidden xs:block text-xs sm:text-sm font-bold text-[var(--text-muted)] hover:text-primary transition-colors px-2 sm:px-4 py-2 border border-transparent hover:border-[var(--border)] rounded-xl">Connexion</Link>
                            <Link to="/register" className="btn-primary py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap">S'inscrire</Link>
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button className="lg:hidden p-1.5 sm:p-2 text-[var(--text)] transition-transform active:scale-90" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-[var(--surface)] border-t border-[var(--border)] overflow-hidden"
                    >
                        <div className="p-6 flex flex-col gap-4">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold flex items-center justify-between">
                                Événements <ChevronRight size={20} className="text-primary" />
                            </Link>
                            <Link to="/how-it-works" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold flex items-center justify-between">
                                Guide <ChevronRight size={20} className="text-primary" />
                            </Link>
                            <hr className="border-[var(--border)]" />
                            {user ? (
                                <>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Link to={user.role === 'organizer' ? '/organizer' : '/my-tickets'} onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-primary flex items-center gap-2">
                                            <LayoutDashboard size={20} />
                                            Tableau de Bord
                                        </Link>
                                    </motion.div>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Mon Profil</Link>
                                    <Link to="/my-tickets" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Mes Billets</Link>
                                    <button onClick={handleLogout} className="text-lg font-bold text-danger text-left">Déconnexion</button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-3 px-6 rounded-xl border border-[var(--border)] text-center font-bold">Connexion</Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center py-3 px-6 rounded-xl font-bold">S'inscrire</Link>
                                </div>
                            )}
                            <button
                                onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                                className="flex items-center gap-3 py-3 font-bold text-lg border-t border-[var(--border)]"
                            >
                                {theme === 'light' ? <><Moon /> Mode Sombre</> : <><Sun /> Mode Clair</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
