import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Wallet, Activity, DollarSign, Ticket } from 'lucide-react';

interface StatsData {
    revenue_daily: { label: string; revenue: string }[];
    revenue_monthly: { label: string; revenue: string }[];
    revenue_yearly: { label: string; revenue: string }[];
    user_growth: { month: string; count: number }[];
    event_status_distribution: { [key: string]: number };
    ticket_status_distribution: { valid: number; used: number };
    top_events: { title: string; revenue: number; tickets_sold: number }[];
}

const AdminStatsPage: React.FC = () => {
    const { user } = useAuth();
    const [revenueRange, setRevenueRange] = React.useState<'daily' | 'monthly' | 'yearly'>('monthly');

    const { data: stats, isLoading } = useQuery<StatsData>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.get('/admin/statistics');
            return res.data;
        },
        refetchInterval: 30000 // Real-timeish updates
    });

    // Map revenue data based on selected range
    const revenueChartData = React.useMemo(() => {
        if (!stats) return [];
        switch (revenueRange) {
            case 'daily': return stats.revenue_daily;
            case 'monthly': return stats.revenue_monthly;
            case 'yearly': return stats.revenue_yearly;
            default: return stats.revenue_monthly;
        }
    }, [stats, revenueRange]);

    if (isLoading) {
        return (
            <DashboardLayout role={user?.role as any || 'admin'}>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const PIE_DATA = [
        { name: 'Valides', value: stats?.ticket_status_distribution?.valid || 0 },
        { name: 'Utilisés', value: stats?.ticket_status_distribution?.used || 0 },
    ];

    const EVENT_STATUS_DATA = stats?.event_status_distribution ? Object.entries(stats.event_status_distribution).map(([name, value]) => ({ name, value })) : [];

    // Calculate totals for KPI cards
    const totalRevenue = stats?.revenue_monthly?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) || 0;
    const totalTicketsSold = stats?.top_events?.reduce((acc, curr) => acc + curr.tickets_sold, 0) || 0; // fallback if needed

    return (
        <DashboardLayout role={user?.role as any || 'admin'}>
            <main className="p-6 lg:p-10 space-y-8 pb-20">
                <header>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        Statistiques Avancées <Activity className="text-primary animate-pulse" />
                    </h1>
                    <p className="text-[var(--text-muted)] font-medium mt-2">
                        Analysez la croissance de la plateforme et les performances en temps réel.
                    </p>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-6 flex items-center gap-4 border-l-4 border-emerald-500">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><DollarSign size={32} /></div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase">Revenus (12 mois)</p>
                            <p className="text-2xl font-black">{totalRevenue.toLocaleString()} FCFA</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-surface p-6 flex items-center gap-4 border-l-4 border-indigo-500">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Ticket size={32} /></div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase">Billets Vendus (Top)</p>
                            <p className="text-2xl font-black">{totalTicketsSold.toLocaleString()}</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-surface p-6 flex items-center gap-4 border-l-4 border-blue-500">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Users size={32} /></div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase">Nouveaux Utilisateurs</p>
                            <p className="text-2xl font-black">{stats?.user_growth?.reduce((acc, curr) => acc + curr.count, 0) || 0}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Revenue Chart Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-surface p-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="text-emerald-500" size={24} />
                                Courbe des Revenus
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">Évolution du chiffre d'affaires ({revenueRange === 'daily' ? '30 jours' : revenueRange === 'monthly' ? '12 mois' : 'Historique'})</p>
                        </div>

                        <div className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] self-end md:self-auto">
                            {(['daily', 'monthly', 'yearly'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setRevenueRange(range)}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${revenueRange === range
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                                        }`}
                                >
                                    {range === 'daily' ? 'Jours' : range === 'monthly' ? 'Mois' : 'Années'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                                <XAxis
                                    dataKey="label"
                                    stroke="var(--text-muted)"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="var(--text-muted)"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text)' }}
                                    formatter={(value: any) => [`${parseInt(value).toLocaleString()} FCFA`, "Revenu"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Growth Chart */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-surface p-8"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="text-blue-500" size={24} />
                                Croissance Utilisateurs
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">Inscriptions mensuelles</p>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.user_growth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="var(--text-muted)"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--border)', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>

                    {/* Top Events Chart */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card-surface p-8"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="text-purple-500" size={24} />
                                Top Événements (Revenus)
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">Comparaison des meilleures ventes</p>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={stats?.top_events} margin={{ left: 40, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="title"
                                        type="category"
                                        stroke="var(--text-muted)"
                                        tick={{ fill: 'var(--text)', fontSize: 10, fontWeight: 'bold' }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--border)', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                        formatter={(value: any) => [`${value.toLocaleString()} FCFA`, "Revenu"]}
                                    />
                                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ticket Status Pie Chart */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card-surface p-8 flex flex-col items-center"
                    >
                        <h2 className="text-lg font-bold mb-4 w-full text-left flex items-center gap-2">
                            <Calendar className="text-orange-500" /> État des Billets
                        </h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={PIE_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {PIE_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#64748b'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>

                    {/* Event Status Bar Chart */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card-surface p-8 lg:col-span-2"
                    >
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Activity className="text-indigo-500" /> Répartition des Événements
                        </h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={EVENT_STATUS_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={60}>
                                        {EVENT_STATUS_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'En cours' ? '#10b981' :
                                                    entry.name === 'Passé' ? '#64748b' : '#6366f1'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>
                </div>
            </main>
        </DashboardLayout>
    );
};

export default AdminStatsPage;
