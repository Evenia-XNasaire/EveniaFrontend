import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Calendar, MapPin, Search, ChevronRight, Filter, Sparkles, Music, ChevronLeft, Facebook, CheckCircle, PlusCircle, Bell, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import ReactionButton from '../components/ReactionButton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
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
            image: image1,
            tag: "Fini la galère",
            title: "Fini les longues files",
            highlight: "d'attente.",
            description: "Achetez vos tickets instantanément sans vous déplacer. Gagnez du temps et soyez sûr d'avoir votre place pour l'événement.",
        },
        {
            image: image2,
            tag: "Paiement Rapide",
            title: "Paiement en ligne via",
            highlight: "Mobile Money.",
            description: "Réglez vos achats en toute sécurité avec Orange Money, MTN Mobile Money ou par carte bancaire. Le confort à portée de main.",
        },
        {
            image: image3,
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
    }, [HERO_SLIDES.length]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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
        <div className="min-h-screen bg-[var(--background)] pb-20">
            {/* Hero Section (Ultra-Stable) */}
            <section className="relative h-[85vh] sm:h-[95vh] flex items-center overflow-hidden bg-slate-900 w-full">
                <div className="absolute inset-0 z-0">
                    {HERO_SLIDES.map((slide, idx) => (
                        <div
                            key={idx}
                            style={{
                                backgroundImage: `url(${slide.image})`,
                                opacity: idx === heroImageIndex ? 1 : 0,
                                transition: 'opacity 1.5s ease-in-out'
                            }}
                            className="absolute inset-0 bg-cover bg-center"
                        />
                    ))}
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-20">
                    <div className="max-w-3xl relative min-h-[350px] flex items-center">
                        {HERO_SLIDES.map((slide, idx) => (
                            <div
                                key={idx}
                                className={`transition-all duration-1000 w-full ${idx === heroImageIndex 
                                    ? 'opacity-100 translate-y-0 relative' 
                                    : 'opacity-0 translate-y-10 absolute inset-0 pointer-events-none'
                                }`}
                            >
                                <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-none border border-primary/30 mb-6 w-fit">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary">
                                        {slide.tag}
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-7xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-6">
                                    {slide.title} <br />
                                    <span className="text-primary">{slide.highlight}</span>
                                </h1>
                                <p className="text-base sm:text-xl text-white/90 leading-relaxed font-medium max-w-2xl mb-8">
                                    {slide.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <a href="#explore" className="btn-primary py-4 px-8 rounded-none text-base font-black shadow-2xl shadow-primary/40 flex items-center gap-2">
                                        Explorer les événements <ChevronRight size={20} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-10 left-4 sm:left-6 md:left-12 flex gap-3 z-30">
                        {HERO_SLIDES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setHeroImageIndex(idx)}
                                className={`h-1.5 transition-all duration-500 rounded-none ${idx === heroImageIndex ? 'w-12 bg-primary' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Barre de Recherche et Filtres */}
            <div id="explore" className="container mx-auto px-4 sm:px-6 md:px-12 -mt-10 relative z-30">
                <div className="bg-[var(--surface)] p-2 sm:p-3 rounded-none shadow-2xl border border-[var(--border)] flex flex-col md:flex-row items-center gap-2 sm:gap-3">
                    <div className="flex-1 w-full relative md:border-r border-[var(--border)] pr-3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un événement..."
                            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-transparent font-bold text-base sm:text-lg focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-auto relative px-3 md:border-r border-[var(--border)]">
                        <select
                            className="w-full bg-transparent font-bold py-3 sm:py-4 text-xs sm:text-base focus:outline-none appearance-none pr-10 cursor-pointer uppercase tracking-widest"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Toutes catégories</option>
                            <option value="concert">Concert</option>
                            <option value="match">Match / Sport</option>
                            <option value="cinema">Cinéma</option>
                            <option value="conference">Conférence</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                    <div className="w-full md:w-auto relative px-3">
                        <select
                            className="w-full bg-transparent font-bold py-3 sm:py-4 text-xs sm:text-base focus:outline-none appearance-none pr-10 cursor-pointer uppercase tracking-widest"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        >
                            <option value="">Toutes dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="tomorrow">Demain</option>
                            <option value="this_week">Cette semaine</option>
                        </select>
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Grille d'événements */}
            <section className="py-24 container mx-auto px-4 sm:px-6 md:px-12">
                <div className="flex justify-between items-end mb-12">
                    <div className="space-y-2">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs">Découvrir</span>
                        <h2 className="text-3xl sm:text-5xl font-black">Prochains Événements</h2>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/3] bg-[var(--surface)] animate-pulse rounded-none border border-[var(--border)]" />
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
                        {events.map((event: Event, index: number) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-[var(--surface)] rounded-none border border-[var(--border)] overflow-hidden hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Link to={`/events/${event.id}`} className="block w-full h-full">
                                        <img
                                            src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </Link>
                                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                                        <a href={`https://wa.me/?text=${encodeURIComponent(event.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                                            <FaWhatsapp size={14} />
                                        </a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                                            <Facebook size={14} />
                                        </a>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                                            {event.category}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-4">
                                        <ReactionButton
                                            eventId={event.id}
                                            userReactions={event.user_reactions || []}
                                            reactionsCounts={event.reactions_counts || {}}
                                            onReact={(type) => markAsLikedMutation.mutate({ eventId: event.id, type })}
                                        />
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8 space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                        <Calendar size={14} />
                                        {format(new Date(event.date_time), 'EEEE dd MMMM yyyy HH:mm', { locale: fr })}
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black group-hover:text-primary transition-colors line-clamp-1">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold text-sm">
                                        <MapPin size={16} className="text-primary" />
                                        {event.location}
                                    </div>
                                    <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                                        <p className="text-xl font-black text-primary">{event.ticket_types[0]?.price?.toLocaleString() || 0} FCFA</p>
                                        <Link to={`/events/${event.id}`} className="px-6 py-3 bg-[var(--text)] text-[var(--background)] font-black text-sm hover:bg-primary hover:text-white transition-all">
                                            RÉSERVER
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[var(--surface)] border border-dashed border-[var(--border)]">
                        <Music className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
                        <p className="text-xl font-bold">Aucun événement trouvé.</p>
                    </div>
                )}

                {eventsData && eventsData.last_page > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-16">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 border border-[var(--border)] disabled:opacity-30 hover:bg-primary hover:text-white transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold">Page {page} sur {eventsData.last_page}</span>
                        <button onClick={() => setPage(p => Math.min(eventsData.last_page, p + 1))} disabled={page === eventsData.last_page} className="p-3 border border-[var(--border)] disabled:opacity-30 hover:bg-primary hover:text-white transition-all">
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
