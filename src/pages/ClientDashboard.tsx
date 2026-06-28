import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Download, QrCode, Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DashboardLayout from '../layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { X, CheckCircle2 } from 'lucide-react';

const ClientDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loadingTicketId, setLoadingTicketId] = React.useState<number | null>(null);
    const [selectedTicket, setSelectedTicket] = React.useState<any>(null);

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['my-tickets'],
        queryFn: async () => {
            const response = await api.get('/tickets?category=evenia');
            return response.data;
        },
        enabled: !!user
    });

    const [filter, setFilter] = React.useState<'all' | 'valid' | 'used'>('all');
    const [searchTerm, setSearchTerm] = React.useState('');

    // Filter tickets based on status and search
    const filteredTickets = tickets?.filter((ticket: any) => {
        const matchesSearch = ticket.ticket_type.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.ticket_type.event.location.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'valid') return !ticket.is_validated; // Not yet validated = Valid
        if (filter === 'used') return ticket.is_validated;   // Validated = Used/Invalid for new entry
        return true;
    });

    return (
        <DashboardLayout role={user?.role as any || 'client'}>
            <main className="p-6 lg:p-10 space-y-10 overflow-hidden">
                <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">Mes Billets 🎟️</h1>
                        <p className="text-[var(--text-muted)] font-medium">Retrouvez et gérez vos réservations.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Filter Buttons */}
                        <div className="p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-[var(--background)] shadow-sm text-primary' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setFilter('valid')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'valid' ? 'bg-emerald-500/10 text-emerald-500 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                            >
                                Valides
                            </button>
                            <button
                                onClick={() => setFilter('used')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'used' ? 'bg-red-500/10 text-red-500 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                            >
                                Utilisés
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all w-full sm:w-64"
                            />
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map(i => (
                            <div key={i} className="h-64 bg-[var(--surface)] animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredTickets?.map((ticket: any, index: number) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`card-surface overflow-hidden p-0 flex flex-col sm:flex-row border-l-8 group ${ticket.is_validated ? 'border-l-[var(--text-muted)] opacity-75 grayscale-[0.5]' : 'border-l-primary'}`}
                            >
                                <div className="p-8 flex-1 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{ticket.ticket_type.event.category}</span>
                                            <h3 className="text-2xl font-black group-hover:text-primary transition-colors">{ticket.ticket_type.event.title}</h3>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ticket.is_validated ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {ticket.is_validated ? 'UTILISÉ' : 'VALIDE'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                        <div className="space-y-1">
                                            <p className="text-[var(--text-muted)] text-[10px] uppercase font-black">Début</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-primary" />
                                                {format(new Date(ticket.ticket_type.event.date_time), 'PPp', { locale: fr })}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[var(--text-muted)] text-[10px] uppercase font-black">Fin</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-primary" />
                                                {ticket.ticket_type.event.end_date
                                                    ? format(new Date(ticket.ticket_type.event.end_date), 'PPp', { locale: fr })
                                                    : '--'}
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-1 pt-2 border-t border-[var(--border)] border-dashed">
                                            <p className="text-[var(--text-muted)] text-[10px] uppercase font-black">Lieu</p>
                                            <div className="flex items-center gap-2 text-primary font-bold">
                                                <MapPin size={14} />
                                                {ticket.ticket_type.event.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-[var(--border)] border-dashed">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Type de Billet</p>
                                            <p className="text-lg font-black">{ticket.ticket_type.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                                            >
                                                <QrCode size={18} />
                                                <span>Voir en détail</span>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setLoadingTicketId(ticket.id);
                                                        const response = await api.get(`/tickets/${ticket.id}/download`, {
                                                            responseType: 'blob'
                                                        });
                                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `ticket-${ticket.id}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                        window.URL.revokeObjectURL(url);
                                                    } catch (error) {
                                                        console.error('Erreur lors du téléchargement:', error);
                                                        alert('Erreur lors du téléchargement du billet');
                                                    } finally {
                                                        setLoadingTicketId(null);
                                                    }
                                                }}
                                                disabled={loadingTicketId === ticket.id}
                                                className="p-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all shadow-sm inline-flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                                title="Télécharger le billet"
                                            >
                                                {loadingTicketId === ticket.id ? (
                                                    <Loader2 size={20} className="animate-spin" />
                                                ) : (
                                                    <Download size={20} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full sm:w-12 bg-[var(--surface)] flex items-center justify-center border-l sm:border-l border-[var(--border)] border-dashed">
                                    <div className="sm:rotate-90 whitespace-nowrap text-[10px] font-black tracking-[0.5em] text-[var(--text-muted)] py-4">
                                        #{ticket.qr_code.split('-')[0].toUpperCase()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {(!filteredTickets || filteredTickets.length === 0) && (
                            <div className="col-span-1 md:col-span-2 text-center py-20 card-surface border-dashed">
                                <Ticket className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
                                <h3 className="text-xl font-black mb-2">Aucun billet trouvé</h3>
                                <p className="text-[var(--text-muted)]">
                                    {filter === 'all'
                                        ? "Vous n'avez pas encore acheté de billets."
                                        : `Aucun billet "${filter === 'valid' ? 'valide' : 'utilisé'}" trouvé.`}
                                </p>
                                <Link to="/" className="inline-block mt-6 text-primary font-bold hover:underline">Parcourir les événements</Link>
                            </div>
                        )}
                    </div>
                )}
            </main>

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
        </DashboardLayout>
    );
};

export default ClientDashboard;
