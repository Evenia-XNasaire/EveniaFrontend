import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] transition-colors duration-500">
            <Navbar />

            <main className="flex-1 w-full pt-20">
                {children}
            </main>

            <footer className="border-t border-[var(--border)] py-12 px-6 bg-[var(--surface)]/30">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/logo.png" alt="Evenia Ticket" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold">Evenia Ticket</span>
                        </div>
                        <p className="text-[var(--text-muted)] max-w-md leading-relaxed">
                            Evenia Ticket – Réserve, Paie et Vis l’événement.
                            La plateforme digitale qui transforme la billetterie au Cameroun 🇨🇲 et en Afrique.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-6">Plateforme</h4>
                        <ul className="flex flex-col gap-4 text-[var(--text-muted)]">
                            <li><Link to="/" className="hover:text-primary transition-colors">Événements</Link></li>
                            <li><Link to="/register" className="hover:text-primary transition-colors">Devenir Organisateur</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-primary transition-colors">Comment ça marche</Link></li>
                            <li className="mt-2">
                                <a
                                    href="https://evenia-entreprise.onrender.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-2 px-4 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition-all pulse-link"
                                >
                                    Evenia Entreprise
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-6">Contact</h4>
                        <ul className="flex flex-col gap-4 text-[var(--text-muted)] text-sm">
                            <li>
                                <a href="mailto:anngaraevenia@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    anngaraevenia@gmail.com
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/237686013300" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-500 transition-colors">
                                    WhatsApp: +237 686 013 300
                                </a>
                            </li>
                            <li>Support 24/7 disponible</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
                    © 2026 Evenia Ticket. Fait par ARITeD.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
