import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { BASE_URL } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ticket, Heart, MessageSquare, Clock, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryPage: React.FC = () => {
    const { user } = useAuth();

    const { data: history, isLoading } = useQuery({
        queryKey: ['user-history'],
        queryFn: async () => {
            const res = await api.get('/profile/history?category=evenia');
            return res.data;
        }
    });

    const Layout = DashboardLayout;
    //@ts-ignore
    const layoutProps = { role: user?.role as 'organizer' | 'client' | 'admin' || 'client' };

    if (isLoading) {
        return (
            //@ts-ignore
            <Layout {...layoutProps}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        //@ts-ignore
        <Layout {...layoutProps}>
            <div className={`max-w-7xl mx-auto p-6 lg:p-10 space-y-10 ${user?.role === 'client' ? 'mt-10' : ''}`}>
                <header>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Clock className="text-primary" />
                        Mon Historique
                    </h1>
                    <p className="text-[var(--text-muted)] font-medium mt-2">Retrouvez toutes vos activités passées sur la plateforme.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* BILLETS SECTION */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Ticket className="text-primary" size={20} />
                            Mes Billets Achetés
                        </h2>
                        <div className="space-y-4">
                            {history?.tickets?.map((ticket: any) => (
                                <Link
                                    to={`/events/${ticket.ticket_type?.event?.id}`}
                                    key={ticket.id}
                                    className="card-surface p-5 flex items-center gap-4 hover:border-primary/50 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--background)] flex-shrink-0">
                                        {ticket.ticket_type?.event?.image_path ? (
                                            <img
                                                src={ticket.ticket_type.event.image_url}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary/20">
                                                <Calendar size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black truncate">{ticket.ticket_type?.event?.title}</h4>
                                        <p className="text-xs text-[var(--text-muted)] font-bold">{ticket.ticket_type?.name}</p>
                                        <p className="text-[10px] text-primary font-black uppercase mt-1">
                                            Acheté le {format(new Date(ticket.created_at), 'Pp', { locale: fr })}
                                        </p>
                                    </div>
                                    <ChevronRight className="text-[var(--text-muted)] group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                            {history?.tickets?.length === 0 && (
                                <div className="card-surface p-10 text-center text-[var(--text-muted)] italic font-medium">
                                    Aucun billet acheté.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* LIKES & COMMENTS SECTION */}
                    <section className="space-y-10">
                        {/* LIKES */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Heart className="text-danger" size={20} />
                                Événements Likés
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {history?.likes?.map((like: any) => (
                                    <Link
                                        to={`/events/${like.event?.id}`}
                                        key={like.id}
                                        className="card-surface p-4 flex items-center gap-4 hover:border-danger/50 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
                                            <Heart size={20} fill="currentColor" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{like.event?.title}</h4>
                                            <span className="text-[10px] text-[var(--text-muted)] font-black uppercase">
                                                Le {format(new Date(like.created_at), 'Pp', { locale: fr })}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-[var(--text-muted)]" />
                                    </Link>
                                ))}
                                {history?.likes?.length === 0 && (
                                    <p className="text-[var(--text-muted)] italic text-sm text-center py-4">Aucun like pour le moment.</p>
                                )}
                            </div>
                        </div>

                        {/* COMMENTS */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-accent" size={20} />
                                Mes Commentaires
                            </h2>
                            <div className="space-y-4">
                                {history?.comments?.map((comment: any) => (
                                    <div key={comment.id} className="card-surface p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Link to={`/events/${comment.event?.id}`} className="font-bold text-primary hover:underline truncate mr-4">
                                                {comment.event?.title}
                                            </Link>
                                            <span className="text-[10px] text-[var(--text-muted)] font-black uppercase whitespace-nowrap">
                                                {format(new Date(comment.created_at), 'Pp', { locale: fr })}
                                            </span>
                                        </div>
                                        <p className="text-sm bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] italic">
                                            "{comment.content}"
                                        </p>
                                    </div>
                                ))}
                                {history?.comments?.length === 0 && (
                                    <p className="text-[var(--text-muted)] italic text-sm text-center py-4">Aucun commentaire publié.</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default HistoryPage;
