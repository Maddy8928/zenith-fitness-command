"use client";

import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

export default function WatchDemoSection() {
    return (
        <section id="watch-demo" className="relative py-32 px-6 overflow-hidden bg-background">
            {/* Surrounding Ambient Light Gradients */}
            <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 text-center">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-neon-cyan/20 dark:border-neon-cyan/20 bg-white/50 dark:bg-transparent mb-6">
                        <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
                        <span className="text-xs font-heading font-bold tracking-widest uppercase text-neon-cyan dark:text-neon-cyan text-primary">
                            System Inside Look
                        </span>
                    </div>

                    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        See The Command Center <span className="gold-text">In Action</span>
                    </h2>

                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
                        Take a comprehensive 5-minute tour of the Flex Gym platform. Witness the seamless integration of member management, AI analytics, and elite facility control.
                    </p>
                </motion.div>

                {/* Video Player Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden glass-card border-white/5 group shadow-[0_0_50px_hsl(var(--gold)/0.05)] hover:shadow-[0_0_80px_hsl(var(--gold)/0.15)] transition-all duration-700"
                >
                    {/* Simulated Video Poster Image */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-30 dark:opacity-40 mix-blend-luminosity group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-700" />

                    {/* Dark gradient overlay for extreme contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 via-slate-100/40 dark:from-charcoal/90 dark:via-charcoal/40 to-transparent" />

                    {/* Animated Overlay Borders */}
                    <div className="absolute inset-0 border border-gold/20 dark:border-gold/10 rounded-3xl group-hover:border-gold/60 dark:group-hover:border-gold-glow/50 transition-colors duration-700 pointer-events-none" />

                    {/* Play Button Interface */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <button className="relative group/btn cursor-pointer">
                            {/* Outer Pulse Rings */}
                            <div className="absolute inset-0 bg-primary dark:bg-gold-glow rounded-full animate-ping opacity-20 group-hover/btn:opacity-40 transition-opacity duration-300" />
                            <div className="absolute -inset-4 bg-primary/20 dark:bg-gold-glow/20 rounded-full blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

                            {/* Inner Button */}
                            <div className="relative w-24 h-24 rounded-full bg-white/90 dark:bg-charcoal/90 backdrop-blur-xl border border-primary/20 dark:border-gold/30 flex items-center justify-center shadow-[0_0_30px_hsl(var(--gold)/0.15)] dark:shadow-[0_0_30px_hsl(var(--gold)/0.3)] group-hover/btn:scale-110 group-hover/btn:border-primary dark:group-hover/btn:border-gold-glow group-hover/btn:bg-slate-50 dark:group-hover/btn:bg-black transition-all duration-300 z-10">
                                <Play className="w-10 h-10 text-primary dark:text-gold-glow ml-2 drop-shadow-[0_0_10px_hsl(var(--gold)/0.5)] dark:drop-shadow-[0_0_10px_hsl(var(--gold))]" />
                            </div>
                        </button>
                    </div>

                    {/* Faux Video Scrubber/Stats below button */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-between text-slate-800 dark:text-white font-body text-xs tracking-widest uppercase">
                        <span>0:00 / 05:24</span>
                        <div className="flex-1 mx-6 h-1 bg-slate-300 dark:bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-primary dark:bg-gold-glow shadow-[0_0_10px_hsl(var(--gold))]" />
                        </div>
                        <span className="hidden sm:inline">High-Definition</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
