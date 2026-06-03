import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, HelpCircle, Ticket, Wallet, UserCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQPage: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const questions = [
        {
            category: "Général",
            icon: <HelpCircle size={18} />,
            items: [
                { q: "Qu'est-ce qu'Evenia Ticket ?", a: "Evenia Ticket est la plateforme leader au Cameroun pour l'achat et la vente de billets d'événements (Concerts, Matchs, Cinéma, Baptêmes). Nous simplifions l'accès à la culture et aux loisirs via une solution 100% digitale." },
                { q: "Comment acheter un ticket ?", a: "C'est simple : choisissez votre événement, sélectionnez le type de ticket, payez via Mobile Money (Orange ou MTN) ou carte bancaire, et recevez instantanément votre ticket par email et sur votre compte Evenia." }
            ]
        },
        {
            category: "Paiements",
            icon: <Wallet size={18} />,
            items: [
                { q: "Quels sont les modes de paiement acceptés ?", a: "Nous acceptons Orange Money, MTN MoMo, Wave (selon pays), et les cartes bancaires Visa/Mastercard via nos processeurs sécurisés." },
                { q: "Le paiement est-il sécurisé ?", a: "Absolument. Toutes les transactions sont cryptées et nous ne stockons aucune information bancaire sur nos serveurs. Vous recevez un reçu pour chaque achat." }
            ]
        },
        {
            category: "Mon Ticket",
            icon: <Ticket size={18} />,
            items: [
                { q: "J'ai perdu mon ticket, que faire ?", a: "Pas de panique ! Connectez-vous à votre compte Evenia Ticket et allez dans 'Mes Tickets'. Vous pouvez le retélécharger à tout moment. Si vous n'avez pas de compte, vérifiez vos emails (courriers indésirables inclus)." },
                { q: "Dois-je imprimer mon ticket ?", a: "Non, c'est l'avantage Evenia ! Présentez simplement le QR code sur votre téléphone à l'entrée de l'événement pour être scanné." }
            ]
        },
        {
            category: "Organisateurs",
            icon: <UserCircle size={18} />,
            items: [
                { q: "Comment vendre des tickets pour mon événement ?", a: "Inscrivez-vous en tant qu'Organisateur sur la plateforme, créez votre événement, définissez vos prix et commencez à vendre en moins de 5 minutes." },
                { q: "Quels sont les frais de service (Commissions) ?", a: "Evenia applique une commission dégressive sur chaque billet pour assurer la maintenance et la sécurité :\n\n• 10 - 9,999 FCFA : 5%\n• 10,000 - 24,000 FCFA : 4%\n• 25,000 FCFA et plus : 3.5%" }
            ]
        }
    ];

    const toggle = (idx: number) => {
        setActiveIndex(activeIndex === idx ? null : idx);
    };

    let itemCounter = 0;

    return (
        <div className="min-h-screen bg-[var(--background)] py-20 pb-40">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-24 text-center">
                    <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">
                        Des questions ? <br /><span className="text-primary tracking-normal not-italic underline decoration-4 underline-offset-8">On a les réponses.</span>
                    </h1>
                    <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto">
                        Tout ce que vous devez savoir sur le fonctionnement d'Evenia Ticket.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-16">
                    {questions.map((category, catIdx) => (
                        <div key={catIdx} className="space-y-6">
                            <div className="flex items-center gap-3 border-b-2 border-primary w-fit pb-2">
                                <span className="text-primary">{category.icon}</span>
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">{category.category}</h2>
                            </div>

                            <div className="space-y-4">
                                {category.items.map((item, itemIdx) => {
                                    const index = itemCounter++;
                                    const isOpen = activeIndex === index;

                                    return (
                                        <div
                                            key={index}
                                            className={`transition-all duration-300 border-2 ${isOpen ? 'border-primary bg-[var(--surface)]' : 'border-[var(--border)] hover:border-primary/50 bg-[var(--surface)]/50'}`}
                                        >
                                            <button
                                                onClick={() => toggle(index)}
                                                className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
                                            >
                                                <span className={`text-lg sm:text-xl font-black uppercase tracking-tight ${isOpen ? 'text-primary' : 'text-[var(--text)]'}`}>
                                                    {item.q}
                                                </span>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-none border-2 flex items-center justify-center transition-all ${isOpen ? 'bg-primary border-primary text-white rotate-180' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                                                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 sm:px-8 pb-8 pt-2">
                                                            <div className="p-6 bg-[var(--background)] border-l-4 border-primary">
                                                                <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed whitespace-pre-line">
                                                                    {item.a}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-32 p-10 sm:p-16 border-4 border-dashed border-[var(--border)] text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--background)] px-6">
                        <Settings className="text-primary w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Toujours bloqué ?</h3>
                    <p className="text-lg text-[var(--text-muted)] mb-8 font-medium">
                        Si vous n'avez pas trouvé de réponse, notre support en direct est prêt à vous aider.
                    </p>
                    <Link to="/help-center" className="inline-block px-10 py-4 bg-primary text-white font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
                        Accéder au support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
