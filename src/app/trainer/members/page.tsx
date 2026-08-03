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
import { Progress } from '@/components/ui/progress';
import {
    Search,
    Filter,
    UserPlus,
    ChevronLeft,
    Mail,
    Phone,
    MoreVertical,
    Activity,
    Calendar,
    Target,
    Dumbbell,
    Flame,
    Users,
    Sparkles
} from 'lucide-react';

export default function MembersPanel() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    const defaultMembers = [
        {
            id: 1,
            name: 'Alex Thompson',
            email: 'alex.t@example.com',
            phone: '+1 (555) 123-4567',
            status: 'Active',
            goal: 'Weight Loss',
            progress: 75,
            workoutPlan: 'HIIT Fundamentals',
            dietPlan: 'Shred & Tone (Keto)',
            lastCheckIn: '2 days ago',
            joinDate: 'Jan 15, 2026',
            avatar: 'AT'
        },
        {
            id: 2,
            name: 'Jessica Miller',
            email: 'j.miller@example.com',
            phone: '+1 (555) 987-6543',
            status: 'Active',
            goal: 'Muscle Gain',
            progress: 40,
            workoutPlan: 'Powerbuilding V2',
            dietPlan: 'Muscle Builder Pro',
            lastCheckIn: 'Today',
            joinDate: 'Feb 02, 2026',
            avatar: 'JM'
        },
        {
            id: 3,
            name: 'David Garcia',
            email: 'david.g88@example.com',
            phone: '+1 (555) 456-7890',
            status: 'Pending',
            goal: 'Endurance',
            progress: 0,
            workoutPlan: 'Marathon Prep',
            dietPlan: 'High Carb Performance',
            lastCheckIn: 'Never',
            joinDate: 'Feb 28, 2026',
            avatar: 'DG'
        },
        {
            id: 4,
            name: 'Lisa Anderson',
            email: 'lisa.anderson@example.com',
            phone: '+1 (555) 222-3333',
            status: 'Active',
            goal: 'Flexibility & Core',
            progress: 90,
            workoutPlan: 'Yoga & Pilates Mix',
            dietPlan: 'Plant-Based Power',
            lastCheckIn: 'Yesterday',
            joinDate: 'Nov 10, 2025',
            avatar: 'LA'
        },
        {
            id: 5,
            name: 'Robert Chen',
            email: 'r.chen@example.com',
            phone: '+1 (555) 888-9999',
            status: 'Inactive',
            goal: 'General Fitness',
            progress: 15,
            workoutPlan: 'Beginner Full Body',
            dietPlan: 'Balanced Macros',
            lastCheckIn: '3 weeks ago',
            joinDate: 'Oct 05, 2025',
            avatar: 'RC'
        }
    ];

    const [members, setMembers] = useState(defaultMembers);

    useEffect(() => {
        const loadMembers = () => {
            try {
                const saved = localStorage.getItem('zenith_trainer_members');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const merged = [
                        ...parsed,
                        ...defaultMembers.filter(dm => !parsed.some((p: any) => p.email === dm.email))
                    ];
                    setMembers(merged);
                } else {
                    setMembers(defaultMembers);
                }
            } catch (e) {}
        };
        loadMembers();
        window.addEventListener('storage', loadMembers);
        return () => window.removeEventListener('storage', loadMembers);
    }, []);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Members...</div>;
    }

    const clientProgress = [
        { id: 1, name: 'Alex Thompson', goal: 'Weight Loss', progress: 75, lastActive: '2 hours ago', avatar: 'AT' },
        { id: 2, name: 'Jessica Miller', goal: 'Muscle Gain', progress: 40, lastActive: '5 hours ago', avatar: 'JM' },
        { id: 3, name: 'David Garcia', goal: 'Endurance', progress: 90, lastActive: 'Yesterday', avatar: 'DG' },
        { id: 4, name: 'Lisa Anderson', goal: 'Flexibility', progress: 25, lastActive: '2 days ago', avatar: 'LA' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header & Navigation */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent pb-1">
                                Client Roster
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Manage your assigned members and track their progress.
                            </p>
                        </div>

                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-900/20 px-6 h-12 rounded-xl text-lg font-medium">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Invite Client
                        </Button>
                    </header>
                </div>

                {/* Dashboard KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                            <p className="text-2xl font-bold text-white mt-1">24</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Active</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">19</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Pending</p>
                            <p className="text-2xl font-bold text-amber-400 mt-1">3</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Inactive</p>
                            <p className="text-2xl font-bold text-slate-400 mt-1">2</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
                            <UserPlus className="w-5 h-5" />
                        </div>
                    </Card>
                </div>

                {/* Main Section: Roster on the Left, Client Progress on the Right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Search & Members Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    placeholder="Search clients by name, email, or goal..."
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="h-12 px-6 bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                                    <Filter className="w-5 h-5 mr-2" />
                                    Status
                                </Button>
                                <Tabs defaultValue="grid" className="h-12 border border-slate-800 rounded-xl bg-slate-900/50 p-1 flex">
                                    <TabsList className="bg-transparent gap-1 h-full w-full">
                                        <TabsTrigger value="grid" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white h-full px-4 rounded-lg">Grid</TabsTrigger>
                                        <TabsTrigger value="list" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white h-full px-4 rounded-lg">List</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* Members Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {members.map((member) => (
                                <Card key={member.id} className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-blue-500/30 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                                    <CardHeader className="pb-4 relative">
                                        <div className="absolute top-0 right-0 p-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-16 w-16 border-2 border-slate-800 group-hover:border-blue-500/50 transition-colors bg-slate-950">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                <AvatarFallback className="bg-slate-800 text-lg">{member.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div className="pt-1">
                                                <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {member.name}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Badge variant="outline" className={`font-medium px-2 py-0 ${getStatusStyle(member.status)}`}>
                                                        {member.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-grow pb-4 space-y-5">
                                        {/* Contact Info */}
                                        <div className="space-y-2 text-sm text-slate-400">
                                            <div className="flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer w-fit">
                                                <Mail className="w-4 h-4 text-slate-500" /> {member.email}
                                            </div>
                                            <div className="flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer w-fit">
                                                <Phone className="w-4 h-4 text-slate-500" /> {member.phone}
                                            </div>
                                        </div>

                                        {/* Goals & Plans */}
                                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-slate-400 text-sm font-medium flex items-center">
                                                    <Target className="w-4 h-4 mr-1.5 text-blue-400" /> Target Goal
                                                </span>
                                                <span className="font-semibold text-white text-sm">{member.goal}</span>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-500">Overall Progress</span>
                                                    <span className={member.progress > 70 ? 'text-emerald-400 font-medium' : member.progress > 30 ? 'text-blue-400 font-medium' : 'text-amber-400 font-medium'}>{member.progress}%</span>
                                                </div>
                                                <Progress
                                                    value={member.progress}
                                                    className={`h-1.5 bg-slate-800 [&>div]:bg-gradient-to-r ${member.progress > 70 ? '[&>div]:from-emerald-500 [&>div]:to-emerald-400' :
                                                        member.progress > 30 ? '[&>div]:from-blue-500 [&>div]:to-cyan-500' :
                                                            '[&>div]:from-amber-500 [&>div]:to-amber-500'
                                                        }`}
                                                />
                                            </div>

                                            <div className="pt-3 border-t border-slate-800/50 space-y-2">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <Dumbbell className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Workout Plan</p>
                                                        <p className="text-slate-200 font-medium truncate">{member.workoutPlan}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2 text-sm">
                                                    <Flame className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Diet Plan</p>
                                                        <p className="text-emerald-400 font-medium truncate">{member.dietPlan}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-slate-800/50 bg-slate-900/20 flex gap-3">
                                        <Button variant="outline" className="flex-1 bg-slate-900/50 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800" asChild>
                                            <Link href="/trainer/messages">
                                                Message
                                            </Link>
                                        </Button>
                                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20" asChild>
                                            <Link href="/trainer/members/bookings">
                                                View Bookings
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Client Progress */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 space-y-6">
                            <CardHeader className="p-0">
                                <CardTitle className="text-xl text-white">Client Progress</CardTitle>
                                <CardDescription className="text-xs">Recent activity and milestone tracking</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 pt-2">
                                <Tabs defaultValue="all" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md transition-all text-xs">All Active</TabsTrigger>
                                        <TabsTrigger value="needs_attention" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md transition-all text-xs">Needs Attention</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="mt-6 space-y-6">
                                        {clientProgress.map((client) => (
                                            <div key={client.id} className="space-y-3 group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border border-slate-700">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                            <AvatarFallback className="bg-slate-800 text-slate-300">{client.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h5 className="font-semibold text-slate-200 text-sm group-hover:text-blue-400 transition-colors">{client.name}</h5>
                                                            <p className="text-xs text-slate-500">{client.goal}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-normal text-xs">
                                                        {client.progress}%
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Progress
                                                        value={client.progress}
                                                        className={`h-1.5 bg-slate-800 [&>div]:bg-gradient-to-r ${client.progress > 70 ? '[&>div]:from-emerald-500 [&>div]:to-emerald-400' :
                                                            client.progress > 40 ? '[&>div]:from-blue-500 [&>div]:to-cyan-500' :
                                                                '[&>div]:from-amber-500 [&>div]:to-amber-500'
                                                            }`}
                                                    />
                                                    <p className="text-[10px] text-slate-500 text-right">Last active: {client.lastActive}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="needs_attention" className="mt-6">
                                        <div className="text-center py-8 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-950/20 rounded-2xl border border-dashed border-slate-800/50">
                                            No clients need immediate attention.
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
