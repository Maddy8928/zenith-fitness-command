'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
    ChevronLeft, 
    Waves, 
    Sparkles, 
    Calendar, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    MoreHorizontal,
    Wind,
    Droplets,
    Activity,
    Snowflake,
    HeartPulse,
    Sun,
    Moon,
    Dumbbell,
    UserCheck,
    XCircle,
    ShieldCheck,
    Users,
    Star
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Mock Data ---
const bookingsData = [
    {
        id: 'b1',
        memberId: 1,
        memberName: 'Alex Thompson',
        service: 'Arctic Cryotherapy',
        type: 'tech',
        date: '2026-04-19',
        time: '10:00 AM',
        status: 'Upcoming',
        avatar: 'AT',
        icon: Snowflake
    },
    {
        id: 'b2',
        memberId: 2,
        memberName: 'Jessica Miller',
        service: 'Valkyrie Deep Tissue',
        type: 'massage',
        date: '2026-04-19',
        time: '02:30 PM',
        status: 'Upcoming',
        avatar: 'JM',
        icon: Sparkles
    },
    {
        id: 'b3',
        memberId: 4,
        memberName: 'Lisa Anderson',
        service: 'Kinetic Physiotherapy',
        type: 'physical',
        date: '2026-04-18',
        time: '04:00 PM',
        status: 'Completed',
        avatar: 'LA',
        icon: HeartPulse
    },
    {
        id: 'b4',
        memberId: 1,
        memberName: 'Alex Thompson',
        service: 'Infrared Sauna Elite',
        type: 'thermal',
        date: '2026-04-20',
        time: '11:00 AM',
        status: 'Upcoming',
        avatar: 'AT',
        icon: Sun
    },
    {
        id: 'b5',
        memberId: 3,
        memberName: 'David Garcia',
        service: 'Zero-G Flotation',
        type: 'tech',
        date: '2026-04-21',
        time: '09:00 AM',
        status: 'Upcoming',
        avatar: 'DG',
        icon: Moon
    }
];

export default function WellnessBookingsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { addNotification } = useNotifications();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    // PT Assignment management state
    const [trialRequests, setTrialRequests] = useState<Record<string, any>>({});
    const [ptStatus, setPtStatus] = useState<any>({});
    const [rescheduleTrainerId, setRescheduleTrainerId] = useState<string | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState<string>('Tomorrow, 10:30 AM');
    const [rescheduleTime, setRescheduleTime] = useState<string>('10:30 AM');

    const loadPTData = () => {
        try {
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            const savedPT = localStorage.getItem('zenith_pt_status');
            if (savedTrials) setTrialRequests(JSON.parse(savedTrials));
            if (savedPT) setPtStatus(JSON.parse(savedPT));
        } catch (e) {}
    };

    useEffect(() => {
        loadPTData();
        const handleStorage = () => loadPTData();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleApproveTrialRequest = (trainerId: string) => {
        const saved = localStorage.getItem('zenith_trainer_trials');
        if (!saved) return;
        const trials = JSON.parse(saved);
        if (!trials[trainerId]) return;
        
        trials[trainerId].status = 'approved';
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
        setTrialRequests({ ...trials });

        // Sync PT status
        const savedPT = localStorage.getItem('zenith_pt_status');
        const current = savedPT ? JSON.parse(savedPT) : {};
        const updated = { ...current, trialCompleted: true };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updated));
        setPtStatus(updated);

        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            category: 'MEMBER',
            priority: 'high',
            title: '✅ Trial Session Approved!',
            message: `Your trainer trial session has been approved! Complete your trainer selection and payment to unlock your personalized workouts.`,
        });

        toast.success('Trial session approved! Member notified.');
    };

    const handleRejectTrialRequest = (trainerId: string) => {
        const saved = localStorage.getItem('zenith_trainer_trials');
        if (!saved) return;
        const trials = JSON.parse(saved);
        if (!trials[trainerId]) return;
        
        trials[trainerId].status = 'rejected';
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
        setTrialRequests({ ...trials });
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            category: 'MEMBER',
            priority: 'high',
            title: '❌ Apology: Trial Session Unavailable',
            message: `We sincerely apologize, but your requested trial time with Coach is currently unavailable. Please check the live availability schedule and select another slot.`,
            metadata: {
                type: 'TRIAL_REJECTED',
                trainerId
            }
        });

        toast.info('Trial session declined. Member sent an apology & rebooking notification.');
    };

    const handleClearTrialRequest = (trainerId: string) => {
        const saved = localStorage.getItem('zenith_trainer_trials');
        if (!saved) return;
        const trials = JSON.parse(saved);
        delete trials[trainerId];
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
        setTrialRequests({ ...trials });
        window.dispatchEvent(new Event('storage'));
        toast.success('Cleared from request list');
    };

    const handleRescheduleTrialRequest = () => {
        if (!rescheduleTrainerId) return;
        const saved = localStorage.getItem('zenith_trainer_trials');
        if (!saved) return;
        const trials = JSON.parse(saved);
        if (!trials[rescheduleTrainerId]) return;

        trials[rescheduleTrainerId].status = 'rescheduled';
        trials[rescheduleTrainerId].date = rescheduleDate;
        trials[rescheduleTrainerId].time = rescheduleTime;
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
        setTrialRequests({ ...trials });
        window.dispatchEvent(new Event('storage'));

        const trainerNames: Record<string, string> = {
            'marcus-johnson': 'Marcus Johnson',
            'elena-rostova': 'Elena Rostova',
            'marcus-vance': 'Marcus Vance',
            'sarah-chen': 'Sarah Chen',
            'michael-rivers': 'Michael Rivers',
        };
        const trainerName = trainerNames[rescheduleTrainerId] || rescheduleTrainerId;

        addNotification({
            role: 'member',
            category: 'MEMBER',
            priority: 'high',
            title: '🔄 Trial Session Rescheduled by Coach',
            message: `Coach ${trainerName} has proposed to reschedule your trial session to ${rescheduleDate} at ${rescheduleTime}. Please accept or decline in your Trial Program panel.`,
            metadata: {
                type: 'TRIAL_RESCHEDULED',
                trainerId: rescheduleTrainerId,
                trainerName,
                date: rescheduleDate,
                time: rescheduleTime
            }
        });

        toast.success(`Reschedule proposal sent to member for ${rescheduleDate} at ${rescheduleTime}!`);
        setRescheduleTrainerId(null);
    };

    const handleApprovePTAssignment = () => {
        const saved = localStorage.getItem('zenith_pt_status');
        const current = saved ? JSON.parse(saved) : {};
        const updated = {
            ...current,
            trainerApproved: true,
            approvalDate: new Date().toISOString(),
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updated));
        setPtStatus(updated);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            category: 'MEMBER',
            priority: 'high',
            title: '🎉 Trainer Assignment Approved!',
            message: `Your trainer has approved your personal training assignment. Your My Workouts section is now unlocked — get started today!`,
        });

        toast.success('PT assignment approved! Member\'s workouts are now unlocked!', {
            description: 'You can now create and manage workout plans for this member.'
        });
    };

    const handleApproveDirectPTRequest = () => {
        const saved = localStorage.getItem('zenith_pt_status');
        const current = saved ? JSON.parse(saved) : {};
        const updated = {
            ...current,
            status: 'approved',
            approvalDate: new Date().toISOString(),
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updated));
        setPtStatus(updated);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            userId: '3', // Alex
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '✅ Personal Training Request Approved!',
            message: `Your Personal Training request with ${current.requestedTrainerName || 'your trainer'} has been approved! Please proceed to the Billing section to complete payment and unlock your workouts.`,
        });

        toast.success('PT request approved! Member notified to make payment.');
    };

    const handleDeclineDirectPTRequest = () => {
        localStorage.removeItem('zenith_pt_status');
        setPtStatus({});
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            userId: '3', // Alex
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '❌ Personal Training Request Declined',
            message: `Your Personal Training request was declined. You can select another trainer from the Personal Training section.`,
        });

        toast.info('PT request declined. Member notified.');
    };

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic">Synchronizing Wellness Data...</div>;
    }

    const filteredBookings = bookingsData.filter(booking => {
        const matchesSearch = booking.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             booking.service.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || booking.type === filterType;
        return matchesSearch && matchesType;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Canceled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2 transition-all" asChild>
                        <Link href="/trainer/members">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Roster
                        </Link>
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <header>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent pb-1 italic">
                                WELLNESS <span className="not-italic">BOOKINGS</span>
                            </h1>
                            <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 tracking-wide">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                Monitor spa and recovery sessions for your roster.
                            </p>
                        </header>

                        <div className="flex items-center gap-3 p-1 bg-white/5 rounded-2xl border border-white/10 shadow-soft backdrop-blur-md overflow-x-auto max-w-full">
                            {['all', 'massage', 'tech', 'thermal', 'physical'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter ${filterType === type ? 'bg-blue-600 text-white shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Upcoming Sessions</p>
                                <h3 className="text-4xl font-black text-white">04</h3>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 rounded-[2rem] hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Completed</p>
                                <h3 className="text-4xl font-black text-white">42</h3>
                            </div>
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 rounded-[2rem] hover:border-cyan-500/30 transition-all group overflow-hidden relative">
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Member Requests</p>
                                <h3 className="text-4xl font-black text-white">12</h3>
                            </div>
                            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                <Waves className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">

                    {/* PT Assignment Management Panel */}
                    {(Object.keys(trialRequests).length > 0 || 
                      (ptStatus?.paymentCompleted && !ptStatus?.trainerApproved) || 
                      (ptStatus?.status === 'pending') ||
                      (ptStatus?.status === 'approved' && !ptStatus?.paymentCompleted)) && (
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 via-accent/60 to-transparent" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    Personal Training Requests
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Review and manage member trial requests and PT assignment approvals.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10 space-y-4">

                                {/* Pending Trial Requests */}
                                {Object.entries(trialRequests).filter(([, t]: [string, any]) => t.status === 'pending').map(([trainerId, trial]: [string, any]) => {
                                    const trainerNames: Record<string, string> = {
                                        'marcus-johnson': 'Marcus Johnson',
                                        'sarah-chen': 'Sarah Chen',
                                        'michael-rivers': 'Michael Rivers',
                                    };
                                    return (
                                        <div key={trainerId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-500/20 rounded-xl">
                                                    <Dumbbell className="w-5 h-5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">Trial Request — {trainerNames[trainerId] || trainerId}</p>
                                                    <p className="text-xs text-amber-400/80 mt-0.5">
                                                        <Clock className="w-3 h-3 inline mr-1 animate-pulse" />
                                                        {trial.date} at {trial.time} · Awaiting your approval
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRejectTrialRequest(trainerId)}
                                                    className="border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1.5" /> Decline
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setRescheduleTrainerId(trainerId);
                                                        setRescheduleDate(trial.date || 'Tomorrow, 10:30 AM');
                                                        setRescheduleTime(trial.time || '10:30 AM');
                                                    }}
                                                    className="border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 rounded-xl"
                                                >
                                                    <Clock className="w-4 h-4 mr-1.5" /> Reschedule
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproveTrialRequest(trainerId)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Trial
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Rescheduled Trial Requests — Awaiting Member Response */}
                                {Object.entries(trialRequests).filter(([, t]: [string, any]) => t.status === 'rescheduled').map(([trainerId, trial]: [string, any]) => {
                                    const trainerNames: Record<string, string> = {
                                        'marcus-johnson': 'Marcus Johnson',
                                        'sarah-chen': 'Sarah Chen',
                                        'michael-rivers': 'Michael Rivers',
                                    };
                                    return (
                                        <div key={trainerId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/20 rounded-xl">
                                                    <Clock className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">🔄 Rescheduled Trial — {trainerNames[trainerId] || trainerId}</p>
                                                    <p className="text-xs text-purple-300 mt-0.5">
                                                        Proposed Timing: {trial.date} at {trial.time} · Awaiting Member Acceptance / Rejection
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setRescheduleTrainerId(trainerId);
                                                        setRescheduleDate(trial.date || 'Tomorrow, 10:30 AM');
                                                        setRescheduleTime(trial.time || '10:30 AM');
                                                    }}
                                                    className="border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 rounded-xl"
                                                >
                                                    Reschedule Again
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproveTrialRequest(trainerId)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Directly
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Member Response — Accepted or Declined */}
                                {Object.entries(trialRequests).filter(([, t]: [string, any]) => t.status === 'approved' || t.status === 'rejected').map(([trainerId, trial]: [string, any]) => {
                                    const trainerNames: Record<string, string> = {
                                        'marcus-johnson': 'Marcus Johnson',
                                        'sarah-chen': 'Sarah Chen',
                                        'michael-rivers': 'Michael Rivers',
                                    };
                                    const isApproved = trial.status === 'approved';
                                    return (
                                        <div key={trainerId} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border ${isApproved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${isApproved ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                                    {isApproved ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-rose-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">
                                                        {isApproved ? `✅ Member Accepted Reschedule — ${trainerNames[trainerId] || trainerId}` : `❌ Member Declined Reschedule — ${trainerNames[trainerId] || trainerId}`}
                                                    </p>
                                                    <p className={`text-xs mt-0.5 ${isApproved ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                        {isApproved ? `Confirmed Session: ${trial.date} at ${trial.time} · Ready to train` : `Member declined proposed slot (${trial.date} at ${trial.time})`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                {!isApproved && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setRescheduleTrainerId(trainerId);
                                                            setRescheduleDate(trial.date || 'Tomorrow, 10:30 AM');
                                                            setRescheduleTime(trial.time || '10:30 AM');
                                                        }}
                                                        className="border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 rounded-xl"
                                                    >
                                                        <Clock className="w-4 h-4 mr-1.5" /> Propose New Time
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleClearTrialRequest(trainerId)}
                                                    className="border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                                                >
                                                    Clear Notice
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Direct PT Request (pending approval before payment) */}
                                {ptStatus?.status === 'pending' && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/20 rounded-xl">
                                                <Dumbbell className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Direct PT Request — {ptStatus.requestedTrainerName || 'Marcus Johnson'}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    <Clock className="w-3 h-3 inline mr-1 animate-pulse text-indigo-400" />
                                                    Requested on {ptStatus.requestDate ? new Date(ptStatus.requestDate).toLocaleDateString() : ''} · Awaiting your approval
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleDeclineDirectPTRequest}
                                                className="border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl"
                                            >
                                                <XCircle className="w-4 h-4 mr-1.5" /> Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleApproveDirectPTRequest}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Request
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Direct PT Request Approved (Awaiting Member Payment) */}
                                {ptStatus?.status === 'approved' && !ptStatus?.paymentCompleted && (
                                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                        <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-300">PT Request Approved — Awaiting Payment</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Approved. Member has been notified to complete the ₹9,999 payment.</p>
                                        </div>
                                    </div>
                                )}

                                {/* PT Assignment Approval (after payment) */}
                                {ptStatus?.paymentCompleted && !ptStatus?.trainerApproved && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-xl">
                                                <UserCheck className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">PT Assignment Pending Approval</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    <Star className="w-3 h-3 inline mr-1 text-primary fill-primary" />
                                                    Payment confirmed {ptStatus.paymentDate ? new Date(ptStatus.paymentDate).toLocaleDateString() : ''}. Approve to unlock member's workout section.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleApprovePTAssignment}
                                            className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow hover:brightness-110 self-end sm:self-auto"
                                        >
                                            <ShieldCheck className="w-4 h-4 mr-2" /> Approve PT Assignment
                                        </Button>
                                    </div>
                                )}

                                {ptStatus?.trainerApproved && (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-300">PT Assignment Active</p>
                                            <p className="text-xs text-emerald-400/70 mt-0.5">Approved {ptStatus.approvalDate ? new Date(ptStatus.approvalDate).toLocaleDateString() : ''}. Member's workout section is unlocked.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Find a booking by member name or service..."
                            className="h-14 pl-12 pr-6 bg-slate-900/50 border-slate-800/60 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-2xl backdrop-blur-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Bookings Table/List */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-[2.5rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5">
                                        <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Client & Session</th>
                                        <th className="px-6 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Schedule</th>
                                        <th className="px-6 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-6 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking, idx) => (
                                            <motion.tr 
                                                key={booking.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-slate-800 group-hover:border-blue-500/30 transition-all">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.memberName}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                                            <AvatarFallback className="bg-slate-800">{booking.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-slate-200 text-base">{booking.memberName}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{booking.service}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-200 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> {booking.date}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {booking.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-2 rounded-xl ${booking.type === 'steam' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                            <booking.icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-tighter text-slate-300">{booking.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <Badge variant="outline" className={`font-black text-[10px] uppercase px-3 py-1 rounded-full ${getStatusStyle(booking.status)}`}>
                                                        {booking.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 rounded-full bg-white/5">
                                                        <Search className="w-8 h-8 text-slate-700" />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">No bookings found matching your criteria.</p>
                                                    <Button variant="link" onClick={() => {setSearchQuery(''); setFilterType('all');}} className="text-blue-400 font-bold">Clear all filters</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reschedule Trial Request Modal */}
            <Dialog open={!!rescheduleTrainerId} onOpenChange={(open) => !open && setRescheduleTrainerId(null)}>
                <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-400" />
                            Propose New Trial Session Time
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Select a new date and time slot to propose to the member. They will receive a notification to either accept or decline the updated schedule.
                        </p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                New Date
                            </label>
                            <Input
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                placeholder="e.g. Wed, Apr 23"
                                className="bg-slate-900 border-slate-800 text-white rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                New Time Slot
                            </label>
                            <Input
                                value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                placeholder="e.g. 02:30 PM"
                                className="bg-slate-900 border-slate-800 text-white rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setRescheduleTrainerId(null)}
                            className="border-slate-800 text-slate-400 hover:bg-slate-900 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRescheduleTrialRequest}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                        >
                            Send Reschedule Proposal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
