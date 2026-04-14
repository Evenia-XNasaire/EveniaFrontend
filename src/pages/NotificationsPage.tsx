import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Bell, ShoppingBag, CheckCircle, Ticket, Inbox, CheckCheck, UserPlus, UserMinus, PlusCircle, MinusCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import DashboardLayout from '../layouts/DashboardLayout';

const NotificationsPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications-page'],
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
            queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Also refresh navbar
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await api.post('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const unreadCount = notifications.filter((n: any) => !n.read_at).length;

    return (
        <DashboardLayout role={user?.role as 'client' | 'organizer' | 'admin' || 'client'}>
            <main className="p-6 lg:p-10 space-y-10 max-w-4xl mx-auto">
                <header className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">Notifications 🔔</h1>
                        <p className="text-[var(--text-muted)] font-medium">Suivez l'état de vos billets et vos achats.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsReadMutation.mutate()}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <CheckCheck size={18} />
                            Tout marquer comme lu
                        </button>
                    )}
                </header>

                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-[var(--surface)] animate-pulse rounded-2xl" />
                        ))
                    ) : notifications.length > 0 ? (
                        notifications.map((n: any, index: number) => {
                            const Icon = n.data.type === 'ticket_purchased' ? ShoppingBag :
                                n.data.type === 'ticket_validated' ? CheckCircle :
                                    n.data.type === 'sale' ? Ticket :
                                        n.data.type === 'admin_user_registered' || n.data.type === 'staff_created' ? UserPlus :
                                            n.data.type === 'admin_user_deleted' || n.data.type === 'staff_deleted' ? UserMinus :
                                                n.data.type === 'admin_event_created' || n.data.type === 'event_creation' ? PlusCircle :
                                                    n.data.type === 'admin_event_deleted' || n.data.type === 'event_deleted' ? MinusCircle : Inbox;

                            const colorClass = n.data.type === 'ticket_purchased' ? 'text-emerald-500 bg-emerald-500/10' :
                                n.data.type === 'ticket_validated' ? 'text-indigo-500 bg-indigo-500/10' :
                                    n.data.type === 'sale' ? 'text-amber-500 bg-amber-500/10' :
                                        n.data.type === 'admin_user_registered' || n.data.type === 'staff_created' ? 'text-blue-500 bg-blue-500/10' :
                                            n.data.type === 'admin_user_deleted' || n.data.type === 'staff_deleted' ? 'text-red-500 bg-red-500/10' :
                                                n.data.type === 'admin_event_created' || n.data.type === 'event_creation' ? 'text-purple-500 bg-purple-500/10' :
                                                    n.data.type === 'admin_event_deleted' || n.data.type === 'event_deleted' ? 'text-orange-500 bg-orange-500/10' : 'text-slate-500 bg-slate-500/10';

                            return (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => !n.read_at && markAsReadMutation.mutate(n.id)}
                                    className={`card-surface p-6 flex gap-6 cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden group ${!n.read_at ? 'border-l-4 border-l-primary' : 'opacity-80'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${colorClass}`}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <p className={`text-lg mb-1 leading-snug ${!n.read_at ? 'font-black' : 'font-bold text-[var(--text-muted)]'}`}>
                                                    {n.data.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-bold font-mono tracking-tighter uppercase opacity-60">
                                                    {n.data.event_title && (
                                                        <span className="flex items-center gap-1">
                                                            📅 {n.data.event_title}
                                                        </span>
                                                    )}
                                                    {n.data.ticket_type && (
                                                        <span className="flex items-center gap-1">
                                                            🎫 {n.data.ticket_type}
                                                        </span>
                                                    )}
                                                    <span>
                                                        🕒 {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                                                    </span>
                                                </div>
                                            </div>
                                            {!n.read_at && (
                                                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]" />
                                            )}
                                        </div>
                                    </div>
                                    {/* Glass reflection effect */}
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent to-[rgba(255,255,255,0.05)] opacity-40 group-hover:animate-shine" />
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-24 card-surface border-dashed">
                            <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-12 h-12 text-[var(--text-muted)] opacity-20" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 tracking-tight">C'est le calme plat ici... 🍃</h3>
                            <p className="text-[var(--text-muted)] font-medium max-w-xs mx-auto">
                                Vous n'avez aucune notification pour le moment.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
};

export default NotificationsPage;
