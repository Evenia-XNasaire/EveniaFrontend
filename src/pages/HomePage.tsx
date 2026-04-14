import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Calendar, MapPin, Search, ChevronRight, Filter, Sparkles, Heart, Music, ChevronLeft, Share2, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import ReactionButton from '../components/ReactionButton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import MobileWebAppSection from '../components/home/MobileWebAppSection';
import ServicesSection from '../components/home/ServicesSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import PartnersSection from '../components/home/PartnersSection';

import image1 from '../assets/images/image1.png';
import image2 from '../assets/images/image2.png';
import image3 from '../assets/images/image3.png';

interface Event {
    id: number;
    title: string;
    description: string;
    category: string;
    date_time: string;
    end_date?: string;
    event_status?: string;
    location: string;
    image_url: string | null;
    ticket_types: any[];
    is_liked: boolean;
    user_reaction: string | null;
    likes_count?: number;
    user_reactions?: string[];
    reactions_counts?: Record<string, number>;
}

interface PaginatedResponse {
    current_page: number;
    data: Event[];
    last_page: number;
    total: number;
}

const HomePage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState(() => localStorage.getItem('evenia_filterCategory') || '');
    const [filterDate, setFilterDate] = useState(() => localStorage.getItem('evenia_filterDate') || '');
    const queryClient = useQueryClient();

    const [heroImageIndex, setHeroImageIndex] = useState(0);

    const HERO_SLIDES = [
        {
            image: image1, // Crowd waiting
            tag: "Fini la galère",
            title: "Fini les longues files",
            highlight: "d'attente.",
            description: "Achetez vos tickets instantanément sans vous déplacer. Gagnez du temps et soyez sûr d'avoir votre place pour l'événement.",
        },
        {
            image: image2, // Mobile Money
            tag: "Paiement Rapide",
            title: "Paiement en ligne via",
            highlight: "Mobile Money.",
            description: "Réglez vos achats en toute sécurité avec Orange Money, MTN Mobile Money ou par carte bancaire. Le confort à portée de main.",
        },
        {
            image: image3, // Happy event
            tag: "Accès Simplifié",
            title: "Accédez sans stress aux",
            highlight: "événements.",
            description: "Un simple scan de votre ticket digital à l'entrée suffit. Plus besoin de billets physiques, tout est dans votre téléphone.",
        }
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Debounce search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page and save to localStorage when filters change
    React.useEffect(() => {
        localStorage.setItem('evenia_filterCategory', filterCategory);
        localStorage.setItem('evenia_filterDate', filterDate);
        setPage(1);
    }, [filterCategory, filterDate]);

    const { data: eventsData, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ['events', page, debouncedSearch, filterCategory, filterDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            params.append('category', filterCategory || 'evenia');
            if (filterDate) params.append('date', filterDate);

            const response = await api.get(`/events?${params.toString()}`);
            return response.data;
        },
    });

    const markAsLikedMutation = useMutation({
        mutationFn: ({ eventId, type }: { eventId: number; type?: string }) =>
            api.post(`/events/${eventId}/like`, { type }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const events = eventsData?.data || [];

    return (
        <div className="min-h-screen bg-[var(--background)] space-y-12 sm:space-y-24 pb-20">
            {/* Hero Section */}
            <section className="relative h-[85vh] sm:h-[95vh] flex items-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="popLayout">
                        <motion.img
                            key={heroImageIndex}
                            src={HERO_SLIDES[heroImageIndex].image}
                            alt="Evenia Ticket Hero"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-full h-full object-cover absolute inset-0"
                        />
                    </AnimatePresence>
                    {/* Un léger dégradé noir sur le côté gauche uniquement pour garantir la lisibilité du texte, sans brouiller l'ensemble de l'image */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroImageIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="max-w-3xl space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/30 shadow-lg">
                                <Sparkles size={14} />
                                {HERO_SLIDES[heroImageIndex].tag}
                            </div>

                            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-white drop-shadow-xl">
                                {HERO_SLIDES[heroImageIndex].title} <br />
                                <span className="text-primary drop-shadow-lg">{HERO_SLIDES[heroImageIndex].highlight}</span>
                            </h1>

                            <p className="text-base sm:text-xl text-white/90 max-w-xl leading-relaxed drop-shadow-lg font-medium">
                                {HERO_SLIDES[heroImageIndex].description}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <a href="#explore" className="btn-primary flex items-center gap-2 px-8 py-4">
                                    Explorer les événements <ChevronRight size={20} />
                                </a>
                                {/* Indicators */}
                                <div className="hidden sm:flex items-center gap-3 ml-8">
                                    {HERO_SLIDES.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setHeroImageIndex(idx)}
                                            className={`h-2 rounded-full transition-all duration-500 ${idx === heroImageIndex ? 'w-8 bg-primary' : 'w-2 bg-[var(--border)] hover:bg-[var(--text-muted)]'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Search Bar and Filters */}
            <div id="explore" className="container mx-auto px-6 md:px-12 -mt-10 relative z-20">
                <div className="bg-[var(--surface)] p-3 rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full relative md:border-r border-[var(--border)] pr-3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un artiste, une ville..."
                            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-transparent font-bold text-base sm:text-lg focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filtre Catégorie */}
                    <div className="w-full md:w-auto relative px-3 md:border-r border-[var(--border)]">
                        <select
                            className="w-full bg-transparent font-bold py-3 sm:py-4 text-sm sm:text-base focus:outline-none appearance-none pr-10 cursor-pointer"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Toutes les catégories</option>
                            <option value="concert">Concert</option>
                            <option value="match">Match / Sport</option>
                            <option value="cinema">Cinéma</option>
                            <option value="bapteme">Baptême</option>
                            <option value="anniversaire">Anniversaire</option>
                            <option value="conference">Conférence</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
                    </div>
                    {/* Filtre Date */}
                    <div className="w-full md:w-auto relative px-3">
                        <select
                            className="w-full bg-transparent font-bold py-3 sm:py-4 text-sm sm:text-base focus:outline-none appearance-none pr-10 cursor-pointer"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        >
                            <option value="">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="tomorrow">Demain</option>
                            <option value="this_week">Cette semaine</option>
                            <option value="this_month">Ce mois</option>
                        </select>
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <section className="pt-4 pb-12 sm:pb-24 container mx-auto px-2 sm:px-6 md:px-12">
                <div className="flex justify-between items-end mb-6 sm:mb-8 px-2">
                    <div className="space-y-1 sm:space-y-2">
                        <span className="text-primary font-bold uppercase tracking-widest text-[10px] sm:text-xs">Au programme</span>
                        <h2 className="text-2xl sm:text-4xl font-black">Prochains Événements</h2>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] transition-all cursor-pointer">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/3] bg-[var(--surface)] animate-pulse rounded-2xl sm:rounded-3xl" />
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-12">
                        {events.map((event: Event, index: number) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-[var(--surface)] rounded-2xl sm:rounded-3xl border border-[var(--border)] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Link to={`/events/${event.id}`} className="block w-full h-full">
                                        <img
                                            src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </Link>
                                    
                                    {/* Share Buttons en haut à droite */}
                                    <div className="absolute top-4 right-4 flex gap-3 items-center pointer-events-auto z-10">
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Regarde cet événement sur Evenia Ticket : ${event.title} ${window.location.host}/events/${event.id}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-full bg-green-500 text-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Partager sur WhatsApp"
                                        >
                                            <FaWhatsapp size={14} />
                                        </a>
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.host}/events/${event.id}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Partager sur Facebook"
                                        >
                                            <Facebook size={14} />
                                        </a>
                                    </div>

                                    {/* Reactions en bas à droite */}
                                    <div className="absolute bottom-4 right-4 flex flex-col items-end pointer-events-auto z-10">
                                        <ReactionButton
                                            eventId={event.id}
                                            userReactions={event.user_reactions || []}
                                            reactionsCounts={event.reactions_counts || {}}
                                            onReact={(type) => markAsLikedMutation.mutate({ eventId: event.id, type })}
                                        />
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                        <div className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                                            {event.category}
                                        </div>
                                        {event.event_status === 'Passé' && (
                                            <div className="px-3 py-1 bg-danger text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                                                Terminé
                                            </div>
                                        )}
                                        {event.event_status === 'En cours' && (
                                            <div className="px-3 py-1 bg-success text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                                                En cours
                                            </div>
                                        )}
                                        {event.event_status === 'À venir' && (
                                            <div className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                                                À venir
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                            <Calendar size={14} />
                                            {event.end_date ? 'Du ' : ''}{format(new Date(event.date_time), 'EEEE dd MMMM yyyy HH:mm', { locale: fr })}
                                        </div>
                                        {event.end_date && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest">
                                                <Calendar size={14} />
                                                Au {format(new Date(event.end_date), 'EEEE dd MMMM yyyy HH:mm', { locale: fr })}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-black leading-tight group-hover:text-primary transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold">
                                        <MapPin size={16} className="text-primary" />
                                        {event.location}
                                    </div>

                                    <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">À partir de</p>
                                            <p className="text-xl font-black text-primary">{event.ticket_types[0]?.price.toLocaleString()} FCFA</p>
                                        </div>
                                        <Link to={`/events/${event.id}`} className="px-6 py-3 bg-[var(--text)] text-[var(--background)] rounded-xl font-black text-sm hover:bg-primary hover:text-white transition-all shadow-md">
                                            RÉSERVER
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[var(--surface)] rounded-3xl border border-dashed border-[var(--border)]">
                        <Music className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
                        <p className="text-xl font-bold">Aucun événement trouvé.</p>
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-primary font-black hover:underline">Voir tout</button>
                    </div>
                )}

                {/* Pagination */}
                {eventsData && eventsData.last_page > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-16">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-3 rounded-xl border border-[var(--border)] disabled:opacity-30 hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold">Page {page} sur {eventsData.last_page}</span>
                        <button
                            onClick={() => setPage(p => Math.min(eventsData.last_page, p + 1))}
                            disabled={page === eventsData.last_page}
                            className="p-3 rounded-xl border border-[var(--border)] disabled:opacity-30 hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </section>

            <ServicesSection />
            <HowItWorksSection />
            <PartnersSection />
            <MobileWebAppSection />
        </div>
    );
};

export default HomePage;
