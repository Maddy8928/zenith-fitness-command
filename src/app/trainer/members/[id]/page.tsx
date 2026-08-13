'use client';

import { use } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlan, WorkoutPlan, DietPlan, DayPlan, Meal } from '@/context/PlanContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    ChevronLeft, Mail, Phone, Activity, Calendar, Target, Dumbbell, Flame, Utensils, Clock, 
    MoreVertical, Zap, Repeat, Timer, Users, Star, PlusCircle, Check, Trash2, Trophy
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

/* --- MOCK DATA --- */
const defaultMembers = [
    {
        id: 1, name: 'Alex Thompson', email: 'alex.t@example.com', phone: '+1 (555) 123-4567',
        status: 'Active', goal: 'Weight Loss', progress: 75, workoutPlan: 'HIIT Fundamentals', dietPlan: 'Shred & Tone (Keto)',
        lastCheckIn: '2 days ago', joinDate: 'Jan 15, 2026', avatar: 'AT',
        stats: { weight: '185 lbs', height: '5\'10"', bodyFat: '18%' }
    },
    {
        id: 2, name: 'Jessica Miller', email: 'j.miller@example.com', phone: '+1 (555) 987-6543',
        status: 'Active', goal: 'Muscle Gain', progress: 40, workoutPlan: 'Powerbuilding V2', dietPlan: 'Muscle Builder Pro',
        lastCheckIn: 'Today', joinDate: 'Feb 02, 2026', avatar: 'JM',
        stats: { weight: '140 lbs', height: '5\'6"', bodyFat: '22%' }
    },
    {
        id: 3, name: 'David Garcia', email: 'david.g88@example.com', phone: '+1 (555) 456-7890',
        status: 'New', goal: 'Endurance', progress: 0, workoutPlan: '', dietPlan: '',
        lastCheckIn: 'Never', joinDate: 'Feb 28, 2026', avatar: 'DG',
        stats: { weight: '160 lbs', height: '5\'9"', bodyFat: '15%' }
    },
    {
        id: 4, name: 'Lisa Anderson', email: 'lisa.anderson@example.com', phone: '+1 (555) 222-3333',
        status: 'Active', goal: 'Flexibility & Core', progress: 90, workoutPlan: 'Yoga & Pilates Mix', dietPlan: 'Plant-Based Power',
        lastCheckIn: 'Yesterday', joinDate: 'Nov 10, 2025', avatar: 'LA',
        stats: { weight: '130 lbs', height: '5\'5"', bodyFat: '20%' }
    },
    {
        id: 5, name: 'Robert Chen', email: 'r.chen@example.com', phone: '+1 (555) 888-9999',
        status: 'Inactive', goal: 'General Fitness', progress: 15, workoutPlan: 'Beginner Full Body', dietPlan: 'Balanced Macros',
        lastCheckIn: '3 weeks ago', joinDate: 'Oct 05, 2025', avatar: 'RC',
        stats: { weight: '200 lbs', height: '6\'0"', bodyFat: '25%' }
    }
];

const presetWorkoutPlans = [
    {
        id: 'p1', title: 'Shred & Tone 90-Day', target: 'Full Body', level: 'Intermediate', duration: '12 Weeks',
        description: 'A comprehensive full-body program designed for effective fat loss while maintaining muscle mass.',
        exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8-10', rest: '90s' },
            { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '60s' },
            { name: 'Bent Over Rows', sets: 3, reps: '10-12', rest: '60s' }
        ]
    },
    {
        id: 'p2', title: 'Powerbuilding V2', target: 'Push/Pull/Legs', level: 'Advanced', duration: '8 Weeks',
        description: 'Advanced PPL split focusing on heavy compound lifts combined with targeted accessory work.',
        exercises: [
            { name: 'Deadlift', sets: 5, reps: '3-5', rest: '180s' },
            { name: 'Overhead Press', sets: 4, reps: '5-8', rest: '120s' },
            { name: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: '90s' }
        ]
    }
];

const presetDietPlans = [
    {
        id: 'd1', title: 'Shred & Tone (Keto)', target: 'Weight Loss', calories: 1800,
        macros: { p: 150, c: 30, f: 120 }, duration: '4 Weeks'
    },
    {
        id: 'd2', title: 'Muscle Builder Pro', target: 'Hypertrophy', calories: 3200,
        macros: { p: 200, c: 400, f: 90 }, duration: '12 Weeks'
    }
];

// --- Default HYROX Seed Programs ---
const DEFAULT_HYROX_PROGRAMS = [
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

export default function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { currentWorkoutPlan, assignWorkoutPlan, currentDietPlan, assignDietPlan } = usePlan();
    const [member, setMember] = useState<any>(null);

    const [workoutView, setWorkoutView] = useState<'current' | 'preset' | 'custom'>('current');
    const [dietView, setDietView] = useState<'current' | 'preset' | 'custom'>('current');

    // Custom Workout Form State
    const [customWorkout, setCustomWorkout] = useState({ name: '', focus: '', duration: '', intensity: 'Moderate' });
    const [customSchedule, setCustomSchedule] = useState<DayPlan[]>([
        { day: 'Monday', isRestDay: false, focus: '', exercises: [] },
        { day: 'Tuesday', isRestDay: false, focus: '', exercises: [] },
        { day: 'Wednesday', isRestDay: false, focus: '', exercises: [] },
        { day: 'Thursday', isRestDay: false, focus: '', exercises: [] },
        { day: 'Friday', isRestDay: false, focus: '', exercises: [] },
        { day: 'Saturday', isRestDay: true, focus: '', exercises: [] },
        { day: 'Sunday', isRestDay: true, focus: '', exercises: [] },
    ]);
    
    // Custom Diet Form State
    const [customDiet, setCustomDiet] = useState({ name: '', goal: '', calories: '' });
    const [customMacros, setCustomMacros] = useState({ p: '', c: '', f: '' });
    const [customMeals, setCustomMeals] = useState<any[]>([
        { id: '1', type: 'Breakfast', time: '08:00 AM', name: '', notes: '', foods: [{ name: '', quantity: '' }] }
    ]);

    // HYROX State
    const [hyroxPrograms, setHyroxPrograms] = useState<any[]>([]);
    const [hyroxAssignedProgramId, setHyroxAssignedProgramId] = useState<string | null>(null);
    const [hyroxPBs, setHyroxPBs] = useState<Record<string, string>>({});
    const [hyroxCompletedCount, setHyroxCompletedCount] = useState<number>(0);
    const [hyroxView, setHyroxView] = useState<'current' | 'assign'>('current');
    const [editingPRs, setEditingPRs] = useState(false);
    const [tempPRs, setTempPRs] = useState({ wallBalls: '', sledPush: '', rowSprint: '' });

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
            return;
        }
        
        let currentMembers = [...defaultMembers];
        try {
            const saved = localStorage.getItem('zenith_trainer_members');
            if (saved) {
                const parsed = JSON.parse(saved);
                currentMembers = [
                    ...parsed,
                    ...defaultMembers.filter(dm => !parsed.some((p: any) => p.email === dm.email))
                ];
            }
        } catch (e) {}

        // Find member
        const found = currentMembers.find(m => m.id.toString() === resolvedParams.id);
        let activeMember = found;
        if (found) {
            if (!found.stats) found.stats = { weight: 'N/A', height: 'N/A', bodyFat: 'N/A' };
            setMember(found);
        } else {
            // Fallback for demo
            activeMember = currentMembers[0];
            setMember(currentMembers[0]);
        }

        if(activeMember) {
            // Load HYROX Data
            const savedPrograms = localStorage.getItem('zenith_trainer_hyrox_programs');
            if (savedPrograms) {
                try { setHyroxPrograms(JSON.parse(savedPrograms)); } catch(e){}
            } else {
                setHyroxPrograms(DEFAULT_HYROX_PROGRAMS);
            }

            // Load assignments for this member email
            const savedAssignments = localStorage.getItem('zenith_trainer_hyrox_member_assignments');
            if (savedAssignments) {
                try { 
                    const assignments = JSON.parse(savedAssignments);
                    setHyroxAssignedProgramId(assignments[activeMember.email] || null);
                } catch(e){}
            }
            
            // For Demo purposes, if member is Alex Thompson (Alex J), map to his logged in data if we want.
            // But we will use the standalone data logic
            if (activeMember.email === 'alex.t@example.com' || activeMember.email === 'member@nexusgym.com') {
                const liveProgId = localStorage.getItem('zenith_hyrox_program_id');
                if(liveProgId) setHyroxAssignedProgramId(liveProgId);
                
                const liveCompleted = localStorage.getItem('zenith_hyrox_completed_workouts');
                if (liveCompleted) {
                    try {
                        const parsed = JSON.parse(liveCompleted);
                        setHyroxCompletedCount(Object.values(parsed).filter(Boolean).length);
                    } catch (e) {}
                }

                const livePBs = localStorage.getItem('zenith_hyrox_pbs');
                if (livePBs) {
                    try {
                        const pbs = JSON.parse(livePBs);
                        setHyroxPBs({
                            wallBalls: pbs['ch-1'] || '4:45',
                            sledPush: pbs['ch-2'] || '175 kg',
                            rowSprint: pbs['ch-3'] || '3:18'
                        });
                    } catch (e) {}
                } else {
                    setHyroxPBs({ wallBalls: '4:45', sledPush: '175 kg', rowSprint: '3:18' });
                }
            } else {
                // Mock PRs for others
                setHyroxPBs({ wallBalls: '5:10', sledPush: '160 kg', rowSprint: '3:32' });
                setHyroxCompletedCount(2);
            }
        }
    }, [isAuthenticated, user, router, isLoading, resolvedParams.id]);

    if (isLoading || !member) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    /* --- ASSIGN HANDLERS --- */
    const handleAssignPresetWorkout = (plan: any) => {
        const schedule: DayPlan[] = [
            { day: 'Monday', isRestDay: false, focus: plan.target, exercises: plan.exercises.map((ex: any, idx: number) => ({ id: String(idx + 1), name: ex.name, target: plan.target, sets: ex.sets, reps: ex.reps, rest: ex.rest, notes: '' })) },
            { day: 'Tuesday', isRestDay: false, focus: '', exercises: [] },
            { day: 'Wednesday', isRestDay: true, focus: '', exercises: [] },
            { day: 'Thursday', isRestDay: false, focus: '', exercises: [] },
            { day: 'Friday', isRestDay: false, focus: '', exercises: [] },
            { day: 'Saturday', isRestDay: true, focus: '', exercises: [] },
            { day: 'Sunday', isRestDay: true, focus: '', exercises: [] },
        ];
        
        const formattedPlan: WorkoutPlan = {
            name: plan.title,
            focus: plan.target,
            duration: plan.duration,
            intensity: plan.level === 'Advanced' ? 'High' : (plan.level === 'Intermediate' ? 'Moderate' : 'Low'),
            schedule
        };
        assignWorkoutPlan(formattedPlan);
        toast.success(`Workout Plan Assigned`, { description: `${plan.title} assigned to ${member.name}.` });
        setWorkoutView('current');
    };

    const handleAssignCustomWorkout = () => {
        if(!customWorkout.name) return toast.error('Please enter a plan name');
        const formattedPlan: WorkoutPlan = {
            name: customWorkout.name,
            focus: customWorkout.focus || 'General',
            duration: customWorkout.duration || '4 Weeks',
            intensity: customWorkout.intensity,
            schedule: customSchedule.map(day => ({
                day: day.day,
                isRestDay: day.isRestDay,
                focus: day.focus,
                exercises: day.exercises.map((ex: any, idx: number) => ({
                    id: String(idx + 1), name: ex.name || 'Exercise', target: customWorkout.focus, 
                    sets: ex.sets || 3, reps: ex.reps || '10', rest: ex.rest || '60s', notes: ex.notes || ''
                }))
            }))
        };
        assignWorkoutPlan(formattedPlan);
        toast.success(`Custom Workout Assigned`, { description: `Assigned to ${member.name}.` });
        setWorkoutView('current');
    };

    const handleAssignPresetDiet = (plan: any) => {
        const formattedPlan: DietPlan = {
            name: plan.title, goal: plan.target, dailyCalories: plan.calories,
            macros: {
                protein: { target: plan.macros.p, current: 0, label: 'Protein (g)', color: 'bg-emerald-500' },
                carbs: { target: plan.macros.c, current: 0, label: 'Carbs (g)', color: 'bg-indigo-500' },
                fats: { target: plan.macros.f, current: 0, label: 'Fats (g)', color: 'bg-rose-500' }
            },
            meals: [
                { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Morning Fuel', foods: [{name: 'Oats', quantity: '1 bowl'}, {name: 'Eggs', quantity: '2'}], calories: 400 }
            ]
        };
        assignDietPlan(formattedPlan);
        toast.success(`Diet Plan Assigned`, { description: `${plan.title} assigned to ${member.name}.` });
        setDietView('current');
    };

    const handleAssignCustomDiet = () => {
        if(!customDiet.name) return toast.error('Please enter a plan name');
        const formattedPlan: DietPlan = {
            name: customDiet.name, goal: customDiet.goal || 'General', dailyCalories: parseInt(customDiet.calories) || 2000,
            macros: {
                protein: { target: parseInt(customMacros.p) || 150, current: 0, label: 'Protein (g)', color: 'bg-emerald-500' },
                carbs: { target: parseInt(customMacros.c) || 200, current: 0, label: 'Carbs (g)', color: 'bg-indigo-500' },
                fats: { target: parseInt(customMacros.f) || 60, current: 0, label: 'Fats (g)', color: 'bg-rose-500' }
            },
            meals: customMeals.map((meal, idx) => ({
                id: String(idx + 1),
                type: meal.type || 'Meal',
                time: meal.time || '12:00 PM',
                name: meal.name || `Meal ${idx + 1}`,
                notes: meal.notes || '',
                foods: meal.foods.filter((f: any) => f.name),
                calories: 0
            }))
        };
        assignDietPlan(formattedPlan);
        toast.success(`Custom Diet Assigned`, { description: `Assigned to ${member.name}.` });
        setDietView('current');
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer/members">
                            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Roster
                        </Link>
                    </Button>

                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <Avatar className="h-24 w-24 border-4 border-slate-800 bg-slate-950">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                    <AvatarFallback className="bg-slate-800 text-2xl">{member.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-white">{member.name}</h1>
                                        <Badge variant="outline" className={`${getStatusStyle(member.status)}`}>{member.status}</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {member.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {member.phone}</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {member.joinDate}</span>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-slate-900/60 border border-slate-800/80 p-1 rounded-2xl h-auto gap-1 w-full flex">
                        <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-xl py-3">Overview</TabsTrigger>
                        <TabsTrigger value="workout" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl py-3"><Dumbbell className="w-4 h-4 mr-2 hidden sm:inline" /> Workout Plan</TabsTrigger>
                        <TabsTrigger value="diet" className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl py-3"><Utensils className="w-4 h-4 mr-2 hidden sm:inline" /> Diet Plan</TabsTrigger>
                        <TabsTrigger value="hyrox" className="flex-1 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-xl py-3"><Trophy className="w-4 h-4 mr-2 hidden sm:inline" /> HYROX</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-slate-900/40 border-slate-800/60 col-span-2">
                                <CardHeader>
                                    <CardTitle>Goal Progress</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Target: <strong className="text-white">{member.goal}</strong></span>
                                        <span className="text-blue-400 font-bold">{member.progress}%</span>
                                    </div>
                                    <Progress value={member.progress} className="h-2 bg-slate-800 [&>div]:bg-blue-500" />
                                    <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-800">
                                        <div className="p-3 bg-slate-950/50 rounded-xl text-center">
                                            <p className="text-xs text-slate-500 mb-1">Weight</p>
                                            <p className="font-semibold text-white">{member.stats.weight}</p>
                                        </div>
                                        <div className="p-3 bg-slate-950/50 rounded-xl text-center">
                                            <p className="text-xs text-slate-500 mb-1">Height</p>
                                            <p className="font-semibold text-white">{member.stats.height}</p>
                                        </div>
                                        <div className="p-3 bg-slate-950/50 rounded-xl text-center">
                                            <p className="text-xs text-slate-500 mb-1">Body Fat</p>
                                            <p className="font-semibold text-white">{member.stats.bodyFat}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900/40 border-slate-800/60">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-3 text-sm">
                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                                            <div>
                                                <p className="text-slate-300">Completed <span className="font-medium text-white">Upper Body Day</span></p>
                                                <p className="text-xs text-slate-500">Yesterday, 10:00 AM</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div>
                                            <div>
                                                <p className="text-slate-300">Logged all meals</p>
                                                <p className="text-xs text-slate-500">Yesterday, 9:00 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* WORKOUT PLAN TAB */}
                    <TabsContent value="workout" className="mt-6">
                        <Card className="bg-slate-900/40 border-slate-800/60 min-h-[400px]">
                            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/60 pb-4 gap-4">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2 text-white">
                                        <Dumbbell className="w-5 h-5 text-blue-400" /> Workout Program
                                    </CardTitle>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant={workoutView === 'current' ? 'default' : 'outline'} size="sm" onClick={() => setWorkoutView('current')} className={workoutView === 'current' ? 'bg-blue-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}>
                                        Current Plan
                                    </Button>
                                    <Button variant={workoutView === 'preset' ? 'default' : 'outline'} size="sm" onClick={() => setWorkoutView('preset')} className={workoutView === 'preset' ? 'bg-blue-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}>
                                        Presets
                                    </Button>
                                    <Button variant={workoutView === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setWorkoutView('custom')} className={workoutView === 'custom' ? 'bg-blue-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}>
                                        Create Custom
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {workoutView === 'current' && (
                                    <div className="space-y-6">
                                        {currentWorkoutPlan ? (
                                            <div>
                                                <h3 className="text-2xl font-bold text-blue-400 mb-2">{currentWorkoutPlan.name}</h3>
                                                <div className="flex gap-2 mb-6">
                                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{currentWorkoutPlan.focus}</Badge>
                                                    <Badge className="bg-slate-800 text-slate-300">{currentWorkoutPlan.duration}</Badge>
                                                    <Badge className="bg-slate-800 text-slate-300">{currentWorkoutPlan.intensity} Intensity</Badge>
                                                </div>
                                                <div className="space-y-4">
                                                    {currentWorkoutPlan.schedule?.map((day: any, i: number) => (
                                                        <div key={i} className={`p-4 rounded-xl border ${day.isRestDay ? 'bg-slate-900/30 border-slate-800/30' : 'bg-slate-950/50 border-slate-800'}`}>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h4 className={`font-semibold ${day.isRestDay ? 'text-slate-500' : 'text-blue-400'}`}>{day.day}</h4>
                                                                {day.isRestDay ? (
                                                                    <Badge variant="outline" className="border-slate-800 text-slate-500">Rest Day</Badge>
                                                                ) : (
                                                                    <span className="text-sm text-slate-400">{day.focus}</span>
                                                                )}
                                                            </div>
                                                            {!day.isRestDay && day.exercises.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {day.exercises.map((ex: any, exIdx: number) => (
                                                                        <div key={exIdx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 last:pb-0">
                                                                            <div>
                                                                                <span className="font-medium text-slate-200">{ex.name}</span>
                                                                                {ex.notes && <p className="text-xs text-slate-500 mt-0.5">{ex.notes}</p>}
                                                                            </div>
                                                                            <div className="text-sm text-slate-400 flex gap-4 text-right">
                                                                                <span>{ex.sets} × {ex.reps}</span>
                                                                                <span className="w-16">Rest: {ex.rest}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : !day.isRestDay && (
                                                                <p className="text-sm text-slate-500 italic">No exercises added.</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button onClick={() => setWorkoutView('preset')} className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white">
                                                    Assign New Plan
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-slate-300">No active workout plan</h3>
                                                <p className="text-sm text-slate-500 mb-6">Assign a plan to help {member.name} reach their goals.</p>
                                                <div className="flex justify-center gap-4">
                                                    <Button onClick={() => setWorkoutView('preset')} className="bg-blue-600 hover:bg-blue-700">Choose Preset</Button>
                                                    <Button onClick={() => setWorkoutView('custom')} variant="outline" className="border-slate-700 text-slate-300">Create Custom</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {workoutView === 'preset' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {presetWorkoutPlans.map(plan => (
                                            <Card key={plan.id} className="bg-slate-950 border-slate-800 flex flex-col">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg text-white">{plan.title}</CardTitle>
                                                    <div className="flex gap-2 mt-2 text-xs">
                                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">{plan.target}</Badge>
                                                        <Badge variant="outline" className="border-slate-700 text-slate-400">{plan.level}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="text-sm text-slate-400 flex-1">
                                                    {plan.description}
                                                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                                                        <p className="font-semibold text-slate-300 mb-2">Key Exercises:</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {plan.exercises.map((ex, i) => <li key={i}>{ex.name}</li>)}
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="pt-0 flex flex-col gap-2">
                                                    <Button onClick={() => handleAssignPresetWorkout(plan)} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30">
                                                        Assign to {member.name.split(' ')[0]}
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setCustomWorkout({ name: plan.title + ' (Custom)', focus: plan.target, duration: plan.duration, intensity: plan.level === 'Advanced' ? 'High' : 'Moderate' });
                                                        setCustomSchedule(prev => prev.map((d, i) => i === 0 ? { ...d, isRestDay: false, focus: plan.target, exercises: plan.exercises.map((ex:any) => ({ name: ex.name, sets: ex.sets.toString(), reps: ex.reps.toString(), rest: ex.rest, notes: '' })) } : { ...d, isRestDay: true, exercises: [] }));
                                                        setWorkoutView('custom');
                                                    }} variant="ghost" className="w-full text-slate-400 hover:text-white">
                                                        Customize Plan
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {workoutView === 'custom' && (
                                    <div className="space-y-6 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400">Plan Name</label>
                                                <Input value={customWorkout.name} onChange={e => setCustomWorkout({...customWorkout, name: e.target.value})} placeholder="e.g. Hypertrophy Phase 1" className="bg-slate-950 border-slate-800 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400">Focus / Goal</label>
                                                <Input value={customWorkout.focus} onChange={e => setCustomWorkout({...customWorkout, focus: e.target.value})} placeholder="e.g. Full Body" className="bg-slate-950 border-slate-800 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400">Duration</label>
                                                <Input value={customWorkout.duration} onChange={e => setCustomWorkout({...customWorkout, duration: e.target.value})} placeholder="e.g. 4 Weeks" className="bg-slate-950 border-slate-800 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400">Intensity</label>
                                                <select 
                                                    value={customWorkout.intensity} 
                                                    onChange={e => setCustomWorkout({...customWorkout, intensity: e.target.value})}
                                                    className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option>Low</option><option>Moderate</option><option>High</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-4 border-t border-slate-800/50 mt-4">
                                            <h3 className="text-lg font-bold text-white mb-4">Weekly Schedule</h3>
                                            
                                            {customSchedule.map((day, dayIdx) => (
                                                <div key={dayIdx} className={`p-4 rounded-xl border transition-colors ${day.isRestDay ? 'bg-slate-900/30 border-slate-800/40' : 'bg-slate-950/80 border-slate-700'}`}>
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <h4 className={`text-lg font-bold w-24 ${day.isRestDay ? 'text-slate-500' : 'text-blue-400'}`}>{day.day}</h4>
                                                            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                                                <input type="checkbox" checked={day.isRestDay} onChange={e => {
                                                                    const newSchedule = [...customSchedule];
                                                                    newSchedule[dayIdx].isRestDay = e.target.checked;
                                                                    setCustomSchedule(newSchedule);
                                                                }} className="rounded border-slate-700 bg-slate-900 text-blue-500" />
                                                                Rest Day
                                                            </label>
                                                        </div>
                                                        {!day.isRestDay && (
                                                            <div className="flex-1 w-full flex flex-col sm:flex-row gap-2 justify-end">
                                                                <Input placeholder="Day Focus (e.g. Push Day)" value={day.focus} onChange={e => {
                                                                    const newSchedule = [...customSchedule];
                                                                    newSchedule[dayIdx].focus = e.target.value;
                                                                    setCustomSchedule(newSchedule);
                                                                }} className="bg-slate-900 border-slate-800 text-white h-9 text-sm max-w-[200px]" />
                                                                
                                                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                                                    const newSchedule = [...customSchedule];
                                                                    newSchedule[dayIdx].exercises.push({id: Date.now().toString(), name: '', target: '', sets: '', reps: '', rest: '', notes: ''});
                                                                    setCustomSchedule(newSchedule);
                                                                }} className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 h-9">
                                                                    <PlusCircle className="w-4 h-4 mr-1" /> Add Exercise
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!day.isRestDay && (
                                                        <div className="space-y-3">
                                                            {day.exercises.map((ex: any, exIdx: number) => (
                                                                <div key={exIdx} className="flex flex-wrap gap-2 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 relative group">
                                                                    <div className="w-full md:flex-1 min-w-[200px]">
                                                                        <label className="text-[10px] uppercase text-slate-500 mb-1 block">Exercise Name</label>
                                                                        <Input placeholder="Exercise name" value={ex.name} onChange={e => {
                                                                            const newSchedule = [...customSchedule];
                                                                            newSchedule[dayIdx].exercises[exIdx].name = e.target.value;
                                                                            setCustomSchedule(newSchedule);
                                                                        }} className="bg-slate-950 border-slate-800 text-white h-9 text-sm" />
                                                                    </div>
                                                                    <div className="w-[calc(50%-0.5rem)] md:w-20">
                                                                        <label className="text-[10px] uppercase text-slate-500 mb-1 block">Sets</label>
                                                                        <Input placeholder="Sets" value={ex.sets} onChange={e => {
                                                                            const newSchedule = [...customSchedule];
                                                                            newSchedule[dayIdx].exercises[exIdx].sets = e.target.value;
                                                                            setCustomSchedule(newSchedule);
                                                                        }} className="bg-slate-950 border-slate-800 text-white h-9 text-sm" />
                                                                    </div>
                                                                    <div className="w-[calc(50%-0.5rem)] md:w-24">
                                                                        <label className="text-[10px] uppercase text-slate-500 mb-1 block">Reps</label>
                                                                        <Input placeholder="Reps" value={ex.reps} onChange={e => {
                                                                            const newSchedule = [...customSchedule];
                                                                            newSchedule[dayIdx].exercises[exIdx].reps = e.target.value;
                                                                            setCustomSchedule(newSchedule);
                                                                        }} className="bg-slate-950 border-slate-800 text-white h-9 text-sm" />
                                                                    </div>
                                                                    <div className="w-[calc(50%-0.5rem)] md:w-24">
                                                                        <label className="text-[10px] uppercase text-slate-500 mb-1 block">Rest</label>
                                                                        <Input placeholder="Rest" value={ex.rest} onChange={e => {
                                                                            const newSchedule = [...customSchedule];
                                                                            newSchedule[dayIdx].exercises[exIdx].rest = e.target.value;
                                                                            setCustomSchedule(newSchedule);
                                                                        }} className="bg-slate-950 border-slate-800 text-white h-9 text-sm" />
                                                                    </div>
                                                                    <div className="w-full mt-2 flex gap-2">
                                                                        <Input placeholder="Optional notes..." value={ex.notes} onChange={e => {
                                                                            const newSchedule = [...customSchedule];
                                                                            newSchedule[dayIdx].exercises[exIdx].notes = e.target.value;
                                                                            setCustomSchedule(newSchedule);
                                                                        }} className="bg-slate-950 border-slate-800 text-white h-8 text-xs flex-1" />
                                                                        
                                                                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                                                                            const newSchedule = [...customSchedule];
                                                                            newSchedule[dayIdx].exercises.splice(exIdx, 1);
                                                                            setCustomSchedule(newSchedule);
                                                                        }} className="h-8 px-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {day.exercises.length === 0 && (
                                                                <p className="text-sm text-slate-500 italic py-2 text-center border border-dashed border-slate-800 rounded-lg">No exercises added.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-slate-800/50">
                                            <Button onClick={handleAssignCustomWorkout} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save & Assign to Member</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* DIET PLAN TAB */}
                    <TabsContent value="diet" className="mt-6">
                        <Card className="bg-slate-900/40 border-slate-800/60 min-h-[400px]">
                            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/60 pb-4 gap-4">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2 text-white">
                                        <Utensils className="w-5 h-5 text-emerald-400" /> Diet Program
                                    </CardTitle>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant={dietView === 'current' ? 'default' : 'outline'} size="sm" onClick={() => setDietView('current')} className={dietView === 'current' ? 'bg-emerald-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}>
                                        Current Plan
                                    </Button>
                                    <Button variant={dietView === 'preset' ? 'default' : 'outline'} size="sm" onClick={() => setDietView('preset')} className={dietView === 'preset' ? 'bg-emerald-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}>
                                        Presets
                                    </Button>
                                    <Button variant={dietView === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setDietView('custom')} className={dietView === 'custom' ? 'bg-emerald-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}>
                                        Create Custom
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {dietView === 'current' && (
                                    <div className="space-y-6">
                                        {currentDietPlan ? (
                                            <div>
                                                <h3 className="text-2xl font-bold text-emerald-400 mb-2">{currentDietPlan.name}</h3>
                                                <div className="flex gap-2 mb-6">
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{currentDietPlan.goal}</Badge>
                                                    <Badge className="bg-slate-800 text-slate-300">{currentDietPlan.dailyCalories} kcal</Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="p-3 bg-slate-950/50 rounded-xl text-center border border-slate-800/50">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Protein</p>
                                                        <p className="font-semibold text-emerald-400">{currentDietPlan.macros.protein.target}g</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-950/50 rounded-xl text-center border border-slate-800/50">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Carbs</p>
                                                        <p className="font-semibold text-blue-400">{currentDietPlan.macros.carbs.target}g</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-950/50 rounded-xl text-center border border-slate-800/50">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fats</p>
                                                        <p className="font-semibold text-amber-400">{currentDietPlan.macros.fats.target}g</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 mb-6">
                                                    {currentDietPlan.meals?.map((meal: any, i: number) => (
                                                        <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{meal.type}</Badge>
                                                                    <h4 className="font-semibold text-slate-200">{meal.name}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                    <Clock className="w-4 h-4" /> {meal.time}
                                                                </div>
                                                            </div>
                                                            {meal.notes && <p className="text-sm text-slate-400 mb-3 italic">"{meal.notes}"</p>}
                                                            <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                                                                {meal.foods.map((food: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between items-center text-sm pl-2">
                                                                        <span className="text-slate-300">
                                                                            {typeof food === 'string' ? food : food.name}
                                                                        </span>
                                                                        <span className="text-slate-500 font-medium">
                                                                            {typeof food === 'string' ? '' : food.quantity}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button onClick={() => setDietView('preset')} className="mt-2 w-full bg-slate-800 hover:bg-slate-700 text-white">
                                                    Assign New Plan
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Utensils className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-slate-300">No active diet plan</h3>
                                                <p className="text-sm text-slate-500 mb-6">Assign a nutrition plan to help {member.name} reach their goals.</p>
                                                <div className="flex justify-center gap-4">
                                                    <Button onClick={() => setDietView('preset')} className="bg-emerald-600 hover:bg-emerald-700">Choose Preset</Button>
                                                    <Button onClick={() => setDietView('custom')} variant="outline" className="border-slate-700 text-slate-300">Create Custom</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {dietView === 'preset' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {presetDietPlans.map(plan => (
                                            <Card key={plan.id} className="bg-slate-950 border-slate-800 flex flex-col">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg text-white">{plan.title}</CardTitle>
                                                    <div className="flex gap-2 mt-2 text-xs">
                                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">{plan.target}</Badge>
                                                        <Badge variant="outline" className="border-slate-700 text-slate-400">{plan.calories} kcal</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="text-sm text-slate-400 flex-1">
                                                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                                        <div className="text-center"><p className="text-emerald-400 font-bold">{plan.macros.p}g</p><p className="text-[10px] uppercase">Protein</p></div>
                                                        <div className="text-center"><p className="text-blue-400 font-bold">{plan.macros.c}g</p><p className="text-[10px] uppercase">Carbs</p></div>
                                                        <div className="text-center"><p className="text-amber-400 font-bold">{plan.macros.f}g</p><p className="text-[10px] uppercase">Fats</p></div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="pt-0 flex flex-col gap-2">
                                                    <Button onClick={() => handleAssignPresetDiet(plan)} className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30">
                                                        Assign to {member.name.split(' ')[0]}
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setCustomDiet({ name: plan.title + ' (Custom)', goal: plan.target, calories: plan.calories.toString() });
                                                        setCustomMacros({ p: plan.macros.p.toString(), c: plan.macros.c.toString(), f: plan.macros.f.toString() });
                                                        setCustomMeals([{ id: Date.now().toString(), type: 'Breakfast', time: '08:00 AM', name: 'Preset Meal', notes: '', foods: [{ name: '', quantity: '' }] }]);
                                                        setDietView('custom');
                                                    }} variant="ghost" className="w-full text-slate-400 hover:text-white">
                                                        Customize Plan
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {dietView === 'custom' && (
                                    <div className="space-y-6 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400">Plan Name</label>
                                                <Input value={customDiet.name} onChange={e => setCustomDiet({...customDiet, name: e.target.value})} placeholder="e.g. Lean Bulk" className="bg-slate-950 border-slate-800 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400">Focus / Goal</label>
                                                <Input value={customDiet.goal} onChange={e => setCustomDiet({...customDiet, goal: e.target.value})} placeholder="e.g. Muscle Gain" className="bg-slate-950 border-slate-800 text-white" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium text-slate-400">Daily Calories</label>
                                                <Input type="number" value={customDiet.calories} onChange={e => setCustomDiet({...customDiet, calories: e.target.value})} placeholder="e.g. 2500" className="bg-slate-950 border-slate-800 text-white" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                            <label className="text-sm font-bold text-slate-300">Macro Targets (g)</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Protein</label>
                                                    <Input type="number" value={customMacros.p} onChange={e => setCustomMacros({...customMacros, p: e.target.value})} placeholder="150" className="bg-slate-950 border-slate-800 text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Carbs</label>
                                                    <Input type="number" value={customMacros.c} onChange={e => setCustomMacros({...customMacros, c: e.target.value})} placeholder="200" className="bg-slate-950 border-slate-800 text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Fats</label>
                                                    <Input type="number" value={customMacros.f} onChange={e => setCustomMacros({...customMacros, f: e.target.value})} placeholder="60" className="bg-slate-950 border-slate-800 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t border-slate-800/50 mt-6 mb-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-bold text-white">Meals</h3>
                                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                                    setCustomMeals([...customMeals, { id: Date.now().toString(), type: 'Snack', time: '12:00 PM', name: '', notes: '', foods: [{ name: '', quantity: '' }] }]);
                                                }} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300">
                                                    <PlusCircle className="w-4 h-4 mr-1" /> Add Meal
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {customMeals.map((meal, mealIdx) => (
                                                    <div key={mealIdx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-700 space-y-4 relative">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                                                            const newMeals = [...customMeals];
                                                            newMeals.splice(mealIdx, 1);
                                                            setCustomMeals(newMeals);
                                                        }} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                                                            <div>
                                                                <label className="text-[10px] uppercase text-slate-500 mb-1 block">Meal Type</label>
                                                                <select value={meal.type} onChange={e => {
                                                                    const newMeals = [...customMeals];
                                                                    newMeals[mealIdx].type = e.target.value;
                                                                    setCustomMeals(newMeals);
                                                                }} className="w-full h-9 px-3 rounded-md bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                                                    <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option><option>Pre-Workout</option><option>Post-Workout</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] uppercase text-slate-500 mb-1 block">Time</label>
                                                                <Input type="time" value={meal.time} onChange={e => {
                                                                    const newMeals = [...customMeals];
                                                                    newMeals[mealIdx].time = e.target.value;
                                                                    setCustomMeals(newMeals);
                                                                }} className="bg-slate-900 border-slate-800 text-white h-9 text-sm focus:ring-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] uppercase text-slate-500 mb-1 block">Meal Name</label>
                                                                <Input placeholder="e.g. Chicken & Rice" value={meal.name} onChange={e => {
                                                                    const newMeals = [...customMeals];
                                                                    newMeals[mealIdx].name = e.target.value;
                                                                    setCustomMeals(newMeals);
                                                                }} className="bg-slate-900 border-slate-800 text-white h-9 text-sm focus:ring-emerald-500" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase text-slate-500 block">Foods</label>
                                                            {meal.foods.map((food: any, foodIdx: number) => (
                                                                <div key={foodIdx} className="flex gap-2 items-center">
                                                                    <Input placeholder="Food item (e.g. Jasmine Rice)" value={food.name} onChange={e => {
                                                                        const newMeals = [...customMeals];
                                                                        newMeals[mealIdx].foods[foodIdx].name = e.target.value;
                                                                        setCustomMeals(newMeals);
                                                                    }} className="bg-slate-900 border-slate-800 text-white h-8 text-sm flex-1 focus:ring-emerald-500" />
                                                                    
                                                                    <Input placeholder="Qty (e.g. 150g)" value={food.quantity} onChange={e => {
                                                                        const newMeals = [...customMeals];
                                                                        newMeals[mealIdx].foods[foodIdx].quantity = e.target.value;
                                                                        setCustomMeals(newMeals);
                                                                    }} className="bg-slate-900 border-slate-800 text-white h-8 text-sm w-24 focus:ring-emerald-500" />

                                                                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                                                                        const newMeals = [...customMeals];
                                                                        newMeals[mealIdx].foods.splice(foodIdx, 1);
                                                                        setCustomMeals(newMeals);
                                                                    }} className="text-slate-500 hover:text-red-400 p-2 h-8">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => {
                                                                const newMeals = [...customMeals];
                                                                newMeals[mealIdx].foods.push({ name: '', quantity: '' });
                                                                setCustomMeals(newMeals);
                                                            }} className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 h-6 px-2">
                                                                + Add Food Item
                                                            </Button>
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] uppercase text-slate-500 mb-1 block">Notes (Optional)</label>
                                                            <Input placeholder="e.g. Cook with olive oil..." value={meal.notes} onChange={e => {
                                                                const newMeals = [...customMeals];
                                                                newMeals[mealIdx].notes = e.target.value;
                                                                setCustomMeals(newMeals);
                                                            }} className="bg-slate-900 border-slate-800 text-white h-8 text-xs focus:ring-emerald-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                                {customMeals.length === 0 && (
                                                    <p className="text-sm text-slate-500 italic text-center py-4 border border-dashed border-slate-800 rounded-xl">No meals added.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800/50">
                                            <Button onClick={handleAssignCustomDiet} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Save & Assign to Member</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* HYROX TAB */}
                    <TabsContent value="hyrox" className="mt-6 space-y-6">
                        {hyroxView === 'current' ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy className="w-6 h-6 text-amber-500" /> HYROX Tracking
                                    </h2>
                                    <Button onClick={() => setHyroxView('assign')} className="bg-amber-600 hover:bg-amber-700 text-white">
                                        Assign / Edit Program
                                    </Button>
                                </div>

                                {/* Current Program & PRs Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Program Details */}
                                    <Card className="bg-slate-900/40 border-slate-800/60 lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle className="text-white">Current Program</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {hyroxAssignedProgramId ? (() => {
                                                const prog = hyroxPrograms.find(p => p.id === hyroxAssignedProgramId);
                                                if(!prog) return <p className="text-slate-400">Program not found.</p>;
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white">{prog.name}</h3>
                                                                <p className="text-slate-400 text-sm mt-1">{prog.description}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Badge variant="outline" className="border-amber-500/30 text-amber-400 self-start">{prog.level}</Badge>
                                                                <Badge variant="outline" className="border-slate-700 text-slate-300 self-start">{prog.duration} • {prog.frequency}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t border-slate-800/50">
                                                            <div className="flex items-center justify-between text-sm mb-2">
                                                                <span className="text-slate-400">Program Completion</span>
                                                                <span className="text-amber-400 font-bold">{Math.round((hyroxCompletedCount / prog.schedule.length) * 100)}%</span>
                                                            </div>
                                                            <Progress value={(hyroxCompletedCount / prog.schedule.length) * 100} className="h-2 bg-slate-800 [&>div]:bg-amber-500" />
                                                            <p className="text-xs text-slate-500 mt-2">{hyroxCompletedCount} of {prog.schedule.length} workouts completed</p>
                                                        </div>
                                                    </div>
                                                )
                                            })() : (
                                                <div className="text-center py-8">
                                                    <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                                    <p className="text-slate-400 mb-4">No HYROX program assigned to {member.name}.</p>
                                                    <Button onClick={() => setHyroxView('assign')} className="bg-amber-600 hover:bg-amber-700 text-white">
                                                        Assign Program Now
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Personal Records */}
                                    <Card className="bg-slate-900/40 border-slate-800/60">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-amber-500" /> Performance PRs
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                if(editingPRs) {
                                                    setHyroxPBs(tempPRs);
                                                    setEditingPRs(false);
                                                    toast.success("PRs Updated!");
                                                    // Save to localStorage
                                                    const currentPBs = JSON.parse(localStorage.getItem('zenith_hyrox_pbs') || '{}');
                                                    currentPBs['ch-1'] = tempPRs.wallBalls;
                                                    currentPBs['ch-2'] = tempPRs.sledPush;
                                                    currentPBs['ch-3'] = tempPRs.rowSprint;
                                                    localStorage.setItem('zenith_hyrox_pbs', JSON.stringify(currentPBs));
                                                } else {
                                                    setTempPRs({ 
                                                        wallBalls: hyroxPBs.wallBalls || '', 
                                                        sledPush: hyroxPBs.sledPush || '', 
                                                        rowSprint: hyroxPBs.rowSprint || '' 
                                                    });
                                                    setEditingPRs(true);
                                                }
                                            }} className="text-xs text-blue-400 hover:text-blue-300 px-2 h-7">
                                                {editingPRs ? 'Save' : 'Edit'}
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-4">
                                            <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-amber-500/10 p-2 rounded-md">
                                                        <Trophy className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase">Wall Balls</p>
                                                        {editingPRs ? (
                                                            <Input value={tempPRs.wallBalls} onChange={e => setTempPRs({...tempPRs, wallBalls: e.target.value})} className="h-6 text-sm w-20 bg-slate-900 border-slate-700 px-1 mt-1 text-white" />
                                                        ) : (
                                                            <p className="font-bold text-slate-200">{hyroxPBs.wallBalls || '—'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-500/10 p-2 rounded-md">
                                                        <Dumbbell className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase">Sled Push</p>
                                                        {editingPRs ? (
                                                            <Input value={tempPRs.sledPush} onChange={e => setTempPRs({...tempPRs, sledPush: e.target.value})} className="h-6 text-sm w-20 bg-slate-900 border-slate-700 px-1 mt-1 text-white" />
                                                        ) : (
                                                            <p className="font-bold text-slate-200">{hyroxPBs.sledPush || '—'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-500/10 p-2 rounded-md">
                                                        <Zap className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase">1km Row</p>
                                                        {editingPRs ? (
                                                            <Input value={tempPRs.rowSprint} onChange={e => setTempPRs({...tempPRs, rowSprint: e.target.value})} className="h-6 text-sm w-20 bg-slate-900 border-slate-700 px-1 mt-1 text-white" />
                                                        ) : (
                                                            <p className="font-bold text-slate-200">{hyroxPBs.rowSprint || '—'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Workouts Schedule */}
                                {hyroxAssignedProgramId && (() => {
                                    const prog = hyroxPrograms.find(p => p.id === hyroxAssignedProgramId);
                                    if(!prog) return null;
                                    return (
                                        <Card className="bg-slate-900/40 border-slate-800/60">
                                            <CardHeader>
                                                <CardTitle className="text-white text-lg">Program Workouts</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {prog.schedule.map((day: any, idx: number) => {
                                                        const isCompleted = idx < hyroxCompletedCount;
                                                        return (
                                                            <div key={idx} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isCompleted ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700'}`}>
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`p-2 rounded-lg mt-1 ${isCompleted ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                                                                        {isCompleted ? <Check className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge variant="outline" className={isCompleted ? "border-amber-500/30 text-amber-400" : "border-slate-700 text-slate-400"}>{day.day}</Badge>
                                                                            <span className={`text-xs font-medium uppercase ${isCompleted ? 'text-amber-500/70' : 'text-slate-500'}`}>{day.type}</span>
                                                                        </div>
                                                                        <p className={isCompleted ? "text-slate-300 line-through decoration-slate-600" : "text-white font-medium"}>{day.workout}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className={isCompleted ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}>
                                                                        {isCompleted ? 'Completed' : 'Pending'}
                                                                    </Badge>
                                                                    {!isCompleted && (
                                                                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none" onClick={() => {
                                                                            setHyroxCompletedCount(prev => prev + 1);
                                                                            toast.success("Workout marked as completed!");
                                                                        }}>
                                                                            Mark Done
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" onClick={() => setHyroxView('current')} className="text-slate-400 hover:text-white">
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <h2 className="text-xl font-bold text-white">Assign HYROX Program</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {hyroxPrograms.map((prog) => (
                                        <Card key={prog.id} className="bg-slate-900/40 border-slate-800/60 overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all">
                                            <div className="h-40 relative overflow-hidden">
                                                <img src={prog.image} alt={prog.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                                                <div className="absolute bottom-3 left-4">
                                                    <Badge className="bg-amber-500/90 text-black border-none font-bold">{prog.level}</Badge>
                                                </div>
                                            </div>
                                            <CardContent className="pt-4 flex-1 flex flex-col">
                                                <h3 className="text-lg font-bold text-white mb-2">{prog.name}</h3>
                                                <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{prog.description}</p>
                                                <div className="flex flex-wrap gap-2 text-xs mb-6">
                                                    <Badge variant="outline" className="border-slate-700 text-slate-300">{prog.duration}</Badge>
                                                    <Badge variant="outline" className="border-slate-700 text-slate-300">{prog.frequency}</Badge>
                                                </div>
                                                <Button 
                                                    onClick={() => {
                                                        setHyroxAssignedProgramId(prog.id);
                                                        setHyroxCompletedCount(0);
                                                        
                                                        // Save to local storage
                                                        const assignments = JSON.parse(localStorage.getItem('zenith_trainer_hyrox_member_assignments') || '{}');
                                                        assignments[member.email] = prog.id;
                                                        localStorage.setItem('zenith_trainer_hyrox_member_assignments', JSON.stringify(assignments));

                                                        toast.success(`Assigned ${prog.name} to ${member.name}`);
                                                        setHyroxView('current');
                                                    }}
                                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                                >
                                                    Assign to Member
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}
