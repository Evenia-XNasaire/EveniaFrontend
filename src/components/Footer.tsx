import React from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    ArrowUpRight,
    CheckCircle2,
    Globe,
    Shield
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Evenia Ticket" className="w-24 h-24 object-contain" />
                            <span className="text-4xl font-black tracking-tighter">
                                Evenia<span className="text-primary text-4xl">Ticket</span>
                            </span>
                        </div>
                        <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed max-w-sm">
                            Evenia Ticket – Réserve, Paie et Vis l’événement.
                            La plateforme qui révolutionne la billetterie digitale en Afrique.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 border border-[var(--border)] flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded-none">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-[var(--border)] flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded-none">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-[var(--border)] flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all rounded-none">
                                <Twitter size={18} />
                            </a>
                            <a href="https://wa.me/237686013300" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[var(--border)] flex items-center justify-center hover:bg-green-500 hover:text-white hover:border-green-500 transition-all rounded-none">
                                <FaWhatsapp size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Plateforme</h4>
                        <ul className="space-y-4 font-bold">
                            <li><Link to="/" className="text-[var(--text-muted)] hover:text-primary transition-colors flex items-center group">
                                Événements <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                            </Link></li>
                            <li><Link to="/register" className="text-[var(--text-muted)] hover:text-primary transition-colors flex items-center group">
                                Devenir Organisateur <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                            </Link></li>
                            <li><Link to="/how-it-works" className="text-[var(--text-muted)] hover:text-primary transition-colors flex items-center group">
                                Comment ça marche <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                            </Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="lg:col-span-2 space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Support</h4>
                        <ul className="space-y-4 font-bold text-[var(--text-muted)]">
                            <li><Link to="/help-center" className="hover:text-primary transition-colors cursor-pointer">Centre d'aide</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition-colors cursor-pointer">Conditions d'utilisation</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors cursor-pointer">Confidentialité</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition-colors cursor-pointer">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Legal */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[var(--background)] p-8 border-l-4 border-primary">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6">Contact direct</h4>
                            <div className="space-y-4">
                                <a href="mailto:anngaraevenia@gmail.com" className="flex items-center gap-3 font-bold hover:text-primary transition-colors">
                                    <Mail size={18} className="text-primary" />
                                    contact@evenia.ticket
                                </a>
                                <p className="flex items-center gap-3 font-bold">
                                    <Phone size={18} className="text-primary" />
                                    +237 686 013 300
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <a
                                href="https://evenia.entreprise.nb-mind.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-primary text-white font-black text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                            >
                                Evenia Entreprise <ArrowUpRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <span className="flex items-center gap-2"><Globe size={14} className="text-primary" /> Cameroun / Afrique</span>
                        <span className="flex items-center gap-2"><Shield size={14} className="text-primary" /> Sécurisé par SSL</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Support 24/7</span>
                    </div>

                    <div className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                        © 2026 EVENIA TICKET <span className="mx-2 text-[var(--border)]">|</span> PROULSION PAR <a href="https://arited.org" className="text-primary hover:underline">ARITED</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
