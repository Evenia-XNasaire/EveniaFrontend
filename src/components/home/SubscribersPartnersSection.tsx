import React from 'react';
import { motion } from 'framer-motion';

const SubscribersPartnersSection: React.FC = () => {
    const subscribers = [
        { count: "50K+", label: "Utilisateurs Actifs" },
        { count: "1K+", label: "Événements Organisés" },
        { count: "100K+", label: "Billets Vendus" },
        { count: "4.9/5", label: "Note Moyenne" },
    ];

    const partners = [
        "MTN", "Orange", "Canal+", "Trace", "Ubisoft", "LocalEvents"
    ];

    return (
        <section className="py-20 space-y-24">
            {/* Subscribers Stats */}
            <div className="container mx-auto px-6">
                <div className="bg-linear-to-br from-primary to-accent rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {subscribers.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, type: "spring" }}
                            >
                                <div className="text-4xl md:text-6xl font-black mb-2">{stat.count}</div>
                                <div className="text-white/70 font-bold uppercase tracking-widest text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Partners */}
            <div className="container mx-auto px-6 text-center">
                <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.3em] mb-12 text-sm">Ils nous font confiance</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-2xl font-black text-[var(--text)]"
                        >
                            {/* Placeholder for Logos - using text for now */}
                            {partner}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SubscribersPartnersSection;
