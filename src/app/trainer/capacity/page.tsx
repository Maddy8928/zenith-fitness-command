'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNotifications } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Users,
    Settings2,
    Lock,
    Megaphone,
    UserX,
    UserCheck,
    Zap,
    Info,
    Calendar,
    Activity
} from 'lucide-react';
import {
    getTrainerCapacity,
    setTrainerCapacity,
    CAPACITY_PRESETS,
    type TrainerCapacity,
    CAPACITY_STORAGE_KEY,
} from '@/lib/trainer-capacity-store';

const SELF_TRAINER_ID = 'marcus-johnson';

export default function TrainerCapacityPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { notifications, addNotification } = useNotifications();

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

    // Sync capacity from localStorage
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === CAPACITY_STORAGE_KEY) {
                setCapacityState(getTrainerCapacity(SELF_TRAINER_ID));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Trainer Capacity...</div>;
    }

    const availableSlots = Math.max(0, capacity.maxClients - capacity.currentClients);
    const atCapacity = capacity.currentClients >= capacity.maxClients;
    const fillPercent = Math.min(100, (capacity.currentClients / Math.max(1, capacity.maxClients)) * 100);
    const circumference = 2 * Math.PI * 50; // r=50 for a slightly larger donut on the dedicated page

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

    const mockClients = [
        { id: 1, name: 'Alex Thompson', goal: 'Weight Loss', activeSince: 'Jan 15, 2026', progress: 75 },
        { id: 2, name: 'Jessica Miller', goal: 'Muscle Gain', activeSince: 'Feb 02, 2026', progress: 40 },
        { id: 3, name: 'David Garcia', goal: 'Endurance', activeSince: 'Feb 28, 2026', progress: 90 },
        { id: 4, name: 'Lisa Anderson', goal: 'Flexibility & Core', activeSince: 'Nov 10, 2025', progress: 25 },
        { id: 5, name: 'Robert Chen', goal: 'General Fitness', activeSince: 'Oct 05, 2025', progress: 15 },
        { id: 6, name: 'Sarah Jenkins', goal: 'Strength', activeSince: 'Mar 12, 2026', progress: 60 },
        { id: 7, name: 'Michael Vance', goal: 'Bodybuilding', activeSince: 'Apr 01, 2026', progress: 85 },
        { id: 8, name: 'Emily White', goal: 'HIIT Performance', activeSince: 'May 20, 2026', progress: 50 },
    ];

    // Filter list up to capacity.currentClients
    const visibleClients = mockClients.slice(0, capacity.currentClients);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Link */}
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
                                Trainer Capacity Management
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Set training limits, manage slots, and send real-time openings broadcast to members.
                            </p>
                        </div>
                    </header>
                </div>

                {/* Main Management Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: capacity donut & limit presets */}
                    <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border-slate-800/60 relative p-6" style={{ borderColor: atCapacity ? 'rgba(239,68,68,0.2)' : capacity.slotsOpen ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.15)' }}>
                        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
                            atCapacity ? 'bg-red-500/10' : capacity.slotsOpen ? 'bg-emerald-500/10' : 'bg-indigo-500/8'
                        }`} />

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-white">Capacity Overview</CardTitle>
                                        <CardDescription>Visual tracker of your personal coaching availability</CardDescription>
                                    </div>
                                </div>

                                <Badge className={`px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-full border ${
                                    atCapacity ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                    capacity.slotsOpen ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' :
                                    'bg-slate-800 border-slate-700 text-slate-400'
                                }`}>
                                    {atCapacity ? 'At Capacity' : capacity.slotsOpen ? 'Slots Open' : 'Accepting Clients'}
                                </Badge>
                            </div>

                            {/* Donut and Statistics Column */}
                            <div className="flex flex-col md:flex-row items-center justify-around gap-4 py-4 bg-slate-950/20 rounded-2xl border border-slate-900">
                                {/* SVG Donut Gauge */}
                                <div className="relative">
                                    <svg width="150" height="150" viewBox="0 0 120 120" className="-rotate-90">
                                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-slate-900" />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            fill="transparent"
                                            stroke={atCapacity ? '#ef4444' : fillPercent > 70 ? '#f59e0b' : '#6366f1'}
                                            strokeWidth="10"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference - (circumference * fillPercent) / 100}
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-3xl font-black ${
                                            atCapacity ? 'text-red-400' : fillPercent > 70 ? 'text-amber-400' : 'text-white'
                                        }`}>{capacity.currentClients}</span>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">/ {capacity.maxClients} Clients</span>
                                    </div>
                                </div>

                                {/* Detailed Count Badges */}
                                <div className="space-y-3 w-full md:w-auto px-4 md:px-0">
                                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 w-36">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Clients Active</p>
                                            <p className="text-2xl font-black text-white mt-1">{capacity.currentClients}</p>
                                        </div>
                                        <div className={`p-4 rounded-xl border w-36 ${
                                            availableSlots === 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Available Slots</p>
                                            <p className="text-2xl font-black mt-1">{availableSlots}</p>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-500">Usage Ratio</span>
                                            <span className={atCapacity ? 'text-red-400' : 'text-indigo-400'}>{Math.round(fillPercent)}%</span>
                                        </div>
                                        <Progress value={fillPercent} className={`h-2 bg-slate-900 ${atCapacity ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-500'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Client limit selector */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-indigo-400" /> Adjust Maximum Limit
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {CAPACITY_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => handleSetMaxClients(preset)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                                                !isCustom && capacity.maxClients === preset
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                                                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-indigo-500/40 hover:text-slate-200'
                                            }`}
                                        >
                                            {preset} Clients
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setIsCustom(v => !v)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                                            isCustom ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        Custom Limit
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isCustom && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden pt-2"
                                        >
                                            <div className="flex gap-2 max-w-sm">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={customMax}
                                                    onChange={e => setCustomMax(e.target.value)}
                                                    placeholder="e.g. 12"
                                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                                />
                                                <Button
                                                    onClick={handleCustomMax}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider text-xs px-5 rounded-xl"
                                                >
                                                    Set Limit
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Simulation controls bottom bar */}
                        <div className="mt-5 pt-4 border-t border-slate-900 space-y-3">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                <Zap className="w-3.5 h-3.5 text-amber-500" /> Client Simulator (For Demo Testing)
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        if (capacity.currentClients > 0) {
                                            updateCapacity({ currentClients: capacity.currentClients - 1, slotsOpen: false });
                                            toast.info('Client slot freed.');
                                        }
                                    }}
                                    disabled={capacity.currentClients === 0}
                                    className="flex-1 py-3 bg-slate-950/40 border border-slate-800 text-slate-400 hover:border-rose-500/20 hover:text-rose-400 transition-all rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                                >
                                    <UserX className="w-4 h-4" /> Remove Active Client
                                </button>
                                <button
                                    onClick={() => {
                                        if (!atCapacity) {
                                            const newCount = capacity.currentClients + 1;
                                            const willBeAtCap = newCount >= capacity.maxClients;
                                            updateCapacity({
                                                currentClients: newCount,
                                                slotsOpen: willBeAtCap ? false : capacity.slotsOpen,
                                            });
                                            if (willBeAtCap) toast.warning('Reached maximum capacity! Slots auto-closed.');
                                            else toast.success('Client added.');
                                        }
                                    }}
                                    disabled={atCapacity}
                                    className="flex-1 py-3 bg-slate-950/40 border border-slate-800 text-slate-400 hover:border-emerald-500/20 hover:text-emerald-400 transition-all rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                                >
                                    <UserCheck className="w-4 h-4" /> Add Active Client
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Right Column: Real-time broadcast and details */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 space-y-6">
                            <div className="space-y-4">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-emerald-400" /> Open Slots Broadcast
                                </CardTitle>
                                <CardDescription>
                                    Advertise your available slots directly to the members' feed in real time.
                                </CardDescription>

                                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-900 text-xs text-slate-400 leading-relaxed space-y-2">
                                    <p className="font-semibold text-slate-300">How it works:</p>
                                    <ul className="list-disc pl-4 space-y-1.5">
                                        <li>Clicking "Open Slots" generates an instant real-time notification to all club members.</li>
                                        <li>Members see your green "Book Now" availability badge and can register immediately.</li>
                                        <li>Once your client count matches your maximum limit, bookings will automatically lock.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4 mt-6">
                                {!capacity.slotsOpen ? (
                                    <button
                                        onClick={handleOpenSlots}
                                        disabled={atCapacity}
                                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 border ${
                                            atCapacity
                                                ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                                                : isBroadcasting
                                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 scale-95'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500/30 text-white hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-lg shadow-emerald-950/20'
                                        }`}
                                    >
                                        {atCapacity ? (
                                            <><Lock className="w-4 h-4" /> At Capacity — Slots Locked</>
                                        ) : isBroadcasting ? (
                                            <><Zap className="w-4 h-4 animate-bounce" /> Broadcasting…</>
                                        ) : (
                                            <><Megaphone className="w-4 h-4" /> Open Slots — Notify Members</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                            <span className="relative flex h-3 w-3 shrink-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                                    Live Broadcast Active
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {availableSlots} slot{availableSlots !== 1 ? 's' : ''} listed on member board
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCloseSlots}
                                            className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-800 bg-slate-950/40 text-slate-400 hover:border-rose-500/30 hover:text-rose-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserX className="w-4 h-4" /> Close Slots Listing
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section: Active Client Capacity Allocation list */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-lg text-white">Active Clients Under Your Capacity</CardTitle>
                        <CardDescription>
                            These clients currently count towards your limit of {capacity.maxClients}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        {visibleClients.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800/50">
                                <Info className="w-8 h-8 text-slate-500" />
                                <p className="text-sm font-semibold text-slate-400">No active clients assigned</p>
                                <p className="text-xs text-slate-500">Add clients using the simulator buttons above.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visibleClients.map((client) => (
                                    <div key={client.id} className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-xl flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-bold uppercase text-sm">
                                                {client.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{client.name}</h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Goal: {client.goal} • Active since: {client.activeSince}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-slate-300">{client.progress}% progress</p>
                                            <Progress value={client.progress} className="h-1 w-16 bg-slate-800 mt-1.5 [&>div]:bg-indigo-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
