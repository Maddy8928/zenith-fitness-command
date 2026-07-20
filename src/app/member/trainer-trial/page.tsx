"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Star, 
    CheckCircle2, 
    Dumbbell,
    Activity,
    Shield,
    Clock,
    Check,
    Info,
    CalendarCheck,
    Award,
    XCircle,
    Lock,
    Zap,
    Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import {
    getTrainerCapacity,
    CAPACITY_STORAGE_KEY,
    type TrainerCapacity,
} from "@/lib/trainer-capacity-store";

// Helper: sync PT status flags from localStorage data
const syncPTStatus = () => {
    try {
        const savedBookings = localStorage.getItem('zenith_trainer_trials');
        const savedPreferred = localStorage.getItem('zenith_preferred_trainer_id');
        const savedPT = localStorage.getItem('zenith_pt_status');
        const current = savedPT ? JSON.parse(savedPT) : {};

        let trialCompleted = current.trialCompleted || false;
        if (savedBookings) {
            const bookings = JSON.parse(savedBookings);
            trialCompleted = Object.values(bookings).some((t: any) => t.status === 'approved');
        }

        const trainerSelected = !!savedPreferred;

        const updated = {
            ...current,
            trialCompleted,
            trainerSelected,
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error('Failed to sync PT status', e);
    }
};

const TRAINERS = [
    {
        id: 'marcus-johnson',
        name: 'Marcus Johnson',
        role: 'Head of Strength & Conditioning',
        bio: 'Former Olympic weightlifter with 12+ years of experience specialized in functional hypertrophy and raw power development.',
        longBio: 'Marcus has spent over a decade training elite athletes and everyday fitness enthusiasts alike. Having competed at national levels in Olympic weightlifting, he brings a scientific yet practical approach to raw power development, barbell mechanics, and muscle hypertrophy. He believes in building a resilient foundation first.',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
        icon: Dumbbell,
        specialties: ['Powerlifting', 'Strength Training', 'Bodybuilding'],
        certifications: ['CSCS (Certified Strength & Conditioning Specialist)', 'USAW Level 2 Coach', 'Precision Nutrition L1'],
        rating: 4.9,
        experience: '12+ Years',
    },
    {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        role: 'HIIT Specialist',
        bio: 'Sarah combines high-intensity interval training with functional movements. Her classes are known for explosive energy and rapid conditioning.',
        longBio: 'Sarah is a high-energy conditioning specialist who focuses on cardiovascular capacity, speed, and endurance. With a background in track & field, she designs fat-burning, high-tempo workouts that challenge your mental toughness and physique. Her sessions are intense, dynamic, and result-driven.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
        icon: Activity,
        specialties: ['HIIT', 'Cardio Conditioning', 'Core Strength'],
        certifications: ['NASM CPT (Certified Personal Trainer)', 'FMS Level 1 (Functional Movement Screen)', 'HIIT Performance Certificate'],
        rating: 4.8,
        experience: '8 Years',
    },
    {
        id: 'michael-rivers',
        name: 'Michael Rivers',
        role: 'Recovery & Mobility Specialist',
        bio: 'Former physical therapist assistant specializing in injury prevention, joint mobility, and athletic recovery protocols.',
        longBio: 'Michael believes that longevity is the key to fitness. With professional experience in orthopedic recovery, he coaches body awareness, myofascial release, joint mobility, and posture correction. Whether you are recovering from an injury or trying to enhance movement efficiency, Michael provides a custom recovery approach.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        icon: Shield,
        specialties: ['Mobility', 'Injury Prevention', 'Active Recovery'],
        certifications: ['PTA (Physical Therapist Assistant)', 'FRCms (Functional Range Conditioning)', 'TriggerPoint Therapy L2'],
        rating: 4.9,
        experience: '10 Years',
    }
];

export default function TrainerTrialPage() {
    const { user: currentUser } = useAuth();
    const { addNotification } = useNotifications();

    const [preferredTrainerId, setPreferredTrainerId] = useState<string | null>(null);
    const [bookedTrials, setBookedTrials] = useState<Record<string, { date: string, time: string, status?: 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'completed' }>>({});
    
    const [activeProfileTrainer, setActiveProfileTrainer] = useState<typeof TRAINERS[0] | null>(null);
    const [activeBookingTrainer, setActiveBookingTrainer] = useState<typeof TRAINERS[0] | null>(null);
    
    const [bookingDateIdx, setBookingDateIdx] = useState<number>(0);
    const [bookingTime, setBookingTime] = useState<string | null>(null);

    // ─── Trainer Capacity State ───────────────────────────────────────────────
    const [trainerCapacities, setTrainerCapacities] = useState<Record<string, TrainerCapacity>>(() => {
        if (typeof window === 'undefined') return {};
        const result: Record<string, TrainerCapacity> = {};
        TRAINERS.forEach(t => { result[t.id] = getTrainerCapacity(t.id); });
        return result;
    });

    // Load persisted state and listen to storage changes for real-time synchronization
    useEffect(() => {
        const savedPreferred = localStorage.getItem('zenith_preferred_trainer_id');
        if (savedPreferred) {
            setPreferredTrainerId(savedPreferred);
        }

        const loadBookings = () => {
            const savedBookings = localStorage.getItem('zenith_trainer_trials');
            if (savedBookings) {
                try {
                    const parsed = JSON.parse(savedBookings);
                    setBookedTrials(parsed);
                    // Re-sync PT status whenever bookings update (e.g. trainer approved)
                    syncPTStatus();
                } catch (e) {
                    console.error("Failed to parse trainer trials", e);
                }
            } else {
                setBookedTrials({});
            }
        };

        const loadCapacities = () => {
            const caps: Record<string, TrainerCapacity> = {};
            TRAINERS.forEach(t => { caps[t.id] = getTrainerCapacity(t.id); });
            setTrainerCapacities(caps);
        };

        loadBookings();
        loadCapacities();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'zenith_trainer_trials') {
                loadBookings();
            }
            if (e.key === 'zenith_preferred_trainer_id') {
                setPreferredTrainerId(e.newValue);
                syncPTStatus();
            }
            if (e.key === CAPACITY_STORAGE_KEY) {
                loadCapacities();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const bookingDates = Array.from({ length: 3 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Tomorrow and onwards
        return {
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            formatted: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };
    });

    const bookingTimeSlots = [
        '09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
    ];

    const handleSetPreferred = (trainerId: string, trainerName: string) => {
        setPreferredTrainerId(trainerId);
        localStorage.setItem('zenith_preferred_trainer_id', trainerId);

        // Sync PT status — trainer selected
        syncPTStatus();

        // Send real-time notification to selected trainer's portal
        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'medium',
            title: '⭐ Preferred Coach Selected',
            message: `${currentUser?.name || 'Alex'} (${currentUser?.email || 'member@flexgym.com'}) has set you as their preferred coach.`,
            metadata: { trainerId, trainerName, memberEmail: currentUser?.email }
        });

        toast.success(`${trainerName} set as preferred coach!`, {
            description: "They will be prioritized for your personal training recommendations."
        });
    };

    const handleOpenBooking = (trainer: typeof TRAINERS[0]) => {
        setActiveBookingTrainer(trainer);
        setBookingDateIdx(0);
        setBookingTime(null);
    };

    const handleConfirmBooking = () => {
        if (!activeBookingTrainer || !bookingTime) return;

        const newBookings = {
            ...bookedTrials,
            [activeBookingTrainer.id]: {
                date: bookingDates[bookingDateIdx].formatted,
                time: bookingTime,
                status: 'pending' as const
            }
        };

        setBookedTrials(newBookings);
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(newBookings));
        
        // Sync PT status after booking change
        syncPTStatus();

        // Send real-time notification to selected trainer's portal
        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '📅 Trial Session Request',
            message: `${currentUser?.name || 'Alex'} (${currentUser?.email || 'member@flexgym.com'}) has requested a trial session with you for ${bookingDates[bookingDateIdx].formatted} at ${bookingTime}.`,
            metadata: {
                type: 'TRIAL_REQUEST',
                trainerId: activeBookingTrainer.id,
                trainerName: activeBookingTrainer.name,
                memberEmail: currentUser?.email || 'member@flexgym.com',
                memberName: currentUser?.name || 'Alex',
                date: bookingDates[bookingDateIdx].formatted,
                time: bookingTime,
                status: 'pending'
            }
        });

        // Add log to audit trail
        try {
            const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
            const logs = savedAudit ? JSON.parse(savedAudit) : [];
            const newLog = {
                id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                requestId: `local_${activeBookingTrainer.id}`,
                action: 'Created',
                memberName: currentUser?.name || 'Alex',
                membershipId: 'NX-2026-9041',
                trainerName: activeBookingTrainer.name,
                timestamp: new Date().toISOString(),
                details: `Trial request created for ${bookingDates[bookingDateIdx].formatted} at ${bookingTime}.`
            };
            localStorage.setItem('zenith_trial_audit_trail', JSON.stringify([newLog, ...logs]));
        } catch (e) {}

        toast.success("Trial Request Submitted!", {
            description: `Awaiting approval from ${activeBookingTrainer.name} for session on ${bookingDates[bookingDateIdx].formatted} at ${bookingTime}`
        });

        setActiveBookingTrainer(null);
    };

    const handleAcceptReschedule = (trainerId: string, trainerName: string) => {
        const savedBookings = localStorage.getItem('zenith_trainer_trials');
        if (!savedBookings) return;
        try {
            const bookings = JSON.parse(savedBookings);
            if (bookings[trainerId]) {
                bookings[trainerId].status = 'approved';
                setBookedTrials(bookings);
                localStorage.setItem('zenith_trainer_trials', JSON.stringify(bookings));
                
                // Add log to audit trail
                try {
                    const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
                    const logs = savedAudit ? JSON.parse(savedAudit) : [];
                    const newLog = {
                        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        requestId: `local_${trainerId}`,
                        action: 'Reschedule Accepted',
                        memberName: currentUser?.name || 'Alex',
                        membershipId: 'NX-2026-9041',
                        trainerName,
                        timestamp: new Date().toISOString(),
                        details: `Member accepted proposed reschedule to ${bookings[trainerId].date} at ${bookings[trainerId].time}.`
                    };
                    localStorage.setItem('zenith_trial_audit_trail', JSON.stringify([newLog, ...logs]));
                } catch (e) {}

                // Sync PT Status
                syncPTStatus();

                // Send notification to the trainer
                addNotification({
                    role: 'trainer',
                    category: 'STAFF',
                    priority: 'high',
                    title: '✅ Reschedule Accepted by Member',
                    message: `${currentUser?.name || 'Alex'} has accepted your rescheduled timing proposal for ${bookings[trainerId].date} at ${bookings[trainerId].time}.`,
                    metadata: {
                        type: 'TRIAL_RESCHEDULE_ACCEPTED',
                        trainerId,
                        trainerName,
                        memberName: currentUser?.name || 'Alex',
                        date: bookings[trainerId].date,
                        time: bookings[trainerId].time
                    }
                });

                toast.success(`Rescheduled timing for ${trainerName} accepted!`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeclineReschedule = (trainerId: string, trainerName: string) => {
        const savedBookings = localStorage.getItem('zenith_trainer_trials');
        if (!savedBookings) return;
        try {
            const bookings = JSON.parse(savedBookings);
            if (bookings[trainerId]) {
                bookings[trainerId].status = 'rejected';
                setBookedTrials(bookings);
                localStorage.setItem('zenith_trainer_trials', JSON.stringify(bookings));

                // Add log to audit trail
                try {
                    const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
                    const logs = savedAudit ? JSON.parse(savedAudit) : [];
                    const newLog = {
                        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        requestId: `local_${trainerId}`,
                        action: 'Reschedule Declined',
                        memberName: currentUser?.name || 'Alex',
                        membershipId: 'NX-2026-9041',
                        trainerName,
                        timestamp: new Date().toISOString(),
                        details: `Member declined proposed reschedule to ${bookings[trainerId].date} at ${bookings[trainerId].time}.`
                    };
                    localStorage.setItem('zenith_trial_audit_trail', JSON.stringify([newLog, ...logs]));
                } catch (e) {}

                // Sync PT Status
                syncPTStatus();

                // Send notification to the trainer
                addNotification({
                    role: 'trainer',
                    category: 'STAFF',
                    priority: 'high',
                    title: '❌ Reschedule Declined by Member',
                    message: `${currentUser?.name || 'Alex'} declined your proposed rescheduled timing for ${bookings[trainerId].date} at ${bookings[trainerId].time}.`,
                    metadata: {
                        type: 'TRIAL_RESCHEDULE_DECLINED',
                        trainerId,
                        trainerName,
                        memberName: currentUser?.name || 'Alex',
                        date: bookings[trainerId].date,
                        time: bookings[trainerId].time
                    }
                });

                toast.error(`Rescheduled timing for ${trainerName} declined.`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section matching Recovery Hub */}
            <div className="flex flex-col gap-4 relative">
                <div className="z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary/10 via-transparent to-accent/5 p-6 md:p-8 rounded-3xl border border-primary/20 relative overflow-hidden w-full">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary dark:text-gold-glow mb-1">
                            <Dumbbell className="w-5 h-5 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest">Personal Training</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground dark:text-white uppercase italic">
                            Trainer <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-white">Trial Program</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mt-1">
                            Schedule a free 1-on-1 trial session with our elite coaches to find your perfect fitness mentor.
                        </p>
                    </div>

                    {preferredTrainerId && (
                        <div className="relative z-10 flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-primary shadow-glow">
                            <Star className="w-3.5 h-3.5 fill-current" /> Preferred Coach: {TRAINERS.find(t => t.id === preferredTrainerId)?.name}
                        </div>
                    )}
                </div>
            </div>

            {/* Trainer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRAINERS.map((trainer) => {
                    const isPreferred = preferredTrainerId === trainer.id;
                    const trial = bookedTrials[trainer.id];
                    const hasActiveRequest = Object.values(bookedTrials).some(
                        t => t.status === 'pending' || t.status === 'approved' || !t.status
                    );
                    // Capacity-aware flags
                    const cap = trainerCapacities[trainer.id];
                    const trainerAtCapacity = cap ? cap.currentClients >= cap.maxClients : false;
                    const slotsOpen = cap?.slotsOpen ?? false;
                    const availableSlots = cap ? Math.max(0, cap.maxClients - cap.currentClients) : null;

                    return (
                        <div 
                            key={trainer.id}
                            className={`group relative rounded-2xl overflow-hidden glass-card border transition-all duration-300 flex flex-col h-full ${
                                isPreferred 
                                ? 'border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.05)] bg-primary/[0.01]' 
                                : trainerAtCapacity
                                    ? 'border-red-500/20'
                                    : slotsOpen
                                        ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(34,197,94,0.04)]'
                                        : 'border-primary/10 hover:border-primary/30'
                            }`}
                        >
                            {/* Open Slots Highlight Banner */}
                            {slotsOpen && !trainerAtCapacity && (
                                <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black">
                                        🟢 Slots Available — {availableSlots} spot{availableSlots !== 1 ? 's' : ''} open!
                                    </span>
                                </div>
                            )}
                            {/* Trainer Image Card Header */}
                            <div className={`relative overflow-hidden ${slotsOpen && !trainerAtCapacity ? 'h-48 mt-7' : 'h-48'} w-full`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                                <img 
                                    src={trainer.image} 
                                    alt={trainer.name} 
                                    className="object-cover object-top w-full h-full scale-100 group-hover:scale-105 transition-transform duration-500"
                                />
                                
                                {/* Top Status Badges */}
                                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                                    {isPreferred && (
                                        <Badge className="bg-primary text-black font-bold uppercase text-[9px] tracking-wider border-none px-2.5 py-1 flex items-center gap-1 shadow-md">
                                            <Star className="w-3 h-3 fill-current" /> Preferred
                                        </Badge>
                                    )}
                                    {trial && (
                                        <Badge className={`font-bold uppercase text-[9px] tracking-wider border-none px-2.5 py-1 flex items-center gap-1 shadow-md ${
                                            trial.status === 'pending'
                                                ? 'bg-amber-500 text-black'
                                                : trial.status === 'rejected'
                                                    ? 'bg-rose-500 text-white'
                                                    : trial.status === 'rescheduled'
                                                        ? 'bg-purple-600 text-white animate-pulse'
                                                        : 'bg-emerald-500 text-white'
                                        }`}>
                                            {(trial.status === 'pending' || trial.status === 'rescheduled') && <Clock className="w-3 h-3 fill-current animate-pulse" />}
                                            {trial.status === 'approved' && <CheckCircle2 className="w-3 h-3 fill-current" />}
                                            {trial.status === 'rejected' && <XCircle className="w-3 h-3 fill-current" />}
                                            {!trial.status && <CheckCircle2 className="w-3 h-3 fill-current" />}
                                            {trial.status === 'pending'
                                                ? 'Awaiting Approval'
                                                : trial.status === 'rejected'
                                                    ? 'Declined'
                                                    : trial.status === 'rescheduled'
                                                        ? 'Reschedule Proposed'
                                                        : 'Trial Booked'}
                                        </Badge>
                                    )}
                                </div>

                                {/* Rating badge top right */}
                                <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                                    <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-primary text-primary" />
                                        <span className="text-xs font-bold text-white">{trainer.rating}</span>
                                    </div>
                                    {/* Capacity badge */}
                                    {cap && (
                                        <div className={`backdrop-blur-md px-2 py-1 rounded-lg border flex items-center gap-1 ${
                                            trainerAtCapacity
                                                ? 'bg-red-900/80 border-red-500/30'
                                                : 'bg-slate-900/80 border-white/10'
                                        }`}>
                                            <Users className="w-3 h-3 text-slate-400" />
                                            <span className={`text-[10px] font-bold ${
                                                trainerAtCapacity ? 'text-red-400' : 'text-white'
                                            }`}>
                                                {trainerAtCapacity ? 'Full' : `${availableSlots} slot${availableSlots !== 1 ? 's' : ''}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground dark:text-white leading-snug">{trainer.name}</h3>
                                        <p className="text-xs text-primary dark:text-gold-glow font-bold uppercase tracking-wider">{trainer.role}</p>
                                    </div>

                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{trainer.bio}</p>

                                    {/* Specialties Badges */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {trainer.specialties.map((spec) => (
                                            <Badge key={spec} variant="outline" className="text-[9px] font-semibold border-primary/20 text-muted-foreground">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Scheduled Trial Details */}
                                    {trial && (
                                        <div className={`mt-3 p-3 rounded-xl border text-xs flex flex-col gap-2.5 ${
                                            trial.status === 'pending'
                                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                : trial.status === 'rejected'
                                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                    : trial.status === 'rescheduled'
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            <div className="flex items-start gap-2">
                                                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold uppercase tracking-wide text-[10px]">
                                                        {trial.status === 'pending'
                                                            ? 'Request Pending'
                                                            : trial.status === 'rejected'
                                                                ? 'Request Declined'
                                                                : trial.status === 'rescheduled'
                                                                    ? 'New Timing Proposed'
                                                                    : 'Session Scheduled'}
                                                    </p>
                                                    <p className="font-semibold text-white mt-0.5">
                                                        {trial.status === 'rejected'
                                                            ? 'You can apply for another trainer.'
                                                            : `${trial.date} at ${trial.time}`}
                                                    </p>
                                                </div>
                                            </div>
                                            {trial.status === 'rescheduled' && (
                                                <div className="flex gap-2 mt-1">
                                                    <button
                                                        onClick={() => handleDeclineReschedule(trainer.id, trainer.name)}
                                                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg transition-all"
                                                    >
                                                        Decline time
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptReschedule(trainer.id, trainer.name)}
                                                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
                                                    >
                                                        Accept time
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Buttons Footer */}
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button 
                                        onClick={() => setActiveProfileTrainer(trainer)}
                                        className="py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-xs font-semibold text-foreground flex items-center justify-center gap-1.5"
                                    >
                                        <Info className="w-3.5 h-3.5" />
                                        View Profile
                                    </button>
                                    
                                    {trial ? (
                                        <button 
                                            disabled
                                            className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed border ${
                                                trial.status === 'pending'
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                    : trial.status === 'rejected'
                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                        : trial.status === 'rescheduled'
                                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            }`}
                                        >
                                            {trial.status === 'pending'
                                                ? 'Pending'
                                                : trial.status === 'rejected'
                                                    ? 'Declined'
                                                    : trial.status === 'rescheduled'
                                                        ? 'Proposed'
                                                        : 'Confirmed'}
                                        </button>
                                    ) : trainerAtCapacity ? (
                                        <button
                                            disabled
                                            className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed bg-red-500/10 border border-red-500/20 text-red-400"
                                            title="This trainer is currently at full capacity"
                                        >
                                            <Lock className="w-3 h-3" /> At Capacity
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleOpenBooking(trainer)}
                                            disabled={hasActiveRequest}
                                            className={`py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                                                hasActiveRequest
                                                    ? 'bg-white/5 border border-white/5 text-muted-foreground opacity-50 cursor-not-allowed'
                                                    : slotsOpen
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-900/20 hover:brightness-110 active:scale-95'
                                                        : 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow hover:brightness-110 active:scale-95'
                                            }`}
                                            title={hasActiveRequest ? "You already have an active or pending trial request" : "Book Trial"}
                                        >
                                            {slotsOpen && !hasActiveRequest ? (
                                                <><Zap className="w-3 h-3" /> Book Now — Slots Open!</>
                                            ) : 'Book Trial'}
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleSetPreferred(trainer.id, trainer.name)}
                                        disabled={isPreferred}
                                        className={`col-span-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                            isPreferred 
                                            ? 'bg-primary/10 border-primary/30 text-primary cursor-default' 
                                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-muted-foreground'
                                        }`}
                                    >
                                        {isPreferred ? '✓ Preferred Coach' : 'Set as Preferred Coach'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View Profile Dialog */}
            <Dialog open={activeProfileTrainer !== null} onOpenChange={(open) => !open && setActiveProfileTrainer(null)}>
                <DialogContent className="max-w-lg bg-slate-900 border-primary/20 text-slate-100 p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Trainer Profile</DialogTitle>
                        <DialogDescription>View trainer specialties, biography, and professional certifications.</DialogDescription>
                    </DialogHeader>
                    {activeProfileTrainer && (
                        <div>
                            {/* Header image with overlay close */}
                            <div className="relative h-64 w-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
                                <img 
                                    src={activeProfileTrainer.image} 
                                    alt={activeProfileTrainer.name} 
                                    className="object-cover object-top w-full h-full"
                                />
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <DialogTitle asChild>
                                        <h3 className="text-2xl font-black font-heading uppercase italic tracking-tight">{activeProfileTrainer.name}</h3>
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Trainer profile bio, specialties, and certifications.
                                    </DialogDescription>
                                    <p className="text-primary dark:text-gold-glow font-bold text-sm tracking-wide uppercase">{activeProfileTrainer.role}</p>
                                </div>
                            </div>

                            {/* Details body */}
                            <div className="p-6 space-y-6">
                                {/* Statistics row */}
                                <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Experience</p>
                                            <p className="text-sm font-bold text-white">{activeProfileTrainer.experience}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Star className="w-5 h-5 text-primary fill-primary" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Rating</p>
                                            <p className="text-sm font-bold text-white">{activeProfileTrainer.rating} / 5.0</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Specialties & Certifications */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Specialties</p>
                                        <div className="flex flex-wrap gap-2">
                                            {activeProfileTrainer.specialties.map((spec) => (
                                                <Badge key={spec} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Biography</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {activeProfileTrainer.longBio}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Professional Certifications</p>
                                        <ul className="space-y-1.5">
                                            {activeProfileTrainer.certifications.map((cert) => (
                                                <li key={cert} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                    <span>{cert}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <DialogFooter className="p-6 border-t border-white/5 bg-slate-950/40 gap-3">
                                <button 
                                    onClick={() => {
                                        handleSetPreferred(activeProfileTrainer.id, activeProfileTrainer.name);
                                        setActiveProfileTrainer(null);
                                    }}
                                    disabled={preferredTrainerId === activeProfileTrainer.id}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex-1 transition-all ${
                                        preferredTrainerId === activeProfileTrainer.id 
                                        ? 'bg-primary/10 border-primary/30 text-primary cursor-default' 
                                        : 'border-white/10 bg-transparent hover:bg-white/5 text-slate-300'
                                    }`}
                                >
                                    {preferredTrainerId === activeProfileTrainer.id ? 'Preferred Coach' : 'Set as Preferred'}
                                </button>
                                <button 
                                    onClick={() => {
                                        const t = activeProfileTrainer;
                                        setActiveProfileTrainer(null);
                                        setTimeout(() => handleOpenBooking(t), 200);
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-xs uppercase tracking-wider flex-1 text-center shadow-glow"
                                >
                                    Book Trial Session
                                </button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Book Trial Session Dialog */}
            <Dialog open={activeBookingTrainer !== null} onOpenChange={(open) => !open && setActiveBookingTrainer(null)}>
                <DialogContent className="max-w-md bg-slate-900 border-primary/20 text-slate-100 p-6 rounded-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Book Trial Session</DialogTitle>
                        <DialogDescription>Schedule a 1-on-1 trial session with a trainer.</DialogDescription>
                    </DialogHeader>
                    {activeBookingTrainer && (
                        <div className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black font-heading uppercase text-foreground tracking-tighter flex items-center gap-2">
                                    <CalendarCheck className="w-6 h-6 text-primary" /> Book Trial Session
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                                    Schedule a 1-on-1 session with {activeBookingTrainer.name}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Brief Trainer Info inside Dialog */}
                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                                <img 
                                    src={activeBookingTrainer.image} 
                                    alt={activeBookingTrainer.name} 
                                    className="w-12 h-12 rounded-lg object-cover object-top"
                                />
                                <div>
                                    <p className="text-sm font-bold text-white">{activeBookingTrainer.name}</p>
                                    <p className="text-xs text-primary font-semibold">{activeBookingTrainer.role}</p>
                                </div>
                            </div>

                            {/* Date Selector */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Trial Date</p>
                                <div className="flex gap-3">
                                    {bookingDates.map((date, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setBookingDateIdx(idx)}
                                            className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-0.5 transition-all duration-300 ${
                                                bookingDateIdx === idx 
                                                ? 'bg-primary border-primary text-black shadow-glow font-bold scale-[1.02]' 
                                                : 'bg-black/20 border-white/5 hover:border-primary/30 text-slate-300'
                                            }`}
                                        >
                                            <span className={`text-[10px] uppercase font-bold tracking-widest ${bookingDateIdx === idx ? 'text-black/60' : 'text-muted-foreground'}`}>{date.label}</span>
                                            <span className={`text-lg font-black ${bookingDateIdx === idx ? 'text-black' : 'text-white'}`}>{date.date}</span>
                                            <span className={`text-[9px] uppercase font-bold ${bookingDateIdx === idx ? 'text-black/60' : 'text-muted-foreground'}`}>{date.month}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Time Window</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {bookingTimeSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setBookingTime(time)}
                                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300 border uppercase tracking-wider ${
                                                bookingTime === time
                                                ? 'bg-primary border-primary text-black font-bold scale-[1.02] shadow-glow'
                                                : 'bg-black/20 border-white/5 text-foreground hover:border-primary/50'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alert Details */}
                            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-[10px] text-primary uppercase font-bold tracking-wider text-center">
                                Trial sessions are free and last approximately 45 minutes.
                            </div>

                            {/* Dialog Footer Actions */}
                            <DialogFooter className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setActiveBookingTrainer(null)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 flex-1"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmBooking}
                                    disabled={!bookingTime}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-xs uppercase tracking-wider flex-1 text-center shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Session
                                </button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
