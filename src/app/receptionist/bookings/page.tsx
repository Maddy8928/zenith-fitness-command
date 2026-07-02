"use client";

import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    CheckCircle2, 
    XCircle, 
    ChevronLeft, 
    ChevronRight, 
    Waves, 
    Sparkles, 
    Flame, 
    Snowflake, 
    HeartPulse, 
    Sun, 
    Moon, 
    Zap, 
    RefreshCw, 
    AlertCircle,
    Check,
    X,
    CalendarDays,
    Wrench,
    AlertTriangle
} from 'lucide-react';
import { 
    getStoredBookings, 
    updateBookingStatus, 
    TherapyBooking, 
    TherapyBookingStatus,
    getServiceStatuses,
    saveServiceStatuses,
    ServiceStatus
} from '@/lib/bookings-store';
import { useNotifications } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const serviceIcons: Record<string, any> = {
    'rs-1': Flame,
    'rs-2': Sun,
    'rs-3': Snowflake,
    'rs-4': Zap,
    'rs-5': HeartPulse,
    'rs-6': Sparkles,
    'rs-7': Waves,
    'rs-8': Moon
};

const SERVICES_LIST = [
    { id: 'rs-1', name: 'Himalayan Salt Steam' },
    { id: 'rs-2', name: 'Infrared Sauna Elite' },
    { id: 'rs-3', name: 'Arctic Cryotherapy' },
    { id: 'rs-4', name: 'Compression Therapy' },
    { id: 'rs-5', name: 'Kinetic Physiotherapy' },
    { id: 'rs-6', name: 'Valkyrie Deep Tissue' },
    { id: 'rs-7', name: 'Nordic Swedish Bliss' },
    { id: 'rs-8', name: 'Zero-G Flotation' }
];

const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
});

const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
    '06:00 PM', '07:00 PM', '08:00 PM'
];

export default function BookingsPanel() {
    const [bookings, setBookings] = useState<TherapyBooking[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    
    // Service operational statuses
    const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
    
    // Reschedule States
    const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
    const [newDate, setNewDate] = useState<string>(dateOptions[0]);
    const [newTime, setNewTime] = useState<string>(timeSlots[0]);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    
    // Reject States
    const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState<string>('No Available Slots');
    const [rejectReasonText, setRejectReasonText] = useState<string>('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    // Verify States
    const [verifyBooking, setVerifyBooking] = useState<TherapyBooking | null>(null);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);

    const { addNotification } = useNotifications();

    const loadBookings = () => {
        setBookings(getStoredBookings());
    };

    const loadServiceStatuses = () => {
        setServiceStatuses(getServiceStatuses());
    };

    useEffect(() => {
        loadBookings();
        loadServiceStatuses();

        // Listen for updates from other tabs
        window.addEventListener('storage_bookings_updated', loadBookings);
        window.addEventListener('storage_service_statuses_updated', loadServiceStatuses);
        return () => {
            window.removeEventListener('storage_bookings_updated', loadBookings);
            window.removeEventListener('storage_service_statuses_updated', loadServiceStatuses);
        };
    }, []);

    const toggleServiceStatus = (serviceId: string) => {
        const current = serviceStatuses[serviceId] || 'Operational';
        const next: ServiceStatus = current === 'Operational' ? 'Maintenance' : 'Operational';
        const updated: Record<string, ServiceStatus> = {
            ...serviceStatuses,
            [serviceId]: next
        };
        setServiceStatuses(updated);
        saveServiceStatuses(updated);
        toast.success(`Service status updated to ${next}!`);
    };

    const handleApprove = (booking: TherapyBooking) => {
        const updated = updateBookingStatus(booking.id, 'Approved');
        if (updated) {
            loadBookings();
            toast.success(`Booking request approved!`);

            // Notify Member in real-time
            addNotification({
                role: 'member',
                userId: booking.memberId,
                category: 'MEMBER',
                priority: 'high',
                title: '✅ Therapy Booking Approved',
                message: `Your booking request for "${booking.serviceTitle}" has been approved for ${booking.preferredDate} at ${booking.preferredTime}.`,
                metadata: { bookingId: booking.id, status: 'Approved' }
            });
        }
    };

    const handleRejectSubmit = () => {
        if (!rejectBookingId) return;
        const booking = bookings.find(b => b.id === rejectBookingId);
        if (!booking) return;

        // Map reason to professional apology template
        let reasonDesc = "";
        if (rejectReason === 'No Available Slots') reasonDesc = "no slots are available";
        else if (rejectReason === 'Service Not Available Today') reasonDesc = "the service is not available today";
        else if (rejectReason === 'Therapist Unavailable') reasonDesc = "the therapist is unavailable at this time";
        else if (rejectReason === 'Maintenance in Progress') reasonDesc = "maintenance is currently in progress";
        else if (rejectReason === 'Capacity Full') reasonDesc = "our daily capacity is full";
        else reasonDesc = rejectReasonText || "of scheduling conflicts";

        const professionalApology = `Unfortunately, your booking request for ${booking.serviceTitle} could not be approved at this time because ${reasonDesc}. We apologize for the inconvenience and encourage you to select another date or service. Thank you for your understanding.`;

        const updated = updateBookingStatus(booking.id, 'Rejected', undefined, undefined, professionalApology);
        if (updated) {
            loadBookings();
            setIsRejectOpen(false);
            setRejectBookingId(null);
            setRejectReason('No Available Slots');
            setRejectReasonText('');
            toast.success(`Booking request declined.`);

            // Notify Member in real-time
            addNotification({
                role: 'member',
                userId: booking.memberId,
                category: 'MEMBER',
                priority: 'high',
                title: '❌ Therapy Booking Declined',
                message: professionalApology,
                metadata: { bookingId: booking.id, status: 'Rejected', notes: professionalApology }
            });
        }
    };

    const handleRescheduleSubmit = () => {
        if (!rescheduleBookingId) return;
        const booking = bookings.find(b => b.id === rescheduleBookingId);
        if (!booking) return;

        const updated = updateBookingStatus(booking.id, 'Rescheduled', newDate, newTime);
        if (updated) {
            loadBookings();
            setIsRescheduleOpen(false);
            setRescheduleBookingId(null);
            toast.success(`Booking rescheduled successfully.`);

            // Notify Member in real-time
            addNotification({
                role: 'member',
                userId: booking.memberId,
                category: 'MEMBER',
                priority: 'high',
                title: '📅 Therapy Booking Rescheduled',
                message: `Your booking request for "${booking.serviceTitle}" has been rescheduled to ${newDate} at ${newTime}. Please confirm if this slot works for you.`,
                metadata: { bookingId: booking.id, status: 'Rescheduled', newDate, newTime }
            });
        }
    };

    const handleComplete = (booking: TherapyBooking) => {
        const updated = updateBookingStatus(booking.id, 'Completed');
        if (updated) {
            loadBookings();
            toast.success(`Booking marked as Completed.`);
        }
    };

    // Helper to resolve staff name based on category
    const getAssignedStaff = (serviceCategory: string) => {
        if (serviceCategory.includes('Massage')) return 'Sarah Chen';
        if (serviceCategory.includes('Thermal')) return 'Marcus Johnson';
        if (serviceCategory.includes('Physical')) return 'Michael Rivers';
        return 'Recovery Specialist';
    };

    // Calculate verification checks for the verify dialog
    const runVerificationChecks = (booking: TherapyBooking) => {
        // Check 1: Service operational status
        const currentStatus = serviceStatuses[booking.serviceId] || 'Operational';
        const isMaintenance = currentStatus === 'Maintenance';

        // Check 2: Time slot availability
        const conflictingSessions = bookings.filter(b => 
            b.id !== booking.id &&
            b.serviceId === booking.serviceId &&
            b.preferredDate === booking.preferredDate &&
            b.preferredTime === booking.preferredTime &&
            ['Approved', 'Rescheduled', 'Completed'].includes(b.status)
        );
        const isTimeSlotConflicted = conflictingSessions.length > 0;

        // Check 3: Staff availability
        const staffName = getAssignedStaff(booking.serviceCategory);
        const isStaffConflicted = bookings.some(b => 
            b.id !== booking.id &&
            getAssignedStaff(b.serviceCategory) === staffName &&
            b.preferredDate === booking.preferredDate &&
            b.preferredTime === booking.preferredTime &&
            ['Approved', 'Rescheduled', 'Completed'].includes(b.status)
        );

        // Check 4: Daily capacity check
        const dailyActive = bookings.filter(b => 
            b.serviceId === booking.serviceId &&
            b.preferredDate === booking.preferredDate &&
            ['Approved', 'Rescheduled', 'Completed', 'Pending'].includes(b.status)
        );
        const capacityLimit = 3;
        const currentCount = dailyActive.length;
        const isCapacityExceeded = currentCount > capacityLimit;

        return {
            isMaintenance,
            isTimeSlotConflicted,
            isStaffConflicted,
            isCapacityExceeded,
            capacityLimit,
            currentCount,
            staffName,
            hasConflict: isMaintenance || isTimeSlotConflicted || isStaffConflicted || isCapacityExceeded
        };
    };

    // Filters
    const statuses = ['All', 'Pending', 'Approved', 'Rescheduled', 'Completed', 'Rejected'];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

    // Stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        approved: bookings.filter(b => b.status === 'Approved').length,
        completed: bookings.filter(b => b.status === 'Completed').length,
    };

    const verifyResults = verifyBooking ? runVerificationChecks(verifyBooking) : null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground font-gradient">Therapy Bookings</h1>
                    <p className="text-muted-foreground mt-1">Manage member recovery services, steam, massage, and cryotherapy schedules.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Total Requests</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-amber-500/20">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Pending Approval</p>
                    <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-emerald-500/20">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Approved Today</p>
                    <p className="text-3xl font-bold text-emerald-400">{stats.approved}</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-indigo-500/20">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Completed Sessions</p>
                    <p className="text-3xl font-bold text-indigo-400">{stats.completed}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Filters & Search */}
                <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search member or therapy..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-primary/20 rounded-xl py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                                    statusFilter === status 
                                    ? 'bg-primary text-black border-primary shadow-glow' 
                                    : 'bg-white/5 text-muted-foreground border-transparent hover:bg-white/10 hover:text-foreground'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Layout for Bookings and Service Status Board */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Bookings List (3/4 Width) */}
                    <div className="lg:col-span-3">
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-[2.5rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-white/5">
                                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Client / Membership ID</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Service & Category</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Preferred Schedule</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status / Booked At</th>
                                            <th className="px-8 py-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.05]">
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => {
                                                const Icon = serviceIcons[booking.serviceId] || Waves;
                                                return (
                                                    <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20 text-primary font-black">
                                                                    {booking.memberName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-200 text-sm">{booking.memberName}</p>
                                                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">ID: {booking.membershipId}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-primary/70">
                                                                    <Icon className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-200">{booking.serviceTitle}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-medium">{booking.serviceCategory}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm text-slate-200 flex items-center gap-1.5 font-semibold">
                                                                    <CalendarDays className="w-3.5 h-3.5 text-primary" /> {booking.preferredDate}
                                                                </span>
                                                                <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                                                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {booking.preferredTime}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col gap-1.5">
                                                                <Badge variant="outline" className={`w-fit font-bold text-[9px] uppercase px-2 py-0.5 rounded ${getStatusStyle(booking.status)}`}>
                                                                    {booking.status}
                                                                </Badge>
                                                                <span className="text-[9px] text-muted-foreground/80 font-mono">Booked: {booking.bookingDate}</span>
                                                                {booking.notes && (
                                                                    <span className="text-[9px] text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 italic">Notes: {booking.notes}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {booking.status === 'Pending' && (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => { setVerifyBooking(booking); setIsVerifyOpen(true); }}
                                                                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg border border-emerald-500/20 transition-all font-bold text-xs uppercase"
                                                                            title="Approve Session"
                                                                        >
                                                                            <Check className="w-4 h-4" />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => { setRescheduleBookingId(booking.id); setIsRescheduleOpen(true); }}
                                                                            className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-black rounded-lg border border-blue-500/20 transition-all font-bold text-xs uppercase"
                                                                            title="Reschedule Session"
                                                                        >
                                                                            <Clock className="w-4 h-4" />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => { setRejectBookingId(booking.id); setIsRejectOpen(true); }}
                                                                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/20 transition-all font-bold text-xs uppercase"
                                                                            title="Decline Session"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {(booking.status === 'Approved' || booking.status === 'Rescheduled') && (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handleComplete(booking)}
                                                                            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg border border-indigo-500/20 transition-all font-black text-[9px] uppercase tracking-wider"
                                                                        >
                                                                            Complete
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => { setRescheduleBookingId(booking.id); setIsRescheduleOpen(true); }}
                                                                            className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-black rounded-lg border border-blue-500/20 transition-all font-bold text-xs uppercase"
                                                                            title="Reschedule Session"
                                                                        >
                                                                            <Clock className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="p-4 rounded-full bg-white/5">
                                                            <AlertCircle className="w-8 h-8 text-slate-700" />
                                                        </div>
                                                        <p className="text-slate-500 font-medium">No therapy bookings found for this view.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Service Operational Status Board (1/4 Width) */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-[2rem] p-6">
                            <h3 className="text-lg font-black font-heading uppercase text-foreground mb-1 flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-primary" /> Service Status
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-4">Toggle operational states</p>
                            
                            <div className="divide-y divide-white/[0.05]">
                                {SERVICES_LIST.map((srv) => {
                                    const status = serviceStatuses[srv.id] || 'Operational';
                                    return (
                                        <div key={srv.id} className="py-3.5 flex items-center justify-between gap-2">
                                            <div>
                                                <p className="text-xs font-bold text-slate-200">{srv.name}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleServiceStatus(srv.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                    status === 'Operational'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.05)]'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Verify & Approve Modal */}
            <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
                <DialogContent className="sm:max-w-lg bg-charcoal border-primary/20 p-8 shadow-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-heading uppercase tracking-tighter text-white flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-primary" /> VERIFY AVAILABILITY
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Verify availability criteria before confirming approval.
                        </DialogDescription>
                    </DialogHeader>

                    {verifyBooking && verifyResults && (
                        <div className="space-y-6 py-4">
                            <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-xs font-black uppercase tracking-widest text-primary">Booking Under Review</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground font-medium">Member:</span>{' '}
                                        <span className="font-bold text-white">{verifyBooking.memberName}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground font-medium">Service:</span>{' '}
                                        <span className="font-bold text-white">{verifyBooking.serviceTitle}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground font-medium">Schedule:</span>{' '}
                                        <span className="font-bold text-white">{verifyBooking.preferredDate} at {verifyBooking.preferredTime}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground font-medium">Staff Assigned:</span>{' '}
                                        <span className="font-bold text-white">{verifyResults.staffName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pre-Approval Verification Checklist</p>
                                
                                {/* Check 1: Service operational state */}
                                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <span className="text-xs font-semibold text-slate-300">Service Availability & Status</span>
                                    {verifyResults.isMaintenance ? (
                                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase"><AlertTriangle className="w-4 h-4" /> Down / Maintenance</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase"><Check className="w-4 h-4" /> Operational</span>
                                    )}
                                </div>

                                {/* Check 2: Time slot availability */}
                                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <span className="text-xs font-semibold text-slate-300">Time Slot Availability</span>
                                    {verifyResults.isTimeSlotConflicted ? (
                                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase"><AlertTriangle className="w-4 h-4" /> Double Booking Conflicted</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase"><Check className="w-4 h-4" /> Available</span>
                                    )}
                                </div>

                                {/* Check 3: Staff availability */}
                                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <span className="text-xs font-semibold text-slate-300">Staff & Therapist Availability</span>
                                    {verifyResults.isStaffConflicted ? (
                                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase"><AlertTriangle className="w-4 h-4" /> Therapist Booked</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase"><Check className="w-4 h-4" /> Therapist Free</span>
                                    )}
                                </div>

                                {/* Check 4: Capacity limit check */}
                                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <span className="text-xs font-semibold text-slate-300">Daily Capacity Limit Check</span>
                                    {verifyResults.isCapacityExceeded ? (
                                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase"><AlertTriangle className="w-4 h-4" /> Capacity Limit Reached ({verifyResults.currentCount}/{verifyResults.capacityLimit})</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase"><Check className="w-4 h-4" /> Space Available ({verifyResults.currentCount}/{verifyResults.capacityLimit})</span>
                                    )}
                                </div>

                                {/* Check 5: Downtime status */}
                                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <span className="text-xs font-semibold text-slate-300">Facility Maintenance / Downtime</span>
                                    {verifyResults.isMaintenance ? (
                                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase"><Wrench className="w-4 h-4 animate-spin" /> Maintenance Active</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase"><Check className="w-4 h-4" /> No Downtime</span>
                                    )}
                                </div>
                            </div>

                            {verifyResults.hasConflict && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5">
                                    <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Availability Conflict Flagged</p>
                                        <p className="text-[11px] text-rose-400/80 mt-0.5 leading-relaxed">
                                            One or more criteria have conflict. Proceeding with approval will bypass verification rules.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <DialogFooter className="flex gap-3 justify-end pt-4">
                        <Button variant="ghost" onClick={() => { setIsVerifyOpen(false); setVerifyBooking(null); }} className="px-6 rounded-xl hover:bg-white/5 text-muted-foreground text-xs font-black uppercase tracking-widest">Close</Button>
                        <Button 
                            onClick={() => {
                                if (verifyBooking) {
                                    handleApprove(verifyBooking);
                                    setIsVerifyOpen(false);
                                    setVerifyBooking(null);
                                }
                            }}
                            className="px-8 rounded-xl bg-primary text-black font-black uppercase text-xs gold-glow tracking-tighter"
                        >
                            Confirm Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Modal */}
            <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                <DialogContent className="sm:max-w-md bg-charcoal border-primary/20 p-8 shadow-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-heading uppercase tracking-tighter text-white flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary" /> RESCHEDULE SESSION
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Choose a new date and time window for the member.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Select New Date</label>
                            <select 
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full bg-slate-950 border border-primary/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                            >
                                {dateOptions.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Select New Time Window</label>
                            <select 
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="w-full bg-slate-950 border border-primary/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                            >
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3 justify-end pt-4">
                        <Button variant="ghost" onClick={() => setIsRescheduleOpen(false)} className="px-6 rounded-xl hover:bg-white/5 text-muted-foreground text-xs font-black uppercase tracking-widest">Cancel</Button>
                        <Button onClick={handleRescheduleSubmit} className="px-8 rounded-xl bg-primary text-black font-black uppercase text-xs gold-glow tracking-tighter">Confirm Reschedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="sm:max-w-md bg-charcoal border-rose-500/20 p-8 shadow-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-heading uppercase tracking-tighter text-white flex items-center gap-2">
                            <XCircle className="w-6 h-6 text-rose-500" /> DECLINE SESSION
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Provide a brief reason for declining this request.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Select Rejection Reason</label>
                            <select
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full bg-slate-950 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50"
                            >
                                <option value="No Available Slots">No Available Slots</option>
                                <option value="Service Not Available Today">Service Not Available Today</option>
                                <option value="Therapist Unavailable">Therapist Unavailable</option>
                                <option value="Maintenance in Progress">Maintenance in Progress</option>
                                <option value="Capacity Full">Capacity Full</option>
                                <option value="Other Reason">Other Reason</option>
                            </select>
                        </div>

                        {rejectReason === 'Other Reason' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Describe Reason</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Schedule mismatch or system downtime details"
                                    value={rejectReasonText}
                                    onChange={(e) => setRejectReasonText(e.target.value)}
                                    className="w-full bg-slate-950 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50 placeholder:text-slate-600"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-3 justify-end pt-4">
                        <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="px-6 rounded-xl hover:bg-white/5 text-muted-foreground text-xs font-black uppercase tracking-widest">Cancel</Button>
                        <Button onClick={handleRejectSubmit} className="px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-tighter">Confirm Decline</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
