'use client';

import React, { useState } from 'react';
import { 
    UserPlus, UserCheck, IndianRupee, RefreshCw, Zap, AlertCircle, 
    Activity, Clock, Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ActivityType = 
    | 'New Member Registered'
    | 'Member Checked In'
    | 'Membership Renewed'
    | 'Payment Received'
    | 'Membership Expired'
    | 'Personal Training Activated';

export interface GymActivityItem {
    id: string;
    type: ActivityType;
    memberName: string;
    timestamp: string;
    status: string;
    detail?: string;
    category: 'Registration' | 'Check-in' | 'Payment' | 'Renewal' | 'Alert';
}

const recentActivities: GymActivityItem[] = [
    {
        id: 'ACT-101',
        type: 'New Member Registered',
        memberName: 'Vikram Patel',
        timestamp: 'Today, 11:42 AM',
        status: 'Registered',
        detail: 'Annual Elite Plan',
        category: 'Registration',
    },
    {
        id: 'ACT-102',
        type: 'Member Checked In',
        memberName: 'Marcus Vance',
        timestamp: 'Today, 11:38 AM',
        status: 'Checked In',
        detail: 'Main Gym Floor',
        category: 'Check-in',
    },
    {
        id: 'ACT-103',
        type: 'Payment Received',
        memberName: 'Priya Sharma',
        timestamp: 'Today, 11:15 AM',
        status: 'Paid · ₹14,999',
        detail: 'Pro Monthly Membership',
        category: 'Payment',
    },
    {
        id: 'ACT-104',
        type: 'Membership Renewed',
        memberName: 'David Kim',
        timestamp: 'Today, 10:50 AM',
        status: 'Renewed',
        detail: '1-Year Extension',
        category: 'Renewal',
    },
    {
        id: 'ACT-105',
        type: 'Personal Training Activated',
        memberName: 'Elena Rostova',
        timestamp: 'Today, 10:20 AM',
        status: 'PT Activated',
        detail: '24-Session Transformation Pack',
        category: 'Registration',
    },
    {
        id: 'ACT-106',
        type: 'Member Checked In',
        memberName: 'Aarav Mehta',
        timestamp: 'Today, 09:45 AM',
        status: 'Checked In',
        detail: 'Cardio Zone',
        category: 'Check-in',
    },
    {
        id: 'ACT-107',
        type: 'Membership Expired',
        memberName: 'Robert Taylor',
        timestamp: 'Today, 08:30 AM',
        status: 'Expired',
        detail: 'Starter Monthly Plan',
        category: 'Alert',
    },
    {
        id: 'ACT-108',
        type: 'New Member Registered',
        memberName: 'Sanya Malhotra',
        timestamp: 'Yesterday, 07:45 PM',
        status: 'Registered',
        detail: '6-Month Pro Plan',
        category: 'Registration',
    },
];

export default function RecentActivity() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const filterCategories = [
        { label: 'All', value: 'All' },
        { label: 'Registrations', value: 'Registration' },
        { label: 'Payments', value: 'Payment' },
        { label: 'Check-ins', value: 'Check-in' },
        { label: 'Renewals', value: 'Renewal' },
        { label: 'Alerts', value: 'Alert' },
    ];

    const filteredActivities = selectedCategory === 'All'
        ? recentActivities
        : recentActivities.filter(item => item.category === selectedCategory);

    const getActivityConfig = (type: ActivityType) => {
        switch (type) {
            case 'New Member Registered':
                return {
                    icon: UserPlus,
                    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    statusBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                };
            case 'Member Checked In':
                return {
                    icon: UserCheck,
                    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    statusBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                };
            case 'Payment Received':
                return {
                    icon: IndianRupee,
                    iconBg: 'bg-green-500/10 text-green-400 border-green-500/20',
                    statusBadge: 'bg-green-500/10 text-green-400 border-green-500/20',
                };
            case 'Membership Renewed':
                return {
                    icon: RefreshCw,
                    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                    statusBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                };
            case 'Personal Training Activated':
                return {
                    icon: Zap,
                    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    statusBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                };
            case 'Membership Expired':
                return {
                    icon: AlertCircle,
                    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                    statusBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                };
        }
    };

    return (
        <div className="glass-card rounded-3xl border border-primary/10 p-6 sm:p-8 shadow-soft relative overflow-hidden group">
            {/* Ambient gold glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[radial-gradient(circle,_hsl(45_95%_55%/0.06),_transparent_70%)] rounded-full blur-2xl pointer-events-none" />

            {/* Header & Filter Pills */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary dark:text-gold-glow">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-heading font-bold text-foreground dark:text-white tracking-tight">
                                Recent Activity
                            </h2>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live Feed
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Executive log of member registrations, check-ins, renewals, and payments.
                        </p>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap bg-background/50 backdrop-blur-md p-1 rounded-2xl border border-primary/10">
                    {filterCategories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                                selectedCategory === cat.value
                                    ? 'bg-primary text-primary-foreground shadow-glow'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="relative z-10">
                {/* Vertical connecting line */}
                <div className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent pointer-events-none" />

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredActivities.map((activity, index) => {
                            const config = getActivityConfig(activity.type);
                            const IconComponent = config.icon;

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.04 }}
                                    className="relative pl-12 pr-4 py-3 rounded-2xl hover:bg-primary/[0.03] dark:hover:bg-white/[0.03] transition-all duration-300 group/row border border-transparent hover:border-primary/10"
                                >
                                    {/* Timeline Node Icon */}
                                    <div
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover/row:scale-110 shadow-sm ${config.iconBg}`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </div>

                                    {/* Row Content */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-heading font-bold text-foreground dark:text-white">
                                                    {activity.memberName}
                                                </span>
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    · {activity.type}
                                                </span>
                                            </div>
                                            {activity.detail && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                                    {activity.detail}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 self-end sm:self-auto">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${config.statusBadge}`}
                                            >
                                                {activity.status}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono shrink-0">
                                                <Clock className="w-3.5 h-3.5 opacity-70" />
                                                <span>{activity.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
