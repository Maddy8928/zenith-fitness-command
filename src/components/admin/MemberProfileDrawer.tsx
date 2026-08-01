'use client';

import React, { useState, useMemo } from 'react';
import { 
    X, Mail, Phone, Calendar, ShieldCheck, User, 
    Clock, Activity, Award, CheckCircle2, AlertCircle,
    Edit3, Dumbbell, Star, HeartPulse, ArrowRight,
    Snowflake, PlayCircle, XCircle, Eye, Settings, AlertTriangle, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
    useMembershipFreeze, 
    calculateFreezeDays, 
    calculateNewExpiryDate, 
    FreezeReason 
} from '@/lib/membership-freeze-store';

export interface AdminMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
    status: string;
    lastVisit: string;
    joinDate: string;
    trainer?: string;
    progress?: string;
    streak?: string;
    rollNo?: number;
    expiryDate?: string;
}

interface MemberProfileDrawerProps {
    member: AdminMember | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function MemberProfileDrawer({
    member,
    isOpen,
    onClose,
}: MemberProfileDrawerProps) {
    const rollNo = useMemo(() => {
        if (!member) return 1;
        return member.rollNo || (member.id ? parseInt(member.id.replace(/\D/g, ''), 10) || 1 : 1);
    }, [member]);

    const { 
        activeFreeze, 
        policy, 
        updatePolicy, 
        createFreeze, 
        endEarly, 
        cancel, 
        refresh 
    } = useMembershipFreeze(rollNo);

    // Modal state controls
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEndEarlyModalOpen, setIsEndEarlyModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

    // Freeze Form inputs
    const defaultExpiry = member?.expiryDate ? member.expiryDate.split('T')[0] : '2026-12-31';
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });
    const [reason, setReason] = useState<FreezeReason>('Travel');
    const [internalNote, setInternalNote] = useState('');

    // End Early Form input
    const [earlyEndDate, setEarlyEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Policy Config inputs
    const [minDays, setMinDays] = useState(policy.minDurationDays);
    const [maxDays, setMaxDays] = useState(policy.maxDurationDays);
    const [maxPerYear, setMaxPerYear] = useState(policy.maxFreezesPerYear);
    const [isChargeable, setIsChargeable] = useState(policy.isChargeable);
    const [feeAmount, setFeeAmount] = useState(policy.feeAmount);

    // Calculations for preview
    const freezeDuration = useMemo(() => calculateFreezeDays(startDate, endDate), [startDate, endDate]);
    const newExpiryDate = useMemo(() => calculateNewExpiryDate(defaultExpiry, freezeDuration), [defaultExpiry, freezeDuration]);

    const earlyDuration = useMemo(() => {
        if (!activeFreeze) return 0;
        return calculateFreezeDays(activeFreeze.startDate, earlyEndDate);
    }, [activeFreeze, earlyEndDate]);

    const earlyNewExpiry = useMemo(() => {
        if (!activeFreeze) return defaultExpiry;
        return calculateNewExpiryDate(activeFreeze.oldExpiryDate, earlyDuration);
    }, [activeFreeze, earlyEndDate, defaultExpiry]);

    if (!isOpen || !member) return null;

    const handleConfirmFreeze = () => {
        const res = createFreeze({
            memberRollNo: rollNo,
            memberName: member.name,
            memberEmail: member.email,
            startDate,
            endDate,
            reason,
            internalNote,
            oldExpiryDate: defaultExpiry,
            createdBy: 'Front Desk Manager',
        });

        if (res.success && res.record) {
            toast.success(`Membership frozen for ${member.name}. Expiry extended by ${freezeDuration} days.`);
            setIsFreezeModalOpen(false);
            refresh();
            // Notify other components
            window.dispatchEvent(new CustomEvent('membership_freezes_updated'));
        } else {
            toast.error(res.error || 'Failed to freeze membership.');
        }
    };

    const handleConfirmEndEarly = () => {
        if (!activeFreeze) return;
        const res = endEarly(activeFreeze.id, earlyEndDate);
        if (res.success) {
            toast.success(`Freeze ended early. Expiry date adjusted to ${earlyNewExpiry}.`);
            setIsEndEarlyModalOpen(false);
            refresh();
        } else {
            toast.error(res.error || 'Failed to end freeze early.');
        }
    };

    const handleConfirmCancel = () => {
        if (!activeFreeze) return;
        const res = cancel(activeFreeze.id);
        if (res.success) {
            toast.success('Membership freeze cancelled. Original expiry date restored.');
            setIsCancelModalOpen(false);
            refresh();
        } else {
            toast.error(res.error || 'Failed to cancel freeze.');
        }
    };

    const handleSavePolicy = () => {
        updatePolicy({
            minDurationDays: minDays,
            maxDurationDays: maxDays,
            maxFreezesPerYear: maxPerYear,
            isChargeable,
            feeAmount,
        });
        toast.success('Membership freeze policy updated.');
        setIsPolicyModalOpen(false);
    };

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                    />

                    {/* Side Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="w-screen max-w-xl bg-[#0f1218]/95 dark:bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
                        >
                            {/* Drawer Header Bar */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                        Member Profile Console
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Profile Card Header */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-2xl font-heading font-bold text-white">
                                                    {member.name}
                                                </h2>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                                    member.status === 'Frozen' || activeFreeze
                                                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                                        : 'bg-white/10 text-slate-200 border-white/15'
                                                }`}>
                                                    {activeFreeze ? 'Frozen' : member.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono text-slate-400 mt-0.5">
                                                ID: {member.id} · Joined {member.joinDate}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {member.email}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {member.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                            Membership Plan
                                        </span>
                                        <p className="text-lg font-heading font-bold text-white mt-1">
                                            {member.plan}
                                        </p>
                                        <span className="text-xs text-slate-400 font-medium">Active Subscription</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                            Assigned Trainer
                                        </span>
                                        <p className="text-lg font-heading font-bold text-white mt-1">
                                            {member.trainer || 'Alex Johnson'}
                                        </p>
                                        <span className="text-xs text-slate-400">1-on-1 Coaching</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                            Last Visit
                                        </span>
                                        <p className="text-lg font-heading font-bold text-white mt-1">
                                            {member.lastVisit}
                                        </p>
                                        <span className="text-xs text-slate-400 font-medium">Checked In</span>
                                    </div>
                                </div>

                                {/* Membership Details & Freeze System Section */}
                                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                                Membership Details
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setMinDays(policy.minDurationDays);
                                                setMaxDays(policy.maxDurationDays);
                                                setMaxPerYear(policy.maxFreezesPerYear);
                                                setIsChargeable(policy.isChargeable);
                                                setFeeAmount(policy.feeAmount);
                                                setIsPolicyModalOpen(true);
                                            }}
                                            className="text-[11px] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
                                            title="Configure Gym Freeze Policy"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-cyan-400" />
                                            Freeze Policy
                                        </button>
                                    </div>

                                    {!activeFreeze ? (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-slate-300">Current Expiry:</span>
                                                    <span className="text-sm font-bold text-white">{defaultExpiry}</span>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Membership is currently active. You can temporarily freeze access if needed.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setStartDate(new Date().toISOString().split('T')[0]);
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + 30);
                                                    setEndDate(d.toISOString().split('T')[0]);
                                                    setIsFreezeModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all shadow-lg shadow-cyan-950/20 whitespace-nowrap"
                                            >
                                                <Snowflake className="w-4 h-4" />
                                                Freeze Membership
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                                                        Membership Frozen
                                                    </span>
                                                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                                                        ({activeFreeze.totalDays} Days)
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-300">
                                                    Resume Date: <strong className="text-white">{activeFreeze.endDate}</strong>
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-300 bg-black/40 p-3.5 rounded-xl border border-cyan-500/20 space-y-1.5">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Freeze Period:</span>
                                                    <span className="font-semibold text-white">{activeFreeze.startDate} — {activeFreeze.endDate}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Expiry Date Extended:</span>
                                                    <span className="font-semibold text-cyan-300">{activeFreeze.oldExpiryDate} → {activeFreeze.newExpiryDate}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Reason:</span>
                                                    <span className="font-semibold text-white">{activeFreeze.reason}</span>
                                                </div>
                                                {activeFreeze.internalNote && (
                                                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5 mt-1">
                                                        "{activeFreeze.internalNote}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <button
                                                    onClick={() => setIsViewModalOpen(true)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Freeze
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEarlyEndDate(new Date().toISOString().split('T')[0]);
                                                        setIsEndEarlyModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
                                                >
                                                    <PlayCircle className="w-3.5 h-3.5" /> End Freeze Early
                                                </button>
                                                <button
                                                    onClick={() => setIsCancelModalOpen(true)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" /> Cancel Freeze
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Membership Progress & Streak */}
                                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                                Fitness Progress
                                            </span>
                                        </div>
                                        <span className="text-xs font-mono font-semibold text-slate-300">
                                            {member.progress || '88% of Goal'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-slate-400 to-slate-200 h-2.5 rounded-full"
                                            style={{ width: '88%' }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-400">
                                        <span>Current Streak: <strong className="text-white">{member.streak || '12 Days'}</strong></span>
                                        <span>Target: <strong className="text-white">20 Sessions / mo</strong></span>
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-xs transition-colors">
                                        <Edit3 className="w-3.5 h-3.5" /> Edit Membership
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold text-xs transition-colors">
                                        <Dumbbell className="w-3.5 h-3.5" /> View Workout Plan
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold text-xs transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Log Check-In
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
                                <span>FlexGym Admin Member Intelligence</span>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    Close Panel
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Modal 1: Freeze Membership Modal */}
                    <Dialog open={isFreezeModalOpen} onOpenChange={setIsFreezeModalOpen}>
                        <DialogContent className="max-w-md bg-slate-950 border-cyan-500/20 text-slate-100 p-6 rounded-3xl shadow-2xl">
                            <DialogHeader className="pb-3 border-b border-slate-800">
                                <DialogTitle className="text-xl font-bold font-heading text-white flex items-center gap-2">
                                    <Snowflake className="w-5 h-5 text-cyan-400" /> Freeze Membership
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs">
                                    Temporarily suspend gym access while extending expiry date.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                {/* Member Summary */}
                                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Member:</span>
                                        <span className="font-bold text-white">{member.name} ({member.plan} Plan)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Current Expiry Date:</span>
                                        <span className="font-semibold text-slate-200">{defaultExpiry}</span>
                                    </div>
                                </div>

                                {/* Date Pickers */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Freeze Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Freeze End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                {/* Calculated Duration & Expiry Preview Banner */}
                                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-cyan-300 font-semibold">Freeze Duration:</span>
                                        <span className="text-sm font-bold text-white">{freezeDuration} Days</span>
                                    </div>
                                    <div className="h-px bg-cyan-500/20" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-cyan-300 font-semibold">New Expiry Date:</span>
                                        <span className="text-sm font-bold text-cyan-400">
                                            {defaultExpiry} → {newExpiryDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Policy Warning if out of range */}
                                {(freezeDuration < policy.minDurationDays || freezeDuration > policy.maxDurationDays) && (
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-amber-300 text-xs">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>
                                            Policy requires duration between {policy.minDurationDays} and {policy.maxDurationDays} days.
                                        </span>
                                    </div>
                                )}

                                {/* Reason Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Freeze Reason</label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value as FreezeReason)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                    >
                                        <option value="Medical">Medical Leave / Injury</option>
                                        <option value="Travel">Travel / Vacation</option>
                                        <option value="Personal">Personal / Family Reasons</option>
                                        <option value="Financial">Financial Hold</option>
                                        <option value="Other">Other Reason</option>
                                    </select>
                                </div>

                                {/* Internal Note */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Internal Note (Optional)</label>
                                    <textarea
                                        rows={2}
                                        value={internalNote}
                                        onChange={(e) => setInternalNote(e.target.value)}
                                        placeholder="Add notes for receptionists..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <button
                                    onClick={() => setIsFreezeModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmFreeze}
                                    disabled={freezeDuration < policy.minDurationDays || freezeDuration > policy.maxDurationDays}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all"
                                >
                                    Confirm Freeze
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modal 2: View Freeze Modal */}
                    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-slate-100 p-6 rounded-3xl shadow-2xl">
                            <DialogHeader className="pb-3 border-b border-slate-800">
                                <DialogTitle className="text-xl font-bold font-heading text-white flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-cyan-400" /> Active Membership Freeze
                                </DialogTitle>
                            </DialogHeader>
                            {activeFreeze && (
                                <div className="space-y-4 py-2 text-xs">
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Status:</span>
                                            <span className="font-bold text-cyan-400 uppercase">{activeFreeze.status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Freeze Start Date:</span>
                                            <span className="font-semibold text-white">{activeFreeze.startDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Freeze End Date:</span>
                                            <span className="font-semibold text-white">{activeFreeze.endDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Total Frozen Days:</span>
                                            <span className="font-bold text-cyan-300">{activeFreeze.totalDays} Days</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-1" />
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Previous Expiry:</span>
                                            <span className="font-semibold text-slate-300">{activeFreeze.oldExpiryDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">New Extended Expiry:</span>
                                            <span className="font-bold text-emerald-400">{activeFreeze.newExpiryDate}</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-1" />
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Reason:</span>
                                            <span className="font-semibold text-white">{activeFreeze.reason}</span>
                                        </div>
                                        {activeFreeze.internalNote && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Internal Note:</span>
                                                <span className="font-semibold text-slate-300">{activeFreeze.internalNote}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Created By:</span>
                                            <span className="font-semibold text-slate-400">{activeFreeze.createdBy}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modal 3: End Freeze Early Modal */}
                    <Dialog open={isEndEarlyModalOpen} onOpenChange={setIsEndEarlyModalOpen}>
                        <DialogContent className="max-w-md bg-slate-950 border-cyan-500/20 text-slate-100 p-6 rounded-3xl shadow-2xl">
                            <DialogHeader className="pb-3 border-b border-slate-800">
                                <DialogTitle className="text-xl font-bold font-heading text-white flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5 text-cyan-400" /> End Freeze Early
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs">
                                    Resume active membership today and recalculate extension days.
                                </DialogDescription>
                            </DialogHeader>

                            {activeFreeze && (
                                <div className="space-y-4 py-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Actual Resume Date</label>
                                        <input
                                            type="date"
                                            value={earlyEndDate}
                                            onChange={(e) => setEarlyEndDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>

                                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-cyan-300 font-semibold">Actual Frozen Days:</span>
                                            <span className="text-sm font-bold text-white">{earlyDuration} Days</span>
                                        </div>
                                        <div className="h-px bg-cyan-500/20" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-cyan-300 font-semibold">Recalculated Expiry:</span>
                                            <span className="text-sm font-bold text-cyan-400">
                                                {defaultExpiry} → {earlyNewExpiry}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <button
                                    onClick={() => setIsEndEarlyModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmEndEarly}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg transition-all"
                                >
                                    Confirm Early Resume
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modal 4: Cancel Freeze Modal */}
                    <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                        <DialogContent className="max-w-md bg-slate-950 border-rose-500/20 text-slate-100 p-6 rounded-3xl shadow-2xl">
                            <DialogHeader className="pb-3 border-b border-slate-800">
                                <DialogTitle className="text-xl font-bold font-heading text-white flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-rose-500" /> Cancel Membership Freeze
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs">
                                    Are you sure you want to cancel this freeze? The member's status will return to Active and original expiry date will be restored.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="pt-4">
                                <button
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-all"
                                >
                                    Yes, Cancel Freeze
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modal 5: Configure Freeze Policy Modal */}
                    <Dialog open={isPolicyModalOpen} onOpenChange={setIsPolicyModalOpen}>
                        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-slate-100 p-6 rounded-3xl shadow-2xl">
                            <DialogHeader className="pb-3 border-b border-slate-800">
                                <DialogTitle className="text-xl font-bold font-heading text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-cyan-400" /> Configure Freeze Policy
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs">
                                    Configure business rules and fees for membership freezes.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Minimum Duration (Days)</label>
                                        <input
                                            type="number"
                                            value={minDays}
                                            onChange={(e) => setMinDays(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Maximum Duration (Days)</label>
                                        <input
                                            type="number"
                                            value={maxDays}
                                            onChange={(e) => setMaxDays(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Max Freezes Permitted Per Year</label>
                                    <input
                                        type="number"
                                        value={maxPerYear}
                                        onChange={(e) => setMaxPerYear(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div>
                                        <p className="text-xs font-bold text-white">Chargeable Freeze Fee</p>
                                        <p className="text-[11px] text-slate-400">Require payment for freeze periods</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isChargeable}
                                        onChange={(e) => setIsChargeable(e.target.checked)}
                                        className="w-4 h-4 rounded text-cyan-500"
                                    />
                                </div>
                                {isChargeable && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Fee Amount (₹)</label>
                                        <div className="relative">
                                            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type="number"
                                                value={feeAmount}
                                                onChange={(e) => setFeeAmount(Number(e.target.value))}
                                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <button
                                    onClick={() => setIsPolicyModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePolicy}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg transition-all"
                                >
                                    Save Policy
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AnimatePresence>
        </>
    );
}
