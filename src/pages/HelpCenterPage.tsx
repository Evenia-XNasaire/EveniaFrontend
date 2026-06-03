import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Search, ChevronRight, Send, HelpCircle, Book, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HELP_DATA } from './HelpCategoryPage';

const HelpCenterPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    // Flatten all articles for searching
    const allArticles = Object.entries(HELP_DATA).flatMap(([catId, cat]) =>
        cat.articles.map(art => ({
            ...art,
            categoryId: catId,
            categoryTitle: cat.title
        }))
    );

    const filteredArticles = searchQuery.trim() === ''
        ? []
        : allArticles.filter(art =>
            art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logique d'envoi simulée
        alert("Merci ! Votre message a été envoyé à Evenia Ticket. Nous vous répondrons sous 24h.");
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const categories = [
        { id: 'billetterie', icon: <CreditCard className="text-primary" />, title: "Billetterie & Paiement", desc: "Questions sur l'achat, les modes de paiement et les tickets." },
        { id: 'securite', icon: <ShieldCheck className="text-primary" />, title: "Compte & Sécurité", desc: "Gérer votre profil, mot de passe et données personnelles." },
        { id: 'organisateur', icon: <Book className="text-primary" />, title: "Guide Organisateur", desc: "Comment créer et gérer vos propres événements sur Evenia." },
        { id: 'autre', icon: <HelpCircle className="text-primary" />, title: "Autres questions", desc: "Besoin d'autre chose ? Nous sommes là pour vous aider." },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] py-5">
            {/* Header / Hero */}
            <div className="bg-[var(--surface)] border-y border-[var(--border)] py-20 mb-20 text-center relative">
                {/* Background Blurs Wrapper */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-none -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-3xl rounded-none -ml-32 -mb-32" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">Centre d'aide <span className="text-primary">Evenia</span></h1>
                    <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 font-medium">
                        Trouvez des réponses instantanées ou contactez notre équipe de support dédiée.
                    </p>

                    {/* Search Section */}
                    <div className="max-w-xl mx-auto relative group z-50">
                        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-all ${isSearchFocused ? 'text-primary scale-110' : 'text-[var(--text-muted)]'}`} size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une solution... (ex: ticket, paiement)"
                            className="w-full pl-16 pr-6 py-5 bg-[var(--background)] border border-[var(--border)] font-bold text-lg focus:outline-none focus:border-primary transition-all rounded-none shadow-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow clicks on results
                        />

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {(isSearchFocused && searchQuery.trim() !== '') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-[var(--surface)] border border-[var(--border)] shadow-2xl max-h-[400px] overflow-y-auto z-50 text-left scrollbar-hide"
                                >
                                    {filteredArticles.length > 0 ? (
                                        <div className="flex flex-col">
                                            <div className="p-4 bg-primary/5 border-b border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-primary italic">
                                                {filteredArticles.length} résultat(s) trouvé(s)
                                            </div>
                                            {filteredArticles.map((art) => (
                                                <Link
                                                    key={art.id}
                                                    to={`/help-center/article/${art.id}`}
                                                    className="p-6 border-b border-[var(--border)] hover:bg-primary/5 transition-colors group last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-primary transition-colors">
                                                                {art.categoryTitle}
                                                            </div>
                                                            <h4 className="text-sm font-black uppercase group-hover:text-primary transition-colors">
                                                                {art.title}
                                                            </h4>
                                                        </div>
                                                        <ChevronRight size={16} className="text-[var(--border)] group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center space-y-4">
                                            <div className="w-12 h-12 bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                                                <HelpCircle size={24} />
                                            </div>
                                            <p className="font-bold text-[var(--text-muted)]">Aucun article trouvé pour "{searchQuery}"</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6">
                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {categories.map((cat, idx) => (
                        <Link to={`/help-center/${cat.id}`} key={idx}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[var(--surface)] p-8 border border-[var(--border)] hover:border-primary transition-all group cursor-pointer h-full"
                            >
                                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 mb-6 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{cat.title}</h3>
                                <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-6">{cat.desc}</p>
                                <span className="text-primary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                    Voir les articles <ChevronRight size={16} />
                                </span>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Contact Form & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    {/* Left: Info */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tighter uppercase leading-none">Vous ne trouvez pas <br /><span className="text-primary">une réponse ?</span></h2>
                            <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed">
                                Notre équipe est disponible du lundi au dimanche, 24h/24 pour répondre à toutes vos préoccupations.
                                Que ce soit pour un ticket perdu ou un problème de paiement, nous sommes là.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-6 p-6 bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-primary">
                                <div className="w-12 h-12 flex items-center justify-center bg-primary text-white">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Email Support</p>
                                    <p className="text-xl font-black">support@evenia.ticket</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-green-500">
                                <div className="w-12 h-12 flex items-center justify-center bg-green-500 text-white">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">WhatsApp Direct</p>
                                    <p className="text-xl font-black">+237 686 013 300</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-[var(--surface)] p-8 sm:p-12 border border-[var(--border)] shadow-2xl relative">
                        <div className="absolute -top-4 -right-4 bg-primary text-white p-4 font-black text-xs uppercase tracking-widest -rotate-3">
                            Direct Message
                        </div>
                        <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Envoyez-nous un message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Votre Nom</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] px-4 py-4 focus:outline-none focus:border-primary font-bold rounded-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Votre Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] px-4 py-4 focus:outline-none focus:border-primary font-bold rounded-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Sujet</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] px-4 py-4 focus:outline-none focus:border-primary font-bold rounded-none"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Votre Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] px-4 py-4 focus:outline-none focus:border-primary font-bold rounded-none resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
                            >
                                Envoyer le message <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
