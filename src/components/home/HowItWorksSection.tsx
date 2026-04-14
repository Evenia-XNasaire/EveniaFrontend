import React from 'react';
import { motion } from 'framer-motion';
import {
    Ticket,
    Smartphone,
    ShieldCheck,
    Zap,
    CreditCard,
    Users,
    LayoutDashboard,
    Globe,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksSection: React.FC = () => {
    const features = [
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Tous les événements au même endroit",
            description: "Parcours les événements disponibles selon la catégorie, la date ou la localisation.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Réservation rapide et intuitive",
            description: "Quelques clics suffisent pour réserver ton billet en toute simplicité.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: <CreditCard className="w-8 h-8" />,
            title: "Paiement Mobile Money sécurisé",
            description: "Paiement simple via Orange Money et MTN Mobile Money, adapté à la réalité locale.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Tickets électroniques sécurisés",
            description: "Tes billets sont stockés dans ton compte, avec QR Code pour un accès rapide.",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            icon: <LayoutDashboard className="w-8 h-8" />,
            title: "Tableau de bord personnel",
            description: "Consulte à tout moment tes billets, ton historique et tes réservations à venir.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ];

    const organizerFeatures = [
        "Création et publication d’événements en quelques minutes",
        "Gestion des types de billets (Standard, VIP, Premium…)",
        "Suivi des ventes en temps réel avec statistiques détaillées",
        "Paiements centralisés et transparents",
        "Tableau de bord organisateur dédié et intuitif"
    ];

    return (
        <section id="how-it-works" className="py-24 space-y-32">
            {/* Main Intro */}
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                            Comment ça marche ?
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                            Evenia Ticket – <br />
                            <span className="text-primary">Réserve, Paie et Vis l’événement.</span>
                        </h2>
                        <p className="text-base sm:text-xl text-[var(--text-muted)] leading-relaxed font-medium">
                            <span className="font-bold text-[var(--text)]">Evenia Ticket</span> est la plateforme digitale qui transforme la billetterie d’événements au Cameroun 🇨🇲 et en Afrique.
                        </p>
                        <p className="text-sm sm:text-lg text-[var(--text-muted)] leading-relaxed">
                            Tous les événements 🎤 centralisés en un seul endroit.
                            Finis les longues files d’attente et les billets papier.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                            >
                                Commencer maintenant
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square bg-linear-to-br from-primary/20 to-accent/20 rounded-[4rem] flex items-center justify-center p-12">
                            <div className="bg-[var(--surface)] p-8 rounded-[3rem] shadow-2xl border border-[var(--border)] relative z-10 w-full">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg">Billet VIP</p>
                                            <p className="text-xs text-[var(--text-muted)] font-bold">Événement de l'Année</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-linear-to-r from-transparent via-[var(--border)] to-transparent" />
                                    <div className="flex justify-center py-4">
                                        <div className="p-4 bg-white rounded-3xl shadow-inner border-4 border-primary/10">
                                            {/* Simplified QR Placeholder */}
                                            <div className="w-32 h-32 grid grid-cols-4 grid-rows-4 gap-1 opacity-20">
                                                {Array.from({ length: 16 }).map((_, i) => (
                                                    <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black tracking-[0.5em] text-[var(--text-muted)] uppercase">#EVENIA-SCAN</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative element */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-[var(--surface)]/30 py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20 space-y-3 sm:space-y-4 px-4">
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-black">Pourquoi choisir Evenia Ticket ?</h3>
                        <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium">Une expérience optimisée pour les utilisateurs locaux.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="card-surface p-6 sm:p-8 space-y-4 sm:space-y-6 group border-[var(--border)]"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                    {feature.icon}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xl font-black">{feature.title}</h4>
                                    <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Organizer Section */}
            <div className="container mx-auto px-6">
                <div className="bg-linear-to-br from-[var(--background)] to-[var(--surface)] rounded-[4rem] p-12 md:p-20 border border-[var(--border)] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Users size={400} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
                        <div className="space-y-8">
                            <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
                                Pour les organisateurs
                            </div>
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Une solution complète pour vous.
                            </h3>
                            <p className="text-base sm:text-lg text-[var(--text-muted)] font-medium">
                                Evenia Ticket accompagne également les organisateurs d’événements avec des outils puissants pour une gestion simplifiée.
                            </p>
                            <div className="space-y-4">
                                {organizerFeatures.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="text-primary">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="font-bold text-[var(--text)]">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                            <Link to="/register" className="inline-flex items-center gap-2 text-primary font-black text-lg hover:gap-4 transition-all">
                                Devenir organisateur <ArrowRight />
                            </Link>
                        </div>

                        <div className="bg-[var(--surface)] rounded-[3rem] p-8 shadow-2xl border border-[var(--border)] rotate-3">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <p className="font-black">Ventes du jour</p>
                                    <span className="text-primary font-black">+24% ↑</span>
                                </div>
                                <div className="flex gap-2 items-end h-32">
                                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.1, duration: 1 }}
                                            className="flex-1 bg-primary/20 rounded-t-lg border-t-2 border-primary"
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">Billets</p>
                                        <p className="text-xl font-black">1,284</p>
                                    </div>
                                    <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">Revenu</p>
                                        <p className="text-xl font-black">2.4M FCFA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile App Section Intro */}
            <div className="container mx-auto px-6 text-center space-y-12 pb-24 border-b border-[var(--border)]">
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4">
                    <Smartphone className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary animate-bounce" />
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black">Expérience Mobile Incomparable</h3>
                    <p className="text-base sm:text-xl text-[var(--text-muted)] font-medium leading-relaxed">
                        Evenia Ticket est aussi disponible en application mobile Android, pensée pour l’Afrique et pour les usages locaux, avec une interface simple, rapide et fiable.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">
                    <span className="flex items-center gap-2"><CheckCircle2 className="text-primary" size={14} /> Consultation fluide</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="text-primary" size={14} /> Paiement instantané</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="text-primary" size={14} /> Accès offline</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="text-primary" size={14} /> Notifications directes</span>
                </div>
                <div className="pt-8">
                    <p className="text-2xl font-black italic">L’émotion commence dès le billet.</p>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
