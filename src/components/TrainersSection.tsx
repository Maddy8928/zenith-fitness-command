"use client";

import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Play, Dumbbell, Activity, Heart, Shield, Star, Instagram, Twitter, Linkedin } from 'lucide-react';

const trainers = [
    {
        id: 'marcus-johnson',
        name: 'Marcus Johnson',
        role: 'Head of Strength & Conditioning',
        bio: 'Former Olympic weightlifter with 12+ years of experience specialized in functional hypertrophy and raw power development.',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
        icon: Dumbbell,
        color: 'from-amber-500/20 to-orange-600/20',
        accent: 'text-gold-glow',
        bgAccent: 'bg-primary/10 text-primary hover:bg-primary hover:text-black',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--gold)/0.3)]',
        specialties: ['Powerlifting', 'Strength Training', 'Bodybuilding'],
        rating: 4.9,
    },
    {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        role: 'HIIT Specialist',
        bio: 'Sarah combines high-intensity interval training with functional movements. Her classes are known for their explosive energy and rapid calorie burn.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
        icon: Activity,
        color: 'from-cyan-500/20 to-blue-600/20', // Retained from original, not explicitly removed
        accent: 'text-neon-cyan drop-shadow-[0_0_10px_hsl(var(--neon-cyan))]',
        bgAccent: 'bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-black',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)]',
        specialties: ['HIIT', 'Cardio Conditioning', 'Core Strength'],
        rating: 4.8,
    },
    {
        id: 'michael-scott',
        name: 'Michael Rivers',
        role: 'Recovery & Mobility',
        bio: 'As a former physical therapist, Michael specializes in injury prevention, mobility enhancement, and optimal recovery protocols for athletes.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        icon: Shield,
        color: 'from-fuchsia-500/20 to-purple-600/20', // Retained from original, not explicitly removed
        accent: 'text-zinc-300 drop-shadow-[0_0_10px_rgba(228,228,231,0.5)]',
        bgAccent: 'bg-zinc-100/10 text-zinc-300 hover:bg-zinc-100 hover:text-black',
        shadowHover: 'hover:shadow-[0_0_30px_rgba(228,228,231,0.3)]',
        specialties: ['Mobility', 'Injury Prevention', 'Active Recovery'],
        rating: 4.9,
    }
];

export default function TrainersSection() {
    return (
        <section id="trainers" className="relative py-24 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_hsl(var(--gold)/0.03),_transparent_60%)] pointer-events-none blur-3xl" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 relative z-10">
                    <h2 className="text-sm font-heading font-bold uppercase tracking-[0.3em] text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Meet The Experts
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Elite <span className="gold-text">Trainers</span>
                    </h3>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Work with industry-leading professionals dedicated to unlocking your absolute maximum potential.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mb-16">
                    {trainers.map((trainer, index) => {
                        const Icon = trainer.icon;
                        return (
                            <div
                                key={trainer.id}
                                className={`group relative rounded-3xl overflow-hidden glass-card transition-all duration-500 border border-slate-200 dark:border-white/5 group-hover:border-primary/50 dark:group-hover:border-white/20 hover:scale-[1.02] ${trainer.shadowHover} animate-in fade-in slide-in-from-bottom-10`}
                                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${trainer.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className="relative h-[400px] w-full rounded-[1.8rem] overflow-hidden mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 group-hover:via-black/40 transition-colors duration-500" />
                                    <img
                                        src={trainer.image}
                                        alt={trainer.name}
                                        className="object-cover object-top w-full h-full scale-100 group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                                    />

                                    {/* Hover Overlay containing info */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900/90 via-slate-900/60 dark:from-black/90 dark:via-black/60 to-transparent translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex gap-4 mb-4">
                                            {trainer.specialties.map((spec, i) => (
                                                <span key={i} className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded bg-white/20 text-white backdrop-blur-sm">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Right Quick Action (Like/Share) */}
                                    <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-slate-800/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/10 group-hover:border-white/50 dark:group-hover:border-white/30 transition-colors">
                                        <Star className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1 drop-shadow-md">
                                        {trainer.name}
                                    </h4>
                                    <p className="text-primary dark:text-neon-cyan font-bold text-sm tracking-widest uppercase mb-4 drop-shadow-sm">
                                        {trainer.role}
                                    </p>
                                    {/* Bio reveals on hover */}
                                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1 text-slate-900 dark:text-white text-sm font-bold">
                                                <Star className="w-4 h-4 fill-primary dark:fill-gold text-primary dark:text-gold" />
                                                <span>{trainer.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-600 dark:text-white">
                                                <Instagram className="w-4 h-4" />
                                            </button>
                                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-600 dark:text-white">
                                                <Twitter className="w-4 h-4" />
                                            </button>
                                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-600 dark:text-white">
                                                <Linkedin className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>


                                <div className="px-6 pb-6 relative z-20">
                                    <button className={`w-full py-3.5 rounded-xl border flex justify-center items-center gap-2 font-bold uppercase tracking-wider transition-all duration-300 ${trainer.bgAccent}`}>
                                        View Profile
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Team CTA */}
                <div className="flex justify-center relative z-10 animate-in fade-in zoom-in duration-700 delay-[600ms]">
                    <button className="group relative px-8 py-4 bg-background/50 hover:bg-background/80 border border-primary/30 hover:border-primary/60 rounded-full transition-all duration-300 overflow-hidden shadow-soft backdrop-blur-md">
                        <span className="relative z-10 flex items-center gap-3 text-foreground font-heading font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                            Meet The Full Team
                            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 group-hover:text-gold-glow transition-all" />
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}
