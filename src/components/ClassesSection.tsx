"use client";

import { ArrowRight, Clock, Users, Flame, CalendarDays, Activity } from 'lucide-react';

const CLASSES = [
    {
        id: 'hiit-extreme',
        title: 'HIIT Extreme',
        instructor: 'Marcus Johnson',
        time: 'Today, 5:30 PM',
        duration: '45 Min',
        difficulty: 'Hardcore',
        spotsLeft: 3,
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
        color: 'from-rose-500/20 to-red-600/20',
        accent: 'text-rose-500',
        bgAccent: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        borderHover: 'group-hover:border-rose-500/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--destructive)/0.2)]'
    },
    {
        id: 'power-yoga',
        title: 'Power Yoga',
        instructor: 'Sarah Jenkins',
        time: 'Tomorrow, 7:00 AM',
        duration: '60 Min',
        difficulty: 'Intermediate',
        spotsLeft: 8,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        color: 'from-emerald-500/20 to-teal-600/20',
        accent: 'text-emerald-400',
        bgAccent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        borderHover: 'group-hover:border-emerald-500/50',
        shadowHover: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
    },
    {
        id: 'spin-core',
        title: 'Spin & Core',
        instructor: 'Emma Wilson',
        time: 'Wed, 6:00 PM',
        duration: '50 Min',
        difficulty: 'Advanced',
        spotsLeft: 12,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        color: 'from-cyan-500/20 to-blue-600/20',
        accent: 'text-neon-cyan',
        bgAccent: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        borderHover: 'group-hover:border-neon-cyan/50',
        shadowHover: 'hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.15)]'
    }
];

export default function ClassesSection() {
    return (
        <section id="classes" className="relative py-24 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_hsl(var(--fuchsia)/0.03),_transparent_70%)] pointer-events-none blur-3xl" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 relative z-10">
                    <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5">
                            <Activity className="w-4 h-4 text-fuchsia-500" />
                            <span className="text-xs font-heading font-semibold text-fuchsia-500 uppercase tracking-widest">
                                Elite Programming
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2">
                            Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500">Classes</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground text-lg max-w-xl">
                            Transform your routine with expertly designed group sessions tailored for all intensity levels.
                        </p>
                    </div>

                    <button className="group relative px-6 py-3 bg-background/50 hover:bg-background/80 border border-primary/20 hover:border-primary/50 rounded-xl transition-all duration-300 overflow-hidden shadow-soft shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                        <span className="relative z-10 flex items-center gap-2 text-foreground font-semibold tracking-wide group-hover:text-primary transition-colors">
                            <CalendarDays className="w-4 h-4" />
                            Full Schedule
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {CLASSES.map((cls, index) => {
                        return (
                            <div
                                key={cls.id}
                                className={`group relative glass-card p-[2px] rounded-3xl overflow-hidden transition-all duration-500 border border-white/5 ${cls.borderHover} ${cls.shadowHover} animate-in fade-in slide-in-from-bottom-10 flex flex-col`}
                                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className="relative h-56 w-full rounded-[22px] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                    <img
                                        src={cls.image}
                                        alt={cls.title}
                                        className="object-cover w-full h-full scale-100 group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                                    />

                                    {/* Top Tags */}
                                    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${cls.bgAccent}`}>
                                            {cls.difficulty}
                                        </div>
                                        {cls.spotsLeft <= 5 && (
                                            <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-black shadow-[0_0_15px_hsl(var(--gold)/0.4)] flex items-center gap-1 animate-pulse">
                                                <Flame className="w-3 h-3" />
                                                {cls.spotsLeft} Spots Left
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Image Info */}
                                    <div className="absolute bottom-4 left-4 right-4 z-20">
                                        <h3 className="text-2xl font-black text-white mb-1 shadow-black/50 drop-shadow-md">
                                            {cls.title}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-300 flex items-center gap-1.5 drop-shadow-md">
                                            <Users className="w-3.5 h-3.5" />
                                            {cls.instructor}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-black/40 rounded-b-[22px] border-t border-slate-100 dark:border-white/5 mt-[-2px] relative z-20">
                                    <div className="flex justify-between items-center mb-6 px-1">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground dark:text-slate-300">
                                            <Clock className={`w-4 h-4 ${cls.accent}`} />
                                            {cls.time}
                                        </div>
                                        <div className="text-sm text-muted-foreground/60 dark:text-slate-400 font-medium">
                                            {cls.duration}
                                        </div>
                                    </div>

                                    <button className={`w-full py-3 rounded-xl border font-bold uppercase tracking-wider transition-all duration-300 ${cls.bgAccent} hover:brightness-125 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                                        Book Class
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
