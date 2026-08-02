'use client';

import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import {
    TrendingUp, Dumbbell, Activity, Flame, Trophy, Calendar, Plus, RotateCcw,
    CheckCircle2, ArrowUpRight, ArrowDownRight, User, Target, Shield, Sparkles,
    MessageSquare, HeartPulse, Scale, Award, Zap, Check, Ruler, Lock, AlertCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export interface FitnessProfile {
    height: number; // cm
    currentWeight: number; // kg
    goalWeight: number; // kg
    initialWeight: number; // kg
    age: number;
    gender: string;
    fitnessGoal: string;
    benchPR: number; // kg
    squatPR: number; // kg
    deadliftPR: number; // kg
    initialBenchPR: number;
    initialSquatPR: number;
    initialDeadliftPR: number;
    setupDate: string;
}

export interface ProgressEntry {
    id: string;
    date: string;
    weight: number;
    benchPR: number;
    squatPR: number;
    deadliftPR: number;
    note: string;
}

const DEFAULT_PROFILE: FitnessProfile = {
    height: 178,
    currentWeight: 79,
    goalWeight: 75,
    initialWeight: 82,
    age: 26,
    gender: 'Male',
    fitnessGoal: 'Fat Loss',
    benchPR: 95,
    squatPR: 130,
    deadliftPR: 160,
    initialBenchPR: 85,
    initialSquatPR: 115,
    initialDeadliftPR: 140,
    setupDate: 'May 01, 2026'
};

const DEFAULT_HISTORY: ProgressEntry[] = [
    {
        id: '1',
        date: 'May 01, 2026',
        weight: 82,
        benchPR: 85,
        squatPR: 115,
        deadliftPR: 140,
        note: 'Initial Baseline Assessment'
    },
    {
        id: '2',
        date: 'Jun 01, 2026',
        weight: 80.5,
        benchPR: 90,
        squatPR: 122.5,
        deadliftPR: 150,
        note: 'Month 1 Progress Assessment'
    },
    {
        id: '3',
        date: 'Jul 29, 2026',
        weight: 79,
        benchPR: 95,
        squatPR: 130,
        deadliftPR: 160,
        note: 'Current Profile Status'
    }
];

export default function MemberProgressPage() {
    const [isProfileSetup, setIsProfileSetup] = useState<boolean | null>(null);
    const [profile, setProfile] = useState<FitnessProfile>(DEFAULT_PROFILE);
    const [history, setHistory] = useState<ProgressEntry[]>(DEFAULT_HISTORY);

    // First-time setup wizard form state
    const [setupForm, setSetupForm] = useState<{
        height: number | '';
        currentWeight: number | '';
        goalWeight: number | '';
        age: number | '';
        gender: string;
        fitnessGoal: string;
        benchPR: number | '';
        squatPR: number | '';
        deadliftPR: number | '';
    }>({
        height: 178,
        currentWeight: 82,
        goalWeight: 75,
        age: 26,
        gender: 'Male',
        fitnessGoal: 'Fat Loss',
        benchPR: 85,
        squatPR: 115,
        deadliftPR: 140,
    });

    // Update Progress Modal state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        currentWeight: 79,
        benchPR: 95,
        squatPR: 130,
        deadliftPR: 160,
        note: ''
    });

    // Personal Training Status state
    const [ptStatus, setPtStatus] = useState<any>({});
    const [isPTActive, setIsPTActive] = useState(false);

    // Load state from localStorage on mount
    const loadProgressData = () => {
        try {
            const savedProfile = localStorage.getItem('zenith_member_fitness_profile');
            const savedHistory = localStorage.getItem('zenith_member_progress_history');
            const savedPT = localStorage.getItem('zenith_pt_status');

            if (savedProfile) {
                const p: FitnessProfile = JSON.parse(savedProfile);
                setProfile(p);
                setIsProfileSetup(true);
                setUpdateForm({
                    currentWeight: p.currentWeight,
                    benchPR: p.benchPR,
                    squatPR: p.squatPR,
                    deadliftPR: p.deadliftPR,
                    note: ''
                });
            } else {
                setIsProfileSetup(false);
            }

            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            } else {
                setHistory(DEFAULT_HISTORY);
            }

            if (savedPT) {
                const parsedPT = JSON.parse(savedPT);
                setPtStatus(parsedPT);
                setIsPTActive(parsedPT?.status === 'paid' || !!parsedPT?.paymentCompleted);
            } else {
                setIsPTActive(false);
            }
        } catch (e) {
            setIsProfileSetup(false);
        }
    };

    useEffect(() => {
        loadProgressData();
        const handler = () => loadProgressData();
        window.addEventListener('storage', handler);
        window.addEventListener('focus', handler);
        return () => {
            window.removeEventListener('storage', handler);
            window.removeEventListener('focus', handler);
        };
    }, []);

    // Handle initial First-Time Profile Setup Submission
    const handleCompleteSetup = (e: React.FormEvent) => {
        e.preventDefault();
        const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newProfile: FitnessProfile = {
            height: Number(setupForm.height),
            currentWeight: Number(setupForm.currentWeight),
            goalWeight: Number(setupForm.goalWeight),
            initialWeight: Number(setupForm.currentWeight),
            age: Number(setupForm.age),
            gender: setupForm.gender,
            fitnessGoal: setupForm.fitnessGoal,
            benchPR: Number(setupForm.benchPR),
            squatPR: Number(setupForm.squatPR),
            deadliftPR: Number(setupForm.deadliftPR),
            initialBenchPR: Number(setupForm.benchPR),
            initialSquatPR: Number(setupForm.squatPR),
            initialDeadliftPR: Number(setupForm.deadliftPR),
            setupDate: todayStr
        };

        const initialHistory: ProgressEntry[] = [
            {
                id: `entry_${Date.now()}`,
                date: todayStr,
                weight: Number(setupForm.currentWeight),
                benchPR: Number(setupForm.benchPR),
                squatPR: Number(setupForm.squatPR),
                deadliftPR: Number(setupForm.deadliftPR),
                note: 'Initial Fitness Profile Setup'
            }
        ];

        localStorage.setItem('zenith_member_fitness_profile', JSON.stringify(newProfile));
        localStorage.setItem('zenith_member_progress_history', JSON.stringify(initialHistory));
        setProfile(newProfile);
        setHistory(initialHistory);
        setIsProfileSetup(true);
        window.dispatchEvent(new Event('storage'));

        toast.success("Fitness Profile Activated!", {
            description: "Your Progress Dashboard is now unlocked and tracking your metrics."
        });
    };

    // Handle Update Progress Submission
    const handleSaveProgressUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const updatedProfile: FitnessProfile = {
            ...profile,
            currentWeight: Number(updateForm.currentWeight),
            benchPR: Number(updateForm.benchPR),
            squatPR: Number(updateForm.squatPR),
            deadliftPR: Number(updateForm.deadliftPR)
        };

        const newEntry: ProgressEntry = {
            id: `entry_${Date.now()}`,
            date: todayStr,
            weight: Number(updateForm.currentWeight),
            benchPR: Number(updateForm.benchPR),
            squatPR: Number(updateForm.squatPR),
            deadliftPR: Number(updateForm.deadliftPR),
            note: updateForm.note.trim() || 'Manual Progress Check-in'
        };

        const updatedHistory = [...history, newEntry];

        localStorage.setItem('zenith_member_fitness_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('zenith_member_progress_history', JSON.stringify(updatedHistory));

        setProfile(updatedProfile);
        setHistory(updatedHistory);
        setIsUpdateModalOpen(false);
        setUpdateForm({
            ...updateForm,
            note: ''
        });
        window.dispatchEvent(new Event('storage'));

        toast.success("Progress Updated!", {
            description: "Your Weight, BMI, and Strength PR Charts have been recalculated."
        });
    };

    // Handle demo reset
    const handleResetSetup = () => {
        localStorage.removeItem('zenith_member_fitness_profile');
        localStorage.removeItem('zenith_member_progress_history');
        setIsProfileSetup(false);
        setSetupForm({
            height: 178,
            currentWeight: 82,
            goalWeight: 75,
            age: 26,
            gender: 'Male',
            fitnessGoal: 'Fat Loss',
            benchPR: 85,
            squatPR: 115,
            deadliftPR: 140,
        });
        toast.info("Profile Setup reset for demonstration.");
    };

    if (isProfileSetup === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-500/20 rounded-full"></div>
                    <p className="text-indigo-400 font-medium">Loading your fitness analytics...</p>
                </div>
            </div>
        );
    }

    // Validation check for the setup form
    const isFormValid =
        setupForm.height !== '' && Number(setupForm.height) >= 100 &&
        setupForm.currentWeight !== '' && Number(setupForm.currentWeight) >= 30 &&
        setupForm.goalWeight !== '' && Number(setupForm.goalWeight) >= 30 &&
        setupForm.age !== '' && Number(setupForm.age) >= 12 &&
        Boolean(setupForm.gender) &&
        Boolean(setupForm.fitnessGoal) &&
        setupForm.benchPR !== '' && Number(setupForm.benchPR) >= 0 &&
        setupForm.squatPR !== '' && Number(setupForm.squatPR) >= 0 &&
        setupForm.deadliftPR !== '' && Number(setupForm.deadliftPR) >= 0;

    // ─────────────────────────────────────────────────────────────────────────────
    // FIRST-TIME SETUP WIZARD (WHEN PROFILE IS NOT CONFIGURED YET)
    // ─────────────────────────────────────────────────────────────────────────────
    if (!isProfileSetup) {
        return (
            <div className="min-h-screen py-10 px-4 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="w-full max-w-4xl bg-slate-900/80 dark:bg-slate-900/60 border-2 border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                    {/* Header: Baseline Metrics & Goals Card */}
                    <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 p-6 md:p-8 border-b border-slate-800 relative z-10">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 mr-1 inline-block" />
                                Step 1 — Fitness Profile Setup
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tight">
                            Baseline <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Metrics & Goals</span>
                        </h1>
                        <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
                            These details will be used to generate personalized progress analytics, track your biometric trends over time, and calculate customized performance benchmarks.
                        </p>
                    </div>

                    <form onSubmit={handleCompleteSetup} className="p-6 md:p-8 space-y-8 relative z-10">
                        {/* ───────────────────────────────────────────────────────────────────────────── */}
                        {/* 1. BODY MEASUREMENTS & FITNESS PROFILE */}
                        {/* ───────────────────────────────────────────────────────────────────────────── */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
                                        1. Body Measurements & Fitness Profile
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Your physical biometrics and primary training objective.
                                    </p>
                                </div>
                            </div>

                            {/* Row 1: Height, Current Weight, Goal Weight */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Height *</span>
                                        <span className="text-[10px] font-semibold text-slate-500 lowercase">min 100 cm</span>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-indigo-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Ruler className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="100"
                                            max="250"
                                            value={setupForm.height}
                                            onChange={(e) => setSetupForm({ ...setupForm, height: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 178"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                cm
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Your standing height in centimeters.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Current Weight *</span>
                                        <span className="text-[10px] font-semibold text-slate-500 lowercase">min 30 kg</span>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-indigo-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Scale className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            step="0.1"
                                            min="30"
                                            max="250"
                                            value={setupForm.currentWeight}
                                            onChange={(e) => setSetupForm({ ...setupForm, currentWeight: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 82"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                kg
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Your current body weight in kg.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Goal Weight *</span>
                                        <span className="text-[10px] font-semibold text-slate-500 lowercase">target</span>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-purple-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            step="0.1"
                                            min="30"
                                            max="250"
                                            value={setupForm.goalWeight}
                                            onChange={(e) => setSetupForm({ ...setupForm, goalWeight: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 75"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                kg
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Your target body weight in kg.</p>
                                </div>
                            </div>

                            {/* Row 2: Age, Gender, Fitness Goal */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Age *</span>
                                        <span className="text-[10px] font-semibold text-slate-500 lowercase">years</span>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-emerald-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="12"
                                            max="99"
                                            value={setupForm.age}
                                            onChange={(e) => setSetupForm({ ...setupForm, age: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 26"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                yrs
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Used for metabolic calculations.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Gender *</span>
                                        <span className="text-[10px] font-semibold text-slate-500 lowercase">profile</span>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-indigo-400 flex items-center justify-center border-r border-slate-800/80">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <select
                                            value={setupForm.gender}
                                            onChange={(e) => setSetupForm({ ...setupForm, gender: e.target.value })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-bold text-sm focus:outline-none cursor-pointer"
                                        >
                                            <option value="Male" className="bg-slate-900 text-white">Male</option>
                                            <option value="Female" className="bg-slate-900 text-white">Female</option>
                                        </select>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Biological or preferred profile gender.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Fitness Goal *</span>
                                        <span className="text-[10px] font-semibold text-slate-500 lowercase">primary</span>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-amber-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <select
                                            value={setupForm.fitnessGoal}
                                            onChange={(e) => setSetupForm({ ...setupForm, fitnessGoal: e.target.value })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-bold text-sm focus:outline-none cursor-pointer"
                                        >
                                            <option value="Muscle Gain" className="bg-slate-900 text-white">Muscle Gain</option>
                                            <option value="Fat Loss" className="bg-slate-900 text-white">Fat Loss</option>
                                            <option value="Strength" className="bg-slate-900 text-white">Strength</option>
                                            <option value="Endurance" className="bg-slate-900 text-white">Endurance</option>
                                            <option value="General Fitness" className="bg-slate-900 text-white">General Fitness</option>
                                        </select>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Determines your progress analytics benchmarks.</p>
                                </div>
                            </div>
                        </div>

                        {/* Section Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800/80"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-slate-900 px-4 text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 border border-slate-800 rounded-full py-1 shadow-sm">
                                    <Dumbbell className="w-3.5 h-3.5" />
                                    Strength Assessment
                                </span>
                            </div>
                        </div>

                        {/* ───────────────────────────────────────────────────────────────────────────── */}
                        {/* 2. PERSONAL RECORDS (1RM) */}
                        {/* ───────────────────────────────────────────────────────────────────────────── */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
                                    <Dumbbell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
                                        2. Personal Records (1RM)
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Enter your current 1-Rep Max (or estimated max) for the three primary compound lifts.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Bench Press PR *</span>
                                        <Badge className="bg-indigo-500/10 text-indigo-400 text-[10px] border-indigo-500/20 px-1.5 py-0">Chest</Badge>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-indigo-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Dumbbell className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max="500"
                                            value={setupForm.benchPR}
                                            onChange={(e) => setSetupForm({ ...setupForm, benchPR: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-black text-base focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 85"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                kg
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">1-Rep Max barbell chest press in kg.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Squat PR *</span>
                                        <Badge className="bg-purple-500/10 text-purple-400 text-[10px] border-purple-500/20 px-1.5 py-0">Legs</Badge>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-purple-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Dumbbell className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max="500"
                                            value={setupForm.squatPR}
                                            onChange={(e) => setSetupForm({ ...setupForm, squatPR: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-black text-base focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 115"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                kg
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">1-Rep Max barbell back squat in kg.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>Deadlift PR *</span>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] border-emerald-500/20 px-1.5 py-0">Back</Badge>
                                    </label>
                                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden shadow-inner">
                                        <div className="pl-3.5 pr-2 text-emerald-400 flex items-center justify-center border-r border-slate-800/80">
                                            <Dumbbell className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max="500"
                                            value={setupForm.deadliftPR}
                                            onChange={(e) => setSetupForm({ ...setupForm, deadliftPR: e.target.value === '' ? '' : Number(e.target.value) })}
                                            className="w-full bg-transparent px-3 py-3 text-white font-black text-base focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
                                            placeholder="e.g. 140"
                                        />
                                        <div className="pr-3.5 pl-2 flex items-center shrink-0">
                                            <span className="text-[11px] font-extrabold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-wider">
                                                kg
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500">1-Rep Max conventional deadlift in kg.</p>
                                </div>
                            </div>
                        </div>

                        {/* Validation Notice & Full-Width Submit Button */}
                        <div className="pt-4 border-t border-slate-800/80 space-y-4">
                            {!isFormValid && (
                                <div className="flex items-center gap-2.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                                    <span>Please complete all required measurements and personal records to unlock your progress dashboard.</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={!isFormValid}
                                className={`w-full font-black h-14 rounded-2xl gap-3 text-sm uppercase tracking-wider transition-all duration-300 ${
                                    !isFormValid
                                        ? 'bg-slate-800/80 border border-slate-700/80 text-slate-500 shadow-none cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                            >
                                {!isFormValid ? (
                                    <Lock className="w-5 h-5 text-slate-500" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
                                )}
                                Unlock Progress Dashboard
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ANALYTICAL CALCULATIONS
    // ─────────────────────────────────────────────────────────────────────────────
    const heightMeters = Math.max(1, profile.height) / 100;
    const bmiValue = Number((profile.currentWeight / (heightMeters * heightMeters)).toFixed(1));

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        if (bmi <= 24.9) return { label: 'Normal Weight', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        if (bmi <= 29.9) return { label: 'Overweight', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Obese', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    };
    const bmiCategory = getBMICategory(bmiValue);

    // Calculate Goal Progress Percentage
    const initW = profile.initialWeight || profile.currentWeight;
    const totalWeightDelta = Math.abs(profile.goalWeight - initW);
    const achievedWeightDelta = Math.abs(profile.currentWeight - initW);
    const goalProgressPct = totalWeightDelta > 0
        ? Math.min(100, Math.round((achievedWeightDelta / totalWeightDelta) * 100))
        : 100;

    // Weight difference from baseline
    const weightDiffFromInit = Number((profile.currentWeight - initW).toFixed(1));

    // Powerlifting totals
    const currentTotalLift = profile.benchPR + profile.squatPR + profile.deadliftPR;
    const initialTotalLift = (profile.initialBenchPR || profile.benchPR) +
                             (profile.initialSquatPR || profile.squatPR) +
                             (profile.initialDeadliftPR || profile.deadliftPR);
    const totalLiftGain = currentTotalLift - initialTotalLift;

    const assignedTrainerName = ptStatus?.assignedTrainerName || ptStatus?.requestedTrainerName || 'Marcus Johnson';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 text-xs font-bold uppercase">
                            <TrendingUp className="w-3.5 h-3.5 mr-1 inline-block" />
                            Intelligent Analytics System
                        </Badge>
                        {isPTActive && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase">
                                <Zap className="w-3.5 h-3.5 mr-1 inline-block text-emerald-400" />
                                PT Assisted
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight uppercase italic">
                        PROGRESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">TRACKING</span>
                    </h1>
                    <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
                        Monitor your physical evolution, track vital biometrics, analyze compound lifting PRs, and review chronological progress milestones.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Update Progress Button */}
                    <Button
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black px-6 h-12 rounded-2xl shadow-lg shadow-indigo-600/30 gap-2 text-sm uppercase tracking-wider"
                    >
                        <Plus className="w-5 h-5" />
                        Update Progress
                    </Button>

                    {/* Reset Demo Setup Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetSetup}
                        className="w-full sm:w-auto bg-slate-900/60 border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-bold h-12 rounded-2xl px-4 text-xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset Setup (Demo)
                    </Button>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            // 4-CARD KEY VITAL STATISTICS GRID
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Current Weight */}
                <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl overflow-hidden relative group hover:border-slate-700 transition-all">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Current Weight</span>
                            <Scale className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-white tracking-tight">{profile.currentWeight}</h3>
                            <span className="text-sm font-bold text-slate-400">kg</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                            <span className="text-slate-500">vs Baseline:</span>
                            <Badge className={`${weightDiffFromInit <= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'} font-bold`}>
                                {weightDiffFromInit > 0 ? `+${weightDiffFromInit} kg` : `${weightDiffFromInit} kg`}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Goal Weight */}
                <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl overflow-hidden relative group hover:border-slate-700 transition-all">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Goal Weight</span>
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-white tracking-tight">{profile.goalWeight}</h3>
                            <span className="text-sm font-bold text-slate-400">kg</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                            <span className="text-slate-500">Target Goal:</span>
                            <span className="font-bold text-purple-400 truncate max-w-[140px]">{profile.fitnessGoal}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. BMI (Body Mass Index) */}
                <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl overflow-hidden relative group hover:border-slate-700 transition-all">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Body Mass Index</span>
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-white tracking-tight">{bmiValue}</h3>
                            <span className="text-xs font-bold text-slate-500 uppercase">BMI</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                            <span className="text-slate-500">Category:</span>
                            <Badge className={`${bmiCategory.color} font-bold text-[10px]`}>
                                {bmiCategory.label}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Goal Progress Percentage */}
                <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl overflow-hidden relative group hover:border-slate-700 transition-all">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Goal Achieved</span>
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-4xl font-black text-white tracking-tight">{goalProgressPct}%</h3>
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <Progress value={goalProgressPct} className="h-2 bg-slate-800" />
                            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                                <span>Start: {initW} kg</span>
                                <span>Goal: {profile.goalWeight} kg</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            // PERSONAL TRAINING ENHANCED INSIGHTS (WHEN PERSONAL TRAINING IS ACTIVE)
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            {isPTActive && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase">
                            <Sparkles className="w-3.5 h-3.5 mr-1 inline-block" />
                            Coach-Assisted Analytics — Personal Training Active
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1. Workout Completion & Goal Progress Card */}
                        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950 border-2 border-emerald-500/30 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Coach {assignedTrainerName}</h4>
                                        <p className="text-[10px] text-emerald-400 font-semibold uppercase">Assigned Program Tracking</p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500 text-black font-black text-xs px-2.5 py-0.5">
                                    92% Done
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-300">Workout Completion Percentage</span>
                                        <span className="text-white">23 of 25 Sessions</span>
                                    </div>
                                    <Progress value={92} className="h-2.5 bg-slate-800" />
                                </div>

                                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1 text-xs">
                                    <span className="text-slate-500 font-bold uppercase text-[10px]">Trainer-Assigned Goal Progress</span>
                                    <p className="text-white font-bold">
                                        Strength & Hypertrophy Block — <span className="text-emerald-400">On Track (+8% Total Volume)</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Workout Consistency</p>
                                        <p className="text-lg font-black text-emerald-400">5-Week Streak</p>
                                    </div>
                                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Strength Improvement</p>
                                        <p className="text-lg font-black text-indigo-400">+18.5% Gain</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 2 & 3. Trainer Notes & Feedback Card (Future-Ready Placeholder) */}
                        <Card className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                                        Trainer Notes & Feedback
                                    </h4>
                                </div>
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-bold">
                                    Latest Coach Review
                                </Badge>
                            </div>

                            {/* Coach quote card */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                                        {assignedTrainerName.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-sm">{assignedTrainerName}</h5>
                                        <p className="text-[10px] text-slate-400">Head of Strength & Conditioning • Verified Coach Note</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-300 italic leading-relaxed pl-3 border-l-2 border-indigo-500">
                                    &ldquo;Great depth on squats this week! Your bar speed on the {profile.squatPR}kg sets looks clean and controlled. Let&apos;s keep rest intervals to 90 seconds for this hypertrophy block and target {profile.squatPR + 5}kg on your next check-in.&rdquo;
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                                <span>Next Coach Check-in: <strong>Friday (10:00 AM)</strong></span>
                                <span>Status: <strong className="text-emerald-400">Active Coach Programming</strong></span>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            // INTERACTIVE CHARTS (WEIGHT TREND & STRENGTH PROGRESS)
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl overflow-hidden p-6 md:p-8 space-y-6">
                <Tabs defaultValue="weight" className="w-full space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Visual Progress Trajectory
                            </h3>
                            <p className="text-xs text-slate-400">
                                Inspect your weight evolution vs goal line or compare your compound lifting strength records.
                            </p>
                        </div>
                        <TabsList className="bg-slate-950 p-1 rounded-2xl border border-slate-800">
                            <TabsTrigger value="weight" className="rounded-xl px-5 py-2 font-bold text-xs">
                                <Scale className="w-3.5 h-3.5 mr-1.5 inline-block" />
                                Weight Progress Chart
                            </TabsTrigger>
                            <TabsTrigger value="strength" className="rounded-xl px-5 py-2 font-bold text-xs">
                                <Dumbbell className="w-3.5 h-3.5 mr-1.5 inline-block" />
                                Strength Progress Charts
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* WEIGHT PROGRESS CHART */}
                    <TabsContent value="weight" className="space-y-4">
                        <div className="h-80 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                        labelStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    />
                                    <ReferenceLine
                                        y={profile.goalWeight}
                                        stroke="#a855f7"
                                        strokeDasharray="4 4"
                                        label={{ value: `Goal: ${profile.goalWeight}kg`, fill: '#c084fc', fontSize: 11, position: 'right' }}
                                    />
                                    <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" name="Weight (kg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 px-2 pt-2 border-t border-slate-800">
                            <span>Initial Weight: <strong className="text-white">{initW} kg</strong></span>
                            <span>Target Goal Line: <strong className="text-purple-400">{profile.goalWeight} kg</strong></span>
                            <span>Current Measured: <strong className="text-indigo-400">{profile.currentWeight} kg</strong></span>
                        </div>
                    </TabsContent>

                    {/* STRENGTH PROGRESS CHARTS */}
                    <TabsContent value="strength" className="space-y-4">
                        <div className="h-80 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                        labelStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="benchPR" name="Bench Press (kg)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="squatPR" name="Squat (kg)" fill="#a855f7" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="deadliftPR" name="Deadlift (kg)" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 px-2 pt-2 border-t border-slate-800 gap-2">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                Bench PR: <strong className="text-white">{profile.benchPR} kg</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                Squat PR: <strong className="text-white">{profile.squatPR} kg</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                Deadlift PR: <strong className="text-white">{profile.deadliftPR} kg</strong>
                            </span>
                            <span className="font-bold text-indigo-400">Total Lift Gain: {totalLiftGain >= 0 ? `+${totalLiftGain}` : totalLiftGain} kg</span>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            // PERSONAL RECORDS SUMMARY (3 GLOWING CARDS)
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        Compound Lift Personal Records (PRs)
                    </h3>
                    <Badge className="bg-slate-900 border-slate-800 text-slate-300 font-bold px-3 py-1 text-xs">
                        Total Combined Lifts: {currentTotalLift} kg
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bench Press */}
                    <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                                <Dumbbell className="w-6 h-6" />
                            </div>
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold">
                                +{profile.benchPR - (profile.initialBenchPR || profile.benchPR)} kg Gain
                            </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bench Press PR</p>
                        <h4 className="text-3xl font-black text-white mt-1">{profile.benchPR} <span className="text-sm text-slate-400 font-bold">kg</span></h4>
                        <p className="text-xs text-slate-500 mt-2">Chest & Upper Body Compound Lift</p>
                    </Card>

                    {/* Squat PR */}
                    <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black">
                                <Activity className="w-6 h-6" />
                            </div>
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold">
                                +{profile.squatPR - (profile.initialSquatPR || profile.squatPR)} kg Gain
                            </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Squat PR</p>
                        <h4 className="text-3xl font-black text-white mt-1">{profile.squatPR} <span className="text-sm text-slate-400 font-bold">kg</span></h4>
                        <p className="text-xs text-slate-500 mt-2">Legs & Lower Body Compound Lift</p>
                    </Card>

                    {/* Deadlift PR */}
                    <Card className="bg-slate-900/60 border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
                                <Award className="w-6 h-6" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">
                                +{profile.deadliftPR - (profile.initialDeadliftPR || profile.deadliftPR)} kg Gain
                            </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadlift PR</p>
                        <h4 className="text-3xl font-black text-white mt-1">{profile.deadliftPR} <span className="text-sm text-slate-400 font-bold">kg</span></h4>
                        <p className="text-xs text-slate-500 mt-2">Posterior Chain & Core Compound Lift</p>
                    </Card>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            // PROGRESS TIMELINE (CHRONOLOGICAL LOG)
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                    Chronological Progress Timeline
                </h3>
                <div className="space-y-3">
                    {history.slice().reverse().map((entry, idx) => (
                        <Card key={entry.id || idx} className="bg-slate-900/60 border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-indigo-400 uppercase">{entry.date}</span>
                                            <Badge className="bg-slate-800 text-slate-300 text-[10px] font-semibold">
                                                Weight: {entry.weight} kg
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-bold text-white mt-0.5">{entry.note || 'Progress Check-in'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
                                    <span>Bench: <strong className="text-white">{entry.benchPR}kg</strong></span>
                                    <span className="text-slate-700">•</span>
                                    <span>Squat: <strong className="text-white">{entry.squatPR}kg</strong></span>
                                    <span className="text-slate-700">•</span>
                                    <span>Deadlift: <strong className="text-white">{entry.deadliftPR}kg</strong></span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            // MODALS: COMPACT UPDATE PROGRESS DIALOG
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="max-w-md bg-slate-950 border border-slate-800 text-white rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-400" />
                            Update Progress Metrics
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Log your latest weight and personal records. Your charts and statistics will update automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveProgressUpdate} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Current Measured Weight (kg) *</label>
                            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 overflow-hidden">
                                <div className="pl-3.5 pr-2 text-indigo-400 flex items-center justify-center border-r border-slate-800">
                                    <Scale className="w-4 h-4" />
                                </div>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    min="30"
                                    max="250"
                                    value={updateForm.currentWeight}
                                    onChange={(e) => setUpdateForm({ ...updateForm, currentWeight: Number(e.target.value) })}
                                    className="w-full bg-transparent px-4 py-2.5 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600"
                                    placeholder="e.g. 79"
                                />
                                <div className="pr-3 pl-2 flex items-center shrink-0">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                        kg
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-300">Bench PR (kg)</label>
                                <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl focus-within:border-indigo-500 overflow-hidden">
                                    <div className="pl-3 pr-1.5 text-indigo-400">
                                        <Dumbbell className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="500"
                                        value={updateForm.benchPR}
                                        onChange={(e) => setUpdateForm({ ...updateForm, benchPR: Number(e.target.value) })}
                                        className="w-full bg-transparent px-2 py-2 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600"
                                        placeholder="95"
                                    />
                                    <span className="pr-3 text-xs font-bold text-slate-500">kg</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-300">Squat PR (kg)</label>
                                <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl focus-within:border-indigo-500 overflow-hidden">
                                    <div className="pl-3 pr-1.5 text-purple-400">
                                        <Dumbbell className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="500"
                                        value={updateForm.squatPR}
                                        onChange={(e) => setUpdateForm({ ...updateForm, squatPR: Number(e.target.value) })}
                                        className="w-full bg-transparent px-2 py-2 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600"
                                        placeholder="130"
                                    />
                                    <span className="pr-3 text-xs font-bold text-slate-500">kg</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-300">Deadlift PR (kg)</label>
                                <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl focus-within:border-indigo-500 overflow-hidden">
                                    <div className="pl-3 pr-1.5 text-emerald-400">
                                        <Dumbbell className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="500"
                                        value={updateForm.deadliftPR}
                                        onChange={(e) => setUpdateForm({ ...updateForm, deadliftPR: Number(e.target.value) })}
                                        className="w-full bg-transparent px-2 py-2 text-white font-bold text-sm focus:outline-none placeholder:text-slate-600"
                                        placeholder="160"
                                    />
                                    <span className="pr-3 text-xs font-bold text-slate-500">kg</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Milestone / Progress Note (Optional)</label>
                            <input
                                type="text"
                                value={updateForm.note}
                                onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                                placeholder="e.g., Felt strong today, hit a new PR on Bench!"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <DialogFooter className="flex gap-2 pt-4 border-t border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="w-full bg-slate-900 border-slate-700 text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold"
                            >
                                Save Progress Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
