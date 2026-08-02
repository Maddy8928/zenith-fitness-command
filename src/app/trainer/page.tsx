'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { useNotifications, formatTimestamp } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    LogOut,
    Users,
    Calendar,
    Activity,
    Bell,
    CheckCheck,
    Trophy,
    Dumbbell,
    MessageSquare,
    TrendingUp,
    Clock,
    MoreHorizontal,
    CheckCircle2,
    Flame,
    ShoppingCart,
    Waves,
    Sparkles,
    Wind,
    Droplets,
    Snowflake,
    HeartPulse,
    Sun,
    Moon,
    Coffee,
    Play,
    Square,
    History,
    Info,
    UserCheck,
    UserX,
    Megaphone,
    Settings2,
    Zap,
    Lock
} from 'lucide-react';
import { useShiftControl } from '@/hooks/useShiftControl';
import { ShiftStatusBadge } from '@/components/shared/ShiftStatusBadge';
import { ShiftControlPanel } from '@/components/shared/ShiftControlPanel';
import {
    getTrainerCapacity,
    setTrainerCapacity,
    CAPACITY_PRESETS,
    type TrainerCapacity,
    CAPACITY_STORAGE_KEY,
} from '@/lib/trainer-capacity-store';

// --- Types removed as they are now in the hook ---

// ─── Trainer ID for capacity (derived from user or fallback) ─────────────────
const SELF_TRAINER_ID = 'marcus-johnson'; // In production, derive from user.id

export default function TrainerDashboard() {
    const { user } = useAuth();
    const [date, setDate] = useState('');
    const [recoveryView, setRecoveryView] = useState<'live' | 'upcoming' | 'completed'>('live');

    // ─── Capacity State ───────────────────────────────────────────────────────
    const [capacity, setCapacityState] = useState<TrainerCapacity>(() => {
        if (typeof window === 'undefined') return { maxClients: 10, currentClients: 8, slotsOpen: false };
        return getTrainerCapacity(SELF_TRAINER_ID);
    });
    const [customMax, setCustomMax] = useState<string>('');
    const [isCustom, setIsCustom] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const updateCapacity = useCallback((data: Partial<TrainerCapacity>) => {
        const updated = setTrainerCapacity(SELF_TRAINER_ID, data);
        setCapacityState(updated);
    }, []);

    // Sync capacity from localStorage (cross-tab or member actions)
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === CAPACITY_STORAGE_KEY) {
                setCapacityState(getTrainerCapacity(SELF_TRAINER_ID));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const availableSlots = Math.max(0, capacity.maxClients - capacity.currentClients);
    const atCapacity = capacity.currentClients >= capacity.maxClients;
    const fillPercent = Math.min(100, (capacity.currentClients / Math.max(1, capacity.maxClients)) * 100);
    const circumference = 2 * Math.PI * 40; // r=40

    const handleSetMaxClients = (val: number) => {
        setIsCustom(false);
        setCustomMax('');
        updateCapacity({ maxClients: val });
    };

    const handleCustomMax = () => {
        const n = parseInt(customMax, 10);
        if (!isNaN(n) && n >= 1 && n <= 100) {
            updateCapacity({ maxClients: n });
            setIsCustom(false);
            toast.success(`Max client limit set to ${n}`);
        } else {
            toast.error('Enter a valid number between 1 and 100');
        }
    };

    const handleOpenSlots = () => {
        if (atCapacity) { toast.error('You are at full capacity. Free a slot first.'); return; }
        if (capacity.slotsOpen) { toast.info('Open Slots already broadcasted.'); return; }
        setIsBroadcasting(true);
        setTimeout(() => setIsBroadcasting(false), 2000);
        const now = new Date().toISOString();
        updateCapacity({ slotsOpen: true, openSlotsTimestamp: now });
        addNotification({
            role: 'member',
            category: 'ANNOUNCEMENT',
            priority: 'high',
            title: '🟢 Personal Training Slots Available!',
            message: `${user?.name || 'Your trainer'} has opened personal training slots — ${availableSlots} spot${availableSlots !== 1 ? 's' : ''} remaining! Book your trial session now.`,
            metadata: {
                type: 'SLOTS_OPEN',
                trainerId: SELF_TRAINER_ID,
                trainerName: user?.name || 'Your Trainer',
                slotsAvailable: availableSlots,
                timestamp: now,
            }
        });
        toast.success('Open Slots broadcast sent to all members!', {
            description: `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} advertised.`
        });
    };

    const handleCloseSlots = () => {
        updateCapacity({ slotsOpen: false, openSlotsTimestamp: undefined });
        toast.info('Open Slots listing closed.');
    };

    const {
        status,
        elapsedTime,
        sessionTime,
        activityLog,
        upcomingShifts,
        performanceScore,
        totalMinutesWorked,
        totalSessionMinutes,
        handleClockIn,
        handleClockOut,
        handleStartBreak,
        handleEndBreak,
        handleStartSession: originalHandleStartSession,
        handleEndSession: originalHandleEndSession
    } = useShiftControl('trainer');

    const { notifications, addNotification, markAsRead, updateNotificationMetadata } = useNotifications();

    const trainerNotifications = notifications.filter(
        n => n.role === 'trainer'
    );
    const unreadTrainerCount = trainerNotifications.filter(n => !n.isRead).length;

    const lastNotifCountRef = useRef(trainerNotifications.length);

    useEffect(() => {
        setDate(new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()));
    }, []);

    useEffect(() => {
        if (trainerNotifications.length > lastNotifCountRef.current) {
            const newNotif = trainerNotifications[0];
            // Only trigger toast for recently created unread notifications (within last 5 seconds)
            if (newNotif && !newNotif.isRead && (Date.now() - new Date(newNotif.timestamp).getTime() < 5000)) {
                toast.info(newNotif.title, {
                    description: newNotif.message,
                    action: {
                        label: "Mark Read",
                        onClick: () => markAsRead(newNotif.id)
                    }
                });
            }
        }
        lastNotifCountRef.current = trainerNotifications.length;
    }, [trainerNotifications, markAsRead]);

    const handleStartSession = (client: string) => {
        originalHandleStartSession(client);
        addNotification({
            role: 'trainer',
            category: 'STAFF',
            title: 'Session Started',
            message: `You are now in a session with ${client}. Timer active.`
        });
    };

    const handleEndSession = () => {
        originalHandleEndSession();
        addNotification({
            role: 'trainer',
            category: 'STAFF',
            title: 'Session Completed',
            message: `Session has been logged successfully. Great work!`
        });
    };

    useEffect(() => {
        // Simulate upcoming session notification
        const timer = setTimeout(() => {
            addNotification({
                role: 'trainer',
                category: 'STAFF',
                title: 'Upcoming Session',
                message: 'Your session with Michael Chen starts in 15 minutes.'
            });
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleApproveTrial = (notification: any) => {
        const { trainerId, trainerName, memberEmail, memberName, date, time } = notification.metadata || {};
        
        if (!trainerId) return;

        // 1. Update notification metadata status
        updateNotificationMetadata(notification.id, { status: 'approved' });
        
        // 2. Mark this notification as read
        markAsRead(notification.id);

        // 3. Update localStorage 'zenith_trainer_trials'
        const savedTrials = localStorage.getItem('zenith_trainer_trials');
        if (savedTrials) {
            try {
                const trials = JSON.parse(savedTrials);
                if (trials[trainerId]) {
                    trials[trainerId].status = 'approved';
                    localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                    
                    // Dispatch storage event so other tabs/components update
                    window.dispatchEvent(new Event('storage'));
                }
            } catch (e) {
                console.error("Failed to approve trial in localStorage", e);
            }
        }

        // 4. Send notification to the member
        addNotification({
            role: 'member',
            category: 'MEMBER',
            priority: 'high',
            title: '✅ Trial Session Approved',
            message: `Your trial session request with ${trainerName} on ${date} at ${time} has been approved!`,
            metadata: {
                type: 'TRIAL_APPROVED',
                trainerId,
                trainerName,
                date,
                time
            }
        });

        toast.success(`Trial request approved for ${memberName}!`);
    };

    const handleRejectTrial = (notification: any) => {
        const { trainerId, trainerName, memberEmail, memberName, date, time } = notification.metadata || {};
        
        if (!trainerId) return;

        // 1. Update notification metadata status
        updateNotificationMetadata(notification.id, { status: 'rejected' });
        
        // 2. Mark this notification as read
        markAsRead(notification.id);

        // 3. Update localStorage 'zenith_trainer_trials'
        const savedTrials = localStorage.getItem('zenith_trainer_trials');
        if (savedTrials) {
            try {
                const trials = JSON.parse(savedTrials);
                if (trials[trainerId]) {
                    trials[trainerId].status = 'rejected';
                    localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                    
                    // Dispatch storage event so other tabs/components update
                    window.dispatchEvent(new Event('storage'));
                }
            } catch (e) {
                console.error("Failed to reject trial in localStorage", e);
            }
        }

        // 4. Send notification to the member
        addNotification({
            role: 'member',
            category: 'MEMBER',
            priority: 'high',
            title: '❌ Trial Session Declined',
            message: `Your trial session request with ${trainerName} on ${date} at ${time} was declined. You can apply for another trainer.`,
            metadata: {
                type: 'TRIAL_REJECTED',
                trainerId,
                trainerName,
                date,
                time
            }
        });

        toast.error(`Trial request declined for ${memberName}.`);
    };

    const todaySessions = [
        { id: 1, client: 'Sarah Johnson', time: '09:00 AM', type: 'Weight Training', status: 'completed' },
        { id: 2, client: 'Michael Chen', time: '11:30 AM', type: 'HIIT Session', status: 'upcoming' },
        { id: 3, client: 'Emma Davis', time: '02:00 PM', type: 'Form Assessment', status: 'upcoming' },
        { id: 4, client: 'James Wilson', time: '04:30 PM', type: 'Strength & Conditioning', status: 'upcoming' },
    ];

    const clientProgress = [
        { id: 1, name: 'Alex Thompson', goal: 'Weight Loss', progress: 75, lastActive: '2 hours ago', avatar: 'AT' },
        { id: 2, name: 'Jessica Miller', goal: 'Muscle Gain', progress: 40, lastActive: '5 hours ago', avatar: 'JM' },
        { id: 3, name: 'David Garcia', goal: 'Endurance', progress: 90, lastActive: 'Yesterday', avatar: 'DG' },
        { id: 4, name: 'Lisa Anderson', goal: 'Flexibility', progress: 25, lastActive: '2 days ago', avatar: 'LA' },
    ];

    const upcomingRecovery = [
        { id: 1, client: 'Alex Thompson', service: 'Arctic Cryotherapy', time: '10:00 AM', type: 'tech', icon: Snowflake, status: 'live', progress: 65 },
        { id: 2, client: 'Jessica Miller', service: 'Valkyrie Deep Tissue', time: '02:30 PM', type: 'massage', icon: Sparkles, status: 'upcoming' },
        { id: 3, client: 'Sarah Johnson', service: 'Infrared Sauna Elite', time: '04:00 PM', type: 'thermal', icon: Sun, status: 'upcoming' },
        { id: 4, client: 'Michael Chen', service: 'Kinetic Physiotherapy', time: 'Yesterday', type: 'physical', icon: HeartPulse, status: 'completed' },
        { id: 5, client: 'James Wilson', service: 'Zero-G Flotation', time: '06:00 PM', type: 'tech', icon: Moon, status: 'upcoming' },
    ];

    return (
        <div className="space-y-8">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent pb-1">
                            Trainer Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {date} • Welcome back, {user?.name || 'Trainer'}
                        </p>
                    </div>
                    
                    <ShiftStatusBadge status={status} elapsedTime={elapsedTime} themeColor="blue" />
                </div>

                <div className="flex items-center gap-3">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-cyan-900/20" asChild>
                        <Link href="/trainer/plans/builder">
                            <Dumbbell className="w-4 h-4 mr-2" /> New Plan
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-blue-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardDescription className="text-slate-400 font-medium">Active Clients</CardDescription>
                                <CardTitle className="text-3xl font-bold text-white mt-1">24</CardTitle>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                            <span className="text-emerald-400 font-medium">+3</span>
                            <span className="text-slate-500 ml-2">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-cyan-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardDescription className="text-slate-400 font-medium">Today's Sessions</CardDescription>
                                <CardTitle className="text-3xl font-bold text-white mt-1">5</CardTitle>
                            </div>
                            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            <span className="text-cyan-400 font-medium">3 remaining</span>
                            <span className="text-slate-500 ml-2">2 completed</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-blue-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardDescription className="text-slate-400 font-medium">Session Efficiency</CardDescription>
                                <CardTitle className="text-3xl font-bold text-white mt-1">{performanceScore}%</CardTitle>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            <span className="text-blue-400 font-medium">{totalSessionMinutes} mins</span>
                            <span className="text-slate-500 ml-2">coached today</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Schedule & Actions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" className="flex-1 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-12" asChild>
                            <Link href="/trainer/plans">
                                <Dumbbell className="w-4 h-4 mr-2 text-blue-400" />
                                Workout & Diet Plans
                            </Link>
                        </Button>
                        <Button variant="outline" className="flex-1 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-12" asChild>
                            <Link href="/trainer/members">
                                <Users className="w-4 h-4 mr-2 text-cyan-400" />
                                My Members
                            </Link>
                        </Button>
                        <Button variant="outline" className="flex-1 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-12" asChild>
                            <Link href="/trainer/messages">
                                <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                                Messages
                            </Link>
                        </Button>
                        <Button variant="outline" className="flex-1 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-12" asChild>
                            <Link href="/trainer/members/bookings">
                                <Waves className="w-4 h-4 mr-2 text-cyan-400" />
                                Wellness Bookings
                            </Link>
                        </Button>
                        <Button variant="outline" className="flex-1 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-12" asChild>
                            <Link href="/trainer/hyrox">
                                <Trophy className="w-4 h-4 mr-2 text-orange-500 fill-orange-500/20 animate-pulse" />
                                HYROX Management
                            </Link>
                        </Button>
                    </div>

                    {/* Today's Schedule */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl text-white">Today's Schedule</CardTitle>
                                <CardDescription>You have {todaySessions.filter(s => s.status === 'upcoming').length} upcoming sessions</CardDescription>
                            </div>
                            <Link href="/trainer/attendance">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                                    Mark Check-ins
                                </Badge>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mt-4">
                                {todaySessions.map((session) => (
                                    <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl border ${session.status === 'completed' ? 'bg-slate-950/50 border-slate-800/50 opacity-70' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${session.status === 'completed' ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {session.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-200">{session.client}</h4>
                                                <div className="flex items-center text-sm text-slate-400 mt-1 gap-2">
                                                    <span>{session.time}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-300">{session.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {session.status === 'upcoming' && (
                                                <Button size="sm" variant="ghost" className="hover:bg-slate-700 text-slate-300">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wellness & Recovery Section - ENHANCED MONITORING */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 overflow-hidden relative border-cyan-500/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                        <Waves className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">SPA <span className="not-italic text-cyan-400">&</span> RECOVERY</CardTitle>
                                </div>
                                <CardDescription className="font-medium tracking-wide">Monitoring wellness sessions for your assigned members</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                                {(['live', 'upcoming', 'completed'] as const).map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setRecoveryView(view)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${recoveryView === view ? 'bg-cyan-500 text-black shadow-glow' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {view}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                                <div className="lg:col-span-3">
                                    <div className="space-y-3">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={recoveryView}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                            >
                                                {upcomingRecovery.filter(b => b.status === recoveryView).length > 0 ? (
                                                    upcomingRecovery.filter(b => b.status === recoveryView).map((booking) => (
                                                        <div key={booking.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50 hover:border-cyan-500/30 transition-all group overflow-hidden relative">
                                                            <div className="flex items-center gap-4 relative z-10">
                                                                <div className="relative">
                                                                    <div className={`p-4 rounded-xl ${
                                                                        booking.type === 'tech' ? 'bg-cyan-500/10 text-cyan-400' : 
                                                                        booking.type === 'thermal' ? 'bg-orange-500/10 text-orange-400' :
                                                                        booking.type === 'physical' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                        booking.type === 'massage' ? 'bg-blue-500/10 text-blue-400' :
                                                                        'bg-slate-500/10 text-slate-400'}`}>
                                                                        <booking.icon className="w-6 h-6" />
                                                                    </div>
                                                                    {booking.status === 'live' && (
                                                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${booking.type === 'tech' ? 'bg-cyan-400' : 'bg-blue-500'}`}></span>
                                                                            <span className={`relative inline-flex rounded-full h-3 w-3 ${booking.type === 'tech' ? 'bg-cyan-500' : 'bg-blue-500'}`}></span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-black text-slate-100 truncate text-lg">{booking.client}</h4>
                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{booking.service}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {booking.status === 'live' && (
                                                                <div className="mt-4 space-y-1.5">
                                                                    <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest ${booking.type === 'tech' ? 'text-cyan-400' : 'text-blue-400'}`}>
                                                                        <span>Session Progress</span>
                                                                        <span>{booking.progress}%</span>
                                                                    </div>
                                                                    <Progress value={booking.progress} className={`h-1 bg-slate-800 ${booking.type === 'tech' ? '[&>div]:bg-cyan-400 [&>div]:shadow-glow' : '[&>div]:bg-blue-500'}`} />
                                                                </div>
                                                            )}

                                                            {booking.status === 'upcoming' && (
                                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {booking.time}
                                                                    </div>
                                                                    <div className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                                                                        booking.type === 'tech' ? 'border-cyan-500/20 text-cyan-500' : 
                                                                        booking.type === 'thermal' ? 'border-orange-500/20 text-orange-500' :
                                                                        booking.type === 'physical' ? 'border-emerald-500/20 text-emerald-500' :
                                                                        'border-blue-500/20 text-blue-500'}`}>
                                                                        {booking.type}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-4 bg-slate-950/20 rounded-3xl border border-dashed border-white/5">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                            <Activity className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No {recoveryView} sessions</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                                
                                <div className="glass-card rounded-2xl p-5 border-white/5 flex flex-col justify-between bg-gradient-to-br from-cyan-500/5 to-transparent">
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Team Recovery Score
                                        </h5>
                                        <div className="text-center py-4">
                                            <div className="inline-flex relative items-center justify-center">
                                                <svg className="w-24 h-24 transform -rotate-90">
                                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * 78) / 100} className="text-cyan-400 drop-shadow-glow" />
                                                </svg>
                                                <span className="absolute text-2xl font-black text-white">78%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase text-center leading-relaxed">
                                            Client compliance is <span className="text-emerald-400">up 12%</span> this week
                                        </p>
                                        <Link href="/trainer/members/bookings">
                                            <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase text-[10px] tracking-widest h-10 mt-2 rounded-xl">
                                                Global Monitor
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Progress & Shift Management */}
                <div className="space-y-8">
                    
                    {/* Attendance & Break Management - NEW SYSTEM */}
                    <ShiftControlPanel 
                        status={status}
                        elapsedTime={elapsedTime}
                        sessionTime={sessionTime}
                        activityLog={activityLog}
                        upcomingShifts={upcomingShifts}
                        performanceScore={performanceScore}
                        totalMinutesWorked={totalMinutesWorked}
                        handleClockIn={handleClockIn}
                        handleClockOut={handleClockOut}
                        handleStartBreak={handleStartBreak}
                        handleEndBreak={handleEndBreak}
                        handleStartSession={handleStartSession}
                        handleEndSession={handleEndSession}
                        themeColor="blue"
                        userName={user?.name}
                        role="trainer"
                    />


                </div>

            </div>
        </div>
    );
}
