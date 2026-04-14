import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Headphones, Globe } from 'lucide-react';

const ServicesSection: React.FC = () => {
    const services = [
        {
            icon: ShieldCheck,
            title: "Billetterie Sécurisée",
            description: "Technologie anti-fraude de pointe pour garantir l'authenticité de chaque billet."
        },
        {
            icon: Zap,
            title: "Réservation Instantanée",
            description: "Achetez vos places en quelques secondes avec notre processus optimisé."
        },
        {
            icon: Headphones,
            title: "Support 24/7",
            description: "Une équipe dédiée pour vous accompagner avant, pendant et après l'événement."
        },
        {
            icon: Globe,
            title: "Accessibilité Globale",
            description: "Accédez aux événements locaux et internationaux depuis une seule plateforme."
        }
    ];

    return (
        <section className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary font-bold tracking-widest uppercase text-sm"
                    >
                        Pourquoi nous choisir
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-[var(--text)]"
                    >
                        Une Expérience Inégalée
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[var(--border)] hover:border-primary/30 transition-all text-center group"
                            >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-linear-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-accent transition-colors" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-[var(--text)]">{service.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
                                    {service.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
