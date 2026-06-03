import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, BookOpen, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const HELP_DATA = {
    billetterie: {
        title: "Billetterie & Paiement",
        articles: [
            { id: "achat-billet", title: "Comment acheter un billet ?", readTime: "3 min" },
            { id: "paiement-echoue", title: "Mon paiement a échoué, que faire ?", readTime: "4 min" },
            { id: "ticket-non-recu", title: "Je n'ai pas reçu mon ticket par email", readTime: "2 min" },
            { id: "remboursement", title: "Politique de remboursement Evenia", readTime: "5 min" },
            { id: "moyens-paiement", title: "Quels sont les moyens de paiement ?", readTime: "2 min" },
        ]
    },
    securite: {
        title: "Compte & Sécurité",
        articles: [
            { id: "changer-mdp", title: "Comment changer mon mot de passe ?", readTime: "2 min" },
            { id: "supprimer-compte", title: "Supprimer définitivement mon compte", readTime: "3 min" },
            { id: "double-auth", title: "Activer la double authentification (2FA)", readTime: "5 min" },
            { id: "donnees-perso", title: "Comment Evenia protège mes données ?", readTime: "4 min" },
        ]
    },
    organisateur: {
        title: "Guide Organisateur",
        articles: [
            { id: "creer-evenement", title: "Créer mon premier événement", readTime: "6 min" },
            { id: "gerer-ventes", title: "Gérer mes ventes en temps réel", readTime: "4 min" },
            { id: "retirer-fonds", title: "Comment retirer mes gains (Wallet) ?", readTime: "3 min" },
            { id: "ajouter-staff", title: "Ajouter des agents de scan", readTime: "4 min" },
            { id: "stats-ventes", title: "Comprendre mes statistiques", readTime: "5 min" },
        ]
    },
    autre: {
        title: "Autres questions",
        articles: [
            { id: "devenir-partenaire", title: "Devenir partenaire Evenia", readTime: "3 min" },
            { id: "signaler-bug", title: "Signaler un bug technique", readTime: "2 min" },
            { id: "contacter-direction", title: "Contacter la direction", readTime: "3 min" },
        ]
    }
};

const HelpCategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const data = HELP_DATA[categoryId as keyof typeof HELP_DATA];

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div>
                <h1 className="text-4xl font-black mb-4">Catégorie non trouvée</h1>
                <Link to="/help-center" className="text-primary font-bold underline">Retour au centre d'aide</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--background)] py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Breadcrumbs */}
                <div className="mb-12">
                    <Link to="/help-center" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-primary font-bold transition-colors uppercase text-xs tracking-widest">
                        <ArrowLeft size={16} /> Centre d'aide
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                            <BookOpen size={20} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
                            {data.title}
                        </h1>
                    </div>
                    <p className="text-xl text-[var(--text-muted)] font-medium">
                        {data.articles.length} articles pour vous aider à maîtriser cet aspect.
                    </p>
                </div>

                {/* Articles List */}
                <div className="grid grid-cols-1 gap-6">
                    {data.articles.map((article, idx) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link 
                                to={`/help-center/article/${article.id}`}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-[var(--surface)] border border-[var(--border)] hover:border-primary transition-all shadow-xl"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-[var(--background)] border border-[var(--border)] group-hover:bg-primary group-hover:text-white transition-all">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={24} className="text-primary" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Help */}
                <div className="mt-32 p-12 bg-[var(--surface)] border-l-8 border-primary shadow-2xl">
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Besoin d'autre chose ?</h3>
                    <p className="text-lg text-[var(--text-muted)] mb-8 font-medium leading-relaxed">
                        Si ces articles ne répondent pas à votre question, vous pouvez toujours nous envoyer un message direct via le formulaire.
                    </p>
                    <Link to="/help-center" className="text-primary font-black uppercase tracking-widest text-sm hover:underline flex items-center gap-2">
                        Retourner au formulaire de contact <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCategoryPage;
