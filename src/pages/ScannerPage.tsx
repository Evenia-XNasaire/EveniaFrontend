import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ShieldCheck, Key, CheckCircle2, XCircle, Loader2, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScannerPage: React.FC = () => {
    const navigate = useNavigate();
    const [qrCode, setQrCode] = useState('');
    const [staffCode, setStaffCode] = useState(localStorage.getItem('last_staff_code') || '');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const validateMutation = useMutation({
        mutationFn: async (data: { qr_code: string, staff_code: string }) => {
            const res = await api.post(`/tickets/validate/${data.qr_code}`, {
                staff_code: data.staff_code
            });
            return res.data;
        },
        onSuccess: (data) => {
            setResult(data);
            setError(null);
            setQrCode('');
            if (staffCode) {
                localStorage.setItem('last_staff_code', staffCode);
            }
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erreur lors de la validation');
            setResult(null);
        }
    });

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!qrCode) return;
        validateMutation.mutate({ qr_code: qrCode, staff_code: staffCode });
    };

    return (
        <MainLayout>
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-linear-to-b from-[var(--background)] to-[var(--surface)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center space-y-2">
                        <div className="inline-flex p-4 bg-primary/10 text-primary rounded-3xl mb-4">
                            <QrCode size={48} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Scanner de Billets</h1>
                        <p className="text-[var(--text-muted)] font-medium">Validez les entrées des événements en temps réel.</p>
                    </div>

                    <div className="card-surface p-8 shadow-2xl relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="text-center space-y-6"
                                >
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-emerald-500">BILLET VALIDE !</h2>
                                        <p className="font-bold text-lg">{result.ticket?.user?.first_name} {result.ticket?.user?.last_name}</p>
                                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase">
                                            {result.ticket?.ticket_type?.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setResult(null)}
                                        className="btn-primary w-full py-4 uppercase font-black tracking-widest"
                                    >
                                        Scanner le suivant →
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleScan} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--text-muted)] flex items-center gap-2">
                                            <Key size={14} /> Code Staff / Unique
                                        </label>
                                        <input
                                            placeholder="Votre code personnel staff"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-all font-black"
                                            value={staffCode}
                                            onChange={e => setStaffCode(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--text-muted)] flex items-center gap-2">
                                            <QrCode size={14} /> ID du Billet (QR-ID)
                                        </label>
                                        <input
                                            required
                                            autoFocus
                                            placeholder="Entrez ou scannez le code"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-xl text-center"
                                            value={qrCode}
                                            onChange={e => setQrCode(e.target.value)}
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger text-sm font-bold"
                                        >
                                            <XCircle size={18} />
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={validateMutation.isPending}
                                        className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl uppercase font-black tracking-widest"
                                    >
                                        {validateMutation.isPending ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                <ShieldCheck />
                                                VALIDER L'ACCÈS
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[var(--text-muted)] font-black uppercase text-xs mx-auto hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} /> Retour au Dashboard
                    </button>
                </motion.div>
            </div>
        </MainLayout>
    );
};

export default ScannerPage;
