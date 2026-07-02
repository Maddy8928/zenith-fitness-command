"use client";

import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, Star, ShieldCheck, Dumbbell, Crown, CheckCircle2 } from 'lucide-react';

const PLANS = [
    {
        id: 'basic',
        name: 'Standard Access',
        price: '₹7,499',
        billing: '/month',
        description: 'Complete access to cardio, weights, and standard locker rooms.',
        features: ['Full gym floor access', 'Standard locker rooms', '1 Group class/month', 'Fitness Assessment'],
        cardClass: 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-charcoal/30',
        buttonClass: 'bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-transparent',
        buttonText: 'Start Standard',
        glowClass: 'bg-[radial-gradient(circle,_hsl(var(--primary)/0.1),_transparent_70%)]',
        isPopular: false
    },
    {
        id: 'pro',
        name: 'Nexus Evolution',
        price: '₹12,499',
        billing: '/month',
        description: 'The complete Nexus experience with premium amenities and AI guidance.',
        features: ['Everything in Standard', 'Unlimited Elite Classes', 'Precision AI Body Scans', 'Premium Spa & Recovery', '2 Guest passes/month'],
        cardClass: 'border-primary dark:border-primary/50 bg-white dark:bg-charcoal/50 scale-105 shadow-[0_0_40px_hsl(var(--gold)/0.15)] dark:shadow-[0_0_40px_hsl(var(--gold)/0.1)]',
        buttonClass: 'bg-primary text-slate-900 hover:brightness-110 font-bold',
        buttonText: 'Join Evolution',
        glowClass: 'bg-[radial-gradient(circle,_hsl(var(--gold)/0.2),_transparent_70%)]',
        isPopular: true
    },
    {
        id: 'ultimate',
        name: 'Nexus VIP',
        price: '₹24,999',
        billing: '/month',
        description: 'Complete optimization with dedicated coaching.',
        features: [
            'Everything in Evolution',
            '4 Personal Training Sessions/mo',
            'Custom Nutrition Planning',
            'Unlimited Guest Passes',
            'Priority Class Booking',
            'VIP Locker & Laundry Service'
        ],
        buttonText: 'Become a VIP',
        buttonClass: 'bg-background hover:bg-white/5 border-neon-cyan/30 text-neon-cyan hover:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.2)]',
        cardClass: 'border-white/5 hover:border-neon-cyan/30 bg-charcoal/30',
        glowClass: 'from-transparent to-neon-cyan/5 group-hover:to-neon-cyan/10'
    }
];

export default function MembershipPlans() {
    return (
        <section id="plans" className="relative py-24 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_hsl(var(--gold)/0.03),_transparent_70%)] pointer-events-none blur-3xl translate-x-1/2 -translate-y-1/2" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 relative z-10">
                    <h2 className="text-sm font-heading font-bold uppercase tracking-[0.3em] text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Join The Ranks
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Membership <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Plans</span>
                    </h3>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Select a tier that aligns with your ambitions. Transparent pricing with no hidden enrollment fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-center relative z-10 max-w-6xl mx-auto">
                    {PLANS.map((plan, index) => {
                        return (
                            <div
                                key={plan.id}
                                className={`group relative rounded-[2rem] p-8 lg:p-10 transition-all duration-500 backdrop-blur-md border ${plan.cardClass} relative animate-in fade-in slide-in-from-bottom-10`}
                                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${plan.glowClass} opacity-50 rounded-[2rem] pointer-events-none transition-all duration-500`} />

                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-black text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_15px_hsl(var(--gold)/0.4)] whitespace-nowrap z-20">
                                        <Zap className="w-3 h-3" />
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-8">
                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 font-body text-sm h-10 mb-6">{plan.description}</p>
                                    </div>

                                    <div className="mb-8 flex items-baseline gap-1">
                                        {/* Removed the '$' span as it's now part of plan.price */}
                                        <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                                        <span className="text-slate-500 font-body font-medium">{plan.billing}</span>
                                    </div>

                                    <button className={`w-full py-4 rounded-xl font-bold tracking-wider uppercase flex justify-center items-center gap-2 border transition-all duration-300 mb-8 ${plan.buttonText === 'Join Elite' ? 'border-transparent' : ''} ${plan.buttonClass}`}>
                                        {plan.buttonText}
                                        {plan.buttonText !== 'Join Elite' && <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                                    </button>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${plan.isPopular ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                                                <span className={`text-sm font-body ${plan.isPopular ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
