"use client";

import React, { useState, useEffect } from "react";
import { Star, Flame, Calendar, Trophy, Zap, ArrowRight, Play, CheckCircle2, MessageSquare, Coffee, Lock, Snowflake } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMembershipFreeze } from "@/lib/membership-freeze-store";

const progressData = [
    { day: 'Mon', calories: 450, duration: 45 },
    { day: 'Tue', calories: 600, duration: 60 },
    { day: 'Wed', calories: 300, duration: 30 },
    { day: 'Thu', calories: 550, duration: 55 },
    { day: 'Fri', calories: 750, duration: 75 },
    { day: 'Sat', calories: 850, duration: 90 },
    { day: 'Sun', calories: 0, duration: 0 },
];

const upcomingClasses = [
    { id: 1, name: "HIIT Intensity", time: "Today, 5:30 PM", instructor: "Alex J.", difficulty: "Hard" },
    { id: 2, name: "Vinyasa Flow", time: "Tomorrow, 7:00 AM", instructor: "Sarah W.", difficulty: "Medium" },
    { id: 3, name: "Core Crusher", time: "Wed, 6:00 PM", instructor: "Mike T.", difficulty: "Hard" },
];

export default function MemberDashboard() {
    const [isWorkoutsLocked, setIsWorkoutsLocked] = useState(true);
    const { activeFreeze } = useMembershipFreeze(1);

    useEffect(() => {
        const checkLock = () => {
            try {
                const ptRaw = localStorage.getItem('zenith_pt_status');
                const trialsRaw = localStorage.getItem('zenith_trainer_trials');
                const pt = ptRaw ? JSON.parse(ptRaw) : {};
                const trials = trialsRaw ? JSON.parse(trialsRaw) : {};

                const trialCompleted = pt.trialCompleted ||
                    Object.values(trials).some((t: any) => t.status === 'approved' || t.status === 'completed');
                const trainerSelected = pt.trainerSelected || !!localStorage.getItem('zenith_preferred_trainer_id');
                const paymentCompleted = !!pt.paymentCompleted || pt.status === 'paid';
                const trainerApproved = !!pt.trainerApproved || pt.status === 'paid';
                const allDone = pt.status === 'paid' || !!pt.paymentCompleted;
                setIsWorkoutsLocked(!allDone);
            } catch (e) {
                setIsWorkoutsLocked(true);
            }
        };

        checkLock();
        window.addEventListener('storage', checkLock);
        window.addEventListener('focus', checkLock);
        return () => {
            window.removeEventListener('storage', checkLock);
            window.removeEventListener('focus', checkLock);
        };
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Prominent Membership Frozen Banner */}
            {activeFreeze && (
                <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border-2 border-cyan-500/40 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                                <Snowflake className="w-3.5 h-3.5" />
                                <span>Membership Frozen</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-heading font-black text-white">
                                Your Gym Access is Temporarily Suspended
                            </h2>
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                Your membership duration has been extended by exactly <strong className="text-cyan-300">{activeFreeze.totalDays} frozen days</strong>. While frozen, digital QR check-in and gym terminal access are temporarily suspended. All your workout history, progress data, and payment records remain preserved.
                            </p>
                        </div>

                        <div className="w-full lg:w-auto bg-black/40 border border-cyan-500/30 p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 shrink-0 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Freeze Period</span>
                                <span className="font-bold text-white text-sm mt-0.5 block">{activeFreeze.startDate} — {activeFreeze.endDate}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Resume Date</span>
                                <span className="font-bold text-cyan-300 text-sm mt-0.5 block">{activeFreeze.endDate}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Previous Expiry</span>
                                <span className="font-bold text-slate-300 text-sm mt-0.5 block">{activeFreeze.oldExpiryDate}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">New Expiry</span>
                                <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{activeFreeze.newExpiryDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary/10 via-transparent to-accent/5 p-6 md:p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-gold-glow/10 border border-primary/20 dark:border-gold-glow/20 w-fit mb-2">
                        <Star className="w-4 h-4 text-primary dark:text-gold-glow fill-primary dark:fill-gold-glow" />
                        <span className="text-xs font-bold text-primary dark:text-gold-glow tracking-wider uppercase">VIP Member</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground dark:text-white mt-1">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-white">Alex!</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base max-w-lg">
                        You're on a 5-day streak. Keep pushing towards your goals. Your next scheduled session is in 4 hours.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 w-full md:w-auto">
                    {activeFreeze ? (
                        <button
                            disabled
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-semibold cursor-not-allowed whitespace-nowrap opacity-80"
                        >
                            <Snowflake className="w-4 h-4" />
                            Access Frozen ({activeFreeze.totalDays} Days)
                        </button>
                    ) : isWorkoutsLocked ? (
                        <Link href="/member/plans" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-350 hover:text-white font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap">
                            <Lock className="w-4 h-4 text-slate-400" />
                            Unlock Workouts
                        </Link>
                    ) : (
                        <Link href="/member/workout/active" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                            <Play className="w-4 h-4 fill-current" />
                            Start Workout
                        </Link>
                    )}
                    <Link href="/member/steam-massage" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary/20 bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        <Star className="w-4 h-4" />
                        Recovery Hub
                    </Link>
                    <Link href="/member/cafe" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        <Coffee className="w-4 h-4" />
                        Cafe Fuel
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Active Streak", value: "5 Days", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Workouts", value: "24", sub: "This Month", icon: Zap, color: "text-primary dark:text-gold-glow", bg: "bg-primary/10" },
                    { label: "Recovery", value: "78%", sub: "Ready for HIIT", icon: Star, color: "text-primary dark:text-gold-glow", bg: "bg-primary/10" },
                    { label: "Next Payment", value: "Oct 15", sub: "₹7,499", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Milestones", value: "Level 12", sub: "Titan Rank", icon: Trophy, color: "text-amber-600 dark:text-yellow-500", bg: "bg-amber-500/10 dark:bg-yellow-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-primary/10 hover:border-slate-300 dark:hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[120px]">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-5 h-5" />
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-heading font-bold text-foreground dark:text-white leading-none">{stat.value}</h3>
                            {stat.sub && <p className="text-[10px] text-muted-foreground mt-1.5">{stat.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Chart (Takes up 2 columns) */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-primary/10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground dark:text-white">Activity Overview</h3>
                            <p className="text-sm text-muted-foreground">Calories burned this week</p>
                        </div>
                        <select className="bg-transparent border border-primary/20 text-foreground text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer">
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--foreground)/0.1)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--primary)/0.2)', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Classes Sidebar */}
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-primary/10 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-heading font-bold text-foreground dark:text-white">Next Up</h3>
                        <button className="text-xs font-semibold text-primary dark:text-gold-glow hover:underline underline-offset-4">View All</button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {upcomingClasses.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-primary/5 hover:border-slate-200 dark:hover:border-primary/30 transition-colors group cursor-pointer relative overflow-hidden">
                                {/* Card Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-foreground dark:text-white leading-tight">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {item.time}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                                            With: <span className="text-primary dark:text-gold-glow font-medium">{item.instructor}</span>
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${item.difficulty === 'Hard' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {item.difficulty}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50/50 hover:bg-slate-100 dark:bg-background/50 dark:hover:bg-primary/10 transition-colors text-sm font-medium text-slate-800 dark:text-slate-200">
                        Book a Class
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
