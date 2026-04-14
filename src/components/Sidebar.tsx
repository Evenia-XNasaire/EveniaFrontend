import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Ticket, Settings, LogOut, PlusCircle, Users, BarChart3, Wallet, Music } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    role: 'organizer' | 'client' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const organizerLinks = [
        { to: '/organizer/events', icon: <Calendar />, label: 'Mes Événements' },
        { to: '/my-tickets', icon: <Ticket />, label: 'Mes Billets' },
        { to: '/organizer/wallet', icon: <LayoutDashboard />, label: 'Mon Portefeuille' },
        { to: '/organizer/staff', icon: <Users />, label: 'Gestion Staff' },
        { to: '/organizer/create', icon: <PlusCircle />, label: 'Créer un événement' },
        { to: '/profile/history', icon: <Settings />, label: 'Historique' },
        { to: '/organizer/stats', icon: <BarChart3 />, label: 'Statistiques' },
    ];


    const adminLinks = [
        { to: '/admin', icon: <LayoutDashboard />, label: 'Super Admin' },
        { to: '/admin/users', icon: <Users />, label: 'Utilisateurs' },
        { to: '/admin/events?category=match', icon: <Calendar />, label: 'Gestion Matchs' },
        { to: '/admin/events?category=evenia', icon: <Music />, label: 'Gestion Événements' },
        { to: '/admin/wallet', icon: <Wallet />, label: 'Mon Portefeuille' },
        { to: '/admin/stats', icon: <BarChart3 />, label: 'Statistiques' },
    ];

    const clientLinks = [
        { to: '/my-tickets', icon: <Ticket />, label: 'Mes Billets' },
        { to: '/profile/history', icon: <Settings />, label: 'Historique' },
    ];



    if (user?.role === 'admin') {
        const adminDashboardLink = { to: '/admin', icon: <LayoutDashboard />, label: 'Super Admin' };

        if (role === 'organizer') {
            if (!organizerLinks.find(l => l.to === '/admin')) organizerLinks.unshift(adminDashboardLink);
        } else if (role === 'client') {
            if (!clientLinks.find(l => l.to === '/admin')) clientLinks.unshift(adminDashboardLink);
        }
    }

    const links = role === 'organizer' ? organizerLinks : role === 'admin' ? adminLinks : clientLinks;


    return (
        <aside className="w-72 bg-[var(--surface)] border-r border-[var(--border)] h-full sticky top-0 p-6 hidden lg:block overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6">Menu Principal</h3>
                    <nav className="space-y-2">
                        {links.map((link) => {
                            const isActive = location.pathname + location.search === link.to;
                            return (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary hover:translate-x-1'
                                        }`}
                                >
                                    {React.isValidElement(link.icon) && React.cloneElement(link.icon as any, { size: 20 })}
                                    {link.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6">Paramètres</h3>
                    <nav className="space-y-2">
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary'
                                }`
                            }
                        >
                            <Users size={20} />
                            Mon Profil
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-danger hover:bg-danger/10 transition-all cursor-pointer border-none bg-transparent"
                        >
                            <LogOut size={20} />
                            Déconnexion
                        </button>
                    </nav>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
