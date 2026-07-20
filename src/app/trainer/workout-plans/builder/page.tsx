'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlan } from '@/context/PlanContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    Search,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Save,
    Check,
    Activity,
    Dumbbell,
    Calendar,
    Users,
    RefreshCw,
    Layers,
    Clock,
    Flame,
    Info
} from 'lucide-react';

// Pre-defined exercise library data
const EXERCISE_LIBRARY = [
    { id: 'lib_1', name: 'Barbell Bench Press', category: 'Chest', target: 'Chest, Triceps' },
    { id: 'lib_2', name: 'Incline Dumbbell Press', category: 'Chest', target: 'Upper Chest, Front Delts' },
    { id: 'lib_3', name: 'Chest Flyes', category: 'Chest', target: 'Chest' },
    { id: 'lib_4', name: 'Push-ups', category: 'Chest', target: 'Chest, Core' },
    { id: 'lib_5', name: 'Dips', category: 'Chest', target: 'Lower Chest, Triceps' },
    
    { id: 'lib_6', name: 'Deadlift', category: 'Back', target: 'Hamstrings, Glutes, Back' },
    { id: 'lib_7', name: 'Pull-ups', category: 'Back', target: 'Lats, Biceps' },
    { id: 'lib_8', name: 'Lat Pulldown', category: 'Back', target: 'Lats, Upper Back' },
    { id: 'lib_9', name: 'Seated Cable Row', category: 'Back', target: 'Mid Back' },
    { id: 'lib_10', name: 'Bent Over Barbell Row', category: 'Back', target: 'Lats, Mid Back' },
    
    { id: 'lib_11', name: 'Barbell Squats', category: 'Legs', target: 'Quads, Glutes' },
    { id: 'lib_12', name: 'Bulgarian Split Squats', category: 'Legs', target: 'Quads, Hamstrings' },
    { id: 'lib_13', name: 'Leg Press', category: 'Legs', target: 'Quads' },
    { id: 'lib_14', name: 'Lying Leg Curls', category: 'Legs', target: 'Hamstrings' },
    { id: 'lib_15', name: 'Calf Raises', category: 'Legs', target: 'Calves' },
    
    { id: 'lib_16', name: 'Overhead Press', category: 'Shoulders', target: 'Front Delts, Triceps' },
    { id: 'lib_17', name: 'Dumbbell Lateral Raises', category: 'Shoulders', target: 'Lateral Delts' },
    { id: 'lib_18', name: 'Front Raises', category: 'Shoulders', target: 'Front Delts' },
    { id: 'lib_19', name: 'Face Pulls', category: 'Shoulders', target: 'Rear Delts, Rotator Cuff' },
    
    { id: 'lib_20', name: 'Bicep Barbell Curls', category: 'Arms', target: 'Biceps' },
    { id: 'lib_21', name: 'Hammer Curls', category: 'Arms', target: 'Biceps, Forearms' },
    { id: 'lib_22', name: 'Tricep Pushdowns', category: 'Arms', target: 'Triceps' },
    { id: 'lib_23', name: 'Skull Crushers', category: 'Arms', target: 'Triceps' },
    
    { id: 'lib_24', name: 'Planks', category: 'Core', target: 'Abs, Core' },
    { id: 'lib_25', name: 'Hanging Leg Raises', category: 'Core', target: 'Lower Abs' },
    { id: 'lib_26', name: 'Cable Crunches', category: 'Core', target: 'Abs' },
    { id: 'lib_27', name: 'Russian Twists', category: 'Core', target: 'Obliques' },
    
    { id: 'lib_28', name: 'Running', category: 'Cardio', target: 'Cardiovascular Endurance' },
    { id: 'lib_29', name: 'Row Machine', category: 'Cardio', target: 'Full Body Endurance' },
    { id: 'lib_30', name: 'Assault Bike', category: 'Cardio', target: 'High Intensity Conditioning' },
    { id: 'lib_31', name: 'Kettlebell Swings', category: 'Cardio', target: 'Posterior Chain Conditioning' },
    { id: 'lib_32', name: 'Burpees', category: 'Cardio', target: 'Full Body Conditioning' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface PlannerExercise {
    id: string;
    name: string;
    target: string;
    sets: number;
    reps: string;
    weight: string;
    duration: string;
    rest: string;
    notes: string;
    supersetGroup: string; // '', 'A', 'B', 'C', etc.
}

interface WeeklyPlanState {
    [key: string]: PlannerExercise[];
}

export default function WorkoutBuilder() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { assignWorkoutPlan } = usePlan();
    const router = useRouter();

    // Form inputs
    const [planTitle, setPlanTitle] = useState('Custom Weekly Plan');
    const [planFocus, setPlanFocus] = useState('Full Body Split');
    const [planDuration, setPlanDuration] = useState('8 Weeks');
    const [planIntensity, setPlanIntensity] = useState('Moderate');
    const [selectedClient, setSelectedClient] = useState('member@flexgym.com');

    // Exercise search & filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // The weekly plan day-by-day
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanState>({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    });

    // Mobile menu open day index for exercise library add buttons
    const [activeMobileAddMenu, setActiveMobileAddMenu] = useState<string | null>(null);

    // Drag over state for styling drop zones
    const [dragOverDay, setDragOverDay] = useState<string | null>(null);
    const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

    // Autosave status indicator state
    const [autosaveStatus, setAutosaveStatus] = useState<string>('Saved');
    const [hasLoaded, setHasLoaded] = useState(false);

    // Load draft on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDraft = localStorage.getItem('zenith_builder_draft_plan');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    if (parsed.planTitle) setPlanTitle(parsed.planTitle);
                    if (parsed.planFocus) setPlanFocus(parsed.planFocus);
                    if (parsed.planDuration) setPlanDuration(parsed.planDuration);
                    if (parsed.planIntensity) setPlanIntensity(parsed.planIntensity);
                    if (parsed.selectedClient) setSelectedClient(parsed.selectedClient);
                    if (parsed.weeklyPlan) setWeeklyPlan(parsed.weeklyPlan);
                    toast.success('Restored draft workout plan.');
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
            setHasLoaded(true);
        }
    }, []);

    // Autosave timer (runs every 3 seconds if changes occur)
    useEffect(() => {
        if (!hasLoaded) return;
        
        setAutosaveStatus('Saving...');
        const timer = setTimeout(() => {
            const draftState = {
                planTitle,
                planFocus,
                planDuration,
                planIntensity,
                selectedClient,
                weeklyPlan
            };
            localStorage.setItem('zenith_builder_draft_plan', JSON.stringify(draftState));
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setAutosaveStatus(`Saved at ${timeStr}`);
        }, 1500);

        return () => clearTimeout(timer);
    }, [planTitle, planFocus, planDuration, planIntensity, selectedClient, weeklyPlan, hasLoaded]);

    // Guard route
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN') || !hasLoaded) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Workout Builder...</div>;
    }

    // --- Drag and Drop Handlers ---
    const handleDragStartFromLibrary = (e: React.DragEvent, exercise: typeof EXERCISE_LIBRARY[0]) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            source: 'library',
            exercise: exercise
        }));
    };

    const handleDragStartFromPlanner = (e: React.DragEvent, dayName: string, exerciseIndex: number) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            source: 'planner',
            day: dayName,
            index: exerciseIndex
        }));
    };

    const handleDragOverDay = (e: React.DragEvent, dayName: string) => {
        e.preventDefault();
        if (dragOverDay !== dayName) {
            setDragOverDay(dayName);
        }
    };

    const handleDropOnDay = (e: React.DragEvent, targetDay: string) => {
        e.preventDefault();
        setDragOverDay(null);
        try {
            const dataStr = e.dataTransfer.getData('application/json');
            if (!dataStr) return;
            const data = JSON.parse(dataStr);

            if (data.source === 'library') {
                // Create a new planner exercise
                const newEx: PlannerExercise = {
                    id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    name: data.exercise.name,
                    target: data.exercise.target,
                    sets: 4,
                    reps: '10',
                    weight: 'Bodyweight',
                    duration: '',
                    rest: '60s',
                    notes: '',
                    supersetGroup: ''
                };
                setWeeklyPlan(prev => ({
                    ...prev,
                    [targetDay]: [...prev[targetDay], newEx]
                }));
                toast.success(`Added ${newEx.name} to ${targetDay}`, { duration: 1500 });
            } else if (data.source === 'planner') {
                const { day: sourceDay, index: sourceIndex } = data;
                if (sourceDay === targetDay) return; // Dropping on same day box (append) doesn't change order

                const movingExercise = weeklyPlan[sourceDay][sourceIndex];

                setWeeklyPlan(prev => {
                    const sourceList = [...prev[sourceDay]];
                    const targetList = [...prev[targetDay]];

                    sourceList.splice(sourceIndex, 1);
                    targetList.push(movingExercise);

                    return {
                        ...prev,
                        [sourceDay]: sourceList,
                        [targetDay]: targetList
                    };
                });
                toast.success(`Moved ${movingExercise.name} to ${targetDay}`, { duration: 1500 });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDropOnCard = (e: React.DragEvent, targetDay: string, targetIndex: number) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOverCardId(null);
        setDragOverDay(null);

        try {
            const dataStr = e.dataTransfer.getData('application/json');
            if (!dataStr) return;
            const data = JSON.parse(dataStr);

            if (data.source === 'library') {
                const newEx: PlannerExercise = {
                    id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    name: data.exercise.name,
                    target: data.exercise.target,
                    sets: 4,
                    reps: '10',
                    weight: 'Bodyweight',
                    duration: '',
                    rest: '60s',
                    notes: '',
                    supersetGroup: ''
                };

                setWeeklyPlan(prev => {
                    const list = [...prev[targetDay]];
                    list.splice(targetIndex, 0, newEx);
                    return {
                        ...prev,
                        [targetDay]: list
                    };
                });
                toast.success(`Inserted ${newEx.name} at position ${targetIndex + 1}`, { duration: 1500 });
            } else if (data.source === 'planner') {
                const { day: sourceDay, index: sourceIndex } = data;
                const movingExercise = weeklyPlan[sourceDay][sourceIndex];

                setWeeklyPlan(prev => {
                    const sourceList = [...prev[sourceDay]];

                    if (sourceDay === targetDay) {
                        // Reordering in same day
                        sourceList.splice(sourceIndex, 1);
                        sourceList.splice(targetIndex, 0, movingExercise);
                        return {
                            ...prev,
                            [targetDay]: sourceList
                        };
                    } else {
                        // Move and insert in different day
                        const targetList = [...prev[targetDay]];
                        sourceList.splice(sourceIndex, 1);
                        targetList.splice(targetIndex, 0, movingExercise);

                        return {
                            ...prev,
                            [sourceDay]: sourceList,
                            [targetDay]: targetList
                        };
                    }
                });
                toast.success(`Moved ${movingExercise.name} to ${targetDay} position ${targetIndex + 1}`, { duration: 1500 });
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- Click actions (Mobile Fallback) ---
    const addFromLibraryToDay = (exercise: typeof EXERCISE_LIBRARY[0], targetDay: string) => {
        const newEx: PlannerExercise = {
            id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: exercise.name,
            target: exercise.target,
            sets: 4,
            reps: '10',
            weight: 'Bodyweight',
            duration: '',
            rest: '60s',
            notes: '',
            supersetGroup: ''
        };

        setWeeklyPlan(prev => ({
            ...prev,
            [targetDay]: [...prev[targetDay], newEx]
        }));
        setActiveMobileAddMenu(null);
        toast.success(`Added ${newEx.name} to ${targetDay}`, { duration: 1500 });
    };

    const deleteExercise = (dayName: string, index: number) => {
        setWeeklyPlan(prev => {
            const list = [...prev[dayName]];
            list.splice(index, 1);
            return {
                ...prev,
                [dayName]: list
            };
        });
    };

    const moveExerciseIndex = (dayName: string, index: number, direction: 'up' | 'down') => {
        const list = [...weeklyPlan[dayName]];
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === list.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = list[index];
        list[index] = list[targetIndex];
        list[targetIndex] = temp;

        setWeeklyPlan(prev => ({
            ...prev,
            [dayName]: list
        }));
    };

    const updateExerciseParam = (dayName: string, index: number, field: keyof PlannerExercise, value: any) => {
        setWeeklyPlan(prev => {
            const list = [...prev[dayName]];
            list[index] = {
                ...list[index],
                [field]: value
            };
            return {
                ...prev,
                [dayName]: list
            };
        });
    };

    const clearAllDays = () => {
        if (confirm('Are you sure you want to clear the entire builder plan?')) {
            setWeeklyPlan({
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: [],
            });
            toast.info('Builder plan cleared.');
        }
    };

    // --- Save & Assign Workflow ---
    const handleSaveAndAssign = () => {
        // Validation
        const totalExercises = Object.values(weeklyPlan).reduce((acc, curr) => acc + curr.length, 0);
        if (totalExercises === 0) {
            toast.error('Please add at least one exercise to the plan before assigning.');
            return;
        }

        // Flatten the weekly schedule into the Flat Exercise Context shape (as a fallback)
        const flatExercises = [];
        let indexCounter = 1;
        for (const day of DAYS) {
            for (const ex of weeklyPlan[day]) {
                // Prepend Day name to notes for standard list display
                const dayPrefix = `[${day}]`;
                const groupSuffix = ex.supersetGroup ? ` (Superset ${ex.supersetGroup})` : '';
                const weightDetails = ex.weight ? ` Weight: ${ex.weight}.` : '';
                const durationDetails = ex.duration ? ` Duration: ${ex.duration}.` : '';
                const userNotes = ex.notes ? ` Notes: ${ex.notes}` : '';
                
                flatExercises.push({
                    id: String(indexCounter++),
                    name: ex.name,
                    target: ex.target,
                    sets: Number(ex.sets) || 4,
                    reps: String(ex.reps),
                    rest: String(ex.rest),
                    notes: `${dayPrefix}${groupSuffix}${weightDetails}${durationDetails}${userNotes}`
                });
            }
        }

        // 1. Assign to the standard member workout context
        assignWorkoutPlan({
            name: planTitle,
            focus: planFocus,
            duration: planDuration,
            intensity: planIntensity,
            exercises: flatExercises
        });

        // 2. Save the complete structured weekly plan (including weight, duration, superset groupings)
        const completeWeeklyStructure = {
            name: planTitle,
            focus: planFocus,
            duration: planDuration,
            intensity: planIntensity,
            client: selectedClient,
            weeklyPlan: weeklyPlan,
            timestamp: Date.now()
        };
        localStorage.setItem('zenith_workout_plan_weekly', JSON.stringify(completeWeeklyStructure));

        // 3. Clear draft and notify success
        localStorage.removeItem('zenith_builder_draft_plan');
        
        toast.success(`Assigned "${planTitle}" to ${selectedClient}!`, {
            description: "Weekly schedule synchronized to the Member Plans tab.",
            className: "bg-slate-900 border-blue-500/50 text-white",
        });

        // Redirect back
        router.push('/trainer/workout-plans');
    };

    // Filter exercises from library
    const filteredLibrary = EXERCISE_LIBRARY.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              ex.target.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Helper to get superset capsule styles
    const getSupersetStyles = (group: string) => {
        switch (group) {
            case 'A': return 'border-cyan-500/40 bg-cyan-950/10 shadow-[0_0_10px_rgba(6,182,212,0.05)]';
            case 'B': return 'border-blue-500/40 bg-blue-950/10 shadow-[0_0_10px_rgba(59,130,246,0.05)]';
            case 'C': return 'border-sky-500/40 bg-sky-950/10 shadow-[0_0_10px_rgba(14,165,233,0.05)]';
            default: return 'border-slate-800/80 bg-slate-900/30';
        }
    };

    const getSupersetBadge = (group: string) => {
        switch (group) {
            case 'A': return <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] uppercase font-bold tracking-wider">Superset A</Badge>;
            case 'B': return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] uppercase font-bold tracking-wider">Superset B</Badge>;
            case 'C': return <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px] uppercase font-bold tracking-wider">Circuit C</Badge>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Action Header */}
                <div className="flex flex-col gap-3">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer/workout-plans">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Programs
                        </Link>
                    </Button>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-900 pb-5">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent italic uppercase">
                                Workout <span className="not-italic text-slate-100">Builder</span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                Interactive visual plan designer •
                                <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${autosaveStatus.includes('Saved at') ? 'text-emerald-400' : 'text-slate-400 animate-pulse'}`}>
                                    <RefreshCw className={`w-3 h-3 ${autosaveStatus === 'Saving...' ? 'animate-spin' : ''}`} />
                                    {autosaveStatus}
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button 
                                onClick={clearAllDays} 
                                variant="outline" 
                                className="border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/20 hover:text-rose-300 text-rose-400 rounded-xl px-4 text-xs font-semibold uppercase tracking-wider h-11"
                            >
                                Clear Draft
                            </Button>
                            <Button 
                                onClick={handleSaveAndAssign} 
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-900/30 rounded-xl px-6 text-sm font-bold uppercase tracking-wider h-11"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save & Assign Plan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Plan Metadata Form Card */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-900 p-5 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-1.5 col-span-1 lg:col-span-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Program Title</label>
                            <Input
                                value={planTitle}
                                onChange={(e) => setPlanTitle(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                placeholder="e.g. Shred & Tone 90-Day"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Primary Focus</label>
                            <Input
                                value={planFocus}
                                onChange={(e) => setPlanFocus(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                placeholder="e.g. Hypertrophy"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Duration</label>
                            <Input
                                value={planDuration}
                                onChange={(e) => setPlanDuration(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                placeholder="e.g. 12 Weeks"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Client Assignee</label>
                            <select 
                                value={selectedClient} 
                                onChange={(e) => setSelectedClient(e.target.value)}
                                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="member@flexgym.com">Alex Thompson (member@flexgym.com)</option>
                                <option value="jessica.miller@example.com">Jessica Miller</option>
                                <option value="david.garcia@example.com">David Garcia</option>
                                <option value="lisa.anderson@example.com">Lisa Anderson</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Workspace Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT PANEL: EXERCISE LIBRARY (Col Span 3) */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-900 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)] sticky top-6">
                            <div>
                                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5 text-blue-400" />
                                    Exercise Library
                                </h3>
                                
                                {/* Library Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        placeholder="Search exercises..."
                                        className="pl-9 h-9 bg-slate-950 border-slate-800 text-slate-200 text-sm placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Category Badges Slider */}
                                <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-slate-800 scrollbar-none">
                                    {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Exercises List */}
                            <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2.5">
                                {filteredLibrary.length === 0 ? (
                                    <div className="text-center text-xs text-slate-500 py-8">
                                        No exercises found.
                                    </div>
                                ) : (
                                    filteredLibrary.map((ex) => (
                                        <div
                                            key={ex.id}
                                            draggable
                                            onDragStart={(e) => handleDragStartFromLibrary(e, ex)}
                                            className="p-3 bg-slate-950 border border-slate-900 hover:border-blue-500/30 rounded-xl cursor-grab active:cursor-grabbing hover:bg-slate-900/60 transition-all duration-200 group relative flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-1">
                                                    <h4 className="font-semibold text-xs text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">{ex.name}</h4>
                                                    <Badge className="bg-slate-900 text-slate-400 border-slate-800 text-[8px] font-normal leading-none px-1.5 py-0.5">
                                                        {ex.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-medium">{ex.target}</p>
                                            </div>

                                            {/* Mobile / Click Fallback Add Action */}
                                            <div className="mt-2.5 pt-2 border-t border-slate-900/80 flex justify-between items-center">
                                                <span className="text-[9px] text-slate-600 italic font-mono select-none">Drag or add</span>
                                                <div className="relative">
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => setActiveMobileAddMenu(activeMobileAddMenu === ex.id ? null : ex.id)}
                                                        className="w-6 h-6 rounded-md hover:bg-blue-500/20 text-blue-400 hover:text-white border border-slate-800"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* Dropdown days list */}
                                                    {activeMobileAddMenu === ex.id && (
                                                        <div className="absolute right-0 bottom-7 bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-xl w-32 z-50 divide-y divide-slate-800/50">
                                                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider text-center py-1">Add to:</div>
                                                            {DAYS.map((day) => (
                                                                <button
                                                                    key={day}
                                                                    onClick={() => addFromLibraryToDay(ex, day)}
                                                                    className="w-full text-left px-2 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-slate-850 rounded-md transition-colors"
                                                                >
                                                                    {day}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT PANEL: PLANNER GRID (Col Span 9) */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Legend Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/30 border border-slate-900/80 rounded-2xl text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-blue-400" />
                                <strong>Instructions:</strong> Drag exercises from the library and drop them onto any day box. Drag cards within days to reorder.
                            </span>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Superset A
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Superset B
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-sky-500" /> Circuit C
                                </span>
                            </div>
                        </div>

                        {/* Calendar Columns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {DAYS.map((day) => {
                                const exercises = weeklyPlan[day] || [];
                                return (
                                    <Card 
                                        key={day} 
                                        className={`bg-slate-900/35 border-2 transition-all duration-200 flex flex-col min-h-[400px] overflow-hidden ${dragOverDay === day ? 'border-blue-500 bg-blue-500/5' : 'border-slate-900 hover:border-slate-800'}`}
                                        onDragOver={(e) => handleDragOverDay(e, day)}
                                        onDragLeave={() => setDragOverDay(null)}
                                        onDrop={(e) => handleDropOnDay(e, day)}
                                    >
                                        <CardHeader className="bg-slate-950/60 p-4 border-b border-slate-900 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                <span className="font-bold text-sm tracking-wide text-white">{day}</span>
                                            </div>
                                            <Badge className="bg-slate-900 border-slate-800 text-slate-300 font-mono text-[10px]">
                                                {exercises.length} {exercises.length === 1 ? 'ex' : 'exs'}
                                            </Badge>
                                        </CardHeader>
                                        
                                        <CardContent className="p-3 flex-1 flex flex-col gap-3">
                                            {exercises.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-900 rounded-xl p-6 text-center select-none py-16">
                                                    <Plus className="w-5 h-5 mb-2 opacity-30 text-blue-500" />
                                                    <p className="text-[10px] uppercase tracking-wider font-bold">Drop Exercises Here</p>
                                                    <p className="text-[9px] text-slate-700 mt-0.5">Or use the library + button</p>
                                                </div>
                                            ) : (
                                                exercises.map((ex, index) => {
                                                    const cardId = `${day}-${ex.id}-${index}`;
                                                    return (
                                                        <div
                                                            key={ex.id}
                                                            draggable
                                                            onDragStart={(e) => handleDragStartFromPlanner(e, day, index)}
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                if (dragOverCardId !== cardId) {
                                                                    setDragOverCardId(cardId);
                                                                }
                                                            }}
                                                            onDragLeave={() => setDragOverCardId(null)}
                                                            onDrop={(e) => handleDropOnCard(e, day, index)}
                                                            className={`p-3.5 border rounded-xl flex flex-col gap-3 transition-all duration-200 cursor-grab active:cursor-grabbing relative group ${getSupersetStyles(ex.supersetGroup)} ${dragOverCardId === cardId ? 'border-t-4 border-t-blue-500 bg-blue-500/5' : ''}`}
                                                        >
                                                            {/* Exercise Header */}
                                                            <div className="flex justify-between items-start gap-1.5">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                                        <span className="text-slate-500 font-mono text-[10px]">{index + 1}.</span>
                                                                        <h4 className="font-bold text-xs text-white leading-tight truncate">{ex.name}</h4>
                                                                        {getSupersetBadge(ex.supersetGroup)}
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-500 font-medium truncate">{ex.target}</p>
                                                                </div>

                                                                {/* Reordering & Action buttons */}
                                                                <div className="flex items-center gap-1 self-start shrink-0">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => moveExerciseIndex(day, index, 'up')}
                                                                        disabled={index === 0}
                                                                        className="w-5 h-5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-md disabled:opacity-20"
                                                                    >
                                                                        <ArrowUp className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => moveExerciseIndex(day, index, 'down')}
                                                                        disabled={index === exercises.length - 1}
                                                                        className="w-5 h-5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-md disabled:opacity-20"
                                                                    >
                                                                        <ArrowDown className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => deleteExercise(day, index)}
                                                                        className="w-5 h-5 hover:bg-rose-900/30 text-slate-500 hover:text-rose-400 rounded-md"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Exercise Parameters Inputs */}
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Sets</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={ex.sets}
                                                                        onChange={(e) => updateExerciseParam(day, index, 'sets', Number(e.target.value))}
                                                                        className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200 text-center font-mono focus-visible:ring-blue-500 rounded-lg p-0"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Reps</label>
                                                                    <Input
                                                                        value={ex.reps}
                                                                        onChange={(e) => updateExerciseParam(day, index, 'reps', e.target.value)}
                                                                        className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200 text-center font-mono focus-visible:ring-blue-500 rounded-lg px-1 py-0"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Weight</label>
                                                                    <Input
                                                                        value={ex.weight}
                                                                        onChange={(e) => updateExerciseParam(day, index, 'weight', e.target.value)}
                                                                        className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200 text-center font-mono focus-visible:ring-blue-500 rounded-lg px-1 py-0"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                                                        <Clock className="w-2.5 h-2.5" /> Duration
                                                                    </label>
                                                                    <Input
                                                                        value={ex.duration}
                                                                        onChange={(e) => updateExerciseParam(day, index, 'duration', e.target.value)}
                                                                        className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200 text-center font-mono focus-visible:ring-blue-500 rounded-lg px-1 py-0"
                                                                        placeholder="e.g. 30s"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                                                        <Layers className="w-2.5 h-2.5" /> Rest Time
                                                                    </label>
                                                                    <Input
                                                                        value={ex.rest}
                                                                        onChange={(e) => updateExerciseParam(day, index, 'rest', e.target.value)}
                                                                        className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200 text-center font-mono focus-visible:ring-blue-500 rounded-lg px-1 py-0"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Superset Group Select & Note */}
                                                            <div className="space-y-2 pt-1.5 border-t border-slate-900">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <label className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Superset/Circuit Group</label>
                                                                    <select
                                                                        value={ex.supersetGroup}
                                                                        onChange={(e) => updateExerciseParam(day, index, 'supersetGroup', e.target.value)}
                                                                        className="h-6 px-1.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    >
                                                                        <option value="">None</option>
                                                                        <option value="A">Group A</option>
                                                                        <option value="B">Group B</option>
                                                                        <option value="C">Group C</option>
                                                                    </select>
                                                                </div>
                                                                
                                                                <Input
                                                                    value={ex.notes}
                                                                    onChange={(e) => updateExerciseParam(day, index, 'notes', e.target.value)}
                                                                    placeholder="Instructions / Coaching notes..."
                                                                    className="h-7 text-[10px] bg-slate-950 border-slate-800 text-slate-300 placeholder:text-slate-600 focus-visible:ring-blue-500 rounded-lg px-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
