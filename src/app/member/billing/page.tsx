'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Receipt, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Zap, ShieldCheck, Download, Users, XCircle, Dumbbell, Lock, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// --- MOCK DATA ---
const ACTIVE_PLAN = {
    name: 'Premium VIP',
    price: 7499,
    interval: 'monthly',
    nextBilling: 'Oct 15, 2026',
    status: 'Active',
    features: ['Unlimited Gym Access', '2 PT Sessions / Month', 'Locker Included', 'Spa & Sauna Access']
};

const PAYMENT_METHOD = {
    type: 'Visa',
    last4: '4242',
    expires: '12/28',
    isDefault: true
};

const TRAINER_NAMES: Record<string, string> = {
    'marcus-johnson': 'Marcus Johnson',
    'sarah-chen': 'Sarah Chen',
    'michael-rivers': 'Michael Rivers',
};

const INVOICES = [
    { id: 'INV-2026-009', date: 'Sep 15, 2026', amount: 7499, description: 'Premium VIP - Monthly', status: 'Paid' },
    { id: 'INV-2026-008', date: 'Aug 15, 2026', amount: 7499, description: 'Premium VIP - Monthly', status: 'Paid' },
    { id: 'INV-2026-007', date: 'Jul 20, 2026', amount: 3750, description: '1x Additional PT Session', status: 'Paid' },
    { id: 'INV-2026-006', date: 'Jul 15, 2026', amount: 7499, description: 'Premium VIP - Monthly', status: 'Paid' },
    { id: 'INV-2026-005', date: 'Jun 15, 2026', amount: 7499, description: 'Premium VIP - Monthly', status: 'Paid' },
];

export default function MemberBillingPage() {
    const { user: currentUser } = useAuth();
    const { addNotification } = useNotifications();

    const [subscription, setSubscription] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('zenith_member_subscription');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {}
            }
        }
        return ACTIVE_PLAN;
    });

    // Personal Training payment state
    const [ptStatus, setPtStatus] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('zenith_pt_status');
            if (saved) { try { return JSON.parse(saved); } catch (e) {} }
        }
        return {};
    });
    const [ptPayLoading, setPtPayLoading] = useState(false);

    // HYROX Arena membership states
    const [isHyroxActive, setIsHyroxActive] = useState(false);
    const [hyroxPayLoading, setHyroxPayLoading] = useState(false);

    // Invoices list state (persisted)
    const [savedInvoices, setSavedInvoices] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('zenith_member_invoices');
        if (saved) {
            try {
                setSavedInvoices(JSON.parse(saved));
            } catch (e) {
                setSavedInvoices(INVOICES);
            }
        } else {
            localStorage.setItem('zenith_member_invoices', JSON.stringify(INVOICES));
            setSavedInvoices(INVOICES);
        }
    }, []);

    // Derive approved trial dynamically from localStorage
    const approvedTrial = React.useMemo(() => {
        try {
            const trialsRaw = localStorage.getItem('zenith_trainer_trials');
            const trials = trialsRaw ? JSON.parse(trialsRaw) : {};
            const approvedTrialEntry = Object.entries(trials).find(([_, t]: [string, any]) => t.status === 'approved');
            if (approvedTrialEntry) {
                const [trainerId, trialData]: [string, any] = approvedTrialEntry;
                return {
                    trainerId,
                    trainerName: TRAINER_NAMES[trainerId] || trainerId,
                    date: trialData.date,
                    time: trialData.time
                };
            }
        } catch (e) {}
        return null;
    }, [ptStatus]);

    // Derive checklist properties
    const isTrialCompleted = ptStatus?.trialCompleted || !!approvedTrial || ptStatus?.paymentCompleted;
    const isTrainerSelected = ptStatus?.trainerSelected || !!approvedTrial || ptStatus?.paymentCompleted;

    // Scroll & Highlight on redirect
    const [highlighted, setHighlighted] = useState(false);
    const [hyroxHighlighted, setHyroxHighlighted] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payTrial') === 'true' || params.get('payPT') === 'true') {
            setTimeout(() => {
                const el = document.getElementById('billing-history-section');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    setHighlighted(true);
                    setTimeout(() => setHighlighted(false), 3000);
                }
            }, 300);
        } else if (params.get('pkg') === 'hyrox' || params.get('payHyrox') === 'true') {
            setTimeout(() => {
                const el = document.getElementById('hyrox-membership-section');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHyroxHighlighted(true);
                    setTimeout(() => setHyroxHighlighted(false), 3000);
                }
            }, 300);
        }
    }, []);

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferType, setTransferType] = useState<'existing' | 'new'>('existing');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [transferNotes, setTransferNotes] = useState('');

    const [transfers, setTransfers] = useState<any[]>([]);

    const loadTransfers = React.useCallback(() => {
        try {
            const saved = localStorage.getItem('zenith_membership_transfers');
            if (saved) {
                const parsed = JSON.parse(saved);
                const userTransfers = parsed.filter((t: any) => 
                    t.senderId === currentUser?.id || 
                    t.senderEmail === currentUser?.email ||
                    t.recipientEmail === currentUser?.email
                );
                setTransfers(userTransfers);
            } else {
                setTransfers([]);
            }
        } catch (e) {
            setTransfers([]);
        }
    }, [currentUser]);

    useEffect(() => {
        const loadSubscription = () => {
            const saved = localStorage.getItem('zenith_member_subscription');
            if (saved) {
                try {
                    setSubscription(JSON.parse(saved));
                } catch (e) {}
            } else {
                setSubscription(ACTIVE_PLAN);
            }
        };

        const loadPTStatus = () => {
            const saved = localStorage.getItem('zenith_pt_status');
            if (saved) { try { setPtStatus(JSON.parse(saved)); } catch (e) {} }
        };

        const loadHyroxStatus = () => {
            const status = localStorage.getItem('zenith_hyrox_membership');
            setIsHyroxActive(status === 'active');
        };

        loadSubscription();
        loadTransfers();
        loadPTStatus();
        loadHyroxStatus();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'zenith_member_subscription' || e.key === 'zenith_membership_transfers') {
                loadSubscription();
                loadTransfers();
            }
            if (e.key === 'zenith_pt_status') {
                loadPTStatus();
            }
            if (e.key === 'zenith_hyrox_membership') {
                loadHyroxStatus();
            }
        };

        const handleFocus = () => {
            loadSubscription();
            loadTransfers();
            loadPTStatus();
            loadHyroxStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [loadTransfers]);

    // HYROX Payment handlers
    const handleHyroxPayment = async () => {
        setHyroxPayLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));

        localStorage.setItem('zenith_hyrox_membership', 'active');
        setIsHyroxActive(true);
        window.dispatchEvent(new Event('storage'));

        // Save Paid Invoice permanently in billing history
        try {
            const newPaidInvoice = {
                id: `INV-2026-HX${Date.now().toString().slice(-3)}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                amount: 2499,
                description: 'HYROX Arena Membership (1 Month)',
                status: 'Paid'
            };
            const savedInvoicesList = localStorage.getItem('zenith_member_invoices');
            const currentInvoices = savedInvoicesList ? JSON.parse(savedInvoicesList) : INVOICES;
            const updatedInvoices = [newPaidInvoice, ...currentInvoices];
            localStorage.setItem('zenith_member_invoices', JSON.stringify(updatedInvoices));
            setSavedInvoices(updatedInvoices);
        } catch (e) {}

        // Send notifications
        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '🏆 HYROX Arena Membership Activated',
            message: 'Your HYROX membership is active! You now have full access to training programs, simulation races, and personal records tracking in the HYROX Hub.',
        });

        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'medium',
            title: '🏆 HYROX Membership Subscribed',
            message: `${currentUser?.name || 'Alex'} has successfully subscribed to the HYROX Arena Membership.`,
        });

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '🏆 HYROX Membership Subscribed',
            message: `${currentUser?.name || 'Alex'} has subscribed to the HYROX Arena Membership (₹2,499/month).`,
        });

        toast.success('HYROX Arena Membership Activated!', {
            description: 'Access to the HYROX Training Hub is now fully unlocked.',
        });
        setHyroxPayLoading(false);
    };

    const handleHyroxCancel = () => {
        localStorage.removeItem('zenith_hyrox_membership');
        setIsHyroxActive(false);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '🚫 HYROX Arena Membership Cancelled',
            message: 'Your HYROX Arena Membership has been cancelled. Access to the HYROX Hub is now locked.',
        });

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '🚫 HYROX Membership Cancelled',
            message: `${currentUser?.name || 'Alex'} has cancelled their HYROX Arena Membership.`,
        });

        toast.info('HYROX Arena Membership cancelled successfully.');
    };

    // PT Payment handler
    const handlePTPayment = async () => {
        setPtPayLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));

        const preferred = localStorage.getItem('zenith_preferred_trainer_id');
        const trainerName = preferred ? (
            preferred === 'marcus-johnson' ? 'Marcus Johnson' :
            preferred === 'sarah-chen' ? 'Sarah Chen' :
            'Michael Rivers'
        ) : null;

        const updated = {
            ...ptStatus,
            paymentCompleted: true,
            paymentDate: new Date().toISOString(),
            assignedTrainerId: preferred || null,
            assignedTrainerName: trainerName,
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updated));
        setPtStatus(updated);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '💳 PT Payment Received',
            message: `${currentUser?.name || 'Alex'} has successfully paid for Personal Training. Please approve their trainer assignment to unlock their workout section.`,
            metadata: { memberEmail: currentUser?.email, trainerId: preferred }
        });

        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '✅ Personal Training Payment Confirmed',
            message: `Your Personal Training package has been activated! Your trainer will approve your assignment shortly to unlock your personalized workout section.`,
        });

        toast.success('Personal Training Payment Successful!', {
            description: 'Awaiting trainer assignment approval to unlock your workout section.',
        });
        setPtPayLoading(false);
    };

    const handlePTPaymentWithTrainer = async (trainerId: string, trainerName: string) => {
        setPtPayLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));

        const today = new Date();
        const expiry = new Date();
        expiry.setDate(today.getDate() + 30);

        // 1. Update ptStatus in localStorage
        const updated = {
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
            assignedTrainerId: trainerId,
            assignedTrainerName: trainerName,
        };
        localStorage.setItem('zenith_pt_status', JSON.stringify(updated));
        setPtStatus(updated);

        // 2. Transition the trainer trial status in localStorage `zenith_trainer_trials` to 'completed'
        try {
            const savedTrials = localStorage.getItem('zenith_trainer_trials');
            if (savedTrials) {
                const trials = JSON.parse(savedTrials);
                if (trials[trainerId]) {
                    trials[trainerId].status = 'completed';
                    localStorage.setItem('zenith_trainer_trials', JSON.stringify(trials));
                }
            }
        } catch (e) {}

        // 3. Add to Audit Trail as 'Completed'
        try {
            const savedAudit = localStorage.getItem('zenith_trial_audit_trail');
            const logs = savedAudit ? JSON.parse(savedAudit) : [];
            const newLog = {
                id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                requestId: `local_${trainerId}`,
                action: 'Completed',
                memberName: currentUser?.name || 'Alex',
                membershipId: 'NX-2026-9041',
                trainerName: trainerName,
                timestamp: new Date().toISOString(),
                details: `Personal Training Payment Successful. Personal Training package activated, trainer assigned, workouts unlocked.`
            };
            localStorage.setItem('zenith_trial_audit_trail', JSON.stringify([newLog, ...logs]));
        } catch (e) {}

        // 4. Save Paid Invoice permanently in billing history
        try {
            const newPaidInvoice = {
                id: `INV-2026-PT${Date.now().toString().slice(-3)}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                amount: 9999,
                description: `Personal Training - ${trainerName} (1 Month)`,
                status: 'Paid'
            };
            const savedInvoicesList = localStorage.getItem('zenith_member_invoices');
            const currentInvoices = savedInvoicesList ? JSON.parse(savedInvoicesList) : INVOICES;
            const updatedInvoices = [newPaidInvoice, ...currentInvoices];
            localStorage.setItem('zenith_member_invoices', JSON.stringify(updatedInvoices));
            setSavedInvoices(updatedInvoices);
        } catch (e) {}

        // 5. Send notifications
        // Member
        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '✅ Personal Training Package Activated',
            message: `Your payment was successful! Personal Training has been activated, and ${trainerName} has been assigned as your coach. Your My Workouts section is now unlocked.`,
        });

        // Trainer
        addNotification({
            role: 'trainer',
            category: 'MEMBER',
            priority: 'high',
            title: '💳 New PT Client Assigned',
            message: `${currentUser?.name || 'Alex'} has paid for Personal Training. You have been assigned as their trainer and can now build workout and diet plans for them.`,
            metadata: { memberEmail: currentUser?.email, trainerId: trainerId }
        });

        // Receptionist
        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '💳 PT Subscription Activated',
            message: `${currentUser?.name || 'Alex'} has successfully activated a Personal Training subscription with ${trainerName}.`,
        });

        window.dispatchEvent(new Event('storage'));
        toast.success('Personal Training Activated!', {
            description: `Payment confirmed. Workouts section unlocked, and ${trainerName} is assigned.`,
        });
        setPtPayLoading(false);
    };


    const handleTransferSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transferType === 'existing' && !recipientEmail) {
            toast.error("Please enter the recipient's email address.");
            return;
        }
        if (transferType === 'new' && (!recipientName || !recipientEmail || !recipientPhone)) {
            toast.error("Please fill in all recipient details.");
            return;
        }

        const transferId = `trsf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newRequest = {
            id: transferId,
            senderId: currentUser?.id || '3',
            senderName: currentUser?.name || 'Jane Smith',
            senderEmail: currentUser?.email || 'member@nexusgym.com',
            recipientType: transferType,
            recipientEmail,
            recipientName: transferType === 'new' ? recipientName : undefined,
            recipientPhone: transferType === 'new' ? recipientPhone : undefined,
            planName: subscription.name,
            nextBilling: subscription.nextBilling,
            status: 'pending' as const,
            requestedAt: new Date().toISOString(),
            notes: transferNotes
        };

        let currentTransfers = [];
        try {
            const savedTransfers = localStorage.getItem('zenith_membership_transfers');
            if (savedTransfers) {
                currentTransfers = JSON.parse(savedTransfers);
            }
        } catch (err) {}

        localStorage.setItem('zenith_membership_transfers', JSON.stringify([newRequest, ...currentTransfers]));

        const updatedSubscription = {
            ...subscription,
            status: 'Transfer Pending'
        };
        setSubscription(updatedSubscription);
        localStorage.setItem('zenith_member_subscription', JSON.stringify(updatedSubscription));

        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '🔄 Membership Transfer Request',
            message: `${currentUser?.name || 'Jane Smith'} has requested to transfer their ${subscription.name} membership to ${recipientEmail}.`,
            metadata: { transferId }
        });

        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'low',
            title: '🔄 Transfer Request Submitted',
            message: `Your request to transfer your ${subscription.name} membership is pending front desk approval.`,
        });

        toast.success("Membership transfer request submitted!", {
            description: "A receptionist will verify and process your request shortly."
        });

        setIsTransferModalOpen(false);
        setRecipientEmail('');
        setRecipientName('');
        setRecipientPhone('');
        setTransferNotes('');
        loadTransfers();
    };

    const handleCancelTransfer = (transferId: string) => {
        let allTransfers = [];
        try {
            const savedTransfers = localStorage.getItem('zenith_membership_transfers');
            if (savedTransfers) {
                allTransfers = JSON.parse(savedTransfers);
            }
        } catch (err) {}

        const transferToCancel = allTransfers.find((t: any) => t.id === transferId);
        if (!transferToCancel) {
            toast.error("Transfer request not found.");
            return;
        }

        if (transferToCancel.status !== 'pending') {
            toast.error("Only pending transfers can be cancelled.");
            return;
        }

        const updatedTransfers = allTransfers.map((t: any) => 
            t.id === transferId 
                ? { ...t, status: 'cancelled' as const, cancelledAt: new Date().toISOString() } 
                : t
        );
        localStorage.setItem('zenith_membership_transfers', JSON.stringify(updatedTransfers));

        const restoredSubscription = {
            ...subscription,
            status: 'Active'
        };
        setSubscription(restoredSubscription);
        localStorage.setItem('zenith_member_subscription', JSON.stringify(restoredSubscription));

        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'medium',
            title: '🚫 Membership Transfer Cancelled',
            message: `${currentUser?.name || 'Jane Smith'} has cancelled their request to transfer their ${transferToCancel.planName} membership.`,
            metadata: { transferId }
        });

        addNotification({
            role: 'member',
            userId: currentUser?.id || '3',
            category: 'MEMBERSHIP',
            priority: 'low',
            title: '🚫 Transfer Request Cancelled',
            message: `Your request to transfer your ${transferToCancel.planName} membership was successfully cancelled.`,
        });

        toast.success("Membership transfer request cancelled successfully!");
        loadTransfers();
    };

    const displayedInvoices = React.useMemo(() => {
        const list = [...savedInvoices];
        
        // If we have an approved trial and payment is not completed, prepend the pending invoice
        if (approvedTrial && !ptStatus?.paymentCompleted) {
            const hasPending = list.some(inv => inv.id === 'INV-2026-PT01');
            if (!hasPending) {
                list.unshift({
                    id: 'INV-2026-PT01',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    amount: 9999,
                    description: `Personal Training - ${approvedTrial.trainerName} (1 Month)`,
                    status: 'Pending',
                    isPT: true,
                    trainerId: approvedTrial.trainerId,
                    trainerName: approvedTrial.trainerName
                });
            }
        } else if (ptStatus?.status === 'approved' && !ptStatus?.paymentCompleted) {
            const hasPending = list.some(inv => inv.id === 'INV-2026-PT01');
            if (!hasPending) {
                list.unshift({
                    id: 'INV-2026-PT01',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    amount: 9999,
                    description: `Personal Training - ${ptStatus.requestedTrainerName || 'Trainer'} (1 Month)`,
                    status: 'Pending',
                    isPT: true,
                    trainerId: ptStatus.requestedTrainerId,
                    trainerName: ptStatus.requestedTrainerName || 'Trainer'
                });
            }
        }
        
        return list;
    }, [savedInvoices, approvedTrial, ptStatus]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-violet-900/40 via-fuchsia-900/40 to-slate-900/40 p-6 md:p-8 rounded-3xl border border-violet-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit">
                        <CreditCard className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold text-violet-400 tracking-wider uppercase">Financials</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight">
                        Billing & Subscription
                    </h1>
                    <p className="text-slate-400 max-w-xl text-lg">
                        Manage your active memberships, securely update your payment methods, and view historical invoices.
                    </p>
                </div>

                <div className="relative z-10">
                    <Button className="bg-slate-900/50 hover:bg-slate-800 text-white border border-slate-700 rounded-xl h-12 px-6 transition-all shadow-none">
                        <Download className="w-4 h-4 mr-2" />
                        Download Tax Summary
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Current Plan Overview */}
                <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border-slate-800/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,_hsl(var(--primary)/0.15),_transparent_70%)] rounded-full blur-2xl pointer-events-none" />

                    <CardHeader className="pb-4 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl text-white flex items-center gap-2 mb-1">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Active Subscription
                                </CardTitle>
                                <CardDescription className="text-slate-400">Your current membership details and benefits.</CardDescription>
                            </div>
                            <Badge variant="outline" className={`${
                                subscription.status === 'Active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : subscription.status === 'Transfer Pending'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            }`}>
                                {subscription.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                                {subscription.status === 'Transfer Pending' && <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" />}
                                {subscription.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-6">
                        {subscription.status === 'Transferred' ? (
                            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center py-10 space-y-3">
                                <Users className="w-12 h-12 text-primary animate-pulse" />
                                <h3 className="text-2xl font-black text-white uppercase italic">Membership Transferred</h3>
                                <p className="text-slate-400 max-w-md text-sm">
                                    Your Premium VIP membership has been successfully transferred to another person. You no longer have active membership benefits.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
                                {/* Plan Name & Price */}
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">{subscription.name}</h3>
                                    <div className="flex items-end justify-center md:justify-start gap-1">
                                        <span className="text-4xl font-bold text-white">₹{subscription.price.toLocaleString()}</span>
                                        <span className="text-slate-500 mb-1">/{subscription.interval}</span>
                                    </div>
                                </div>

                                {/* Divider (Desktop) */}
                                <div className="hidden md:block w-px h-20 bg-slate-800" />

                                {/* Divider (Mobile) */}
                                <div className="block md:hidden w-full h-px bg-slate-800" />

                                {/* Billing Cycle Info */}
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Next Billing Date</span>
                                        <span className="font-semibold text-white">{subscription.nextBilling}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Included Benefits</span>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                                            {subscription.features.map((feature: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="relative z-10 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between">
                        {subscription.status === 'Transferred' ? (
                            <Button disabled className="w-full bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed">
                                Subscription Inactive
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    disabled={subscription.status === 'Transfer Pending'}
                                    variant="outline" 
                                    className="w-full sm:w-auto border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 bg-transparent"
                                >
                                    Cancel Subscription
                                </Button>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button 
                                                variant="outline"
                                                disabled={subscription.status === 'Transfer Pending'}
                                                className="w-full sm:w-auto border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 bg-transparent font-semibold"
                                            >
                                                Transfer Subscription
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-white rounded-2xl p-6">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black font-heading uppercase tracking-tighter flex items-center gap-2">
                                                    <Users className="w-6 h-6 text-primary" /> Transfer Membership
                                                </DialogTitle>
                                                <DialogDescription className="text-slate-400 text-xs font-medium mt-1">
                                                    Transfer your active {subscription.name} subscription to another person. A receptionist will verify and approve the transfer request.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleTransferSubmit} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Transfer Recipient</label>
                                                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-white/5">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setTransferType('existing')}
                                                            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
                                                                transferType === 'existing' 
                                                                ? 'bg-primary text-black shadow-glow' 
                                                                : 'text-slate-400 hover:text-white'
                                                            }`}
                                                        >
                                                            Existing Member
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setTransferType('new')}
                                                            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
                                                                transferType === 'new' 
                                                                ? 'bg-primary text-black shadow-glow' 
                                                                : 'text-slate-400 hover:text-white'
                                                            }`}
                                                        >
                                                            New Person
                                                        </button>
                                                    </div>
                                                </div>

                                                {transferType === 'existing' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Recipient Email</label>
                                                        <Input 
                                                            type="email"
                                                            required
                                                            placeholder="recipient@example.com"
                                                            value={recipientEmail}
                                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 rounded-xl"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Full Name</label>
                                                            <Input 
                                                                required
                                                                placeholder="John Doe"
                                                                value={recipientName}
                                                                onChange={(e) => setRecipientName(e.target.value)}
                                                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 rounded-xl"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Email Address</label>
                                                            <Input 
                                                                type="email"
                                                                required
                                                                placeholder="john@example.com"
                                                                value={recipientEmail}
                                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 rounded-xl"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Phone Number</label>
                                                            <Input 
                                                                type="tel"
                                                                required
                                                                placeholder="(555) 000-0000"
                                                                value={recipientPhone}
                                                                onChange={(e) => setRecipientPhone(e.target.value)}
                                                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Reason / Notes (Optional)</label>
                                                    <Textarea 
                                                        placeholder="Add any additional context..."
                                                        value={transferNotes}
                                                        onChange={(e) => setTransferNotes(e.target.value)}
                                                        className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 rounded-xl min-h-[80px]"
                                                    />
                                                </div>

                                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-[10px] text-primary uppercase font-bold tracking-wider text-center">
                                                    All transfers are subject to receptionist approval. Sender benefits cease immediately upon approval.
                                                </div>

                                                <DialogFooter className="flex gap-3 pt-2">
                                                    <DialogClose asChild>
                                                        <Button 
                                                            type="button"
                                                            variant="outline" 
                                                            className="border-white/10 text-white hover:!text-white hover:!bg-white/5 rounded-xl flex-1"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                    <Button 
                                                        type="submit"
                                                        className="bg-gradient-to-r from-primary to-accent hover:brightness-110 text-primary-foreground font-bold uppercase text-xs tracking-wider flex-1 rounded-xl"
                                                    >
                                                        Submit Request
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Button 
                                        disabled={subscription.status === 'Transfer Pending'}
                                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/20"
                                    >
                                        Upgrade Plan <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardFooter>
                </Card>

                {/* Payment Method */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 flex flex-col h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                            Payment Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700/50 relative overflow-hidden flex-1 flex flex-col justify-between shadow-inner">
                            {/* Card Chip decoration */}
                            <div className="w-10 h-7 rounded bg-amber-200/20 border border-amber-200/10 mb-6 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-px bg-amber-200/30" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-white font-mono text-xl tracking-widest flex items-center gap-2">
                                        <span className="text-slate-500">••••</span>
                                        <span className="text-slate-500">••••</span>
                                        <span className="text-slate-500">••••</span>
                                        <span>{PAYMENT_METHOD.last4}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Expires</p>
                                        <p className="text-sm font-semibold text-white">{PAYMENT_METHOD.expires}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black italic text-white">{PAYMENT_METHOD.type}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
                            <p>This is your default payment method for all gym services and store purchases.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900">
                            Update Payment Method
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Special Programs & Add-ons */}
            <div id="hyrox-membership-section" className={`transition-all duration-1000 ${
                hyroxHighlighted ? 'ring-2 ring-primary dark:ring-gold-glow shadow-[0_0_30px_rgba(212,175,55,0.2)] scale-[1.01] rounded-3xl' : ''
            }`}>
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,_hsl(var(--gold)/0.1),_transparent_70%)] rounded-full blur-2xl pointer-events-none" />

                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl text-white flex items-center gap-2 mb-1">
                                    <Star className="w-5 h-5 text-primary" /> Specialized Program Subscriptions
                                </CardTitle>
                                <CardDescription className="text-slate-400">Unlock specialized elite training zones and challenges.</CardDescription>
                            </div>
                            {isHyroxActive && (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Active Add-on
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
                            {/* Program Details */}
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">HYROX Arena Membership</h3>
                                <p className="text-xs text-slate-400 max-w-md">
                                    Get specialized functional strength conditioning programs, log run and sled push velocity metrics, and sign up for official local simulated turf races.
                                </p>
                                <div className="flex items-end justify-center md:justify-start gap-1 pt-2">
                                    <span className="text-3xl font-bold text-white">₹2,499</span>
                                    <span className="text-slate-500 mb-1">/monthly add-on</span>
                                </div>
                            </div>

                            {/* Divider (Desktop) */}
                            <div className="hidden md:block w-px h-24 bg-slate-800" />

                            {/* Divider (Mobile) */}
                            <div className="block md:hidden w-full h-px bg-slate-800" />

                            {/* Included Benefits */}
                            <div className="flex-1 space-y-3 w-full">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hub Access Includes</span>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                                    {[
                                        'Elite Program Templates',
                                        'PFT Benchmark Logs',
                                        'Sled/SkiErg Tracking Charts',
                                        'Free Entry to Sim Events',
                                        'Leaderboard Submission',
                                        'Certified Coach Feedback'
                                    ].map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="text-xs text-slate-500">
                            {isHyroxActive ? (
                                <span>Subscribed via card ending in {PAYMENT_METHOD.last4}. Renews monthly.</span>
                            ) : (
                                <span>Charged to your default payment card. Renews automatically unless cancelled.</span>
                            )}
                        </div>
                        <div className="w-full sm:w-auto">
                            {isHyroxActive ? (
                                <Button 
                                    onClick={handleHyroxCancel}
                                    variant="outline"
                                    className="w-full sm:w-auto border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-350 bg-transparent font-semibold rounded-xl"
                                >
                                    Cancel Add-on
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleHyroxPayment}
                                    disabled={hyroxPayLoading}
                                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl px-6 h-11"
                                >
                                    {hyroxPayLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Authorizing Payment...
                                        </>
                                    ) : (
                                        <>
                                            Activate & Pay Now <ArrowUpRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Membership Transfers Section */}
            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        Membership Transfers
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        View status updates and cancel pending membership transfer requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transfers.length === 0 ? (
                        <div className="bg-slate-950/20 rounded-xl border border-slate-800/60 p-8 text-center text-slate-500">
                            No membership transfer activity recorded.
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-800/60 overflow-hidden bg-slate-950/20">
                            <Table>
                                <TableHeader className="bg-slate-900/50 hover:bg-slate-900/50">
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400">Transfer ID</TableHead>
                                        <TableHead className="text-slate-400">Recipient</TableHead>
                                        <TableHead className="text-slate-400">Plan</TableHead>
                                        <TableHead className="text-slate-400">Requested</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-slate-400">Details</TableHead>
                                        <TableHead className="text-slate-400 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.map((transfer) => (
                                        <TableRow key={transfer.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <TableCell className="font-mono text-xs text-slate-300 font-bold">
                                                #{transfer.id ? transfer.id.replace('trsf_', '').substring(0, 8) : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-slate-200">
                                                {transfer.recipientType === 'existing' ? (
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] uppercase font-bold tracking-wider">
                                                            Existing Member
                                                        </Badge>
                                                        <span className="text-sm font-semibold">{transfer.recipientEmail}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">
                                                                New Person
                                                            </Badge>
                                                            <span className="text-sm font-semibold text-white">{transfer.recipientName}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{transfer.recipientEmail}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-white font-medium">
                                                {transfer.planName}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {transfer.requestedAt ? new Date(transfer.requestedAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${
                                                    transfer.status === 'approved'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                                                        : transfer.status === 'rejected'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
                                                        : transfer.status === 'cancelled'
                                                        ? 'bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10 animate-pulse'
                                                } font-bold uppercase tracking-wider text-[10px]`}>
                                                    {transfer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[220px] text-xs text-slate-400">
                                                {transfer.status === 'rejected' && transfer.rejectionReason && (
                                                    <div className="text-rose-450 leading-tight">
                                                        <span className="font-bold uppercase tracking-wider text-[10px] text-rose-400 block mb-0.5">Reason</span>
                                                        {transfer.rejectionReason}
                                                    </div>
                                                )}
                                                {transfer.status === 'cancelled' && transfer.cancelledAt && (
                                                    <span className="text-slate-500 block">
                                                        Cancelled on {new Date(transfer.cancelledAt).toLocaleString()}
                                                    </span>
                                                )}
                                                {transfer.status === 'approved' && transfer.processedAt && (
                                                    <div className="text-emerald-450 leading-tight">
                                                        <span className="font-bold text-emerald-400">Approved by {transfer.processedBy}</span>
                                                        <span className="text-slate-500 block text-[10px]">{new Date(transfer.processedAt).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {transfer.status === 'pending' && (
                                                    <span className="text-amber-400/80 animate-pulse flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" /> Awaiting review
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {transfer.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleCancelTransfer(transfer.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-400 hover:text-rose-350 hover:bg-rose-950/30 border border-rose-500/25 rounded-xl transition-all"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1.5" />
                                                        Cancel Request
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>


            {/* Invoices & History Table */}

            <Card id="billing-history-section" className={`bg-slate-900/40 backdrop-blur-xl border-slate-800/60 transition-all duration-1000 ${
                highlighted ? 'ring-2 ring-primary dark:ring-gold-glow shadow-[0_0_30px_rgba(212,175,55,0.2)] scale-[1.01]' : ''
            }`}>
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-slate-400" />
                        Billing History
                    </CardTitle>
                    <CardDescription className="text-slate-400">View and download past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-slate-800/60 overflow-hidden bg-slate-950/20">
                        <Table>
                            <TableHeader className="bg-slate-900/50 hover:bg-slate-900/50">
                                <TableRow className="border-slate-800">
                                    <TableHead className="text-slate-400 w-[140px]">Date</TableHead>
                                    <TableHead className="text-slate-400">Description</TableHead>
                                    <TableHead className="text-slate-400 w-[120px]">Status</TableHead>
                                    <TableHead className="text-slate-400 text-right">Amount</TableHead>
                                    <TableHead className="text-slate-400 text-right w-[100px]">Invoice</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedInvoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <TableCell className="font-medium text-slate-300">
                                            {invoice.date}
                                        </TableCell>
                                        <TableCell className="text-slate-100">
                                            {invoice.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="outline" 
                                                className={
                                                    invoice.status === 'Paid'
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10 animate-pulse font-bold"
                                                }
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-white font-semibold">
                                            ₹{invoice.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {invoice.status === 'Pending' ? (
                                                <Button
                                                    onClick={() => handlePTPaymentWithTrainer(invoice.trainerId, invoice.trainerName)}
                                                    disabled={ptPayLoading}
                                                    size="sm"
                                                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold text-xs px-3 h-8 rounded-lg shadow-glow"
                                                >
                                                    {ptPayLoading ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        'Pay Now'
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30">
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Download invoice</span>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
