'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlan, WorkoutPlan } from '@/context/PlanContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ChevronLeft,
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
    ChevronDown,
    Flame
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function WorkoutPlansPanel() {
    const { assignWorkoutPlan } = usePlan();
    const [searchQuery, setSearchQuery] = useState('');


    const handleAssign = (plan: any) => {
        // Map trainer plan format to member plan format
        const formattedPlan: WorkoutPlan = {
            name: plan.title,
            focus: plan.target,
            duration: plan.duration,
            intensity: plan.level === 'Advanced' ? 'High' : (plan.level === 'Intermediate' ? 'Moderate' : 'Low'),
            exercises: plan.exercises.map((ex: any, idx: number) => ({
                id: String(idx + 1),
                name: ex.name,
                target: plan.target, // Fallback target
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

    const recentActivity = [
        { id: 1, client: 'Alex Thompson', action: 'completed Day 4 of Shred & Tone', time: '2 hours ago', avatar: 'AT' },
        { id: 2, client: 'Jessica Miller', action: 'set a new PR on Deadlift (225lbs)', time: '4 hours ago', avatar: 'JM' },
        { id: 3, client: 'David Garcia', action: 'skipped Workout A', time: 'Yesterday', avatar: 'DG' }
    ];

    const getDifficultyStyle = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent pb-1">
                        Workout Programs
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Design, manage, and assign training routines to your clients.
                    </p>
                </div>

                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-900/20 px-6 h-12 rounded-xl text-lg font-medium" asChild>
                    <Link href="/trainer/workout-plans/builder">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Create Program
                    </Link>
                </Button>
            </header>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    placeholder="Search programs by name or target..."
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 px-6 bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                                <Filter className="w-5 h-5 mr-2" />
                                Filters
                            </Button>
                        </div>

                        {/* Program Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {workoutPlans.map((plan) => (
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
                                                onClick={() => handleAssign(plan)}
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
                                {recentActivity.map((activity) => (
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
        </div>
    );
}
