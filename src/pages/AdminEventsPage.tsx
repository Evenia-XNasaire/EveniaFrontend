import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Trash2, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminEventsPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    // Detect category from URL (e.g., /admin/events?category=événement)
    const searchParams = new URLSearchParams(location.search);
    const categoryQuery = searchParams.get('category') || 'evenia';
    const isConcert = categoryQuery === 'evenia';

    const [eventsPage, setEventsPage] = React.useState(1);

    // Reset page when category changes
    React.useEffect(() => {
        setEventsPage(1);
    }, [categoryQuery]);

    const { data: eventsData, isLoading: eventsLoading } = useQuery({
        queryKey: ['admin-events', categoryQuery, eventsPage],
        queryFn: async () => {
            const res = await api.get(`/admin/events?page=${eventsPage}&category=${categoryQuery}`);
            return res.data;
        },
        enabled: isAdmin,
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/events/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            alert('Événement supprimé avec succès.');
        },
        onError: () => {
            alert('Erreur lors de la suppression de l\'événement.');
        }
    });

    if (!isAdmin) {
        return (
            <DashboardLayout role="client">
                <div className="p-10 text-center text-red-500 font-bold">Accès Refusé</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <main className="p-6 lg:p-10 space-y-10">
                <header>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        {isConcert ? (
                            <>Gestion des Événements <Music className="text-primary" size={40} /></>
                        ) : (
                            <>Gestion des Matchs</>
                        )}
                    </h1>
                    <p className="text-[var(--text-muted)] font-medium">
                        Liste complète et gestion des 'événements via Evenia'.
                    </p>
                </header>

                <div className="card-surface p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">
                                        {isConcert ? 'Événement' : 'Match'}
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Organisateur</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Statut / Date</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Ventes Totales</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Gains Admin</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {eventsLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-3/4" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-1/2" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-1/4" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-1/3" /></td>
                                            <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-[var(--border)] rounded-lg ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    eventsData?.data?.map((ev: any) => (
                                        <tr key={ev.id} className="hover:bg-[var(--background)] group transition-colors">
                                            <td className="px-6 py-4 font-bold group-hover:text-primary transition-colors">{ev.title}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-bold">{ev.organizer}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{ev.organizer_phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-block px-2 py-1 rounded-lg text-[10px] font-black uppercase ${ev.status === 'En cours' ? 'bg-success/10 text-success' :
                                                    ev.status === 'Passé' ? 'bg-[var(--border)] text-[var(--text-muted)]' :
                                                        'bg-primary/10 text-primary'
                                                    }`}>
                                                    {ev.status}
                                                </div>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-tighter">
                                                    {format(new Date(ev.date_time), 'Pp', { locale: fr })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-[var(--text-muted)]">{(ev.total_sales || 0).toLocaleString()} FCFA</td>
                                            <td className="px-6 py-4 text-sm font-black text-primary">{(ev.commission || 0).toLocaleString()} FCFA</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Supprimer cet événement ?')) {
                                                            deleteEventMutation.mutate(ev.id);
                                                        }
                                                    }}
                                                    className="p-2 text-[var(--text-muted)] hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
            </main>
        </DashboardLayout>
    );
};

export default AdminEventsPage;
