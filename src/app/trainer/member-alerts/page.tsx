'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { useNotifications, formatTimestamp } from '@/context/NotificationContext';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Info,
    Calendar,
    MessageSquare,
    Send,
    CheckCheck,
    History,
    Users,
    FileText,
    AlertCircle,
    RefreshCw,
    Edit2,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRAINER_NAMES: Record<string, string> = {
    'marcus-johnson': 'Marcus Johnson',
    'sarah-chen': 'Sarah Chen',
    'michael-rivers': 'Michael Rivers',
};

// Preset decline reasons
const DECLINE_REASONS = [
    "Trainer fully booked at requested hour",
    "Personal/Trainer scheduling conflict",
    "Outside gym operational hours",
    "Trainer out of office/on leave",
    "Custom reason..."
];

interface UnifiedTrialRequest {
    id: string; // notification ID or synthetic
    trainerId: string;
    trainerName: string;
    memberName: string;
    memberEmail: string;
    membershipId: string;
    fitnessGoal: string;
    date: string;
    time: string;
    status: 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'completed';
    requestDate: string;
    timestamp: Date;
    isRead: boolean;
    notificationId?: string;
    isDirectPT?: boolean;
}

interface AuditLog {
    id: string;
    requestId: string;
    action: 'Created' | 'Approved' | 'Declined' | 'Rescheduled' | 'Reschedule Accepted' | 'Reschedule Declined' | 'Completed';
    memberName: string;
    membershipId: string;
    trainerName: string;
    timestamp: string;
    details: string;
}

// Generate deterministic details based on member names
const getMembershipId = (name: string): string => {
    if (name.toLowerCase().includes('alex')) return 'NX-2026-9041';
    if (name.toLowerCase().includes('jane')) return 'NX-2026-8042';
    if (name.toLowerCase().includes('jessica')) return 'NX-2026-4401';
    if (name.toLowerCase().includes('david')) return 'NX-2026-1189';
    return 'NX-2026-5592';
};

const getFitnessGoal = (name: string): string => {
    if (name.toLowerCase().includes('alex')) return 'Weight Loss & Powerlifting';
    if (name.toLowerCase().includes('jane')) return 'Endurance & Cardio Conditioning';
    if (name.toLowerCase().includes('jessica')) return 'Hypertrophy & Form Assessment';
    if (name.toLowerCase().includes('david')) return 'Core Strength & Injury Prevention';
    return 'General Strength & Conditioning';
};

export default function MemberAlertsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { notifications, markAsRead, markAllAsRead, addNotification, updateNotificationMetadata } = useNotifications();

    const [activeTab, setActiveTab] = useState<'trials' | 'alerts' | 'audit'>('trials');
    const [trialFilter, setTrialFilter] = useState<'all' | 'new' | 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'history'>('all');

    // States for custom actions
    const [selectedRequest, setSelectedRequest] = useState<UnifiedTrialRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'reschedule' | null>(null);
    
    // Decline reason states
    const [declineReason, setDeclineReason] = useState(DECLINE_REASONS[0]);
    const [customDeclineReason, setCustomDeclineReason] = useState('');
    
    // Reschedule states
    const [rescheduleDateIdx, setRescheduleDateIdx] = useState(0);
    const [rescheduleTime, setRescheduleTime] = useState('10:30 AM');
    
    const [responseText, setResponseText] = useState('');
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

    // List of audit logs
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // Filter general alerts (non-trial requests)
    const trainerNotifications = notifications.filter(
        n => n.role === 'trainer'
    );
    const memberAlerts = trainerNotifications.filter(
        n => n.metadata?.type !== 'TRIAL_REQUEST'
    );
    const unreadAlertsCount = memberAlerts.filter(n => !n.isRead).length;

    // Build unified list of trial requests from notifications and localStorage
    const [unifiedRequests, setUnifiedRequests] = useState<UnifiedTrialRequest[]>([]);

    const loadAuditLogs = () => {
        try {
            const saved = localStorage.getItem('zenith_trial_audit_trail');
            if (saved) {
                setAuditLogs(JSON.parse(saved));
            } else {
                // Seed some history logs if empty
                const initialLogs: AuditLog[] = [
                    {
                        id: 'seed_1',
                        requestId: 'seed_req_1',
                        action: 'Approved',
                        memberName: 'Jessica Miller',
                        membershipId: 'NX-2026-4401',
                        trainerName: 'Sarah Chen',
                        timestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
                        details: 'Trial booked on June 18 at 02:30 PM. Quick Form Assessment requested.'
                    },
                    {
                        id: 'seed_2',
                        requestId: 'seed_req_2',
                        action: 'Completed',
                        memberName: 'Lisa Anderson',
                        membershipId: 'NX-2026-5592',
                        trainerName: 'Michael Rivers',
                        timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
                        details: 'Trial session fully completed and logged in Wellness Monitor.'
                    }
                ];
                localStorage.setItem('zenith_trial_audit_trail', JSON.stringify(initialLogs));
                setAuditLogs(initialLogs);
            }
        } catch (e) {}
    };

    const addAuditLog = (action: AuditLog['action'], req: UnifiedTrialRequest, details: string) => {
        try {
            const saved = localStorage.getItem('zenith_trial_audit_trail');
            const logs = saved ? JSON.parse(saved) : [];
            const newLog: AuditLog = {
                id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                requestId: req.id,
                action,
                memberName: req.memberName,
                membershipId: req.membershipId,
                trainerName: req.trainerName,
                timestamp: new Date().toISOString(),
                details
            };
            const updated = [newLog, ...logs];
            localStorage.setItem('zenith_trial_audit_trail', JSON.stringify(updated));
            setAuditLogs(updated);
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Failed to add audit log", e);
        }
    };

    const loadUnifiedRequests = () => {
        // 1. Get trial requests from notifications
        const trialNotifs = trainerNotifications.filter(
            n => n.metadata?.type === 'TRIAL_REQUEST'
        );

        const notifRequests: UnifiedTrialRequest[] = trialNotifs.map(n => {
            const meta = n.metadata || {};
            const mName = (meta.memberName as string) || 'Alex';
            return {
                id: n.id,
                notificationId: n.id,
                trainerId: (meta.trainerId as string) || 'marcus-johnson',
                trainerName: (meta.trainerName as string) || 'Marcus Johnson',
                memberName: mName,
                memberEmail: (meta.memberEmail as string) || 'member@flexgym.com',
                membershipId: getMembershipId(mName),
                fitnessGoal: getFitnessGoal(mName),
                date: (meta.date as string) || 'Tomorrow',
                time: (meta.time as string) || '10:00 AM',
                status: (meta.status as any) || 'pending',
                requestDate: new Date(n.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                timestamp: new Date(n.timestamp),
                isRead: n.isRead
            };
        });

        // 1b. Get direct PT requests from notifications
        const ptNotifs = trainerNotifications.filter(
            n => n.metadata?.type === 'PT_REQUEST'
        );

        const ptNotifRequests: UnifiedTrialRequest[] = ptNotifs.map(n => {
            const meta = n.metadata || {};
            const mName = (meta.memberName as string) || 'Alex';
            return {
                id: n.id,
                notificationId: n.id,
                trainerId: (meta.trainerId as string) || 'marcus-johnson',
                trainerName: (meta.trainerName as string) || 'Marcus Johnson',
                memberName: mName,
                memberEmail: (meta.memberEmail as string) || 'member@flexgym.com',
                membershipId: getMembershipId(mName),
                fitnessGoal: getFitnessGoal(mName),
                date: 'N/A',
                time: 'Direct PT Enrollment',
                status: (meta.status as any) || 'pending',
                requestDate: new Date(n.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                timestamp: new Date(n.timestamp),
                isRead: n.isRead,
                isDirectPT: true
            };
        });

        // 2. Get trial requests from localStorage
        let localRequests: UnifiedTrialRequest[] = [];
        try {
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            if (savedTrials) {
                const trials = JSON.parse(savedTrials);
                Object.entries(trials).forEach(([trainerId, data]: [string, any]) => {
                    // Check if we already have this request via notification
                    const alreadyExists = notifRequests.some(r => r.trainerId === trainerId);
                    if (!alreadyExists) {
                        localRequests.push({
                            id: `local_${trainerId}`,
                            trainerId,
                            trainerName: TRAINER_NAMES[trainerId] || trainerId,
                            memberName: 'Alex',
                            memberEmail: 'member@flexgym.com',
                            membershipId: getMembershipId('Alex'),
                            fitnessGoal: getFitnessGoal('Alex'),
                            date: data.date,
                            time: data.time,
                            status: data.status || 'pending',
                            requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            timestamp: new Date(),
                            isRead: true
                        });
                    } else {
                        // Sync status from localStorage to notifications list if present
                        const matched = notifRequests.find(r => r.trainerId === trainerId);
                        if (matched && matched.status !== data.status) {
                            matched.status = data.status;
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse trainer trials from storage", e);
        }

        // 2b. Get direct PT request from localStorage
        try {
            const savedPT = localStorage.getItem('zenith_pt_status');
            if (savedPT) {
                const pt = JSON.parse(savedPT);
                if (pt.status) {
                    const trainerId = pt.requestedTrainerId || pt.assignedTrainerId || 'marcus-johnson';
                    const trainerName = pt.requestedTrainerName || pt.assignedTrainerName || 'Marcus Johnson';
                    const alreadyExists = ptNotifRequests.some(r => r.trainerId === trainerId);
                    
                    let mappedStatus: any = pt.status;
                    if (pt.status === 'paid') mappedStatus = 'completed';

                    if (!alreadyExists) {
                        localRequests.push({
                            id: `local_pt_${trainerId}`,
                            trainerId,
                            trainerName,
                            memberName: 'Alex',
                            memberEmail: 'member@flexgym.com',
                            membershipId: getMembershipId('Alex'),
                            fitnessGoal: getFitnessGoal('Alex'),
                            date: 'N/A',
                            time: 'Direct PT Enrollment',
                            status: mappedStatus,
                            requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            timestamp: new Date(),
                            isRead: true,
                            isDirectPT: true
                        });
                    } else {
                        const matched = ptNotifRequests.find(r => r.trainerId === trainerId);
                        if (matched) {
                            matched.status = mappedStatus;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Failed to parse direct PT status from storage", e);
        }

        // Combine and sort chronologically (most recent first)
        const combined = [...notifRequests, ...ptNotifRequests, ...localRequests].sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        setUnifiedRequests(combined);
    };

    useEffect(() => {
        loadUnifiedRequests();
        loadAuditLogs();
        const handleStorage = () => {
            loadUnifiedRequests();
            loadAuditLogs();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [notifications]);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'TRAINER')) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || !isAuthenticated || user?.role !== 'TRAINER') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic">
                Verifying Credentials...
            </div>
        );
    }

    // Secondary Dates helper for rescheduling
    const rescheduleDates = Array.from({ length: 4 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 2); // Proposed rescheduling dates (2 days out and onwards)
        return {
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            formatted: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };
    });

    const rescheduleTimesList = [
        '09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
    ];

    // Derived trial counts for tabs/badges
    const newTrials = unifiedRequests.filter(r => r.status === 'pending' && !r.isRead);
    const pendingTrials = unifiedRequests.filter(r => r.status === 'pending');
    const approvedTrials = unifiedRequests.filter(r => r.status === 'approved');
    const rejectedTrials = unifiedRequests.filter(r => r.status === 'rejected');
    const rescheduledTrials = unifiedRequests.filter(r => r.status === 'rescheduled');
    const unreadTrialsCount = newTrials.length;

    // Filter requests list by sub-filter
    const filteredRequests = unifiedRequests.filter(req => {
        switch (trialFilter) {
            case 'new': return req.status === 'pending' && !req.isRead;
            case 'pending': return req.status === 'pending';
            case 'approved': return req.status === 'approved';
            case 'rejected': return req.status === 'rejected';
            case 'rescheduled': return req.status === 'rescheduled';
            case 'history': return ['approved', 'rejected', 'rescheduled', 'completed'].includes(req.status);
            default: return true;
        }
    });

    const handleOpenAction = (req: UnifiedTrialRequest, type: 'approve' | 'reject' | 'reschedule') => {
        setSelectedRequest(req);
        setActionType(type);
        setResponseText('');
        setDeclineReason(DECLINE_REASONS[0]);
        setCustomDeclineReason('');
        setRescheduleDateIdx(0);
        setRescheduleTime(rescheduleTimesList[1]);
        setIsActionDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedRequest || !actionType) return;

        const { trainerId, trainerName, memberName, memberEmail, date, time, notificationId, isDirectPT } = selectedRequest;

        if (isDirectPT) {
            if (actionType === 'reject') {
                const finalReason = declineReason === "Custom reason..." 
                    ? customDeclineReason.trim() || "No specific reason provided." 
                    : declineReason;

                if (notificationId) {
                    updateNotificationMetadata(notificationId, { status: 'rejected' });
                    markAsRead(notificationId);
                }

                localStorage.removeItem('zenith_pt_status');

                addNotification({
                    role: 'member',
                    userId: '3', // Alex
                    category: 'MEMBERSHIP',
                    priority: 'medium',
                    title: '❌ Personal Training Request Declined',
                    message: responseText.trim()
                        ? `Your Personal Training request with ${trainerName} was declined. Reason: ${finalReason}.\n\nMessage from Coach: "${responseText.trim()}"`
                        : `Your Personal Training request with ${trainerName} was declined. Reason: ${finalReason}. You may select another trainer from the Personal Training section.`,
                });

                addAuditLog('Declined', selectedRequest, `Direct PT Request Declined. Reason: "${finalReason}". Message: "${responseText.trim()}"`);
                toast.error(`Direct PT request declined for ${memberName}.`);
            } else if (actionType === 'approve') {
                if (notificationId) {
                    updateNotificationMetadata(notificationId, { status: 'approved' });
                    markAsRead(notificationId);
                }

                const savedPT = localStorage.getItem('zenith_pt_status');
                const currentPT = savedPT ? JSON.parse(savedPT) : {};
                const updatedPT = { 
                    ...currentPT, 
                    status: 'approved',
                    approvalDate: new Date().toISOString()
                };
                localStorage.setItem('zenith_pt_status', JSON.stringify(updatedPT));

                addNotification({
                    role: 'member',
                    userId: '3', // Alex
                    category: 'MEMBERSHIP',
                    priority: 'high',
                    title: '✅ Personal Training Request Approved!',
                    message: responseText.trim()
                        ? `Your Personal Training request with ${trainerName} has been approved!\n\nMessage from Coach: "${responseText.trim()}"\n\nPlease proceed to the Billing section to complete payment.`
                        : `Your Personal Training request with ${trainerName} has been approved! Please proceed to the Billing section to complete payment and unlock your workouts.`,
                });

                addAuditLog('Approved', selectedRequest, `Direct PT Request Approved. Message: "${responseText.trim()}"`);
                toast.success(`Direct PT request approved for ${memberName}!`);
            }

            window.dispatchEvent(new Event('storage'));
            setIsActionDialogOpen(false);
            setSelectedRequest(null);
            setActionType(null);
            setResponseText('');
            loadUnifiedRequests();
            return;
        }

        // 1. Decline Action Logic
        if (actionType === 'reject') {
            const finalReason = declineReason === "Custom reason..." 
                ? customDeclineReason.trim() || "No specific reason provided." 
                : declineReason;

            // Update Notification Metadata if backed by notification
            if (notificationId) {
                updateNotificationMetadata(notificationId, { status: 'rejected' });
                markAsRead(notificationId);
            }

            // Update localStorage 'zenith_trainer_trials'
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            if (savedTrials) {
                try {
                    const trials = JSON.parse(savedTrials);
                    if (trials[trainerId]) {
                        trials[trainerId].status = 'rejected';
                        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                    }
                } catch (e) {}
            }

            // Send Apology Notification to Member
            const finalApology = responseText.trim()
                ? `Your trial session request with ${trainerName} on ${date} at ${time} was declined. Reason: ${finalReason}.\n\nMessage from Coach: "${responseText.trim()}"`
                : `We apologize, but your trial session request with ${trainerName} on ${date} at ${time} was declined. Reason: ${finalReason}. Feel free to request another slot or trainer.`;

            addNotification({
                role: 'member',
                category: 'MEMBER',
                priority: 'high',
                title: '❌ Trial Session Declined',
                message: finalApology,
                metadata: {
                    type: 'TRIAL_REJECTED',
                    trainerId,
                    trainerName,
                    date,
                    time,
                    reason: finalReason,
                    response: responseText.trim() || undefined
                }
            });

            // Log to Audit Trail
            addAuditLog('Declined', selectedRequest, `Decline Reason: "${finalReason}". Message: "${responseText.trim()}"`);
            toast.error(`Trial request declined for ${memberName}.`);
        }

        // 2. Reschedule Action Logic
        if (actionType === 'reschedule') {
            const newProposedDate = rescheduleDates[rescheduleDateIdx].formatted;
            const newProposedTime = rescheduleTime;

            // Update Notification Metadata
            if (notificationId) {
                updateNotificationMetadata(notificationId, { 
                    status: 'rescheduled',
                    date: newProposedDate,
                    time: newProposedTime
                });
                markAsRead(notificationId);
            }

            // Update localStorage 'zenith_trainer_trials'
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            if (savedTrials) {
                try {
                    const trials = JSON.parse(savedTrials);
                    if (trials[trainerId]) {
                        trials[trainerId].status = 'rescheduled';
                        trials[trainerId].date = newProposedDate;
                        trials[trainerId].time = newProposedTime;
                        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                    }
                } catch (e) {}
            }

            // Send proposed timing notification to Member
            const finalMessage = responseText.trim()
                ? `Coach ${trainerName} has proposed to reschedule your trial session. New Proposed Timing: ${newProposedDate} at ${newProposedTime}.\n\nNote from Coach: "${responseText.trim()}"`
                : `Coach ${trainerName} has proposed to reschedule your trial session to ${newProposedDate} at ${newProposedTime}. Please accept or decline the reschedule proposal in your Trial Program panel.`;

            addNotification({
                role: 'member',
                category: 'MEMBER',
                priority: 'high',
                title: '🔄 Trial Session Reschedule Proposed',
                message: finalMessage,
                metadata: {
                    type: 'TRIAL_RESCHEDULED',
                    trainerId,
                    trainerName,
                    date: newProposedDate,
                    time: newProposedTime,
                    response: responseText.trim() || undefined
                }
            });

            // Log to Audit Trail
            addAuditLog('Rescheduled', selectedRequest, `Proposed timing changed from [${date} at ${time}] to [${newProposedDate} at ${newProposedTime}]. Notes: "${responseText.trim()}"`);
            toast.info(`Proposed rescheduling to ${newProposedDate} at ${newProposedTime}.`);
        }

        // 3. Approve Action Logic
        if (actionType === 'approve') {
            // Update Notification Metadata
            if (notificationId) {
                updateNotificationMetadata(notificationId, { status: 'approved' });
                markAsRead(notificationId);
            }

            // Update localStorage 'zenith_trainer_trials'
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            if (savedTrials) {
                try {
                    const trials = JSON.parse(savedTrials);
                    if (trials[trainerId]) {
                        trials[trainerId].status = 'approved';
                        localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                    }
                } catch (e) {}
            }

            // Update localStorage 'zenith_pt_status'
            const savedPT = localStorage.getItem('zenith_pt_status');
            const currentPT = savedPT ? JSON.parse(savedPT) : {};
            const updatedPT = { ...currentPT, trialCompleted: true };
            localStorage.setItem('zenith_pt_status', JSON.stringify(updatedPT));

            // Send Approval Notification to Member
            const finalMessage = responseText.trim()
                ? `Your trial session request with ${trainerName} on ${date} at ${time} has been approved!\n\nMessage from Coach: "${responseText.trim()}"`
                : `Your trial session request with ${trainerName} on ${date} at ${time} has been approved! We are excited to meet you.`;

            addNotification({
                role: 'member',
                category: 'MEMBER',
                priority: 'high',
                title: '✅ Trial Session Approved',
                message: finalMessage,
                metadata: {
                    type: 'TRIAL_APPROVED',
                    trainerId,
                    trainerName,
                    date,
                    time,
                    response: responseText.trim() || undefined
                }
            });

            // Log to Audit Trail
            addAuditLog('Approved', selectedRequest, `Approved schedule: ${date} at ${time}. Message: "${responseText.trim()}"`);
            toast.success(`Trial request approved for ${memberName}!`);
        }

        window.dispatchEvent(new Event('storage'));
        setIsActionDialogOpen(false);
        setSelectedRequest(null);
        setActionType(null);
        setResponseText('');
        loadUnifiedRequests();
    };

    const handleMarkAlertRead = (id: string) => {
        markAsRead(id);
        toast.success('Notification marked as read');
    };

    const handleMarkAllAlertsRead = () => {
        memberAlerts.forEach(n => {
            if (!n.isRead) markAsRead(n.id);
        });
        toast.success('All general alerts marked as read');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2 transition-all" asChild>
                    <Link href="/trainer">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <header>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent pb-1 italic">
                            MEMBER ALERTS <span className="not-italic text-white">& TRIAL BOOKINGS</span>
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 tracking-wide">
                            <Bell className="w-4 h-4 text-blue-400" />
                            Manage client trial requests, review notifications, and propose reschedule times.
                        </p>
                    </header>

                    {/* Main Category Tabs */}
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 shadow-soft backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('trials')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'trials' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Calendar className="w-4 h-4" />
                            Trial Bookings
                            {unreadTrialsCount > 0 && (
                                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                    {unreadTrialsCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Bell className="w-4 h-4" />
                            Member Notifications
                            {unreadAlertsCount > 0 && (
                                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                    {unreadAlertsCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <History className="w-4 h-4" />
                            Audit Trail
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">New Trial Requests</p>
                    <h3 className="text-3xl font-black text-white">{newTrials.length}</h3>
                </Card>
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pending Trials</p>
                    <h3 className="text-3xl font-black text-white">{pendingTrials.length}</h3>
                </Card>
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Approved Trials</p>
                    <h3 className="text-3xl font-black text-white">{approvedTrials.length}</h3>
                </Card>
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Rescheduled Trials</p>
                    <h3 className="text-3xl font-black text-white">{rescheduledTrials.length}</h3>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                {activeTab === 'trials' && (
                    <div className="space-y-6">
                        {/* Sub-Filters / Pills */}
                        <div className="flex flex-wrap gap-2 pb-2">
                            {([
                                { key: 'all', label: 'All Requests' },
                                { key: 'new', label: 'New Requests', badge: newTrials.length },
                                { key: 'pending', label: 'Pending', badge: pendingTrials.length },
                                { key: 'approved', label: 'Approved', badge: approvedTrials.length },
                                { key: 'rejected', label: 'Rejected', badge: rejectedTrials.length },
                                { key: 'rescheduled', label: 'Rescheduled', badge: rescheduledTrials.length },
                                { key: 'history', label: 'Request History' }
                            ] as Array<{ key: 'all' | 'new' | 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'history'; label: string; badge?: number }>).map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setTrialFilter(filter.key)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 uppercase tracking-wider ${
                                        trialFilter === filter.key
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-glow'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                                    }`}
                                >
                                    {filter.label}
                                    {filter.badge !== undefined && filter.badge > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${trialFilter === filter.key ? 'bg-white text-blue-600 font-extrabold' : 'bg-blue-900/30 text-blue-400'}`}>
                                            {filter.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Requests Feed */}
                        <AnimatePresence mode="popLayout">
                            {filteredRequests.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800/80"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                        No trial requests found in this category
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredRequests.map((req, idx) => (
                                        <motion.div
                                            key={req.id}
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                                            className={`glass-card p-6 border rounded-2xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 ${
                                                req.status === 'pending' && !req.isRead 
                                                    ? 'bg-blue-600/[0.03] border-blue-500/30' 
                                                    : 'bg-slate-900/20 border-slate-800/60'
                                            }`}
                                        >
                                            {/* Top Line */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-12 w-12 border-2 border-slate-800">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.memberName}&backgroundColor=0f172a&textColor=38bdf8`} />
                                                        <AvatarFallback className="bg-slate-800">{req.memberName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                                                            {req.memberName}
                                                            {req.status === 'pending' && !req.isRead && (
                                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" title="New Request" />
                                                            )}
                                                        </h3>
                                                        <p className="text-xs text-slate-400 font-medium">Goal: {req.fitnessGoal}</p>
                                                    </div>
                                                </div>

                                                <Badge className={`font-black text-[9px] uppercase px-2.5 py-0.5 border tracking-wider rounded-md ${
                                                    req.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                                        : req.status === 'approved'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                                            : req.status === 'rescheduled'
                                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                                                }`}>
                                                    {req.status}
                                                </Badge>
                                            </div>

                                            {/* Complete Request Details */}
                                            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-2.5 text-xs">
                                                <div className="grid grid-cols-2 gap-y-2">
                                                    <div className="text-slate-500">Membership ID:</div>
                                                    <div className="font-semibold text-slate-300 text-right">{req.membershipId}</div>

                                                    <div className="text-slate-500">Email Address:</div>
                                                    <div className="text-slate-400 text-right truncate">{req.memberEmail}</div>

                                                    <div className="text-slate-500">{req.isDirectPT ? 'Enrollment Type:' : 'Preferred Schedule:'}</div>
                                                    <div className="font-bold text-blue-400 text-right flex items-center justify-end gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" /> {req.isDirectPT ? 'Direct PT (1 Month)' : `${req.date} at ${req.time}`}
                                                    </div>

                                                    <div className="text-slate-500">Target Coach:</div>
                                                    <div className="font-semibold text-slate-300 text-right">{req.trainerName}</div>
                                                </div>

                                                {/* Meta Timestamp */}
                                                <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[10px] text-slate-500">
                                                    <span>Request Date: {req.requestDate}</span>
                                                    <span>{formatTimestamp(req.timestamp)}</span>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex justify-between items-center gap-3 pt-2">
                                                <div className="text-[10px] text-slate-500 font-medium">
                                                    ID: {req.id.substring(0, 12)}
                                                </div>

                                                <div className="flex gap-2">
                                                    {req.status === 'pending' ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleOpenAction(req, 'reject')}
                                                                className="border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl px-2.5 py-1.5 h-auto text-[10px]"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                                                            </Button>
                                                            {!req.isDirectPT && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleOpenAction(req, 'reschedule')}
                                                                    className="border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 hover:text-rose-300 rounded-xl px-2.5 py-1.5 h-auto text-[10px]"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reschedule
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenAction(req, 'approve')}
                                                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md px-3 py-1.5 h-auto text-[10px]"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                                                            {req.status === 'completed' ? (
                                                                <span className="text-emerald-450 flex items-center gap-1 uppercase tracking-wider text-[10px] font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.15)] bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                                                    {req.isDirectPT ? '✓ Activated & Paid' : '✓ Trial Completed'}
                                                                </span>
                                                            ) : req.status === 'approved' ? (
                                                                <span className="text-emerald-400 flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                                                                    {req.isDirectPT ? '✓ Approved (Awaiting Payment)' : '✓ Trial Booked'}
                                                                </span>
                                                            ) : req.status === 'rescheduled' ? (
                                                                <span className="text-purple-400 flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                                                                    ↺ Rescheduled proposed
                                                                </span>
                                                            ) : (
                                                                <span className="text-rose-450 flex items-center gap-1 uppercase tracking-wider text-[10px] font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.15)] bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                                                                    ✗ Request Declined
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl overflow-hidden p-6 space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <div>
                                <CardTitle className="text-xl text-white">General Alerts Feed</CardTitle>
                                <CardDescription className="text-xs mt-1">Real-time reports, membership notices, and system alerts</CardDescription>
                            </div>
                            {unreadAlertsCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAlertsRead}
                                    className="text-xs text-blue-400 hover:bg-white/5 rounded-xl border border-transparent"
                                >
                                    <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
                                </Button>
                            )}
                        </div>

                        <AnimatePresence mode="popLayout">
                            {memberAlerts.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                        No general alerts found
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {memberAlerts.map((n, idx) => (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-4 rounded-2xl border transition-all text-sm flex items-start gap-4 relative overflow-hidden ${
                                                !n.isRead
                                                    ? 'bg-blue-600/[0.04] border-blue-500/20'
                                                    : 'bg-slate-950/20 border-slate-900'
                                            }`}
                                        >
                                            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xl flex-shrink-0">
                                                🔔
                                            </div>

                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-slate-200 text-base">{n.title}</h4>
                                                    <span className="text-xs text-slate-500 font-medium shrink-0">
                                                        {formatTimestamp(n.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 leading-relaxed text-xs">{n.message}</p>

                                                {/* Meta line */}
                                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                    {!!n.metadata?.trainerName && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Target Coach: {n.metadata.trainerName as string}
                                                        </span>
                                                    )}

                                                    {!n.isRead && (
                                                        <button
                                                            onClick={() => handleMarkAlertRead(n.id)}
                                                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider ml-auto"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </Card>
                )}

                {activeTab === 'audit' && (
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl overflow-hidden p-6 space-y-6">
                        <div>
                            <CardTitle className="text-xl text-white">Trial Audit Trail Log</CardTitle>
                            <CardDescription className="text-xs mt-1">Complete historical record of all trial request events and status updates</CardDescription>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-white/[0.01]">
                                        <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Timestamp</th>
                                        <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Member</th>
                                        <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Membership ID</th>
                                        <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Coach</th>
                                        <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Event Action</th>
                                        <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Log details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 font-semibold">{log.memberName}</td>
                                            <td className="py-3 px-4 text-slate-400 font-mono">{log.membershipId}</td>
                                            <td className="py-3 px-4 text-slate-300">{log.trainerName}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={`text-[8px] font-black uppercase tracking-wider rounded-md border py-0.5 ${
                                                    log.action === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    log.action === 'Declined' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    log.action === 'Rescheduled' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    log.action === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 leading-normal max-w-sm truncate hover:text-clip hover:whitespace-normal" title={log.details}>
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal Dialog for Actions (Approve, Reject, Reschedule) */}
            <Dialog open={isActionDialogOpen} onOpenChange={(open) => !open && setIsActionDialogOpen(false)}>
                <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-heading uppercase text-foreground tracking-tighter flex items-center gap-2">
                            {actionType === 'approve' && (
                                <>
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Approve Trial Session
                                </>
                            )}
                            {actionType === 'reject' && (
                                <>
                                    <XCircle className="w-6 h-6 text-rose-400" /> Decline Trial Session
                                </>
                            )}
                            {actionType === 'reschedule' && (
                                <>
                                    <RefreshCw className="w-6 h-6 text-purple-400" /> Propose Rescheduling
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                            {actionType === 'approve' && `Approve schedule for ${selectedRequest?.memberName}`}
                            {actionType === 'reject' && `Select reject reason and notify ${selectedRequest?.memberName}`}
                            {actionType === 'reschedule' && `Propose new slots for ${selectedRequest?.memberName}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-5 mt-4">
                            {/* Member requested details box */}
                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                                <Avatar className="h-10 w-10 border border-slate-800">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedRequest.memberName}&backgroundColor=0f172a&textColor=38bdf8`} />
                                    <AvatarFallback>{selectedRequest.memberName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-white">{selectedRequest.memberName} ({selectedRequest.membershipId})</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Currently: {selectedRequest.date} at {selectedRequest.time}</p>
                                </div>
                            </div>

                            {/* Decline Reason Picker logic */}
                            {actionType === 'reject' && (
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Select Rejection Reason *
                                    </label>
                                    <div className="space-y-1.5">
                                        {DECLINE_REASONS.map((reason) => (
                                            <label 
                                                key={reason} 
                                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                                    declineReason === reason 
                                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' 
                                                        : 'bg-black/10 border-white/5 hover:border-slate-800 text-slate-400'
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="declineReason" 
                                                    checked={declineReason === reason} 
                                                    onChange={() => setDeclineReason(reason)} 
                                                    className="accent-rose-500"
                                                />
                                                {reason}
                                            </label>
                                        ))}
                                    </div>

                                    {declineReason === "Custom reason..." && (
                                        <Textarea
                                            value={customDeclineReason}
                                            onChange={(e) => setCustomDeclineReason(e.target.value)}
                                            placeholder="Enter your custom reason here..."
                                            className="bg-slate-950/60 border-slate-800 placeholder:text-slate-700 text-xs focus-visible:ring-rose-500/50 rounded-xl h-20 resize-none mt-2"
                                            required
                                        />
                                    )}
                                </div>
                            )}

                            {/* Reschedule date and time pickers */}
                            {actionType === 'reschedule' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select New Trial Date</p>
                                        <div className="flex gap-2">
                                            {rescheduleDates.map((dateObj, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setRescheduleDateIdx(idx)}
                                                    className={`flex-1 py-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all duration-300 ${
                                                        rescheduleDateIdx === idx 
                                                        ? 'bg-purple-600 border-purple-500 text-white shadow-glow font-bold' 
                                                        : 'bg-black/20 border-white/5 text-slate-400 hover:border-purple-500/30'
                                                    }`}
                                                >
                                                    <span className="text-[9px] uppercase font-semibold">{dateObj.label}</span>
                                                    <span className="text-base font-black">{dateObj.date}</span>
                                                    <span className="text-[8px] uppercase">{dateObj.month}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Proposed Time Slot</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {rescheduleTimesList.map((timeStr) => (
                                                <button
                                                    key={timeStr}
                                                    type="button"
                                                    onClick={() => setRescheduleTime(timeStr)}
                                                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                                                        rescheduleTime === timeStr
                                                        ? 'bg-purple-600 border-purple-500 text-white font-bold'
                                                        : 'bg-black/20 border-white/5 text-slate-400 hover:border-purple-500/50'
                                                    }`}
                                                >
                                                    {timeStr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Response message text area */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Send custom note to member (Optional)
                                </label>
                                <Textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="e.g., Let's discuss your training goals and customize a complete workout strategy."
                                    className="bg-slate-950/60 border-slate-800 placeholder:text-slate-700 text-xs focus-visible:ring-blue-500/50 rounded-xl h-20 resize-none"
                                />
                            </div>

                            {/* Dialog Footer Actions */}
                            <DialogFooter className="pt-2 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsActionDialogOpen(false)}
                                    className="border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 flex-1 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmAction}
                                    className={`flex-1 rounded-xl font-bold uppercase tracking-wider text-white ${
                                        actionType === 'approve' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-md' :
                                        actionType === 'reject' ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 shadow-md' :
                                        'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-md'
                                    }`}
                                >
                                    {actionType === 'approve' && 'Confirm Approval'}
                                    {actionType === 'reject' && 'Confirm Decline'}
                                    {actionType === 'reschedule' && 'Propose Timing'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
