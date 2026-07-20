"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Zap } from 'lucide-react';

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial application load time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000); // 3 seconds for a dramatic luxury intro

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 dark:bg-black/95 backdrop-blur-3xl overflow-hidden"
                >
                    {/* Atmospheric Glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--gold)/0.15),_transparent_50%)] pointer-events-none"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        {/* Interactive Logo Mark */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotateX: 45 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-primary/10 dark:bg-gold-glow/20 blur-2xl rounded-3xl" />
                            <div className="relative w-24 h-24 rounded-3xl bg-slate-50/80 dark:bg-gradient-to-br dark:from-charcoal/80 dark:to-black/80 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-[0_0_30px_hsl(var(--gold)/0.1)] dark:shadow-[0_0_30px_hsl(var(--gold)/0.2)]">
                                {/* Sweep animation overlay inside box */}
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent w-full pointer-events-none"
                                />
                                <Dumbbell className="w-10 h-10 text-primary dark:text-gold-glow drop-shadow-[0_0_15px_hsl(var(--gold))] opacity-80 dark:opacity-100" />
                            </div>
                        </motion.div>

                        {/* Brand Typography */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="overflow-hidden">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="font-heading font-black text-4xl tracking-tight text-slate-900 dark:text-white flex gap-2"
                                >
                                    FLEX
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">
                                        GYM
                                    </span>
                                </motion.h1>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-body text-sm tracking-[0.3em] uppercase"
                            >
                                <Zap className="w-3 h-3 text-primary dark:text-gold-glow animate-pulse" />
                                <span>Command Center</span>
                            </motion.div>
                        </div>

                        {/* Luxury Loading Bar */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="h-[2px] bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mt-4 relative"
                        >
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 2.2, ease: "circInOut" }}
                                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan shadow-[0_0_10px_hsl(var(--gold))]"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
