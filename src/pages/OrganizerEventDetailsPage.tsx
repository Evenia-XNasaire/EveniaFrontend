import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, DollarSign, ArrowLeft, Ticket as TicketIcon, Clock, TrendingUp, Heart, MessageSquare, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const OrganizerEventDetailsPage: React.FC = () => {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['organizer-event-details', id],
        queryFn: async () => {
            const response = await api.get(`/organizer/events/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    const [activityPage, setActivityPage] = React.useState(1);
    const { data: activityData, isLoading: isActivityLoading } = useQuery({
        queryKey: ['organizer-event-activity', id, activityPage],
        queryFn: async () => {
            const response = await api.get(`/organizer/events/${id}/activity?page=${activityPage}`);
            return response.data;
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <DashboardLayout role="organizer">
                <div className="flex items-center justify-center h-96">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    const { event, stats } = data || {};

    return (
        <DashboardLayout role="organizer">
            <main className="p-6 lg:p-10 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/organizer')}
                        className="p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black">{event?.title}</h1>
                        <div className="flex items-center gap-4 text-[var(--text-muted)] text-sm font-medium mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {event && format(new Date(event.date_time), 'PPP à HH:mm', { locale: fr })}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {event?.location}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-surface p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <DollarSign size={80} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Revenus Générés</p>
                            <h3 className="text-3xl font-black mt-2">{stats?.revenue?.toLocaleString()} FCFA</h3>
                        </div>
                    </div>
                    <div className="card-surface p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <TicketIcon size={80} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Billets Vendus</p>
                            <h3 className="text-3xl font-black mt-2">{stats?.sold} <span className="text-lg text-[var(--text-muted)] font-medium">/ {stats?.capacity}</span></h3>
                        </div>
                        <div className="w-full bg-[var(--border)] h-2 rounded-full mt-4 overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${Math.min((stats?.sold / stats?.capacity) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="card-surface p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp size={80} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Taux de Remplissage</p>
                            <h3 className="text-3xl font-black mt-2">{stats?.capacity > 0 ? Math.round((stats.sold / stats.capacity) * 100) : 0}%</h3>
                        </div>
                    </div>
                    <div className="card-surface p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Heart size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Interactions (Likes)</p>
                            <div className="flex flex-col gap-2 mt-2">
                                <h3 className="text-3xl font-black">{stats?.likes || 0}</h3>
                                {stats?.reactions_counts && Object.keys(stats.reactions_counts).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {Object.entries(stats.reactions_counts).map(([type, count]) => {
                                            const emojis: Record<string, string> = {
                                                like: '👍', love: '❤️', haha: '😂', angry: '😡', fire: '🔥'
                                            };
                                            const emoji = emojis[type];
                                            if (!emoji || !count) return null;
                                            return (
                                                <div key={type} className="flex items-center gap-1 bg-[var(--background)] px-2 py-0.5 rounded-full border border-[var(--border)] text-[10px]" title={type}>
                                                    <span>{emoji}</span>
                                                    <span className="font-bold text-[var(--text-muted)]">{Number(count)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="card-surface p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-500">
                            <CheckCircle size={80} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Billets Validés</p>
                            <h3 className="text-3xl font-black mt-2 text-emerald-500">{stats?.validated || 0}</h3>
                        </div>
                    </div>

                    <div className="card-surface p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-orange-500">
                            <XCircle size={80} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Non Validés</p>
                            <h3 className="text-3xl font-black mt-2 text-orange-500">{stats?.non_validated || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity (Actualité) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="text-primary" size={20} />
                                Activité Récente
                            </h2>
                        </div>
                        <div className="card-surface p-0 overflow-hidden">
                            {isActivityLoading ? (
                                <div className="p-10 text-center animate-pulse">Chargement de l'activité...</div>
                            ) : activityData?.data?.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Participant</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Type de Billet</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Date d'achat</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {activityData.data.map((ticket: any) => (
                                                    <tr key={ticket.id} className="hover:bg-[var(--background)] transition-colors">
                                                        <td className="px-6 py-4 font-bold">
                                                            {ticket.user?.first_name} {ticket.user?.last_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs uppercase">
                                                                {ticket.ticket_type?.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                                            {format(new Date(ticket.created_at), 'Pp', { locale: fr })}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                                            + {ticket.ticket_type?.price} FCFA
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Activity Pagination */}
                                    {activityData.last_page > 1 && (
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
                                </>
                            ) : (
                                <div className="p-10 text-center text-[var(--text-muted)]">
                                    Aucune activité récente pour ce événement.
                                </div>
                            )}
                        </div>

                        {/* Event Comments Section for Organizer */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-primary" size={20} />
                                Derniers Commentaires
                            </h2>
                            <div className="card-surface p-0 overflow-hidden divide-y divide-[var(--border)]">
                                {event?.comments?.map((comment: any) => (
                                    <div key={comment.id} className="p-6 flex gap-4 hover:bg-[var(--background)] transition-colors">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                            {comment.user?.first_name[0]}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm">{comment.user?.first_name} {comment.user?.last_name}</h4>
                                                <span className="text-[10px] text-[var(--text-muted)] font-black uppercase">
                                                    {format(new Date(comment.created_at), 'Pp', { locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)]">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!event?.comments || event.comments.length === 0) && (
                                    <div className="p-10 text-center text-[var(--text-muted)] italic">
                                        Aucun commentaire sur ce événement.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ticket Types Details */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TicketIcon className="text-accent" size={20} />
                            Types de Billets
                        </h2>
                        <div className="space-y-4">
                            {event?.ticket_types?.map((type: any) => (
                                <div key={type.id} className="card-surface p-5 border-l-4 border-l-primary">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold">{type.name}</h4>
                                        <span className="text-sm font-black">{type.price} FCFA</span>
                                    </div>
                                    <div className="text-sm text-[var(--text-muted)] mb-3">
                                        {type.benefits || "Aucun avantage spécifié"}
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-medium bg-[var(--background)] p-2 rounded-lg">
                                        <span>Reste: <span className="text-[var(--text)] font-bold">{type.quantity_available}</span></span>
                                        <div className="h-4 w-[1px] bg-[var(--border)]" />
                                        <span>Total: <span className="text-[var(--text)] font-bold">{type.quantity_available + (type.tickets_count || 0)}</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
};

export default OrganizerEventDetailsPage;
