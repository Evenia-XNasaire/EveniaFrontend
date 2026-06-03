import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'organizer' | 'client' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-[var(--background)] transition-colors duration-500 overflow-hidden relative">
            <Navbar onDashboardMobileToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            {/* Mobile Sidebar Toggle - Only visible on small screens when sidebar is hidden */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-110 active:scale-95 transition-all"
                >
                    <Menu size={28} />
                </button>
            )}

            <div className="flex flex-1 pt-14 sm:pt-20 overflow-hidden">
                <Sidebar 
                    role={role} 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                />
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
