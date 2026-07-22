'use client';

import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, LineChart, Line, Legend, ReferenceLine
} from 'recharts';
import {
    Dumbbell, TrendingUp, Target, Activity, PlusCircle, RotateCcw,
    Scale, User, Sparkles, CheckCircle2, Trophy, Calendar,
    ArrowUpRight, ArrowDownRight, Award, Zap, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";

// --- TYPES ---
interface FitnessProfile {
    height: number; // in cm
    currentWeight: number; // in kg
    goalWeight: number; // in kg
    age: number;
    gender: string;
    fitnessGoal: string;
    benchPressPR: number; // in kg
    squatPR: number; // in kg
    deadliftPR: number; // in kg
    createdAt: string;
}

interface ProgressEntry {
    id: string;
    date: string;
    timestamp: string;
    weight: number;
    benchPR: number;
    squatPR: number;
    deadliftPR: number;
    note?: string;
}

const STORAGE_KEY_PROFILE = 'flex_fitness_profile_v2';
const STORAGE_KEY_HISTORY = 'flex_fitness_history_v2';

// Helper: Calculate BMI
function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string; color: string } {
    if (!heightCm || heightCm <= 0) return { bmi: 0, category: 'N/A', color: 'text-slate-400' };
    const heightM = heightCm / 100;
    const bmiVal = weightKg / (heightM * heightM);
    const bmi = Math.round(bmiVal * 10) / 10;

    if (bmi < 18.5) return { bmi, category: 'Underweight', color: 'text-amber-400' };
    if (bmi < 25.0) return { bmi, category: 'Normal Weight', color: 'text-emerald-400' };
    if (bmi < 30.0) return { bmi, category: 'Overweight', color: 'text-orange-400' };
    return { bmi, category: 'Obese', color: 'text-rose-400' };
}

// Helper: Calculate Goal Progress Percentage
function calculateGoalProgress(initialWeight: number, currentWeight: number, goalWeight: number): number {
    if (initialWeight === goalWeight) return 100;
    const totalDiff = Math.abs(initialWeight - goalWeight);
    const progressDiff = Math.abs(initialWeight - currentWeight);
    
    if (goalWeight < initialWeight && currentWeight < goalWeight) return 100;
    if (goalWeight > initialWeight && currentWeight > goalWeight) return 100;
    
    const percentage = Math.round((progressDiff / totalDiff) * 100);
    return Math.min(Math.max(percentage, 0), 100);
}

export default function MemberProgressPage() {
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState<FitnessProfile | null>(null);
    const [history, setHistory] = useState<ProgressEntry[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    // Form states for setup
    const [setupForm, setSetupForm] = useState({
        height: '175',
        currentWeight: '80',
        goalWeight: '75',
        age: '26',
        gender: 'Male',
        fitnessGoal: 'Muscle Gain',
        benchPressPR: '85',
        squatPR: '110',
        deadliftPR: '135',
    });

    // Form states for update modal
    const [updateForm, setUpdateForm] = useState({
        weight: '',
        benchPR: '',
        squatPR: '',
        deadliftPR: '',
    });

    // Load saved data from localStorage on mount
    useEffect(() => {
        setMounted(true);
        try {
            const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
            const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                setProfile(parsedProfile);
                setUpdateForm({
                    weight: String(parsedProfile.currentWeight),
                    benchPR: String(parsedProfile.benchPressPR),
                    squatPR: String(parsedProfile.squatPR),
                    deadliftPR: String(parsedProfile.deadliftPR),
                });
            }

            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load progress profile from localStorage", e);
        }
    }, []);

    // Save profile and history to state & localStorage
    const saveProfileAndHistory = (newProfile: FitnessProfile, newHistory: ProgressEntry[]) => {
        setProfile(newProfile);
        setHistory(newHistory);
        try {
            localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    };

    // Handle initial onboarding submission
    const handleSetupSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const height = parseFloat(setupForm.height) || 175;
        const currentWeight = parseFloat(setupForm.currentWeight) || 80;
        const goalWeight = parseFloat(setupForm.goalWeight) || 75;
        const age = parseInt(setupForm.age, 10) || 26;
        const benchPressPR = parseFloat(setupForm.benchPressPR) || 0;
        const squatPR = parseFloat(setupForm.squatPR) || 0;
        const deadliftPR = parseFloat(setupForm.deadliftPR) || 0;

        const newProfile: FitnessProfile = {
            height,
            currentWeight,
            goalWeight,
            age,
            gender: setupForm.gender,
            fitnessGoal: setupForm.fitnessGoal,
            benchPressPR,
            squatPR,
            deadliftPR,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };

        const initialEntry: ProgressEntry = {
            id: 'init-1',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            weight: currentWeight,
            benchPR: benchPressPR,
            squatPR: squatPR,
            deadliftPR: deadliftPR,
            note: 'Initial Profile Setup',
        };

        setUpdateForm({
            weight: String(currentWeight),
            benchPR: String(benchPressPR),
            squatPR: String(squatPR),
            deadliftPR: String(deadliftPR),
        });

        saveProfileAndHistory(newProfile, [initialEntry]);
    };

    // Handle quick progress update modal submission
    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        const updatedWeight = parseFloat(updateForm.weight) || profile.currentWeight;
        const updatedBenchPR = parseFloat(updateForm.benchPR) || profile.benchPressPR;
        const updatedSquatPR = parseFloat(updateForm.squatPR) || profile.squatPR;
        const updatedDeadliftPR = parseFloat(updateForm.deadliftPR) || profile.deadliftPR;

        const updatedProfile: FitnessProfile = {
            ...profile,
            currentWeight: updatedWeight,
            benchPressPR: updatedBenchPR,
            squatPR: updatedSquatPR,
            deadliftPR: updatedDeadliftPR,
        };

        const newEntry: ProgressEntry = {
            id: 'entry-' + Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            weight: updatedWeight,
            benchPR: updatedBenchPR,
            squatPR: updatedSquatPR,
            deadliftPR: updatedDeadliftPR,
            note: 'Progress Check-in',
        };

        const updatedHistory = [...history, newEntry];

        saveProfileAndHistory(updatedProfile, updatedHistory);
        setIsUpdateModalOpen(false);
    };

    // Reset profile (For testing / re-onboarding)
    const handleResetProfile = () => {
        if (confirm("Reset your fitness profile and progress history? This will re-trigger the onboarding setup screen.")) {
            setProfile(null);
            setHistory([]);
            try {
                localStorage.removeItem(STORAGE_KEY_PROFILE);
                localStorage.removeItem(STORAGE_KEY_HISTORY);
            } catch (e) {
                console.error(e);
            }
        }
    };

    // Avoid SSR hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    // Input focus style matching website theme (amber glow focus instead of yellow outline)
    const inputStyle = "bg-slate-950/70 border-slate-800 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 focus:border-amber-500/60 h-11 transition-all";

    // ==========================================
    // 1. FIRST-TIME ONBOARDING SCREEN
    // ==========================================
    if (!profile) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">
                {/* Onboarding Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 p-8 md:p-12 rounded-3xl backdrop-blur-xl">
                    <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

                    <div className="relative z-10 max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" /> Member Onboarding
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Setup Your Fitness Profile
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Welcome to your personalized progress portal! Fill out your baseline metrics below to unlock your interactive body weight charts, strength PR analytics, and progress timeline.
                        </p>
                    </div>
                </div>

                {/* Onboarding Setup Form Card */}
                <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-2xl overflow-hidden max-w-4xl mx-auto">
                    <CardHeader className="bg-slate-950/40 border-b border-slate-800/80 p-6 md:p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-white font-bold">Baseline Metrics & Goals</CardTitle>
                                <CardDescription className="text-slate-400">
                                    All details will be saved securely and used to generate your real-time analytics.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSetupSubmit} className="space-y-8">
                            
                            {/* Section 1: Body Metrics */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider">
                                    <Scale className="w-4 h-4" /> 1. Body Measurements & Demographics
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Height (cm) *</Label>
                                        <Input
                                            type="number"
                                            required
                                            min="100"
                                            max="250"
                                            placeholder="175"
                                            value={setupForm.height}
                                            onChange={(e) => setSetupForm({ ...setupForm, height: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Current Weight (kg) *</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            required
                                            min="30"
                                            max="300"
                                            placeholder="80"
                                            value={setupForm.currentWeight}
                                            onChange={(e) => setSetupForm({ ...setupForm, currentWeight: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Goal Weight (kg) *</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            required
                                            min="30"
                                            max="300"
                                            placeholder="75"
                                            value={setupForm.goalWeight}
                                            onChange={(e) => setSetupForm({ ...setupForm, goalWeight: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Age *</Label>
                                        <Input
                                            type="number"
                                            required
                                            min="12"
                                            max="100"
                                            placeholder="26"
                                            value={setupForm.age}
                                            onChange={(e) => setSetupForm({ ...setupForm, age: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Gender *</Label>
                                        <Select
                                            value={setupForm.gender}
                                            onValueChange={(val) => setSetupForm({ ...setupForm, gender: val })}
                                        >
                                            <SelectTrigger className="bg-slate-950/70 border-slate-800 text-white h-11 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                                <SelectItem value="Male" className="focus:bg-amber-500/20 focus:text-amber-300">Male</SelectItem>
                                                <SelectItem value="Female" className="focus:bg-amber-500/20 focus:text-amber-300">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Fitness Goal *</Label>
                                        <Select
                                            value={setupForm.fitnessGoal}
                                            onValueChange={(val) => setSetupForm({ ...setupForm, fitnessGoal: val })}
                                        >
                                            <SelectTrigger className="bg-slate-950/70 border-slate-800 text-white h-11 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60">
                                                <SelectValue placeholder="Select Goal" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                                <SelectItem value="Muscle Gain" className="focus:bg-amber-500/20 focus:text-amber-300">Muscle Gain</SelectItem>
                                                <SelectItem value="Weight Loss" className="focus:bg-amber-500/20 focus:text-amber-300">Weight Loss</SelectItem>
                                                <SelectItem value="Strength & Power" className="focus:bg-amber-500/20 focus:text-amber-300">Strength & Power</SelectItem>
                                                <SelectItem value="Endurance" className="focus:bg-amber-500/20 focus:text-amber-300">Endurance</SelectItem>
                                                <SelectItem value="Flexibility" className="focus:bg-amber-500/20 focus:text-amber-300">Flexibility</SelectItem>
                                                <SelectItem value="Overall Fitness" className="focus:bg-amber-500/20 focus:text-amber-300">Overall Fitness</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Personal Records (PRs) */}
                            <div className="space-y-4 pt-4 border-t border-slate-800/80">
                                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                                    <Dumbbell className="w-4 h-4" /> 2. Personal Records (1-Rep Max in kg)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Bench Press PR (kg)</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="85"
                                            value={setupForm.benchPressPR}
                                            onChange={(e) => setSetupForm({ ...setupForm, benchPressPR: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Squat PR (kg)</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="110"
                                            value={setupForm.squatPR}
                                            onChange={(e) => setSetupForm({ ...setupForm, squatPR: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Deadlift PR (kg)</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="135"
                                            value={setupForm.deadliftPR}
                                            onChange={(e) => setSetupForm({ ...setupForm, deadliftPR: e.target.value })}
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-lg h-14 rounded-2xl shadow-xl shadow-amber-400/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    Unlock Progress Dashboard <CheckCircle2 className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ==========================================
    // 2. UNLOCKED PROGRESS DASHBOARD
    // ==========================================

    // Dynamic stats computation
    const bmiInfo = calculateBMI(profile.currentWeight, profile.height);
    const initialWeight = history.length > 0 ? history[0].weight : profile.currentWeight;
    const weightDiffFromStart = Math.round((profile.currentWeight - initialWeight) * 10) / 10;
    const goalDiffRemaining = Math.round(Math.abs(profile.currentWeight - profile.goalWeight) * 10) / 10;
    const goalProgressPct = calculateGoalProgress(initialWeight, profile.currentWeight, profile.goalWeight);

    // Timeline entries in reverse order
    const reversedHistory = [...history].reverse();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Top Dashboard Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 p-6 md:p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <TrendingUp className="w-3.5 h-3.5" /> Analytics Active
                        </div>
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs font-semibold">
                            Goal: {profile.fitnessGoal}
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Fitness Progress Dashboard
                    </h1>
                    <p className="text-slate-400 text-base max-w-xl">
                        Height: <span className="text-white font-semibold">{profile.height} cm</span> • Age: <span className="text-white font-semibold">{profile.age}</span> • Gender: <span className="text-white font-semibold">{profile.gender}</span>
                    </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    {/* Primary Update Progress Button */}
                    <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black h-12 px-6 rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-105">
                                <PlusCircle className="w-5 h-5 mr-2" /> Update Progress
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md sm:rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-amber-400" /> Update Fitness Metrics
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Log your latest weight and personal records to instantly update your progress dashboard.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Current Body Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={updateForm.weight}
                                        onChange={(e) => setUpdateForm({ ...updateForm, weight: e.target.value })}
                                        className={inputStyle}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Bench Press PR (kg)</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={updateForm.benchPR}
                                        onChange={(e) => setUpdateForm({ ...updateForm, benchPR: e.target.value })}
                                        className={inputStyle}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Squat PR (kg)</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={updateForm.squatPR}
                                        onChange={(e) => setUpdateForm({ ...updateForm, squatPR: e.target.value })}
                                        className={inputStyle}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Deadlift PR (kg)</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={updateForm.deadliftPR}
                                        onChange={(e) => setUpdateForm({ ...updateForm, deadliftPR: e.target.value })}
                                        className={inputStyle}
                                    />
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black h-11 rounded-xl shadow-md shadow-amber-400/20"
                                    >
                                        Save & Refresh Analytics
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Secondary Reset Button */}
                    <Button
                        variant="outline"
                        onClick={handleResetProfile}
                        className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white h-12 rounded-xl"
                        title="Reset profile data to re-test onboarding form"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset Profile
                    </Button>
                </div>
            </div>

            {/* Quick Summary Cards (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Current Weight */}
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Weight</span>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                                <Scale className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">{profile.currentWeight} <span className="text-sm font-normal text-slate-400">kg</span></h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                {weightDiffFromStart === 0 ? (
                                    <span className="text-slate-400 font-medium">Starting weight baseline</span>
                                ) : weightDiffFromStart < 0 ? (
                                    <span className="text-emerald-400 font-bold flex items-center">
                                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {Math.abs(weightDiffFromStart)} kg
                                    </span>
                                ) : (
                                    <span className="text-blue-400 font-bold flex items-center">
                                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +{weightDiffFromStart} kg
                                    </span>
                                )}
                                <span className="text-slate-500">vs start ({initialWeight} kg)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Goal Weight */}
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Goal Weight</span>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Target className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">{profile.goalWeight} <span className="text-sm font-normal text-slate-400">kg</span></h3>
                            <p className="mt-2 text-xs text-slate-400">
                                <span className="text-blue-400 font-semibold">{goalDiffRemaining} kg</span> away from target
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. BMI */}
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Body Mass Index (BMI)</span>
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-white tracking-tight">{bmiInfo.bmi}</h3>
                                <Badge variant="outline" className={`bg-slate-950 border-slate-800 text-xs font-bold ${bmiInfo.color}`}>
                                    {bmiInfo.category}
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Based on height {profile.height} cm</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Goal Progress */}
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Goal Progress</span>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                                <Trophy className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Completion</span>
                                <span className="text-amber-400 font-bold">{goalProgressPct}%</span>
                            </div>
                            <Progress value={goalProgressPct} className="h-2.5 bg-slate-950 [&>div]:bg-amber-500" />
                            <p className="text-xs text-slate-500 pt-1">Target: {profile.fitnessGoal}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weight Progress Chart */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/80">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-amber-400" /> Weight Progress Trend
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm">
                                    Tracking weight entries (kg) against your goal weight
                                </CardDescription>
                            </div>
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                Goal: {profile.goalWeight} kg
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWeightGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 3', 'dataMax + 3']} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                                        formatter={(val: number | string) => [`${val} kg`, 'Body Weight']}
                                    />
                                    <ReferenceLine y={profile.goalWeight} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'Target', fill: '#3b82f6', position: 'insideTopRight' }} />
                                    <Area type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={3} fill="url(#colorWeightGradient)" dot={{ r: 4, fill: '#f59e0b' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Strength PRs Chart */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/80">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5 text-indigo-400" /> Strength PR Progression
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm">
                                    Bench Press, Squat, & Deadlift 1-Rep Maxes (kg)
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                                        formatter={(val: number | string, name: number | string) => [`${val} kg`, name]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="benchPR" name="Bench Press" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="squatPR" name="Squat" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="deadliftPR" name="Deadlift" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Personal Records Cards & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* PR Highlights (1 Col) */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/80 h-fit">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" /> Current PR Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                                    <Dumbbell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Bench Press</h4>
                                    <p className="text-xs text-slate-500">1-Rep Max</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-amber-400">{profile.benchPressPR} kg</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Squat</h4>
                                    <p className="text-xs text-slate-500">1-Rep Max</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-indigo-400">{profile.squatPR} kg</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-blue-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Deadlift</h4>
                                    <p className="text-xs text-slate-500">1-Rep Max</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-blue-400">{profile.deadliftPR} kg</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Timeline (2 Cols) */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/80 lg:col-span-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-400" /> Progress Log Timeline
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm">
                            Historical log of all weight and PR updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6 mt-2">
                            {reversedHistory.map((item) => (
                                <div key={item.id} className="relative group">
                                    {/* Timeline Dot */}
                                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 bg-amber-500 group-hover:scale-125 transition-transform shadow-[0_0_10px_#f59e0b]" />

                                    <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-base">{item.date}</span>
                                                <span className="text-xs text-slate-500">({item.timestamp})</span>
                                            </div>
                                            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                                                {item.note || 'Progress Log'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-1">
                                            <div>
                                                <span className="text-slate-500 text-xs block">Weight</span>
                                                <span className="font-bold text-white">{item.weight} kg</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-xs block">Bench PR</span>
                                                <span className="font-bold text-amber-400">{item.benchPR} kg</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-xs block">Squat PR</span>
                                                <span className="font-bold text-indigo-400">{item.squatPR} kg</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-xs block">Deadlift PR</span>
                                                <span className="font-bold text-blue-400">{item.deadliftPR} kg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
