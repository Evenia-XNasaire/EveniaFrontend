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
import { encodeId } from '../utils/idEncoder';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, QrCode, CheckCircle2 } from 'lucide-react';

const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

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
                                <div
                                    key={ticket.id}
                                    className="card-surface p-4 flex items-center justify-between gap-4 transition-all border border-transparent hover:border-[var(--border)]"
                                >
                                    <Link to={`/events/${encodeId(ticket.ticket_type?.event?.id)}`} className="flex items-center gap-4 flex-1 min-w-0 group cursor-pointer">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--background)] flex-shrink-0 group-hover:opacity-80 transition-opacity">
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
                                            <h4 className="font-black truncate group-hover:text-primary transition-colors">{ticket.ticket_type?.event?.title}</h4>
                                            <p className="text-xs text-[var(--text-muted)] font-bold">{ticket.ticket_type?.name}</p>
                                            <p className="text-[10px] text-primary font-black uppercase mt-1">
                                                Acheté le {format(new Date(ticket.created_at), 'Pp', { locale: fr })}
                                            </p>
                                        </div>
                                    </Link>
                                    
                                    <button 
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shrink-0 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                                    >
                                        <QrCode size={16} />
                                        <span>Voir en détail</span>
                                    </button>
                                </div>
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
                                        to={`/events/${encodeId(like.event?.id)}`}
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
                                            <Link to={`/events/${encodeId(comment.event?.id)}`} className="font-bold text-primary hover:underline truncate mr-4">
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

            {/* TICKET DETAILS MODAL */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 flex justify-between items-center border-b border-[var(--border)]">
                            <div>
                                <h3 className="text-xl font-black text-[var(--text)]">Détails du Billet</h3>
                                <p className="text-xs font-medium text-[var(--text-muted)] mt-1">Présentez ce QR code à l'entrée</p>
                            </div>
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--background)] hover:bg-[var(--border)] transition-colors text-[var(--text)]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col items-center">
                                {/* Event Image & Info */}
                                <div className="w-full relative rounded-2xl overflow-hidden bg-[var(--background)] aspect-video mb-6">
                                    {selectedTicket.ticket_type?.event?.image_path ? (
                                        <img 
                                            src={selectedTicket.ticket_type.event.image_url} 
                                            alt={selectedTicket.ticket_type.event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Calendar size={40} className="text-primary/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${selectedTicket.is_validated ? 'bg-danger/90 text-white' : 'bg-success/90 text-white'}`}>
                                            {selectedTicket.is_validated ? 'UTILISÉ' : 'VALIDE'}
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-center mb-1">{selectedTicket.ticket_type?.event?.title}</h2>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mb-6">
                                    {selectedTicket.ticket_type?.name}
                                </span>

                                {/* Details Grid */}
                                <div className="w-full grid grid-cols-2 gap-4 mb-8 bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Participant</p>
                                        <p className="text-sm font-black truncate">
                                            {selectedTicket.participant_name || 
                                             (user ? `${user.first_name} ${user.last_name}` : 'N/A')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Date & Heure</p>
                                        <p className="text-sm font-black truncate">
                                            {selectedTicket.ticket_type?.event?.date_time ? 
                                                format(new Date(selectedTicket.ticket_type.event.date_time), 'Pp', { locale: fr }) : 
                                                'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Lieu</p>
                                        <p className="text-sm font-black truncate">
                                            {selectedTicket.ticket_type?.event?.location || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Prix</p>
                                        <p className="text-sm font-black text-primary">
                                            {(selectedTicket.ticket_type?.price || 0) + (selectedTicket.service_fee || 0)} FCFA
                                        </p>
                                    </div>
                                </div>

                                {/* QR Code Section */}
                                <div className="relative w-full max-w-[220px] aspect-square bg-white rounded-3xl p-4 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-[var(--border)]">
                                    {selectedTicket.qr_code ? (
                                        <QRCode 
                                            value={selectedTicket.qr_code}
                                            size={180}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    ) : (
                                        <QrCode size={40} className="text-[var(--text-muted)]" />
                                    )}
                                    {selectedTicket.is_validated && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center z-10">
                                            <CheckCircle2 size={60} className="text-danger mb-2" />
                                            <span className="text-danger font-black text-lg">DÉJÀ UTILISÉ</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold text-center mt-4">
                                    Réf: {selectedTicket.qr_code || selectedTicket.transaction_id || selectedTicket.id}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-[var(--text)] text-[var(--surface)] p-3 text-center">
                            <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest">
                                Ce billet est personnel. Toute reproduction interdite.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default HistoryPage;
