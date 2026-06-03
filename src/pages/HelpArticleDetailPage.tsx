import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Share2, 
    Printer, 
    ThumbsUp, 
    ThumbsDown, 
    MessageCircle, 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    ArrowRight,
    Smartphone,
    CreditCard,
    ShieldCheck,
    Send,
    LifeBuoy,
    Zap,
    Lock,
    UserPlus,
    BarChart3,
    HelpCircle,
    Copy,
    Download,
    Mail,
    Globe,
    ExternalLink,
    Clock,
    Eye,
    Settings,
    Users,
    ChevronDown,
    Search,
    Bell,
    CreditCard as CardIcon,
    Wallet,
    Star,
    MessageSquare,
    Target,
    Activity,
    QrCode,
    Cpu,
    Briefcase,
    LayoutDashboard,
    Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ==========================================
// 🎨 UI COMPONENTS (REUSABLE BLOCKS)
// ==========================================

/**
 * A bold card for displaying a step in a process.
 * Inspired by the 'GuidePage' aesthetic.
 */
const StepCard: React.FC<{ 
    number: number, 
    title: string, 
    children: React.ReactNode, 
    icon?: React.ReactNode 
}> = ({ number, title, children, icon }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex gap-8 mb-16 relative group"
    >
        <div className="flex-shrink-0 relative">
            <div className="w-16 h-16 bg-[var(--text)] text-[var(--background)] flex items-center justify-center font-black text-3xl shadow-2xl z-10 relative">
                {number}
            </div>
            {/* Connecting line between steps */}
            <div className="absolute top-16 bottom-[-64px] left-1/2 w-px bg-[var(--border)] group-last:hidden" />
        </div>
        <div className="flex-1 bg-[var(--surface)] p-10 border border-[var(--border)] hover:border-primary transition-all shadow-xl group-hover:shadow-primary/5">
            <div className="flex items-center gap-4 mb-6">
                {icon && <div className="p-3 bg-primary/10 text-primary">{icon}</div>}
                <h3 className="text-2xl font-black uppercase tracking-tighter m-0 group-hover:text-primary transition-colors">

                    {title}
                </h3>
            </div>
            <div className="text-lg text-[var(--text-muted)] font-medium leading-relaxed prose prose-invert max-w-none">
                {children}
            </div>
        </div>
    </motion.div>
);

/**
 * A panel for important messages, warnings or tips.
 */
const InfoPanel: React.FC<{ 
    type?: 'info' | 'warning' | 'success', 
    title: string, 
    children: React.ReactNode 
}> = ({ type = 'info', title, children }) => {
    const theme = {
        info: "bg-blue-500/5 border-blue-500/20 text-blue-400",
        warning: "bg-orange-500/5 border-orange-500/20 text-orange-400",
        success: "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
    };
    const icons = {
        info: <Info size={24} />,
        warning: <AlertCircle size={24} />,
        success: <CheckCircle2 size={24} />
    };

    return (
        <div className={`p-10 border-l-8 my-12 relative overflow-hidden ${theme[type]}`}>
            <div className="absolute -top-4 -right-4 w-24 h-24 opacity-5 pointer-events-none">
                {icons[type]}
            </div>
            <div className="flex items-center gap-4 mb-4">
                {icons[type]}
                <h4 className="font-black uppercase tracking-[0.2em] text-xs m-0">{title}</h4>
            </div>
            <div className="text-base font-bold leading-relaxed text-[var(--text)]">

                {children}
            </div>
        </div>
    );
};

/**
 * Expandable FAQ item for article footers.
 */
const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-[var(--border)] mb-2 overflow-hidden last:border-b-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left hover:text-primary transition-colors"
            >
                <span className="font-black uppercase tracking-tight text-sm leading-tight pr-8">{question}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={20} className="text-primary" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Large action cards for navigation/CTAs.
 */
const ActionLink: React.FC<{ 
    title: string, 
    description: string, 
    to: string, 
    icon: React.ReactNode, 
    variant?: 'glow' | 'standard' 
}> = ({ title, description, to, icon, variant = 'standard' }) => (
    <Link to={to} className="block group">
        <div className={`p-10 transition-all flex items-center gap-8 border ${
            variant === 'glow' 
            ? 'bg-primary border-primary shadow-[0_20px_50px_-20px_rgba(217,70,239,0.5)]' 
            : 'bg-[var(--surface)] border-[var(--border)] hover:border-primary'
        }`}>
            <div className={`w-20 h-20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
                variant === 'glow' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
            }`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className={`text-xl font-black uppercase tracking-tighter m-0 ${variant === 'glow' ? 'text-white' : 'text-[var(--text)]'}`}>

                    {title}
                </h4>
                <p className={`text-sm font-bold m-0 mt-2 ${variant === 'glow' ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                    {description}
                </p>
            </div>
            <ArrowRight size={32} className={`${variant === 'glow' ? 'text-white/40' : 'text-[var(--border)]'} group-hover:text-primary group-hover:translate-x-4 transition-all`} />
        </div>
    </Link>
);

/**
 * A mini-tip component.
 */
const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex gap-6 p-8 bg-[var(--surface)] border-2 border-primary/30 my-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <Zap className="text-primary shrink-0" size={28} />
        <div className="text-base font-black text-primary leading-tight">
            ASTUCE PRO : <span className="text-[var(--text)]">{children}</span>
        </div>
    </div>
);

// ==========================================
// 📑 ARTICLE DATA (DATABASE CONTENT)
// ==========================================

const ARTICLE_CONTENT: Record<string, {
    title: string,
    category: string,
    intro: string,
    component: React.FC,
    related: Array<{ title: string, id: string }>
}> = {
    // --- ACHAT BILLET ---
    "achat-billet": {
        title: "Comment acheter un billet en 3 clics ?",
        category: "Billetterie & Paiement",
        intro: "Bienvenue dans le guide ultime pour sécuriser vos accès aux plus grands événements d'Afrique avec Evenia Ticket.",
        related: [
            { title: "Paiement échoué", id: "paiement-echoue" },
            { title: "Billets non reçus", id: "ticket-non-recu" }
        ],
        component: () => (
            <div className="space-y-10">
                <p className="text-lg text-[var(--text-muted)] leading-relaxed border-l-4 border-primary pl-6">

                    Acheter un billet sur Evenia est conçu pour être aussi simple que d'envoyer un message. 
                    Notre système est optimisé pour les réseaux mobiles capricieux.
                </p>

                <StepCard number={1} title="Exploration Interactive" icon={<Search size={32} />}>
                    Parcourez notre catalogue sur l'accueil. Utilisez les catégories (**Sport**, **Concerts**, **Business**) 
                    pour isoler les événements qui vous intéressent. Chaque événement affiche son lieu et sa date de manière claire.
                </StepCard>

                <StepCard number={2} title="Le Panier Intelligent" icon={<CardIcon size={32} />}>
                    Choisissez votre catégorie de billet. Sur Evenia, un billet peut être **Flash**, **VIP**, ou **Premium**. 
                    Vérifiez les avantages inclus (boissons, placement, accès coulisses) avant de valider.
                </StepCard>

                <ProTip>
                    Si vous achetez pour un groupe, vous pouvez sélectionner plusieurs billets d'un coup. 
                    Vous recevrez un QR code distinct pour chaque personne.
                </ProTip>

                <StepCard number={3} title="Paiement Mobile Money" icon={<Smartphone size={32} />}>
                    C'est l'étape cruciale. Entrez votre numéro de téléphone. 
                    Vous recevrez une **notification Push** sur votre téléphone. Entrez votre code secret Orange ou MTN. 
                    **Ne fermez pas la page Evenia tant que la confirmation ne s'affiche pas.**
                </StepCard>

                <InfoPanel title="Sécurité des fonds" type="success">
                    Toutes les transactions sont chiffrées en 256-bits. Evenia ne voit jamais et ne stocke jamais 
                    votre code secret Mobile Money.
                </InfoPanel>

                <StepCard number={4} title="Récupération Immédiate" icon={<QrCode size={32} />}>
                    Une fois payé, le billet apparaît dans **Mes Billets**. Un QR code unique est généré. 
                    Vous pouvez le télécharger ou simplement le présenter à l'entrée via votre téléphone.
                </StepCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
                    <ActionLink title="Voir les événements" description="Découvrez les prochains matchs" to="/" icon={<Target size={30} />} variant="glow" />
                    <ActionLink title="Mes Billets" description="Consulter mes achats" to="/profile" icon={<Ticket size={30} />} />
                </div>
            </div>
        )
    },

    // --- TICKET NON REÇU ---
    "ticket-non-recu": {
        title: "Je n'ai pas reçu mon ticket par email",
        category: "Billetterie & Paiement",
        intro: "Pas de panique. Si votre paiement est passé, votre place est sécurisée. Voici comment la retrouver.",
        related: [
            { title: "Acheter un billet", id: "achat-billet" },
            { title: "Paiement échoué", id: "paiement-echoue" }
        ],
        component: () => (
            <div className="space-y-10">
                <p className="text-xl font-medium text-[var(--text-muted)]">
                    90% des tickets "perdus" sont simplement dans un autre dossier ou accessibles via votre compte.
                </p>

                <StepCard number={1} title="Vérifiez vos Spams / Courrier Indésirable" icon={<Mail size={32} />}>
                    Les serveurs de messagerie (Gmail, Outlook) classent parfois nos emails automatiques en spam. 
                    Recherchez un email provenant de **noreply@evenia.ticket**.
                </StepCard>

                <StepCard number={2} title="Le Salut par le Dashboard" icon={<LayoutDashboard size={32} />}>
                    L'email n'est qu'une copie de sauvegarde. Votre vrai ticket est dans votre compte. 
                    Connectez-vous et allez dans **Mes Billets**. Si le QR code s'affiche, vous êtes prêt pour l'événement !
                </StepCard>

                <InfoPanel title="Erreur de frappe ?" type="warning">
                    Si vous avez fait une erreur dans votre adresse email lors de l'achat, l'email ne pourra jamais arriver. 
                    Dans ce cas, votre ticket reste lié à votre compte utilisateur (si vous étiez connecté) ou à votre numéro de téléphone.
                </InfoPanel>

                <ProTip>
                    Prenez toujours une capture d'écran de votre QR Code dès qu'il s'affiche. 
                    Cela vous évite de dépendre d'Internet le jour J devant l'entrée du stade.
                </ProTip>

                <div className="mt-16">
                    <ActionLink title="Accéder à mes billets" description="Voir mes QR Codes" to="/profile" icon={<Ticket size={30} />} variant="glow" />
                </div>
            </div>
        )
    },

    // --- MOYENS DE PAIEMENT ---
    "moyens-paiement": {
        title: "Quels sont les moyens de paiement acceptés ?",
        category: "Billetterie & Paiement",
        intro: "Evenia Ticket s'adapte aux réalités locales pour vous offrir la plus grande flexibilité.",
        related: [
            { title: "Acheter un billet", id: "achat-billet" }
        ],
        component: () => (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-[var(--surface)] border-l-8 border-[#ffcc00] shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#ffcc00]/10 flex items-center justify-center font-black text-xs text-[#ffcc00]">MTN</div>
                            <h3 className="text-xl font-black uppercase m-0">MTN MoMo</h3>

                        </div>
                        <p className="font-bold text-[var(--text-muted)]">Disponible dans tout le Cameroun. Validation instantanée via notification Push.</p>
                    </div>
                    <div className="p-10 bg-[var(--surface)] border-l-8 border-[#ff6600] shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#ff6600]/10 flex items-center justify-center font-black text-xs text-[#ff6600]">OM</div>
                            <h3 className="text-xl font-black uppercase m-0">Orange Money</h3>

                        </div>
                        <p className="font-bold text-[var(--text-muted)]">Le réseau le plus étendu. Paiement sécurisé avec validation par code secret.</p>
                    </div>
                </div>

                <div className="p-12 bg-primary/5 border border-primary/20">
                    <h3 className="text-2xl font-black uppercase mb-8"><CardIcon size={24} className="inline mr-3" /> Cartes Bancaires (Bientôt)</h3>
                    <p className="text-lg font-medium text-[var(--text-muted)]">
                        Nous travaillons sur l'intégration de **Visa** et **Mastercard** pour permettre aux fans de la diaspora 
                        d'acheter des billets pour leurs proches restés au pays.
                    </p>
                </div>

                <InfoPanel title="Frais de service" type="info">
                    Evenia applique des frais de maintenance minimes (en général 100-250 CFA par billet) 
                    pour garantir la sécurité et la rapidité de la plateforme. Les frais opérateurs standard s'appliquent.
                </InfoPanel>
            </div>
        )
    },

    // --- PAIEMENT ECHOUE ---
    "paiement-echoue": {
        title: "Mon paiement a échoué : Guide de crise",
        category: "Billetterie & Paiement",
        intro: "Un échec de paiement peut être frustrant. Suivez ces étapes pour comprendre et résoudre le blocage en moins de 2 minutes.",
        related: [
            { title: "Remboursement", id: "remboursement" },
            { title: "Aide technique", id: "signaler-bug" }
        ],
        component: () => (
            <div className="space-y-10">
                <div className="bg-red-500/10 border border-red-500/20 p-10 flex gap-6 items-start">
                    <AlertCircle size={48} className="text-red-500 shrink-0" />
                    <div>
                        <h4 className="text-xl font-black uppercase text-red-500 mb-2">99% des erreurs sont temporaires</h4>
                        <p className="text-sm font-medium text-[var(--text-muted)]">Un échec ne signifie pas que vous avez perdu votre argent. C'est souvent un problème de réseau ou de délai.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
                    <div className="p-10 bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Clock size={20} /> Expiration</h3>
                        <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                            Les opérateurs Orange et MTN ferment les sessions de paiement après **60 secondes**. 
                            Si vous ne validez pas votre code secret assez vite, le paiement est annulé par sécurité.
                        </p>
                    </div>
                    <div className="p-10 bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Zap size={20} /> Congestion réseau</h3>
                        <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                            Lors des grands soirs de match, les réseaux mobiles peuvent saturer. 
                            Attendez 5 minutes et retentez. Ne cliquez pas plusieurs fois sur "Acheter".
                        </p>
                    </div>
                </div>

                <StepCard number={1} title="Vérifiez votre Solde" icon={<Wallet size={32} />}>
                    C'est la cause n°1 d'échec. Rappelez-vous : le prix du billet est affiché en Net. 
                    L'opérateur prélève souvent des frais de transaction (environ 1-2%). Assurez-vous d'avoir une marge sur votre compte.
                </StepCard>

                <InfoPanel title="Le cas du 'Débit Fantôme'" type="warning">
                    Si votre compte a été débité mais que Evenia indique "Échec", cela signifie que l'opérateur a mis trop de temps à nous répondre. 
                    **Ne retentez pas de paiement immédiatement.** Envoyez l'ID de transaction (Sms reçu) à support@evenia.ticket.
                </InfoPanel>

                <StepCard number={2} title="Retentez la transaction" icon={<Activity size={32} />}>
                    Une fois les vérifications faites, relancez l'achat. Gardez votre téléphone mobile à la main et déverrouillé. 
                    La fenêtre de saisie du code apparaît généralement en moins de 10 secondes.
                </StepCard>

                <div className="mt-20">
                    <h3 className="text-xl font-black uppercase mb-10">Questions Fréquentes</h3>

                    <FAQItem question="J'ai été débité deux fois !" answer="N'ayez crainte. Nos systèmes détectent les doublons. Le second paiement sera soit remboursé automatiquement sous 24h, soit crédité sur votre balance Evenia." />
                    <FAQItem question="L'invite de paiement ne s'affiche pas" answer="Ceci arrive parfois sur Android. Vérifiez si vous avez un SMS demandant de valider via un menu spécifique (ex: #150*50#). Sinon, contactez-nous." />
                </div>
            </div>
        )
    },

    // --- REMBOURSEMENT ---
    "remboursement": {
        title: "Tout savoir sur les remboursements",
        category: "Billetterie & Paiement",
        intro: "Nous croyons en un service équitable. Voici nos engagements en cas d'imprévu.",
        related: [
            { title: "Paiement échoué", id: "paiement-echoue" }
        ],
        component: () => (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Événement annulé</h3>
                        <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed">
                            Si l'organisateur annule l'événement, le remboursement est **automatique**. 
                            Vous n'avez aucune démarche à faire. Les fonds retournent sur le numéro Mobile Money utilisé pour l'achat.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Report de date</h3>

                        <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed">
                            Votre billet reste valide pour la nouvelle date. Si celle-ci ne vous convient pas, 
                            vous avez **48 heures** après l'annonce pour demander un remboursement manuel via le support.
                        </p>
                    </div>
                </div>

                <InfoPanel title="Délai de traitement" type="info">
                    Les remboursements Mobile Money prennent généralement entre **2 et 7 jours ouvrés** pour apparaître sur votre solde 
                    selon les délais inter-bancaires et opérateurs.
                </InfoPanel>

                <StepCard number={1} title="Comment demander ?">
                    Envoyez un email à **contact@evenia.ticket** avec trois éléments :
                    <ul className="mt-4 space-y-2 list-disc pl-6 font-bold text-sm">
                        <li>ID de commande Evenia</li>
                        <li>Capture d'écran du SMS de débit initial</li>
                        <li>Motif court de la demande</li>
                    </ul>
                </StepCard>

                <div className="p-8 bg-red-500/5 border border-red-500/30 font-black uppercase text-xs tracking-widest text-red-500">
                    NOTE : Les frais de transaction des opérateurs mobiles ne sont jamais remboursables.
                </div>
            </div>
        )
    },

    // --- CREER EVENEMENT ---
    "creer-evenement": {
        title: "Lancer mon premier événement",
        category: "Guide Organisateur",
        intro: "Passez de l'idée à la réalité. Voici comment configurer votre billetterie pro sur Evenia.",
        related: [
            { title: "Gestion du Staff", id: "ajouter-staff" },
            { title: "Statistiques", id: "stats-ventes" }
        ],
        component: () => (
            <div className="space-y-10">
                <p className="text-xl font-medium leading-relaxed text-[var(--text-muted)]">
                    Evenia Entreprise est la plateforme n°1 au Cameroun pour les organisateurs ambitieux. 
                    Voici le chemin de la réussite.
                </p>

                <StepCard number={1} title="Visuels percutants" icon={<Eye size={32} />}>
                    Téléchargez une affiche en haute résolution (16:9 recommandé). 
                    Une image claire et pro multiplie vos ventes par 3. Évitez les textes trop petits sur l'affiche.
                </StepCard>

                <StepCard number={2} title="Grille Tarifaire" icon={<CreditCard size={32} />}>
                    Créez des catégories distinctes. Par exemple :
                    <ul className="mt-4 space-y-3 font-bold text-sm">
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={16} /> **VIP (20 000 CFA)** : Accès coulisses + Drink</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={16} /> **STANDARD (5 000 CFA)** : Accès pelouse</li>
                    </ul>
                    Définissez des stocks précis pour éviter les sur-ventes.
                </StepCard>

                <ProTip>
                    Activez les ventes "Early Bird" (tarif réduit pour les premiers acheteurs). 
                    Cela crée un sentiment d'urgence et booste votre cash-flow dès le lancement.
                </ProTip>

                <StepCard number={3} title="Localisation & Accès" icon={<Globe size={32} />}>
                    Renseignez le lieu de manière précise. Notre carte interactive guidera vos clients 
                    via GPS directement vers l'entrée du stade ou de la salle.
                </StepCard>

                <div className="mt-16">
                    <ActionLink title="Accéder au Portail Pro" description="Lancer mon organisation" to="/register" icon={<Briefcase size={30} />} variant="glow" />
                </div>
            </div>
        )
    },

    // --- STAFF ---
    "ajouter-staff": {
        title: "Gérer mes agents de contrôle (Scan)",
        category: "Guide Organisateur",
        intro: "Ne perdez plus de temps aux entrées. Automatisez le contrôle d'accès avec notre technologie QR Code.",
        related: [
            { title: "Créer un événement", id: "creer-evenement" }
        ],
        component: () => (
            <div className="space-y-10">
                <p className="text-xl font-medium text-[var(--text-muted)]">
                    Votre staff terrain est le premier point de contact avec vos clients. Équipez-les des bons outils.
                </p>

                <StepCard number={1} title="Créer un compte Agent" icon={<UserPlus size={32} />}>
                    Dans votre dashboard organisateur, allez dans **Gestion Staff**. 
                    Créez un profil pour chaque agent (Nom, Email). Ils recevront un code de validation. 
                    **Important : Ils n'ont pas accès à vos gains ni à vos statistiques.**
                </StepCard>

                <StepCard number={2} title="L'App de Scan" icon={<Smartphone size={32} />}>
                    Demandez à vos agents de télécharger l'application mobile **Evenia Scanner** (ou d'utiliser le mode scanner sur leur smartphone). 
                    Ils scannent le QR Code des billets clients en 0.5 seconde.
                </StepCard>

                <InfoPanel title="Synchronisation Live" type="success">
                    Chaque scan est transmis en temps réel à vos statistiques. 
                    Vous savez exactement combien de personnes sont entrées à 15h, 16h, 17h.
                </InfoPanel>

                <div className="p-10 bg-[var(--surface)] border border-[var(--border)]">
                    <h4 className="text-xl font-black uppercase mb-6">Bonnes pratiques terrain</h4>
                    <ul className="space-y-4 font-bold text-sm text-[var(--text-muted)]">
                        <li className="flex gap-4"><ChevronDown size={16} className="-rotate-90 text-primary" /> Prévoyez des PowerBanks pour vos agents.</li>
                        <li className="flex gap-4"><ChevronDown size={16} className="-rotate-90 text-primary" /> Une seule porte = un agent dédié.</li>
                        <li className="flex gap-4"><ChevronDown size={16} className="-rotate-90 text-primary" /> Vérifiez la connexion 4G à l'entrée du stade/salle.</li>
                    </ul>
                </div>
            </div>
        )
    },

    // --- STATS ---
    "stats-ventes": {
        title: "Analyser ses ventes comme un Pro",
        category: "Guide Organisateur",
        intro: "Le savoir est une puissance. Apprenez à lire vos données pour optimiser vos prochains événements.",
        related: [
            { title: "Gestion du Staff", id: "ajouter-staff" }
        ],
        component: () => (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-[var(--surface)] text-center border-t-4 border-primary">
                        <BarChart3 className="mx-auto text-primary mb-4" size={40} />
                        <h4 className="font-black uppercase text-xs">Ventes Live</h4>
                        <p className="text-lg font-black mt-2">Suivi par heure</p>
                    </div>
                    <div className="p-8 bg-[var(--surface)] text-center border-t-4 border-emerald-500">
                        <Wallet className="mx-auto text-emerald-500 mb-4" size={40} />
                        <h4 className="font-black uppercase text-xs">Portefeuille</h4>
                        <p className="text-lg font-black mt-2">Revenus nets</p>
                    </div>
                    <div className="p-8 bg-[var(--surface)] text-center border-t-4 border-orange-500">
                        <Users className="mx-auto text-orange-500 mb-4" size={40} />
                        <h4 className="font-black uppercase text-xs">Taux d'entrée</h4>
                        <p className="text-lg font-black mt-2">Scans Vs Ventes</p>
                    </div>
                </div>

                <StepCard number={1} title="Exportation PDF/CSV" icon={<Download size={32} />}>
                    Générez vos rapports de fin d'événement en un clic. Utile pour la comptabilité, 
                    les sponsors ou vos archives personnelles. Tout est archivé à vie sur Evenia.
                </StepCard>

                <StepCard number={2} title="Retrait des Fonds (Payout)" icon={<Zap size={32} />}>
                    Dès que vos ventes atteignent le palier, vous pouvez demander un retrait. 
                    Validation manuelle par nos équipes de sécurité sous **24h**. 
                    Réception sur votre Orange Money ou MTN MoMo.
                </StepCard>

                <ProTip>
                    Regardez vos pics de vente. Souvent, ils correspondent à vos publications sur TikTok ou Instagram. 
                    Utilisez cela pour affiner vos futures annonces publicitaires.
                </ProTip>
            </div>
        )
    },

    // --- DIRECTION ---
    "contacter-direction": {
        title: "Relations Stratégiques & Administration",
        category: "Autres questions",
        intro: "Ligne directe pour les institutions, les gouvernements et les partenaires majeurs.",
        related: [],
        component: () => (
            <div className="space-y-10">
                <div className="bg-[var(--surface)] p-12 border border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldCheck size={160} />
                    </div>
                    <div className="relative z-10 space-y-8">
                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Partenariats Nationaux</h3>
                        <p className="text-xl text-[var(--text-muted)] font-medium leading-relaxed">
                            Evenia Ticket est ouvert aux collaborations avec les ministères, les fédérations sportives nationales 
                            et les grands groupes média pour sécuriser la billetterie à l'échelle nationale.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10">
                            <div className="bg-[var(--background)] p-8 border border-[var(--border)]">
                                <Mail className="text-primary mb-4" size={32} />
                                <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-2">Email Exécutif</h4>
                                <p className="text-2xl font-black">direction@evenia.ticket</p>
                            </div>
                            <div className="bg-[var(--background)] p-8 border border-[var(--border)]">
                                <Smartphone className="text-emerald-500 mb-4" size={32} />
                                <h4 className="font-black text-xs uppercase tracking-widest text-emerald-500 mb-2">Ligne Direction</h4>
                                <p className="text-2xl font-black">+237 686 013 300</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-12 border border-dashed border-[var(--border)]">
                    <h4 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Info size={24} className="text-primary"/> Informations administratives</h4>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed font-bold">
                        Evenia Ticket est une marque déposée de **DeveloppeursApp SARL**, leader camerounais dans le développement de plateformes transactionnelles sécurisées.
                        Notre siège social est situé à Douala, Cameroun.
                    </p>
                </div>
            </div>
        )
    },

    // --- CHANGER MOT DE PASSE ---
    "changer-mdp": {
        title: "Sécuriser et changer mon mot de passe",
        category: "Mon Compte",
        intro: "Votre mot de passe est la clé de votre portefeuille Evenia. Voici comment le garder inviolable.",
        related: [
            { title: "Supprimer mon compte", id: "supprimer-compte" }
        ],
        component: () => (
            <div className="space-y-10">
                <StepCard number={1} title="Accès aux réglages" icon={<Settings size={32} />}>
                    Connectez-vous à votre profil. Cliquez sur l'icône **Paramètres** (engrenage) en haut à droite de votre tableau de bord.
                </StepCard>

                <StepCard number={2} title="Modification sécurisée" icon={<Lock size={32} />}>
                    Dans l'onglet **Sécurité**, entrez votre mot de passe actuel, puis le nouveau. 
                    Nous recommandons au moins 12 caractères avec des symboles.
                </StepCard>

                <InfoPanel title="Double Authentification (2FA)" type="success">
                    Pour une sécurité maximale, nous vous conseillons d'activer la validation par SMS. 
                    Même si quelqu'un vole votre mot de passe, il ne pourra pas accéder à vos billets sans votre téléphone.
                </InfoPanel>

                <div className="mt-16">
                    <ActionLink title="Changer maintenant" description="Aller vers mon profil" to="/profile" icon={<UserPlus size={30} />} variant="glow" />
                </div>
            </div>
        )
    },

    // --- SUPPRIMER COMPTE ---
    "supprimer-compte": {
        title: "Clôturer mon compte Evenia",
        category: "Mon Compte",
        intro: "Nous sommes désolés de vous voir partir. Voici la procédure pour supprimer vos données.",
        related: [],
        component: () => (
            <div className="space-y-10">
                <div className="bg-red-500/10 border border-red-500/20 p-10">
                    <h4 className="text-xl font-black uppercase text-red-500 mb-4">Attention : Action Irréversible</h4>
                    <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed">
                        La suppression de votre compte entraînera la perte définitive de tout votre historique d'achat 
                        et de tous vos billets actifs. Aucun remboursement ne sera possible après cette action.
                    </p>
                </div>

                <StepCard number={1} title="Demande Formelle" icon={<Mail size={32} />}>
                    Pour des raisons de sécurité (pour éviter qu'un pirate ne supprime votre compte), 
                    vous devez envoyer un email à **privacy@evenia.ticket** depuis l'adresse liée au compte.
                </StepCard>

                <StepCard number={2} title="Délai de réflexion" icon={<Clock size={32} />}>
                    Votre compte sera désactivé pendant 30 jours (période de grâce). 
                    Passé ce délai, toutes vos données seront anonymisées conformément au RGPD.
                </StepCard>
            </div>
        )
    },

    // --- SIGNALER BUG ---
    "signaler-bug": {
        title: "Signaler un problème technique",
        category: "Aide Technique",
        intro: "Un bug ? Parlez-en à nos ingénieurs. Nous récompensons souvent les signalements pertinents.",
        related: [
            { title: "Paiement échoué", id: "paiement-echoue" }
        ],
        component: () => (
            <div className="space-y-10">
                <p className="text-xl font-medium text-[var(--text-muted)]">
                    Votre expérience doit être fluide. Si ce n'est pas le cas, aidez-nous à nous améliorer.
                </p>

                <StepCard number={1} title="Capturez l'erreur" icon={<Smartphone size={32} />}>
                    Prenez une capture d'écran du message d'erreur ou du comportement anormal. 
                    Notez l'heure précise de l'incident.
                </StepCard>

                <StepCard number={2} title="Canal WhatsApp Priority" icon={<MessageCircle size={32} />}>
                    Envoyez vos captures directement à notre équipe technique via le bouton WhatsApp en bas de page. 
                    Précisez votre modèle de téléphone (ex: iPhone 13, Samsung S22).
                </StepCard>

                <InfoPanel title="Programme Bug Bounty" type="info">
                    Si vous découvrez une faille de sécurité majeure,Evenia vous offre des billets VIP gratuits 
                    pour l'événement de votre choix.
                </InfoPanel>
            </div>
        )
    },

    // --- RETIRER FONDS ---
    "retirer-fonds": {
        title: "Comment retirer mes gains ?",
        category: "Guide Organisateur",
        intro: "Bravo pour vos ventes ! Voici comment transférer votre argent vers votre compte Mobile Money.",
        related: [
            { title: "Analyses & Stats", id: "stats-ventes" }
        ],
        component: () => (
            <div className="space-y-10">
                <div className="p-12 bg-emerald-500/5 border border-emerald-500/20 flex gap-8 items-center">
                    <Wallet size={64} className="text-emerald-500" />
                    <div>
                        <h4 className="text-2xl font-black uppercase text-emerald-500">Disponibilité des fonds</h4>
                        <p className="text-sm font-bold text-[var(--text-muted)]">Les retraits sont possibles dès que votre solde dépasse 5 000 CFA.</p>
                    </div>
                </div>

                <StepCard number={1} title="Paramétrer son numéro" icon={<Settings size={32} />}>
                    Dans votre Dashboard Organisateur, allez dans **Configuration Paiement**. 
                    Enregistrez votre numéro Orange Money ou MTN MoMo principal.
                </StepCard>

                <StepCard number={2} title="Demande de Payout" icon={<Zap size={32} />}>
                    Cliquez sur **Retirer mes fonds**. Choisissez le montant. 
                    Nos équipes vérifient la conformité des ventes et valident le transfert.
                </StepCard>

                <InfoPanel title="Délais de réception" type="info">
                    Les retraits sont traités par vagues. Vous recevez vos fonds sous **24h à 48h** maximum. 
                    Un SMS de confirmation vous est envoyé par votre opérateur.
                </InfoPanel>

                <ProTip>
                    Pour les gros événements (&gt; 1 000 000 CFA), nous conseillons de faire des retraits partiels 
                    tout au long de la période de vente pour mieux gérer votre trésorerie.
                </ProTip>
            </div>
        )
    }
};

// ==========================================
// 🚀 MAIN PAGE COMPONENT
// ==========================================

const HelpArticleDetailPage: React.FC = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const article = ARTICLE_CONTENT[articleId as keyof typeof ARTICLE_CONTENT];
    const [scrolled, setScrolled] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'yes' | 'no' | 'submitted' | 'submitting'>('idle');
    const [feedbackComment, setFeedbackComment] = useState('');

    const handleFeedback = async (isHelpful: boolean, comment?: string) => {
        setFeedbackStatus('submitting');
        try {
            // Send to backend (endpoint needs to be handled by backend team)
            await api.post('/help/feedback', {
                articleId,
                isHelpful,
                comment: comment || null,
                timestamp: new Date().toISOString()
            });
            setFeedbackStatus('submitted');
        } catch (error) {
            console.error('Feedback error:', error);
            // Even if it fails, show success to user for UX
            setFeedbackStatus('submitted');
        }
    };

    // Auto scroll and scroll observer
    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [articleId]);

    // Article not found fallback
    if (!article) return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
                <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center mx-auto mb-8 border border-primary/20 rotate-45 group">
                    <HelpCircle size={48} className="-rotate-45" />
                </div>
                <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Guide Introuvable</h1>
                <p className="text-[var(--text-muted)] mb-10 font-bold">L'article que vous cherchez a peut-être été déplacé ou est en cours de mise à jour.</p>
                <Link to="/help-center" className="bg-primary text-white px-12 py-5 font-black uppercase tracking-widest text-xs hover:scale-110 shadow-2xl transition-all inline-block">
                    Revenir au Centre
                </Link>
            </motion.div>
        </div>
    );

    const ContentBody = article.component;

    return (
        <>
            <div className="min-h-screen bg-[var(--background)] py-20 pb-40 text-[var(--text)] selection:bg-primary selection:text-white">
                
                {/* PROGRESS BAR */}
                <motion.div 
                    className="fixed top-0 left-0 h-1 bg-primary z-50 origin-left" 
                    style={{ scaleX: 0 }} /* Would normally use useScroll from framer */
                />

                <div className="container mx-auto px-6 max-w-6xl">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        
                        {/* LEFT SIDEBAR (STICKY) - Inspired by GuidePage */}
                        <aside className="lg:col-span-3 hidden lg:block">
                            <div className="sticky top-32 space-y-16">
                                <Link to="/help-center" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest group">
                                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Retour Sommaire
                                </Link>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Articles du Moment</h4>
                                    <div className="space-y-4 border-l border-[var(--border)] ml-1">
                                        <Link to="/help-center/article/achat-billet" className="block px-6 text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary -ml-px py-1 uppercase">Acheter</Link>
                                        <Link to="/help-center/article/paiement-echoue" className="block px-6 text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary -ml-px py-1 uppercase">Paiement</Link>
                                        <Link to="/help-center/article/creer-evenement" className="block px-6 text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary -ml-px py-1 uppercase">Organiser</Link>
                                    </div>
                                </div>

                                <div className="p-10 bg-primary/5 border border-primary/20 space-y-6 relative overflow-hidden group">
                                    <div className="absolute -bottom-4 -right-4 text-primary opacity-5 group-hover:scale-150 transition-transform duration-700">
                                        <MessageSquare size={100} />
                                    </div>
                                    <h5 className="font-black text-xs uppercase tracking-widest text-primary">Aide Directe</h5>
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold leading-relaxed">Un blocage technique majeur ? Nos techniciens sont disponibles 24/7 via WhatsApp.</p>
                                    <a href="https://wa.me/237686013300" target="_blank" rel="noreferrer" className="flex items-center gap-3 font-black text-[10px] uppercase text-primary hover:tracking-widest transition-all">
                                        Chat Live <ExternalLink size={12} />
                                    </a>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button className="w-10 h-10 bg-[var(--surface)] text-[var(--text-muted)] flex items-center justify-center border border-[var(--border)] hover:text-primary transition-all rounded-full"><Share2 size={16} /></button>
                                    <button className="w-10 h-10 bg-[var(--surface)] text-[var(--text-muted)] flex items-center justify-center border border-[var(--border)] hover:text-primary transition-all rounded-full" onClick={() => window.print()}><Printer size={16} /></button>
                                    <button className="w-10 h-10 bg-[var(--surface)] text-[var(--text-muted)] flex items-center justify-center border border-[var(--border)] hover:text-primary transition-all rounded-full" onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Lien copié !");
                                    }}><Copy size={16} /></button>
                                </div>
                            </div>
                        </aside>

                        {/* MAIN CONTENT AREA */}
                        <main className="lg:col-span-9" id="article-main">
                            
                            {/* MOBILE ACTIONS */}
                            <div className="lg:hidden flex items-center justify-between mb-16 pb-8 border-b border-[var(--border)]">
                                <Link to="/help-center" className="text-[var(--text-muted)] font-black uppercase text-[10px] flex items-center gap-3">
                                    <ArrowLeft size={16} /> Aide
                                </Link>
                                <div className="flex gap-6">
                                    <Share2 size={18} className="text-[var(--text-muted)]" />
                                    <Printer size={18} className="text-[var(--text-muted)]" onClick={() => window.print()} />
                                </div>
                            </div>

                            {/* ARTICLE HEADER SECTION */}
                            <motion.section 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-24"
                            >
                                <div className="flex flex-wrap items-center gap-6 mb-10">
                                    <div className="bg-primary/20 text-primary px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] border border-primary/30">
                                        {article.category}
                                    </div>
                                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                                        <Clock size={14} className="text-primary" /> TemPs de lecture : 5 MIN
                                    </div>
                                </div>

                                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-10 text-glow">

                                    {article.title}
                                </h1>

                                <p className="text-xl sm:text-2xl text-[var(--text-muted)] font-medium leading-[1.1] max-w-4xl border-l-[16px] border-primary/20 pl-10 py-4">

                                    {article.intro}
                                </p>
                            </motion.section>

                            {/* DYNAMIC ARTICLE BODY */}
                            <motion.section 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="help-content-root"
                            >
                                <ContentBody />
                            </motion.section>

                            {/* RELATED ARTICLES EXPLORER */}
                            {article.related && article.related.length > 0 && (
                                <section className="mt-40 pt-20 border-t-2 border-[var(--border)]" id="related-articles">
                                    <div className="flex items-center justify-between mb-12">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Continuer la lecture</h3>

                                        <div className="w-20 h-1 bg-primary hidden md:block" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        {article.related.map((rel) => (
                                            <ActionLink 
                                                key={rel.id}
                                                title={rel.title}
                                                description="Consulter ce guide pratique"
                                                to={`/help-center/article/${rel.id}`}
                                                icon={<Info size={24} />}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* FEEDBACK & ENGAGEMENT GRID */}
                            <section className="mt-40 grid grid-cols-1 md:grid-cols-2 bg-[var(--border)] gap-px border border-[var(--border)] overflow-hidden shadow-2xl">
                                <div className="bg-[var(--surface)] p-16 text-center md:text-left space-y-8 min-h-[400px] flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        {feedbackStatus === 'idle' && (
                                            <motion.div 
                                                key="idle"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="space-y-8"
                                            >
                                                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center mx-auto md:mx-0">
                                                    <ThumbsUp size={24} />
                                                </div>
                                                <h4 className="text-3xl font-black uppercase tracking-tighter">Article Utile ?</h4>
                                                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                                    <button 
                                                        onClick={() => handleFeedback(true)}
                                                        className="flex items-center gap-4 px-12 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl cursor-pointer"
                                                    >
                                                        <ThumbsUp size={18} /> Oui
                                                    </button>
                                                    <button 
                                                        onClick={() => setFeedbackStatus('no')}
                                                        className="flex items-center gap-4 px-12 py-4 bg-[var(--background)] border border-[var(--border)] hover:border-red-500 hover:text-red-500 transition-all font-black uppercase text-xs tracking-widest shadow-xl cursor-pointer"
                                                    >
                                                        <ThumbsDown size={18} /> Non
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {feedbackStatus === 'no' && (
                                            <motion.div 
                                                key="no"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                                className="space-y-6"
                                            >
                                                <h4 className="text-2xl font-black uppercase tracking-tighter text-red-500">Dites-nous pourquoi</h4>
                                                <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">Aidez-nous à améliorer ce guide. Votre retour est anonyme.</p>
                                                <textarea 
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] p-4 font-bold text-sm focus:border-red-500 outline-none h-32 resize-none"
                                                    placeholder="Qu'est-ce qui manquait ?"
                                                    value={feedbackComment}
                                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                                />
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={() => handleFeedback(false, feedbackComment)}
                                                        className="px-8 py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-red-600 transition-colors"
                                                    >
                                                        Envoyer le Feedback
                                                    </button>
                                                    <button 
                                                        onClick={() => setFeedbackStatus('idle')}
                                                        className="px-8 py-4 text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest cursor-pointer"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {(feedbackStatus === 'submitted' || feedbackStatus === 'submitting') && (
                                            <motion.div 
                                                key="submitted"
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                className="text-center md:text-left space-y-4"
                                            >
                                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto md:mx-0 rounded-full">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <h4 className="text-3xl font-black uppercase tracking-tighter text-emerald-500">
                                                    {feedbackStatus === 'submitting' ? 'Envoi...' : 'Merci !'}
                                                </h4>
                                                <p className="font-bold text-[var(--text-muted)] leading-relaxed">
                                                    {feedbackStatus === 'submitting' ? 'Nous enregistrons votre réponse.' : 'Votre précieux retour contribue à rendre Evenia Ticket meilleur pour toute la communauté.'}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="bg-[var(--surface)] p-16 text-center md:text-left space-y-8 flex flex-col justify-center">
                                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center mx-auto md:mx-0">
                                        <Share2 size={24} />
                                    </div>
                                    <h4 className="text-3xl font-black uppercase tracking-tighter">Partager l'aide</h4>
                                    <p className="text-sm font-bold text-[var(--text-muted)]">Aidez vos proches à maîtriser Evenia en partageant cet article.</p>
                                    <div className="flex items-center gap-6 justify-center md:justify-start">
                                        <button className="w-14 h-14 bg-[var(--background)] border border-[var(--border)] hover:border-primary transition-all flex items-center justify-center rounded-full"><Mail size={20} /></button>
                                        <button className="w-14 h-14 bg-[var(--background)] border border-[var(--border)] hover:border-primary transition-all flex items-center justify-center rounded-full"><Smartphone size={20} /></button>
                                        <button className="w-14 h-14 bg-[var(--background)] border border-[var(--border)] hover:border-primary transition-all flex items-center justify-center rounded-full"><ExternalLink size={20} /></button>
                                    </div>
                                </div>
                            </section>

                            {/* FINAL CTA SUPPORT FOOTER */}
                            <section className="mt-20 bg-primary text-white p-20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                                    <LifeBuoy size={240} />
                                </div>
                                <div className="relative z-10 space-y-8 max-w-2xl">
                                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">

                                        Besoin d'une assistance directe ?
                                    </h3>
                                    <p className="text-lg md:text-2xl font-bold text-white/80">
                                        "Evenia Ticket ne vous laisse jamais sans solution. Contactez nos experts dès maintenant."
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                        <Link to="/help-center" className="w-full sm:w-auto bg-white text-primary px-16 py-6 font-black uppercase tracking-widest text-sm hover:scale-105 shadow-2xl transition-all flex items-center justify-center gap-4">
                                            <MessageCircle size={20} /> Ouvrir un Ticket
                                        </Link>
                                        <a href="mailto:support@evenia.ticket" className="w-full sm:w-auto bg-transparent border-2 border-white px-16 py-6 font-black uppercase tracking-widest text-sm hover:bg-white hover:text-primary transition-all flex items-center justify-center">
                                            Support Email
                                        </a>
                                    </div>
                                </div>
                            </section>

                        </main>
                    </div>
                </div>
            </div>

            {/* SMOOTH SCROLL STYLES */}
            <style dangerouslySetInnerHTML={{ __html: `
                html { scroll-behavior: smooth; }
                .text-glow { text-shadow: 0 0 40px rgba(217,70,239,0.2); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .help-content-root p strong { color: var(--text); font-weight: 900; }
                @media print {
                    aside, section#related-articles, section.support-footer { display: none; }
                    main { width: 100%; border: none !important; }
                }
            `}} />
        </>
    );
};

export default HelpArticleDetailPage;
