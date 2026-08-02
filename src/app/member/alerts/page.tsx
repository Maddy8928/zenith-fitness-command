'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Dumbbell,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    CreditCard,
    MessageSquare,
    Tag,
    AlertTriangle,
    ShieldCheck,
    Trash2,
    MoreHorizontal,
    ArrowRight,
    Filter,
    Inbox,
    Activity,
    Star,
    Zap,
    RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from 'sonner';

// ── Trainer name lookup ────────────────────────────────────────────────────
const TRAINER_NAMES: Record<string, string> = {
    'marcus-johnson': 'Marcus Johnson',
    'sarah-chen': 'Sarah Chen',
    'michael-rivers': 'Michael Rivers',
};

// ── Mock notification data (static fallback) ───────────────────────────────
const MOCK_ALERTS = [
    {
        id: 'mock_1',
        title: 'Upcoming Class Reminder',
        message: 'Your HIIT Intensity class with Alex J. starts in 2 hours.',
        time: '2 hours ago',
        type: 'class',
        read: false,
        actionNeeded: true,
    },
    {
        id: 'mock_2',
        title: 'Payment Successful',
        message: 'Your monthly premium membership fee of ₹7,499 has been processed.',
        time: 'Yesterday',
        type: 'billing',
        read: true,
        actionNeeded: false,
    },
    {
        id: 'mock_3',
        title: 'New Achievement Unlocked!',
        message: "Congratulations! You've reached a 5-day workout streak and earned the 'Consistent Crusher' badge.",
        time: 'Yesterday',
        type: 'system',
        read: false,
        actionNeeded: false,
    },
];

const TABS = [
    { id: 'all', label: 'All Alerts', icon: Inbox },
    { id: 'trials', label: 'Trial Bookings', icon: Dumbbell },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

function formatTimeDiff(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(date));
}

function getNotifIcon(type: string) {
    switch (type) {
        case 'class':
        case 'workout': return <Calendar className="w-5 h-5 text-blue-400" />;
        case 'billing':
        case 'payment': return <CreditCard className="w-5 h-5 text-emerald-400" />;
        case 'promo': return <Tag className="w-5 h-5 text-orange-400" />;
        case 'member':
        case 'membership': return <Star className="w-5 h-5 text-primary" />;
        case 'system': return <Bell className="w-5 h-5 text-indigo-400" />;
        default: return <MessageSquare className="w-5 h-5 text-slate-400" />;
    }
}

function getNotifBg(type: string) {
    switch (type) {
        case 'class':
        case 'workout': return 'bg-blue-500/10';
        case 'billing':
        case 'payment': return 'bg-emerald-500/10';
        case 'promo': return 'bg-orange-500/10';
        case 'member':
        case 'membership': return 'bg-primary/10';
        case 'system': return 'bg-indigo-500/10';
        default: return 'bg-slate-500/10';
    }
}

export default function AlertsPage() {
    const { notifications: allNotifs, addNotification, markAsRead, removeNotification, markAllAsRead } = useNotifications();

    const [activeTab, setActiveTab] = useState<'all' | 'trials' | 'notifications'>('all');
    const [trialBookings, setTrialBookings] = useState<Record<string, any>>({});
    const [ptStatus, setPtStatus] = useState<any>({});
    const [deletedMockIds, setDeletedMockIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rescheduled' | 'rejected'>('all');

    const loadData = () => {
        try {
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            const savedPT = localStorage.getItem('zenith_pt_status');
            if (savedTrials) setTrialBookings(JSON.parse(savedTrials));
            if (savedPT) setPtStatus(JSON.parse(savedPT));
        } catch (e) {}
    };

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    // Member-relevant context notifications
    const contextNotifs = allNotifs
        .filter(n => n.role === 'member' || n.role === 'all')
        .map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: formatTimeDiff(n.timestamp),
            type: n.category.toLowerCase(),
            read: n.isRead,
            actionNeeded: !!n.actionUrl,
            isContext: true,
            metadata: n.metadata,
        }));

    const mockFiltered = MOCK_ALERTS.filter(n => !deletedMockIds.includes(n.id)).map(n => ({
        ...n, isContext: false, metadata: undefined as any,
    }));

    const allNotifications = [...contextNotifs, ...mockFiltered];

    // Trial data
    const trialEntries = Object.entries(trialBookings).map(([trainerId, t]: [string, any]) => ({
        trainerId,
        trainerName: TRAINER_NAMES[trainerId] || trainerId,
        date: t.date,
        time: t.time,
        status: (t.status || 'pending') as string,
    }));

    const pendingTrials = trialEntries.filter(t => t.status === 'pending');
    const approvedTrials = trialEntries.filter(t => t.status === 'approved');
    const rejectedTrials = trialEntries.filter(t => t.status === 'rejected');

    const filteredTrials = statusFilter === 'all' ? trialEntries
        : statusFilter === 'pending' ? pendingTrials
        : statusFilter === 'approved' ? approvedTrials
        : rejectedTrials;

    // Total badge count: unread notifs + pending trials
    const unreadNotifCount = allNotifications.filter(n => !n.read).length;
    const totalBadge = unreadNotifCount + pendingTrials.length;

    const handleDeleteNotif = (id: string) => {
        if (id.startsWith('mock_')) {
            setDeletedMockIds(prev => [...prev, id]);
        } else {
            removeNotification(id);
        }
    };

    const handleAcceptReschedule = (trainerId: string, trainerName: string) => {
        let trialsMap: Record<string, any> = { ...trialBookings };
        try {
            const saved = localStorage.getItem('zenith_trainer_trials');
            if (saved) {
                trialsMap = { ...JSON.parse(saved), ...trialsMap };
            }
        } catch (e) {}

        const current = trialsMap[trainerId] || { date: 'Tomorrow', time: '10:30 AM' };
        const updated = {
            ...trialsMap,
            [trainerId]: {
                ...current,
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
            title: '✅ Rescheduled Trial Accepted by Member!',
            message: `Alex Johnson has accepted your rescheduled trial session timing (${current.date} at ${current.time}).`,
            metadata: {
                type: 'TRIAL_APPROVED',
                trainerId,
                trainerName,
                memberName: 'Alex Johnson',
                date: current.date,
                time: current.time,
                status: 'approved',
                actionResponse: 'Accepted by Member'
            }
        });

        try {
            const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
            const auditLogs = savedAudit ? JSON.parse(savedAudit) : [];
            auditLogs.unshift({
                id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                requestId: trainerId,
                action: 'Reschedule Accepted',
                memberName: 'Alex Johnson',
                membershipId: 'NX-2026-9041',
                trainerName,
                timestamp: new Date().toISOString(),
                details: `Member accepted rescheduled trial timing (${current.date} at ${current.time}).`
            });
            localStorage.setItem('zenith_trial_audit_trail', JSON.stringify(auditLogs));
        } catch (e) {}

        toast.success(`Rescheduled time with ${trainerName} accepted! Trainer notified.`);
    };

    const handleDeclineReschedule = (trainerId: string, trainerName: string) => {
        let trialsMap: Record<string, any> = { ...trialBookings };
        try {
            const saved = localStorage.getItem('zenith_trainer_trials');
            if (saved) {
                trialsMap = { ...JSON.parse(saved), ...trialsMap };
            }
        } catch (e) {}

        const current = trialsMap[trainerId] || { date: 'Tomorrow', time: '10:30 AM' };
        const updated = {
            ...trialsMap,
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
            title: '❌ Rescheduled Trial Declined by Member',
            message: `Alex Johnson declined the rescheduled timing (${current.date} at ${current.time}) due to unavailability.`,
            metadata: {
                type: 'TRIAL_REJECTED',
                trainerId,
                trainerName,
                memberName: 'Alex Johnson',
                date: current.date,
                time: current.time,
                status: 'rejected',
                actionResponse: 'Declined by Member'
            }
        });

        try {
            const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
            const auditLogs = savedAudit ? JSON.parse(savedAudit) : [];
            auditLogs.unshift({
                id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                requestId: trainerId,
                action: 'Reschedule Declined',
                memberName: 'Alex Johnson',
                membershipId: 'NX-2026-9041',
                trainerName,
                timestamp: new Date().toISOString(),
                details: `Member declined rescheduled trial timing (${current.date} at ${current.time}).`
            });
            localStorage.setItem('zenith_trial_audit_trail', JSON.stringify(auditLogs));
        } catch (e) {}

        toast.error(`Rescheduled time declined. Trainer notified.`);
    };

    const getTrialStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', icon: Clock, label: 'Pending Approval' };
            case 'approved': return { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', icon: CheckCircle2, label: 'Approved' };
            case 'rejected': return { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400', icon: XCircle, label: 'Declined' };
            case 'rescheduled': return { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', dot: 'bg-amber-300', icon: Clock, label: 'Reschedule Proposed' };
            default: return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400', icon: Clock, label: 'Unknown' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">

            {/* ── Page Header ──────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-foreground dark:text-white">
                            Alerts &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-white">Bookings</span>
                        </h1>
                        {totalBadge > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-primary/20 text-amber-800 dark:text-gold-glow text-sm font-black border border-primary/30 animate-pulse">
                                {totalBadge} New
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">Real-time updates on trainer trials, member alerts, and gym notifications.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        className="gap-2 border-slate-200 dark:border-primary/20 text-slate-700 dark:text-slate-300 hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllAsRead()}
                        disabled={unreadNotifCount === 0}
                        className="group gap-2 border-slate-200 dark:border-primary/20 text-slate-700 dark:text-slate-300 hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground disabled:opacity-40"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:text-inherit transition-colors" />
                        Mark all read
                    </Button>
                </div>
            </div>

            {/* ── KPI Strip ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Trials', value: pendingTrials.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { label: 'Approved Trials', value: approvedTrials.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Declined Trials', value: rejectedTrials.length, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                    { label: 'Unread Alerts', value: unreadNotifCount, icon: Bell, color: 'text-primary dark:text-gold-glow', bg: 'bg-primary/10', border: 'border-primary/20' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className={`glass-card p-4 rounded-2xl border ${stat.border} transition-all hover:scale-[1.02]`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
                            <h3 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* ── Tab Navigation ────────────────────────────────────────── */}
            <div className="flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-primary/10 w-full md:w-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    let count = 0;
                    if (tab.id === 'trials') count = pendingTrials.length;
                    if (tab.id === 'notifications') count = unreadNotifCount;
                    if (tab.id === 'all') count = totalBadge;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                isActive
                                    ? 'bg-white dark:bg-background shadow-sm text-primary dark:text-gold-glow'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {count > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/15 text-primary dark:text-gold-glow' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {/* ────── ALL TAB ────── */}
                {activeTab === 'all' && (
                    <motion.div
                        key="all"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* PT Status Banner */}
                        {ptStatus?.paymentCompleted && !ptStatus?.trainerApproved && (
                            <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                <div className="p-2 bg-amber-500/20 rounded-xl flex-shrink-0">
                                    <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-amber-300">Awaiting PT Assignment Approval</p>
                                    <p className="text-xs text-amber-400/70 mt-0.5">Your Personal Training payment was confirmed. Your trainer will approve the assignment shortly.</p>
                                </div>
                                <Link href="/member/billing">
                                    <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl">
                                        View <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {ptStatus?.trainerApproved && (
                            <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <div className="p-2 bg-emerald-500/20 rounded-xl flex-shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-emerald-300">PT Assignment Active — Workouts Unlocked!</p>
                                    <p className="text-xs text-emerald-400/70 mt-0.5">Your trainer has approved your assignment. Head to My Workouts to see your personalized plans.</p>
                                </div>
                                <Link href="/member/plans">
                                    <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl">
                                        Open <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Recent Trial Requests (only pending) */}
                        {pendingTrials.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-foreground dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <Dumbbell className="w-4 h-4 text-amber-400" />
                                        Pending Trial Requests
                                    </h2>
                                    <button onClick={() => setActiveTab('trials')} className="text-xs text-primary dark:text-gold-glow hover:underline underline-offset-4 font-semibold">
                                        View All
                                    </button>
                                </div>
                                {pendingTrials.map(trial => (
                                    <div key={trial.trainerId} className="flex items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                                <Dumbbell className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground dark:text-white">Trial with {trial.trainerName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    <Calendar className="w-3 h-3 inline mr-1" />
                                                    {trial.date} at {trial.time}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">
                                            <Clock className="w-3 h-3 mr-1 animate-pulse" /> Pending
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Notifications */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-foreground dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary dark:text-gold-glow" />
                                    Recent Notifications
                                </h2>
                                <button onClick={() => setActiveTab('notifications')} className="text-xs text-primary dark:text-gold-glow hover:underline underline-offset-4 font-semibold">
                                    View All
                                </button>
                            </div>
                            {allNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground glass-card rounded-2xl border border-slate-200 dark:border-primary/10">
                                    <Inbox className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="font-semibold text-foreground dark:text-white">All caught up!</p>
                                    <p className="text-sm mt-1">No notifications at this time.</p>
                                </div>
                            ) : (
                                <div className="glass-card rounded-2xl border border-slate-200 dark:border-primary/10 overflow-hidden divide-y divide-slate-100 dark:divide-primary/5">
                                    {allNotifications.slice(0, 5).map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => { if (!notif.read && notif.isContext) markAsRead(notif.id); }}
                                            className={`flex gap-4 p-5 group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] relative ${!notif.read ? 'cursor-pointer' : ''}`}
                                        >
                                            {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-gold-glow rounded-r-full" />}
                                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotifBg(notif.type)}`}>
                                                {getNotifIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={`text-sm font-semibold truncate ${!notif.read ? 'text-foreground dark:text-white' : 'text-foreground/70 dark:text-white/70'}`}>{notif.title}</p>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                                {notif.metadata?.type === 'TRIAL_RESCHEDULED' && (
                                                    <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {(!trialBookings[notif.metadata.trainerId] || trialBookings[notif.metadata.trainerId]?.status === 'rescheduled') ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleAcceptReschedule(notif.metadata.trainerId, notif.metadata.trainerName || 'Coach')}
                                                                    className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                                                                >
                                                                    Accept Reschedule
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleDeclineReschedule(notif.metadata.trainerId, notif.metadata.trainerName || 'Coach')}
                                                                    className="h-7 px-3 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold rounded-lg"
                                                                >
                                                                    Decline
                                                                </Button>
                                                            </>
                                                        ) : trialBookings[notif.metadata.trainerId]?.status === 'approved' ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                                                ✓ Reschedule Accepted by You
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                                                                ✗ Reschedule Declined by You
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ────── TRIAL BOOKINGS TAB ────── */}
                {activeTab === 'trials' && (
                    <motion.div
                        key="trials"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                    >
                        {/* Status filter pills */}
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'pending', 'approved', 'rescheduled', 'rejected'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                        statusFilter === s
                                            ? s === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            : s === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : s === 'rescheduled' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            : s === 'rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                            : 'bg-primary/20 text-primary dark:text-gold-glow border-primary/30'
                                            : 'bg-transparent text-muted-foreground border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    {s === 'all' ? `All (${trialEntries.length})`
                                        : s === 'pending' ? `Pending (${pendingTrials.length})`
                                        : s === 'approved' ? `Approved (${approvedTrials.length})`
                                        : s === 'rescheduled' ? `Rescheduled (${trialEntries.filter(t => t.status === 'rescheduled').length})`
                                        : `Declined (${rejectedTrials.length})`}
                                </button>
                            ))}
                        </div>

                        {filteredTrials.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl border border-slate-200 dark:border-primary/10">
                                <Dumbbell className="w-12 h-12 mb-4 opacity-20 text-foreground" />
                                <h3 className="text-lg font-bold text-foreground dark:text-white">No trial bookings yet</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                    {statusFilter !== 'all' ? `No ${statusFilter} bookings found.` : 'Head to the Trainer Trial page to book a session.'}
                                </p>
                                {statusFilter === 'all' && (
                                    <Link href="/member/trainer-trial" className="mt-5">
                                        <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold">
                                            <Dumbbell className="w-4 h-4 mr-2" /> Book a Trial
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTrials.map(trial => {
                                    const style = getTrialStatusStyle(trial.status);
                                    const Icon = style.icon;
                                    return (
                                        <div key={trial.trainerId} className="glass-card rounded-2xl border border-slate-200 dark:border-primary/10 overflow-hidden">
                                            <div className={`h-1 w-full ${trial.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : trial.status === 'approved' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-pink-400'}`} />
                                            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getNotifBg(trial.status === 'pending' ? 'promo' : trial.status === 'approved' ? 'billing' : 'system')}`}>
                                                    <Dumbbell className={`w-5 h-5 ${trial.status === 'pending' ? 'text-amber-400' : trial.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="text-base font-bold text-foreground dark:text-white">Trainer Trial — {trial.trainerName}</h3>
                                                        <Badge variant="outline" className={`text-[10px] font-black uppercase ${style.badge}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${style.dot}`} />
                                                            {style.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" /> {trial.date}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" /> {trial.time}
                                                        </span>
                                                    </div>
                                                    {trial.status === 'pending' && (
                                                        <p className="text-xs text-amber-400/80 mt-2 flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Awaiting trainer approval. You'll be notified once confirmed.
                                                        </p>
                                                    )}
                                                    {trial.status === 'approved' && (
                                                        <p className="text-xs text-emerald-400/80 mt-2 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Trial approved! Complete payment to unlock your workouts.
                                                        </p>
                                                    )}
                                                    {trial.status === 'rejected' && (
                                                        <p className="text-xs text-rose-400/80 mt-2 flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            This trial was declined. You may book with another trainer.
                                                        </p>
                                                    )}
                                                    {trial.status === 'rescheduled' && (
                                                        <p className="text-xs text-amber-300/90 mt-2 flex items-center gap-1">
                                                            <Clock className="w-3 h-3 animate-pulse" />
                                                            Coach proposed new timing: {trial.date} at {trial.time}. Please Accept or Decline.
                                                        </p>
                                                    )}
                                                </div>
                                                {trial.status === 'rescheduled' && (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAcceptReschedule(trial.trainerId, trial.trainerName)}
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs"
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeclineReschedule(trial.trainerId, trial.trainerName)}
                                                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl font-bold text-xs"
                                                        >
                                                            Decline
                                                        </Button>
                                                    </div>
                                                )}
                                                {trial.status === 'approved' && (
                                                    <Link href={`/member/billing?payTrial=true&trainerId=${trial.trainerId}`}>
                                                        <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:brightness-110 shrink-0">
                                                            Pay Now <ArrowRight className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {trial.status === 'rejected' && (
                                                    <Link href="/member/trainer-trial">
                                                        <Button size="sm" variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl shrink-0">
                                                            Rebook
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Book new trial CTA */}
                        {trialEntries.length > 0 && (
                            <Link href="/member/trainer-trial">
                                <div className="mt-2 p-4 rounded-2xl border border-dashed border-primary/20 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Zap className="w-4 h-4 text-primary dark:text-gold-glow" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground dark:text-white">Book Another Trial</p>
                                            <p className="text-xs text-muted-foreground">Explore other trainers in the roster.</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-primary dark:text-gold-glow group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        )}
                    </motion.div>
                )}

                {/* ────── NOTIFICATIONS TAB ────── */}
                {activeTab === 'notifications' && (
                    <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {allNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl border border-slate-200 dark:border-primary/10">
                                <Bell className="w-12 h-12 mb-4 opacity-20 text-foreground" />
                                <h3 className="text-lg font-bold text-foreground dark:text-white">All clear!</h3>
                                <p className="text-sm text-muted-foreground mt-1">No notifications right now.</p>
                            </div>
                        ) : (
                            <div className="glass-card rounded-2xl border border-slate-200 dark:border-primary/10 overflow-hidden divide-y divide-slate-100 dark:divide-primary/5">
                                {allNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => { if (!notif.read && notif.isContext) markAsRead(notif.id); }}
                                        className={`flex gap-4 p-5 group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] relative ${!notif.read ? 'bg-primary/[0.02] dark:bg-gold-glow/[0.02] cursor-pointer' : ''}`}
                                    >
                                        {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-gold-glow rounded-r-full" />}
                                        <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotifBg(notif.type)}`}>
                                            {getNotifIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex justify-between items-start gap-3">
                                                <h4 className={`text-sm font-semibold ${!notif.read ? 'text-foreground dark:text-white' : 'text-foreground/70 dark:text-white/70'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="w-3 h-3" />{notif.time}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed ${!notif.read ? 'text-muted-foreground dark:text-gray-300' : 'text-muted-foreground/70'}`}>
                                                {notif.message}
                                            </p>
                                            {notif.metadata?.type === 'TRIAL_RESCHEDULED' && (
                                                <div className="pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {(!trialBookings[notif.metadata.trainerId] || trialBookings[notif.metadata.trainerId]?.status === 'rescheduled') ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAcceptReschedule(notif.metadata.trainerId, notif.metadata.trainerName || 'Coach')}
                                                                className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                                                            >
                                                                Accept Reschedule
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDeclineReschedule(notif.metadata.trainerId, notif.metadata.trainerName || 'Coach')}
                                                                className="h-7 px-3 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold rounded-lg"
                                                            >
                                                                Decline
                                                            </Button>
                                                        </>
                                                    ) : trialBookings[notif.metadata.trainerId]?.status === 'approved' ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                                            ✓ Reschedule Accepted by You
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                                                            ✗ Reschedule Declined by You
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {notif.actionNeeded && (
                                                <button className="text-xs font-semibold text-amber-700 dark:text-gold-glow hover:underline underline-offset-4 mt-1">
                                                    View Details
                                                </button>
                                            )}
                                        </div>
                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteNotif(notif.id); }}
                                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
