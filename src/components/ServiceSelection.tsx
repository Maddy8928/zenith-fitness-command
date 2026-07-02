"use client";

import { ArrowRight, Dumbbell, Users, Utensils, Droplets, Flame } from 'lucide-react';
import Image from 'next/image';

const SERVICES = [
    {
        id: 'personal-training',
        title: 'Premium PT',
        description: 'Elite 1-on-1 coaching customized to your exact biomechanics and goals.',
        icon: Dumbbell,
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        color: 'from-amber-500/20 to-orange-600/20',
        accent: 'text-amber-500',
        borderHover: 'group-hover:border-amber-500/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)]'
    },
    {
        id: 'group-classes',
        title: 'Elite Classes',
        description: 'High-energy group training led by world-class instructors in state-of-the-art studios.',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        color: 'from-primary/20 to-fuchsia-600/20',
        accent: 'text-primary',
        borderHover: 'group-hover:border-primary/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]'
    },
    {
        id: 'nutrition',
        title: 'Nutrition Lab',
        description: 'Precision macro-planning and meal prep tailored by registered dietitians.',
        icon: Utensils,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
        color: 'from-emerald-500/20 to-green-600/20',
        accent: 'text-emerald-400',
        borderHover: 'group-hover:border-emerald-500/50',
        shadowHover: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
    },
    {
        id: 'recovery',
        title: 'Recovery Spa',
        description: 'Cryotherapy, infrared saunas, and sports massage for optimal physical restoration.',
        icon: Droplets,
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop',
        color: 'from-blue-500/20 to-cyan-600/20',
        accent: 'text-blue-400',
        borderHover: 'group-hover:border-blue-500/50',
        shadowHover: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
    }
];

export default function ServiceSelection() {
    return (
        <section id="services" className="relative py-24 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_hsl(var(--gold)/0.03),_transparent_60%)] pointer-events-none blur-3xl" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 relative z-10">
                    <h2 className="text-sm font-heading font-bold uppercase tracking-[0.3em] text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Elevate Your Experience
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Premium <span className="gold-text">Services</span>
                    </h3>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Select from our world-class fitness offerings designed to maximize your potential.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {SERVICES.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={service.id}
                                className={`group relative glass-card p-1 rounded-3xl overflow-hidden transition-all duration-500 border border-primary/10 ${service.borderHover} ${service.shadowHover} animate-in fade-in slide-in-from-bottom-8`}
                                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                            >
                                {/* Gradient Overlay corresponding to service */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="absolute inset-0 z-0">
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/40 z-10 group-hover:bg-slate-900/40 dark:group-hover:bg-black/20 transition-colors duration-500" />
                                </div>
                                <div className="relative z-20 h-full flex flex-col justify-end p-8 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                                        <Icon className={`w-5 h-5 ${service.accent}`} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-2 text-shadow-sm">
                                        {service.title}
                                    </h4>

                                    <div className="overflow-hidden h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <p className="text-slate-100 font-body mb-6">
                                            {service.description}
                                        </p>
                                        <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300 group-hover:text-primary dark:group-hover:text-gold-glow transition-colors">
                                            Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Hardcore Services Button */}
                <div className="mt-16 flex justify-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                    <button className="group relative px-8 py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/50 rounded-2xl transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center gap-3 text-red-500 font-heading font-bold uppercase tracking-widest group-hover:text-red-400 transition-colors">
                            <Flame className="w-5 h-5 text-red-500 group-hover:animate-pulse" />
                            Discover Hardcore Services
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}
