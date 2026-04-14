
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Wallet, Loader2, ArrowUpRight, Smartphone, RefreshCw, CheckCircle2, X, User, Activity, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AangaraaWallet: React.FC = () => {
    const queryClient = useQueryClient();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [withdrawForm, setWithdrawForm] = useState({
        amount: '',
        phone_number: '',
        payment_method: 'Orange_Cameroon',
        username: ''
    });
    const [successModal, setSuccessModal] = useState<any>(null);

    // Organizer History query
    const [orgPage, setOrgPage] = useState(1);
    const { data: orgHistoryData, isLoading: isLoadingOrgHistory, refetch: refetchOrgHistory } = useQuery({
        queryKey: ['admin-organizer-withdrawals', orgPage],
        queryFn: async () => {
            const res = await api.get(`/admin/wallet/organizers?page=${orgPage}`);
            return res.data;
        }
    });

    // Financial Stats query
    const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
        queryKey: ['admin-financial-stats'],
        queryFn: async () => {
            const res = await api.get('/admin/wallet/stats');
            return res.data;
        }
    });

    // Pagination state
    const [page, setPage] = useState(1);

    // History query
    const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
        queryKey: ['admin-wallet-history', page],
        queryFn: async () => {
            const res = await api.get(`/admin/wallet/history?page=${page}`);
            return res.data;
        }
    });

    const history = historyData; // Alias for easier use
    const orgHistory = orgHistoryData;

    const { data: balance, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin-wallet-balance'],
        queryFn: async () => {
            const res = await api.get('/admin/wallet/balance');
            const data = res.data; // This might be res.data directly if backend already extracted 'data'

            // Transform balance_details object into an array for the UI
            if (data?.balance_details) {
                const operators = [];
                if (data.balance_details.orange_cameroon) {
                    operators.push({
                        operator: 'Orange_Cameroon',
                        balance: data.balance_details.orange_cameroon.amount,
                        currency: data.balance_details.orange_cameroon.currency
                    });
                }
                if (data.balance_details.mtn_cameroon) {
                    operators.push({
                        operator: 'MTN_Cameroon',
                        balance: data.balance_details.mtn_cameroon.amount,
                        currency: data.balance_details.mtn_cameroon.currency
                    });
                }

                // Also ensure total_balance is available at the top level
                if (data.balance_details.total) {
                    data.total_balance = data.balance_details.total.amount;
                }

                data.operators = operators;
            }

            return data;
        },
        refetchInterval: 30000
    });

    const withdrawMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/admin/wallet/withdraw', data);
            return res.data;
        },
        onSuccess: (data) => {
            setIsWithdrawModalOpen(false);
            // Store the amount used in the modal data
            setSuccessModal({ ...data, amountToDisplay: withdrawForm.amount });
            setWithdrawForm({ amount: '', phone_number: '', payment_method: 'Orange_Cameroon', username: '' });
            queryClient.invalidateQueries({ queryKey: ['admin-wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['admin-wallet-history'] });
            queryClient.invalidateQueries({ queryKey: ['admin-financial-stats'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.details?.message || error.response?.data?.message || 'Erreur lors du retrait.';
            alert(`Erreur: ${msg}`);
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    if (isLoading) return <div className="card-surface p-6 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (isError) return (
        <div className="card-surface p-6 text-center border border-red-500/20 bg-red-500/5">
            <p className="text-red-500 font-bold mb-2">Impossible de charger le solde AangaraaPay.</p>
            <button onClick={() => refetch()} className="text-primary text-sm font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                <RefreshCw size={14} /> Réessayer
            </button>
        </div>
    );

    return (
        <div className="card-surface p-6 space-y-8 border border-primary/10 bg-primary/5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Wallet className="text-primary" />
                        Administration Financière
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium italic">Gestion du compte AangaraaPay et suivi des flux financiers .</p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="btn-primary py-2 px-6 flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
                >
                    <ArrowUpRight size={16} />
                    Nouveau Retrait Admin
                </button>
            </div>

            {/* Global Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Total Revenus (Billetterie)</p>
                    <h3 className="text-2xl font-black text-primary">{formatCurrency(stats?.global_revenue || 0)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Total Retraits Org.</p>
                    <h3 className="text-2xl font-black text-accent">{formatCurrency(stats?.global_organizer_withdrawn || 0)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Total Retraits Admin</p>
                    <h3 className="text-2xl font-black text-indigo-600">{formatCurrency(stats?.global_admin_withdrawn || 0)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Cumul Global Retraits</p>
                    <h3 className="text-2xl font-black text-red-500">{formatCurrency(stats?.total_system_withdrawn || 0)}</h3>
                </div>
            </div>

            {/* Aangaraa Balance Section */}
            <div className="bg-white p-6 rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                <h3 className="text-sm font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} /> Flux direct AangaraaPay
                </h3>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 relative z-10">
                    {/* Solde Disponible (Retrait) - balance_in_db */}
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <p className="text-xs font-black uppercase text-primary tracking-widest">Solde Réel API</p>
                        <h3 className="text-3xl font-black text-primary mt-1">{formatCurrency(balance?.balance_in_db || 0)}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] mt-2 italic font-bold uppercase">Disponible via agrégateur</p>
                    </div>

                    {/* Total Collecté (Revenue) */}
                    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                        <p className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Collecte Théorique</p>
                        <h3 className="text-3xl font-black text-[var(--foreground)] mt-1">{formatCurrency(balance?.total_balance || 0)}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] mt-2 italic font-bold uppercase">Somme brute des paiements</p>
                    </div>

                    {/* Total Déjà Retiré (Historique) */}
                    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                        <p className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Sorties Admin</p>
                        <h3 className="text-3xl font-black text-red-500 mt-1">{formatCurrency(balance?.total_withdrawn || 0)}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] mt-2 italic font-bold uppercase">Retraits admin effectués</p>
                    </div>
                </div>

                {/* Operator Breakdown */}
                <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] mt-6 mb-3 tracking-widest">Répartition par Opérateur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2 relative z-10">
                    {balance?.operators?.map((op: any, idx: number) => (
                        <div key={idx} className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] relative overflow-hidden">
                            <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full opacity-10 ${op.operator === 'Orange_Cameroon' ? 'bg-orange-500' : 'bg-yellow-400'}`} />
                            <div className="flex items-center gap-2 mb-1">
                                <Smartphone size={12} className={op.operator === 'Orange_Cameroon' ? 'text-orange-500' : 'text-yellow-500'} />
                                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                                    {op.operator.replace('_Cameroon', '')}
                                </p>
                            </div>
                            <h3 className="text-lg font-black">{formatCurrency(op.balance)}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Financial Summary by Organizer Table */}
            <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[var(--border)] bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black flex items-center gap-2 text-[var(--foreground)]">
                            <Activity size={18} className="text-primary" />
                            Récapitulatif Financier par Organisateur
                        </h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Comparaison Revenus vs Retraits Effectués</p>
                    </div>
                    <button onClick={() => refetchStats()} className="btn-secondary p-2 rounded-xl text-primary">
                        <RefreshCw size={16} className={isLoadingStats ? 'animate-spin' : ''} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[var(--background)] text-[var(--text-muted)] text-left">
                            <tr className="border-b border-[var(--border)]">
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest">Organisateur</th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-right">Revenu Total</th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-right">Déjà Retiré</th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-right">Solde Restant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoadingStats ? (
                                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                            ) : stats?.organizers?.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-[var(--text-muted)] font-bold italic">Aucune donnée disponible.</td></tr>
                            ) : (
                                stats?.organizers?.map((org: any) => (
                                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-xs">{org.name}</span>
                                                <span className="text-[10px] text-[var(--text-muted)]">{org.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-black text-primary text-xs">
                                            {formatCurrency(org.total_revenue)}
                                        </td>
                                        <td className="p-4 text-right font-black text-accent text-xs">
                                            {formatCurrency(org.total_withdrawn)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${org.balance > 0 ? 'bg-success/10 text-success' : 'bg-gray-100 text-[var(--text-muted)]'}`}>
                                                {formatCurrency(org.balance)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-10">
                <hr className="flex-1 border-[var(--border)]" />
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Historiques des Transactions</span>
                <hr className="flex-1 border-[var(--border)]" />
            </div>

            {/* History Sections Container */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Admin Withdrawal History */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-primary/5">
                        <h3 className="font-black flex items-center gap-2 text-primary">
                            <Wallet size={18} />
                            Mes Retraits (Admin)
                        </h3>
                        <button onClick={() => refetchHistory()} className="p-2 hover:bg-white rounded-xl text-primary transition-all shadow-sm">
                            <RefreshCw size={14} className={isLoadingHistory ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[var(--background)] text-[var(--text-muted)] text-left">
                                <tr className="border-b border-[var(--border)]">
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Date</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Montant</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Statut</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Réf.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {isLoadingHistory ? (
                                    <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                                ) : history?.data?.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-[var(--text-muted)] font-bold italic">Aucun retrait.</td></tr>
                                ) : (
                                    history?.data?.map((withdrawal: any) => (
                                        <tr
                                            key={withdrawal.id}
                                            onClick={() => setSelectedWithdrawal(withdrawal)}
                                            className="hover:bg-primary/5 transition-colors cursor-pointer active:scale-[0.99]"
                                        >
                                            <td className="p-4 text-[var(--text-muted)] font-medium text-xs">
                                                {new Date(withdrawal.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="p-4 font-black text-danger text-sm">
                                                {formatCurrency(withdrawal.amount)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${(withdrawal.status === 'completed' || withdrawal.status === 'success' || withdrawal.status === 'successful') ? 'bg-success/10 text-success' :
                                                        withdrawal.status === 'failed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                                                        }`}>
                                                        {(withdrawal.status === 'completed' || withdrawal.status === 'success' || withdrawal.status === 'successful') ? 'SUCCÈS' :
                                                            withdrawal.status === 'failed' ? 'ÉCHEC' : 'EN COURS'}
                                                    </span>
                                                    {withdrawal.status === 'pending' && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    const ref = withdrawal.reference_id || withdrawal.transaction_id;
                                                                    await api.get(`/admin/wallet/status/${ref}?payment_method=${withdrawal.payment_method}`);
                                                                    queryClient.invalidateQueries({ queryKey: ['admin-wallet-history'] });
                                                                } catch (e) { console.error(e); }
                                                            }}
                                                            className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all"
                                                        >
                                                            <RefreshCw size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-[var(--text-muted)] text-[10px] font-mono max-w-[100px] truncate" title={withdrawal.transaction_id || withdrawal.reference_id}>
                                                {withdrawal.transaction_id || withdrawal.reference_id || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {history?.last_page > 1 && (
                        <div className="p-4 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 hover:bg-primary/10 rounded-xl disabled:opacity-30">Pécédent</button>
                            <span className="text-primary">{page} / {history.last_page}</span>
                            <button disabled={page === history.last_page} onClick={() => setPage(page + 1)} className="p-2 hover:bg-primary/10 rounded-xl disabled:opacity-30">Suivant</button>
                        </div>
                    )}
                </div>

                {/* Organizer Withdrawal History */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-accent/5">
                        <h3 className="font-black flex items-center gap-2 text-accent">
                            <User size={18} />
                            Retraits des Organisateurs
                        </h3>
                        <button onClick={() => refetchOrgHistory()} className="p-2 hover:bg-white rounded-xl text-accent transition-all shadow-sm">
                            <RefreshCw size={14} className={isLoadingOrgHistory ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[var(--background)] text-[var(--text-muted)] text-left">
                                <tr className="border-b border-[var(--border)]">
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Organisateur</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Montant</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Statut</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {isLoadingOrgHistory ? (
                                    <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-accent" /></td></tr>
                                ) : orgHistory?.data?.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-[var(--text-muted)] font-bold italic">Aucun retrait.</td></tr>
                                ) : (
                                    orgHistory?.data?.map((withdrawal: any) => (
                                        <tr
                                            key={withdrawal.id}
                                            onClick={() => setSelectedWithdrawal(withdrawal)}
                                            className="hover:bg-accent/5 transition-colors cursor-pointer active:scale-[0.99]"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-xs">{withdrawal.user?.first_name} {withdrawal.user?.last_name}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)]">{withdrawal.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-black text-accent text-sm">
                                                {formatCurrency(withdrawal.amount)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${(withdrawal.status === 'completed' || withdrawal.status === 'success' || withdrawal.status === 'successful') ? 'bg-success/10 text-success' :
                                                    withdrawal.status === 'failed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                                                    }`}>
                                                    {(withdrawal.status === 'completed' || withdrawal.status === 'success' || withdrawal.status === 'successful') ? 'SUCCÈS' :
                                                        withdrawal.status === 'failed' ? 'ÉCHEC' : 'EN COURS'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[var(--text-muted)] text-[10px] font-medium">
                                                {format(new Date(withdrawal.created_at), 'Pp', { locale: fr })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orgHistory?.last_page > 1 && (
                        <div className="p-4 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <button disabled={orgPage === 1} onClick={() => setOrgPage(orgPage - 1)} className="p-2 hover:bg-accent/10 rounded-xl disabled:opacity-30">Pécédent</button>
                            <span className="text-accent">{orgPage} / {orgHistory.last_page}</span>
                            <button disabled={orgPage === orgHistory.last_page} onClick={() => setOrgPage(orgPage + 1)} className="p-2 hover:bg-accent/10 rounded-xl disabled:opacity-30">Suivant</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[var(--border)] animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Effectuer un retrait</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-1">Opérateur</label>
                                <select
                                    className="input-field w-full"
                                    value={withdrawForm.payment_method}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, payment_method: e.target.value })}
                                >
                                    <option value="Orange_Cameroon">Orange Money</option>
                                    <option value="MTN_Cameroon">MTN Mobile Money</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-1">Montant (FCFA)</label>
                                <input
                                    type="number"
                                    className="input-field w-full"
                                    placeholder="Ex: 5000"
                                    value={withdrawForm.amount}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                    min="10"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-1">Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    className="input-field w-full"
                                    placeholder="Ex: 699123456"
                                    value={withdrawForm.phone_number}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, phone_number: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-1">Nom du bénéficiaire (Facultatif)</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="Ex: Jean Dupont"
                                    value={withdrawForm.username}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, username: e.target.value })}
                                />
                            </div>

                            <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg text-xs font-medium">
                                ⚠️ Le montant sera déduit immédiatement de votre solde AangaraaPay. Assurez-vous que le numéro est correct.
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="flex-1 py-3 font-bold text-[var(--text-muted)] hover:bg-[var(--border)] rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => withdrawMutation.mutate(withdrawForm)}
                                disabled={withdrawMutation.isPending || !withdrawForm.amount || !withdrawForm.phone_number}
                                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {withdrawMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                                Confirmer Retrait
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Success Modal */}
            <AnimatePresence>
                {successModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--surface)] w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl relative border border-success/20 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-success" />
                            <div className="w-20 h-20 bg-success/10 text-success rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-3xl font-black mb-2">Succès !</h3>
                            <p className="text-[var(--text-muted)] font-medium mb-8">Votre retrait a été initié avec succès.</p>

                            <div className="space-y-4 mb-10 text-left">
                                <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Montant</p>
                                    <p className="text-xl font-black text-primary">{formatCurrency(parseFloat(successModal?.amountToDisplay || '0'))}</p>
                                </div>
                                <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ID Transaction</p>
                                    <p className="text-xs font-mono font-bold truncate">{successModal?.transaction_id || successModal?.data?.transaction_id || '-'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSuccessModal(null)}
                                className="w-full btn-primary py-4 rounded-2xl font-black text-lg"
                            >
                                J'ai compris
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedWithdrawal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                            onClick={() => setSelectedWithdrawal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-4"
                        >
                            <div className="card-surface p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                                <button
                                    onClick={() => setSelectedWithdrawal(null)}
                                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${selectedWithdrawal.status === 'completed' || selectedWithdrawal.status === 'successful' ? 'bg-success/10 text-success' :
                                        selectedWithdrawal.status === 'failed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                                        }`}>
                                        {selectedWithdrawal.status === 'completed' || selectedWithdrawal.status === 'successful' ? <CheckCircle2 size={32} /> :
                                            selectedWithdrawal.status === 'failed' ? <AlertCircle size={32} /> : <RefreshCw size={32} className="animate-spin" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Détails du Retrait</p>
                                        <h2 className="text-3xl font-black">{formatCurrency(selectedWithdrawal.amount)}</h2>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {selectedWithdrawal.user && (
                                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Bénéficiaire</p>
                                                <p className="font-bold text-sm">{selectedWithdrawal.user.first_name} {selectedWithdrawal.user.last_name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{selectedWithdrawal.user.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Date</p>
                                            <p className="font-bold text-sm">{format(new Date(selectedWithdrawal.created_at), 'Pp', { locale: fr })}</p>
                                        </div>
                                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Méthode</p>
                                            <p className="font-bold text-sm">{(selectedWithdrawal.payment_method || selectedWithdrawal.method || 'N/A').replace('_', ' ')}</p>
                                        </div>
                                        {selectedWithdrawal.phone_number && (
                                            <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Numéro</p>
                                                <p className="font-bold text-sm font-mono">{selectedWithdrawal.phone_number}</p>
                                            </div>
                                        )}
                                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Statut</p>
                                            <p className={`font-black text-sm uppercase ${selectedWithdrawal.status === 'failed' ? 'text-danger' :
                                                selectedWithdrawal.status === 'pending' ? 'text-warning' : 'text-success'
                                                }`}>{selectedWithdrawal.status}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                        <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">ID Transaction (Référence)</p>
                                        <p className="font-mono text-xs break-all">{selectedWithdrawal.transaction_id || selectedWithdrawal.reference_id || 'N/A'}</p>
                                    </div>

                                    {/* API Response Debug Info */}
                                    {selectedWithdrawal.api_response && (
                                        <div className="mt-4">
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 flex items-center gap-2 cursor-pointer hover:text-primary" onClick={(e) => {
                                                const next = e.currentTarget.nextElementSibling;
                                                if (next) next.classList.toggle('hidden');
                                            }}>
                                                <Activity size={12} /> Dernière Réponse API (Cliquer pour voir)
                                            </p>
                                            <div className="bg-black/90 text-green-400 p-4 rounded-2xl text-[10px] font-mono overflow-auto max-h-60 border border-white/10 custom-scrollbar hidden">
                                                <pre>
                                                    {(() => {
                                                        try {
                                                            return JSON.stringify(JSON.parse(selectedWithdrawal.api_response || '{}'), null, 2);
                                                        } catch (e) {
                                                            return selectedWithdrawal.api_response || 'Aucune donnée brute disponible';
                                                        }
                                                    })()}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AangaraaWallet;
