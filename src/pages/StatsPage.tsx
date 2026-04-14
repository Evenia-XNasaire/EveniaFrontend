import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, DollarSign, Ticket, Calendar,
    Loader2, AlertCircle, ChevronRight, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const StatsPage: React.FC = () => {
    const [trendType, setTrendType] = React.useState<'daily' | 'monthly' | 'yearly'>('daily');
    const { user } = useAuth();
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['organizer-stats'],
        queryFn: async () => {
            const response = await api.get('/organizer/stats?category=evenia');
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <DashboardLayout role="organizer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[var(--text-muted)] font-bold animate-pulse">Calcul de vos performances musicales...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="organizer">
                <div className="card-surface p-12 text-center space-y-4 max-w-2xl mx-auto mt-20">
                    <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black">Oups ! Impossible de charger les stats.</h2>
                    <p className="text-[var(--text-muted)]">Une erreur est survenue lors de la récupération des données.</p>
                </div>
            </DashboardLayout>
        );
    }

    const currentTrendData = trendType === 'daily' ? stats.trend_daily :
        trendType === 'monthly' ? stats.trend_monthly :
            stats.trend_yearly;

    const trendTitle = trendType === 'daily' ? 'Ventes Journalières (30j)' :
        trendType === 'monthly' ? 'Ventes Mensuelles (12m)' :
            'Ventes Annuelles';

    return (
        <DashboardLayout role="organizer">
            <main className="p-6 lg:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">Analyses & Statistiques</h1>
                        <p className="text-[var(--text-muted)] font-medium">Suivez l'évolution de vos billets de événement en temps réel.</p>
                    </div>
                    <div className="relative group">
                        <button className="btn-primary flex items-center gap-2 py-3 px-6 shadow-xl transition-all active:scale-95">
                            <Download size={20} />
                            Exporter les rapports
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <button
                                onClick={async () => {
                                    const response = await api.get('/organizer/reports/stats/pdf', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `rapport-stats-événement-${new Date().toISOString().split('T')[0]}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="w-full text-left px-5 py-4 hover:bg-primary/10 transition-colors flex items-center gap-3 font-bold border-b border-[var(--border)]"
                            >
                                <div className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
                                    <Download size={16} />
                                </div>
                                Rapport PDF
                            </button>
                            <button
                                onClick={async () => {
                                    const response = await api.get('/organizer/reports/stats/csv', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `rapport-stats-événement-${new Date().toISOString().split('T')[0]}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="w-full text-left px-5 py-4 hover:bg-primary/10 transition-colors flex items-center gap-3 font-bold"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Download size={16} />
                                </div>
                                Rapport CSV
                            </button>
                        </div>
                    </div>
                </header>

                {/* KPI Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                        {
                            label: 'Revenu Total',
                            value: `${stats.total_revenue.toLocaleString()} FCFA`,
                            Icon: DollarSign,
                            color: 'primary',
                            desc: 'Total des ventes encaissées'
                        },
                        {
                            label: 'Billets Vendus',
                            value: stats.total_tickets_sold,
                            Icon: Ticket,
                            color: 'accent',
                            desc: 'Toutes catégories confondues'
                        },
                        {
                            label: 'Événements',
                            value: stats.total_events,
                            Icon: Calendar,
                            color: 'primary',
                            desc: 'Événements actifs et passés'
                        },
                        {
                            label: 'Croissance',
                            value: `${stats.growth_rate >= 0 ? '+' : ''}${stats.growth_rate}%`,
                            Icon: TrendingUp,
                            color: stats.growth_rate >= 0 ? 'success' : 'danger',
                            desc: 'Vs 30 derniers jours'
                        },
                    ].map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            key={idx}
                            className={`card-surface p-6 relative overflow-hidden group border-b-4 ${item.color === 'primary' ? 'border-primary' :
                                item.color === 'accent' ? 'border-accent' :
                                    item.color === 'success' ? 'border-emerald-500' : 'border-danger'
                                }`}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 rounded-full transition-all group-hover:opacity-20 ${item.color === 'primary' ? 'bg-primary' :
                                item.color === 'accent' ? 'bg-accent' :
                                    item.color === 'success' ? 'bg-emerald-500' : 'bg-danger'
                                }`} />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${item.color === 'primary' ? 'bg-primary/10 text-primary' :
                                    item.color === 'accent' ? 'bg-accent/10 text-accent' :
                                        item.color === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-danger/10 text-danger'
                                    } shadow-inner transition-transform group-hover:scale-110`}>
                                    <item.Icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] opacity-70`}>
                                    Live
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-2xl font-black mt-1 leading-none">{item.value}</h3>
                                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">{item.label}</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[var(--border)] border-dashed opacity-50 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] italic">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </section>

                <div className="space-y-8">
                    {/* Main Trend Chart */}
                    <section className="card-surface p-8 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <TrendingUp size={200} />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                                    <TrendingUp size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">{trendTitle}</h3>
                                    <p className="text-xs font-bold text-[var(--text-muted)]">Évolution du volume de billets vendus</p>
                                </div>
                            </div>
                            <select
                                value={trendType}
                                onChange={(e) => setTrendType(e.target.value as any)}
                                className="bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl px-6 py-3 text-sm font-black outline-none cursor-pointer focus:border-primary/50 transition-all hover:bg-primary/5 shadow-sm"
                            >
                                <option value="daily">30 derniers jours</option>
                                <option value="monthly">12 derniers mois</option>
                                <option value="yearly">Historique annuel</option>
                            </select>
                        </div>

                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={currentTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(var(--surface-rgb), 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '20px',
                                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                            padding: '15px'
                                        }}
                                        itemStyle={{ color: 'var(--primary)', fontWeight: 900, fontSize: '14px' }}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 800, fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--primary)"
                                        strokeWidth={5}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Lower Grid: Revenue Distribution & Top Performers */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Revenue Distribution */}
                        <section className="card-surface p-8 flex flex-col">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner">
                                    <DollarSign size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Répartition Financière</h3>
                                    <p className="text-xs font-bold text-[var(--text-muted)]">Source des revenus par événement</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center">
                                <div className="relative w-full max-w-[300px] h-[300px]">
                                    {stats.total_revenue > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.events_data}
                                                    dataKey="revenue"
                                                    nameKey="title"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={120}
                                                    paddingAngle={10}
                                                    stroke="none"
                                                >
                                                    {stats.events_data.map((_entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--surface)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '16px',
                                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <div className="w-24 h-24 rounded-full border-4 border-dashed border-[var(--border)] animate-spin opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total</span>
                                        <span className="text-xl font-black">{stats.total_revenue.toLocaleString()}</span>
                                        <span className="text-[8px] font-bold text-[var(--text-muted)]">FCFA</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 w-full">
                                    {stats.events_data.slice(0, 4).map((event: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-primary/20 transition-all group/item">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                <span className="font-bold text-sm truncate max-w-[150px]">{event.title}</span>
                                            </div>
                                            <span className="text-xs font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">
                                                {stats.total_revenue > 0 ? `${((event.revenue / stats.total_revenue) * 100).toFixed(1)}%` : '0%'}
                                            </span>
                                        </div>
                                    ))}
                                    {stats.events_data.length > 4 && (
                                        <p className="text-center text-[10px] font-black text-[var(--text-muted)] uppercase italic">
                                            + {stats.events_data.length - 4} autres événements
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Top Performance Table Card */}
                        <section className="card-surface p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent/10 rounded-2xl text-accent shadow-inner">
                                        <Ticket size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">Performance Événements</h3>
                                        <p className="text-xs font-bold text-[var(--text-muted)]">Détails de vente par événement</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {stats.events_data.map((event: any, idx: number) => {
                                    const isTop = idx === 0 && event.revenue > 0;
                                    return (
                                        <div key={idx} className={`p-4 rounded-3xl border transition-all flex items-center justify-between gap-4 ${isTop ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-[var(--background)] border-[var(--border)]'
                                            }`}>
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="relative">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isTop ? 'bg-primary text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    {isTop && (
                                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] font-black p-1 rounded-full animate-bounce shadow-md">
                                                            TOP
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black truncate text-sm uppercase tracking-tight">{event.title}</h4>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{event.category}</p>
                                                </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className="font-black text-primary text-lg leading-none">{event.revenue.toLocaleString()} <small className="text-[10px]">FCFA</small></span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">{event.sold} billets</span>
                                                    <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (event.sold / 100) * 100)}%` }}
                                                            className={`h-full ${isTop ? 'bg-primary' : 'bg-[var(--text-muted)]'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
};

export default StatsPage;
