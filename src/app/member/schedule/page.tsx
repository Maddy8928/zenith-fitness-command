'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    User, 
    Info, 
    ArrowRight, 
    ShieldCheck, 
    Dumbbell, 
    CalendarDays, 
    Check, 
    X,
    Heart,
    Flame,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar'; 
import { format, isSameDay, addDays } from 'date-fns';
import { getStoredClasses, enrollMemberInClass, cancelEnrollment, GymClass } from '@/lib/classes-data';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface NonClassEvent {
    id: string;
    title: string;
    dateTime: string; 
    duration: string;
    instructor: string;
    location: string;
    type: 'PT' | 'WORKSHOP';
    status: 'Booked';
    description: string;
}

interface RenderableEvent {
    id: string;
    title: string;
    dateTime: string; 
    time: string; 
    duration: string;
    instructor: string;
    location: string;
    type: string;
    isGymClass: boolean;
    status: 'Booked' | 'Available' | 'Full' | 'Ongoing' | 'Completed' | 'Cancelled';
    spotsLeft?: number;
    capacity?: number;
    description: string;
    participantsCount: number;
}

const generateMockNonClasses = (): NonClassEvent[] => {
    const today = new Date();
    
    const d1 = new Date(today);
    d1.setHours(17, 30, 0, 0); 

    const d2 = new Date(today);
    d2.setDate(today.getDate() + 1);
    d2.setHours(18, 0, 0, 0); 

    return [
        {
            id: 'non-class-1',
            title: 'Personal Training (Lower Body)',
            dateTime: d1.toISOString(),
            duration: '60 mins',
            instructor: 'Coach John',
            location: 'Main Floor (Squat Racks)',
            type: 'PT',
            status: 'Booked',
            description: 'Focus on compound movements: Squats, deadlifts, and lunges for maximum strength.'
        },
        {
            id: 'non-class-2',
            title: 'Nutrition & Macro Workshop',
            dateTime: d2.toISOString(),
            duration: '90 mins',
            instructor: 'Dr. Emily Chen',
            location: 'Conference Room B',
            type: 'WORKSHOP',
            status: 'Booked',
            description: 'Learn how to accurately track macros and align your diet with your fitness goals.'
        }
    ];
};

const formatClassTime = (isoString: string): string => {
    try {
        const d = new Date(isoString);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
        return '12:00 PM';
    }
};

export default function MemberSchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [classes, setClasses] = useState<GymClass[]>([]);
    const [viewTab, setViewTab] = useState<'all' | 'my-bookings'>('all');
    
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    
    const memberEmail = user?.email || 'member@nexusgym.com';
    const memberName = user?.name || 'Jane Smith';

    // Load classes and listen to storage events
    useEffect(() => {
        setClasses(getStoredClasses());

        const handleStorageChange = () => {
            setClasses(getStoredClasses());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const nonClasses = useMemo(() => generateMockNonClasses(), []);

    const allEvents = useMemo(() => {
        const list: RenderableEvent[] = [];

        // 1. Gym Classes
        classes.forEach(c => {
            // Exclude HYROX training if it slips in
            if (c.name.toLowerCase().includes('hyrox') || c.type.toLowerCase().includes('hyrox')) {
                return;
            }

            const isEnrolled = c.participants.some(p => p.email.toLowerCase() === memberEmail.toLowerCase());
            
            let status: RenderableEvent['status'] = 'Available';
            if (c.status === 'Cancelled') {
                status = 'Cancelled';
            } else if (isEnrolled) {
                status = 'Booked';
            } else if (c.status === 'Completed') {
                status = 'Completed';
            } else if (c.status === 'Ongoing') {
                status = 'Ongoing';
            } else if (c.participants.length >= c.capacity) {
                status = 'Full';
            }

            const timeStr = formatClassTime(c.dateTime);

            list.push({
                id: c.id,
                title: c.name,
                dateTime: c.dateTime,
                time: timeStr,
                duration: c.duration,
                instructor: c.instructor,
                location: c.room,
                type: c.type,
                isGymClass: true,
                status,
                spotsLeft: Math.max(0, c.capacity - c.participants.length),
                capacity: c.capacity,
                description: c.description,
                participantsCount: c.participants.length
            });
        });

        // 2. PT / Workshop non-classes
        nonClasses.forEach(nc => {
            const timeStr = formatClassTime(nc.dateTime);
            list.push({
                id: nc.id,
                title: nc.title,
                dateTime: nc.dateTime,
                time: timeStr,
                duration: nc.duration,
                instructor: nc.instructor,
                location: nc.location,
                type: nc.type,
                isGymClass: false,
                status: 'Booked',
                description: nc.description,
                participantsCount: 1
            });
        });

        return list;
    }, [classes, nonClasses, memberEmail]);

    const filteredEvents = useMemo(() => {
        if (!date) return [];
        return allEvents.filter(e => isSameDay(new Date(e.dateTime), date))
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    }, [allEvents, date]);

    const displayedEvents = useMemo(() => {
        if (viewTab === 'my-bookings') {
            return filteredEvents.filter(e => e.status === 'Booked');
        }
        return filteredEvents;
    }, [filteredEvents, viewTab]);

    const userBookedClassesCount = useMemo(() => {
        return classes.filter(c =>
            c.status !== 'Cancelled' &&
            c.participants.some(p => p.email.toLowerCase() === memberEmail.toLowerCase())
        ).length;
    }, [classes, memberEmail]);

    const nextBookedSession = useMemo(() => {
        const booked = allEvents
            .filter(e => e.status === 'Booked' && new Date(e.dateTime) >= new Date())
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        return booked[0] || null;
    }, [allEvents]);

    const handleEnroll = (classId: string) => {
        try {
            const updated = enrollMemberInClass(classId, {
                name: memberName,
                email: memberEmail
            });
            setClasses(updated);

            const gymClass = updated.find(c => c.id === classId);
            if (gymClass) {
                const formattedDate = new Date(gymClass.dateTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Member notification
                addNotification({
                    role: 'member',
                    userId: user?.id || '3',
                    category: 'MEMBER',
                    priority: 'low',
                    title: `✅ Enrollment Confirmed: ${gymClass.name}`,
                    message: `You have successfully enrolled in ${gymClass.name} with Coach ${gymClass.instructor} on ${formattedDate} in ${gymClass.room}.`,
                });

                // Receptionist notification
                addNotification({
                    role: 'receptionist',
                    category: 'MEMBER',
                    priority: 'medium',
                    title: `👤 New Class Enrollment: ${memberName}`,
                    message: `${memberName} (${memberEmail}) has enrolled in ${gymClass.name} on ${formattedDate}.`,
                    metadata: {
                        classId: gymClass.id,
                        className: gymClass.name,
                        memberName: memberName,
                        memberEmail: memberEmail
                    }
                });

                toast.success(`Enrolled in ${gymClass.name} successfully!`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to enroll in class');
        }
    };

    const handleCancel = (classId: string) => {
        const updated = cancelEnrollment(classId, memberEmail);
        setClasses(updated);

        const gymClass = classes.find(c => c.id === classId);
        if (gymClass) {
            const formattedDate = new Date(gymClass.dateTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Member cancellation notification
            addNotification({
                role: 'member',
                userId: user?.id || '3',
                category: 'MEMBER',
                priority: 'low',
                title: `❌ Enrollment Cancelled: ${gymClass.name}`,
                message: `You have cancelled your enrollment for ${gymClass.name} on ${formattedDate}.`,
            });

            // Receptionist notification
            addNotification({
                role: 'receptionist',
                category: 'MEMBER',
                priority: 'medium',
                title: `👤 Class Enrollment Cancelled: ${memberName}`,
                message: `${memberName} (${memberEmail}) has cancelled their enrollment in ${gymClass.name} on ${formattedDate}.`,
                metadata: {
                    classId: gymClass.id,
                    className: gymClass.name,
                    memberName: memberName,
                    memberEmail: memberEmail
                }
            });

            toast.warning(`Cancelled enrollment for ${gymClass.name}.`);
        }
    };

    const handleBookNewClassClick = () => {
        setDate(new Date());
        setViewTab('all');
        toast.info("Showing classes for today. Click 'Enroll' on any class to book!");
    };

    const getStatusColor = (status: RenderableEvent['status']) => {
        switch (status) {
            case 'Booked': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Available': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Full': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Ongoing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'Completed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Yoga':
            case 'Pilates':
                return <Heart className="w-4 h-4 text-rose-400" />;
            case 'Zumba':
            case 'Dance Fitness':
                return <Flame className="w-4 h-4 text-orange-500" />;
            case 'Functional Training':
            case 'Aerobics':
                return <Activity className="w-4 h-4 text-blue-500" />;
            case 'PT':
                return <User className="w-4 h-4 text-purple-400" />;
            case 'WORKSHOP':
                return <Info className="w-4 h-4 text-amber-400" />;
            default:
                return <Dumbbell className="w-4 h-4 text-indigo-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 p-6 md:p-8 rounded-3xl border border-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
                        <CalendarDays className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Nexus Hub</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight">
                        Classes
                    </h1>
                    <p className="text-slate-400 max-w-xl text-lg">
                        Manage your upcoming classes, personal training sessions, and group fitness schedule.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Calendar (Sticky) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <Card className="bg-slate-900/60 backdrop-blur-2xl border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
                            <CardHeader className="bg-slate-900/50 border-b border-slate-800 pb-4">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                                    Select Date
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="bg-transparent text-slate-200"
                                    classNames={{
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                        month: "space-y-4 text-slate-200",
                                        caption: "flex justify-center pt-1 relative items-center text-slate-100",
                                        caption_label: "text-sm font-medium",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-400 hover:text-white transition-colors",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex",
                                        head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                                        row: "flex w-full mt-2",
                                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-900/30 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        day: "h-9 w-9 p-0 font-normal hover:bg-slate-800 rounded-md transition-colors text-slate-300 aria-selected:opacity-100",
                                        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-md font-bold shadow-lg shadow-blue-900/50 border-none outline-none",
                                        day_today: "bg-slate-800/50 text-white font-semibold",
                                        day_outside: "text-slate-600 opacity-50",
                                        day_disabled: "text-slate-700 opacity-50",
                                        day_hidden: "invisible",
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Summary Widget */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                    Upcoming Highlights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 text-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Booked Classes</p>
                                            <p className="text-slate-400 text-xs">{userBookedClassesCount} active registrations</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-t border-slate-800/50 pt-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Next Session</p>
                                            {nextBookedSession ? (
                                                <p className="text-slate-400 text-xs">
                                                    {nextBookedSession.title} - {format(new Date(nextBookedSession.dateTime), 'MMM d, h:mm a')}
                                                </p>
                                            ) : (
                                                <p className="text-slate-400 text-xs">No upcoming sessions</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Event List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-primary/10 gap-4">
                        <h2 className="text-2xl font-bold text-white">
                            {date ? format(date, 'EEEE, MMMM d, yyyy') : 'No Date Selected'}
                        </h2>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setViewTab('all')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        viewTab === 'all'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    All Classes
                                </button>
                                <button
                                    onClick={() => setViewTab('my-bookings')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        viewTab === 'my-bookings'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    My Bookings
                                </button>
                            </div>
                            <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 h-8 flex items-center px-3">
                                {displayedEvents.length} Events
                            </Badge>
                        </div>
                    </div>

                    {displayedEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/20 rounded-3xl border border-slate-800/50 border-dashed">
                            <CalendarIcon className="w-16 h-16 text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold text-slate-300">No Events Scheduled</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                {viewTab === 'my-bookings' 
                                    ? "You don't have any bookings scheduled for this day." 
                                    : "There are no classes or training sessions scheduled for this day."}
                            </p>
                            {viewTab === 'my-bookings' && (
                                <Button 
                                    onClick={() => setViewTab('all')}
                                    variant="outline" 
                                    className="mt-6 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                >
                                    Browse All Classes
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedEvents.map((event) => (
                                <Card key={event.id} className="bg-slate-900/60 backdrop-blur-xl border-slate-800/60 transition-all hover:bg-slate-900 hover:border-blue-500/30 group">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Time Column */}
                                        <div className="sm:w-32 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-800/50 bg-slate-950/30">
                                            <p className="text-xl font-bold text-white font-heading">{event.time.split(' ')[0]}</p>
                                            <p className="text-sm font-medium text-slate-500">{event.time.split(' ')[1]}</p>
                                        </div>

                                        {/* Details Column */}
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="p-1.5 rounded-md bg-slate-800 border border-slate-700">
                                                            {getTypeIcon(event.type)}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <Badge variant="outline" className={`${getStatusColor(event.status)} whitespace-nowrap`}>
                                                            {event.status === 'Full' ? 'Class Full' : event.status} 
                                                        </Badge>
                                                        {event.isGymClass && event.status !== 'Cancelled' && event.status !== 'Completed' && (
                                                            <span className="text-[11px] text-slate-400 mt-1">
                                                                {event.spotsLeft} of {event.capacity} seats left
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                                    {event.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-800/50 text-sm">
                                                <div className="flex items-center text-slate-300">
                                                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                                                    {event.duration}
                                                </div>
                                                <div className="flex items-center text-slate-300">
                                                    <User className="w-4 h-4 mr-2 text-slate-500" />
                                                    {event.instructor}
                                                </div>
                                                <div className="flex items-center text-slate-300">
                                                    <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                                                    {event.location}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Column */}
                                        <div className="p-6 border-t sm:border-t-0 sm:border-l border-slate-800/50 flex items-center justify-center bg-slate-950/20">
                                            {!event.isGymClass ? (
                                                <Button variant="outline" className="w-full sm:w-auto border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-default" disabled>
                                                    <Check className="w-4 h-4 mr-2" /> Booked
                                                </Button>
                                            ) : event.status === 'Cancelled' ? (
                                                <Button variant="outline" className="w-full sm:w-auto border-rose-500/20 text-rose-500 bg-rose-500/5" disabled>
                                                    Cancelled
                                                </Button>
                                            ) : event.status === 'Completed' ? (
                                                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-500 bg-slate-950/10" disabled>
                                                    Completed
                                                </Button>
                                            ) : event.status === 'Ongoing' ? (
                                                <Button variant="outline" className="w-full sm:w-auto border-blue-500/20 text-blue-400 bg-blue-500/5" disabled>
                                                    Ongoing
                                                </Button>
                                            ) : event.status === 'Booked' ? (
                                                <Button 
                                                    onClick={() => handleCancel(event.id)}
                                                    variant="outline" 
                                                    className="w-full sm:w-auto border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                                                >
                                                    Cancel
                                                </Button>
                                            ) : event.status === 'Full' ? (
                                                <Button variant="outline" className="w-full sm:w-auto border-slate-800 text-slate-600 bg-slate-950/30" disabled>
                                                    Full
                                                </Button>
                                            ) : (
                                                <Button 
                                                    onClick={() => handleEnroll(event.id)}
                                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                                                >
                                                    Book Now
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
