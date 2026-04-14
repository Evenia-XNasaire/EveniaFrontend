import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import AangaraaWallet from '../components/admin/AangaraaWallet';

const AdminWalletPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
        return (
            <DashboardLayout role={user?.role as any || 'client'}>
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Accès Refusé</h1>
                    <p>Vous n'avez pas les droits d'administration.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <main className="p-6 lg:p-10 space-y-10">
                <header>
                    <h1 className="text-4xl font-black tracking-tight">Gestion Portefeuille 💳</h1>
                    <p className="text-[var(--text-muted)] font-medium">Suivi des fonds AangaraaPay et retraits.</p>
                </header>

                <AangaraaWallet />
            </main>
        </DashboardLayout>
    );
};

export default AdminWalletPage;
