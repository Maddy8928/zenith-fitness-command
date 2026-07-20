"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Trophy, 
    Flame, 
    Calendar, 
    Zap, 
    CheckCircle2, 
    Activity, 
    TrendingUp, 
    Clock, 
    ArrowRight, 
    Info, 
    CalendarCheck, 
    Award,
    Timer,
    Plus,
    User,
    Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

// --- Mock Data ---
const HYROX_PROGRAMS = [
    {
        id: 'hyrox-base',
        name: 'HYROX Base Engine',
        duration: '8 Weeks',
        frequency: '4 days/week',
        level: 'Intermediate',
        focus: 'Aerobic Capacity & Barbell Strength',
        description: 'Build your running engine and establish core physical strength across all 8 HYROX exercises. Recommended for first-time racers.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        schedule: [
            { day: 'Day 1', workout: 'Running Intervals (5x1km) + 50m Sled Push (102kg)', type: 'Endurance' },
            { day: 'Day 2', workout: '75 Wall Balls (6kg) + 1000m Row + 50m Sled Pull (78kg)', type: 'Strength' },
            { day: 'Day 3', workout: 'Recovery Run (6km) + Core Activation', type: 'Recovery' },
            { day: 'Day 4', workout: '4 Rounds of: 500m Run, 20 Burpee Broad Jumps, 20 Farmers Carry (24kg)', type: 'Simulation' },
        ]
    },
    {
        id: 'hyrox-power',
        name: 'Sled & Wall Ball Power',
        duration: '6 Weeks',
        frequency: '4 days/week',
        level: 'Advanced',
        focus: 'Leg Power & Functional Capacity',
        description: 'Targeted block to maximize your sled push speed, sled pull power, sandbag lunge endurance, and wall ball efficiency.',
        image: 'https://images.unsplash.com/photo-1434596955112-0f6219cba7d1?q=80&w=800&auto=format&fit=crop',
        schedule: [
            { day: 'Day 1', workout: '4x100m Sled Push (Max Weight) + 400m Run Recovery', type: 'Strength' },
            { day: 'Day 2', workout: '100 Wall Balls (9kg) for Time + 2000m SkiErg', type: 'Conditioning' },
            { day: 'Day 3', workout: '80m Walking Sandbag Lunges (20kg) + 1000m Rowing', type: 'Endurance' },
            { day: 'Day 4', workout: 'Half Sim: 4km Run, 50m Sled Push, 50m Sled Pull, 50 Wall Balls', type: 'Simulation' },
        ]
    },
    {
        id: 'hyrox-race',
        name: 'HYROX Race Sim Peak',
        duration: '4 Weeks',
        frequency: '5 days/week',
        level: 'Elite',
        focus: 'Pacing, Sim Training & Tapering',
        description: 'High-intensity event simulation prep. Learn how to manage heart rate spikes and maintain a steady running pace under fatigue.',
        image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop',
        schedule: [
            { day: 'Day 1', workout: 'Full HYROX Simulation (Sub-maximal effort pacing)', type: 'Simulation' },
            { day: 'Day 2', workout: 'SkiErg 1000m + Rowing 1000m + Running Pace Intervals', type: 'Endurance' },
            { day: 'Day 3', workout: 'Farmers Carry (32kg) + Burpee Broad Jumps Mobility', type: 'Recovery' },
            { day: 'Day 4', workout: 'Wall Ball Assault: 150 Reps (9kg/6kg) + 3km Tempo Run', type: 'Conditioning' },
            { day: 'Day 5', workout: 'Active Recovery Flow & Stretch', type: 'Recovery' }
        ]
    }
];

const HYROX_CHALLENGES = [
    { id: 'ch-1', title: 'Wall Ball 100 Time Trial', target: '100 reps for time (9kg Men / 6kg Women)', pb: '4:45', metric: 'Time (min:sec)' },
    { id: 'ch-2', title: 'Sled Push 50m Max Load', target: '50m push on turf for max weight', pb: '175 kg', metric: 'Weight (kg)' },
    { id: 'ch-3', title: '1000m Row Sprint', target: '1000m row on Concept2 for time', pb: '3:18', metric: 'Time (min:sec)' }
];

const HYROX_EVENTS = [
    { id: 'ev-1', title: 'Zenith HYROX Simulation Race', date: 'Jul 15, 2026', location: 'Zenith Elite Turf Area', entryFee: 'Free for VIP', status: 'Upcoming' },
    { id: 'ev-2', title: 'HYROX London Grand Prix', date: 'Oct 12, 2026', location: 'ExCeL London Exhibition Centre', entryFee: '£85', status: 'Official Race' },
    { id: 'ev-3', title: 'HYROX Munich World Series', date: 'Nov 30, 2026', location: 'Messe München', entryFee: '€95', status: 'Official Race' }
];

const performanceHistory = [
    { week: 'Wk 1', runTime: 29.5, sledPush: 6.2, rowPace: 1.58 },
    { week: 'Wk 2', runTime: 28.8, sledPush: 5.9, rowPace: 1.55 },
    { week: 'Wk 3', runTime: 28.1, sledPush: 5.5, rowPace: 1.53 },
    { week: 'Wk 4', runTime: 27.4, sledPush: 5.1, rowPace: 1.50 },
    { week: 'Wk 5', runTime: 26.9, sledPush: 4.8, rowPace: 1.48 },
    { week: 'Wk 6', runTime: 26.2, sledPush: 4.5, rowPace: 1.46 },
];

export default function HyroxPortalPage() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    
    // --- States ---
    const [isLocked, setIsLocked] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [registeredProgramId, setRegisteredProgramId] = useState<string | null>(null);
    const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});
    const [personalBests, setPersonalBests] = useState<Record<string, string>>({});
    const [joinedEvents, setJoinedEvents] = useState<Record<string, boolean>>({});
    const [allPrograms, setAllPrograms] = useState<typeof HYROX_PROGRAMS>(HYROX_PROGRAMS);
    
    // Input state for challenge submission
    const [challengeInputs, setChallengeInputs] = useState<Record<string, string>>({});

    // Load persisted state
    useEffect(() => {
        setIsMounted(true);
        const checkHyroxMembership = () => {
            try {
                const isHyroxActive = localStorage.getItem('zenith_hyrox_membership') === 'active';
                setIsLocked(!isHyroxActive);
            } catch (e) {
                setIsLocked(true);
            }
        };
        checkHyroxMembership();
        window.addEventListener('storage', checkHyroxMembership);
        window.addEventListener('focus', checkHyroxMembership);

        const savedProg = localStorage.getItem('zenith_hyrox_program_id');
        if (savedProg) setRegisteredProgramId(savedProg);

        const savedCompleted = localStorage.getItem('zenith_hyrox_completed_workouts');
        if (savedCompleted) {
            try { setCompletedWorkouts(JSON.parse(savedCompleted)); } catch(e) {}
        }

        const savedPBs = localStorage.getItem('zenith_hyrox_pbs');
        if (savedPBs) {
            try { setPersonalBests(JSON.parse(savedPBs)); } catch(e) {}
        }

        const savedEvents = localStorage.getItem('zenith_hyrox_events');
        if (savedEvents) {
            try { setJoinedEvents(JSON.parse(savedEvents)); } catch(e) {}
        }

        const savedTrainerProgs = localStorage.getItem('zenith_trainer_hyrox_programs');
        if (savedTrainerProgs) {
            try {
                setAllPrograms(JSON.parse(savedTrainerProgs));
            } catch (e) {}
        }

        return () => {
            window.removeEventListener('storage', checkHyroxMembership);
            window.removeEventListener('focus', checkHyroxMembership);
        };
    }, []);

    // Registration Actions
    const handleRegisterProgram = (id: string, name: string) => {
        if (registeredProgramId === id) {
            // Unregister
            setRegisteredProgramId(null);
            localStorage.removeItem('zenith_hyrox_program_id');
            setCompletedWorkouts({});
            localStorage.removeItem('zenith_hyrox_completed_workouts');
            toast.info(`Unregistered from ${name}`);
        } else {
            // Register
            setRegisteredProgramId(id);
            localStorage.setItem('zenith_hyrox_program_id', id);
            toast.success(`Successfully registered for ${name}!`, {
                description: "Your training schedule is now active."
            });

            // Send notification to Trainer Portal
            addNotification({
                role: 'trainer',
                category: 'MEMBER',
                priority: 'medium',
                title: '🏆 HYROX Program Registered',
                message: `${user?.name || 'Jane Smith'} (${user?.email || 'member@flexgym.com'}) registered for the "${name}" program.`,
                metadata: { programId: id, programName: name, memberName: user?.name, memberEmail: user?.email }
            });
        }
    };

    const activeProgram = allPrograms.find(p => p.id === registeredProgramId);

    // Workout Completion Toggle
    const handleToggleWorkout = (idx: number) => {
        if (!registeredProgramId) return;
        const key = `${registeredProgramId}_${idx}`;
        const updated = {
            ...completedWorkouts,
            [key]: !completedWorkouts[key]
        };
        setCompletedWorkouts(updated);
        localStorage.setItem('zenith_hyrox_completed_workouts', JSON.stringify(updated));

        if (updated[key]) {
            toast.success("Workout completed! Keep building that engine.");

            // Send notification to Trainer Portal
            if (activeProgram) {
                const workout = activeProgram.schedule[idx];
                addNotification({
                    role: 'trainer',
                    category: 'MEMBER',
                    priority: 'medium',
                    title: '🔥 HYROX Workout Completed',
                    message: `${user?.name || 'Jane Smith'} (${user?.email || 'member@flexgym.com'}) completed workout: "${workout.workout}" in program "${activeProgram.name}".`,
                    metadata: { programId: activeProgram.id, programName: activeProgram.name, workoutIndex: idx, workoutTitle: workout.workout, memberName: user?.name, memberEmail: user?.email }
                });
            }
        }
    };

    // Challenges Submission
    const handleChallengeSubmit = (id: string, title: string) => {
        const inputVal = challengeInputs[id];
        if (!inputVal || inputVal.trim() === '') {
            toast.error("Please enter a valid score before submitting.");
            return;
        }

        const updatedPBs = {
            ...personalBests,
            [id]: inputVal
        };
        setPersonalBests(updatedPBs);
        localStorage.setItem('zenith_hyrox_pbs', JSON.stringify(updatedPBs));

        toast.success(`New Personal Best logged for ${title}!`, {
            description: `PB set to: ${inputVal}`
        });

        // Send notification to Trainer Portal
        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'medium',
            title: '⚡ New HYROX Personal Best',
            message: `${user?.name || 'Jane Smith'} (${user?.email || 'member@flexgym.com'}) set a new PB of ${inputVal} for "${title}".`,
            metadata: { challengeId: id, challengeTitle: title, score: inputVal, memberName: user?.name, memberEmail: user?.email }
        });

        // Clear input
        setChallengeInputs({ ...challengeInputs, [id]: '' });
    };

    // Event Registration Toggle
    const handleJoinEvent = (id: string, title: string) => {
        const updated = {
            ...joinedEvents,
            [id]: !joinedEvents[id]
        };
        setJoinedEvents(updated);
        localStorage.setItem('zenith_hyrox_events', JSON.stringify(updated));

        if (updated[id]) {
            toast.success(`Registered for event!`, {
                description: `You are signed up for ${title}. See you on race day!`
            });

            // Send notification to Trainer Portal
            addNotification({
                role: 'trainer',
                category: 'MEMBER',
                priority: 'medium',
                title: '🏁 HYROX Race Registration',
                message: `${user?.name || 'Jane Smith'} (${user?.email || 'member@flexgym.com'}) signed up for "${title}".`,
                metadata: { eventId: id, eventTitle: title, memberName: user?.name, memberEmail: user?.email }
            });
        } else {
            toast.info(`Cancelled registration for ${title}`);
        }
    };

    // Calculate schedule progress percentage
    const getProgressPercentage = () => {
        if (!activeProgram) return 0;
        const total = activeProgram.schedule.length;
        const done = activeProgram.schedule.filter((_, idx) => completedWorkouts[`${activeProgram.id}_${idx}`]).length;
        return Math.round((done / total) * 100);
    };

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="max-w-3xl mx-auto my-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
                    {/* Glowing radial gradient backdrop */}
                    <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                    {/* Lock Emblem & Trophy */}
                    <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-primary/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                            <Trophy className="w-10 h-10 text-primary dark:text-gold-glow animate-pulse" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-md">
                            <Lock className="w-4 h-4 text-violet-400" />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit mb-4">
                        <Lock className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-bold text-violet-400 tracking-widest uppercase">HYROX Membership Required</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-heading font-black text-white uppercase italic tracking-tight mb-4">
                        HYROX <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Arena Access</span>
                    </h1>
                    
                    <p className="text-slate-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
                        To access the specialized HYROX athletic training hub, you must purchase a HYROX Arena Membership.
                    </p>

                    {/* Features List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl text-left mb-10">
                        {[
                            { title: "Elite HYROX Programs", desc: "Base Engine, Sled & Wall Ball Power, and Race Sim Peak blocks." },
                            { title: "Turf Metric Tracking", desc: "Sync and track run pacing, sled weights, Skierg and row times." },
                            { title: "Weekly Interactive Schedules", desc: "Complete daily fitness routines prescribed by elite coaching staff." },
                            { title: "Zenith Simulated Races", desc: "Register for exclusive mock races on our turf and qualify for official events." }
                        ].map((feat, i) => (
                            <div key={i} className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-violet-500/10 transition-all flex gap-3">
                                <div className="p-1 h-fit rounded-lg bg-primary/10 text-primary mt-0.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{feat.title}</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Callouts */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link 
                            href="/member/billing?pkg=hyrox"
                            className="py-4 px-8 bg-gradient-to-r from-primary to-accent hover:brightness-110 text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-primary/15 text-center flex items-center justify-center gap-2 group"
                        >
                            Purchase HYROX Membership
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            href="/member"
                            className="py-4 px-8 bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all text-center flex items-center justify-center"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary/10 via-transparent to-accent/5 p-6 md:p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit mb-2">
                        <Trophy className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-xs font-bold text-primary tracking-wider uppercase">HYROX Elite Partner</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-white uppercase italic tracking-tight">
                        HYROX <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Training Hub</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-lg">
                        Access specialized athletic conditioning programs, tracking charts, events, and community challenges.
                    </p>
                </div>

                {activeProgram && (
                    <div className="relative z-10 flex flex-col gap-1.5 p-4 rounded-2xl bg-primary/5 border border-primary/20 max-w-sm w-full md:w-auto">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Active Program</span>
                        <span className="text-sm font-bold text-white truncate">{activeProgram.name}</span>
                        <div className="flex items-center gap-4 mt-2">
                            <Progress value={getProgressPercentage()} className="h-1.5 w-32 [&>div]:bg-primary" />
                            <span className="text-xs font-mono font-bold text-white shrink-0">{getProgressPercentage()}% Done</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Tabs Navigation */}
            <Tabs defaultValue="analytics" className="w-full space-y-6">
                <TabsList className="flex flex-wrap h-auto bg-slate-900 border border-slate-800 p-1.5 rounded-2xl md:w-fit gap-1">
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider py-2 px-4">Analytics & Logs</TabsTrigger>
                    <TabsTrigger value="programs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider py-2 px-4">Training Programs</TabsTrigger>
                    <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider py-2 px-4">Weekly Schedule</TabsTrigger>
                    <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider py-2 px-4">Challenges</TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider py-2 px-4">Upcoming Races</TabsTrigger>
                </TabsList>

                {/* TAB 1: Analytics & Tracking */}
                <TabsContent value="analytics" className="space-y-6 animate-in fade-in duration-300">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "PFT Score", value: "82.5", sub: "Percentile Rank", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
                            { label: "Completed Workouts", value: Object.values(completedWorkouts).filter(Boolean).length.toString(), sub: "Total logged", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            { label: "Est. 1km Pace", value: "4m 12s", sub: "Under fatigue", icon: Timer, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                            { label: "Max Sled Push", value: `${personalBests['ch-2'] || '175 kg'}`, sub: "Turf track load", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all flex flex-col justify-between min-h-[110px]">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                                    <h3 className="text-xl font-black text-white leading-none">{stat.value}</h3>
                                    <p className="text-[9px] text-slate-500 mt-1">{stat.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Charts Area */}
                        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" /> Aerobic Pace & Sled Push Progression
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Tracking run speed vs. sled velocity metrics over 6 weeks</p>
                            </div>
                            
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid hsl(var(--primary)/0.2)', borderRadius: '12px', color: '#fff' }}
                                        />
                                        <Area type="monotone" name="1km Run Pace (min)" dataKey="runTime" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRun)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Performance Logs */}
                        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" /> Personal Records (PB)
                                </h3>
                                <div className="space-y-4">
                                    {HYROX_CHALLENGES.map((ch) => {
                                        const pbVal = personalBests[ch.id] || ch.pb;
                                        return (
                                            <div key={ch.id} className="flex justify-between items-center p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                                                <div>
                                                    <p className="text-xs font-bold text-white truncate max-w-[180px]">{ch.title}</p>
                                                    <p className="text-[9px] text-slate-500 mt-0.5">{ch.target.split(' ')[0]} target</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-primary font-mono">{pbVal}</span>
                                                    <span className="block text-[8px] text-slate-500 uppercase font-black">Logged PB</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 leading-relaxed">
                                * Your performance stats are synced with active turf tracking. Submit results in the challenges tab to log new records.
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: Training Programs */}
                <TabsContent value="programs" className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {allPrograms.map((program) => {
                            const isRegistered = registeredProgramId === program.id;
                            
                            return (
                                <Card 
                                    key={program.id}
                                    className={`glass-card border overflow-hidden flex flex-col h-full ${
                                        isRegistered 
                                        ? 'border-primary/50 bg-primary/[0.01]' 
                                        : 'border-white/5 hover:border-primary/30 transition-all duration-300'
                                    }`}
                                >
                                    {/* Program Header Image */}
                                    <div className="relative h-44 w-full">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                                        <img 
                                            src={program.image} 
                                            alt={program.name} 
                                            className="object-cover w-full h-full"
                                        />
                                        <div className="absolute top-3 left-3 z-20 flex gap-2">
                                            <Badge className="bg-primary text-primary-foreground font-bold uppercase text-[9px] tracking-wider border-none px-2.5 py-1">
                                                {program.level}
                                            </Badge>
                                            <Badge className="bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[9px] tracking-wider border border-white/10 px-2.5 py-1">
                                                {program.duration}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Program Details */}
                                    <CardContent className="p-5 flex-1 flex flex-col justify-between gap-5">
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-white leading-snug">{program.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{program.frequency}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">{program.description}</p>
                                            
                                            <div className="pt-2">
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Focus Target</span>
                                                <span className="text-[11px] text-white font-medium">{program.focus}</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleRegisterProgram(program.id, program.name)}
                                            className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                                isRegistered 
                                                ? 'bg-slate-950 border border-primary/40 text-primary hover:bg-primary/10' 
                                                : 'bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20'
                                            }`}
                                        >
                                            {isRegistered ? 'Unregister Program' : 'Register Program'}
                                        </button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* TAB 3: Weekly Schedule */}
                <TabsContent value="schedule" className="space-y-6 animate-in fade-in duration-300">
                    {!registeredProgramId ? (
                        <div className="py-16 text-center max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-900 border border-dashed border-white/10 flex items-center justify-center mx-auto text-slate-500">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">No Active Program</h3>
                                <p className="text-xs text-slate-500 mt-1">Please select and register for a training program under the **Training Programs** tab to activate your workout schedule.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                <div>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Workout Schedule Active</p>
                                    <h3 className="text-lg font-bold text-white">{activeProgram?.name}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-white">{activeProgram?.duration}</span>
                                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">{activeProgram?.frequency}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeProgram?.schedule.map((slot, idx) => {
                                    const key = `${activeProgram.id}_${idx}`;
                                    const isDone = completedWorkouts[key];

                                    return (
                                        <div 
                                            key={idx}
                                            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 ${
                                                isDone 
                                                ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75' 
                                                : 'bg-slate-900/60 border-white/5 hover:border-primary/30'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{slot.day}</span>
                                                    <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${
                                                        slot.type === 'Simulation' ? 'border-red-500/20 text-red-400 bg-red-500/5' :
                                                        slot.type === 'Strength' ? 'border-primary/20 text-primary bg-primary/5' :
                                                        slot.type === 'Recovery' ? 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' :
                                                        'border-blue-500/20 text-blue-400 bg-blue-500/5'
                                                    }`}>
                                                        {slot.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-bold text-white leading-relaxed">{slot.workout}</p>
                                            </div>

                                            <button 
                                                onClick={() => handleToggleWorkout(idx)}
                                                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                                                    isDone 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                    : 'bg-slate-950 border-white/5 hover:border-primary/40 text-slate-300'
                                                }`}
                                            >
                                                {isDone ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Completed
                                                    </>
                                                ) : (
                                                    'Mark Completed'
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* TAB 4: Challenges */}
                <TabsContent value="challenges" className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {HYROX_CHALLENGES.map((ch) => {
                            const currentPB = personalBests[ch.id] || ch.pb;
                            const inputVal = challengeInputs[ch.id] || '';

                            return (
                                <Card key={ch.id} className="glass-card border border-white/5 p-6 flex flex-col justify-between gap-6 hover:border-primary/20 transition-all">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase tracking-wider font-bold">Turf Challenge</Badge>
                                            <span className="text-[10px] text-slate-500 font-mono">Concept2 / Turf</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white leading-snug">{ch.title}</h3>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ch.target}</p>
                                        </div>
                                        
                                        <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Personal Best</span>
                                            <span className="text-sm font-black text-primary font-mono">{currentPB}</span>
                                        </div>
                                    </div>

                                    {/* Submit score input */}
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder={ch.metric} 
                                                value={inputVal}
                                                onChange={(e) => setChallengeInputs({ ...challengeInputs, [ch.id]: e.target.value })}
                                                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary/40 w-full"
                                            />
                                            <button 
                                                onClick={() => handleChallengeSubmit(ch.id, ch.title)}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase px-4 rounded-xl transition-all"
                                            >
                                                Log
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* TAB 5: Upcoming Events */}
                <TabsContent value="events" className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {HYROX_EVENTS.map((event) => {
                            const isJoined = joinedEvents[event.id];

                            return (
                                <div 
                                    key={event.id}
                                    className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                                        isJoined 
                                        ? 'bg-primary/[0.02] border-primary/40' 
                                        : 'bg-slate-900/60 border-white/5 hover:border-primary/30'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                event.status === 'Official Race' ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-300'
                                            }`}>
                                                {event.status}
                                            </span>
                                            <span className="text-xs text-slate-500 font-bold font-mono">{event.date}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{event.title}</h3>
                                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5 text-slate-500" />
                                            {event.location} • <span className="text-primary font-semibold">{event.entryFee}</span>
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => handleJoinEvent(event.id, event.title)}
                                        className={`w-full md:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            isJoined 
                                            ? 'bg-slate-950 border border-primary/30 text-primary hover:bg-primary/10' 
                                            : 'bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/15'
                                        }`}
                                    >
                                        {isJoined ? 'Registered ✓' : 'Register for Race'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
