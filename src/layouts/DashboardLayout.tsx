import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'organizer' | 'client' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
    return (
        <div className="h-screen flex flex-col bg-[var(--background)] transition-colors duration-500 overflow-hidden">
            <Navbar />
            <div className="flex flex-1 pt-20 overflow-hidden">
                <Sidebar role={role} />
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
