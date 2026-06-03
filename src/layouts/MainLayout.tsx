import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] transition-colors duration-500">
            <Navbar />

            <main className="flex-1 w-full pt-14 sm:pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
