import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import api, { BASE_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, Image as ImageIcon, Plus, Trash2,
    ArrowLeft, Loader2, CheckCircle2, AlertCircle, Info, Save,
    Ticket
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../layouts/DashboardLayout';

interface TicketTypeInput {
    id?: number;
    name: string;
    price: string;
    quantity_available: string;
    benefits: string;
}

const EditEventPage: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'evenia',
        date_time: '',
        end_date: '',
        location: '',
        status: 'published' as 'published' | 'draft',
    });

    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImagePath, setExistingImagePath] = useState<string | null>(null);

    const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
    const [additionalImages, setAdditionalImages] = useState<File[]>([]);
    const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([]);

    const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([]);

    const { data: event, isLoading: isFetching } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/events/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                category: event.category,
                date_time: event.date_time.slice(0, 16), // Format for datetime-local
                end_date: event.end_date ? event.end_date.slice(0, 16) : '',
                location: event.location,
                status: event.status,
            });
            if (event.image_url) {
                setExistingImagePath(event.image_url);
                setImagePreview(event.image_url);
            }
            if (event.additional_image_urls) {
                setExistingAdditionalImages(event.additional_image_urls);
            }
            setTicketTypes(event.ticket_types.map((t: any) => ({
                id: t.id,
                name: t.name,
                price: t.price.toString(),
                quantity_available: t.quantity_available.toString(),
                benefits: t.benefits || '',
            })));
        }
    }, [event]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError({ image: ["L'image est trop volumineuse. La taille maximale est de 10 Mo."] });
                return;
            }
            setError(null);
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + additionalImages.length + existingAdditionalImages.length > 5) {
            setError({ additional_images: ["Vous ne pouvez pas avoir plus de 5 images secondaires au total."] });
            return;
        }

        const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
        if (validFiles.length < files.length) {
            setError({ additional_images: ["Certaines images dépassent 10 Mo et ont été ignorées."] });
        } else {
            setError(null);
        }

        setAdditionalImages(prev => [...prev, ...validFiles]);
        setAdditionalImagesPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
    };

    const removeNewAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        setAdditionalImagesPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAdditionalImage = (index: number) => {
        setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { name: '', price: '', quantity_available: '', benefits: '' }]);
    };

    const removeTicketType = (index: number) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(ticketTypes.filter((_, i) => i !== index));
        }
    };

    const handleTicketChange = (index: number, field: keyof TicketTypeInput, value: string) => {
        const updated = [...ticketTypes];
        (updated[index] as any)[field] = value;
        setTicketTypes(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('_method', 'PUT'); // For Laravel with files
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('date_time', formData.date_time);
        if (formData.end_date) data.append('end_date', formData.end_date);
        data.append('location', formData.location);
        data.append('status', formData.status);
        if (image) data.append('image', image);

        existingAdditionalImages.forEach((url, index) => {
            data.append(`retained_additional_images[${index}]`, url);
        });

        additionalImages.forEach((file) => {
            data.append('additional_images[]', file);
        });

        ticketTypes.forEach((type, index) => {
            if (type.id) data.append(`ticket_types[${index}][id]`, type.id.toString());
            data.append(`ticket_types[${index}][name]`, type.name);
            data.append(`ticket_types[${index}][price]`, type.price);
            data.append(`ticket_types[${index}][quantity_available]`, type.quantity_available);
            if (type.benefits) data.append(`ticket_types[${index}][benefits]`, type.benefits);
        });

        try {
            await api.post(`/events/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => navigate('/organizer'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.errors || { message: 'Une erreur est survenue lors de la mise à jour.' });
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return (
            <DashboardLayout role="organizer">
                <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </main>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="organizer">
            <main className="p-6 lg:p-10 space-y-10">
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/organizer')}
                        className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-primary transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Modifier l'événement ✏️</h1>
                        <p className="text-[var(--text-muted)] font-medium">Mettez à jour les détails de votre événement.</p>
                    </div>
                </header>

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-success/10 border border-success/20 text-success p-6 rounded-[2rem] flex items-center gap-4 font-bold"
                        >
                            <CheckCircle2 size={32} />
                            <div>
                                <h4 className="text-xl">Événement mis à jour !</h4>
                                <p className="text-sm opacity-80">Redirection vers votre tableau de bord...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <section className="card-surface p-8 space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Info className="text-primary" /> Informations Générales
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Titre de l'événement</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Afrobeats & Coupé-Décalé 2026"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-bold text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Catégorie</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-bold"
                                    >
                                        <option value="evenia">Tous événements (Défaut)</option>
                                        <option value="événement">Événement / Musique & Festival</option>
                                        <option value="match">Match / Sport</option>
                                        <option value="cinema">Cinéma</option>
                                        <option value="bapteme">Baptême</option>
                                        <option value="anniversaire">Anniversaire</option>
                                        <option value="conference">Conférence</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Date et Heure</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.date_time}
                                            onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 pl-12 focus:border-primary transition-all outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Date de Fin (Optionnel)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                        <input
                                            type="datetime-local"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 pl-12 focus:border-primary transition-all outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Lieu / Salle</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Ex: Palais de la Culture, Abidjan"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 pl-12 focus:border-primary transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez votre événement en détail (artistes, ambiance, programme...)"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 focus:border-primary transition-all outline-none font-medium resize-none"
                                />
                            </div>
                        </section>

                        {/* Tickets Section */}
                        <section className="card-surface p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <Ticket className="text-primary" /> Types de Billets
                                </h3>
                                <button
                                    type="button"
                                    onClick={addTicketType}
                                    className="flex items-center gap-2 text-sm font-black text-primary hover:opacity-80"
                                >
                                    <Plus size={18} /> AJOUTER UN TYPE
                                </button>
                            </div>

                            <div className="space-y-4">
                                {ticketTypes.map((type, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] relative group">
                                        <div className="space-y-1 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Nom</label>
                                            <input
                                                required
                                                value={type.name}
                                                onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                                placeholder="Simple, VIP, VVIP..."
                                                className="w-full bg-transparent border-b border-[var(--border)] focus:border-primary transition-all outline-none py-2 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Prix (FCFA)</label>
                                            <input
                                                required
                                                type="number"
                                                value={type.price}
                                                onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-transparent border-b border-[var(--border)] focus:border-primary transition-all outline-none py-2 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Quantité</label>
                                            <input
                                                required
                                                type="number"
                                                value={type.quantity_available}
                                                onChange={(e) => handleTicketChange(index, 'quantity_available', e.target.value)}
                                                placeholder="100"
                                                className="w-full bg-transparent border-b border-[var(--border)] focus:border-primary transition-all outline-none py-2 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-1 flex items-end justify-between">
                                            <div className="flex-1 mr-2">
                                                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Bénéfices</label>
                                                <input
                                                    value={type.benefits}
                                                    onChange={(e) => handleTicketChange(index, 'benefits', e.target.value)}
                                                    placeholder="Consommation offerte..."
                                                    className="w-full bg-transparent border-b border-[var(--border)] focus:border-primary transition-all outline-none py-2 text-xs"
                                                />
                                            </div>
                                            {ticketTypes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTicketType(index)}
                                                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Image Upload */}
                        <section className="card-surface p-8 space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <ImageIcon className="text-primary" /> Affiche
                            </h3>

                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[var(--background)] border-2 border-dashed border-[var(--border)] group transition-all hover:border-primary/50">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setImage(null); setImagePreview(null); }}
                                            className="absolute top-4 right-4 p-2 bg-danger text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-6 text-center">
                                        <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4">
                                            <ImageIcon size={32} />
                                        </div>
                                        <span className="font-bold text-sm">
                                            {existingImagePath ? "Cliquez pour changer l'affiche" : "Cliquez pour importer l'affiche"}
                                        </span>
                                        <span className="text-[var(--text-muted)] text-xs mt-2">Recommandé : 1920x1080px (JPEG, PNG, Max 10Mo)</span>
                                        {existingImagePath && <span className="text-xs text-green-600 mt-1 font-medium">Image actuelle conservée si vide</span>}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>

                            {/* Images secondaires */}
                            <div className="pt-6 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-lg">Galerie d'images ({existingAdditionalImages.length + additionalImages.length}/5)</h4>
                                    <span className="text-xs text-[var(--text-muted)] font-bold">Max 5 images</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {existingAdditionalImages.map((url, index) => (
                                        <div key={`existing-${index}`} className="relative aspect-video rounded-3xl overflow-hidden bg-[var(--background)] border-2 border-[var(--border)] group shadow-lg">
                                            <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Existing Secondary ${index}`} />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingAdditionalImage(index)}
                                                    className="p-4 bg-danger text-white rounded-2xl shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all font-bold flex items-center gap-2"
                                                >
                                                    <Trash2 size={20} /> Supprimer
                                                </button>
                                            </div>
                                            <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">Existant</span>
                                        </div>
                                    ))}
                                    {additionalImagesPreviews.map((preview, index) => (
                                        <div key={`new-${index}`} className="relative aspect-video rounded-3xl overflow-hidden bg-[var(--background)] border-2 border-[var(--border)] group shadow-lg">
                                            <img src={preview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`New Secondary preview ${index}`} />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewAdditionalImage(index)}
                                                    className="p-4 bg-danger text-white rounded-2xl shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all font-bold flex items-center gap-2"
                                                >
                                                    <Trash2 size={20} /> Retirer
                                                </button>
                                            </div>
                                            <span className="absolute top-4 left-4 px-3 py-1 bg-primary/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">Nouveau</span>
                                        </div>
                                    ))}
                                    {(existingAdditionalImages.length + additionalImages.length) < 5 && (
                                        <label className="relative aspect-video rounded-3xl overflow-hidden bg-[var(--background)] border-2 border-dashed border-[var(--border)] hover:border-primary/50 transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center group bg-primary/5">
                                            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-4 transition-all shadow-inner">
                                                <Plus size={32} />
                                            </div>
                                            <span className="font-black text-sm text-primary">Ajouter une image</span>
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1">JPEG, PNG (Max 10Mo)</span>
                                            <input type="file" multiple className="hidden" accept="image/*" onChange={handleAdditionalImagesChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Status & Submit */}
                        <section className="card-surface p-8 space-y-6">
                            <h3 className="text-xl font-black">Publication</h3>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[var(--border)] cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="published"
                                        checked={formData.status === 'published'}
                                        onChange={() => setFormData({ ...formData, status: 'published' })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-black text-sm">Publier</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[var(--border)] cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="draft"
                                        checked={formData.status === 'draft'}
                                        onChange={() => setFormData({ ...formData, status: 'draft' })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-black text-sm">Brouillon</p>
                                    </div>
                                </label>
                            </div>

                            {error && (
                                <div className="text-danger text-xs font-bold leading-relaxed bg-danger/10 p-4 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        <span>Erreur de mise à jour :</span>
                                    </div>
                                    <ul className="list-disc ml-6 space-y-1">
                                        {Object.entries(error).map(([key, messages]: [string, any]) => {
                                            let label = key;
                                            if (key.startsWith('ticket_types.')) {
                                                const parts = key.split('.');
                                                const index = parseInt(parts[1]) + 1;
                                                const field = parts[2];
                                                const fieldName = field === 'name' ? 'Nom' : (field === 'price' ? 'Prix' : 'Quantité');
                                                label = `Billet #${index} (${fieldName})`;
                                            } else {
                                                const labels: any = {
                                                    title: 'Titre',
                                                    description: 'Description',
                                                    location: 'Lieu',
                                                    date_time: 'Date',
                                                    category: 'Catégorie',
                                                    image: 'Image'
                                                };
                                                label = labels[key] || key;
                                            }
                                            return (
                                                <li key={key}>
                                                    <span className="font-black">{label} :</span> {Array.isArray(messages) ? messages[0] : (typeof messages === 'string' ? messages : 'Erreur')}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || success}
                                className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={24} />}
                                {loading ? 'Mise à jour...' : 'ENREGISTRER'}
                            </button>
                        </section>
                    </div>
                </form>
            </main>
        </DashboardLayout>
    );
};

export default EditEventPage;
