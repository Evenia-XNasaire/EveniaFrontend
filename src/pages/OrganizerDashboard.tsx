import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Ticket, DollarSign, Plus, Calendar as CalendarIcon, MapPin, Edit3, Trash2, BarChart3, Heart, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { BASE_URL } from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DashboardLayout from '../layouts/DashboardLayout';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const OrganizerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const [eventsPage, setEventsPage] = React.useState(1);
    const { data: eventsData, isLoading } = useQuery({
        queryKey: ['organizer-events', eventsPage],
        queryFn: async () => {
            const res = await api.get(`/organizer/my-events?page=${eventsPage}&category=evenia`);
            return res.data;
        },
        enabled: !!user
    });

    const { data: statsData } = useQuery({
        queryKey: ['organizer-stats'],
        queryFn: async () => {
            const res = await api.get('/organizer/stats?category=evenia');
            return res.data;
        },
        enabled: !!user
    });

    const [activityPage, setActivityPage] = React.useState(1);
    const { data: activityData, isLoading: isActivityLoading } = useQuery({
        queryKey: ['organizer-activity', activityPage],
        queryFn: async () => {
            const res = await api.get(`/organizer/activity?page=${activityPage}&category=evenia`);
            return res.data;
        },
        enabled: !!user
    });

    console.log('Organizer Events:', eventsData);

    const deleteEventMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/events/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
        }
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            deleteEventMutation.mutate(id);
        }
    };

    const stats = [
        { label: 'Billets Vendus', value: statsData?.total_tickets_sold?.toLocaleString() || '0', icon: <Ticket size={28} />, color: 'bg-blue-500' },
        { label: 'Revenu Total', value: `${statsData?.total_revenue?.toLocaleString() || '0'} FCFA`, icon: <DollarSign size={28} />, color: 'bg-emerald-500' },
        { label: 'Événements', value: statsData?.total_events || '0', icon: <CalendarIcon size={28} />, color: 'bg-purple-500' },
    ];

    return (
        <DashboardLayout role="organizer">
            <main className="p-6 lg:p-10 space-y-10 overflow-hidden">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">Bonjour, {user?.first_name} {user?.last_name}</h1>
                        <p className="text-[var(--text-muted)] font-medium">Voici ce qui se passe pour vos événements aujourd'hui.</p>
                    </div>
                </header>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/organizer/create')}
                        className="p-8 rounded-[2.5rem] bg-linear-to-br from-primary to-accent text-white shadow-2xl shadow-primary/20 flex flex-col items-center text-center gap-4 group"
                    >
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Créer un événement</h3>
                            <p className="text-sm text-white/80">Lancez une nouvelle billetterie en quelques minutes.</p>
                        </div>
                    </motion.button>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="card-surface p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                    <CalendarIcon size={24} />
                                </div>
                                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full">GESTION</span>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-bold">Mes Événements</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Gérez vos listes et vos participants.</p>
                            </div>
                            <button onClick={() => navigate('/organizer/events')} className="mt-4 text-sm font-black text-primary hover:translate-x-1 transition-transform flex items-center gap-1">
                                VOIR TOUT →
                            </button>
                        </div>
                        <div className="card-surface p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-accent/10 text-accent rounded-xl">
                                    <BarChart3 size={24} />
                                </div>
                                <span className="text-[10px] font-black bg-accent/10 text-accent px-2 py-1 rounded-full">ANALYSE</span>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-bold">Statistiques</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Analysez vos ventes et revenus.</p>
                            </div>
                            <button onClick={() => navigate('/organizer/stats')} className="mt-4 text-sm font-black text-accent hover:translate-x-1 transition-transform flex items-center gap-1">
                                ANALYSER →
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="card-surface p-6 flex items-center gap-6"
                        >
                            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black">{stat.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Local Events List */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black">Mes Événements Récents</h2>
                        <button className="text-primary font-bold hover:underline">Voir tout</button>
                    </div>

                    <div className="card-surface overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Événement</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Date & Lieu</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Type / Prix</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest text-center">Interactions</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Statut</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-6 py-6">
                                                    <div className="h-4 bg-[var(--border)] rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : eventsData?.data?.map((event: any) => (
                                        <tr
                                            key={event.id}
                                            onClick={() => navigate(`/organizer/events/${event.id}`)}
                                            className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={event.image_url || 'https://via.placeholder.com/150'}
                                                        className="w-14 h-14 rounded-xl object-cover"
                                                        alt=""
                                                    />
                                                    <div>
                                                        <p className="font-black text-[var(--text)] group-hover:text-primary transition-colors">{event.title}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{event.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                                                        <CalendarIcon size={14} className="text-primary" />
                                                        {format(new Date(event.date_time), 'PPp', { locale: fr })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                        <MapPin size={14} />
                                                        {event.location}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <span className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">
                                                        {event.ticket_types[0]?.name || 'N/A'}
                                                    </span>
                                                    <p className="text-sm font-bold">{event.ticket_types[0]?.price || 0} FCFA</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center justify-center gap-4 text-[var(--text-muted)]">
                                                    <div className="flex items-center gap-1 group/like">
                                                        <Heart size={14} className="group-hover/like:text-danger transition-colors" />
                                                        <span className="text-xs font-bold">{event.likes_count || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 group/comment">
                                                        <MessageSquare size={14} className="group-hover/comment:text-primary transition-colors" />
                                                        <span className="text-xs font-bold">{event.comments_count || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {event.event_status === 'Passé' && (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-danger/10 text-danger">
                                                        Terminé
                                                    </span>
                                                )}
                                                {event.event_status === 'En cours' && (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-success/10 text-success">
                                                        En cours
                                                    </span>
                                                )}
                                                {event.event_status === 'À venir' && (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary">
                                                        À venir
                                                    </span>
                                                )}
                                                {!event.event_status && (
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${event.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                        {event.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/organizer/edit/${event.id}`);
                                                        }}
                                                        className="p-2 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-primary hover:bg-primary/10 transition-all"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(event.id);
                                                        }}
                                                        className="p-2 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-danger hover:bg-danger/10 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!eventsData?.data || eventsData.data.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)] font-bold">
                                                Aucun événement créé pour le moment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Events Pagination */}
                        {eventsData && eventsData.last_page > 1 && (
                            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                                <p className="text-xs text-[var(--text-muted)] font-bold">
                                    Page {eventsData.current_page} sur {eventsData.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                                        disabled={eventsPage === 1}
                                        className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setEventsPage(p => Math.min(eventsData.last_page, p + 1))}
                                        disabled={eventsPage === eventsData.last_page}
                                        className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Activity Flux */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Clock className="text-primary" size={24} />
                            Flux de Ventes Récentes
                        </h2>
                    </div>

                    <div className="card-surface p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Client</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Événement</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Type / Prix</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] tracking-widest text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {isActivityLoading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-6 py-4">
                                                    <div className="h-4 bg-[var(--border)] rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : activityData?.data?.map((ticket: any) => (
                                        <tr key={ticket.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[var(--text)]">{ticket.user?.first_name} {ticket.user?.last_name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">{ticket.user?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-sm">{ticket.ticket_type?.event?.title}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-primary uppercase">{ticket.ticket_type?.name}</span>
                                                    <span className="text-xs text-emerald-500 font-bold">+{ticket.ticket_type?.price} FCFA</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-xs text-[var(--text-muted)]">{format(new Date(ticket.created_at), 'Pp', { locale: fr })}</p>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!activityData?.data || activityData.data.length === 0) && !isActivityLoading && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] font-bold italic">
                                                Aucune vente de billet récente.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Activity Pagination */}
                        {activityData && activityData.last_page > 1 && (
                            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                                <p className="text-xs text-[var(--text-muted)] font-bold">
                                    Page {activityData.current_page} sur {activityData.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                        disabled={activityPage === 1}
                                        className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setActivityPage(p => Math.min(activityData.last_page, p + 1))}
                                        disabled={activityPage === activityData.last_page}
                                        className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </DashboardLayout>
    );
};

export default OrganizerDashboard;
