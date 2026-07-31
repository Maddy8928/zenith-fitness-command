'use client';

import React from 'react';
import { 
    X, Mail, Phone, Calendar, ShieldCheck, User, 
    Clock, Activity, Award, CheckCircle2, AlertCircle,
    Edit3, Dumbbell, Star, HeartPulse, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (!isOpen || !member) return null;

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
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-white/10 text-slate-200 border-white/15">
                                                {member.status}
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
            </div>
        </AnimatePresence>
    );
}
