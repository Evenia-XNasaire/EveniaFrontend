import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const partners = [
    {
        name: 'ARITeD',
        url: 'https://arited.org/',
        description: 'Association pour la Recherche et l\'Innovation Technologique Durable.',
        logo: 'ARITeD'
    },
    {
        name: 'Aangara Pay',
        url: 'https://aangaraa-pay.com',
        description: 'Solution de paiement sécurisée et innovante.',
        logo: 'Aangara Pay'
    }
];

const PartnersSection: React.FC = () => {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">Nos Partenaires</h2>
                    <p className="text-[var(--text-muted)] font-medium text-sm max-w-xl mx-auto">
                        Des institutions de confiance à nos côtés.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {partners.map((partner, index) => (
                        <motion.a
                            key={partner.name}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="w-full max-w-[280px] card-surface p-6 flex flex-col items-center text-center gap-4 group hover:border-primary/50 transition-all border-2 border-transparent shadow-lg"
                        >
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                {partner.name[0]}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black group-hover:text-primary transition-colors">{partner.name}</h3>
                                <p className="text-[var(--text-muted)] font-medium text-xs leading-relaxed line-clamp-2">
                                    {partner.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mt-2">
                                Visiter le site <ExternalLink size={12} />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PartnersSection;
