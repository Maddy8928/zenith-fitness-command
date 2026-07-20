"use client";

import React, { useState, useEffect } from "react";
import { 
    Star, 
    CheckCircle2, 
    Dumbbell,
    Activity,
    Shield,
    Clock,
    Check,
    Info,
    Calendar,
    Award,
    XCircle,
    Lock,
    Zap,
    Users,
    ArrowRight
} from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
        price: '₹9,999/month'
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
        price: '₹9,999/month'
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
        price: '₹9,999/month'
    }
];

export default function PersonalTrainingPage() {
    const { user: currentUser } = useAuth();
    const { addNotification } = useNotifications();

    const [ptStatus, setPtStatus] = useState<any>({});
    const [activeProfileTrainer, setActiveProfileTrainer] = useState<typeof TRAINERS[0] | null>(null);
    const [confirmRequestTrainer, setConfirmRequestTrainer] = useState<typeof TRAINERS[0] | null>(null);

    const [trainerCapacities, setTrainerCapacities] = useState<Record<string, TrainerCapacity>>(() => {
        if (typeof window === 'undefined') return {};
        const result: Record<string, TrainerCapacity> = {};
        TRAINERS.forEach(t => { result[t.id] = getTrainerCapacity(t.id); });
        return result;
    });

    const loadPTData = () => {
        try {
            const savedPT = localStorage.getItem('zenith_pt_status');
            if (savedPT) {
                setPtStatus(JSON.parse(savedPT));
            } else {
                setPtStatus({});
            }
        } catch (e) {}
    };

    const loadCapacities = () => {
        const caps: Record<string, TrainerCapacity> = {};
        TRAINERS.forEach(t => { caps[t.id] = getTrainerCapacity(t.id); });
        setTrainerCapacities(caps);
    };

    useEffect(() => {
        loadPTData();
        loadCapacities();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'zenith_pt_status') {
                loadPTData();
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

    const handleSendPTRequest = (trainer: typeof TRAINERS[0]) => {
        const updatedStatus = {
            status: 'pending',
            requestedTrainerId: trainer.id,
            requestedTrainerName: trainer.name,
            requestedTrainerRole: trainer.role,
            requestedTrainerImage: trainer.image,
            requestedTrainerSpecialties: trainer.specialties,
            requestDate: new Date().toISOString(),
            price: 9999,
            duration: '1 Month'
        };

        localStorage.setItem('zenith_pt_status', JSON.stringify(updatedStatus));
        setPtStatus(updatedStatus);
        window.dispatchEvent(new Event('storage'));

        // Send notification to the trainer
        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '💳 Personal Training Request',
            message: `${currentUser?.name || 'Alex'} has requested you as their Personal Trainer.`,
            metadata: {
                type: 'PT_REQUEST',
                trainerId: trainer.id,
                trainerName: trainer.name,
                memberName: currentUser?.name || 'Alex',
                memberEmail: currentUser?.email || 'member@flexgym.com'
            }
        });

        toast.success(`PT Request Sent to ${trainer.name}!`, {
            description: "Awaiting approval from your trainer. You will be notified once confirmed."
        });

        setConfirmRequestTrainer(null);
    };

    const handleCancelRequest = () => {
        localStorage.removeItem('zenith_pt_status');
        setPtStatus({});
        window.dispatchEvent(new Event('storage'));
        toast.info("Personal Training request cancelled.");
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isPaid = ptStatus.paymentCompleted || ptStatus.status === 'paid';
    const isApproved = ptStatus.status === 'approved' && !isPaid;
    const isPending = ptStatus.status === 'pending';

    // Get active trainer details
    const activeTrainer = TRAINERS.find(t => t.id === (ptStatus.assignedTrainerId || ptStatus.requestedTrainerId));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col gap-4 relative">
                <div className="z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-indigo-950/40 via-transparent to-purple-950/20 p-6 md:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden w-full">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-indigo-400 dark:text-gold-glow mb-1">
                            <Zap className="w-5 h-5 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest">Enrollment</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground dark:text-white uppercase italic">
                            Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Training</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mt-1">
                            Accelerate your transformation with Flex elite coaches. Select a trainer, send an enrollment request, and kickstart your custom fitness regime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Subscription View */}
            {isPaid && activeTrainer && (
                <Card className="bg-slate-900/40 backdrop-blur-xl border-emerald-500/30 overflow-hidden rounded-[2rem] max-w-4xl mx-auto shadow-luxury">
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        
                        {/* Trainer Portrait & Bio */}
                        <div className="flex flex-col items-center text-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg animate-pulse" />
                                <div className="relative w-28 h-28 rounded-full border-2 border-emerald-500/50 p-1">
                                    <div className="w-full h-full rounded-full bg-slate-950 dark:bg-slate-800 flex items-center justify-center font-black text-3xl text-emerald-450 dark:text-emerald-400">
                                        {activeTrainer.name ? activeTrainer.name.split(' ').map((n: string) => n[0]).join('') : 'MJ'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">Assigned Coach</p>
                                <h3 className="text-2xl font-bold text-white">{activeTrainer.name}</h3>
                                <p className="text-xs text-slate-400 mt-1">{activeTrainer.role}</p>
                            </div>
                        </div>

                        {/* Plan Details & Status */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Plan Summary</h3>
                                    <p className="text-sm text-slate-400">Your current personal training plan details</p>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 font-bold uppercase text-xs tracking-wider">
                                    🟢 Active
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-sm">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Plan Duration</p>
                                    <p className="text-white font-bold">{ptStatus.duration || '1 Month'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Training Status</p>
                                    <p className="text-white font-bold">Enrolled</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Start Date</p>
                                    <p className="text-white font-bold">{formatDate(ptStatus.startDate || ptStatus.paymentDate)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Expiry Date</p>
                                    <p className="text-white font-bold">
                                        {ptStatus.expiryDate ? formatDate(ptStatus.expiryDate) : (
                                            ptStatus.paymentDate ? formatDate(new Date(new Date(ptStatus.paymentDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()) : 'N/A'
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link href="/member/plans" className="flex-1">
                                    <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 text-sm gap-2">
                                        <Dumbbell className="w-4 h-4" /> Go to My Workouts
                                    </Button>
                                </Link>
                                <Link href="/member/feedback" className="flex-1">
                                    <Button variant="outline" className="w-full h-12 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl font-semibold text-sm">
                                        Send Message to Coach
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Request Progress Banner */}
            {!isPaid && (isPending || isApproved) && activeTrainer && (
                <div className="max-w-4xl mx-auto space-y-4">
                    {isPending && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                                    <Clock className="w-6 h-6 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">PT Request Pending Approval</p>
                                    <p className="text-xs text-amber-400/80 mt-0.5">
                                        Your request to enroll in Personal Training with **{activeTrainer.name}** has been sent. Awaiting coach approval.
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleCancelRequest}
                                variant="outline"
                                className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 bg-transparent rounded-xl"
                            >
                                Cancel Request
                            </Button>
                        </div>
                    )}

                    {isApproved && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Request Approved! Payment Required</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        **{activeTrainer.name}** has approved your request! Complete payment to activate your plan and unlock your workouts.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2.5">
                                <Button 
                                    onClick={handleCancelRequest}
                                    variant="ghost"
                                    className="text-slate-400 hover:text-white rounded-xl"
                                >
                                    Decline & Reset
                                </Button>
                                <Link href={`/member/billing?payPT=true&trainerId=${activeTrainer.id}`}>
                                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/30 px-6">
                                        Pay Now <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Trainer List (Only visible if not paid) */}
            {!isPaid && (
                <div className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-indigo-500" />
                            Select Your Elite Trainer
                        </h2>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs py-1 px-3">
                            Direct Enrollment
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TRAINERS.map((trainer) => {
                            const isRequested = activeTrainer?.id === trainer.id;
                            const cap = trainerCapacities[trainer.id];
                            const trainerAtCapacity = cap ? cap.currentClients >= cap.maxClients : false;
                            const slotsOpen = cap?.slotsOpen ?? false;
                            const availableSlots = cap ? Math.max(0, cap.maxClients - cap.currentClients) : null;

                            return (
                                <div 
                                    key={trainer.id}
                                    className={`group relative rounded-2xl overflow-hidden glass-card border transition-all duration-300 flex flex-col h-full ${
                                        isRequested 
                                        ? 'border-indigo-500/50 bg-indigo-500/[0.01] shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
                                        : trainerAtCapacity
                                            ? 'border-red-500/20'
                                            : slotsOpen
                                                ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(34,197,94,0.04)]'
                                                : 'border-primary/10 hover:border-indigo-500/30'
                                    }`}
                                >
                                    {/* Open Slots Banner */}
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

                                    {/* Image Portrait */}
                                    <div className={`relative overflow-hidden ${slotsOpen && !trainerAtCapacity ? 'h-48 mt-7' : 'h-48'} w-full`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                                        <img 
                                            src={trainer.image} 
                                            alt={trainer.name} 
                                            className="object-cover object-top w-full h-full scale-100 group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Status Badges */}
                                        <div className="absolute top-3 left-3 z-20">
                                            {isRequested && (
                                                <Badge className="bg-indigo-500 text-white font-bold uppercase text-[9px] tracking-wider border-none px-2.5 py-1 shadow-md">
                                                    {isPending ? 'Requested' : 'Approved'}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Ratings & Capacity */}
                                        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                                            <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-primary text-primary" />
                                                <span className="text-xs font-bold text-white">{trainer.rating}</span>
                                            </div>
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

                                    {/* Content Card Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white leading-snug">{trainer.name}</h3>
                                                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{trainer.role}</p>
                                                </div>
                                                <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs shrink-0 font-mono">
                                                    {trainer.price}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{trainer.bio}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {trainer.specialties.map((spec) => (
                                                    <Badge key={spec} variant="outline" className="text-[9px] font-semibold border-indigo-500/20 text-slate-400">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <button 
                                                onClick={() => setActiveProfileTrainer(trainer)}
                                                className="py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                                            >
                                                <Info className="w-3.5 h-3.5" />
                                                Profile
                                            </button>
                                            
                                            {isRequested ? (
                                                <button 
                                                    disabled
                                                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed border ${
                                                        isPending 
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                    }`}
                                                >
                                                    {isPending ? 'Pending' : 'Approved'}
                                                </button>
                                            ) : trainerAtCapacity ? (
                                                <button
                                                    disabled
                                                    className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed bg-red-500/10 border border-red-500/20 text-red-400"
                                                >
                                                    <Lock className="w-3 h-3" /> Full
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setConfirmRequestTrainer(trainer)}
                                                    disabled={!!ptStatus.status}
                                                    className={`py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                                                        ptStatus.status
                                                            ? 'bg-white/5 border border-white/5 text-muted-foreground opacity-50 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-950/20 hover:brightness-110 active:scale-95'
                                                    }`}
                                                >
                                                    Request PT
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Profile Dialog */}
            <Dialog open={activeProfileTrainer !== null} onOpenChange={(open) => !open && setActiveProfileTrainer(null)}>
                <DialogContent className="max-w-lg bg-slate-900 border-indigo-500/20 text-slate-100 p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Trainer Profile</DialogTitle>
                        <DialogDescription>View specialties and bio for active profile trainer.</DialogDescription>
                    </DialogHeader>
                    {activeProfileTrainer && (
                        <div>
                            <div className="relative h-64 w-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
                                <img 
                                    src={activeProfileTrainer.image} 
                                    alt={activeProfileTrainer.name} 
                                    className="object-cover object-top w-full h-full"
                                />
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <h3 className="text-2xl font-black font-heading uppercase italic tracking-tight">{activeProfileTrainer.name}</h3>
                                    <p className="text-indigo-400 font-bold text-sm tracking-wide uppercase">{activeProfileTrainer.role}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5 text-sm">
                                <div className="grid grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-center">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Experience</p>
                                        <p className="text-sm font-bold text-white mt-1">{activeProfileTrainer.experience}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Rating</p>
                                        <p className="text-sm font-bold text-white mt-1">{activeProfileTrainer.rating} / 5.0</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Pricing</p>
                                        <p className="text-sm font-bold text-indigo-400 mt-1">{activeProfileTrainer.price}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Specialties</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {activeProfileTrainer.specialties.map((spec) => (
                                                <Badge key={spec} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Biography</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">{activeProfileTrainer.longBio}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Professional Certifications</p>
                                        <ul className="space-y-1">
                                            {activeProfileTrainer.certifications.map((cert) => (
                                                <li key={cert} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{cert}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-6 border-t border-white/5 bg-slate-950/40 gap-3">
                                <Button 
                                    onClick={() => setActiveProfileTrainer(null)}
                                    variant="outline" 
                                    className="border-white/10 text-white hover:!text-white hover:!bg-white/5 rounded-xl flex-1 bg-transparent"
                                >
                                    Close
                                </Button>
                                {!isPaid && !ptStatus.status && (
                                    <Button 
                                        onClick={() => {
                                            setActiveProfileTrainer(null);
                                            setConfirmRequestTrainer(activeProfileTrainer);
                                        }}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white font-bold rounded-xl flex-1"
                                    >
                                        Enroll Now
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirm Request Dialog */}
            <Dialog open={confirmRequestTrainer !== null} onOpenChange={(open) => !open && setConfirmRequestTrainer(null)}>
                <DialogContent className="max-w-md bg-slate-900 border-indigo-500/20 text-slate-100 p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black font-heading uppercase text-white tracking-tighter flex items-center gap-2">
                            <Zap className="w-6 h-6 text-indigo-400 animate-pulse" /> Confirm Enrollment Request
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                            Personal Training Direct Request
                        </DialogDescription>
                    </DialogHeader>

                    {confirmRequestTrainer && (
                        <div className="space-y-4 pt-2 text-sm">
                            <p className="text-slate-350 leading-relaxed">
                                You are requesting **{confirmRequestTrainer.name}** as your Personal Trainer. 
                                Once the coach approves your request, a **Pay Now** option will be enabled for ₹9,999/month.
                            </p>
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Coach:</span>
                                    <span className="text-white font-semibold">{confirmRequestTrainer.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Package pricing:</span>
                                    <span className="text-indigo-400 font-bold">₹9,999 / Month</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Includes:</span>
                                    <span className="text-white">Custom workouts, diets, & check-ins</span>
                                </div>
                            </div>

                            <DialogFooter className="gap-3 pt-2">
                                <Button 
                                    onClick={() => setConfirmRequestTrainer(null)}
                                    variant="outline" 
                                    className="border-white/10 text-white hover:bg-white/5 rounded-xl flex-1 bg-transparent"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleSendPTRequest(confirmRequestTrainer)}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white font-bold rounded-xl flex-1"
                                >
                                    Send Request
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
