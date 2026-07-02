"use client";

import { Trophy, Zap, Timer, Target, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const EXERCISES = [
    { name: 'SkiErg', desc: '1000m conditioning focusing on upper body and core power.' },
    { name: 'Sled Push', desc: '50m turf push targeting leg strength and core drive.' },
    { name: 'Sled Pull', desc: '50m sled pull maximizing posterior chain engagement.' },
    { name: 'Burpee Broad Jumps', desc: '80m plyometric power and full body conditioning.' },
    { name: 'Rowing', desc: '1000m aerobic capacity and rowing endurance focus.' },
    { name: 'Farmers Carry', desc: '200m heavy grip strength and core stabilization work.' },
    { name: 'Sandbag Lunges', desc: '100m functional leg power and balance under fatigue.' },
    { name: 'Wall Balls', desc: '100 reps of explosive leg and shoulder endurance.' }
];

export default function HyroxSection() {
    return (
        <section id="hyrox" className="relative py-24 px-6 overflow-hidden bg-black/40 border-y border-primary/5">
            {/* Background Decorative Effects */}
            <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(245,158,11,0.03),_transparent_70%)] pointer-events-none blur-3xl" />
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_hsl(var(--primary)/0.02),_transparent_75%)] pointer-events-none blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5">
                        <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                        <span className="text-xs font-heading font-semibold text-amber-500 uppercase tracking-widest">
                            Official HYROX Prep Facility
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2">
                        Race Prep & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-primary">Conditioning</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto font-body">
                        Zenith is equipped with dedicated turf tracks, Concept2 rowers, SkiErgs, and high-performance equipment. Conquer the world’s greatest fitness race.
                    </p>
                </div>

                {/* Programs Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        {
                            title: 'HYROX Base Engine',
                            description: 'Build your running engine and establish core physical strength across all 8 HYROX exercises. Recommended for first-time racers.',
                            duration: '8 Weeks',
                            difficulty: 'Intermediate',
                            icon: Timer
                        },
                        {
                            title: 'Sled & Wall Ball Power',
                            description: 'Targeted block to maximize your sled push speed, sled pull power, sandbag lunge endurance, and wall ball efficiency.',
                            duration: '6 Weeks',
                            difficulty: 'Advanced',
                            icon: Zap
                        },
                        {
                            title: 'Race Sim Peak',
                            description: 'High-intensity event simulation prep. Learn how to manage heart rate spikes and maintain a steady running pace under fatigue.',
                            duration: '4 Weeks',
                            difficulty: 'Elite',
                            icon: Target
                        }
                    ].map((prog, idx) => {
                        const Icon = prog.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative glass-card p-8 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-xl font-bold text-foreground group-hover:text-white transition-colors">{prog.title}</h3>
                                            <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">{prog.difficulty}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{prog.duration} • Training Plan</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">
                                        {prog.description}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                    <Link href="/login" className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline">
                                        Activate Program <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 8 Exercises Preview Grid */}
                <div className="glass-card rounded-[2.5rem] border border-white/5 p-8 md:p-10 bg-slate-950/20 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-8">
                        <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">The 8 HYROX Disciplines</h3>
                            <p className="text-xs text-slate-500">Mastered and simulated weekly on our official turf zone</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {EXERCISES.map((ex, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-amber-500/15 transition-all">
                                <span className="text-xs font-mono font-black text-amber-500/30">0{idx + 1}</span>
                                <h4 className="text-sm font-bold text-white mt-1">{ex.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{ex.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
