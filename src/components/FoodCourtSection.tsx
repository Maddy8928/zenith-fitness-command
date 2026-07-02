"use client";

import { ArrowRight, Coffee, Apple, Beef, UtensilsCrossed } from 'lucide-react';

const MENU_CATEGORIES = [
    {
        id: 'healthy-meals',
        title: 'Performance Meals',
        description: 'Chef-prepared, macro-balanced meals designed to fuel your workouts and optimize recovery.',
        icon: Beef,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
        color: 'from-fuchsia-600/20 to-purple-600/20',
        accent: 'text-fuchsia-500',
        borderHover: 'group-hover:border-fuchsia-500/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]'
    },
    {
        id: 'protein-shakes',
        title: 'Protein Bar',
        description: 'Post-workout shakes blended with premium whey, fresh fruits, and high-quality supplements.',
        icon: Coffee,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
        color: 'from-cyan-500/20 to-blue-600/20',
        accent: 'text-neon-cyan',
        borderHover: 'group-hover:border-neon-cyan/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.15)]'
    },
    {
        id: 'snacks',
        title: 'Energy Snacks',
        description: 'Keto-friendly protein bars, energy bites, and pre-workout fuel options.',
        icon: Apple,
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=800&auto=format&fit=crop',
        color: 'from-amber-500/20 to-orange-600/20',
        accent: 'text-gold-glow',
        borderHover: 'group-hover:border-gold-glow/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)]'
    }
];

export default function FoodCourtSection() {
    return (
        <section id="cafe" className="relative py-24 px-6 overflow-hidden bg-black/40 border-y border-primary/5">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_hsl(var(--primary)/0.03),_transparent_70%)] pointer-events-none blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_hsl(var(--neon-cyan)/0.03),_transparent_70%)] pointer-events-none blur-3xl -translate-x-1/3 translate-y-1/3" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <UtensilsCrossed className="w-4 h-4 text-primary" />
                        <span className="text-xs font-heading font-semibold text-primary uppercase tracking-widest">
                            Nexus Fuel Station
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-neon-cyan dark:to-primary">Nutrition</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Fuel your body right. Visit our in-house cafe for meticulously curated meals, snacks, and beverages that align with your elite fitness goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-16">
                    {MENU_CATEGORIES.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <div
                                key={category.id}
                                className={`group relative glass-card p-1 rounded-[2rem] overflow-hidden transition-all duration-500 border border-white/5 ${category.borderHover} ${category.shadowHover} animate-in fade-in slide-in-from-bottom-10`}
                                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className="relative h-64 w-full rounded-[1.8rem] overflow-hidden mb-6">
                                    <div className="absolute inset-0 bg-black/50 z-10 group-hover:bg-black/20 transition-colors duration-500" />
                                    <img
                                        src={category.image}
                                        alt={category.title}
                                        className="object-cover w-full h-full scale-100 group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                                        <Icon className={`w-6 h-6 ${category.accent}`} />
                                    </div>
                                </div>

                                <div className="px-6 pb-6 relative z-20">
                                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-white transition-colors">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-3">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Full Menu Button */}
                <div className="flex justify-center relative z-10 animate-in fade-in zoom-in duration-700 delay-[600ms]">
                    <button className="group relative px-8 py-4 bg-background/50 hover:bg-background/80 border border-primary/30 hover:border-primary/60 rounded-full transition-all duration-300 overflow-hidden shadow-soft backdrop-blur-md">
                        <span className="relative z-10 flex items-center gap-3 text-foreground font-heading font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                            Explore Full Menu
                            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 group-hover:text-neon-cyan transition-all" />
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}
