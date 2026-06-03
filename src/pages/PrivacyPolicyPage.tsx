import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
    const sections = [
        {
            icon: <Eye size={24} />,
            title: "Collecte des données",
            content: "Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte, de l'achat d'un ticket ou de votre inscription à notre newsletter. Cela inclut votre nom, adresse email, numéro de téléphone et informations de paiement (traitées de manière sécurisée par nos partenaires de paiement)."
        },
        {
            icon: <Database size={24} />,
            title: "Utilisation des informations",
            content: "Vos données sont utilisées exclusivement pour traiter vos commandes, vous envoyer vos tickets digitaux, vous informer des changements liés aux événements et améliorer votre expérience sur notre plateforme. Nous ne vendons JAMAIS vos données personnelles à des tiers."
        },
        {
            icon: <Shield size={24} />,
            title: "Protection des données",
            content: "Evenia Ticket utilise des protocoles de sécurité avancés (chiffrement SSL, firewalls) pour protéger vos informations contre tout accès non autorisé. Nos serveurs sont régulièrement audités pour garantir une intégrité maximale."
        },
        {
            icon: <Lock size={24} />,
            title: "Cookies et Tracking",
            content: "Nous utilisons des cookies essentiels pour maintenir votre session active et des cookies analytiques pour comprendre comment vous utilisez notre site. Vous pouvez configurer votre navigateur pour refuser les cookies, bien que cela puisse limiter certaines fonctionnalités."
        },
        {
            icon: <UserCheck size={24} />,
            title: "Vos Droits",
            content: "Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ce droit à tout moment en nous contactant via notre centre d'aide."
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] py-20 pb-32">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary mb-8 rounded-none border-2 border-primary/20"
                    >
                        <Shield size={40} />
                    </motion.div>
                    <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">Politique de <br /><span className="text-primary">Confidentialité</span></h1>
                    <p className="text-xl text-[var(--text-muted)] font-medium">Dernière mise à jour : 01 Juin 2026</p>
                </div>

                {/* Introduction */}
                <div className="bg-[var(--surface)] p-8 sm:p-12 border border-[var(--border)] border-l-8 border-l-primary mb-16 shadow-2xl">
                    <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Introduction</h2>
                    <p className="text-lg text-[var(--text-muted)] leading-relaxed font-medium">
                        Chez <strong>Evenia Ticket</strong>, votre vie privée est notre priorité absolue. Cette politique de confidentialité explique comment nous recueillons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme de billetterie au Cameroun et en Afrique.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col sm:flex-row gap-8 items-start"
                        >
                            <div className="flex-shrink-0 w-16 h-16 bg-primary text-white flex items-center justify-center shadow-lg">
                                {section.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{section.title}</h3>
                                <p className="text-lg text-[var(--text-muted)] leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action support */}
                <div className="mt-24 p-12 bg-primary text-white text-center rounded-none shadow-2xl shadow-primary/30">
                    <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter italic">Une question sur vos données ?</h3>
                    <p className="text-xl mb-8 font-medium opacity-90">
                        Notre délégué à la protection des données est là pour vous répondre.
                    </p>
                    <a href="mailto:anngaraevenia@gmail.com" className="inline-block px-10 py-4 bg-white text-primary font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        Contacter le DPO
                    </a>
                </div>

                {/* Legal Bottom */}
                <div className="mt-20 pt-12 border-t border-[var(--border)] text-center">
                    <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4">
                        <Globe size={14} /> Respect des normes RGPD & Lois locales africaines
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
