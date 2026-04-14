import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { motion } from 'framer-motion';
import {
    UserPlus, LogIn, Calendar, Ticket, Wallet, Users, BarChart3,
    Search, CreditCard, QrCode, ShieldCheck, HelpCircle,
    ArrowRight, CheckCircle2, Info, PlusCircle, Edit, Download,
    TrendingUp, History, User, MessageCircle, Settings, Camera,
    ArrowUpRight, ExternalLink, Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const GuidePage: React.FC = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash]);

    const navItems = [
        { id: 'debut', label: 'Démarrage', icon: <UserPlus size={16} /> },
        { id: 'client', label: 'Côté Client', icon: <Ticket size={16} /> },
        { id: 'organisateur', label: 'Côté Organisateur', icon: <Calendar size={16} /> },
        { id: 'wallet', label: 'Portefeuille', icon: <Wallet size={16} /> },
        { id: 'staff', label: 'Gestion Staff', icon: <Users size={16} /> },
        { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={16} /> },
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            {/* Hero section */}
            <div className="text-center space-y-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-4"
                >
                    <HelpCircle size={48} />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-black tracking-tight"
                >
                    Guide Complet <span className="text-primary text-glow">Evenia Ticket</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-medium"
                >
                    Maîtrisez toutes les fonctionnalités de la plateforme, de l'achat d'un billet à l'exportation de vos rapports de vente.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sticky Sidebar Nav */}
                <aside className="lg:col-span-1 hidden lg:block">
                    <div className="sticky top-24 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary px-4">Navigation</h3>
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                        {item.icon}
                                    </div>
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-24">

                    {/* 1. DEMARRAGE */}
                    <section id="debut" className="scroll-mt-28 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
                                <UserPlus size={28} />
                            </div>
                            <h2 className="text-3xl font-black">1. Démarrage & Inscription</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card-surface p-8 space-y-4 border-t-4 border-primary">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <LogIn size={20} className="text-primary" /> S'enregistrer
                                </h3>
                                <p className="text-[var(--text-muted)] font-medium text-sm leading-relaxed">
                                    Pour profiter des services, commencez par <Link to="/register" className="text-primary hover:underline">créer un compte</Link>.
                                    Renseignez votre nom, email et un mot de passe solide.
                                    <br /><br />
                                    <strong>Pourquoi ?</strong> Sans compte, vous ne pouvez pas stocker vos billets ni accéder à votre portefeuille organisateur.
                                </p>
                                <Link to="/register" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                                    Créer mon compte <ArrowUpRight size={14} />
                                </Link>
                            </div>

                            <div className="card-surface p-8 space-y-4 border-t-4 border-accent">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <User size={20} className="text-accent" /> Profil & Paramètres
                                </h3>
                                <p className="text-[var(--text-muted)] font-medium text-sm leading-relaxed">
                                    Dans votre <Link to="/profile" className="text-primary hover:underline">Profil</Link>, vous pouvez modifier vos informations personnelles, changer votre photo et visualiser votre historique d'activité complet.
                                </p>
                                <div className="flex items-center gap-2 bg-[var(--background)] p-3 rounded-lg border border-[var(--border)] text-[10px] font-black uppercase">
                                    <Zap size={14} className="text-yellow-500" /> Astuce : Complétez votre profil pour instaurer plus de confiance.
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. COTE CLIENT */}
                    <section id="client" className="scroll-mt-28 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-lg shadow-accent/5">
                                <Ticket size={28} />
                            </div>
                            <h2 className="text-3xl font-black">2. Guide du Client (Supporter)</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="card-surface p-0 overflow-hidden">
                                <div className="p-8 space-y-4">
                                    <h3 className="text-xl font-black">Le parcours d'achat</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black">1</div>
                                            <h4 className="font-bold">Recherche</h4>
                                            <p className="text-xs text-[var(--text-muted)]">Parcourez les événements sur l'<Link to="/" className="text-primary underline">accueil</Link> et sélectionnez celui qui vous intéresse.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black">2</div>
                                            <h4 className="font-bold">Choix du Billet</h4>
                                            <p className="text-xs text-[var(--text-muted)]">Sélectionnez la catégorie (VIP, Standard, etc) et la quantité.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black">3</div>
                                            <h4 className="font-bold">Paiement Mobile</h4>
                                            <p className="text-xs text-[var(--text-muted)]">Entrez votre numéro et validez sur votre téléphone (MTN ou Orange).</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-primary/5 p-6 border-t border-[var(--border)] flex items-center gap-4">
                                    <QrCode size={40} className="text-primary" />
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase">Où sont mes billets ?</h4>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Une fois payé, votre billet apparaît instantanément dans la section <Link to="/my-tickets" className="text-primary font-bold hover:underline">Mes Billets</Link>. Un QR code unique sera scanné par l'organisateur le jour J.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. COTE ORGANISATEUR */}
                    <section id="organisateur" className="scroll-mt-28 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                                <Calendar size={28} />
                            </div>
                            <h2 className="text-3xl font-black">3. Guide de l'Organisateur Expert</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Create événement section */}
                            <div className="card-surface p-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black flex items-center gap-3">
                                        <PlusCircle size={24} className="text-primary" /> Créer & Modifier un Événement
                                    </h3>
                                    <Link to="/organizer/create" className="btn-primary text-xs py-2 px-4 shadow-none">Go Créer</Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-primary flex items-center gap-2"><Info size={16} /> Détails essentiels</h4>
                                        <ul className="space-y-3 text-sm text-[var(--text-muted)] font-medium">
                                            <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" /> <strong>Infos de base :</strong> Titre clair (ex: Finale Coupe du Cameroun), Lieu précis et Date/Heure exacte de début et de fin.</li>
                                            <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" /> <strong>Visibilité :</strong> Ajoutez une image accrocheuse (format 16/9, taille maximale 3Mo recommandé).</li>
                                            <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" /> <strong>Catégories :</strong> Créez autant de types que nécessaire (VIP, Standard, etc) avec prix et stock propres.</li>
                                            <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" /> Valider la publication du événement.</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-primary flex items-center gap-2"><Edit size={16} /> Modification</h4>
                                        <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                            Une erreur ? Pas de souci. Retrouvez vos événements dans <Link to="/organizer/events" className="text-primary underline">Mes Événements</Link> et cliquez sur l'icône éditer <strong>(<Edit size={12} className="inline" />)</strong>. Vous pouvez mettre à jour le prix, le stock ou même l'image tant que le événement n'est pas terminé.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* WALLET SECTION */}
                            <div id="wallet" className="scroll-mt-28 card-surface p-10 space-y-6 border-l-8 border-emerald-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black flex items-center gap-3">
                                        <Wallet size={24} className="text-emerald-500" /> Portefeuille & Gains
                                    </h3>
                                    <Link to="/organizer/wallet" className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase hover:underline">Accéder au Wallet <ArrowUpRight size={14} /></Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                                            Le portefeuille est l'endroit où sont centralisés vos gains. Chaque billet vendu incrémente votre solde disponible.
                                        </p>
                                        <div className="bg-[var(--background)] p-6 rounded-2xl space-y-3">
                                            <h4 className="font-bold flex items-center gap-2 text-emerald-500"><Download size={18} /> Faire un retrait</h4>
                                            <ul className="text-xs space-y-3 text-[var(--text-muted)] list-disc pl-4 font-bold">
                                                <li>Cliquez sur "Demander un Retrait".</li>
                                                <li>Saisissez le montant (Min: 500 CFA).</li>
                                                <li>Choisissez votre méthode (Mobile Money).</li>
                                                <li>Indiquez votre numéro de réception.</li>
                                                <li>Validation sous 24h ouvrées.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-primary flex items-center gap-2"><Zap size={18} /> Frais de Service (Commissions)</h4>
                                        <p className="text-xs text-[var(--text-muted)] font-medium italic">
                                            Evenia applique une commission dégressive sur chaque billet pour assurer la maintenance et la sécurité :
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                <span className="text-xs font-bold">10 - 9,999 FCFA</span>
                                                <span className="text-primary font-black">5%</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                <span className="text-xs font-bold">10,000 - 24,000 FCFA</span>
                                                <span className="text-primary font-black">4%</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                <span className="text-xs font-bold">25,000 FCFA et plus</span>
                                                <span className="text-primary font-black">3.5%</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight">
                                            Note: Ces frais sont partagés entre l'organisateur et la plateforme pour offrir le meilleur service.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* STAFF MANAGEMENT */}
                            <div id="staff" className="scroll-mt-28 card-surface p-10 space-y-6">
                                <h3 className="text-2xl font-black flex items-center gap-3">
                                    <Users size={24} className="text-primary" /> Gestion de votre Staff
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h4 className="font-bold">Pourquoi utiliser le Staff ?</h4>
                                        <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                            En tant qu'organisateur, vous ne pouvez pas être à toutes les portes du stade. La <Link to="/organizer/staff" className="text-primary underline">Gestion Staff</Link> vous permet de créer des comptes "Agent de scan" pour vos collaborateurs.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-bold">Comment ça marche ?</h4>
                                        <ul className="text-xs space-y-3 text-[var(--text-muted)] font-bold">
                                            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0" /> Créez un agent (Nom, Email, Mot de passe,Numero de téléphone, code de unique de validation).</li>
                                            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0" /> L'agent se connecte sur son téléphone (application mobile)</li>
                                            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0" /> Il utilise le <Link to="/scanner" className="text-primary underline">Scanner</Link> pour valider les entrées.</li>
                                            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0" /> Vous suivez ses stats de scan en direct sur votre tableau de bord.</li>
                                            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0" /> <span className="text-emerald-500 font-black">Nouveau :</span> Activez ou désactivez un agent d'un simple clic pour contrôler son accès instantanément.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* STATISTICS & EXPORTS */}
                            <div id="stats" className="scroll-mt-28 card-surface p-10 space-y-8 bg-gradient-to-br from-[var(--surface)] to-primary/5 border-2 border-primary/20">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black flex items-center gap-3">
                                        <BarChart3 size={24} className="text-primary" /> Analyser vos Performances
                                    </h3>
                                    <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed">
                                        La page <Link to="/organizer/stats" className="text-primary underline">Statistiques</Link> est le centre de pilotage de votre activité.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <TrendingUp className="text-primary" size={24} />
                                        <h4 className="font-black text-sm uppercase">Lecture des graphiques</h4>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Visualisez les tendances sur 30 jours, plusieurs mois ou plusieurs années pour analyser vos cycles de vente à long terme.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <PieChartIcon className="text-accent" size={24} />
                                        <h4 className="font-black text-sm uppercase">Répartition</h4>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Sachez exactement si vous vendez plus de billets VIP, Standard, etc, pour ajuster vos prochaines offres.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Download className="text-emerald-500" size={24} />
                                        <h4 className="font-black text-sm uppercase">Exportation PDF & CSV</h4>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">Exportez des rapports pro en <strong>PDF</strong> pour vos archives ou en <strong>CSV</strong> pour vos analyses.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] text-xs font-medium italic">
                                    Note : Les rapports incluent l'historique de vos ventes, de vos retraits portefeuille et le taux de validation (scans) par événement.
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. SECURITE & SUPPORT */}
                    <section id="support" className="scroll-mt-28 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                                <ShieldCheck size={28} />
                            </div>
                            <h2 className="text-3xl font-black">4. Sécurité & Support technique</h2>
                        </div>

                        <div className="card-surface p-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black">Assistance 24/7</h4>
                                    <p className="text-[var(--text-muted)] font-medium">Un blocage ? Une question sur un paiement ? Notre équipe est prête à vous aider sur tous les canaux.</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <a href="https://wa.me/237686013300" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 text-green-600 font-bold hover:bg-green-500/20 transition-all border border-green-500/20">
                                        <MessageCircle size={20} />
                                        Contacter via WhatsApp
                                    </a>
                                    <a href="mailto:anngaraevenia@gmail.com" className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all border border-primary/20">
                                        <Info size={20} />
                                        Envoyer un Email
                                    </a>
                                </div>
                            </div>
                            <div className="bg-[var(--background)] p-8 rounded-[2rem] border-2 border-primary/10 space-y-4">
                                <ShieldCheck className="text-primary" size={32} />
                                <h4 className="font-bold">Protection des données</h4>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Toutes les transactions sont sécurisées par cryptage SSL. Les QR codes sont à usage unique et impossibles à dupliquer. Votre portefeuille est protégé par votre mot de passe et une validation manuelle des retraits.
                                </p>
                            </div>
                        </div>
                    </section>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20
                        }}
                        className="bg-primary/10 border-2 border-primary/30 p-10 rounded-[2.5rem] text-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <h3 className="text-2xl md:text-4xl font-black text-primary relative z-10">
                            "Avec <span className="text-glow">Evenia Ticket</span>, tout est retraçable en cas d'erreur"
                        </h3>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 mt-4 relative z-10">
                            Transparence • Sécurité • Fiabilité
                        </p>
                    </motion.div>

                    {/* FINAL CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center p-12 bg-primary text-white rounded-[3rem] shadow-2xl shadow-primary/40 space-y-8 relative overflow-hidden"
                    >
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-6">
                            <h3 className="text-4xl md:text-5xl font-black">Il ne manque plus que vous !</h3>
                            <p className="text-white/80 font-bold text-lg max-w-xl mx-auto italic">"Le futur de la billetterie est entre vos mains, rejoignez l'aventure Evenia Ticket dès aujourd'hui."</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link to="/register" className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl">
                                    Lancer l'inscription
                                </Link>
                                <Link to="/login" className="bg-primary-dark/30 hover:bg-primary-dark/50 border border-white/30 px-10 py-5 rounded-2xl font-black text-xl transition-all">
                                    Me connecter
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// Help icons
const PieChartIcon = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);

export default GuidePage;
