'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Dumbbell,
    Flame,
    Clock,
    Target,
    ChevronDown,
    Info,
    CheckCircle2,
    Activity,
    PieChart,
    ChevronRight,
    Utensils,
    MessageSquare,
    Calendar,
    Lock,
    ArrowRight,
    ShieldAlert,
    Star,
    Zap,
    UserCheck,
    CreditCard,
    Unlock,
    Check
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { usePlan } from '@/context/PlanContext';

const TRAINERS_INFO = {
    'marcus-johnson': {
        name: 'Marcus Johnson',
        role: 'Head of Strength & Conditioning',
        specialties: ['Powerlifting', 'Strength Training', 'Bodybuilding'],
        experience: '12+ Years',
        image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
    },
    'sarah-chen': {
        name: 'Sarah Chen',
        role: 'HIIT Specialist',
        specialties: ['HIIT', 'Cardio Conditioning', 'Core Strength'],
        experience: '8 Years',
        image: 'https://images.unsplash.com/photo-1611566026373-c6c8dab0f909?q=80&w=1587&auto=format&fit=crop',
    },
    'michael-rivers': {
        name: 'Michael Rivers',
        role: 'Recovery & Mobility Specialist',
        specialties: ['Mobility', 'Injury Prevention', 'Active Recovery'],
        experience: '10 Years',
        image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1587&auto=format&fit=crop',
    }
};

const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    try {
        const date = new Date(isoStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return '';
    }
};

const getTrialBadgeStyle = (status: string) => {
    switch (status) {
        case 'approved':
        case 'completed':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'rejected':
            return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        case 'rescheduled':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'pending':
        default:
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
};

const getPTRequestBadgeStyle = (status: string) => {
    switch (status) {
        case 'approved':
        case 'paid':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'rejected':
            return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        case 'rescheduled':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'pending':
        default:
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
};

function computeUnlocked(ptStatus: any, trials: any): {
    trialCompleted: boolean;
    trainerSelected: boolean;
    paymentCompleted: boolean;
    trainerApproved: boolean;
    allDone: boolean;
} {
    const trialCompleted = ptStatus?.trialCompleted ||
        (trials && Object.values(trials).some((t: any) => t.status === 'approved' || t.status === 'completed'));
    const trainerSelected = ptStatus?.trainerSelected || (typeof window !== 'undefined' ? !!window.localStorage.getItem('zenith_preferred_trainer_id') : false);
    const paymentCompleted = !!ptStatus?.paymentCompleted || ptStatus?.status === 'paid';
    const trainerApproved = !!ptStatus?.trainerApproved || ptStatus?.status === 'paid';
    return {
        trialCompleted,
        trainerSelected,
        paymentCompleted,
        trainerApproved,
        allDone: ptStatus?.status === 'paid' || !!ptStatus?.paymentCompleted,
    };
}


export default function MemberPlansPage() {
    const { workoutPlan, dietPlan } = usePlan();
    const [weeklyWorkoutPlan, setWeeklyWorkoutPlan] = useState<any | null>(null);

    const [ptStatus, setPtStatus] = useState<any>({});
    const [trialBookings, setTrialBookings] = useState<any>({});
    const [preferredTrainerId, setPreferredTrainerId] = useState<string | null>(null);

    // Load PT data from storage
    const loadPTData = () => {
        try {
            const savedPT = localStorage.getItem('zenith_pt_status');
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            const savedPreferred = localStorage.getItem('zenith_preferred_trainer_id');
            if (savedPT) setPtStatus(JSON.parse(savedPT));
            if (savedTrials) setTrialBookings(JSON.parse(savedTrials));
            setPreferredTrainerId(savedPreferred);
        } catch (e) {}
    };

    useEffect(() => {
        loadPTData();
        const handler = () => loadPTData();
        window.addEventListener('storage', handler);
        window.addEventListener('focus', handler);
        return () => {
            window.removeEventListener('storage', handler);
            window.removeEventListener('focus', handler);
        };
    }, []);


    // Load weekly workout plan (only when PT is unlocked)
    useEffect(() => {
        const savedWeekly = localStorage.getItem('zenith_workout_plan_weekly');
        if (savedWeekly) {
            try {
                const parsed = JSON.parse(savedWeekly);
                if (parsed.name === workoutPlan?.name) {
                    setWeeklyWorkoutPlan(parsed);
                } else {
                    setWeeklyWorkoutPlan(null);
                }
            } catch (e) {
                setWeeklyWorkoutPlan(null);
            }
        } else {
            setWeeklyWorkoutPlan(null);
        }
    }, [workoutPlan]);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysOfWeek[new Date().getDay()];

    const groupExercises = (exercises: any[]) => {
        const groups: Array<{ type: 'single' | 'superset', groupName?: string, items: any[] }> = [];
        let currentGroup: any[] = [];
        let currentGroupName = '';

        exercises.forEach((ex) => {
            if (ex.supersetGroup) {
                if (currentGroupName === ex.supersetGroup) {
                    currentGroup.push(ex);
                } else {
                    if (currentGroup.length > 0) {
                        groups.push({
                            type: currentGroupName ? 'superset' : 'single',
                            groupName: currentGroupName || undefined,
                            items: currentGroup
                        });
                    }
                    currentGroup = [ex];
                    currentGroupName = ex.supersetGroup;
                }
            } else {
                if (currentGroup.length > 0) {
                    groups.push({
                        type: currentGroupName ? 'superset' : 'single',
                        groupName: currentGroupName || undefined,
                        items: currentGroup
                    });
                }
                groups.push({
                    type: 'single',
                    items: [ex]
                });
                currentGroup = [];
                currentGroupName = '';
            }
        });

        if (currentGroup.length > 0) {
            groups.push({
                type: currentGroupName ? 'superset' : 'single',
                groupName: currentGroupName || undefined,
                items: currentGroup
            });
        }

        return groups;
    };

    // --- PT Gate Check ---
    const gate = computeUnlocked(ptStatus, trialBookings);

    // Locked State UI
    if (!gate.allDone) {
        // Find trial details
        const trialEntries = Object.entries(trialBookings || {});
        const hasTrialBooked = trialEntries.length > 0;
        let trialTrainerId = '';
        let trialDate = '';
        let trialTime = '';
        let trialStatus = '';
        if (hasTrialBooked) {
            const [tid, tdata]: [string, any] = trialEntries[0];
            trialTrainerId = tid;
            trialDate = tdata.date || '';
            trialTime = tdata.time || '';
            trialStatus = tdata.status || 'pending';
        }

        const step1Completed = ptStatus?.trialCompleted || (hasTrialBooked && (trialStatus === 'approved' || trialStatus === 'completed'));
        
        const preferredTrainerIdVal = preferredTrainerId || ptStatus?.requestedTrainerId || ptStatus?.assignedTrainerId;
        const step2Completed = !!preferredTrainerIdVal;

        const step3Completed = ptStatus?.trainerApproved || ptStatus?.status === 'approved' || ptStatus?.status === 'paid';
        const step3Status = ptStatus?.status || ''; // 'pending', 'approved', 'rejected', 'rescheduled', 'paid'
        const step3RequestedTrainerName = ptStatus?.requestedTrainerName || '';

        const step4Active = step3Completed;
        const step4Completed = ptStatus?.paymentCompleted || ptStatus?.status === 'paid';

        const step5Completed = gate.allDone;

        // Calculate progress percentage
        let progressPercent = 0;
        if (step1Completed) progressPercent += 20;
        else if (hasTrialBooked) progressPercent += 10;

        if (step2Completed) progressPercent += 20;

        if (step3Completed) progressPercent += 20;
        else if (step3Status === 'pending') progressPercent += 10;

        if (step4Completed) progressPercent += 20;
        if (step5Completed) progressPercent += 20;

        const steps = [
            {
                id: 1,
                label: 'Choose Trainer for Trial',
                description: 'View selected trainer, trial date, and trial status.',
                done: step1Completed,
                active: !step1Completed,
                icon: Calendar,
            },
            {
                id: 2,
                label: 'Select Preferred Trainer',
                description: 'Show the selected trainer\'s profile, specialization, and experience.',
                done: step2Completed,
                active: step1Completed && !step2Completed,
                icon: UserCheck,
            },
            {
                id: 3,
                label: 'Wait for Approval',
                description: 'Display approval status with real-time notifications and estimated response time.',
                done: step3Completed,
                active: step2Completed && !step3Completed,
                icon: Clock,
            },
            {
                id: 4,
                label: 'Complete Payment',
                description: 'Once approved, automatically activate the payment step and link to Billing.',
                done: step4Completed,
                active: step3Completed && !step4Completed,
                icon: CreditCard,
            },
            {
                id: 5,
                label: 'Personal Training Activated',
                description: 'Unlock personalized workouts and view assigned trainer details.',
                done: step5Completed,
                active: step4Completed && !step5Completed,
                icon: Unlock,
            },
        ];

        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-full max-w-2xl bg-slate-950/40 border border-slate-800/80 p-6 md:p-8 rounded-3xl relative overflow-hidden backdrop-blur-md">
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
                    </div>

                    {/* Lock Icon */}
                    <div className="flex flex-col items-center mb-8 relative text-center">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse scale-150" />
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-2xl">
                                <Lock className="w-10 h-10 text-indigo-400" />
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Personal Training Required</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Personal Training Required
                        </h1>
                        <p className="text-slate-350 mt-4 max-w-md text-sm font-semibold mx-auto">
                            To access personalized workout plans, you must:
                        </p>
                        <ul className="text-slate-400 mt-2.5 space-y-1.5 text-sm text-left max-w-xs mx-auto list-disc list-inside">
                            <li>Complete a trainer trial</li>
                            <li>Select your preferred trainer</li>
                            <li>Complete the personal training payment</li>
                        </ul>

                        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
                            <Link href="/member/personal-training">
                                <Button className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-950/20 text-sm gap-2">
                                    <Dumbbell className="w-4 h-4" />
                                    Choose Trainer
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Progress Accordion */}
                    <Accordion type="single" collapsible className="w-full border-t border-slate-800/80 pt-6">
                        <AccordionItem value="timeline" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2 text-xs font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                <span>View Hiring & Enrollment Progress</span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                                {/* Progress Percentage & Bar */}
                                <div className="mb-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Enrollment Progress</span>
                                        <span className="text-xs font-mono text-indigo-400 font-bold">{progressPercent}% Completed</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/30">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* Interactive Visual Timeline */}
                                <div className="space-y-0 relative pl-4 md:pl-6 text-sm">
                                    {steps.map((step, i) => {
                                        const Icon = step.icon;
                                        const isLast = i === steps.length - 1;
                                        const isCompleted = step.done;
                                        const isActive = step.active;

                                        return (
                                            <div key={step.id} className="relative pb-8 last:pb-0 animate-in fade-in duration-300">
                                                {/* Vertical Line Connector */}
                                                {!isLast && (
                                                    <div 
                                                        className={`absolute left-[15px] top-[32px] bottom-0 w-[2px] -z-10 transition-colors duration-500 ${
                                                            isCompleted ? 'bg-emerald-500/30' : 'bg-slate-800'
                                                        }`} 
                                                    />
                                                )}

                                                {/* Timeline Circle Node */}
                                                <div className="absolute left-0 top-[4px] -translate-x-[7px] z-10">
                                                    <div 
                                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
                                                            isCompleted 
                                                                ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                                : isActive
                                                                ? 'bg-indigo-950 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse'
                                                                : 'bg-slate-900 border-slate-800 text-slate-600'
                                                        }`}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <Icon className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Step content card */}
                                                <div className={`ml-8 md:ml-10 p-4 rounded-2xl border transition-all duration-300 ${
                                                    isCompleted 
                                                        ? 'bg-emerald-950/5 border-emerald-950/50'
                                                        : isActive
                                                        ? 'bg-indigo-950/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.04)]'
                                                        : 'bg-slate-900/20 border-slate-900 opacity-60'
                                                }`}>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-[10px] uppercase font-bold tracking-widest ${
                                                            isCompleted ? 'text-emerald-400' : isActive ? 'text-indigo-400' : 'text-slate-500'
                                                        }`}>
                                                            Step {step.id}
                                                        </span>
                                                        {isActive && (
                                                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">
                                                                Action Required
                                                            </Badge>
                                                        )}
                                                        {isCompleted && (
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded-full">
                                                                Completed
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h3 className={`text-base font-bold mt-1 ${
                                                        isCompleted ? 'text-slate-350' : isActive ? 'text-white' : 'text-slate-500'
                                                    }`}>
                                                        {step.label}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                        {step.description}
                                                    </p>

                                                    {/* Step Specific Details */}
                                                    {step.id === 1 && (
                                                        <div className="mt-3">
                                                            {hasTrialBooked ? (
                                                                (() => {
                                                                    const trainerInfo = TRAINERS_INFO[trialTrainerId as keyof typeof TRAINERS_INFO];
                                                                    return (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-left">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 overflow-hidden shrink-0">
                                                                                    {trainerInfo?.image ? (
                                                                                        <img src={trainerInfo.image} alt={trainerInfo.name} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        trainerInfo?.name ? trainerInfo.name.split(' ').map((n: string) => n[0]).join('') : 'T'
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-white text-left">{trainerInfo?.name || trialTrainerId}</p>
                                                                                    <p className="text-[11px] text-slate-400">Trial Schedule: {trialDate} at {trialTime}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                                                <span className="text-[10px] text-slate-550 font-medium">Status:</span>
                                                                                <Badge className={`px-2 py-0.5 text-[9px] font-black tracking-wide rounded-full border uppercase ${getTrialBadgeStyle(trialStatus)}`}>
                                                                                    {trialStatus}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()
                                                            ) : (
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 border-dashed text-left">
                                                                    <p className="text-xs text-slate-500">No trial session booked yet.</p>
                                                                    <Link href="/member/trainer-trial">
                                                                        <Button size="sm" className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5 font-bold">
                                                                            <Calendar className="w-3.5 h-3.5" />
                                                                            Book Trial
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {step.id === 2 && (
                                                        <div className="mt-3">
                                                            {step2Completed ? (
                                                                (() => {
                                                                    const prefTrainer = TRAINERS_INFO[preferredTrainerIdVal as keyof typeof TRAINERS_INFO];
                                                                    return (
                                                                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 overflow-hidden shrink-0">
                                                                                    {prefTrainer?.image ? (
                                                                                        <img src={prefTrainer.image} alt={prefTrainer.name} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        prefTrainer?.name ? prefTrainer.name.split(' ').map((n: string) => n[0]).join('') : 'PT'
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-sm font-bold text-white text-left">{prefTrainer?.name || preferredTrainerIdVal}</h4>
                                                                                    <p className="text-xs text-purple-400 font-medium mt-0.5">{prefTrainer?.role}</p>
                                                                                    <p className="text-[11px] text-slate-400 mt-1">Experience: {prefTrainer?.experience || '10+ Years'}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {prefTrainer?.specialties?.map((spec, sidx) => (
                                                                                    <span key={sidx} className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-medium">
                                                                                        {spec}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()
                                                            ) : (
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 border-dashed text-left">
                                                                    <p className="text-xs text-slate-500">No preferred trainer selected.</p>
                                                                    <Link href="/member/trainer-trial">
                                                                        <Button size="sm" className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5 font-bold">
                                                                            <UserCheck className="w-3.5 h-3.5" />
                                                                            Select Trainer
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {step.id === 3 && (
                                                        <div className="mt-3">
                                                            {step3Status ? (
                                                                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3 text-left">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-slate-400">Request Status:</span>
                                                                            <Badge className={`px-2 py-0.5 text-[9px] font-black tracking-wide rounded-full border uppercase ${getPTRequestBadgeStyle(step3Status)}`}>
                                                                                {step3Status}
                                                                            </Badge>
                                                                        </div>
                                                                        <span className="text-[11px] text-indigo-400 font-medium">
                                                                            Est. response: &lt; 2 hours
                                                                        </span>
                                                                    </div>
                                                                    {step3Status === 'pending' && (
                                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/50 animate-pulse">
                                                                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping shrink-0" />
                                                                            <span>Real-time sync active: Waiting for trainer response...</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 border-dashed text-left">
                                                                    <p className="text-xs text-slate-500">No active Personal Training request found.</p>
                                                                    <Link href="/member/personal-training">
                                                                        <Button size="sm" className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5 font-bold">
                                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                                            Send Request
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {step.id === 4 && (
                                                        <div className="mt-3">
                                                            {step4Completed ? (
                                                                <div className="flex items-center gap-2 p-3 bg-emerald-950/10 rounded-xl border border-emerald-500/20 text-left">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                                    <p className="text-xs text-emerald-400 font-bold">Payment Confirmed (₹9,999 Paid)</p>
                                                                </div>
                                                            ) : step4Active ? (
                                                                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3 text-left">
                                                                    <p className="text-xs text-slate-350">
                                                                        Your request has been approved! Complete the payment to activate your plan.
                                                                    </p>
                                                                    <Link href="/member/billing?payPT=true" className="inline-block">
                                                                        <Button size="sm" className="h-9 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs gap-1.5 shadow-md shadow-emerald-900/20">
                                                                            <CreditCard className="w-3.5 h-3.5" />
                                                                            Go to Billing & Pay Now
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 bg-slate-950/20 rounded-xl border border-slate-900 text-slate-500 text-xs text-left">
                                                                    🔒 Activates automatically once trainer request is approved.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {step.id === 5 && (
                                                        <div className="mt-3">
                                                            {step5Completed ? (
                                                                <div className="p-4 bg-emerald-950/20 rounded-xl border-2 border-emerald-500/30 space-y-3 relative overflow-hidden text-left">
                                                                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl pointer-events-none" />
                                                                    <div className="relative z-10 flex flex-col gap-2">
                                                                        <div className="flex items-center gap-2 text-emerald-400">
                                                                            <Unlock className="w-4 h-4" />
                                                                            <span className="text-sm font-black uppercase tracking-wider">Plan Active & Workouts Unlocked!</span>
                                                                        </div>
                                                                        <p className="text-xs text-slate-300">
                                                                            Assigned Coach: <strong className="text-white">{ptStatus.assignedTrainerName || 'Marcus Johnson'}</strong>
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                                                                            <span>Start Date: {formatDate(ptStatus.startDate || ptStatus.paymentDate)}</span>
                                                                            <span>Expiry Date: {formatDate(ptStatus.expiryDate)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 bg-slate-950/20 rounded-xl border border-slate-900 text-slate-650 text-xs text-left">
                                                                    🔓 Your plan will activate immediately upon payment confirmation.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        );
    }

    if (!workoutPlan || !dietPlan) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-500/20 rounded-full"></div>
                    <p className="text-indigo-400 font-medium">Syncing your elite routines...</p>
                </div>
            </div>
        );
    }

    const WORKOUT_PLAN = workoutPlan;
    const DIET_PLAN = dietPlan;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
                <div className="flex-1 bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                            <Target className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Active Phase</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight italic uppercase">
                            MY <span className="text-primary">WORKOUTS</span>
                        </h1>
                        <p className="text-slate-200 max-w-xl text-lg">
                            Master your evolution with custom-engineered routines. These plans are dynamically updated by your elite trainer based on your biometrics.
                        </p>
                    </div>
                </div>

                {/* Trainer Assignment Card */}
                <Card className="w-full lg:w-80 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full border-2 border-indigo-500/50 p-1">
                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-indigo-600 dark:text-indigo-400">
                                    {ptStatus.assignedTrainerName ? ptStatus.assignedTrainerName.split(' ').map((n: string) => n[0]).join('') : 'MJ'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] mb-1">Elite Trainer</p>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {ptStatus.assignedTrainerName || 'Marcus Johnson'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {ptStatus.assignedTrainerName === 'Sarah Chen' ? 'Specializing in HIIT & Cardio Conditioning' :
                                 ptStatus.assignedTrainerName === 'Michael Rivers' ? 'Specializing in Injury Prevention & Recovery' :
                                 'Specializing in Strength & Conditioning'}
                            </p>
                            {ptStatus.startDate && ptStatus.expiryDate && (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-slate-550 font-bold uppercase">Plan Start:</span>
                                        <span>{formatDate(ptStatus.startDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-550 font-bold uppercase">Plan Expiry:</span>
                                        <span>{formatDate(ptStatus.expiryDate)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/member/feedback" className="w-full">
                            <Button 
                                variant="outline" 
                                className="w-full bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-950/20 dark:hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 transition-all duration-300 rounded-xl py-5 h-auto text-xs font-black uppercase tracking-widest gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Request Revision
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs Interface */}
            <Tabs defaultValue="workout" className="w-full">
                <div className="flex justify-center md:justify-start mb-8">
                    <TabsList className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl h-14 w-full md:w-auto grid grid-cols-2 gap-1">
                        <TabsTrigger value="workout" className="rounded-xl data-[state=active]:bg-emerald-500/10 dark:data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 border border-transparent transition-all px-8 text-base">
                            <Dumbbell className="w-4 h-4 mr-2" />
                            Workout Plan
                        </TabsTrigger>
                        <TabsTrigger value="diet" className="rounded-xl data-[state=active]:bg-orange-500/10 dark:data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30 border border-transparent transition-all px-8 text-base">
                            <Flame className="w-4 h-4 mr-2" />
                            Diet Plan
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* WORKOUT TAB */}
                <TabsContent value="workout" className="space-y-6">
                    {/* Workout Overviews */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-2xl text-slate-800 dark:text-white">{WORKOUT_PLAN.name}</CardTitle>
                                <CardDescription className="text-base text-emerald-600 dark:text-emerald-400/80">Primary Focus: {WORKOUT_PLAN.focus}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-4">
                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                                    {WORKOUT_PLAN.duration}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3">
                                    <Activity className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                                    Intensity: {WORKOUT_PLAN.intensity}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3">
                                    <Dumbbell className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                    {WORKOUT_PLAN.exercises.length} Exercises
                                </Badge>
                            </CardContent>
                        </Card>

                        <Link href="/member/workout/active" className="block w-full">
                            <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center p-6 text-center group cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors h-full">
                                <div className="space-y-3">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-emerald-750 dark:text-emerald-400 font-semibold text-lg">Start Live Workout</h3>
                                    <p className="text-sm text-emerald-600/70 dark:text-emerald-500/60">Log today's session</p>
                                </div>
                            </Card>
                        </Link>
                    </div>

                    {/* Exercises List / Weekly Calendar */}
                    {weeklyWorkoutPlan ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-500 animate-pulse" />
                                    Weekly Calendar Schedule
                                </h3>
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold py-1 px-3">
                                    Calendar View
                                </Badge>
                            </div>
                            <div className="space-y-4">
                                {DAYS.map((day) => {
                                    const exercises = weeklyWorkoutPlan.weeklyPlan[day] || [];
                                    const isToday = day === todayName;
                                    const grouped = groupExercises(exercises);

                                    return (
                                        <Card key={day} className={`bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 transition-all duration-300 overflow-hidden ${isToday ? 'ring-1 ring-emerald-500/50 border-emerald-500/30 bg-emerald-500/[0.01]' : ''}`}>
                                            <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-950/40 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-900/50">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`} />
                                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{day} {isToday && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium ml-1.5">(Today's Workout)</span>}</h4>
                                                </div>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    {exercises.length === 0 ? 'Rest Day' : `${exercises.length} Exercises`}
                                                </span>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-4">
                                                {exercises.length === 0 ? (
                                                    <div className="py-6 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50 dark:bg-slate-950/10 rounded-xl border border-slate-200 dark:border-slate-900 border-dashed">
                                                        <Activity className="w-5 h-5 mb-1.5 text-slate-400" />
                                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Rest & Recovery</p>
                                                        <p className="text-[9px] text-slate-500 mt-0.5">Focus on recovery, stretching, and nutrition.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {grouped.map((group, groupIdx) => {
                                                            if (group.type === 'superset') {
                                                                    const groupName = group.groupName || 'A';
                                                                    const borderClass = groupName === 'A' ? 'border-fuchsia-500/30 bg-fuchsia-500/[0.01]' : 
                                                                                        groupName === 'B' ? 'border-indigo-500/30 bg-indigo-500/[0.01]' : 
                                                                                        'border-cyan-500/30 bg-cyan-500/[0.01]';
                                                                    const textClass = groupName === 'A' ? 'text-fuchsia-400' : 
                                                                                      groupName === 'B' ? 'text-indigo-400' : 
                                                                                      'text-cyan-400';
                                                                    const badgeBg = groupName === 'A' ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20' :
                                                                                    groupName === 'B' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                                                                                    'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
                                                                
                                                                return (
                                                                    <div key={groupIdx} className={`border rounded-xl p-3.5 space-y-3 ${borderClass}`}>
                                                                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-900/50">
                                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${textClass}`}>
                                                                                {groupName === 'C' ? 'Circuit Group C' : `Superset Group ${groupName}`}
                                                                            </span>
                                                                            <Badge className={`${badgeBg} text-[8px] uppercase font-mono font-bold tracking-wider`}>
                                                                                No rest between exercises
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="space-y-3.5">
                                                                            {group.items.map((ex) => (
                                                                                <div key={ex.id} className="pl-3.5 border-l border-slate-200 dark:border-slate-800 space-y-1.5 last:mb-0">
                                                                                    <div className="flex justify-between items-start gap-2">
                                                                                        <div>
                                                                                            <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">{ex.name}</h5>
                                                                                            <p className="text-[10px] text-slate-500 font-medium">{ex.target}</p>
                                                                                        </div>
                                                                                        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono shrink-0">
                                                                                            <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300">{ex.sets} Sets</span>
                                                                                            <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300">{ex.reps} Reps</span>
                                                                                            {ex.weight && <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300">{ex.weight}</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                    {(ex.duration || ex.rest || ex.notes) && (
                                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-900/50">
                                                                                            {ex.duration && <div><span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-1">Duration:</span>{ex.duration}</div>}
                                                                                            {ex.rest && <div><span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-1">Rest:</span>{ex.rest}</div>}
                                                                                            {ex.notes && <div className="sm:col-span-2 md:col-span-3"><span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-1">Coaching Note:</span>{ex.notes}</div>}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                const ex = group.items[0];
                                                                return (
                                                                    <div key={ex.id} className="border border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl p-3.5 space-y-1.5">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <div>
                                                                                <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">{ex.name}</h5>
                                                                                <p className="text-[10px] text-slate-500 font-medium">{ex.target}</p>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono shrink-0">
                                                                                <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300">{ex.sets} Sets</span>
                                                                                <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300">{ex.reps} Reps</span>
                                                                                {ex.weight && <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300">{ex.weight}</span>}
                                                                            </div>
                                                                        </div>
                                                                        {(ex.duration || ex.rest || ex.notes) && (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-900/50">
                                                                                {ex.duration && <div><span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-1">Duration:</span>{ex.duration}</div>}
                                                                                {ex.rest && <div><span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-1">Rest:</span>{ex.rest}</div>}
                                                                                {ex.notes && <div className="sm:col-span-2 md:col-span-3"><span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-1">Coaching Note:</span>{ex.notes}</div>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        })}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60">
                            <CardHeader>
                                <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2">
                                    <ChevronRight className="w-5 h-5 text-emerald-500" />
                                    Today's Routine
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="multiple" className="w-full">
                                    {WORKOUT_PLAN.exercises.map((exercise, index) => (
                                        <AccordionItem key={exercise.id} value={`item-${index}`} className="border-slate-100 dark:border-slate-800">
                                            <AccordionTrigger className="hover:no-underline text-left group">
                                                <div className="flex items-center gap-4 w-full pr-4">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{exercise.name}</h4>
                                                        <p className="text-sm text-slate-500">{exercise.target}</p>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        <span className="bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800">{exercise.sets} Sets</span>
                                                        <span className="bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800">{exercise.reps} Reps</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-4 pb-6 px-14 text-slate-500 dark:text-slate-400">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase tracking-wider text-slate-500">Sets</p>
                                                        <p className="text-lg font-bold text-slate-800 dark:text-white">{exercise.sets}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase tracking-wider text-slate-500">Reps</p>
                                                        <p className="text-lg font-bold text-slate-800 dark:text-white">{exercise.reps}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase tracking-wider text-slate-500">Rest</p>
                                                        <p className="text-lg font-bold text-slate-800 dark:text-white">{exercise.rest}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase tracking-wider text-slate-500">Target</p>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{exercise.target}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex gap-3">
                                                    <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                                    <p className="text-sm">{exercise.notes}</p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* DIET TAB */}
                <TabsContent value="diet" className="space-y-6">
                    {/* Diet Overview & Macros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60">
                            <CardHeader>
                                <CardTitle className="text-2xl text-slate-800 dark:text-white">{DIET_PLAN.name}</CardTitle>
                                <CardDescription className="text-base text-orange-600 dark:text-orange-400/80">Goal: {DIET_PLAN.goal}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 mt-2">
                                    <div className="p-3 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
                                        <Flame className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-550 dark:text-slate-400 uppercase tracking-wider">Daily Target</p>
                                        <p className="text-3xl font-black text-slate-800 dark:text-white">{DIET_PLAN.dailyCalories} <span className="text-lg font-normal text-slate-550 dark:text-slate-500">kcal</span></p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Macro Breakdown */}
                        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-slate-800 dark:text-white font-medium flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Macro Targets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {Object.entries(DIET_PLAN.macros).map(([key, macro]) => (
                                    <div key={key} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{macro.label}</span>
                                            <span className="text-slate-500 dark:text-slate-400 font-mono">
                                                {macro.current} / <span className="text-slate-800 dark:text-white font-bold">{macro.target}</span>
                                            </span>
                                        </div>
                                        <Progress value={(macro.current / macro.target) * 100} className={`h-2 [&>div]:${macro.color}`} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meal Schedule */}
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white pt-4 pb-2 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-orange-500" />
                        Today's Meals
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {DIET_PLAN.meals.map((meal) => (
                            <Card key={meal.id} className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 hover:border-orange-500/30 transition-colors group">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">{meal.type}</p>
                                        <CardTitle className="text-xl text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-50">{meal.name}</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                                        {meal.time}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 mt-2">
                                        {meal.foods.map((food, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-1.5" />
                                                {food}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Estimated</span>
                                    <span className="font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                        {meal.calories} kcal
                                    </span>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
}
