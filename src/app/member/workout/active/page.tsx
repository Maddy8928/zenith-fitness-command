'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Clock,
    Flame,
    Dumbbell,
    CheckCircle2,
    PlayCircle,
    Info,
    X,
    Trophy,
    ArrowRight,
    Loader2,
    Lock
} from 'lucide-react';

// --- MOCK DATA ---
const ACTIVE_WORKOUT = {
    id: 'wk-101',
    name: 'Hypertrophy Phase 2: Upper Body',
    target: 'Chest, Back, Arms',
    estimatedTime: '60 min',
    exercises: [
        {
            id: 'ex-1',
            name: 'Barbell Bench Press',
            muscle: 'Chest',
            notes: 'Focus on eccentric control. Keep elbows tucked.',
            sets: [
                { id: 's1-1', setNumber: 1, targetReps: 10, weight: '', isCompleted: false },
                { id: 's1-2', setNumber: 2, targetReps: 8, weight: '', isCompleted: false },
                { id: 's1-3', setNumber: 3, targetReps: 8, weight: '', isCompleted: false },
                { id: 's1-4', setNumber: 4, targetReps: 6, weight: '', isCompleted: false },
            ]
        },
        {
            id: 'ex-2',
            name: 'Incline Dumbbell Press',
            muscle: 'Upper Chest',
            notes: 'Slight pause at the bottom.',
            sets: [
                { id: 's2-1', setNumber: 1, targetReps: 12, weight: '', isCompleted: false },
                { id: 's2-2', setNumber: 2, targetReps: 10, weight: '', isCompleted: false },
                { id: 's2-3', setNumber: 3, targetReps: 10, weight: '', isCompleted: false },
            ]
        },
        {
            id: 'ex-3',
            name: 'Lat Pulldown (Wide Grip)',
            muscle: 'Back',
            notes: 'Pull to upper chest. Squeeze at the bottom.',
            sets: [
                { id: 's3-1', setNumber: 1, targetReps: 12, weight: '', isCompleted: false },
                { id: 's3-2', setNumber: 2, targetReps: 12, weight: '', isCompleted: false },
                { id: 's3-3', setNumber: 3, targetReps: 10, weight: '', isCompleted: false },
                { id: 's3-4', setNumber: 4, targetReps: 10, weight: '', isCompleted: false },
            ]
        }
    ]
};

export default function ActiveWorkoutPage() {
    const router = useRouter();

    // -- State --
    const [isWorkoutsLocked, setIsWorkoutsLocked] = useState<boolean | null>(null);
    const [workoutData, setWorkoutData] = useState(ACTIVE_WORKOUT);
    const [timeElapsed, setTimeElapsed] = useState(0); // in seconds

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

    const [isFinishing, setIsFinishing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // -- Timer Logic --
    useEffect(() => {
        if (isFinishing || isCompleted) return;

        const timer = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinishing, isCompleted]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // -- Handlers --
    const toggleSetComplete = (exerciseId: string, setId: string) => {
        setWorkoutData((prev) => {
            const newExercises = prev.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                const newSets = ex.sets.map((set) => {
                    if (set.id !== setId) return set;
                    return { ...set, isCompleted: !set.isCompleted };
                });
                return { ...ex, sets: newSets };
            });
            return { ...prev, exercises: newExercises };
        });
    };

    const updateSetWeight = (exerciseId: string, setId: string, value: string) => {
        setWorkoutData((prev) => {
            const newExercises = prev.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                const newSets = ex.sets.map((set) => {
                    if (set.id !== setId) return set;
                    return { ...set, weight: value };
                });
                return { ...ex, sets: newSets };
            });
            return { ...prev, exercises: newExercises };
        });
    };

    const handleFinishWorkout = async () => {
        setIsFinishing(true);
        // Simulate Network Request / Saving to DB
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsFinishing(false);
        setIsCompleted(true);
    };

    // -- Calculations --
    const totalSets = workoutData.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = workoutData.exercises.reduce((acc, ex) => {
        return acc + ex.sets.filter((s) => s.isCompleted).length;
    }, 0);
    const progressPerc = Math.round((completedSets / totalSets) * 100) || 0;


    // --- Render Gate Checks ---
    if (isWorkoutsLocked === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic">
                Verifying Trainer Assignment...
            </div>
        );
    }

    if (isWorkoutsLocked) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 rounded-3xl relative overflow-hidden backdrop-blur-md text-center">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="mx-auto w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20">
                        <Lock className="w-10 h-10" />
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-tight mb-2">Access Denied</h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Active workout sessions are only available to members who have an active Personal Trainer assigned.
                    </p>

                    <Button
                        onClick={() => router.push('/member/plans')}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white font-bold rounded-xl h-12"
                    >
                        Go to My Workouts
                    </Button>
                </div>
            </div>
        );
    }

    // --- Render Success Screen ---
    if (isCompleted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-500">
                <div className="relative">
                    {/* Confetti Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

                    <Card className="glass-card bg-slate-900/60 backdrop-blur-2xl border-slate-700/50 max-w-md w-full relative z-10 overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

                        <CardHeader className="pt-10 pb-4">
                            <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/20">
                                <Trophy className="w-12 h-12" />
                            </div>
                            <CardTitle className="text-3xl text-white font-black">Workout Complete!</CardTitle>
                            <CardDescription className="text-slate-400 text-lg">Great job crushing '{workoutData.name}'</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                                    <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Duration</p>
                                    <p className="text-2xl font-bold text-white font-mono">{formatTime(timeElapsed)}</p>
                                </div>
                                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Sets Done</p>
                                    <p className="text-2xl font-bold text-white font-mono">{completedSets}/{totalSets}</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3 text-left">
                                <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-200">Streak Updated!</p>
                                    <p className="text-xs text-slate-400">You're now on a 6-day active streak. Keep the momentum going tomorrow.</p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pb-8">
                            <Button
                                onClick={() => router.push('/member')}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-emerald-900/20"
                            >
                                Back to Dashboard
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    // --- Render Active Workout ---
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28 min-h-screen">

            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Session Active</span>
                    </div>
                    <h1 className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-md">
                        {workoutData.name}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-lg font-mono font-bold text-white tracking-wider">{formatTime(timeElapsed)}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/member/plans')}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="max-w-3xl mx-auto space-y-6 pt-4">

                <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                    <div className="flex flex-col w-full pr-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-slate-300">Workout Progress</span>
                            <span className="text-lg font-bold text-emerald-400">{progressPerc}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                                style={{ width: `${progressPerc}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex-shrink-0 text-center pl-6 border-l border-slate-800">
                        <span className="block text-2xl font-black text-white">{completedSets}/{totalSets}</span>
                        <span className="block text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Sets Done</span>
                    </div>
                </div>

                {/* Exercises Stack */}
                <div className="space-y-6">
                    {workoutData.exercises.map((exercise, exIdx) => {
                        const isExComplete = exercise.sets.every(s => s.isCompleted);

                        return (
                            <Card
                                key={exercise.id}
                                className={`glass-card backdrop-blur-xl border transition-all duration-500 overflow-hidden ${isExComplete
                                        ? 'bg-emerald-950/20 border-emerald-900/50 opacity-70 hover:opacity-100'
                                        : 'bg-slate-900/60 border-slate-700/50 shadow-lg'
                                    }`}
                            >
                                <CardHeader className="pb-4 border-b border-slate-800/50 bg-slate-950/30">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isExComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                                                }`}>
                                                {exIdx + 1}
                                            </div>
                                            <div>
                                                <CardTitle className={`text-xl transition-colors ${isExComplete ? 'text-emerald-100' : 'text-white'}`}>
                                                    {exercise.name}
                                                </CardTitle>
                                                <CardDescription className="text-slate-400 mt-1 flex items-center gap-2">
                                                    <Dumbbell className="w-3.5 h-3.5" />
                                                    {exercise.muscle}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {isExComplete && (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Done
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Exercise Notes */}
                                    {exercise.notes && !isExComplete && (
                                        <div className="mt-4 bg-slate-800/30 border border-slate-700/50 p-3 rounded-lg flex gap-3">
                                            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-300">{exercise.notes}</p>
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="p-0">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-2 p-3 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-800/50 bg-slate-900/30">
                                        <div className="col-span-2 text-center">Set</div>
                                        <div className="col-span-3 text-center">Previous</div>
                                        <div className="col-span-2 text-center">kg/lbs</div>
                                        <div className="col-span-3 text-center">Reps</div>
                                        <div className="col-span-2 text-center"><CheckCircle2 className="w-4 h-4 mx-auto" /></div>
                                    </div>

                                    {/* Set Rows */}
                                    <div className="divide-y divide-slate-800/30">
                                        {exercise.sets.map((set) => (
                                            <div
                                                key={set.id}
                                                className={`grid grid-cols-12 gap-2 p-3 items-center transition-colors ${set.isCompleted ? 'bg-emerald-950/10' : 'hover:bg-slate-800/30'
                                                    }`}
                                            >
                                                <div className="col-span-2 text-center">
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-800 cursor-default">
                                                        {set.setNumber}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-3 text-center text-sm text-slate-500 font-mono">
                                                    -
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={set.weight}
                                                        onChange={(e) => updateSetWeight(exercise.id, set.id, e.target.value)}
                                                        disabled={set.isCompleted}
                                                        className={`h-8 text-center font-mono ${set.isCompleted
                                                                ? 'bg-transparent border-transparent text-emerald-400 focus-visible:ring-0 disabled:opacity-100'
                                                                : 'bg-slate-950/50 border-slate-700 text-white focus-visible:ring-emerald-500'
                                                            }`}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <Input
                                                        type="number"
                                                        defaultValue={set.targetReps}
                                                        disabled={set.isCompleted}
                                                        className={`h-8 text-center font-mono ${set.isCompleted
                                                                ? 'bg-transparent border-transparent text-emerald-400 focus-visible:ring-0 disabled:opacity-100'
                                                                : 'bg-slate-950/50 border-slate-700 text-white focus-visible:ring-emerald-500'
                                                            }`}
                                                    />
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    <Checkbox
                                                        checked={set.isCompleted}
                                                        onCheckedChange={() => toggleSetComplete(exercise.id, set.id)}
                                                        className="h-6 w-6 border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 p-4 md:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden sm:block text-slate-400 text-sm">
                        <span className="font-bold text-white">{completedSets}</span> of {totalSets} sets completed
                    </div>
                    <Button
                        onClick={handleFinishWorkout}
                        disabled={isFinishing || completedSets === 0}
                        size="lg"
                        className="w-full sm:w-auto flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFinishing ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin text-white" />
                                Saving Session...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-6 w-6" />
                                Finish Workout
                            </>
                        )}
                    </Button>
                </div>
            </div>

        </div>
    );
}
