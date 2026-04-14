import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, ShieldCheck, Phone, Key, Trash2, Edit2, CheckCircle, XCircle, MoreVertical, Search, Filter, QrCode, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StaffManagementPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        unique_code: '',
        notes: ''
    });

    // Pagination for Stats Cards (Total Scans)
    const [statsCardPage, setStatsCardPage] = useState(1);
    const STATS_CARDS_PER_PAGE = 8;

    // Pagination for Scan History Table
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 8;

    const { data: staffMembers, isLoading: isLoadingStaff } = useQuery({
        queryKey: ['organizer-staff'],
        queryFn: async () => {
            const res = await api.get('/organizer/staff');
            return res.data;
        }
    });

    const { data: validatedTickets, isLoading: isLoadingTickets } = useQuery({
        queryKey: ['organizer-validated-tickets'],
        queryFn: async () => {
            const res = await api.get('/organizer/validated-tickets?category=evenia');
            return res.data;
        }
    });

    const createStaffMutation = useMutation({
        mutationFn: (data: any) => api.post('/organizer/staff', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-staff'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const updateStaffMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => api.put(`/organizer/staff/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-staff'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const deleteStaffMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/organizer/staff/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-staff'] });
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: number) => api.put(`/organizer/staff/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-staff'] });
        }
    });

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            phone: '',
            unique_code: '',
            notes: ''
        });
        setEditingStaff(null);
    };

    const handleEdit = (staff: any) => {
        setEditingStaff(staff);
        setFormData({
            first_name: staff.first_name,
            last_name: staff.last_name,
            email: staff.email || '',
            password: staff.password,
            phone: staff.phone,
            unique_code: staff.unique_code,
            notes: staff.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
            deleteStaffMutation.mutate(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStaff) {
            updateStaffMutation.mutate({ id: editingStaff.id, data: formData });
        } else {
            createStaffMutation.mutate(formData);
        }
    };

    return (
        <DashboardLayout role="organizer">
            <main className="p-6 lg:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">Gestion du Staff 🛡️</h1>
                        <p className="text-[var(--text-muted)] font-medium">Gérez votre équipe et suivez les validations de billets de événement.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/scanner')}
                            className="bg-accent/10 text-accent px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-accent/20 transition-all"
                        >
                            <QrCode size={20} />
                            Ouvrir le Scanner
                        </button>
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="btn-primary flex items-center gap-2"
                        >
                            <UserPlus size={20} />
                            Ajouter un membre
                        </button>
                    </div>
                </header>
                {/* Stats Summary by Event (Total Scans) */}
                {!isLoadingTickets && validatedTickets?.length > 0 && (() => {
                    const groupedStats = Object.entries(
                        validatedTickets.reduce((acc: any, ticket: any) => {
                            const title = ticket.ticket_type?.event?.title || 'Événement inconnu';
                            if (!acc[title]) acc[title] = { scanned: 0, total: 0 };
                            acc[title].total += 1;
                            if (ticket.is_validated) acc[title].scanned += 1;
                            return acc;
                        }, {})
                    );

                    const totalPages = Math.ceil(groupedStats.length / STATS_CARDS_PER_PAGE);
                    const startIndex = (statsCardPage - 1) * STATS_CARDS_PER_PAGE;
                    const paginatedStats = groupedStats.slice(startIndex, startIndex + STATS_CARDS_PER_PAGE);

                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <ShieldCheck className="text-primary" />
                                    Statistiques de Scan
                                </h2>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={statsCardPage === 1}
                                            onClick={() => setStatsCardPage(p => Math.max(1, p - 1))}
                                            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl disabled:opacity-30 hover:bg-primary/5 transition-all"
                                        >
                                            <MoreVertical size={16} className="rotate-90" />
                                        </button>
                                        <span className="text-xs font-black uppercase text-[var(--text-muted)]">
                                            Page {statsCardPage} / {totalPages}
                                        </span>
                                        <button
                                            disabled={statsCardPage === totalPages}
                                            onClick={() => setStatsCardPage(p => Math.min(totalPages, p + 1))}
                                            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl disabled:opacity-30 hover:bg-primary/5 transition-all"
                                        >
                                            <MoreVertical size={16} className="-rotate-90" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {paginatedStats.map(([title, stats]: [string, any], idx: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={title}
                                            className="card-surface p-6 border-l-4 border-primary hover:shadow-xl hover:shadow-primary/5 transition-all group"
                                        >
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1 group-hover:text-primary transition-colors text-ellipsis overflow-hidden whitespace-nowrap">
                                                Scans : {title}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-black">
                                                        {stats.scanned}
                                                        <span className="text-sm text-[var(--text-muted)] font-bold"> / {stats.total}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${stats.total === stats.scanned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-danger/10 text-danger'
                                                            }`}>
                                                            {stats.total === stats.scanned ? 'Complet ✨' : `${stats.total - stats.scanned} restants`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                                                    <QrCode size={24} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })()}

                <div className="space-y-10">
                    {/* Staff Members List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black">Membres de l'organisation</h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">
                                    {staffMembers?.length || 0} MEMBRES
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoadingStaff ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="card-surface h-48 animate-pulse bg-[var(--surface-light)]" />
                                ))
                            ) : staffMembers?.map((member: any) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={member.id}
                                    className="card-surface group relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg">{member.first_name} {member.last_name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-bold">
                                                    <ShieldCheck size={14} className="text-emerald-500" />
                                                    CODE: <span className="text-primary">{member.unique_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(member)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-danger/10 text-danger rounded-xl transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center text-[var(--text-muted)]">
                                                <Phone size={16} />
                                            </div>
                                            {member.phone}
                                        </div>
                                        {member.email && (
                                            <div className="flex items-center gap-3 text-sm font-medium">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center text-[var(--text-muted)]">
                                                    <Mail size={16} />
                                                </div>
                                                {member.email}
                                            </div>
                                        )}
                                        {member.notes && (
                                            <p className="text-xs text-[var(--text-muted)] italic bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                                                "{member.notes}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[var(--border)]">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatusMutation.mutate(member.id);
                                                    }}
                                                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase transition-all px-2 py-1 rounded-lg border w-fit group/status ${member.is_active
                                                        ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                                                        : 'text-danger border-danger/20 bg-danger/5 hover:bg-danger/10'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full transition-all ${member.is_active
                                                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                                        : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                                        }`} />
                                                    {toggleStatusMutation.isPending && toggleStatusMutation.variables === member.id ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        <span>{member.is_active ? 'Actif' : 'Inactif'}</span>
                                                    )}
                                                </button>
                                                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-1">
                                                    Total : {member.validated_tickets_count || 0} scans
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
                                                Inscrit le {format(new Date(member.created_at), 'PP', { locale: fr })}
                                            </span>
                                        </div>

                                        {/* Breakdown per Événement */}
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Détails par événement :</p>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {(() => {
                                                    const staffStats: Record<string, number> = {};
                                                    validatedTickets?.forEach((ticket: any) => {
                                                        if (ticket.validated_by_staff_id === member.id) {
                                                            const eventTitle = ticket.ticket_type?.event?.title || 'Événement inconnu';
                                                            staffStats[eventTitle] = (staffStats[eventTitle] || 0) + 1;
                                                        }
                                                    });

                                                    const statsEntries = Object.entries(staffStats);

                                                    if (statsEntries.length === 0) {
                                                        return <p className="text-[10px] text-[var(--text-muted)] italic">Aucun scan pour le moment</p>;
                                                    }

                                                    return statsEntries.map(([event, count]) => (
                                                        <div key={event} className="flex items-center justify-between bg-[var(--background)] px-3 py-2 rounded-lg border border-[var(--border)] group/stat hover:border-primary/50 transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                <span className="text-[10px] font-bold text-[var(--text-muted)] truncate">{event}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full shrink-0">
                                                                {count}
                                                            </span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Full Width Recent Validations Section at the Bottom */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <ShieldCheck className="text-primary" />
                                Historique Complet des Scans
                            </h2>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase">
                                {validatedTickets?.length || 0} VALIDATIONS
                            </span>
                        </div>

                        <div className="card-surface p-0 overflow-hidden shadow-xl border border-[var(--border)]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[var(--surface-light)] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Ticket / Client</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Événement</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Scanné par</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Heure exacte</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {isLoadingTickets ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={4} className="p-6 h-16 bg-primary/5"></td>
                                                </tr>
                                            ))
                                        ) : (() => {
                                            const validatedOnly = validatedTickets?.filter((t: any) => t.is_validated) || [];
                                            const totalHistoryPages = Math.ceil(validatedOnly.length / HISTORY_PER_PAGE);
                                            const start = (historyPage - 1) * HISTORY_PER_PAGE;
                                            const paginatedHistory = validatedOnly.slice(start, start + HISTORY_PER_PAGE);

                                            if (paginatedHistory.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={4} className="p-10 text-center text-[var(--text-muted)] font-medium italic text-sm">
                                                            Aucune validation enregistrée pour le moment.
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <>
                                                    {paginatedHistory.map((ticket: any) => (
                                                        <tr key={ticket.id} className="hover:bg-primary/5 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-black text-sm">{ticket.user?.first_name} {ticket.user?.last_name}</span>
                                                                    <span className="text-[9px] font-bold text-[var(--text-muted)]">Ref: {ticket.qr_code.substring(0, 8)}...</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-xs font-black text-primary uppercase">{ticket.ticket_type?.event?.title}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                        <Users size={12} />
                                                                    </div>
                                                                    <span className="text-xs font-bold">
                                                                        {ticket.validated_by ? `${ticket.validated_by.first_name} ${ticket.validated_by.last_name}` : 'Organisateur'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2 text-xs font-black text-[var(--text)]">
                                                                    <Key size={12} className="text-accent" />
                                                                    {format(new Date(ticket.validated_at), 'HH:mm:ss', { locale: fr })}
                                                                    <span className="font-medium text-[10px] text-[var(--text-muted)] ml-2">le {format(new Date(ticket.validated_at), 'PP', { locale: fr })}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {/* History Pagination Footer */}
                            {!isLoadingTickets && validatedTickets?.filter((t: any) => t.is_validated).length > HISTORY_PER_PAGE && (
                                <div className="p-4 bg-[var(--surface-light)] border-t border-[var(--border)] flex items-center justify-between">
                                    <span className="text-xs font-bold text-[var(--text-muted)]">
                                        Affichage de {((historyPage - 1) * HISTORY_PER_PAGE) + 1} à {Math.min(historyPage * HISTORY_PER_PAGE, validatedTickets.filter((t: any) => t.is_validated).length)} sur {validatedTickets.filter((t: any) => t.is_validated).length} scans
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={historyPage === 1}
                                            onClick={() => setHistoryPage(p => p - 1)}
                                            className="px-4 py-2 bg-white border border-[var(--border)] rounded-xl text-xs font-black disabled:opacity-30 hover:border-primary transition-all"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            disabled={historyPage === Math.ceil(validatedTickets.filter((t: any) => t.is_validated).length / HISTORY_PER_PAGE)}
                                            onClick={() => setHistoryPage(p => p + 1)}
                                            className="px-4 py-2 bg-white border border-[var(--border)] rounded-xl text-xs font-black disabled:opacity-30 hover:border-primary transition-all"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal for Add/Edit */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="card-surface w-full max-w-lg relative z-10 shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <h2 className="text-3xl font-black mb-6">{editingStaff ? 'Modifier le membre' : 'Nouveau membre staff'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase text-[var(--text-muted)]">Prénom</label>
                                        <input
                                            required
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase text-[var(--text-muted)]">Nom</label>
                                        <input
                                            required
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-[var(--text-muted)]">Email (Optionnel)</label>
                                    <input
                                        type="email"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-[var(--text-muted)]">Mot de passe {editingStaff && '(Laisser vide pour ne pas modifier)'}</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                        <input
                                            type="password"
                                            required={!editingStaff}
                                            placeholder="Min. 6 caractères"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-[var(--text-muted)]">Téléphone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                        <input
                                            required
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-[var(--text-muted)]">Code Unique de Validation</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                        <input
                                            required
                                            placeholder="Ex: STAFF-001"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-black text-primary"
                                            value={formData.unique_code}
                                            onChange={e => setFormData({ ...formData, unique_code: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold italic">Ce code sera utilisé pour valider les billets via le scanner.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-[var(--text-muted)]">Notes / Instructions</label>
                                    <textarea
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-medium h-24"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-xl border border-[var(--border)] font-black hover:bg-[var(--surface-light)] transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                                        className="flex-1 btn-primary"
                                    >
                                        {editingStaff ? 'Mettre à jour' : 'Confirmer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default StaffManagementPage;
