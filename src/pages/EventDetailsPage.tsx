import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { BASE_URL } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, Users, Clock, Tag, Ticket,
    Loader2, AlertCircle, CheckCircle2, Minus, Plus,
    ArrowLeft, Share2, Heart, Info, Smartphone, ThumbsUp, Facebook,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import ReactionButton from '../components/ReactionButton';

interface TicketTypeData {
    id: number;
    name: string;
    price: number;
    quantity_available: number;
    benefits: string | null;
}

interface CommentData {
    id: number;
    content: string;
    created_at: string;
    user: {
        first_name: string;
        last_name: string;
    };
}

interface EventData {
    id: number;
    title: string;
    description: string;
    category: string;
    date_time: string;
    location: string;
    image_path: string | null;
    image_url: string | null;
    status: string;
    event_status: string;
    organizer: {
        id: number;
        first_name: string;
        last_name: string;
    };
    ticket_types: TicketTypeData[];
    likes_count: number;
    is_liked: boolean;
    user_reaction: string | null;
    user_reactions?: string[];
    reactions_counts?: Record<string, number>;
    comments: CommentData[];
    end_date: string | null;
    additional_image_urls?: string[];
}

const EventDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});

    const calculateServiceFee = (price: number) => {
        if (price >= 10 && price <= 9999) return { fee: Math.round(price * 0.05), label: '5%' };
        if (price >= 10000 && price <= 24000) return { fee: Math.round(price * 0.04), label: '4%' };
        if (price >= 25000) return { fee: Math.round(price * 0.035), label: '3.5%' };
        return { fee: 0, label: '0%' };
    };

    // Scroll to top of the page on load
    React.useEffect(() => {
        window.scrollTo(0, 0);

        // Restore saved tickets if we just logged in
        if (user) {
            const saved = sessionStorage.getItem('savedTickets');
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (saved && redirectPath === `/events/${id}`) {
                try {
                    setSelectedTickets(JSON.parse(saved));
                } catch (e) { }
                sessionStorage.removeItem('savedTickets');
            }
        }
    }, [id, user]);
    const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange_money' | 'card'>('mtn');
    const [paymentPhone, setPaymentPhone] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');
    const [localWaitingError, setLocalWaitingError] = useState<string | null>(null);

    const { data: event, isLoading, error } = useQuery<EventData>({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/events/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    const allImages = React.useMemo(() => {
        if (!event) return [];
        const images = [];
        if (event.image_url) images.push(event.image_url);
        if (event.additional_image_urls && event.additional_image_urls.length > 0) {
            images.push(...event.additional_image_urls);
        }
        return images;
    }, [event]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    React.useEffect(() => {
        if (allImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [allImages.length]);

    const purchaseMutation = useMutation({
        mutationFn: async (payload: { items: { ticket_type_id: number; quantity: number }[]; operator: string; phone_number: string }) => {
            const response = await api.post('/payments/initiate-direct', payload);
            return response.data;
        },
        onSuccess: (data) => {
            setIsWaitingForPayment(true);
            setPollingStatus('waiting');
            setLocalWaitingError(null);
            setActiveTransactionId(data.transaction_id);
            setPurchaseError(null);
            // Don't clear selected tickets yet to allow retry if something fails later
        },
        onError: (error: any) => {
            console.error('Purchase error:', error);

            // Extract the most specific error message possible
            let msg = "Le service de paiement a rencontré un problème. Vérifiez votre numéro ou l'opérateur.";

            if (error.response?.data) {
                // Check deeply nested AangaraaPay error structure first
                // Structure: { details: { data: { message: "60019 :: Le solde..." } } }
                const deepMessage = error.response.data.details?.data?.message;
                const directMessage = error.response.data.message;
                const detailMessage = error.response.data.detail?.[0]?.msg;

                if (deepMessage) {
                    msg = deepMessage;
                    // Remove error codes like "60019 :: " for cleaner display if present
                    if (msg.includes('::')) {
                        msg = msg.split('::')[1].trim();
                    }
                } else if (directMessage && directMessage !== "Payment request failed") {
                    msg = directMessage;
                } else if (detailMessage) {
                    msg = detailMessage;
                }
            }

            setPurchaseError(msg);
            setIsWaitingForPayment(false);
        }
    });

    const likeMutation = useMutation({
        mutationFn: async ({ type }: { type?: string }) => {
            const response = await api.post(`/events/${id}/like`, { type });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', id] });
        }
    });

    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await api.post(`/events/${id}/comment`, { content });
            return response.data;
        },
        onSuccess: () => {
            setCommentContent('');
            queryClient.invalidateQueries({ queryKey: ['event', id] });
        }
    });

    const handleShare = () => {
        if (!event) return;
        const shareUrl = window.location.href;
        const shareText = `Découvrez cet événement sur Evenia Ticket : ${event.title}\n📅 ${format(new Date(event.date_time), 'd MMMM yyyy HH:mm', { locale: fr })}\n📍 ${event.location}\n\nRéservez vos places ici : ${shareUrl}`;

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: shareText,
                url: shareUrl,
            }).catch(console.error);
        } else {
            // Fallback: Copy to clipboard or direct social links
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    // Polling for payment status
    const checkPaymentStatus = React.useCallback(async () => {
        if (!activeTransactionId) return;
        try {
            const response = await api.get(`/payments/${activeTransactionId}/status`);
            if (response.data.status === 'completed') {
                setPollingStatus('success');
                setTimeout(() => {
                    setIsWaitingForPayment(false);
                    setActiveTransactionId(null);
                    setSelectedTickets({});
                    navigate('/my-tickets');
                }, 2000);
            } else if (response.data.status === 'failed') {
                setPollingStatus('failed');
                setLocalWaitingError(response.data.reason || "Le paiement a échoué.");
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }, [activeTransactionId, navigate]);

    React.useEffect(() => {
        let interval: any;
        if (isWaitingForPayment && activeTransactionId && pollingStatus === 'waiting') {
            interval = setInterval(checkPaymentStatus, 3000); // Poll every 3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isWaitingForPayment, activeTransactionId, pollingStatus, checkPaymentStatus]);

    const handleQuantityChange = (ticketTypeId: number, delta: number) => {
        setSelectedTickets(prev => {
            const current = prev[ticketTypeId] || 0;
            const newValue = Math.max(0, current + delta);
            if (newValue === 0) {
                const { [ticketTypeId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketTypeId]: newValue };
        });
    };

    const handlePurchase = () => {
        if (!user) {
            sessionStorage.setItem('redirectAfterLogin', `/events/${id}`);
            sessionStorage.setItem('savedTickets', JSON.stringify(selectedTickets));
            navigate('/login');
            return;
        }

        if (!paymentPhone) {
            setPurchaseError("Veuillez entrer votre numéro de téléphone.");
            return;
        }

        setPurchaseError(null);

        const items = Object.entries(selectedTickets)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({
                ticket_type_id: Number(id),
                quantity: qty
            }));

        if (items.length === 0) return;

        const operatorMap: Record<string, string> = {
            'mtn': 'MTN_Cameroon',
            'orange_money': 'Orange_Cameroon',
            'card': 'card'
        };

        purchaseMutation.mutate({
            items,
            operator: operatorMap[paymentMethod],
            phone_number: paymentPhone
        });
    };

    const totalAmountBase = event?.ticket_types.reduce((sum, type) => {
        const qty = selectedTickets[type.id] || 0;
        return sum + (type.price * qty);
    }, 0) || 0;

    const totalServiceFee = event?.ticket_types.reduce((sum, type) => {
        const qty = selectedTickets[type.id] || 0;
        const fee = calculateServiceFee(type.price).fee;
        return sum + (fee * qty);
    }, 0) || 0;

    const totalAmount = totalAmountBase + totalServiceFee;

    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[var(--text-muted)] font-bold animate-pulse">Chargement de l'événement...</p>
                </div>
            </MainLayout>
        );
    }

    if (error || !event) {
        return (
            <MainLayout>
                <div className="card-surface p-12 text-center space-y-4 max-w-2xl mx-auto mt-20">
                    <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black">Événement introuvable ou problème de connexion</h2>
                    <p className="text-[var(--text-muted)]">Ce événement n'existe pas, a été supprimé ou vous rencontrez un problème de connexion internet.</p>
                    <button onClick={() => navigate('/')} className="btn-primary mt-4">
                        Retour aux événements
                    </button>
                </div>
            </MainLayout>
        );
    }

    const eventDate = new Date(event.date_time);
    const imageUrl = event.image_url;

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[var(--text-muted)] hover:text-primary font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Retour aux événements
                </button>

                <AnimatePresence>
                    {isWaitingForPayment && (
                        <motion.div
                            key="payment-modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[3rem] max-w-lg w-full shadow-2xl space-y-8 text-center"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                        <Smartphone size={48} className="text-primary animate-bounce" />
                                    </div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>

                                {pollingStatus === 'waiting' && (
                                    <>
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-black tracking-tight">Validation en cours...</h2>
                                            <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                                                Une demande de paiement a été envoyée au <span className="text-primary font-black">{paymentPhone}</span>.
                                                Veuillez saisir votre code PIN pour finaliser l'achat.
                                            </p>
                                        </div>

                                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                                            <div className="flex items-center gap-3 text-primary font-bold">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>En attente de confirmation...</span>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                Ne fermez pas cette page. Vos billets s'afficheront ici dès validation.
                                            </p>
                                            {paymentMethod === 'mtn' && (
                                                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                                                    <p className="text-xs font-black text-yellow-700">
                                                        💡 Astuce MTN : Si rien ne s'affiche, composez <span className="text-sm underline">*126#</span> sur votre téléphone pour valider manuellement.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {pollingStatus === 'success' && (
                                    <div className="space-y-6">
                                        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
                                            <CheckCircle2 size={64} />
                                        </div>
                                        <h2 className="text-3xl font-black text-success">Paiement Réussi !</h2>
                                        <p className="font-bold text-[var(--text-muted)]">Redirection vers vos billets...</p>
                                    </div>
                                )}

                                {pollingStatus === 'failed' && (
                                    <div className="space-y-6">
                                        <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center mx-auto text-danger">
                                            <Plus size={64} className="rotate-45" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-danger">Échec du paiement</h2>
                                            <p className="font-bold text-[var(--text-muted)]">{localWaitingError}</p>
                                            {localWaitingError === 'NOT_ALLOWED' && (
                                                <p className="text-xs text-danger/70 italic mt-2">
                                                    (Note: Votre compte MTN semble ne pas être autorisé à effectuer des paiements marchands. Vérifiez vos paramètres MoMo ou utilisez un autre numéro.)
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => {
                                                    setPollingStatus('waiting');
                                                    setLocalWaitingError(null);
                                                    checkPaymentStatus();
                                                }}
                                                className="btn-primary w-full py-3"
                                            >
                                                Vérifier à nouveau
                                            </button>
                                            <button
                                                onClick={() => setIsWaitingForPayment(false)}
                                                className="text-sm font-bold text-[var(--text-muted)] hover:text-primary transition-colors py-2"
                                            >
                                                Réessayer avec un autre numéro
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {pollingStatus === 'waiting' && (
                                    <button
                                        onClick={() => {
                                            setIsWaitingForPayment(false);
                                            setSelectedTickets({});
                                        }}
                                        className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-danger transition-colors"
                                    >
                                        Annuler la transaction
                                    </button>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {purchaseError && (
                        <motion.div
                            key="error-popup"
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-xl"
                        >
                            <div className="bg-danger/10 border border-danger/20 text-danger p-6 rounded-[2rem] flex items-center justify-between gap-4 font-bold shadow-2xl backdrop-blur-md mx-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-danger text-white rounded-full flex items-center justify-center shrink-0">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg leading-none mb-1">Erreur de paiement ⚠️</h4>
                                        <p className="text-sm opacity-80 font-medium truncate">{purchaseError}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPurchaseError(null)}
                                    className="p-2 hover:bg-danger/20 rounded-full transition-colors shrink-0"
                                >
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero section with image and key info overlaid */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-[400px] sm:h-[600px] rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl"
                >
                    <AnimatePresence mode="popLayout">
                        {allImages.length > 0 && (
                            <motion.img 
                                key={currentImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                src={allImages[currentImageIndex]} 
                                alt={`${event.title} - Image ${currentImageIndex + 1}`} 
                                className="absolute inset-0 w-full h-full object-cover" 
                            />
                        )}
                    </AnimatePresence>

                    {/* Gallery Navigation Controls */}
                    {allImages.length > 1 && (
                        <>
                            <div className="absolute inset-0 z-30 flex items-center justify-between px-4 pointer-events-none">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                                    }}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all pointer-events-auto shadow-xl"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                                    }}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all pointer-events-auto shadow-xl"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Thumbnails at the bottom of the image area */}
                            <div className="absolute bottom-24 sm:bottom-32 left-0 right-0 z-30 flex justify-center gap-2 sm:gap-4 px-4 overflow-x-auto pb-4 custom-scrollbar lg:mx-auto lg:max-w-4xl">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all transition-transform hover:scale-105 active:scale-95 ${
                                            idx === currentImageIndex ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-white/20 hover:border-white/60'
                                        }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                                        {idx === currentImageIndex && (
                                            <div className="absolute inset-0 bg-primary/20" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 z-20 space-y-4 sm:space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <span className="px-4 py-1.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full">
                                {event.category}
                            </span>
                            {event.event_status === 'Passé' && (
                                <span className="px-4 py-1.5 bg-danger text-white text-xs font-black uppercase tracking-widest rounded-full">
                                    Terminé
                                </span>
                            )}
                            {event.event_status === 'En cours' && (
                                <span className="px-4 py-1.5 bg-success text-white text-xs font-black uppercase tracking-widest rounded-full">
                                    En cours
                                </span>
                            )}
                            {event.event_status === 'À venir' && (
                                <span className="px-4 py-1.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full">
                                    À venir
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-tight sm:leading-none mb-2 sm:mb-4">
                            {event.title}
                        </h1>

                        <div className="flex flex-wrap gap-4 sm:gap-8 items-center text-white/90">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl">
                                    <Calendar className="text-primary w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]" />
                                </div>
                                <div>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Début</p>
                                    <p className="font-bold text-sm sm:text-lg">{format(eventDate, 'd MMM yyyy HH:mm', { locale: fr })}</p>
                                </div>
                            </div>

                            {event.end_date && (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl">
                                        <Clock className="text-primary w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Fin</p>
                                        <p className="font-bold text-sm sm:text-lg">{format(new Date(event.end_date), 'd MMM yyyy HH:mm', { locale: fr })}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl">
                                    <MapPin className="text-primary w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]" />
                                </div>
                                <div>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Lieu</p>
                                    <p className="font-bold text-sm sm:text-lg">{event.location}</p>
                                </div>
                            </div>

                            <div className="flex-1" />

                            <div className="flex flex-wrap items-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                                <button
                                    onClick={handleShare}
                                    className="w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center shrink-0"
                                    title="Partager"
                                >
                                    <Share2 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Découvrez cet événement sur Evenia Ticket : ${event.title}\n📅 ${format(new Date(event.date_time), 'd MMMM yyyy HH:mm', { locale: fr })}\n📍 ${event.location}\n\nRéservez vos places ici : ${window.location.href}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 sm:w-14 sm:h-14 bg-green-500/20 backdrop-blur-md hover:bg-green-500/80 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center text-white shrink-0"
                                    title="Partager sur WhatsApp"
                                >
                                    <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-600/20 backdrop-blur-md hover:bg-blue-600/80 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center text-white shrink-0"
                                    title="Partager sur Facebook"
                                >
                                    <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                                </a>
                                <div className="p-1 sm:p-2 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-end justify-center">
                                    <ReactionButton
                                        eventId={event.id}
                                        userReactions={event.user_reactions || []}
                                        reactionsCounts={event.reactions_counts || {}}
                                        onReact={(type) => likeMutation.mutate({ type })}
                                        orientation="horizontal"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
                        {/* Summary & Description directly at top of content */}
                        <div className="card-surface p-6 sm:p-10 space-y-6 sm:space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center">
                                    <Info className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black">À propos</h3>
                                    <p className="text-[10px] sm:text-sm text-[var(--text-muted)] font-medium">Informations sur le événement</p>
                                </div>
                            </div>

                            <div className="p-4 sm:p-8 bg-[var(--background)]/40 rounded-[1.5rem] sm:rounded-[2.5rem] border border-[var(--border)] shadow-inner">
                                <p className="text-[var(--text-muted)] leading-relaxed sm:leading-loose whitespace-pre-line text-sm sm:text-lg font-medium text-justify">
                                    {event.description}
                                </p>
                            </div>

                            {/* Organizer quick info */}
                            <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-black">
                                        {event.organizer.first_name[0]}{event.organizer.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">Organisé par</p>
                                        <p className="font-bold text-primary">{event.organizer.first_name} {event.organizer.last_name}</p>
                                    </div>
                                </div>
                                <button className="text-primary font-black text-sm hover:underline">
                                    Voir le profil
                                </button>
                            </div>
                        </div>



                        <div className="card-surface p-10 space-y-8">
                            {/* ... existing comments code ... */}

                            {/* Comments Section */}
                            <div className="card-surface p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black flex items-center gap-2">
                                        <Users className="text-primary" />
                                        Commentaires ({event.comments.length})
                                    </h3>
                                </div>

                                {user ? (
                                    <div className="space-y-4">
                                        <textarea
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            placeholder="Laissez un commentaire..."
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 font-medium outline-none focus:border-primary transition-all min-h-[100px]"
                                        />
                                        <button
                                            onClick={() => commentMutation.mutate(commentContent)}
                                            disabled={!commentContent.trim() || commentMutation.isPending}
                                            className="btn-primary py-3 px-8 text-sm disabled:opacity-50"
                                        >
                                            {commentMutation.isPending ? 'Envoi...' : 'Publier'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)] italic">Connectez-vous pour laisser un commentaire.</p>
                                )}

                                <div className="space-y-6">
                                    {event.comments.map((comment) => (
                                        <div key={comment.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="font-black text-sm">{comment.user.first_name} {comment.user.last_name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase">
                                                    {format(new Date(comment.created_at), 'Pp', { locale: fr })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))}
                                    {event.comments.length === 0 && (
                                        <p className="text-center text-[var(--text-muted)] py-4 font-medium italic">Aucun commentaire pour le moment.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Ticket Selection */}
                    <div id="tickets-section" className="lg:col-span-1 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:sticky lg:top-24 custom-scrollbar">
                        <div className="space-y-6">
                            <div className="card-surface p-6 sm:p-8 space-y-6">
                                <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                                    <Ticket className="text-primary" />
                                    Billets
                                </h3>

                                <div className="space-y-4">
                                    {event.ticket_types.map((type) => (
                                        <div key={type.id} className="p-5 bg-[var(--background)] rounded-2xl border-2 border-[var(--border)] hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-black text-lg">{type.name}</h4>
                                                    {type.benefits && (
                                                        <p className="text-xs text-[var(--text-muted)] mt-1">{type.benefits}</p>
                                                    )}
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                                            +{calculateServiceFee(type.price).label} Frais
                                                        </span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                                                            Service Evenia inclus au total
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-primary block">{Math.round(type.price).toLocaleString()} FCFA</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)]">
                                                        + {Math.round(calculateServiceFee(type.price).fee).toLocaleString()} FCFA frais
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[var(--text-muted)]">
                                                    {type.quantity_available} disponibles
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuantityChange(type.id, -1)}
                                                        disabled={!selectedTickets[type.id] || event.event_status === 'Passé'}
                                                        className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-black">{selectedTickets[type.id] || 0}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(type.id, 1)}
                                                        disabled={type.quantity_available === 0 || (selectedTickets[type.id] || 0) >= type.quantity_available || event.event_status === 'Passé'}
                                                        className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalTickets > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="pt-6 border-t border-[var(--border)] space-y-4"
                                    >
                                        {/* Payment Method Selection */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                                                💳 Méthode de Paiement
                                            </label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'mtn' ? 'border-primary bg-primary/5' : 'border-[var(--border)] hover:border-primary/30'}`}>
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="mtn"
                                                        checked={paymentMethod === 'mtn'}
                                                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mtn' ? 'border-primary' : 'border-[var(--border)]'}`}>
                                                            {paymentMethod === 'mtn' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-black text-sm">MTN Mobile Money</p>
                                                            <p className="text-xs text-[var(--text-muted)]">Paiement via MTN MoMo</p>
                                                        </div>
                                                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-xs">
                                                            MTN
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'orange_money' ? 'border-primary bg-primary/5' : 'border-[var(--border)] hover:border-primary/30'}`}>
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="orange_money"
                                                        checked={paymentMethod === 'orange_money'}
                                                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'orange_money' ? 'border-primary' : 'border-[var(--border)]'}`}>
                                                            {paymentMethod === 'orange_money' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-black text-sm">Orange Money</p>
                                                            <p className="text-xs text-[var(--text-muted)]">Paiement via Orange Money</p>
                                                        </div>
                                                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-black text-xs text-white">
                                                            OM
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className={`p-4 rounded-xl border-2 cursor-not-allowed opacity-50 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-[var(--border)]'}`}>
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="card"
                                                        disabled
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                                                        <div className="flex-1">
                                                            <p className="font-black text-sm">Carte Bancaire</p>
                                                            <p className="text-xs text-[var(--text-muted)]">Bientôt disponible</p>
                                                        </div>
                                                        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-xl">
                                                            💳
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Phone Number Input */}
                                        {(paymentMethod === 'mtn' || paymentMethod === 'orange_money') && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                                                    📱 Numéro de Téléphone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={paymentPhone}
                                                    onChange={(e) => setPaymentPhone(e.target.value)}
                                                    placeholder="Ex: 6xx xxx xxx"
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 font-bold outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                                            <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-bold">
                                                <span>Sous-total billets</span>
                                                <span>{Math.round(totalAmountBase).toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-primary font-bold">
                                                <span>Total Frais de Service</span>
                                                <span>+ {Math.round(totalServiceFee).toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 gap-2">
                                                <span className="font-black text-lg">Total à payer</span>
                                                <span className="text-2xl font-black text-primary">{Math.round(totalAmount).toLocaleString()} FCFA</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePurchase}
                                            disabled={purchaseMutation.isPending || event.event_status === 'Passé'}
                                            className="btn-primary w-full py-4 text-lg shadow-2xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {purchaseMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Traitement...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    {event.event_status === 'Passé' ? 'Événement terminé' : 'Réserver maintenant'}
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Buy Button */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full px-6">
                <a
                    href="#tickets-section"
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 animate-pulse-subtle"
                >
                    <Ticket size={24} />
                    RÉSERVER MES BILLETS
                </a>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse-subtle {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s infinite ease-in-out;
                }
            `}} />
        </MainLayout>
    );
};

export default EventDetailsPage;
