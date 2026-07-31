'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
    X, Loader2, Mail, Phone, Calendar, ShieldCheck, Users, 
    Clock, Activity, Award, CheckCircle2, AlertCircle, RefreshCw,
    Edit3, UserCheck, ArrowRight, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminTrainerProfile } from '@/app/api/admin/trainers/[trainerId]/route';

interface TrainerProfileDrawerProps {
    trainerId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSelectMember?: (memberId: string) => void;
}

export default function TrainerProfileDrawer({
    trainerId,
    isOpen,
    onClose,
    onSelectMember,
}: TrainerProfileDrawerProps) {
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<AdminTrainerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    // ─── ADMIN-ONLY ACCESS CHECK ───
    const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST');

    const fetchTrainerProfile = useCallback(async (id: string, silent = false) => {
        if (!silent) {
            setIsLoading(true);
            setError(null);
        }
        try {
            const response = await fetch(`/api/admin/trainers/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': user?.role || 'ADMIN',
                },
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to fetch trainer profile (Status ${response.status})`);
            }

            const resData = await response.json();
            setProfile(resData.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching trainer profile:', err);
            setError(err.message || 'Unable to connect to live trainer database.');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [user?.role]);

    // Fetch data when drawer opens or trainerId changes
    useEffect(() => {
        if (!isOpen || !trainerId || !isAdmin) {
            setProfile(null);
            return;
        }
        fetchTrainerProfile(trainerId);

        // Optional 15s polling to keep drawer live in real time
        const pollInterval = setInterval(() => {
            setIsPolling(true);
            fetchTrainerProfile(trainerId, true).finally(() => setIsPolling(false));
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [isOpen, trainerId, isAdmin, fetchTrainerProfile]);

    if (!isOpen) return null;

    return (
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
                        className="w-screen max-w-2xl bg-[#0f1218]/95 dark:bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden text-slate-200"
                    >
                        {/* 1. Unauthorized Notice if Not Admin */}
                        {!isAdmin ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-heading font-bold text-white">
                                    Admin Access Required
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Trainer management intelligence is strictly restricted to authenticated Administrators and Executive Staff.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-semibold"
                                >
                                    Close Drawer
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* 2. Drawer Header Bar */}
                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                                            Admin Executive Panel
                                        </span>
                                        {isPolling && (
                                            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                                                <RefreshCw className="w-3 h-3 animate-spin" /> Live Syncing
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* 3. Drawer Body */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary dark:text-gold-glow" />
                                            <p className="text-sm font-semibold text-muted-foreground">
                                                Fetching live trainer intelligence from database...
                                            </p>
                                        </div>
                                    ) : error ? (
                                        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
                                            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                                            <p className="text-sm font-bold text-rose-300">{error}</p>
                                            <button
                                                onClick={() => trainerId && fetchTrainerProfile(trainerId)}
                                                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 transition-colors text-xs font-semibold"
                                            >
                                                Retry Connection
                                            </button>
                                        </div>
                                    ) : profile ? (
                                        <>
                                            {/* A. Profile Header Section */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-xl font-extrabold text-white">
                                                        {profile.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h2 className="text-xl font-heading font-bold text-white">
                                                                {profile.name}
                                                            </h2>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                                                                profile.status === 'Active'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                    : profile.status === 'On Leave'
                                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                            }`}>
                                                                {profile.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 mt-0.5 font-medium">
                                                            {profile.role} · {profile.specialization}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.email}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* B. Key Stats Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                        Sessions
                                                    </span>
                                                    <p className="text-2xl font-heading font-bold text-white mt-1">
                                                        {profile.stats.totalSessions.toLocaleString()}
                                                    </p>
                                                    <span className="text-xs text-slate-400">Live Total</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                        Assigned Members
                                                    </span>
                                                    <p className="text-2xl font-heading font-bold text-white mt-1">
                                                        {profile.stats.totalAssignedMembers}
                                                    </p>
                                                    <span className="text-xs text-slate-400">Active Clients</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                        Attendance
                                                    </span>
                                                    <p className="text-2xl font-heading font-bold text-white mt-1">
                                                        {profile.stats.attendancePercentage}%
                                                    </p>
                                                    <span className="text-xs text-slate-400">30-Day Avg</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                        Join Date
                                                    </span>
                                                    <p className="text-lg font-heading font-bold text-white mt-1">
                                                        {profile.stats.joinDate}
                                                    </p>
                                                    <span className="text-xs text-slate-400">Staff Tenure</span>
                                                </div>
                                            </div>

                                            {/* C. Action Buttons Row */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-medium text-xs transition-colors">
                                                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs transition-colors">
                                                    <Users className="w-3.5 h-3.5" /> Reassign Members
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs transition-colors">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Attendance / Leave
                                                </button>
                                            </div>

                                            {/* D. Assigned Members List (Clickable) */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-primary" />
                                                        Assigned Members ({profile.assignedMembers.length})
                                                    </h3>
                                                </div>
                                                <div className="space-y-2">
                                                    {profile.assignedMembers.map((m) => (
                                                        <div
                                                            key={m.id}
                                                            onClick={() => onSelectMember?.(m.id)}
                                                            className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                    {m.avatar}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                                        {m.name}
                                                                    </p>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        Last Session: {m.lastSessionDate}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                                                                    {m.progress}
                                                                </span>
                                                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {profile.assignedMembers.length === 0 && (
                                                        <p className="text-xs text-muted-foreground py-4 text-center">
                                                            No active members currently assigned to this trainer.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* E. Upcoming Sessions List */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    Upcoming Sessions ({profile.upcomingSessions.length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {profile.upcomingSessions.map((s) => (
                                                        <div
                                                            key={s.id}
                                                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/10"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">
                                                                    {s.sessionType}
                                                                </p>
                                                                <p className="text-xs text-slate-300 font-medium">
                                                                    Member: {s.memberName}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-semibold text-white">{s.date}</p>
                                                                <p className="text-[11px] text-slate-400 font-mono">{s.time}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {profile.upcomingSessions.length === 0 && (
                                                        <p className="text-xs text-muted-foreground py-4 text-center">
                                                            No upcoming sessions scheduled.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* F. Recent Session History Timeline */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-primary" />
                                                    Recent Session History
                                                </h3>
                                                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10 pl-8">
                                                    {profile.recentSessionHistory.map((h) => (
                                                        <div
                                                            key={h.id}
                                                            className="relative p-3.5 rounded-2xl bg-white/[0.02] border border-white/10"
                                                        >
                                                            <div className="absolute -left-[27px] top-4 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-950" />
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-semibold text-white">{h.sessionType}</p>
                                                                <span className="text-xs font-mono text-slate-300 font-semibold">
                                                                    {h.duration}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <p className="text-xs text-slate-400">
                                                                    With <span className="text-white font-medium">{h.memberName}</span> · {h.date}
                                                                </p>
                                                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                                                                    <Star className="w-3 h-3 fill-amber-400" /> {h.rating}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {profile.recentSessionHistory.length === 0 && (
                                                        <p className="text-xs text-muted-foreground py-4 text-center">
                                                            No session history recorded yet.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>

                                {/* 4. Drawer Footer */}
                                <div className="p-4 border-t border-primary/15 bg-black/30 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Protected Admin Feature · Live DB Sync</span>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                    >
                                        Close Panel
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
}
