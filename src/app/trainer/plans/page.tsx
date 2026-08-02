'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlan, WorkoutPlan, DietPlan } from '@/context/PlanContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    Filter,
    PlusCircle,
    Dumbbell,
    Activity,
    Timer,
    Repeat,
    MoreVertical,
    Target,
    Users,
    Flame,
    Utensils,
    Clock,
    Star,
    LayoutGrid,
    List,
    ChevronDown,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA — Workout Plans
   ═══════════════════════════════════════════════════════════════════════════ */

const workoutPlans = [
    {
        id: 1,
        title: 'Shred & Tone 90-Day',
        target: 'Full Body',
        level: 'Intermediate',
        duration: '12 Weeks',
        sessionsPerWeek: 4,
        assignedClients: 8,
        tags: ['Hypertrophy', 'Fat Loss'],
        description: 'A comprehensive full-body program designed for effective fat loss while maintaining muscle mass.',
        exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8-10', rest: '90s' },
            { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '60s' },
            { name: 'Bent Over Rows', sets: 3, reps: '10-12', rest: '60s' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '12-15', rest: '60s' }
        ]
    },
    {
        id: 2,
        title: 'Powerbuilding V2',
        target: 'Push/Pull/Legs',
        level: 'Advanced',
        duration: '8 Weeks',
        sessionsPerWeek: 5,
        assignedClients: 3,
        tags: ['Strength', 'Powerlifting'],
        description: 'Advanced PPL split focusing on heavy compound lifts combined with targeted accessory work.',
        exercises: [
            { name: 'Deadlift', sets: 5, reps: '3-5', rest: '180s' },
            { name: 'Overhead Press', sets: 4, reps: '5-8', rest: '120s' },
            { name: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: '90s' },
            { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s' }
        ]
    },
    {
        id: 3,
        title: 'Beginner Foundations',
        target: 'Upper/Lower',
        level: 'Beginner',
        duration: '4 Weeks',
        sessionsPerWeek: 3,
        assignedClients: 12,
        tags: ['Foundational', 'Machines'],
        description: 'Perfect starting point for new clients. Focuses on machine work to build a base level of strength and form.',
        exercises: [
            { name: 'Leg Press', sets: 3, reps: '12-15', rest: '60s' },
            { name: 'Lat Pulldown', sets: 3, reps: '12-15', rest: '60s' },
            { name: 'Chest Press Machine', sets: 3, reps: '12-15', rest: '60s' },
            { name: 'Seated Cable Row', sets: 3, reps: '12', rest: '60s' }
        ]
    }
];

const workoutRecentActivity = [
    { id: 1, client: 'Alex Thompson', action: 'completed Day 4 of Shred & Tone', time: '2 hours ago', avatar: 'AT' },
    { id: 2, client: 'Jessica Miller', action: 'set a new PR on Deadlift (225lbs)', time: '4 hours ago', avatar: 'JM' },
    { id: 3, client: 'David Garcia', action: 'skipped Workout A', time: 'Yesterday', avatar: 'DG' }
];

/* ═══════════════════════════════════════════════════════════════════════════
   DATA — Diet Plans
   ═══════════════════════════════════════════════════════════════════════════ */

const dietPlans = [
    {
        id: 1,
        title: 'Shred & Tone (Keto)',
        target: 'Weight Loss',
        calories: 1800,
        macros: { p: 150, c: 30, f: 120 },
        assignedCount: 8,
        tags: ['Keto', 'Low Carb', 'High Fat'],
        rating: 4.8,
        duration: '4 Weeks'
    },
    {
        id: 2,
        title: 'Muscle Builder Pro',
        target: 'Hypertrophy',
        calories: 3200,
        macros: { p: 200, c: 400, f: 90 },
        assignedCount: 15,
        tags: ['High Carb', 'High Protein'],
        rating: 4.9,
        duration: '12 Weeks'
    },
    {
        id: 3,
        title: 'Plant-Based Power',
        target: 'Maintenance',
        calories: 2400,
        macros: { p: 130, c: 300, f: 75 },
        assignedCount: 5,
        tags: ['Vegan', 'Balanced'],
        rating: 4.7,
        duration: '8 Weeks'
    },
    {
        id: 4,
        title: 'Lean Bulk Fundamentals',
        target: 'Muscle Gain',
        calories: 2800,
        macros: { p: 180, c: 350, f: 80 },
        assignedCount: 12,
        tags: ['Balanced', 'High Protein'],
        rating: 4.6,
        duration: '10 Weeks'
    }
];

const dietRecentActivity = [
    { id: 1, client: 'Alex Thompson', action: 'completed Day 4 of', plan: 'Shred & Tone', time: '2h ago', avatar: 'AT' },
    { id: 2, client: 'Sarah Johnson', action: 'started the', plan: 'Plant-Based Power', time: '5h ago', avatar: 'SJ' },
    { id: 3, client: 'Michael Chen', action: 'logged meals for', plan: 'Muscle Builder Pro', time: '1d ago', avatar: 'MC' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const getDifficultyStyle = (level: string) => {
    switch (level) {
        case 'Beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'Intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function WorkoutDietPlansPage() {
    const { assignWorkoutPlan, assignDietPlan } = usePlan();
    const [workoutSearch, setWorkoutSearch] = useState('');
    const [dietSearch, setDietSearch] = useState('');

    /* ── Assign Handlers ───────────────────────────────────── */

    const handleAssignWorkout = (plan: typeof workoutPlans[0]) => {
        const formattedPlan: WorkoutPlan = {
            name: plan.title,
            focus: plan.target,
            duration: plan.duration,
            intensity: plan.level === 'Advanced' ? 'High' : (plan.level === 'Intermediate' ? 'Moderate' : 'Low'),
            exercises: plan.exercises.map((ex, idx) => ({
                id: String(idx + 1),
                name: ex.name,
                target: plan.target,
                sets: ex.sets,
                reps: ex.reps,
                rest: ex.rest,
                notes: 'Focus on perfect form and control.'
            }))
        };
        assignWorkoutPlan(formattedPlan);
        toast.success(`Successfully assigned "${plan.title}" to client dashboard`, {
            description: "Member's 'My Workouts' section has been updated.",
            className: "bg-slate-900 border-blue-500/50 text-white",
        });
    };

    const handleAssignDiet = (plan: typeof dietPlans[0]) => {
        const formattedPlan: DietPlan = {
            name: plan.title,
            goal: plan.target,
            dailyCalories: plan.calories,
            macros: {
                protein: { target: plan.macros.p, current: Math.floor(plan.macros.p * 0.7), label: 'Protein (g)', color: 'bg-emerald-500' },
                carbs: { target: plan.macros.c, current: Math.floor(plan.macros.c * 0.7), label: 'Carbs (g)', color: 'bg-indigo-500' },
                fats: { target: plan.macros.f, current: Math.floor(plan.macros.f * 0.7), label: 'Fats (g)', color: 'bg-rose-500' }
            },
            meals: [
                { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Standard Morning Fuel', foods: ['High protein oats', '3 Egg whites'], calories: Math.floor(plan.calories * 0.2) },
                { id: '2', type: 'Lunch', time: '01:00 PM', name: 'Balanced Meal Box', foods: ['Grilled protein', 'Complex carbs', 'Steamed veg'], calories: Math.floor(plan.calories * 0.35) },
                { id: '3', type: 'Pre-Workout', time: '04:30 PM', name: 'Energy Boost', foods: ['Fruit', 'Shake'], calories: Math.floor(plan.calories * 0.15) },
                { id: '4', type: 'Dinner', time: '08:00 PM', name: 'Recovery Meal', foods: ['Lean protein', 'Fiber rich veggies'], calories: Math.floor(plan.calories * 0.3) }
            ]
        };
        assignDietPlan(formattedPlan);
        toast.success(`Successfully assigned "${plan.title}" to client dashboard`, {
            description: "Member's nutritional dashboard has been updated.",
            className: "bg-slate-900 border-emerald-500/50 text-white",
        });
    };

    /* ── Filtered Data ─────────────────────────────────────── */

    const filteredWorkouts = workoutPlans.filter(p =>
        p.title.toLowerCase().includes(workoutSearch.toLowerCase()) ||
        p.target.toLowerCase().includes(workoutSearch.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(workoutSearch.toLowerCase()))
    );

    const filteredDiets = dietPlans.filter(p =>
        p.title.toLowerCase().includes(dietSearch.toLowerCase()) ||
        p.target.toLowerCase().includes(dietSearch.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(dietSearch.toLowerCase()))
    );

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════════ */

    return (
        <div className="space-y-8">
            {/* ── Page Header ──────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent pb-1">
                        Workout & Diet Plans
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Design, manage, and assign training & nutrition programs to your clients.
                    </p>
                </div>
            </header>

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <Tabs defaultValue="workouts" className="w-full">
                <TabsList className="bg-slate-900/60 border border-slate-800/80 p-1 rounded-2xl h-auto gap-1 w-full sm:w-auto">
                    <TabsTrigger
                        value="workouts"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/30 rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all"
                    >
                        <Dumbbell className="w-4 h-4 mr-2" />
                        💪 Workout Plans
                    </TabsTrigger>
                    <TabsTrigger
                        value="diets"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-900/30 rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all"
                    >
                        <Utensils className="w-4 h-4 mr-2" />
                        🥗 Diet Plans
                    </TabsTrigger>
                </TabsList>

                {/* ══════════════════════════════════════════════════════
                   TAB 1 — WORKOUT PLANS
                   ══════════════════════════════════════════════════════ */}
                <TabsContent value="workouts" className="mt-6">
                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    placeholder="Search programs by name or target..."
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                    value={workoutSearch}
                                    onChange={(e) => setWorkoutSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 px-6 bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                                <Filter className="w-5 h-5 mr-2" />
                                Filters
                            </Button>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-900/20 px-6 h-12 rounded-xl text-base font-medium shrink-0" asChild>
                            <Link href="/trainer/plans/builder">
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Create Program
                            </Link>
                        </Button>
                    </div>

                    {/* Grid + Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Program Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            {filteredWorkouts.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No workout programs match your search.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {filteredWorkouts.map((plan) => (
                                        <Card key={plan.id} className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-blue-500/30 transition-all duration-300 group overflow-hidden">
                                            <CardHeader className="pb-4 relative border-b border-slate-800/50 bg-slate-950/30">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                                            <Dumbbell className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {plan.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-sm mt-0.5 text-slate-400">
                                                                {plan.description}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <Badge variant="outline" className={`font-medium px-2 py-0.5 ${getDifficultyStyle(plan.level)}`}>
                                                            {plan.level}
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-2 py-0.5">
                                                            <Target className="w-3.5 h-3.5 mr-1 text-slate-400" /> {plan.target}
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-2 py-0.5">
                                                            <Timer className="w-3.5 h-3.5 mr-1 text-slate-400" /> {plan.duration}
                                                        </Badge>
                                                        {plan.tags.map(tag => (
                                                            <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-400 hover:bg-slate-700 px-2 py-0.5">
                                                                #{tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Accordion type="single" collapsible className="w-full">
                                                    <AccordionItem value="exercises" className="border-b-0">
                                                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-800/30 hover:no-underline text-slate-300">
                                                            <div className="flex items-center gap-2">
                                                                <Activity className="w-4 h-4 text-blue-400" />
                                                                <span className="font-medium">View Day 1 Workout Preview</span>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-6 pb-4 pt-2">
                                                            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                                {plan.exercises.map((exercise, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 last:pb-0">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-slate-500 font-mono text-xs">{idx + 1}.</span>
                                                                            <span className="font-medium text-slate-200">{exercise.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
                                                                            <span className="flex items-center"><Repeat className="w-3.5 h-3.5 mr-1.5 text-slate-500" />{exercise.sets} × {exercise.reps}</span>
                                                                            <span className="flex items-center"><Timer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />{exercise.rest}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </CardContent>
                                            <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center bg-slate-900/20">
                                                <div className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                                                    <Users className="w-4 h-4 text-slate-500" />
                                                    <span>Assigned to <strong className="text-slate-200">{plan.assignedClients}</strong> clients</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        onClick={() => handleAssignWorkout(plan)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 h-9 rounded-lg text-xs font-semibold uppercase tracking-wider"
                                                    >
                                                        Assign to Member
                                                    </Button>
                                                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-9 px-4 text-xs font-semibold uppercase tracking-wider">
                                                        Edit Program
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Widgets */}
                        <div className="space-y-6">
                            {/* Quick Stats Widget */}
                            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 rounded-2xl">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-400" /> Program Metrics
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <span className="text-slate-400">Total Active Programs</span>
                                        <span className="text-xl font-bold text-white">12</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <span className="text-slate-400">Total Clients Assigned</span>
                                        <span className="text-xl font-bold text-white">45</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <span className="text-slate-400">Most Popular Filter</span>
                                        <span className="text-sm font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-md">Hypertrophy</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Recent Client Activity */}
                            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-0 rounded-2xl overflow-hidden">
                                <div className="p-6 pb-4 border-b border-slate-800/50">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Flame className="w-5 h-5 text-orange-400" /> Recent Log Activity
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-800/50">
                                    {workoutRecentActivity.map((activity) => (
                                        <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
                                            <Avatar className="h-10 w-10 border border-slate-700">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.client.replace(' ', '')}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                <AvatarFallback className="bg-slate-800 text-xs">{activity.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1 content-start">
                                                <p className="text-sm text-slate-300 leading-tight">
                                                    <span className="font-semibold text-white">{activity.client}</span> {activity.action}
                                                </p>
                                                <p className="text-xs text-slate-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                                    <Button variant="link" className="text-blue-400 hover:text-blue-300 w-full p-0 h-auto font-medium">
                                        View All Activity
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ══════════════════════════════════════════════════════
                   TAB 2 — DIET PLANS
                   ══════════════════════════════════════════════════════ */}
                <TabsContent value="diets" className="mt-6">
                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    placeholder="Search diet plans by name, tags, or target..."
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                                    value={dietSearch}
                                    onChange={(e) => setDietSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 px-6 bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                                <Filter className="w-5 h-5 mr-2" />
                                Filters
                            </Button>
                        </div>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-900/20 px-6 h-12 rounded-xl text-base font-medium shrink-0">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Create Diet Plan
                        </Button>
                    </div>

                    {/* Grid + Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Diet Plan Cards */}
                        <div className="lg:col-span-3 space-y-6">
                            {filteredDiets.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No diet plans match your search.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                    {filteredDiets.map((plan) => (
                                        <Card key={plan.id} className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                                            <CardHeader className="pb-4 relative">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
                                                        {plan.target}
                                                    </Badge>
                                                    <div className="flex items-center text-amber-400 text-xs font-medium bg-slate-800/50 px-2 py-0.5 rounded-full">
                                                        <Star className="w-3 h-3 mr-1 fill-amber-400" />
                                                        {plan.rating}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                    {plan.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-3 text-slate-400 mt-2">
                                                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-slate-500" /> {plan.duration}</span>
                                                    <span className="flex items-center"><Utensils className="w-4 h-4 mr-1 text-slate-500" /> {plan.assignedCount} Active</span>
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow pb-2">
                                                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 text-sm font-medium flex items-center">
                                                            <Flame className="w-4 h-4 mr-1.5 text-rose-500" />
                                                            Daily Target
                                                        </span>
                                                        <span className="font-bold text-white">{plan.calories} <span className="text-slate-500 font-normal text-sm">kcal</span></span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                                                        <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                            <span className="text-emerald-400 font-bold">{plan.macros.p}g</span>
                                                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Protein</span>
                                                        </div>
                                                        <div className="flex flex-col items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                                            <span className="text-blue-400 font-bold">{plan.macros.c}g</span>
                                                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Carbs</span>
                                                        </div>
                                                        <div className="flex flex-col items-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                                            <span className="text-amber-400 font-bold">{plan.macros.f}g</span>
                                                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Fats</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {plan.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="bg-slate-800/80 text-slate-300 font-normal hover:bg-slate-700">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-4 border-t border-slate-800/50 flex flex-col gap-3">
                                                <Button
                                                    onClick={() => handleAssignDiet(plan)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-wider h-10 rounded-xl"
                                                >
                                                    Assign to Member
                                                </Button>
                                                <Button variant="ghost" className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all font-medium rounded-xl h-10">
                                                    View Details
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sidebar */}
                        <div className="space-y-6">
                            {/* Meal Library */}
                            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white">Meal Library</CardTitle>
                                    <CardDescription>Manage individual recipes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start h-12 bg-slate-950/50 border-slate-800 text-slate-300 hover:text-white group">
                                        <Utensils className="w-5 h-5 mr-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                        Browse Recipes
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-12 bg-slate-950/50 border-slate-800 text-slate-300 hover:text-white group">
                                        <PlusCircle className="w-5 h-5 mr-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                                        Add Custom Food
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white">Client Activity</CardTitle>
                                    <CardDescription>Diet-related updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {dietRecentActivity.map((activity) => (
                                            <div key={activity.id} className="flex gap-3 relative">
                                                <div className="absolute left-4 top-10 bottom-[-16px] w-px bg-slate-800 last-of-type:hidden"></div>
                                                <Avatar className="h-8 w-8 border border-slate-700 relative z-10 bg-slate-950">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.client}&backgroundColor=0f172a&textColor=cbd5e1`} />
                                                    <AvatarFallback className="bg-slate-800 text-xs">{activity.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm leading-snug">
                                                        <span className="font-medium text-slate-200">{activity.client}</span>{' '}
                                                        <span className="text-slate-400">{activity.action}</span>{' '}
                                                        <span className="font-medium text-emerald-400">{activity.plan}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
