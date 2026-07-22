'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useNotifications } from '@/context/NotificationContext';
import { usePlan, WorkoutPlan } from '@/context/PlanContext';
import {
    getAssignedMembers,
    assignWorkoutPlanToMember,
    AssignedMember,
    ASSIGNED_MEMBERS_STORAGE_KEY
} from '@/lib/trainer-members-store';
import {
    Search,
    ChevronLeft,
    Mail,
    Activity,
    Target,
    Dumbbell,
    Users,
    Sparkles,
    PlusCircle,
    CheckCircle2,
    Scale,
    ShieldCheck,
    Zap
} from 'lucide-react';

const PRESET_WORKOUT_PLANS = [
    {
        title: 'Shred & Tone 90-Day',
        focus: 'Full Body Fat Loss',
        duration: '12 Weeks',
        intensity: 'Moderate',
        exercises: [
            { id: '1', name: 'Barbell Squats', target: 'Legs', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on depth and knee tracking.' },
            { id: '2', name: 'Dumbbell Bench Press', target: 'Chest', sets: 3, reps: '10-12', rest: '60s', notes: 'Full range of motion.' },
            { id: '3', name: 'Bent Over Rows', target: 'Back', sets: 3, reps: '10-12', rest: '60s', notes: 'Keep spine neutral.' }
        ]
    },
    {
        title: 'Powerbuilding V2',
        focus: 'Strength & Hypertrophy',
        duration: '8 Weeks',
        intensity: 'High',
        exercises: [
            { id: '1', name: 'Barbell Deadlift', target: 'Posterior Chain', sets: 5, reps: '3-5', rest: '180s', notes: 'Brace core hard before pull.' },
            { id: '2', name: 'Overhead Press', target: 'Shoulders', sets: 4, reps: '5-8', rest: '120s', notes: 'Lockout overhead.' },
            { id: '3', name: 'Weighted Pull-ups', target: 'Lats', sets: 4, reps: '6-8', rest: '90s', notes: 'Full extension at bottom.' }
        ]
    },
    {
        title: 'Beginner Full Body Split',
        focus: 'Form & Foundation',
        duration: '4 Weeks',
        intensity: 'Low',
        exercises: [
            { id: '1', name: 'Goblet Squats', target: 'Legs', sets: 3, reps: '10-12', rest: '60s', notes: 'Upright torso.' },
            { id: '2', name: 'Push-ups', target: 'Chest', sets: 3, reps: '10-15', rest: '45s', notes: 'Strict core plank.' },
            { id: '3', name: 'Lat Pulldowns', target: 'Back', sets: 3, reps: '12', rest: '60s', notes: 'Pull down to collarbone.' }
        ]
    }
];

export default function MembersPanel() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { addNotification } = useNotifications();
    const { assignWorkoutPlan } = usePlan();

    const [members, setMembers] = useState<AssignedMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMemberProfile, setSelectedMemberProfile] = useState<AssignedMember | null>(null);
    const [createPlanMember, setCreatePlanMember] = useState<AssignedMember | null>(null);
    const [selectedPresetPlan, setSelectedPresetPlan] = useState<string>('Shred & Tone 90-Day');

    // Load assigned members
    const loadMembers = () => {
        const list = getAssignedMembers();
        setMembers(list);
    };

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    useEffect(() => {
        loadMembers();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === ASSIGNED_MEMBERS_STORAGE_KEY || e.key === 'flex_fitness_profile_v2' || e.key === 'zenith_pt_status') {
                loadMembers();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Filter members by search query
    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.fitnessGoal.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const newMembers = filteredMembers.filter(m => !m.hasWorkoutPlan);
    const activeMembers = filteredMembers.filter(m => m.hasWorkoutPlan);

    // Handle Assigning First Workout Plan
    const handleAssignFirstWorkout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createPlanMember) return;

        const preset = PRESET_WORKOUT_PLANS.find(p => p.title === selectedPresetPlan) || PRESET_WORKOUT_PLANS[0];

        // 1. Update store
        assignWorkoutPlanToMember(createPlanMember.id, preset.title);

        // 2. Update PlanContext so member's My Workouts gets updated
        const formattedPlan: WorkoutPlan = {
            name: preset.title,
            focus: preset.focus,
            duration: preset.duration,
            intensity: preset.intensity,
            exercises: preset.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                target: ex.target,
                sets: ex.sets,
                reps: ex.reps,
                rest: ex.rest,
                notes: ex.notes
            }))
        };
        assignWorkoutPlan(formattedPlan);

        // 3. Send Notification to Member
        addNotification({
            role: 'member',
            userId: createPlanMember.id,
            category: 'WORKOUT',
            priority: 'high',
            title: '💪 Your Personalized Workout Plan is Ready!',
            message: `${user?.name || 'Your Trainer'} has created and assigned the "${preset.title}" workout plan to your dashboard. Access it now under My Workouts!`,
            actionLabel: 'View Workout Plan',
            actionUrl: '/member/plans'
        });

        toast.success(`First Workout Plan assigned to ${createPlanMember.name}!`, {
            description: `Member moved to Active Members. "${preset.title}" is now live on their dashboard.`,
        });

        loadMembers();
        setCreatePlanMember(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 pb-16">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header & Navigation */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/40 p-6 md:p-8 rounded-3xl border border-slate-800/80">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Users className="w-3.5 h-3.5" /> Client Roster
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent pb-1">
                                My Members
                            </h1>
                            <p className="text-slate-400 mt-1 max-w-xl">
                                Automatically assigned personal training clients, baseline fitness metrics, and workout plan workflows.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 px-4 py-2 text-sm font-bold">
                                {newMembers.length} New Pending Setup
                            </Badge>
                            <Badge className="bg-blue-500/10 border-blue-500/30 text-blue-400 px-4 py-2 text-sm font-bold">
                                {activeMembers.length} Active Workouts
                            </Badge>
                        </div>
                    </header>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Roster</p>
                            <p className="text-2xl font-bold text-white mt-1">{members.length}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between border-cyan-500/20">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">New Members</p>
                            <p className="text-2xl font-bold text-cyan-400 mt-1">{newMembers.length}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Active Members</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">{activeMembers.length}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Auto Assignments</p>
                            <p className="text-2xl font-bold text-sky-400 mt-1">100%</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                            <Zap className="w-5 h-5" />
                        </div>
                    </Card>
                </div>

                {/* Search & Tabs Section */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <Input
                                placeholder="Search member by name, email, or goal..."
                                className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <Tabs defaultValue="new_members" className="w-full">
                        <TabsList className="bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl grid grid-cols-2 max-w-md h-auto">
                            <TabsTrigger
                                value="new_members"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-bold text-sm rounded-xl py-2.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" /> New Members ({newMembers.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="active_members"
                                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold text-sm rounded-xl py-2.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Activity className="w-4 h-4 text-blue-400" /> Active Members ({activeMembers.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: NEW MEMBERS (Awaiting first workout plan) */}
                        <TabsContent value="new_members" className="mt-6 space-y-6">
                            {newMembers.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800/80 p-8 space-y-3">
                                    <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
                                    <h3 className="text-xl font-bold text-white">All Assigned Members Have Workouts!</h3>
                                    <p className="text-slate-400 max-w-md mx-auto text-sm">
                                        There are currently no new unassigned members pending a first workout plan. When a member completes PT payment, they will appear here automatically.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {newMembers.map((member) => (
                                        <Card key={member.id} className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-luxury">
                                            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-14 w-14 border-2 border-cyan-500/40 bg-slate-950">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                            <AvatarFallback className="bg-slate-800 text-white font-bold">{member.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-white">{member.name}</CardTitle>
                                                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                                <Mail className="w-3.5 h-3.5 text-slate-500" /> {member.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-bold">
                                                        NEW ASSIGNMENT
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 text-sm pb-4">
                                                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                                                    <div>
                                                        <span className="text-slate-500 text-xs block">Fitness Goal</span>
                                                        <span className="font-bold text-cyan-400">{member.fitnessGoal}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 text-xs block">Current Weight</span>
                                                        <span className="font-bold text-white">{member.currentWeight} kg</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 text-xs block">Goal Weight</span>
                                                        <span className="font-bold text-sky-400">{member.goalWeight} kg</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 text-xs block">Height</span>
                                                        <span className="font-bold text-slate-300">{member.height} cm</span>
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-1">
                                                    <span className="text-slate-400 block font-semibold">1-Rep Max PR Records:</span>
                                                    <div className="flex items-center justify-between font-mono text-slate-300 pt-0.5">
                                                        <span>Bench: <strong className="text-blue-400">{member.benchPressPR}kg</strong></span>
                                                        <span>Squat: <strong className="text-sky-400">{member.squatPR}kg</strong></span>
                                                        <span>Deadlift: <strong className="text-cyan-400">{member.deadliftPR}kg</strong></span>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            <CardFooter className="border-t border-slate-800/80 bg-slate-950/40 p-4 flex flex-col sm:flex-row gap-3">
                                                <Button
                                                    onClick={() => setSelectedMemberProfile(member)}
                                                    className="w-full sm:w-auto bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all font-semibold"
                                                >
                                                    View Full Profile
                                                </Button>
                                                <Button
                                                    onClick={() => setCreatePlanMember(member)}
                                                    className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg shadow-blue-900/20"
                                                >
                                                    <PlusCircle className="w-4 h-4 mr-2" /> Create First Workout Plan
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 2: ACTIVE MEMBERS (Workout plan already assigned) */}
                        <TabsContent value="active_members" className="mt-6 space-y-6">
                            {activeMembers.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800/80 p-8">
                                    <p className="text-slate-400 text-sm">No active members found matching search query.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeMembers.map((member) => (
                                        <Card key={member.id} className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-14 w-14 border-2 border-blue-500/40 bg-slate-950">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                            <AvatarFallback className="bg-slate-800 text-white font-bold">{member.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-white">{member.name}</CardTitle>
                                                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                                <Mail className="w-3.5 h-3.5 text-slate-500" /> {member.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-bold">
                                                        ACTIVE CLIENT
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 text-sm pb-4">
                                                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                                            <Dumbbell className="w-3.5 h-3.5 text-cyan-400" /> Assigned Workout Routine
                                                        </span>
                                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">Active</Badge>
                                                    </div>
                                                    <p className="font-bold text-white text-base">{member.assignedWorkoutPlanName || 'Custom Performance Routine'}</p>
                                                    <p className="text-xs text-slate-500">Target Goal: {member.fitnessGoal}</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                                                    <div>
                                                        <span className="text-slate-500 block">Weight</span>
                                                        <span className="font-bold text-white">{member.currentWeight} kg</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block">Bench PR</span>
                                                        <span className="font-bold text-blue-400">{member.benchPressPR} kg</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block">Squat PR</span>
                                                        <span className="font-bold text-cyan-400">{member.squatPR} kg</span>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            <CardFooter className="border-t border-slate-800/80 bg-slate-950/40 p-4 flex justify-between gap-3">
                                                <Button
                                                    onClick={() => setSelectedMemberProfile(member)}
                                                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all font-semibold"
                                                >
                                                    View Full Profile
                                                </Button>
                                                <Button
                                                    onClick={() => setCreatePlanMember(member)}
                                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                                                >
                                                    Update Workout
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* MODAL 1: COMPREHENSIVE MEMBER PROFILE DETAILS */}
            <Dialog open={!!selectedMemberProfile} onOpenChange={(open) => !open && setSelectedMemberProfile(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
                    {selectedMemberProfile && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-4 pb-2">
                                    <Avatar className="h-16 w-16 border-2 border-blue-500/40 bg-slate-950">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedMemberProfile.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                        <AvatarFallback className="bg-slate-800 text-white font-bold">{selectedMemberProfile.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-white">{selectedMemberProfile.name}</DialogTitle>
                                        <DialogDescription className="text-slate-400 text-sm">
                                            {selectedMemberProfile.email} • {selectedMemberProfile.phone}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 py-2">
                                {/* Demographics & Body Metrics */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                        <Scale className="w-4 h-4" /> Body Metrics & Fitness Profile
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                            <span className="text-slate-500 text-xs block">Height</span>
                                            <span className="text-lg font-bold text-white">{selectedMemberProfile.height} cm</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                            <span className="text-slate-500 text-xs block">Current Weight</span>
                                            <span className="text-lg font-bold text-white">{selectedMemberProfile.currentWeight} kg</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                            <span className="text-slate-500 text-xs block">Goal Weight</span>
                                            <span className="text-lg font-bold text-sky-400">{selectedMemberProfile.goalWeight} kg</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                            <span className="text-slate-500 text-xs block">Primary Goal</span>
                                            <span className="text-sm font-bold text-cyan-400 truncate block">{selectedMemberProfile.fitnessGoal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Records (1-Rep Max) */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                                        <Dumbbell className="w-4 h-4" /> Personal Records (1-Rep Max)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/20 flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-slate-500 font-semibold mb-1">Bench Press</span>
                                            <span className="text-2xl font-black text-blue-400">{selectedMemberProfile.benchPressPR} kg</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/20 flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-slate-500 font-semibold mb-1">Squat</span>
                                            <span className="text-2xl font-black text-sky-400">{selectedMemberProfile.squatPR} kg</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-slate-500 font-semibold mb-1">Deadlift</span>
                                            <span className="text-2xl font-black text-cyan-400">{selectedMemberProfile.deadliftPR} kg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Training & Attendance Status */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Membership & Attendance Status
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-sm">
                                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                            <span className="text-slate-400">Membership ID</span>
                                            <span className="font-mono text-white font-semibold">{selectedMemberProfile.membershipId}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                            <span className="text-slate-400">Personal Training Status</span>
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">PT Package Active</Badge>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                            <span className="text-slate-400">Assigned Coach</span>
                                            <span className="text-white font-semibold">{selectedMemberProfile.trainerName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Total Check-Ins / Streak</span>
                                            <span className="text-white font-semibold">{selectedMemberProfile.attendanceCount} Sessions ({selectedMemberProfile.streak} Day Streak)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    onClick={() => setSelectedMemberProfile(null)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-11 rounded-xl"
                                >
                                    Close Member Profile
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* MODAL 2: CREATE FIRST WORKOUT PLAN */}
            <Dialog open={!!createPlanMember} onOpenChange={(open) => !open && setCreatePlanMember(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg sm:rounded-3xl">
                    {createPlanMember && (
                        <form onSubmit={handleAssignFirstWorkout}>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-cyan-400" /> Assign Workout Plan
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-sm">
                                    Select a tailored workout routine for <strong className="text-white">{createPlanMember.name}</strong> to unlock their My Workouts section.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                                    <span className="text-slate-400 text-xs font-semibold">Client Fitness Goal</span>
                                    <p className="text-cyan-400 font-bold">{createPlanMember.fitnessGoal}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-slate-300 text-sm font-semibold">Select Preset Workout Template</label>
                                    <Select
                                        value={selectedPresetPlan}
                                        onValueChange={setSelectedPresetPlan}
                                    >
                                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-12 focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder="Select Plan" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            {PRESET_WORKOUT_PLANS.map(p => (
                                                <SelectItem key={p.title} value={p.title} className="focus:bg-blue-600/30 focus:text-cyan-300">
                                                    {p.title} ({p.focus})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/20"
                                >
                                    Assign Workout & Move to Active Members
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
