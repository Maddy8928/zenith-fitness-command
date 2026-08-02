'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Dumbbell,
    Flame,
    Clock,
    Target,
    ChevronDown,
    Info,
    CheckCircle2,
    Activity,
    PieChart,
    ChevronRight,
    Utensils,
    MessageSquare,
    Calendar,
    Lock,
    ArrowRight,
    ShieldAlert,
    Star,
    Zap,
    UserCheck,
    CreditCard,
    Unlock,
    Check,
    Users,
    Shield,
    Award,
    CalendarCheck,
    Sparkles,
    AlertCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import {
    getTrainerCapacity,
    CAPACITY_STORAGE_KEY,
    type TrainerCapacity,
} from '@/lib/trainer-capacity-store';

import { usePlan } from '@/context/PlanContext';

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
        price: '₹9,999/month',
        trainingGoals: ['Hypertrophy', 'Max Strength', 'Competition Prep', 'Athletic Conditioning'],
        availability: 'Mon - Sat (09:00 AM - 06:00 PM)'
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
        price: '₹9,999/month',
        trainingGoals: ['Fat Loss', 'Endurance & Stamina', 'Agility Training', 'Metabolic Conditioning'],
        availability: 'Mon - Fri (07:00 AM - 04:00 PM)'
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
        price: '₹9,999/month',
        trainingGoals: ['Rehab & Prehab', 'Joint Mobility', 'Postural Correction', 'Longevity Fitness'],
        availability: 'Tue - Sun (10:00 AM - 07:00 PM)'
    }
];

const ONBOARDING_STEPS = [
    { id: 1, label: 'Choose Trainer', description: 'Trainer Trial or Direct Hire', icon: UserCheck },
    { id: 2, label: 'Trainer Approval', description: 'Waiting for Approval', icon: Clock },
    { id: 3, label: 'Payment', description: 'Complete PT Package', icon: CreditCard },
    { id: 4, label: 'Personal Training Active', description: 'Workouts Unlocked', icon: Unlock },
];

const TRAINERS_INFO = {
    'marcus-johnson': {
        name: 'Marcus Johnson',
        role: 'Head of Strength & Conditioning',
        specialties: ['Powerlifting', 'Strength Training', 'Bodybuilding'],
        experience: '12+ Years',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
    },
    'sarah-chen': {
        name: 'Sarah Chen',
        role: 'HIIT Specialist',
        specialties: ['HIIT', 'Cardio Conditioning', 'Core Strength'],
        experience: '8 Years',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    },
    'michael-rivers': {
        name: 'Michael Rivers',
        role: 'Recovery & Mobility Specialist',
        specialties: ['Mobility', 'Injury Prevention', 'Active Recovery'],
        experience: '10 Years',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
    }
};

const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
    'Barbell Back Squat': [
        'Stand with feet shoulder-width apart, resting the barbell across your upper traps.',
        'Brace your core and initiate the movement by sending your hips back and bending your knees.',
        'Lower until your thighs are parallel to the floor, keeping your chest up and knees tracking over your toes.',
        'Drive through your entire foot to return to the starting position, squeezing your glutes at the top.'
    ],
    'Romanian Deadlift': [
        'Stand tall with feet hip-width apart, holding a barbell or dumbbells at thigh level.',
        'Keep a slight, fixed bend in your knees and hinge at your hips, pushing your butt back.',
        'Lower the weights along your shins until you feel a deep stretch in your hamstrings.',
        'Drive your hips forward and stand tall, locking out the glutes at the top.'
    ],
    'Leg Press': [
        'Sit firmly in the leg press machine with your back flat against the pad.',
        'Place feet shoulder-width apart on the sled platform.',
        'Release the safety catch and lower the sled under control until knees reach a 90-degree angle.',
        'Drive the platform back up through your heels without locking out your knees at the top.'
    ],
    'Standing Calf Raise': [
        'Position the balls of your feet on the calf raise block with shoulders under the pads.',
        'Lower your heels as far as comfortable to get a full stretch in the calves.',
        'Press through the balls of your feet to raise your heels as high as possible.',
        'Hold the peak contraction for 1 second before lowering slowly.'
    ],
    'Hanging Leg Raise': [
        'Grip a pull-up bar with an overhand grip, arms fully extended and body hanging.',
        'Brace your core and raise your legs forward until they are parallel to the floor (or higher).',
        'Avoid swinging or using momentum from your lower back.',
        'Lower your legs slowly under control to return to the starting hang.'
    ],
    'Plank': [
        'Place forearms on the floor with elbows aligned directly under your shoulders.',
        'Extend legs back, balancing on the balls of your feet.',
        'Engage your glutes, core, and quads to maintain a perfectly straight line from head to heels.',
        'Hold the position without letting your hips sag or hike up.'
    ],
    'Barbell Bench Press': [
        'Lie flat on the bench with feet firmly planted on the floor.',
        'Grip the bar slightly wider than shoulder-width and unrack it above your chest.',
        'Lower the bar under control to the mid-chest, tucking elbows slightly.',
        'Press the bar explosively back to the starting position.'
    ],
    'Incline Dumbbell Press': [
        'Set an adjustable bench to a 30-45 degree incline.',
        'Hold two dumbbells at shoulder level with palms facing forward.',
        'Press the weights upward until your arms are fully extended over your upper chest.',
        'Lower slowly under control until you feel a comfortable stretch in the pecs.'
    ],
    'Cable Flyes': [
        'Set pulleys to chest height and grab the handles with palms facing forward.',
        'Step forward to create tension, keeping a slight bend in your elbows.',
        'Bring your hands together in an arc motion in front of your chest, squeezing the pecs.',
        'Return slowly along the same arc until chest muscles are stretched.'
    ],
    'Overhead Tricep Extension': [
        'Hold a dumbbell or rope attachment overhead with both hands, arms extended.',
        'Keep upper arms stationary and close to your head as you bend your elbows.',
        'Lower the weight behind your head until triceps are fully stretched.',
        'Extend elbows to press the weight back to the top position.'
    ],
    'Tricep Pushdowns': [
        'Attach a rope or straight bar to a high pulley.',
        'Keep elbows pinned to your sides and push the attachment down until arms are fully extended.',
        'Squeeze your triceps hard at the bottom.',
        'Return slowly to a 90-degree elbow bend without moving your upper arms.'
    ],
    'Russian Twists': [
        'Sit on the floor with knees bent, feet slightly elevated, and torso leaning back at 45 degrees.',
        'Hold a weight plate or medicine ball with both hands in front of your chest.',
        'Rotate your torso to the right, touching the weight near the floor.',
        'Rotate smoothly to the left side, keeping your core braced throughout.'
    ]
};

const DEFAULT_WORKOUT_PLAN = {
    name: 'Elite Hypertrophy & Power Protocol',
    level: 'Advanced',
    goal: 'Hypertrophy & Strength',
    description: 'A comprehensive 7-day training protocol engineered for rapid strength development and muscle hypertrophy. Follow the prescribed supersets and rest periods.',
    duration: '60-75 Min',
    frequency: '5 Days / Week',
    trainer: 'Marcus Johnson',
    schedule: [
        {
            day: 'Monday — Chest & Triceps',
            focus: 'Hypertrophy',
            exercises: [
                { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s' },
                { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', rest: '75s' },
                { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60s', supersetGroup: 'A' },
                { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '60s', supersetGroup: 'A' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', rest: '60s' }
            ]
        },
        {
            day: 'Tuesday — Back & Biceps',
            focus: 'Strength',
            exercises: [
                { name: 'Romanian Deadlift', sets: 4, reps: '6-8', rest: '120s' },
                { name: 'Hanging Leg Raise', sets: 3, reps: '12-15', rest: '60s' }
            ]
        },
        {
            day: 'Wednesday — Active Recovery',
            focus: 'Mobility & Stretch',
            exercises: []
        },
        {
            day: 'Thursday — Legs & Glutes',
            focus: 'Power & Size',
            exercises: [
                { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '120s' },
                { name: 'Leg Press', sets: 4, reps: '10-12', rest: '90s' },
                { name: 'Standing Calf Raise', sets: 4, reps: '15-20', rest: '60s' }
            ]
        },
        {
            day: 'Friday — Shoulders & Core',
            focus: 'Hypertrophy',
            exercises: [
                { name: 'Plank', sets: 3, reps: '60s', rest: '45s', supersetGroup: 'B' },
                { name: 'Russian Twists', sets: 3, reps: '20', rest: '45s', supersetGroup: 'B' }
            ]
        },
        {
            day: 'Saturday — Full Body Conditioning',
            focus: 'Metabolic Conditioning',
            exercises: [
                { name: 'Barbell Back Squat', sets: 3, reps: '12', rest: '60s' },
                { name: 'Barbell Bench Press', sets: 3, reps: '12', rest: '60s' }
            ]
        },
        {
            day: 'Sunday — Rest & Recovery',
            focus: 'Rest Day',
            exercises: []
        }
    ]
};

const DEFAULT_DIET_PLAN = {
    name: 'Elite Shred & Muscle Gain',
    type: 'High Protein / Timed Carb',
    description: 'Custom nutrient timing and macro targets designed to maximize recovery and lean tissue accretion while keeping body fat low.',
    dailyCalories: '2,650',
    macros: {
        protein: '210g',
        carbs: '280g',
        fats: '65g'
    },
    meals: [
        {
            meal: 'Meal 1 — Breakfast',
            time: '07:30 AM',
            calories: 620,
            protein: '45g',
            items: ['4 Whole Eggs + 2 Egg Whites', '80g Oatmeal with Berries', '1 Scoop Whey Protein']
        },
        {
            meal: 'Meal 2 — Pre-Workout',
            time: '11:00 AM',
            calories: 480,
            protein: '40g',
            items: ['200g Chicken Breast', '150g White Rice', '100g Steamed Broccoli']
        },
        {
            meal: 'Meal 3 — Post-Workout',
            time: '01:30 PM',
            calories: 750,
            protein: '55g',
            items: ['250g Lean Beef / Steak', '250g Sweet Potato', 'Mixed Green Salad with Olive Oil']
        },
        {
            meal: 'Meal 4 — Evening Snack',
            time: '05:00 PM',
            calories: 350,
            protein: '35g',
            items: ['200g Greek Yogurt', '30g Walnuts or Almonds', '1 Banana']
        },
        {
            meal: 'Meal 5 — Before Bed',
            time: '09:00 PM',
            calories: 450,
            protein: '35g',
            items: ['1.5 Scoops Casein Protein', '1 Tbsp Natural Peanut Butter', 'Handful of Berries']
        }
    ]
};

function computeUnlocked(ptStatus: any, trials: any): {
    trialCompleted: boolean;
    trainerSelected: boolean;
    paymentCompleted: boolean;
    trainerApproved: boolean;
    allDone: boolean;
} {
    const trialCompleted = ptStatus?.trialCompleted ||
        (trials && Object.values(trials).some((t: any) => t.status === 'approved' || t.status === 'completed'));
    const trainerSelected = ptStatus?.trainerSelected || (typeof window !== 'undefined' ? !!window.localStorage.getItem('zenith_preferred_trainer_id') : false);
    const paymentCompleted = !!ptStatus?.paymentCompleted || ptStatus?.status === 'paid';
    const trainerApproved = !!ptStatus?.trainerApproved || ptStatus?.status === 'paid';
    return {
        trialCompleted,
        trainerSelected,
        paymentCompleted,
        trainerApproved,
        allDone: ptStatus?.status === 'paid' || !!ptStatus?.paymentCompleted,
    };
}


export default function MemberPlansPage() {
    const { workoutPlan, dietPlan } = usePlan();
    const [weeklyWorkoutPlan, setWeeklyWorkoutPlan] = useState<any | null>(null);

    const [ptStatus, setPtStatus] = useState<any>({});
    const [trialBookings, setTrialBookings] = useState<any>({});
    const [preferredTrainerId, setPreferredTrainerId] = useState<string | null>(null);

    const { user: currentUser } = useAuth();
    const { addNotification } = useNotifications();

    const [activeProfileTrainer, setActiveProfileTrainer] = useState<typeof TRAINERS[0] | null>(null);
    const [activeBookingTrainer, setActiveBookingTrainer] = useState<typeof TRAINERS[0] | null>(null);
    const [bookingDateIdx, setBookingDateIdx] = useState<number>(0);
    const [bookingTime, setBookingTime] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    const [trainerCapacities, setTrainerCapacities] = useState<Record<string, TrainerCapacity>>(() => {
        if (typeof window === 'undefined') return {};
        const result: Record<string, TrainerCapacity> = {};
        TRAINERS.forEach(t => { result[t.id] = getTrainerCapacity(t.id); });
        return result;
    });

    const loadCapacities = () => {
        const caps: Record<string, TrainerCapacity> = {};
        TRAINERS.forEach(t => { caps[t.id] = getTrainerCapacity(t.id); });
        setTrainerCapacities(caps);
    };

    // Load PT data from storage
    const loadPTData = () => {
        try {
            const savedPT = localStorage.getItem('zenith_pt_status');
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            const savedPreferred = localStorage.getItem('zenith_preferred_trainer_id');
            if (savedPT) setPtStatus(JSON.parse(savedPT));
            if (savedTrials) setTrialBookings(JSON.parse(savedTrials));
            setPreferredTrainerId(savedPreferred);
        } catch (e) {}
    };

    useEffect(() => {
        loadPTData();
        loadCapacities();
        const handler = (e?: any) => {
            loadPTData();
            if (e && e.key === CAPACITY_STORAGE_KEY) loadCapacities();
        };
        window.addEventListener('storage', handler);
        window.addEventListener('focus', handler);
        return () => {
            window.removeEventListener('storage', handler);
            window.removeEventListener('focus', handler);
        };
    }, []);

    // Load weekly workout plan (only when PT is unlocked)
    useEffect(() => {
        const savedWeekly = localStorage.getItem('zenith_workout_plan_weekly');
        if (savedWeekly) {
            try {
                const parsed = JSON.parse(savedWeekly);
                if (parsed.name === workoutPlan?.name) {
                    setWeeklyWorkoutPlan(parsed);
                } else {
                    setWeeklyWorkoutPlan(null);
                }
            } catch (e) {
                setWeeklyWorkoutPlan(null);
            }
        } else {
            setWeeklyWorkoutPlan(null);
        }
    }, [workoutPlan]);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysOfWeek[new Date().getDay()];

    const groupExercises = (exercises: any[]) => {
        const groups: Array<{ type: 'single' | 'superset', groupName?: string, items: any[] }> = [];
        let currentGroup: any[] = [];
        let currentGroupName = '';

        exercises.forEach((ex) => {
            if (ex.supersetGroup) {
                if (currentGroupName === ex.supersetGroup) {
                    currentGroup.push(ex);
                } else {
                    if (currentGroup.length > 0) {
                        groups.push({
                            type: currentGroupName ? 'superset' : 'single',
                            groupName: currentGroupName || undefined,
                            items: currentGroup
                        });
                    }
                    currentGroup = [ex];
                    currentGroupName = ex.supersetGroup;
                }
            } else {
                if (currentGroup.length > 0) {
                    groups.push({
                        type: currentGroupName ? 'superset' : 'single',
                        groupName: currentGroupName || undefined,
                        items: currentGroup
                    });
                }
                groups.push({
                    type: 'single',
                    items: [ex]
                });
                currentGroup = [];
                currentGroupName = '';
            }
        });

        if (currentGroup.length > 0) {
            groups.push({
                type: currentGroupName ? 'superset' : 'single',
                groupName: currentGroupName || undefined,
                items: currentGroup
            });
        }

        return groups;
    };

    const bookingDates = Array.from({ length: 3 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return {
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            formatted: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };
    });

    const TRAINER_TRIAL_SCHEDULES: Record<string, {
        availableDays: number[]; // indices 0, 1, 2
        availableSlots: string[];
    }> = {
        'sarah-chen': { availableDays: [0, 1], availableSlots: ['09:00 AM', '10:30 AM', '04:00 PM'] },
        'marcus-vance': { availableDays: [1, 2], availableSlots: ['02:30 PM', '04:00 PM', '05:30 PM'] },
        'elena-rostova': { availableDays: [0, 2], availableSlots: ['10:30 AM', '12:00 PM', '05:30 PM'] },
    };

    const bookingTimeSlots = [
        '09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
    ];

    const openTrialModalForTrainer = (trainer: typeof TRAINERS[0]) => {
        const sched = TRAINER_TRIAL_SCHEDULES[trainer.id] || { availableDays: [0, 1], availableSlots: ['09:00 AM', '02:30 PM', '05:30 PM'] };
        setBookingDateIdx(sched.availableDays[0] !== undefined ? sched.availableDays[0] : 0);
        setBookingTime(null);
        setActiveBookingTrainer(trainer);
    };

    const handleConfirmBooking = () => {
        if (!activeBookingTrainer || !bookingTime) return;

        const newBookings = {
            ...trialBookings,
            [activeBookingTrainer.id]: {
                date: bookingDates[bookingDateIdx].formatted,
                time: bookingTime,
                status: 'pending' as const
            }
        };

        setTrialBookings(newBookings);
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(newBookings));
        
        const updatedPT = {
            ...ptStatus,
            trialCompleted: true
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updatedPT));
        setPtStatus(updatedPT);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '📅 Trial Session Request',
            message: `${currentUser?.name || 'Alex'} has requested a trial session with you for ${bookingDates[bookingDateIdx].formatted} at ${bookingTime}.`,
            metadata: {
                type: 'TRIAL_REQUEST',
                trainerId: activeBookingTrainer.id,
                trainerName: activeBookingTrainer.name,
                memberEmail: currentUser?.email || 'member@nexusgym.com',
                memberName: currentUser?.name || 'Alex',
                date: bookingDates[bookingDateIdx].formatted,
                time: bookingTime,
                status: 'pending'
            }
        });

        toast.success("Trial Request Submitted!", {
            description: `Awaiting approval from ${activeBookingTrainer.name} for session on ${bookingDates[bookingDateIdx].formatted} at ${bookingTime}`
        });

        setActiveBookingTrainer(null);
    };

    const handleAcceptReschedule = (trainerId: string, trainerName: string) => {
        const current = trialBookings[trainerId];
        if (!current) return;
        const updated = {
            ...trialBookings,
            [trainerId]: {
                ...current,
                date: current.date || current.proposedDate,
                time: current.time || current.proposedTime,
                status: 'approved'
            }
        };
        setTrialBookings(updated);
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '✅ Rescheduled Trial Accepted!',
            message: `${currentUser?.name || 'Alex'} has accepted the rescheduled trial time (${current.date || current.proposedDate} at ${current.time || current.proposedTime}) with you.`,
            metadata: {
                type: 'TRIAL_APPROVED',
                trainerId,
                trainerName,
                date: current.date || current.proposedDate,
                time: current.time || current.proposedTime
            }
        });
        toast.success(`Rescheduled time with ${trainerName} accepted!`);
    };

    const handleDeclineReschedule = (trainerId: string, trainerName: string) => {
        const current = trialBookings[trainerId];
        if (!current) return;
        const updated = {
            ...trialBookings,
            [trainerId]: {
                ...current,
                status: 'rejected'
            }
        };
        setTrialBookings(updated);
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '❌ Rescheduled Trial Declined',
            message: `${currentUser?.name || 'Alex'} declined the rescheduled timing (${current.date} at ${current.time}) due to unavailability.`,
            metadata: {
                type: 'TRIAL_REJECTED',
                trainerId,
                trainerName
            }
        });
        toast.error(`Rescheduled time declined. You may book another slot anytime.`);
    };

    const handleCompleteTrialSession = (trainerId: string, trainerName: string) => {
        const savedBookings = localStorage.getItem('zenith_trainer_trials');
        const bookings = savedBookings ? JSON.parse(savedBookings) : {};
        bookings[trainerId] = {
            ...(bookings[trainerId] || {}),
            status: 'completed',
            date: bookings[trainerId]?.date || 'Today',
            time: bookings[trainerId]?.time || '10:00 AM'
        };
        localStorage.setItem('zenith_trainer_trials', JSON.stringify(bookings));
        setTrialBookings(bookings);

        const updatedPT = {
            ...ptStatus,
            trialCompleted: true
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updatedPT));
        setPtStatus(updatedPT);
        window.dispatchEvent(new Event('storage'));

        toast.success(`Trial session with ${trainerName} completed!`, {
            description: "You can now select your preferred trainer for Personal Training."
        });
    };

    const handleSendPTRequest = (trainer: typeof TRAINERS[0]) => {
        const updatedStatus = {
            ...ptStatus,
            status: 'pending',
            requestedTrainerId: trainer.id,
            requestedTrainerName: trainer.name,
            requestedTrainerRole: trainer.role,
            requestedTrainerImage: trainer.image,
            requestedTrainerSpecialties: trainer.specialties,
            requestDate: new Date().toISOString(),
            price: 9999,
            duration: '1 Month',
            trainerSelected: true,
            trialCompleted: true
        };

        localStorage.setItem('zenith_pt_status', JSON.stringify(updatedStatus));
        localStorage.setItem('zenith_preferred_trainer_id', trainer.id);
        setPreferredTrainerId(trainer.id);
        setPtStatus(updatedStatus);
        window.dispatchEvent(new Event('storage'));

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
                memberEmail: currentUser?.email || 'member@nexusgym.com'
            }
        });

        toast.success(`PT Request Submitted to ${trainer.name}!`, {
            description: "Awaiting trainer review and approval. You will be notified once confirmed."
        });
    };

    const handleSimulateTrainerApproval = () => {
        const updatedStatus = {
            ...ptStatus,
            status: 'approved',
            trainerApproved: true,
            approvalDate: new Date().toISOString()
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updatedStatus));
        setPtStatus(updatedStatus);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '✅ Personal Training Request Approved!',
            message: `Your Personal Training request with ${ptStatus.requestedTrainerName || 'your trainer'} has been approved! Complete payment to activate your plan.`
        });

        toast.success("Trainer request approved!", {
            description: "Step 3 (Payment) is now unlocked."
        });
    };

    const handleCompletePayment = async () => {
        setIsPaying(true);
        await new Promise(resolve => setTimeout(resolve, 1200));

        const today = new Date();
        const expiry = new Date();
        expiry.setDate(today.getDate() + 30);

        const trainerId = ptStatus.requestedTrainerId || preferredTrainerId || 'marcus-johnson';
        const trainerObj = TRAINERS.find(t => t.id === trainerId) || TRAINERS[0];

        const updatedPT = {
            ...ptStatus,
            status: 'paid',
            trialCompleted: true,
            trainerSelected: true,
            paymentCompleted: true,
            trainerApproved: true,
            paymentDate: today.toISOString(),
            startDate: today.toISOString(),
            expiryDate: expiry.toISOString(),
            approvalDate: today.toISOString(),
            assignedTrainerId: trainerObj.id,
            assignedTrainerName: trainerObj.name,
        };

        localStorage.setItem('zenith_pt_status', JSON.stringify(updatedPT));
        setPtStatus(updatedPT);

        // Update trial status to completed
        try {
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            const trials = savedTrials ? JSON.parse(savedTrials) : {};
            if (trials[trainerObj.id]) {
                trials[trainerObj.id].status = 'completed';
                localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                setTrialBookings(trials);
            }
        } catch (e) {}

        // Save Paid Invoice
        try {
            const newPaidInvoice = {
                id: `INV-2026-PT${Date.now().toString().slice(-3)}`,
                date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                amount: 9999,
                description: `Personal Training - ${trainerObj.name} (1 Month)`,
                status: 'Paid'
            };
            const savedInvoicesList = localStorage.getItem('zenith_member_invoices');
            const currentInvoices = savedInvoicesList ? JSON.parse(savedInvoicesList) : [];
            localStorage.setItem('zenith_member_invoices', JSON.stringify([newPaidInvoice, ...currentInvoices]));
        } catch (e) {}

        // Add to audit trail
        try {
            const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
            const logs = savedAudit ? JSON.parse(savedAudit) : [];
            const newLog = {
                id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                requestId: `local_${trainerObj.id}`,
                action: 'Completed',
                memberName: currentUser?.name || 'Alex Thompson',
                membershipId: 'NX-2026-9041',
                trainerName: trainerObj.name,
                timestamp: today.toISOString(),
                details: `Personal Training Payment Successful (₹9,999). Workouts unlocked.`
            };
            localStorage.setItem('zenith_trial_audit_trail', JSON.stringify([newLog, ...logs]));
        } catch (e) {}

        // Add member to trainer's My Members list if not already assigned
        try {
            const savedMembers = localStorage.getItem('zenith_trainer_members');
            const currentMembers = savedMembers ? JSON.parse(savedMembers) : [];
            const existingIdx = currentMembers.findIndex((m: any) => m.email === (currentUser?.email || 'alex.t@example.com'));
            const memberRecord = {
                id: currentUser?.id || 1,
                name: currentUser?.name || 'Alex Thompson',
                email: currentUser?.email || 'alex.t@example.com',
                phone: '+1 (555) 123-4567',
                status: 'Active',
                goal: (currentUser as any)?.goal || 'Weight Loss & Conditioning',
                progress: 10,
                workoutPlan: workoutPlan?.name || 'Personalized Routine',
                dietPlan: dietPlan?.name || 'Custom Nutrition Plan',
                lastCheckIn: 'Just now',
                joinDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                avatar: (currentUser?.name || 'Alex Thompson').split(' ').map((n: string) => n[0]).join('')
            };
            if (existingIdx >= 0) {
                currentMembers[existingIdx] = memberRecord;
            } else {
                currentMembers.unshift(memberRecord);
            }
            localStorage.setItem('zenith_trainer_members', JSON.stringify(currentMembers));
        } catch (e) {}

        // Send notifications
        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '✅ Personal Training Activated!',
            message: `Payment successful! Your Personal Training membership with ${trainerObj.name} is now active. My Workouts is unlocked!`,
        });

        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '💳 New PT Client Enrolled',
            message: `${currentUser?.name || 'Alex Thompson'} completed payment for Personal Training. They have been added to your My Members list.`,
            metadata: { memberEmail: currentUser?.email, trainerId: trainerObj.id }
        });

        window.dispatchEvent(new Event('storage'));
        setIsPaying(false);

        toast.success("Personal Training Activated!", {
            description: "Your workouts have been unlocked. Let's train!"
        });
    };

    // --- PT Gate Check ---
    const gate = computeUnlocked(ptStatus, trialBookings);

    // Locked State UI - Professional 4-Step Personal Training Onboarding
    if (!gate.allDone) {
        const trialEntries = Object.entries(trialBookings || {});
        const hasTrialBooked = trialEntries.length > 0;
        const isTrialCompleted = ptStatus?.trialCompleted || (hasTrialBooked && trialEntries.some(([, t]: any) => t.status === 'approved' || t.status === 'completed'));
        const isTrainerSelected = !!preferredTrainerId || !!ptStatus?.requestedTrainerId || !!ptStatus?.assignedTrainerId;
        const isRequestPending = ptStatus?.status === 'pending';
        const isRequestApproved = ptStatus?.status === 'approved' || ptStatus?.trainerApproved === true;
        const isPaid = ptStatus?.status === 'paid' || !!ptStatus?.paymentCompleted;

        let currentStep = 1;
        if (isPaid) {
            currentStep = 4;
        } else if (isRequestApproved) {
            currentStep = 3;
        } else if (isRequestPending || isTrainerSelected) {
            currentStep = 2;
        } else {
            currentStep = 1;
        }

        const requestedCoach = TRAINERS.find(t => t.id === ptStatus?.requestedTrainerId) ||
            TRAINERS.find(t => t.id === preferredTrainerId) ||
            TRAINERS[0];

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-16">
                {/* Onboarding Container Card */}
                <div className="w-full bg-slate-900/60 dark:bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    {/* Ambient glow */}
                    <div className="absolute top-0 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider w-fit mb-2">
                                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Exclusive Coaching Access</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase italic">
                                Personal Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Onboarding</span>
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 max-w-xl">
                                Follow our guided 4-step onboarding journey to activate your 1-on-1 Personal Training subscription and unlock your custom-engineered workout plans.
                            </p>
                        </div>

                        {/* Current Step Badge */}
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center gap-2.5 shadow-lg">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                                <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                                    Step {currentStep} of 4 — {ONBOARDING_STEPS[currentStep - 1].label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Progress Tracker */}
                    <div className="relative mb-10 pb-2">
                        <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
                            {ONBOARDING_STEPS.map((stepItem, idx) => {
                                const StepIcon = stepItem.icon;
                                const stepNum = stepItem.id;
                                const isCompleted = stepNum < currentStep || (stepNum === 4 && isPaid);
                                const isCurrent = stepNum === currentStep;

                                return (
                                    <div
                                        key={stepItem.id}
                                        className={`flex flex-col items-center text-center relative group transition-all duration-300 ${
                                            isCurrent
                                                ? 'scale-105'
                                                : isCompleted
                                                ? 'opacity-90'
                                                : 'opacity-40'
                                        }`}
                                    >
                                        {/* Connecting Line (for items 1 to 3) */}
                                        {idx < 3 && (
                                            <div className="absolute top-6 left-1/2 w-full h-[2px] bg-slate-800 -z-10">
                                                <div
                                                    className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ${
                                                        isCompleted ? 'w-full' : 'w-0'
                                                    }`}
                                                />
                                            </div>
                                        )}

                                        {/* Node Circle */}
                                        <div
                                            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 mb-2 shadow-lg ${
                                                isCompleted
                                                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/20'
                                                    : isCurrent
                                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-indigo-500/30'
                                                    : 'bg-slate-900 border-slate-700 text-slate-500'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                                            ) : (
                                                <StepIcon className="w-6 h-6" />
                                            )}
                                        </div>

                                        {/* Step Label */}
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={`text-xs font-black uppercase tracking-wider ${
                                                    isCurrent
                                                        ? 'text-indigo-400'
                                                        : isCompleted
                                                        ? 'text-emerald-400'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                Step {stepNum}
                                            </span>
                                            <span
                                                className={`text-xs font-bold mt-0.5 hidden sm:block ${
                                                    isCurrent
                                                        ? 'text-white'
                                                        : isCompleted
                                                        ? 'text-slate-300'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                {stepItem.label}
                                            </span>
                                            <span className="text-[10px] text-slate-500 hidden md:block mt-0.5">
                                                {stepItem.description}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DYNAMIC INTERFACE CONTENT BY STAGE */}

                    {/* STAGE 1: Choose Your Trainer (Trainer Trial or Direct Hire) */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                        <UserCheck className="w-5 h-5 text-indigo-400" />
                                        Step 1 — Choose Your Trainer
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                                        Select your personal coach. You can <strong className="text-emerald-400">Book a Trial Session (Option 1)</strong> to experience their training first, or <strong className="text-indigo-400">Hire Trainer Directly (Option 2)</strong> to skip the trial and submit your coaching request immediately.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs py-1 px-3 w-fit font-bold uppercase">
                                        Option 1: Trial (Optional)
                                    </Badge>
                                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs py-1 px-3 w-fit font-bold uppercase">
                                        Option 2: Direct Hire
                                    </Badge>
                                </div>
                            </div>

                            {/* Trainer Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {TRAINERS.map((trainer) => {
                                    const capacity = trainerCapacities[trainer.id] || { maxClients: 15, currentClients: 8 };
                                    const availableSlots = Math.max(0, (capacity.maxClients || 15) - (capacity.currentClients || 0));
                                    const trial = trialBookings[trainer.id];
                                    const isTrialScheduled = !!trial;
                                    const isTrainerFull = availableSlots === 0;

                                    return (
                                        <Card
                                            key={trainer.id}
                                            className={`bg-slate-900/60 border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between group ${
                                                isTrialScheduled
                                                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                                                    : 'border-slate-800/80 hover:border-indigo-500/40'
                                            }`}
                                        >
                                            <div>
                                                {/* Trainer Image & Badges Overlay */}
                                                <div className="relative h-56 w-full overflow-hidden">
                                                    <img
                                                        src={trainer.image}
                                                        alt={trainer.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                                                    {/* Top Badges */}
                                                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                                                        {isTrialScheduled ? (
                                                            <Badge className={`${
                                                                trial.status === 'rescheduled' || trial.status === 'rescheduled_by_trainer'
                                                                    ? 'bg-amber-500/90 text-black'
                                                                    : trial.status === 'rejected'
                                                                    ? 'bg-rose-500/90 text-white'
                                                                    : 'bg-emerald-500/90 text-black'
                                                            } font-black text-[10px] px-2.5 py-1 uppercase shadow-md`}>
                                                                {trial.status === 'completed'
                                                                    ? '✓ Trial Completed'
                                                                    : trial.status === 'rescheduled' || trial.status === 'rescheduled_by_trainer'
                                                                    ? `🔄 Rescheduled: ${trial.date} (${trial.time})`
                                                                    : trial.status === 'rejected'
                                                                    ? '✕ Trial Declined'
                                                                    : `✓ Scheduled: ${trial.date} (${trial.time})`}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-slate-900/80 backdrop-blur-md text-indigo-400 border-indigo-500/30 text-[10px] px-2.5 py-1 font-bold">
                                                                {trainer.experience} Exp
                                                            </Badge>
                                                        )}

                                                        <div className="flex items-center gap-1.5">
                                                            <Badge className="bg-slate-900/80 backdrop-blur-md text-amber-400 border-amber-500/30 text-[10px] px-2 py-1 font-bold flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                {trainer.rating}
                                                            </Badge>
                                                            <Badge className={`backdrop-blur-md text-[10px] px-2 py-1 font-bold ${
                                                                isTrainerFull
                                                                    ? 'bg-rose-950/80 text-rose-400 border-rose-500/30'
                                                                    : 'bg-slate-900/80 text-emerald-400 border-emerald-500/30'
                                                            }`}>
                                                                {isTrainerFull ? 'Full' : `${availableSlots} Spots Open`}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Name & Role overlay */}
                                                    <div className="absolute bottom-3 left-4 right-4">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                                                            {trainer.role}
                                                        </p>
                                                        <h3 className="text-xl font-bold text-white tracking-tight">
                                                            {trainer.name}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <CardContent className="p-5 space-y-4">
                                                    {/* Short Bio */}
                                                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                                        {trainer.bio}
                                                    </p>

                                                    {/* Specializations Tags */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {trainer.specialties.map((spec, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                                className="bg-slate-950/50 text-slate-300 border-slate-800 text-[10px] px-2 py-0.5"
                                                            >
                                                                {spec}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    {/* Availability & Goals preview */}
                                                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Availability:</span>
                                                            <span className="text-slate-300 font-medium">{trainer.availability.split(' (')[0]}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Primary Goal:</span>
                                                            <span className="text-indigo-400 font-semibold">{trainer.trainingGoals[0]}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </div>

                                            {/* Footer Actions */}
                                            <CardFooter className="p-5 pt-0 flex flex-col gap-2">
                                                {/* RESCHEDULE PROPOSAL CARD */}
                                                {isTrialScheduled && (trial.status === 'rescheduled' || trial.status === 'rescheduled_by_trainer') && (
                                                    <div className="p-3.5 w-full bg-amber-500/15 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                                                Coach Proposed New Time
                                                            </span>
                                                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">Action Needed</Badge>
                                                        </div>
                                                        <p className="text-slate-300">
                                                            New Proposed Time: <strong className="text-white">{trial.date || trial.proposedDate} at {trial.time || trial.proposedTime}</strong>
                                                        </p>
                                                        <div className="flex gap-2 pt-0.5">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAcceptReschedule(trainer.id, trainer.name)}
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 rounded-xl font-bold gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept Time
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDeclineReschedule(trainer.id, trainer.name)}
                                                                className="flex-1 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs h-8 rounded-xl font-bold gap-1"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" /> Decline
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* APOLOGY CARD FOR REJECTED TRIAL */}
                                                {isTrialScheduled && trial.status === 'rejected' && (
                                                    <div className="p-3.5 w-full bg-rose-500/15 border border-rose-500/30 rounded-2xl space-y-2 text-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-rose-300 flex items-center gap-1.5">
                                                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                                                Trial Unavailable
                                                            </span>
                                                            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[9px]">Apology</Badge>
                                                        </div>
                                                        <p className="text-slate-300 leading-relaxed">
                                                            We apologize, Coach {trainer.name} is unavailable for that slot.
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openTrialModalForTrainer(trainer)}
                                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs h-8 rounded-xl font-bold border border-slate-700"
                                                        >
                                                            Book Another Slot
                                                        </Button>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 w-full">
                                                    {/* View Profile Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setActiveProfileTrainer(trainer)}
                                                        className="w-full bg-slate-900/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-white font-bold text-xs gap-1.5 rounded-xl h-10"
                                                    >
                                                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                                                        Profile
                                                    </Button>

                                                    {/* Option 1: Book Trial / Complete Trial */}
                                                    <Button
                                                        size="sm"
                                                        disabled={isTrainerFull && !isTrialScheduled}
                                                        onClick={() => {
                                                            if (isTrialScheduled && trial.status !== 'completed' && trial.status !== 'rejected') {
                                                                handleCompleteTrialSession(trainer.id, trainer.name);
                                                            } else {
                                                                openTrialModalForTrainer(trainer);
                                                            }
                                                        }}
                                                        className={`w-full font-bold text-xs gap-1.5 rounded-xl h-10 shadow-md ${
                                                            isTrialScheduled && trial.status !== 'rejected'
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                                                                : 'bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                                                        }`}
                                                    >
                                                        {isTrialScheduled && trial.status !== 'rejected' ? (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                                {trial.status === 'completed' ? 'Trial Done' : 'Complete Trial'}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                                                                Book Trial
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Option 2: Hire Trainer Directly / Choose Coach */}
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSendPTRequest(trainer)}
                                                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 shadow-lg shadow-indigo-900/30 border border-indigo-400/20"
                                                >
                                                    <UserCheck className="w-4 h-4 shrink-0" />
                                                    {isTrialScheduled ? 'Select Coach & Continue →' : 'Hire Trainer Directly (Skip Trial) →'}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* STAGE 2: Waiting for Trainer Approval */}
                    {currentStep === 2 && (
                        <div className="max-w-2xl mx-auto py-6 space-y-6">
                            <div className="bg-slate-900/80 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 text-center space-y-6 relative overflow-hidden shadow-2xl">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                                    <Clock className="w-8 h-8" />
                                </div>

                                <div className="space-y-2">
                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs px-3 py-1 font-black uppercase tracking-wider">
                                        Step 2: Under Coach Review
                                    </Badge>
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                                        Waiting for Trainer <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">Approval</span>
                                    </h2>
                                    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                        Your official Personal Training request has been submitted to your preferred coach. They will review your goals and schedule shortly.
                                    </p>
                                </div>

                                {/* Selected Coach Summary */}
                                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-left">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={requestedCoach.image}
                                            alt={requestedCoach.name}
                                            className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                                        />
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Coach</p>
                                            <h4 className="text-lg font-bold text-white">{ptStatus.requestedTrainerName || requestedCoach.name}</h4>
                                            <p className="text-xs text-slate-400">{requestedCoach.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-1 font-bold">
                                            Est. Response: &lt; 2 Hours
                                        </Badge>
                                    </div>
                                </div>

                                {/* Disabled Main Button + Demo Instant Approval */}
                                <div className="space-y-3 pt-2">
                                    <Button
                                        disabled
                                        className="w-full h-12 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Clock className="w-4 h-4 animate-spin text-amber-400" />
                                        Waiting for Trainer Approval...
                                    </Button>

                                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                localStorage.removeItem('zenith_pt_status');
                                                localStorage.removeItem('zenith_preferred_trainer_id');
                                                setPreferredTrainerId(null);
                                                setPtStatus({});
                                                window.dispatchEvent(new Event('storage'));
                                                toast.info("Request reset. You can select another coach.");
                                            }}
                                            className="text-xs text-slate-400 hover:text-white"
                                        >
                                            Change Selected Coach
                                        </Button>

                                        {/* Demo Instant Approval helper */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSimulateTrainerApproval}
                                            className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold gap-1 rounded-lg"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            (Demo: Simulate Trainer Approval)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STAGE 3: Complete Personal Training Payment */}
                    {currentStep === 3 && (
                        <div className="max-w-2xl mx-auto py-6 space-y-6">
                            <div className="bg-slate-900/80 border-2 border-emerald-500/30 rounded-3xl p-6 md:p-8 text-center space-y-6 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                                    <CreditCard className="w-8 h-8" />
                                </div>

                                <div className="space-y-2">
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-3 py-1 font-black uppercase tracking-wider">
                                        Step 3: Request Approved — Payment Unlocked
                                    </Badge>
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                                        Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Payment</span>
                                    </h2>
                                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                                        Coach <strong className="text-white">{ptStatus.requestedTrainerName || requestedCoach.name}</strong> has approved your Personal Training enrollment! Complete your secure payment below to instantly unlock your workout plans.
                                    </p>
                                </div>

                                {/* Package Summary Card */}
                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-left">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Personal Training Package</p>
                                            <h4 className="text-lg font-bold text-white">Elite 1-on-1 Coaching (1 Month)</h4>
                                            <p className="text-xs text-slate-400">Assigned Coach: {ptStatus.requestedTrainerName || requestedCoach.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white">₹9,999</p>
                                            <p className="text-[11px] text-slate-400">/ 30 Days</p>
                                        </div>
                                    </div>

                                    {/* Inclusions Checklists */}
                                    <div className="space-y-2 text-xs text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Custom 1-on-1 Workout Programming & Progressive Overload</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Personalized Nutrition Plan & Daily Macro Targets</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Daily Coach Check-ins & Video Form Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Priority Gym Floor Assistance & Mobility Protocols</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Action Button */}
                                <div className="space-y-3 pt-2">
                                    <Button
                                        onClick={handleCompletePayment}
                                        disabled={isPaying}
                                        className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/30 gap-2 transition-all"
                                    >
                                        {isPaying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing Activation...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Complete Payment — ₹9,999
                                                <ArrowRight className="w-5 h-5 ml-1" />
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-[11px] text-slate-500">
                                        🔒 Instant activation upon confirmation. Workouts section unlocks immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODALS: TRAINER PROFILE DIALOG */}
                <Dialog open={!!activeProfileTrainer} onOpenChange={() => setActiveProfileTrainer(null)}>
                    <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-white rounded-3xl p-0 overflow-hidden">
                        {activeProfileTrainer && (
                            <div>
                                <div className="relative h-64 w-full">
                                    <img
                                        src={activeProfileTrainer.image}
                                        alt={activeProfileTrainer.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                    <div className="absolute bottom-4 left-6 right-6">
                                        <Badge className="bg-indigo-500 text-white font-bold text-xs px-3 py-1 uppercase mb-1">
                                            {activeProfileTrainer.role}
                                        </Badge>
                                        <h3 className="text-3xl font-black text-white">
                                            {activeProfileTrainer.name}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                    {/* Long Bio */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">About Coach</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {activeProfileTrainer.longBio}
                                        </p>
                                    </div>

                                    {/* Certifications & Specialties */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certifications</h5>
                                            <ul className="space-y-1">
                                                {activeProfileTrainer.certifications.map((c, idx) => (
                                                    <li key={idx} className="text-xs text-white flex items-center gap-1.5 font-medium">
                                                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Training Goals</h5>
                                            <div className="flex flex-wrap gap-1.5">
                                                {activeProfileTrainer.trainingGoals.map((g, idx) => (
                                                    <Badge key={idx} className="bg-indigo-950/80 text-indigo-300 border-indigo-500/30 text-xs font-semibold">
                                                        {g}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
                                        <div>
                                            <span className="text-slate-500">Regular Schedule:</span>
                                            <strong className="text-white ml-1">{activeProfileTrainer.availability}</strong>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Experience:</span>
                                            <strong className="text-emerald-400 ml-1">{activeProfileTrainer.experience}</strong>
                                        </div>
                                    </div>

                                    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveProfileTrainer(null)}
                                            className="bg-slate-900 border-slate-700 text-white font-bold"
                                        >
                                            Close
                                        </Button>
                                        {currentStep === 1 && (
                                            <>
                                                <Button
                                                    onClick={() => {
                                                        const t = activeProfileTrainer;
                                                        setActiveProfileTrainer(null);
                                                        setActiveBookingTrainer(t);
                                                    }}
                                                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold gap-1.5"
                                                >
                                                    <Dumbbell className="w-4 h-4" />
                                                    Book Trial Session
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        const t = activeProfileTrainer;
                                                        setActiveProfileTrainer(null);
                                                        handleSendPTRequest(t);
                                                    }}
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold gap-1.5"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                    Hire Trainer Directly
                                                </Button>
                                            </>
                                        )}
                                    </DialogFooter>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* MODALS: TRIAL BOOKING DIALOG */}
                <Dialog open={!!activeBookingTrainer} onOpenChange={() => setActiveBookingTrainer(null)}>
                    <DialogContent className="max-w-md bg-slate-950 border border-slate-800 text-white rounded-3xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase text-white flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                                Book Free Trial Session
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400">
                                Schedule your complimentary 1-on-1 assessment and consultation with {activeBookingTrainer?.name}.
                            </DialogDescription>
                        </DialogHeader>

                        {activeBookingTrainer && (
                            <div className="space-y-6 pt-2">
                                {/* Coach preview badge */}
                                <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                                    <img
                                        src={activeBookingTrainer.image}
                                        alt={activeBookingTrainer.name}
                                        className="w-12 h-12 rounded-xl object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white">{activeBookingTrainer.name}</h4>
                                        <p className="text-xs text-indigo-400">{activeBookingTrainer.role}</p>
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] shrink-0">
                                        Live Schedule
                                    </Badge>
                                </div>

                                {/* Pick Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                            1. Select Available Date
                                        </label>
                                        <span className="text-[10px] text-slate-500">Coach's working days only</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {bookingDates.map((dateObj, idx) => {
                                            const sched = TRAINER_TRIAL_SCHEDULES[activeBookingTrainer.id] || { availableDays: [0, 1], availableSlots: ['09:00 AM', '02:30 PM', '05:30 PM'] };
                                            const isDayAvailable = sched.availableDays.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={!isDayAvailable}
                                                    onClick={() => isDayAvailable && setBookingDateIdx(idx)}
                                                    className={`p-3 rounded-2xl border text-center transition-all ${
                                                        !isDayAvailable
                                                            ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                                                            : bookingDateIdx === idx
                                                            ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md'
                                                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <p className="text-[10px] font-bold uppercase tracking-wider">{dateObj.label}</p>
                                                    <p className="text-lg font-black">{dateObj.date}</p>
                                                    <p className="text-[10px] text-slate-500">{dateObj.month}</p>
                                                    {isDayAvailable ? (
                                                        <span className="block text-[9px] text-emerald-400 font-bold mt-1">● Available</span>
                                                    ) : (
                                                        <span className="block text-[9px] text-rose-500 font-bold mt-1">✕ Coach Busy</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pick Time Slot */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                            2. Select Available Time Slot
                                        </label>
                                        <span className="text-[10px] text-slate-500">Open slots shown in green</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {bookingTimeSlots.map((time, idx) => {
                                            const sched = TRAINER_TRIAL_SCHEDULES[activeBookingTrainer.id] || { availableDays: [0, 1], availableSlots: ['09:00 AM', '02:30 PM', '05:30 PM'] };
                                            const isSlotAvailable = sched.availableSlots.includes(time);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={!isSlotAvailable}
                                                    onClick={() => isSlotAvailable && setBookingTime(time)}
                                                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                                        !isSlotAvailable
                                                            ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                                                            : bookingTime === time
                                                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                                                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <span>{time}</span>
                                                    {isSlotAvailable ? (
                                                        <span className="block text-[9px] text-emerald-400 font-normal">● Open</span>
                                                    ) : (
                                                        <span className="block text-[9px] text-rose-500/80 font-normal">Booked</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-2 pt-4 border-t border-slate-800">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveBookingTrainer(null)}
                                        className="w-full bg-slate-900 border-slate-700 text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={!bookingTime}
                                        onClick={handleConfirmBooking}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold"
                                    >
                                        Confirm Trial Session
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    if (!workoutPlan || !dietPlan) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-500/20 rounded-full"></div>
                    <p className="text-indigo-400 font-medium">Syncing your elite routines...</p>
                </div>
            </div>
        );
    }

    const WORKOUT_PLAN = (workoutPlan && Array.isArray((workoutPlan as any).schedule)) ? (workoutPlan as any) : DEFAULT_WORKOUT_PLAN;
    const DIET_PLAN = (dietPlan && Array.isArray((dietPlan as any).meals) && (dietPlan as any).macros?.protein) ? (dietPlan as any) : DEFAULT_DIET_PLAN;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
                <div className="flex-1 bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                            <Target className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Active Phase</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight italic uppercase">
                            MY <span className="text-primary">WORKOUTS</span>
                        </h1>
                        <p className="text-slate-200 max-w-xl text-lg">
                            Master your evolution with custom-engineered routines. These plans are dynamically updated by your elite trainer based on your biometrics.
                        </p>
                    </div>
                </div>

                {/* Trainer Assignment Card */}
                <Card className="w-full lg:w-80 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full border-2 border-indigo-500/50 p-1">
                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-indigo-600 dark:text-indigo-400">
                                    {ptStatus.assignedTrainerName ? ptStatus.assignedTrainerName.split(' ').map((n: string) => n[0]).join('') : 'MJ'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] mb-1">Elite Trainer</p>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {ptStatus.assignedTrainerName || 'Marcus Johnson'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {ptStatus.assignedTrainerName === 'Sarah Chen' ? 'Specializing in HIIT & Cardio Conditioning' :
                                 ptStatus.assignedTrainerName === 'Michael Rivers' ? 'Specializing in Injury Prevention & Recovery' :
                                 'Specializing in Strength & Conditioning'}
                            </p>
                            {ptStatus.startDate && ptStatus.expiryDate && (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 text-left">
                                    <div className="flex justify-between">
                                        <span>Active Since:</span>
                                        <span className="text-slate-300 font-semibold">{new Date(ptStatus.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Renews On:</span>
                                        <span className="text-slate-300 font-semibold">{new Date(ptStatus.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Demo reset button */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem('zenith_pt_status');
                                    localStorage.removeItem('zenith_trainer_trials');
                                    localStorage.removeItem('zenith_preferred_trainer_id');
                                    setPreferredTrainerId(null);
                                    setPtStatus({});
                                    setTrialBookings({});
                                    window.dispatchEvent(new Event('storage'));
                                    toast.info("Personal Training Onboarding reset for testing/demo.");
                                }}
                                className="mt-3 text-[10px] text-slate-500 hover:text-rose-400 underline transition-colors"
                            >
                                Reset Onboarding (Demo)
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Custom Trainer Workout Banner */}
            <Card className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-indigo-500/20 text-white rounded-3xl overflow-hidden relative">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 text-xs font-bold tracking-wider uppercase">
                            <Zap className="w-4 h-4 fill-indigo-400" />
                            <span>1-on-1 Personalized Programming</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                            Want to modify this plan with your trainer?
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xl">
                            You can request exercise substitutions, adjust workout days, or update your cardio volume directly with your coach.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <Link href="/member/alerts">
                            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-11 px-6 shadow-lg shadow-indigo-600/30">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message Trainer
                            </Button>
                        </Link>
                        <Link href="/member/progress">
                            <Button variant="outline" className="w-full sm:w-auto border-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl h-11 px-6">
                                View Biometrics
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="workouts" className="w-full space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto">
                    <TabsTrigger
                        value="workouts"
                        className="rounded-xl px-6 py-3 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white shadow-none transition-all"
                    >
                        <Dumbbell className="w-4 h-4 mr-2 inline-block" />
                        Workout Plan
                    </TabsTrigger>
                    <TabsTrigger
                        value="diet"
                        className="rounded-xl px-6 py-3 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white shadow-none transition-all"
                    >
                        <Utensils className="w-4 h-4 mr-2 inline-block" />
                        Nutrition & Macros
                    </TabsTrigger>
                </TabsList>

                {/* WORKOUT PLAN TAB */}
                <TabsContent value="workouts" className="space-y-6">
                    {/* Active Plan Overview Header */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                                        {WORKOUT_PLAN.level}
                                    </Badge>
                                    <Badge variant="outline" className="text-slate-400 border-slate-700 px-2.5 py-0.5 rounded-full text-xs">
                                        {WORKOUT_PLAN.goal}
                                    </Badge>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">
                                    {WORKOUT_PLAN.name}
                                </h2>
                                <p className="text-slate-400 text-sm max-w-2xl">
                                    {WORKOUT_PLAN.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                                <div className="text-center px-4 border-r border-slate-800">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Duration</p>
                                    <p className="text-base font-black text-white mt-0.5">{WORKOUT_PLAN.duration}</p>
                                </div>
                                <div className="text-center px-4 border-r border-slate-800">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Frequency</p>
                                    <p className="text-base font-black text-white mt-0.5">{WORKOUT_PLAN.frequency}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Assigned By</p>
                                    <p className="text-base font-black text-indigo-400 mt-0.5">{WORKOUT_PLAN.trainer}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Today's Workout Focus */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Weekly Schedule & Routines
                            </h3>
                            <p className="text-slate-400 text-xs">
                                Click on any day to inspect the programmed exercises, sets, reps, and supersets.
                            </p>
                        </div>
                    </div>

                    {/* Schedule Accordion */}
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue={`day-${DAYS.indexOf(todayName) !== -1 ? DAYS.indexOf(todayName) : 0}`}
                        className="space-y-4"
                    >
                        {WORKOUT_PLAN.schedule.map((daySchedule: any, index: number) => {
                            const isToday = DAYS[index] === todayName;
                            const exerciseGroups = groupExercises(daySchedule.exercises);

                            return (
                                <AccordionItem
                                    key={index}
                                    value={`day-${index}`}
                                    className={`border rounded-3xl overflow-hidden transition-all duration-300 ${isToday
                                        ? 'bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                                        : 'bg-white dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80 hover:border-slate-700'
                                        }`}
                                >
                                    <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${isToday
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                                                    }`}>
                                                    D{index + 1}
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                                            {DAYS[index]}
                                                        </span>
                                                        {isToday && (
                                                            <Badge className="bg-indigo-500 text-white text-[10px] px-2 py-0 h-4 font-black uppercase">
                                                                Today
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                                                        {daySchedule.day}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold ${daySchedule.day === 'Rest Day' || daySchedule.day.includes('Rest')
                                                        ? 'bg-slate-500/10 text-slate-400 border-slate-700'
                                                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                        }`}
                                                >
                                                    {daySchedule.focus}
                                                </Badge>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {daySchedule.exercises.length} Exercises
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                        {daySchedule.exercises.length === 0 ? (
                                            <div className="py-8 text-center text-slate-500 text-sm">
                                                <p>Active recovery day. Focus on hydration, stretching, and light mobility work.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pt-4">
                                                {exerciseGroups.map((group, groupIdx) => {
                                                    if (group.type === 'superset') {
                                                        return (
                                                            <div
                                                                key={groupIdx}
                                                                className="bg-indigo-950/20 border-2 border-indigo-500/30 rounded-2xl p-4 md:p-5 relative overflow-hidden space-y-4"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <Badge className="bg-indigo-500 text-white font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                                                                        🔥 Superset Group {group.groupName}
                                                                    </Badge>
                                                                    <span className="text-xs text-indigo-400 font-medium">
                                                                        Perform back-to-back with minimal rest
                                                                    </span>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {group.items.map((ex: any, idx: number) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                                        >
                                                                            <div className="space-y-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-black text-xs flex items-center justify-center">
                                                                                        {idx + 1}
                                                                                    </span>
                                                                                    <h5 className="font-bold text-white text-base">
                                                                                        {ex.name}
                                                                                    </h5>
                                                                                </div>
                                                                                {EXERCISE_INSTRUCTIONS[ex.name] && (
                                                                                    <p className="text-xs text-slate-400 pl-8">
                                                                                        {EXERCISE_INSTRUCTIONS[ex.name][0]}
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex items-center gap-3 pl-8 md:pl-0">
                                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[70px]">
                                                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Sets</p>
                                                                                    <p className="text-sm font-bold text-white">{ex.sets}</p>
                                                                                </div>
                                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[70px]">
                                                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Reps</p>
                                                                                    <p className="text-sm font-bold text-white">{ex.reps}</p>
                                                                                </div>
                                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[70px]">
                                                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Rest</p>
                                                                                    <p className="text-sm font-bold text-indigo-400">{ex.rest}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    const ex = group.items[0];
                                                    return (
                                                        <div
                                                            key={groupIdx}
                                                            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-black text-xs flex items-center justify-center">
                                                                        {groupIdx + 1}
                                                                    </span>
                                                                    <h5 className="font-bold text-slate-800 dark:text-white text-base">
                                                                        {ex.name}
                                                                    </h5>
                                                                </div>
                                                                {EXERCISE_INSTRUCTIONS[ex.name] && (
                                                                    <p className="text-xs text-slate-400 pl-8">
                                                                        {EXERCISE_INSTRUCTIONS[ex.name][0]}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-3 pl-8 md:pl-0">
                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[70px]">
                                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Sets</p>
                                                                    <p className="text-sm font-bold text-white">{ex.sets}</p>
                                                                </div>
                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[70px]">
                                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Reps</p>
                                                                    <p className="text-sm font-bold text-white">{ex.reps}</p>
                                                                </div>
                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[70px]">
                                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Rest</p>
                                                                    <p className="text-sm font-bold text-indigo-400">{ex.rest}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Start Workout Button for today */}
                                                {isToday && (
                                                    <div className="pt-4 flex justify-end">
                                                        <Link href="/member/workout/active">
                                                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-indigo-600/30 gap-2">
                                                                <Flame className="w-4 h-4 fill-white" />
                                                                Start Workout Session
                                                                <ArrowRight className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </TabsContent>

                {/* DIET & NUTRITION TAB */}
                <TabsContent value="diet" className="space-y-6">
                    {/* Diet Overview Header */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                                    {DIET_PLAN.type} Nutrition Plan
                                </Badge>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">
                                    {DIET_PLAN.name}
                                </h2>
                                <p className="text-slate-400 text-sm max-w-2xl">
                                    {DIET_PLAN.description}
                                </p>
                            </div>

                            {/* Macro Targets Summary */}
                            <div className="grid grid-cols-4 gap-2 md:gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                                <div className="text-center px-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Calories</p>
                                    <p className="text-base font-black text-white mt-0.5">{DIET_PLAN.dailyCalories}</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Protein</p>
                                    <p className="text-base font-black text-emerald-400 mt-0.5">{DIET_PLAN.macros.protein}</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Carbs</p>
                                    <p className="text-base font-black text-blue-400 mt-0.5">{DIET_PLAN.macros.carbs}</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Fats</p>
                                    <p className="text-base font-black text-amber-400 mt-0.5">{DIET_PLAN.macros.fats}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Daily Meals Breakdown */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            Daily Meal Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {DIET_PLAN.meals.map((meal: any, idx: number) => (
                                <Card
                                    key={idx}
                                    className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                                                <Utensils className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                                    {meal.meal}
                                                </h4>
                                                <p className="text-xs text-slate-400">{meal.time}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 font-bold">
                                            {meal.calories} kcal
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                            Recommended Items
                                        </p>
                                        <ul className="space-y-1.5">
                                            {meal.items.map((item: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                                        <span>Target Protein:</span>
                                        <strong className="text-white">{meal.protein || '35g'}</strong>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
