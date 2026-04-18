import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
    Wallet, DollarSign, ArrowUpRight, ArrowDownLeft,
    Loader2, AlertCircle, ChevronRight, History, CreditCard,
    Plus, Send, X, CheckCircle2, Phone, RefreshCw, Activity, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OrganizerWalletPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('');
    const [withdrawPhone, setWithdrawPhone] = useState('');
    const [withdrawName, setWithdrawName] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Deprecated for modal but kept for compatibility
    const [successModal, setSuccessModal] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);

    const { data: walletData, isLoading, error } = useQuery({
        queryKey: ['organizer-wallet'],
        queryFn: async () => {
            const res = await api.get('/organizer/wallet?category=evenia');
            return res.data;
        }
    });

    // Auto-check pending withdrawals status on load
    React.useEffect(() => {
        if (walletData?.withdrawals) {
            const pendingWithdrawals = walletData.withdrawals.filter((w: any) => w.status === 'pending');
            if (pendingWithdrawals.length > 0) {
                const checkStatuses = async () => {
                    for (const withdrawal of pendingWithdrawals) {
                        try {
                            const method = withdrawal.method.includes('Orange') ? 'Orange_Cameroon' : 'MTN_Cameroon';
                            await api.get(`/organizer/wallet/status/${withdrawal.transaction_id}?method=${method}`);
                        } catch (e) {
                            console.error('Auto status check failed for', withdrawal.transaction_id, e);
                        }
                    }
                    queryClient.invalidateQueries({ queryKey: ['organizer-wallet'] });
                };
                checkStatuses();
            }
        }
    }, [walletData?.withdrawals?.length]);

    const withdrawMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/organizer/wallet/withdraw', data);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccessModal({ ...data, amountToDisplay: withdrawAmount });
            setIsWithdrawing(false);
            setWithdrawAmount('');
            setWithdrawMethod('');
            setWithdrawPhone('');
            setWithdrawName('');
            queryClient.invalidateQueries({ queryKey: ['organizer-wallet'] });
        },
        onError: (error: any) => {
            const details = error.response?.data?.details;
            const detailedMsg = details?.reason || details?.message || '';
            const mainMsg = error.response?.data?.message || 'Une erreur est survenue';
            setErrorMessage(detailedMsg ? `${mainMsg}: ${detailedMsg}` : mainMsg);
            setTimeout(() => setErrorMessage(''), 8000);
        }
    });

    const handleWithdrawSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawAmount || !withdrawMethod || !withdrawPhone || !withdrawName) {
            setErrorMessage('Veuillez remplir tous les champs');
            return;
        }
        withdrawMutation.mutate({
            amount: Math.round(parseFloat(withdrawAmount)),
            method: withdrawMethod,
            phone_number: withdrawPhone,
            username: withdrawName
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout role={user?.role as any || 'organizer'}>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[var(--text-muted)] font-bold animate-pulse">Chargement de votre portefeuille...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role={user?.role as any || 'organizer'}>
                <div className="card-surface p-12 text-center space-y-4 max-w-2xl mx-auto mt-20">
                    <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black">Oups ! Impossible de charger le portefeuille.</h2>
                    <p className="text-[var(--text-muted)]">Une erreur est survenue lors de la récupération des données.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role={user?.role as any || 'organizer'}>
            <main className="p-6 lg:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            Mon Portefeuille <Wallet className="text-primary" />
                        </h1>
                        <p className="text-[var(--text-muted)] font-medium">Gérez vos revenus et demandez vos retraits.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsWithdrawing(true)}
                        className="btn-primary flex items-center gap-2 py-3 px-8 shadow-xl shadow-primary/20"
                    >
                        <Plus size={20} />
                        Demander un retrait
                    </motion.button>
                </header>

                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-success/10 border border-success/20 text-success p-4 rounded-2xl flex items-center gap-3 font-bold"
                        >
                            <CheckCircle2 size={24} />
                            {successMessage}
                        </motion.div>
                    )}
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-2xl flex items-center gap-3 font-bold"
                        >
                            <AlertCircle size={24} />
                            {errorMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* KPI Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Revenu Total', value: `${Math.round(walletData.total_revenue).toLocaleString()} FCFA`, Icon: DollarSign, color: 'primary' },
                        { label: 'Solde Retirable', value: `${Math.round(walletData.balance).toLocaleString()} FCFA`, Icon: ArrowUpRight, color: 'accent' },
                        { label: 'Total Retiré', value: `${Math.round(walletData.total_withdrawn).toLocaleString()} FCFA`, Icon: History, color: 'danger' },
                    ].map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="card-surface p-8 relative overflow-hidden group shadow-sm hover:shadow-xl transition-shadow"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500`} />
                            <div className="flex flex-col gap-4">
                                <div className={`w-12 h-12 rounded-2xl bg-${item.color}/10 text-${item.color} flex items-center justify-center`}>
                                    <item.Icon size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">{item.label}</p>
                                    <h3 className="text-3xl font-black mt-1">{item.value}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </section>

                <div className="max-w-4xl mx-auto w-full">
                    {/* Withdrawal History */}
                    <section className="card-surface p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <History className="text-primary" /> Historique des Retraits
                            </h3>
                            <button
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['organizer-wallet'] })}
                                className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-90"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {walletData.withdrawals.map((withdrawal: any, idx: number) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={idx}
                                    onClick={() => setSelectedWithdrawal(withdrawal)}
                                    className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-between group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${withdrawal.status === 'completed' || withdrawal.status === 'successful' ? 'bg-success/10 text-success' :
                                            withdrawal.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                                            }`}>
                                            {withdrawal.status === 'completed' || withdrawal.status === 'successful' ? (
                                                <CheckCircle2 size={28} />
                                            ) : (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                >
                                                    <RefreshCw size={28} />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black">{Math.round(withdrawal.amount).toLocaleString()} FCFA</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase bg-[var(--surface)] px-2 py-1 rounded-lg border border-[var(--border)]">
                                                    {format(new Date(withdrawal.created_at), 'Pp', { locale: fr })}
                                                </span>
                                                <span className="text-[10px] font-bold text-primary italic">{withdrawal.method.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${withdrawal.status === 'completed' || withdrawal.status === 'successful' ? 'bg-success/20 text-success' :
                                                withdrawal.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                                                }`}>
                                                {(withdrawal.status === 'completed' || withdrawal.status === 'successful') ? 'SUCCÈS' :
                                                    withdrawal.status === 'failed' ? 'ÉCHEC' : 'EN COURS'}
                                            </span>
                                            <p className="text-[10px] font-mono text-[var(--text-muted)] max-w-[120px] truncate" title={withdrawal.transaction_id}>
                                                Ref: {withdrawal.transaction_id || 'N/A'}
                                            </p>
                                        </div>

                                        {withdrawal.status === 'pending' && (
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 180 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const btn = e.currentTarget;
                                                    btn.style.pointerEvents = 'none';
                                                    btn.classList.add('animate-spin');
                                                    try {
                                                        const method = withdrawal.method.includes('Orange') ? 'Orange_Cameroon' : 'MTN_Cameroon';
                                                        await api.get(`/organizer/wallet/status/${withdrawal.transaction_id}?method=${method}`);
                                                        queryClient.invalidateQueries({ queryKey: ['organizer-wallet'] });
                                                    } catch (e) {
                                                        console.error('Status check failed', e);
                                                    } finally {
                                                        btn.style.pointerEvents = 'auto';
                                                        btn.classList.remove('animate-spin');
                                                    }
                                                }}
                                                className="p-3 bg-primary/10 rounded-2xl text-primary transition-all shadow-lg shadow-primary/5 hover:bg-primary hover:text-white"
                                                title="Vérifier le statut"
                                            >
                                                <RefreshCw size={20} />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {walletData.withdrawals.length === 0 && (
                                <div className="py-24 text-center space-y-4">
                                    <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto border border-dashed border-[var(--border)]">
                                        <History size={32} className="text-[var(--text-muted)]" />
                                    </div>
                                    <p className="font-bold text-[var(--text-muted)] italic">Aucun retrait effectué pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Withdrawal Modal */}
                <AnimatePresence>
                    {isWithdrawing && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                                onClick={() => setIsWithdrawing(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
                            >
                                <div className="card-surface p-8 space-y-8 relative shadow-2xl">
                                    <button
                                        onClick={() => setIsWithdrawing(false)}
                                        className="absolute top-6 right-6 p-2 hover:bg-primary/10 rounded-xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black">Nouveau Retrait</h2>
                                        <p className="text-[var(--text-muted)] font-medium">Récupérez vos gains en quelques secondes.</p>
                                    </div>

                                    <AnimatePresence>
                                        {errorMessage && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl flex items-center gap-2 font-bold text-sm"
                                            >
                                                <AlertCircle size={18} />
                                                {errorMessage}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="p-4 bg-primary/5 rounded-2xl flex items-center justify-between border border-primary/10">
                                        <span className="font-bold text-[var(--text-muted)]">Solde disponible</span>
                                        <span className="font-black text-primary text-xl">{Math.round(walletData.balance).toLocaleString()} FCFA</span>
                                    </div>

                                    <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Montant (FCFA)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                                <input
                                                    type="number"
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    placeholder="Entrez le montant"
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 pl-12 font-bold outline-none focus:border-primary transition-all"
                                                    min="10"
                                                    max={walletData.balance}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Méthode de retrait</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setWithdrawMethod('Orange_Cameroon')}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${withdrawMethod === 'Orange_Cameroon' ? 'border-primary bg-primary/5' : 'border-[var(--border)] hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 bg-orange-500 rounded-full" />
                                                    <span className="font-bold text-xs">Orange Money</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setWithdrawMethod('MTN_Cameroon')}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${withdrawMethod === 'MTN_Cameroon' ? 'border-primary bg-primary/5' : 'border-[var(--border)] hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 bg-yellow-400 rounded-full" />
                                                    <span className="font-bold text-xs">MTN MoMo</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Nom du Bénéficiaire</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                                <input
                                                    type="text"
                                                    value={withdrawName}
                                                    onChange={(e) => setWithdrawName(e.target.value)}
                                                    placeholder="Ex: Jean Dupont"
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 pl-12 font-bold outline-none focus:border-primary transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Numéro de téléphone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                                <input
                                                    type="tel"
                                                    value={withdrawPhone}
                                                    onChange={(e) => setWithdrawPhone(e.target.value)}
                                                    placeholder="Ex: 690 00 00 00"
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 pl-12 font-bold outline-none focus:border-primary transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={withdrawMutation.isPending || !withdrawAmount || !withdrawMethod || !withdrawPhone || !withdrawName}
                                            className="w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {withdrawMutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                            Confirmer le retrait
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

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
                                        <p className="text-xl font-black text-primary">{(parseFloat(successModal?.amountToDisplay || '0')).toLocaleString()} FCFA</p>
                                    </div>
                                    <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ID Transaction</p>
                                        <p className="text-xs font-mono font-bold truncate">{successModal?.transaction_id || successModal?.data?.transaction_id || successModal?.withdrawal?.transaction_id || '-'}</p>
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
                                            <h2 className="text-3xl font-black">{Math.round(selectedWithdrawal.amount).toLocaleString()} FCFA</h2>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Date</p>
                                                <p className="font-bold text-sm">{format(new Date(selectedWithdrawal.created_at), 'Pp', { locale: fr })}</p>
                                            </div>
                                            <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Méthode</p>
                                                <p className="font-bold text-sm">{selectedWithdrawal.method.replace('_', ' ')}</p>
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
                                            <p className="font-mono text-xs break-all">{selectedWithdrawal.transaction_id || 'N/A'}</p>
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
            </main>
        </DashboardLayout>
    );
};

export default OrganizerWalletPage;
