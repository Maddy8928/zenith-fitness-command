"use client";

import { motion } from 'framer-motion';
import { Target, Shield, Zap, ArrowRight, Award } from 'lucide-react';
import Image from 'next/image';

const STATS = [
    { label: 'Sq Ft Facility', value: '15k+', icon: Target },
    { label: 'Elite Trainers', value: '25+', icon: Award },
    { label: 'Active Members', value: '2k+', icon: Shield },
    { label: 'Classes/Week', value: '120+', icon: Zap }
];

export default function AboutSection() {
    return (
        <section id="about" className="relative py-24 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,_hsl(var(--primary)/0.03),_transparent_60%)] pointer-events-none blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_hsl(var(--gold)/0.03),_transparent_60%)] pointer-events-none blur-3xl -translate-x-1/3 translate-y-1/3" />

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">

                    {/* Image Stack */}
                    <div className="relative h-[600px] w-full mt-12 lg:mt-0">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/20 dark:bg-gold/20 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/20 dark:bg-neon-cyan/20 rounded-full blur-[80px] pointer-events-none" />

                        <motion.div
                            className="absolute top-0 right-0 w-[80%] h-[70%] rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
                            whileHover={{ scale: 1.02, zIndex: 30 }}
                            transition={{ duration: 0.4 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                                alt="Flex Gym Facility"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-black/60 to-transparent" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-0 left-0 w-[70%] h-[60%] rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20"
                            whileHover={{ scale: 1.02, zIndex: 30 }}
                            transition={{ duration: 0.4 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop"
                                alt="Training Session"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-black/60 to-transparent" />
                        </motion.div>

                        {/* Floating Badge */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-32 h-32 rounded-full bg-slate-50/90 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/20 flex items-center justify-center shadow-[0_0_30px_hsl(var(--gold)/0.2)] dark:shadow-[0_0_30px_hsl(var(--gold)/0.3)]"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            <div className="text-center">
                                <div className="font-heading font-black text-2xl text-slate-900 dark:text-white leading-none mb-1">24/7</div>
                                <div className="text-[10px] font-bold tracking-wider text-primary dark:text-gold-glow uppercase">Elite Access</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-xs font-heading font-semibold text-primary uppercase tracking-widest">
                                The Flex Philosophy
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground mb-6 leading-[1.1]">
                            Forging <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Elite</span> Potential
                        </h2>

                        <div className="space-y-6 text-lg text-muted-foreground dark:text-slate-300 font-body leading-relaxed mb-10">
                            <p>
                                Welcome to Flex Gym. We aren't just another commercial fitness center. We are a sanctuary for those who refuse to settle for average.
                            </p>
                            <p>
                                Founded on the principles of biomechanical excellence and community-driven accountability, we provide a world-class environment designed to extract the absolute best version of yourself. From Olympic-grade equipment to recovery spa amenities, every square foot is engineered for performance.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {STATS.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className="glass-card p-4 rounded-2xl border-white/5 hover:border-primary/30 transition-colors duration-300 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-charcoal/50 flex items-center justify-center border border-white/5">
                                            <Icon className="w-5 h-5 text-gold-glow" />
                                        </div>
                                        <div>
                                            <h5 className="text-2xl font-black text-foreground dark:text-white leading-none mb-1">{stat.value}</h5>
                                            <p className="text-xs text-muted-foreground dark:text-slate-400 uppercase tracking-widest font-semibold">{stat.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CTA */}
                        <button className="group px-8 py-4 rounded-2xl bg-primary text-black font-heading font-bold text-base tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 flex items-center gap-4 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                            Discover The Facility
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
}
