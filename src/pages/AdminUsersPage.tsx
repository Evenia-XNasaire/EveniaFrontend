import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Users, Trash2, Search, Loader2, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminUsersPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const isAdmin = currentUser?.role === 'admin';

    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin-users', page, search],
        queryFn: async () => {
            const res = await api.get(`/admin/users?page=${page}&search=${search}`);
            return res.data;
        },
        enabled: isAdmin,
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            alert('Utilisateur supprimé avec succès.');
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || 'Erreur lors de la suppression.');
        }
    });

    if (!isAdmin) return <div className="p-10 text-center text-red-500 font-bold">Accès Refusé</div>;

    return (
        <DashboardLayout role="admin">
            <main className="p-6 lg:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Utilisateurs 👥</h1>
                        <p className="text-[var(--text-muted)] font-medium">Gérez les comptes clients et organisateurs.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 pl-12 w-full md:w-80 outline-none focus:border-primary transition-all font-bold"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </header>

                <div className="card-surface p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Nom / Email</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Rôle</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Total Ventes</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Gains Admin</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)]">Date Inscription</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-[var(--text-muted)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-3/4" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-1/4" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-[var(--border)] rounded w-1/3" /></td>
                                            <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-[var(--border)] rounded-lg ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    usersData?.data?.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-[var(--background)] group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                        <UserCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold group-hover:text-primary transition-colors">{u.first_name} {u.last_name}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-danger/10 text-danger' :
                                                    u.role === 'organizer' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold">
                                                {u.role === 'organizer' ? `${(u.total_sales || 0).toLocaleString()} FCFA` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-primary">
                                                {u.role === 'organizer' ? `${(u.total_commission || 0).toLocaleString()} FCFA` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-muted)] font-medium">
                                                {format(new Date(u.created_at), 'd MMM yyyy', { locale: fr })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {u.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Supprimer cet utilisateur ?')) {
                                                                deleteUserMutation.mutate(u.id);
                                                            }
                                                        }}
                                                        className="p-2 text-[var(--text-muted)] hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {usersData && usersData.last_page > 1 && (
                        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                            <p className="text-xs text-[var(--text-muted)] font-bold">
                                Page {usersData.current_page} sur {usersData.last_page}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50 hover:bg-white transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={() => setPage(p => Math.min(usersData.last_page, p + 1))} disabled={page === usersData.last_page} className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50 hover:bg-white transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
};

export default AdminUsersPage;
