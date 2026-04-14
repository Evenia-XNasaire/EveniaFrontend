import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, DollarSign, Activity, Trash2, UserPlus, UserMinus, ShoppingBag, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Verify admin access
    const isAdmin = user?.role === 'admin';

    const { data: summary, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-summary'],
        queryFn: async () => {
            const res = await api.get('/admin/summary');
            return res.data;
        },
        enabled: isAdmin,
        refetchInterval: 30000,
    });

    const [activityPage, setActivityPage] = React.useState(1);
    const { data: activityData, isLoading: activityLoading, isError: activityError } = useQuery({
        queryKey: ['admin-activity', activityPage],
        queryFn: async () => {
            const res = await api.get(`/admin/activity?page=${activityPage}`);
            return res.data;
        },
        enabled: isAdmin,
        refetchInterval: 10000,
    });

    const [eventsPage, setEventsPage] = React.useState(1);
    const { data: eventsData, isLoading: eventsLoading } = useQuery({
        queryKey: ['admin-events', eventsPage],
        queryFn: async () => {
            const res = await api.get(`/admin/events?page=${eventsPage}`);
            return res.data;
        },
        enabled: isAdmin,
    });



    const deleteEventMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/events/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            alert('Événement supprimé avec succès.');
        },
        onError: () => {
            alert('Erreur lors de la suppression de l\'événement.');
        }
    });

    if (!isAdmin) {
        return (
            <DashboardLayout role={user?.role as any || 'client'}> {/* Fallback layout */}
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Accès Refusé</h1>
                    <p>Vous n'avez pas les droits d'administration.</p>
                </div>
            </DashboardLayout>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
        <div className={`card-surface p-6 flex flex-col gap-4 animate-fade-in relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default shadow-sm hover:shadow-xl`} style={{ animationDelay: `${delay}ms` }}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-white group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center justify-between relative z-10">
                <div className={`p-3 rounded-xl text-white shadow-lg ${color}`}>
                    <Icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">{label}</p>
                    <h3 className="text-2xl font-black tracking-tight">{value}</h3>
                </div>
            </div>
            <div className="h-1 w-full bg-[var(--background)] rounded-full overflow-hidden">
                <div className={`h-full ${color} w-3/4 opacity-30 group-hover:w-full transition-all duration-1000`} />
            </div>
        </div>
    );

    return (
        <DashboardLayout role={user?.role as any || 'admin'}>
            <main className="p-6 lg:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Super Admin Dashboard</h1>
                        <p className="text-[var(--text-muted)] font-medium">Vue d'ensemble et statistiques en temps réel.</p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                const response = await api.get('/admin/reports/pdf', { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `rapport-global-${new Date().toISOString().split('T')[0]}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (e) {
                                alert('Erreur lors du téléchargement du rapport.');
                            }
                        }}
                        className="btn-primary py-3 px-6 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Activity size={18} />
                        Exporter Rapport Global
                    </button>
                </header>

                {/* KPI Stats */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <hr className="flex-1 border-[var(--border)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Résumé de la Plateforme</span>
                        <hr className="flex-1 border-[var(--border)]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Users}
                            label="Utilisateurs Total"
                            value={summary?.total_users || 0}
                            color="bg-blue-500"
                            delay={0}
                        />
                        <StatCard
                            icon={Users}
                            label="Organisateurs"
                            value={summary?.total_organizers || 0}
                            color="bg-indigo-500"
                            delay={100}
                        />
                        <StatCard
                            icon={Users}
                            label="Clients"
                            value={summary?.total_clients || 0}
                            color="bg-cyan-500"
                            delay={200}
                        />
                        <StatCard
                            icon={Calendar}
                            label="Total Événements"
                            value={summary?.total_events || 0}
                            color="bg-purple-500"
                            delay={300}
                        />
                        <StatCard
                            icon={ShoppingBag}
                            label="Billets Vendus"
                            value={summary?.total_tickets || 0}
                            color="bg-orange-500"
                            delay={400}
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Volume de Ventes"
                            value={`${summary?.total_sales?.toLocaleString() || 0} FCFA`}
                            color="bg-emerald-500"
                            delay={500}
                        />
                        <StatCard
                            icon={Activity}
                            label="Gains Admin"
                            value={`${summary?.total_commission?.toLocaleString() || 0} FCFA`}
                            color="bg-red-500"
                            delay={600}
                        />
                    </div>
                </section>


                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Live Activity Feed */}
                    <div className="xl:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Activity className="text-primary" />
                            Flux d'Activité
                        </h2>
                        <div className="card-surface p-0 overflow-hidden">
                            <div className="flex flex-col h-[600px]">
                                <div className="flex-1 divide-y divide-[var(--border)] overflow-y-auto">
                                    {activityLoading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="p-4 flex gap-3 animate-pulse">
                                                <div className="h-8 w-8 rounded-lg bg-[var(--border)]" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-[var(--border)] rounded w-3/4" />
                                                    <div className="h-2 bg-[var(--border)] rounded w-1/4" />
                                                </div>
                                            </div>
                                        ))
                                    ) : activityError ? (
                                        <div className="p-10 text-center">
                                            <Activity className="mx-auto text-danger/20 mb-4" size={48} />
                                            <p className="text-danger font-bold italic">Erreur de chargement</p>
                                            <button
                                                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-activity'] })}
                                                className="mt-4 text-xs font-black uppercase text-primary hover:underline"
                                            >
                                                Réessayer
                                            </button>
                                        </div>
                                    ) : activityData?.data?.length > 0 ? (
                                        activityData.data.map((item: any, idx: number) => {
                                            let icon = <Activity size={16} />;
                                            let color = "text-[var(--text-muted)]";
                                            let text = "";

                                            if (item.type === 'user_created') {
                                                icon = <UserPlus size={16} />;
                                                color = "text-blue-500";
                                                text = `Nouveau: ${item.first_name} ${item.last_name} (${item.role})`;
                                            } else if (item.type === 'event_created') {
                                                icon = <Calendar size={16} />;
                                                color = "text-purple-500";
                                                text = `Événement: "${item.title}" par ${item.organizer?.first_name}`;
                                            } else if (item.type === 'ticket_sold') {
                                                icon = <DollarSign size={16} />;
                                                color = "text-emerald-500";
                                                text = `Vente: "${item.ticket_type?.event?.title}" à ${item.user?.first_name}`;
                                            }

                                            return (
                                                <div key={idx} className="p-4 flex gap-3 hover:bg-[var(--background)] transition-colors group">
                                                    <div className={`mt-1 h-8 w-8 rounded-lg bg-[var(--background)] flex items-center justify-center ${color}`}>{icon}</div>
                                                    <div>
                                                        <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{text}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">
                                                            {format(new Date(item.created_at), 'Pp', { locale: fr })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-10 text-center text-[var(--text-muted)]">
                                            <Activity className="mx-auto opacity-10 mb-4" size={48} />
                                            <p className="font-bold italic">Aucune activité récente.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Activity Pagination */}
                                {activityData && activityData.last_page > 1 && (
                                    <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
                                        <button
                                            onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                            disabled={activityPage === 1}
                                            className="p-2 rounded-lg bg-[var(--background)] disabled:opacity-30 hover:bg-[var(--border)] transition-colors"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Page {activityPage} / {activityData.last_page}</span>
                                        <button
                                            onClick={() => setActivityPage(p => Math.min(activityData.last_page, p + 1))}
                                            disabled={activityPage === activityData.last_page}
                                            className="p-2 rounded-lg bg-[var(--background)] disabled:opacity-30 hover:bg-[var(--border)] transition-colors"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Revenue & Events Table */}
                    <div className="xl:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <DollarSign className="text-emerald-500" />
                            Revenus par Événement
                        </h2>
                        <div className="card-surface p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Événement</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Organisateur</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Statut / Date</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Ventes Totales</th>
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
                                                    <td className="px-6 py-4 text-right"><div className="h-4 bg-[var(--border)] rounded w-1/4 ml-auto" /></td>
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
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="font-bold">{ev.total_sales.toLocaleString()} FCFA</div>
                                                        <div className="text-[10px] text-red-500 font-black uppercase">Gain: {ev.commission?.toLocaleString() || 0} FCFA</div>
                                                    </td>
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
                    </div>
                </div>
            </main>
        </DashboardLayout >
    );
};

export default AdminDashboard;
