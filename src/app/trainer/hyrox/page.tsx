'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
    Trophy,
    Users,
    ChevronLeft,
    Plus,
    UserCheck,
    Calendar,
    Activity,
    CheckCircle2,
    Award,
    Timer,
    Zap,
    Trash2,
    BookOpen,
    Flame,
    Clock,
    User
} from 'lucide-react';

// --- Default Seed Programs (Aligned with Member Portal) ---
const DEFAULT_PROGRAMS = [
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

export default function TrainerHyroxManagement() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { addNotification } = useNotifications();
    const router = useRouter();

    // --- State Variables ---
    const [programs, setPrograms] = useState<typeof DEFAULT_PROGRAMS>([]);
    const [assignedMemberPrograms, setAssignedMemberPrograms] = useState<Record<string, string>>({});
    
    // New Program Form State
    const [newProgName, setNewProgName] = useState('');
    const [newProgLevel, setNewProgLevel] = useState('Intermediate');
    const [newProgDuration, setNewProgDuration] = useState('8 Weeks');
    const [newProgFreq, setNewProgFreq] = useState('4 days/week');
    const [newProgFocus, setNewProgFocus] = useState('');
    const [newProgDesc, setNewProgDesc] = useState('');
    const [newProgImage, setNewProgImage] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop');
    const [newProgSchedule, setNewProgSchedule] = useState<{ day: string; workout: string; type: string }[]>([
        { day: 'Day 1', workout: '', type: 'Strength' }
    ]);

    // Program Assignment Form State
    const [selectedMemberEmail, setSelectedMemberEmail] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');

    // Active client roster (syncs dynamically for user and fallbacks for other mock members)
    const [alexProgramId, setAlexProgramId] = useState<string | null>(null);
    const [alexCompletedCount, setAlexCompletedCount] = useState(0);
    const [alexPBs, setAlexPBs] = useState<Record<string, string>>({});

    // Redirect if not authorized
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, authLoading]);

    // Load custom programs, assignments, and active member state
    useEffect(() => {
        // Load Programs
        const customProgs = localStorage.getItem('zenith_trainer_hyrox_programs');
        if (customProgs) {
            try {
                setPrograms(JSON.parse(customProgs));
            } catch (e) {
                setPrograms(DEFAULT_PROGRAMS);
            }
        } else {
            setPrograms(DEFAULT_PROGRAMS);
            localStorage.setItem('zenith_trainer_hyrox_programs', JSON.stringify(DEFAULT_PROGRAMS));
        }

        // Load mock other member assignments
        const savedAssignments = localStorage.getItem('zenith_trainer_hyrox_member_assignments');
        if (savedAssignments) {
            try {
                setAssignedMemberPrograms(JSON.parse(savedAssignments));
            } catch (e) {}
        } else {
            const initialAssignments = {
                'jessica.m@example.com': 'hyrox-power',
                'david.g88@example.com': '',
                'lisa.anderson@example.com': 'hyrox-race'
            };
            setAssignedMemberPrograms(initialAssignments);
            localStorage.setItem('zenith_trainer_hyrox_member_assignments', JSON.stringify(initialAssignments));
        }

        // Load Live Logged-in Member (Alex J. / member@flexgym.com) progress
        const liveProgId = localStorage.getItem('zenith_hyrox_program_id');
        setAlexProgramId(liveProgId);

        const liveCompleted = localStorage.getItem('zenith_hyrox_completed_workouts');
        if (liveCompleted) {
            try {
                const parsed = JSON.parse(liveCompleted);
                const count = Object.values(parsed).filter(Boolean).length;
                setAlexCompletedCount(count);
            } catch (e) {}
        }

        const livePBs = localStorage.getItem('zenith_hyrox_pbs');
        if (livePBs) {
            try {
                setAlexPBs(JSON.parse(livePBs));
            } catch (e) {}
        }
    }, []);

    if (authLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading HYROX Management...</div>;
    }

    // Roster of members we track
    const ROSTER = [
        {
            name: 'Alex Thompson',
            email: 'member@flexgym.com', // Links to active member session!
            avatar: 'AT',
            programId: alexProgramId,
            completedCount: alexCompletedCount,
            totalWorkouts: alexProgramId ? (programs.find(p => p.id === alexProgramId)?.schedule.length || 4) : 0,
            pbs: {
                wallBalls: alexPBs['ch-1'] || '4:45',
                sledPush: alexPBs['ch-2'] || '175 kg',
                rowSprint: alexPBs['ch-3'] || '3:18'
            }
        },
        {
            name: 'Jessica Miller',
            email: 'jessica.m@example.com',
            avatar: 'JM',
            programId: assignedMemberPrograms['jessica.m@example.com'] || null,
            completedCount: 2,
            totalWorkouts: 4,
            pbs: {
                wallBalls: '5:10',
                sledPush: '160 kg',
                rowSprint: '3:32'
            }
        },
        {
            name: 'David Garcia',
            email: 'david.g88@example.com',
            avatar: 'DG',
            programId: assignedMemberPrograms['david.g88@example.com'] || null,
            completedCount: 0,
            totalWorkouts: 0,
            pbs: {
                wallBalls: '—',
                sledPush: '120 kg',
                rowSprint: '—'
            }
        },
        {
            name: 'Lisa Anderson',
            email: 'lisa.anderson@example.com',
            avatar: 'LA',
            programId: assignedMemberPrograms['lisa.anderson@example.com'] || null,
            completedCount: 4,
            totalWorkouts: 5,
            pbs: {
                wallBalls: '4:22',
                sledPush: '145 kg',
                rowSprint: '3:25'
            }
        }
    ];

    // --- Handler to Create a Program ---
    const handleCreateProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProgName || !newProgFocus || !newProgDesc) {
            toast.error('Please fill in all program fields.');
            return;
        }

        const newId = `hyrox-${Date.now()}`;
        const newProgram = {
            id: newId,
            name: newProgName,
            level: newProgLevel,
            duration: newProgDuration,
            frequency: newProgFreq,
            focus: newProgFocus,
            description: newProgDesc,
            image: newProgImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
            schedule: newProgSchedule.map((s, idx) => ({
                day: s.day || `Day ${idx + 1}`,
                workout: s.workout || 'Functional HYROX Intervals',
                type: s.type || 'Strength'
            }))
        };

        const updated = [...programs, newProgram];
        setPrograms(updated);
        localStorage.setItem('zenith_trainer_hyrox_programs', JSON.stringify(updated));

        toast.success(`HYROX Program "${newProgName}" created successfully!`);

        // Reset form
        setNewProgName('');
        setNewProgFocus('');
        setNewProgDesc('');
        setNewProgSchedule([{ day: 'Day 1', workout: '', type: 'Strength' }]);
    };

    // Add Workout Day Input to Form
    const addWorkoutDay = () => {
        const nextDay = `Day ${newProgSchedule.length + 1}`;
        setNewProgSchedule([...newProgSchedule, { day: nextDay, workout: '', type: 'Strength' }]);
    };

    // Remove Workout Day Input from Form
    const removeWorkoutDay = (idx: number) => {
        if (newProgSchedule.length <= 1) return;
        const updated = newProgSchedule.filter((_, i) => i !== idx).map((s, i) => ({
            ...s,
            day: `Day ${i + 1}`
        }));
        setNewProgSchedule(updated);
    };

    const handleWorkoutChange = (idx: number, field: string, val: string) => {
        const updated = [...newProgSchedule];
        updated[idx] = {
            ...updated[idx],
            [field]: val
        };
        setNewProgSchedule(updated);
    };

    // --- Handler to Assign a Program ---
    const handleAssignProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMemberEmail || !selectedProgramId) {
            toast.error('Please select both a member and a program.');
            return;
        }

        const program = programs.find(p => p.id === selectedProgramId);
        if (!program) return;

        // If assigning to Alex Thompson (member@flexgym.com) - sync with active member keys
        if (selectedMemberEmail === 'member@flexgym.com') {
            localStorage.setItem('zenith_hyrox_program_id', selectedProgramId);
            localStorage.removeItem('zenith_hyrox_completed_workouts'); // reset progress
            setAlexProgramId(selectedProgramId);
            setAlexCompletedCount(0);
        } else {
            // Mock assignments for other members
            const updated = {
                ...assignedMemberPrograms,
                [selectedMemberEmail]: selectedProgramId
            };
            setAssignedMemberPrograms(updated);
            localStorage.setItem('zenith_trainer_hyrox_member_assignments', JSON.stringify(updated));
        }

        // Send Notification to Member Alert Center
        addNotification({
            role: 'member',
            category: 'WORKOUT',
            priority: 'high',
            title: '🏆 New HYROX Program Assigned',
            message: `Coach ${user.name} has assigned you to the "${program.name}" program. Check the HYROX Training Hub to view your schedule!`,
            metadata: { programId: selectedProgramId, trainerName: user.name }
        });

        toast.success(`Assigned "${program.name}" to member successfully!`);
        setSelectedMemberEmail('');
        setSelectedProgramId('');
    };

    // Helper to calculate progress percentage
    const getProgressPercent = (done: number, total: number) => {
        if (!total) return 0;
        return Math.round((done / total) * 100);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/5 p-6 md:p-8 rounded-3xl border border-purple-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/35">
                                <Trophy className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                                    HYROX <span className="text-purple-400">Management</span>
                                </h1>
                                <p className="text-slate-400 mt-1 text-sm">
                                    Manage conditioning courses, delegate weekly workouts, and track client athletic progression.
                                </p>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Dashboard Tabs */}
                <Tabs defaultValue="roster" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800 rounded-xl p-1 max-w-lg">
                        <TabsTrigger value="roster" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold rounded-lg text-xs uppercase tracking-wider py-2">Client Roster</TabsTrigger>
                        <TabsTrigger value="programs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold rounded-lg text-xs uppercase tracking-wider py-2">Manage Programs</TabsTrigger>
                        <TabsTrigger value="assign" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold rounded-lg text-xs uppercase tracking-wider py-2">Assign Program</TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Member Tracking & Roster */}
                    <TabsContent value="roster" className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 gap-6">
                            {ROSTER.map((member, i) => {
                                const prog = programs.find(p => p.id === member.programId);
                                const progress = member.programId ? getProgressPercent(member.completedCount, member.totalWorkouts) : 0;
                                
                                return (
                                    <Card key={i} className="bg-slate-900/40 border-slate-800 hover:border-purple-500/20 transition-all duration-300">
                                        <CardHeader className="pb-4">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border border-slate-800">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                        <AvatarFallback className="bg-slate-800 text-slate-300">{member.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-white text-lg">{member.name}</h3>
                                                        <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge className={`px-2.5 py-1 font-bold text-[9px] uppercase tracking-wider ${
                                                        member.programId 
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                        : 'bg-slate-800 text-slate-400 border-white/5'
                                                    }`} variant="outline">
                                                        {prog ? prog.name : 'No Program Active'}
                                                    </Badge>
                                                    {prog && (
                                                        <Badge className="bg-slate-800 text-white font-semibold text-[9px] uppercase tracking-wider border-white/5 px-2.5 py-1">
                                                            {prog.level}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Progress Bar */}
                                            {member.programId ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-slate-450">Program Completion Progress</span>
                                                        <span className="text-purple-400">{progress}% ({member.completedCount}/{member.totalWorkouts} Workouts)</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2 bg-slate-950 [&>div]:bg-purple-500" />
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-xl bg-slate-950/40 text-center border border-dashed border-white/5">
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No active program assigned to this client.</p>
                                                </div>
                                            )}

                                            {/* Personal Bests Block */}
                                            <div className="border-t border-white/5 pt-4">
                                                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-1.5">
                                                    <Award className="w-4 h-4 text-purple-400" /> Member Personal Records (PB)
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex justify-between items-center p-3 bg-slate-950/50 border border-white/5 rounded-xl text-xs">
                                                        <span className="text-slate-450 font-medium">100 Wall Balls (PR)</span>
                                                        <span className="font-mono font-bold text-white">{member.pbs.wallBalls}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-950/50 border border-white/5 rounded-xl text-xs">
                                                        <span className="text-slate-450 font-medium">Sled Push 50m Max Load</span>
                                                        <span className="font-mono font-bold text-white">{member.pbs.sledPush}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-950/50 border border-white/5 rounded-xl text-xs">
                                                        <span className="text-slate-450 font-medium">1000m Concept2 Row</span>
                                                        <span className="font-mono font-bold text-white">{member.pbs.rowSprint}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Workouts Breakdown Checklist if active */}
                                            {prog && (
                                                <div className="border-t border-white/5 pt-4 space-y-3">
                                                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-4 h-4 text-purple-400" /> Workout Schedule Completion Status
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {prog.schedule.map((slot, sIdx) => {
                                                            // For Alex Thompson, check completion
                                                            const isCompleted = member.email === 'member@flexgym.com' 
                                                                ? localStorage.getItem('zenith_hyrox_completed_workouts')?.includes(`"${prog.id}_${sIdx}":true`)
                                                                : sIdx < member.completedCount; // Mock check-off for others
                                                            
                                                            return (
                                                                <div key={sIdx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                                                    isCompleted 
                                                                    ? 'bg-emerald-950/15 border-emerald-500/20 text-emerald-400' 
                                                                    : 'bg-slate-950/50 border-white/5 text-slate-400'
                                                                }`}>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className={`font-bold uppercase tracking-wider text-[10px] ${isCompleted ? 'text-emerald-400' : 'text-purple-400'}`}>{slot.day}</span>
                                                                        <span className="font-medium truncate max-w-[220px] text-white">{slot.workout}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider shrink-0">
                                                                        {isCompleted ? 'Completed ✓' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* TAB 2: Manage Programs */}
                    <TabsContent value="programs" className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Column: Programs Grid */}
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-400" /> Available HYROX Programs
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {programs.map((program) => (
                                        <Card key={program.id} className="bg-slate-900/40 border-slate-800 hover:border-purple-500/20 transition-all flex flex-col h-full overflow-hidden">
                                            <div className="relative h-36 w-full">
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                                                <img src={program.image} alt={program.name} className="object-cover w-full h-full" />
                                                <div className="absolute top-3 left-3 z-20 flex gap-2">
                                                    <Badge className="bg-purple-600 text-white font-bold uppercase text-[9px] tracking-wider border-none px-2.5 py-1">
                                                        {program.level}
                                                    </Badge>
                                                    <Badge className="bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[9px] tracking-wider border border-white/10 px-2.5 py-1">
                                                        {program.duration}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-white text-base leading-snug">{program.name}</h4>
                                                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{program.description}</p>
                                                    <div className="pt-2 flex flex-col gap-1 text-[10px] text-slate-450">
                                                        <div><span className="font-bold text-purple-400 uppercase">Focus:</span> {program.focus}</div>
                                                        <div><span className="font-bold text-purple-400 uppercase">Sessions:</span> {program.frequency}</div>
                                                    </div>
                                                </div>
                                                <div className="border-t border-white/5 pt-3">
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Schedule Overview ({program.schedule.length} Days)</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {program.schedule.map((s, idx) => (
                                                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] text-slate-450 border border-white/5">{s.day}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Create New Program Form */}
                            <div>
                                <Card className="bg-slate-900/40 border-slate-800 sticky top-28">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-purple-400" /> Create New Program
                                        </CardTitle>
                                        <CardDescription>Draft a custom training block for your clients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleCreateProgram} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Program Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newProgName}
                                                    onChange={e => setNewProgName(e.target.value)}
                                                    placeholder="e.g., HYROX Engine Boost"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Level</label>
                                                    <select
                                                        value={newProgLevel}
                                                        onChange={e => setNewProgLevel(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                                    >
                                                        <option value="Beginner">Beginner</option>
                                                        <option value="Intermediate">Intermediate</option>
                                                        <option value="Advanced">Advanced</option>
                                                        <option value="Elite">Elite</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Duration</label>
                                                    <input
                                                        type="text"
                                                        value={newProgDuration}
                                                        onChange={e => setNewProgDuration(e.target.value)}
                                                        placeholder="e.g., 6 Weeks"
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Frequency</label>
                                                    <input
                                                        type="text"
                                                        value={newProgFreq}
                                                        onChange={e => setNewProgFreq(e.target.value)}
                                                        placeholder="e.g., 4 days/week"
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Focus Focus</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={newProgFocus}
                                                        onChange={e => setNewProgFocus(e.target.value)}
                                                        placeholder="e.g., Leg Power"
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</label>
                                                <textarea
                                                    required
                                                    value={newProgDesc}
                                                    onChange={e => setNewProgDesc(e.target.value)}
                                                    rows={2}
                                                    placeholder="Brief program description..."
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none"
                                                />
                                            </div>

                                            {/* Workouts list inputs */}
                                            <div className="space-y-3 border-t border-white/5 pt-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Workouts ({newProgSchedule.length})</label>
                                                    <Button type="button" onClick={addWorkoutDay} variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 hover:bg-purple-500/10 border-slate-800 text-purple-400">
                                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
                                                    </Button>
                                                </div>

                                                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                                                    {newProgSchedule.map((s, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center bg-slate-950/60 p-2.5 rounded-xl border border-white/5 relative">
                                                            <div className="space-y-2 flex-1">
                                                                <div className="flex justify-between gap-2">
                                                                    <span className="text-[9px] font-mono font-bold text-purple-400 uppercase">{s.day}</span>
                                                                    <select
                                                                        value={s.type}
                                                                        onChange={e => handleWorkoutChange(idx, 'type', e.target.value)}
                                                                        className="bg-transparent border border-white/5 rounded text-[9px] text-slate-400 focus:outline-none"
                                                                    >
                                                                        <option value="Strength">Strength</option>
                                                                        <option value="Endurance">Endurance</option>
                                                                        <option value="Simulation">Simulation</option>
                                                                        <option value="Recovery">Recovery</option>
                                                                    </select>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    placeholder="e.g. 5x1km Run + 50m Sled Push"
                                                                    value={s.workout}
                                                                    onChange={e => handleWorkoutChange(idx, 'workout', e.target.value)}
                                                                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none w-full"
                                                                />
                                                            </div>
                                                            {newProgSchedule.length > 1 && (
                                                                <button type="button" onClick={() => removeWorkoutDay(idx)} className="text-slate-500 hover:text-rose-500 transition-colors p-1 shrink-0 mt-3">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase py-2.5 rounded-xl mt-2">
                                                Create Course Plan
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                    </TabsContent>

                    {/* TAB 3: Assign Workout / Program */}
                    <TabsContent value="assign" className="space-y-6 animate-in fade-in duration-300">
                        <div className="max-w-md mx-auto">
                            <Card className="bg-slate-900/40 border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                        <UserCheck className="w-5 h-5 text-purple-400" /> Assign Workout Program
                                    </CardTitle>
                                    <CardDescription>Select a member and prescribe them a structured HYROX training plan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAssignProgram} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Member</label>
                                            <select
                                                required
                                                value={selectedMemberEmail}
                                                onChange={e => setSelectedMemberEmail(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                                            >
                                                <option value="" disabled>-- Choose Client --</option>
                                                {ROSTER.map((m, idx) => (
                                                    <option key={idx} value={m.email}>{m.name} ({m.email})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Program</label>
                                            <select
                                                required
                                                value={selectedProgramId}
                                                onChange={e => setSelectedProgramId(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                                            >
                                                <option value="" disabled>-- Choose Course --</option>
                                                {programs.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.duration} | {p.level})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="p-3 bg-slate-950/45 rounded-xl border border-white/5 text-[11px] text-slate-450 leading-relaxed space-y-1.5">
                                            <p className="font-bold text-slate-300">⚠️ Important Notes:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Assigning a new program resets workout check-off status.</li>
                                                <li>The member is instantly alerted via real-time notifications in their dashboard.</li>
                                            </ul>
                                        </div>

                                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase py-3 rounded-xl shadow-lg shadow-purple-950/10">
                                            Assign Program & Send Alert
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
