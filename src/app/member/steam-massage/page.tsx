"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Waves, 
    Sparkles, 
    Clock, 
    Calendar as CalendarIcon, 
    ChevronRight, 
    CheckCircle2, 
    Info, 
    Wind, 
    Flame, 
    Droplets,
    UserCircle,
    Star,
    ArrowRight,
    CreditCard,
    Snowflake,
    Zap,
    HeartPulse,
    Sun,
    Moon,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RECOVERY_SERVICES, RecoveryService, RecoveryCategory } from '@/lib/recovery-services';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { getStoredBookings, addBooking, TherapyBooking, getServiceStatuses, ServiceStatus } from '@/lib/bookings-store';

const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
    '06:00 PM', '07:00 PM', '08:00 PM'
];

const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        full: d,
        formatted: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
});

const CATEGORIES: RecoveryCategory[] = [
    'Massage Therapy',
    'Thermal Therapy',
    'Recovery Tech',
    'Physical Therapy'
];

export default function SteamMassagePage() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const [selectedCategory, setSelectedCategory] = useState<RecoveryCategory>('Massage Therapy');
    const [selectedService, setSelectedService] = useState<RecoveryService | null>(null);
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Therapy bookings & service status state
    const [allBookings, setAllBookings] = useState<TherapyBooking[]>([]);
    const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});

    const filteredServices = RECOVERY_SERVICES.filter(s => s.category === selectedCategory);

    const loadBookings = () => {
        setAllBookings(getStoredBookings());
    };

    const loadServiceStatuses = () => {
        setServiceStatuses(getServiceStatuses());
    };

    useEffect(() => {
        loadBookings();
        loadServiceStatuses();
        window.addEventListener('storage_bookings_updated', loadBookings);
        window.addEventListener('storage_service_statuses_updated', loadServiceStatuses);
        return () => {
            window.removeEventListener('storage_bookings_updated', loadBookings);
            window.removeEventListener('storage_service_statuses_updated', loadServiceStatuses);
        };
    }, []);

    const memberBookings = user ? allBookings.filter(b => b.memberId === user.id) : [];

    const isSlotBooked = (dateIdx: number, time: string) => {
        if (!selectedService) return false;
        const dateStr = dates[dateIdx].formatted;
        
        // Default hardcoded ones for visual variety:
        if (time === '11:00 AM' || time === '05:00 PM') return true;

        // Check if there is an active booking (Pending, Approved, Rescheduled, Completed) for the same service, date, and time
        const matches = allBookings.filter(b => 
            b.serviceId === selectedService.id &&
            b.preferredDate === dateStr &&
            b.preferredTime === time &&
            b.status !== 'Rejected'
        );
        return matches.length > 0;
    };

    const handleConfirmBooking = () => {
        if (!selectedService || !selectedTime || !user) return;

        // Validate capacity
        if (isSlotBooked(selectedDate, selectedTime)) {
            toast.error("Slot Unavailable", {
                description: "This slot has already been reserved. Please select another time."
            });
            return;
        }

        // Validate service is operational
        if (serviceStatuses[selectedService.id] === 'Maintenance') {
            toast.error("Service Unavailable", {
                description: "This service is currently under maintenance. Booking cannot be made."
            });
            return;
        }

        const membershipId = user.id === '1' ? 'NXS-3112' :
                             user.id === '2' ? 'NXS-7781' :
                             user.id === '3' ? 'NXS-4821' :
                             user.id === '4' ? 'NXS-8942' :
                             user.id === '5' ? 'NXS-2041' :
                             `NXS-${user.id.slice(0, 4).toUpperCase()}`;

        // Create booking in store
        const newBooking = addBooking({
            memberId: user.id,
            memberName: user.name,
            membershipId,
            serviceId: selectedService.id,
            serviceTitle: selectedService.title,
            serviceCategory: selectedService.category,
            duration: selectedService.duration,
            price: selectedService.price,
            preferredDate: dates[selectedDate].formatted,
            preferredTime: selectedTime,
            type: selectedService.type,
            notes: ""
        });

        setIsSuccess(true);
        toast.success("Booking Request Received!", {
            description: `Scheduled for ${dates[selectedDate].formatted}, ${selectedTime}`,
        });

        // Notify receptionist in real-time
        addNotification({
            role: 'receptionist',
            category: 'MEMBER',
            priority: 'high',
            title: '🔔 New Therapy Booking',
            message: `${user.name} has requested a booking for "${selectedService.title}" on ${dates[selectedDate].formatted} at ${selectedTime}.`,
            metadata: { 
                bookingId: newBooking.id, 
                memberName: user.name, 
                serviceTitle: selectedService.title 
            }
        });

        // Notify member in real-time
        addNotification({
            role: 'member',
            userId: user.id,
            category: 'MEMBER',
            priority: 'medium',
            title: '⏳ Booking Request Received',
            message: `Your booking request for "${selectedService.title}" has been received and is pending approval.`,
            metadata: { 
                bookingId: newBooking.id, 
                status: 'Pending' 
            }
        });

        setTimeout(() => {
            setIsBookingOpen(false);
            setIsSuccess(false);
            setSelectedService(null);
            setSelectedTime(null);
        }, 2000);
    };

    return (
        <div className="min-h-screen pb-20 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="z-10"
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground italic uppercase">
                        SPA <span className="text-primary">&</span> RECOVERY <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">ELITE</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mt-2 font-body text-lg">
                        Advanced biological restoration for peak performance. Optimize your recovery with science-led wellness therapies.
                    </p>
                </motion.div>
                
                {/* Background Glow */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* Category Toggle */}
            <div className="flex justify-center md:justify-start">
                <div className="p-1.5 bg-slate-100 dark:bg-white/5 backdrop-blur-md rounded-2xl flex flex-wrap gap-1 border border-primary/5">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setSelectedService(null);
                                setSelectedTime(null);
                            }}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                selectedCategory === category 
                                ? 'bg-primary text-black shadow-lg scale-105' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr,380px] gap-8 items-start">
                {/* Main Content: Services & Schedule */}
                <div className="space-y-10">
                    {/* Services Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <AnimatePresence mode="wait">
                            {filteredServices.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div 
                                        onClick={() => {
                                            setSelectedService(service);
                                            setSelectedTime(null);
                                        }}
                                        className={`glass-card-hover group cursor-pointer h-full p-6 flex flex-col items-start gap-4 relative overflow-hidden ring-1 ${
                                            selectedService?.id === service.id 
                                            ? 'border-primary ring-primary/50 bg-primary/[0.02]' 
                                            : 'border-white/5 ring-transparent bg-white/[0.01]'
                                        }`}
                                    >
                                        {service.isPremium && (
                                            <div className="absolute -right-10 top-4 rotate-45 bg-gradient-to-r from-primary to-accent py-1 px-12 shadow-lg z-20">
                                                <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">Premium</span>
                                            </div>
                                        )}

                                        {serviceStatuses[service.id] === 'Maintenance' && (
                                            <div className="absolute left-4 top-4 bg-rose-600 py-1 px-3 rounded-lg shadow-lg z-20">
                                                <span className="text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Maintenance
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className={`p-4 rounded-2xl transition-all duration-300 ${
                                            selectedService?.id === service.id ? 'bg-primary/20 scale-110' : 'bg-black/20 dark:bg-white/5'
                                        }`}>
                                            <service.icon className={`w-8 h-8 ${
                                                selectedService?.id === service.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'
                                            }`} />
                                        </div>

                                        <div className="space-y-1 pr-8">
                                            <h3 className="text-xl font-bold font-heading uppercase tracking-tighter">{service.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{service.description}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {service.benefits.slice(0, 3).map(benefit => (
                                                <Badge key={benefit} variant="outline" className="text-[9px] font-bold uppercase tracking-wider border-primary/10 text-primary/70">
                                                    {benefit}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-6 w-full flex items-center justify-between border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Duration</span>
                                                <span className="text-sm font-black flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {service.duration}</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Price</span>
                                                <span className="text-lg font-black gold-text italic">₹{service.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Schedule Selection */}
                    <div className="glass-card rounded-3xl p-8 space-y-8 relative overflow-hidden border-primary/10">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black font-heading uppercase italic tracking-tighter">Availability</h2>
                        </div>

                        {/* Date Selector */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Select Treatment Day</p>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                                {dates.map((date, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedDate(idx);
                                            setSelectedTime(null);
                                        }}
                                        className={`flex-shrink-0 w-20 py-5 rounded-2xl flex flex-col items-center gap-1 border transition-all duration-300 ${
                                            selectedDate === idx 
                                            ? 'bg-primary border-primary translate-y-[-4px]' 
                                            : 'bg-black/20 dark:bg-white/2 border-white/5 hover:border-primary/30'
                                        }`}
                                    >
                                        <span className={`text-[10px] uppercase font-black tracking-widest ${selectedDate === idx ? 'text-black/60' : 'text-muted-foreground'}`}>{date.label}</span>
                                        <span className={`text-2xl font-black ${selectedDate === idx ? 'text-black' : 'text-foreground'}`}>{date.date}</span>
                                        <span className={`text-[10px] uppercase font-black ${selectedDate === idx ? 'text-black/60' : 'text-muted-foreground'}`}>{date.month}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Select Time Window</p>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Available</span>
                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Booked</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {timeSlots.map((time) => {
                                    const isBooked = isSlotBooked(selectedDate, time); 
                                    return (
                                        <button
                                            key={time}
                                            disabled={isBooked || (selectedService ? serviceStatuses[selectedService.id] === 'Maintenance' : false)}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 px-4 rounded-xl text-[10px] font-black transition-all duration-300 border uppercase tracking-widest ${
                                                isBooked 
                                                ? 'bg-slate-900/50 border-white/5 text-slate-700 cursor-not-allowed' 
                                                : selectedTime === time
                                                ? 'bg-primary border-primary text-black scale-105'
                                                : 'bg-black/20 dark:bg-white/5 border-white/5 text-foreground hover:border-primary/50'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Summary & CTA */}
                <div className="lg:sticky lg:top-8 order-first lg:order-last">
                    <div className="glass-card rounded-[2.5rem] p-8 border-primary/20 space-y-6 shadow-glow relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
                        {/* Summary Header */}
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse" />
                                <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                    {selectedService?.icon ? <selectedService.icon className="w-8 h-8 text-black" /> : <Waves className="w-8 h-8 text-black" />}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-heading uppercase italic tracking-tighter">Reservation</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Elite Recovery Program</p>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 my-6" />

                        {/* Selected Service Info */}
                        <div className="space-y-4">
                            {!selectedService ? (
                                <div className="p-10 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <Info className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Select therapy module</p>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Selected Therapy</span>
                                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{selectedService.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Schedule</span>
                                            <span className="text-[11px] font-bold text-primary">{dates[selectedDate].month} {dates[selectedDate].date} • {selectedTime || 'TBD'}</span>
                                        </div>
                                        <div className="text-right flex flex-col">
                                            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Time</span>
                                            <span className="text-[11px] font-bold text-white">{selectedService.duration}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5 my-6" />

                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-base font-black font-heading text-muted-foreground uppercase italic tracking-widest">Allocation</span>
                                        <span className="text-3xl font-black gold-text italic">₹{selectedService.price.toLocaleString()}</span>
                                    </div>

                                    {/* Maintenance Alert for Selected Service */}
                                    {serviceStatuses[selectedService.id] === 'Maintenance' && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2 text-rose-400 mt-2">
                                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider">Service Offline</p>
                                                <p className="text-[10px] text-rose-400/80 leading-normal mt-0.5">
                                                    This module is under maintenance. Online bookings are temporarily closed.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Action Button */}
                        <Button 
                            disabled={!selectedService || !selectedTime || serviceStatuses[selectedService.id] === 'Maintenance'}
                            onClick={() => setIsBookingOpen(true)}
                            className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase text-lg gold-glow hover:bg-primary/95 group relative overflow-hidden transition-all duration-300 active:scale-95 disabled:grayscale disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-2 tracking-tighter">
                                INITIALIZE RECOVERY
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        </Button>
                        
                        <p className="text-[9px] text-center text-muted-foreground uppercase font-black tracking-widest mt-4 leading-relaxed">
                            * System reservation credits are non-refundable within 24h
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking History & Status */}
            <div className="glass-card rounded-[2.5rem] p-8 border-primary/10 space-y-6 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent mt-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-heading uppercase italic tracking-tighter">Booking History</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Track your spa & recovery reservations</p>
                        </div>
                    </div>
                    {memberBookings.length > 0 && (
                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1">
                            {memberBookings.length} {memberBookings.length === 1 ? 'Booking' : 'Bookings'}
                        </Badge>
                    )}
                </div>

                <div className="h-px bg-white/5" />

                {memberBookings.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <Info className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-300">No Reservations Yet</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">You haven't requested any recovery sessions. Choose a service above to initialize recovery.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {memberBookings.map((booking) => {
                            const service = RECOVERY_SERVICES.find(s => s.id === booking.serviceId);
                            const Icon = service?.icon || Waves;
                            
                            const getStatusStyle = (status: string) => {
                                switch (status) {
                                    case 'Approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                                    case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                                    case 'Rescheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                    case 'Completed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                                    case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                                    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                                }
                            };

                            return (
                                <div 
                                    key={booking.id} 
                                    className="glass-card bg-black/40 border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-200 text-base uppercase tracking-tight">{booking.serviceTitle}</h4>
                                                <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getStatusStyle(booking.status)}`}>
                                                    {booking.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-primary/70" /> {booking.preferredDate}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-primary/70" /> {booking.preferredTime}
                                                </span>
                                                <span>•</span>
                                                <span>Duration: {booking.duration}</span>
                                                <span>•</span>
                                                <span className="gold-text font-semibold">₹{booking.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 md:text-right">
                                        <span className="text-[10px] text-muted-foreground">Requested: {booking.bookingDate}</span>
                                        {booking.notes && (
                                            <div className="text-[11px] text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/5 mt-2 max-w-md text-left leading-relaxed">
                                                {booking.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogContent className="sm:max-w-md bg-charcoal dark:bg-background border-primary/20 p-0 overflow-hidden shadow-2xl">
                    <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x w-full" />
                    <div className="p-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black font-heading uppercase text-foreground tracking-tighter">BIOSYNC <span className="gold-text italic">CONFIRMATION</span></DialogTitle>
                            <DialogDescription className="text-muted-foreground font-body text-xs uppercase tracking-widest font-bold">
                                Initializing structural optimization protocols.
                            </DialogDescription>
                        </DialogHeader>

                        {isSuccess ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-6">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-black" />
                                </motion.div>
                                <div className="text-center">
                                    <h4 className="text-xl font-black text-foreground uppercase tracking-tight italic">Synchronization Complete</h4>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">Protocol added to your master schedule</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 py-8">
                                <div className="glass-card rounded-2xl p-5 border-white/10 bg-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-glow">
                                            {selectedService?.icon && <selectedService.icon className="w-6 h-6 text-primary" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground uppercase tracking-tight">{selectedService?.title}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                {(selectedDate !== null && dates[selectedDate]) ? dates[selectedDate].formatted : ''} at {selectedTime}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-white/10" />
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Payment Allocation</span>
                                        <span className="flex items-center gap-2 font-black text-foreground text-sm">
                                            <CreditCard className="w-4 h-4 text-primary" /> NEXUS CREDIT
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
                                    <Star className="w-5 h-5 text-primary fill-primary relative z-10" />
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest relative z-10">
                                        VIP COMPLIANCE: ₹1,500 RECOVERY REBATE APPLIED.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isSuccess && (
                            <DialogFooter className="flex gap-4 sm:justify-between pt-6">
                                <Button variant="ghost" onClick={() => setIsBookingOpen(false)} className="px-6 rounded-xl hover:bg-white/5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">Abort</Button>
                                <Button onClick={handleConfirmBooking} className="px-10 rounded-xl bg-primary text-black font-black uppercase text-xs gold-glow tracking-tighter">Execute Protocol</Button>
                            </DialogFooter>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
