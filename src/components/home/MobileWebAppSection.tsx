import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Globe } from 'lucide-react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

const MobileWebAppSection: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110 z-0" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                            <Smartphone className="w-4 h-4" />
                            Disponible partout
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--text)] leading-tight">
                            L'événementiel <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Au bout des doigts</span>
                        </h2>
                        <p className="text-base sm:text-xl text-[var(--text-muted)] font-medium leading-relaxed">
                            Que vous soyez sur votre canapé ou en déplacement, Evenia Ticket vous suit partout. Profitez d'une expérience fluide sur mobile (Android & iOS) et desktop.
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                            <a href="https://expo.dev/artifacts/eas/gWVP11F3PFphujtacRUEmx.apk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--text)] text-[var(--background)] px-6 py-4 rounded-2xl font-black hover:bg-primary hover:text-white transition-all group">
                                <FaApple className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase tracking-wider opacity-70">Télécharger sur</div>
                                    <div className="text-base leading-none whitespace-nowrap">App Store (iOS)</div>
                                </div>
                            </a>
                            <a href="https://expo.dev/artifacts/eas/gWVP11F3PFphujtacRUEmx.apk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--text)] text-[var(--background)] px-6 py-4 rounded-2xl font-black hover:bg-primary hover:text-white transition-all group">
                                <FaGooglePlay className="w-5 h-5 ml-1" />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase tracking-wider opacity-70">Télécharger sur</div>
                                    <div className="text-base leading-none whitespace-nowrap">Play Store (Android)</div>
                                </div>
                            </a>
                            <a href="https://eveniatickets.onrender.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--border)] px-6 py-4 rounded-2xl font-black hover:border-primary hover:text-primary transition-all group">
                                <Globe className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase tracking-wider opacity-70">Disponible en</div>
                                    <div className="text-base leading-none whitespace-nowrap">Version Web</div>
                                </div>
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Abstract Phone Mockup Representation */}
                        <div className="relative mx-auto w-72 h-[500px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 rotate-[-6deg] hover:rotate-0 transition-all duration-500">
                            <div className="h-full w-full bg-[var(--surface)] rounded-[2rem] overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary/20 to-transparent p-6">
                                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                                    <div className="h-8 w-24 bg-white/20 rounded-lg" />
                                </div>
                                {/* Mock UI Elements */}
                                <div className="absolute top-32 inset-x-4 space-y-4">
                                    <div className="h-40 bg-[var(--background)] rounded-2xl shadow-lg border border-[var(--border)]" />
                                    <div className="h-24 bg-[var(--background)] rounded-2xl shadow-lg border border-[var(--border)]" />
                                    <div className="h-24 bg-[var(--background)] rounded-2xl shadow-lg border border-[var(--border)]" />
                                </div>
                            </div>
                        </div>

                        {/* Decoration elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl"
                        />
                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default MobileWebAppSection;
