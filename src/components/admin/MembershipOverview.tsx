'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface MembershipStatusData {
    name: string;
    value: number;
    percentage: string;
    color: string;
    description: string;
    badgeColor: string;
}

const membershipData: MembershipStatusData[] = [
    {
        name: 'Active Memberships',
        value: 2845,
        percentage: '87.6%',
        color: '#10b981',
        description: 'In good standing',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
        name: 'Expiring Soon',
        value: 42,
        percentage: '1.3%',
        color: '#f59e0b',
        description: 'Within next 7 days',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
        name: 'Expired Memberships',
        value: 361,
        percentage: '11.1%',
        color: '#f43f5e',
        description: 'Grace period & follow-up',
        badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
];

interface AttentionMembership {
    id: string;
    name: string;
    plan: string;
    status: 'Expiring Soon' | 'Expired';
    timeline: string;
    value: string;
}

const attentionMemberships: AttentionMembership[] = [
    {
        id: 'MEM-4091',
        name: 'Alex Rivera',
        plan: 'Annual Elite',
        status: 'Expiring Soon',
        timeline: 'Expiring Tomorrow',
        value: '₹24,999',
    },
    {
        id: 'MEM-3982',
        name: 'Marcus Vance',
        plan: 'Pro Monthly',
        status: 'Expired',
        timeline: 'Expired Today',
        value: '₹4,499',
    },
    {
        id: 'MEM-4105',
        name: 'Sophia Martinez',
        plan: '6-Month VIP',
        status: 'Expiring Soon',
        timeline: 'Expiring in 2 Days',
        value: '₹16,999',
    },
    {
        id: 'MEM-3844',
        name: 'David Kim',
        plan: 'Annual Pro',
        status: 'Expired',
        timeline: 'Expired 3 Days Ago',
        value: '₹19,999',
    },
];

export default function MembershipOverview() {
    const totalMemberships = membershipData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl border border-primary/10 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-soft"
        >
            {/* Background luxury glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-heading font-bold text-foreground dark:text-white tracking-tight">
                            Membership Overview
                        </h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                            Base Health & Retention
                        </p>
                    </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-gold-glow text-[10px] font-bold uppercase tracking-wider">
                    {totalMemberships.toLocaleString('en-IN')} Total
                </div>
            </div>

            {/* Donut Chart and Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center mb-6 relative z-10">
                {/* Donut Chart */}
                <div className="h-[180px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload as MembershipStatusData;
                                        return (
                                            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    {data.name}
                                                </p>
                                                <p className="text-sm font-heading font-bold text-white">
                                                    {data.value.toLocaleString('en-IN')} ({data.percentage})
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {data.description}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Pie
                                data={membershipData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={52}
                                outerRadius={72}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {membershipData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-heading font-bold text-foreground dark:text-white tracking-tight">
                            87.6%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Active
                        </span>
                    </div>
                </div>

                {/* Status Legend Cards */}
                <div className="space-y-3">
                    {membershipData.map((item) => (
                        <div
                            key={item.name}
                            className="p-3 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5 flex items-center justify-between hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 8px ${item.color}80`,
                                    }}
                                />
                                <div>
                                    <p className="text-xs font-semibold text-foreground dark:text-white">
                                        {item.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-heading font-bold text-foreground dark:text-white block">
                                    {item.value.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                    {item.percentage}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Attention Required Section */}
            <div className="pt-5 border-t border-primary/10 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-heading font-bold text-foreground dark:text-white tracking-wide uppercase">
                            Attention Required
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                        Immediate Follow-up
                    </span>
                </div>

                <div className="space-y-2.5">
                    {attentionMemberships.map((member) => (
                        <div
                            key={member.id}
                            className="p-3 rounded-2xl bg-charcoal/30 dark:bg-black/20 border border-primary/5 flex items-center justify-between hover:bg-primary/[0.03] dark:hover:bg-white/[0.03] transition-colors group/item"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-gold-glow font-bold text-xs shrink-0">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground dark:text-white group-hover/item:text-primary dark:group-hover/item:text-gold-glow transition-colors">
                                        {member.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {member.plan} · {member.value}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        member.status === 'Expiring Soon'
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}
                                >
                                    {member.timeline}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
