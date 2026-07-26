'use client';

import React from "react";
import { 
    Users, UserCheck, IndianRupee, Activity, Clock, FileText,
    ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import RevenueOverview from "@/components/admin/RevenueOverview";
import MembershipOverview from "@/components/admin/MembershipOverview";
import RecentActivity from "@/components/admin/RecentActivity";

interface KPICardData {
    title: string;
    value: string;
    trend: string;
    isPositive?: boolean;
    icon: React.ElementType;
    color: 'gold' | 'emerald' | 'cyan' | 'green' | 'amber' | 'indigo';
}

const kpiData: KPICardData[] = [
    {
        title: "Total Active Members",
        value: "2,845",
        trend: "+12% vs last month",
        isPositive: true,
        icon: Users,
        color: "gold"
    },
    {
        title: "Today's Check-ins",
        value: "428",
        trend: "+18% vs yesterday",
        isPositive: true,
        icon: UserCheck,
        color: "emerald"
    },
    {
        title: "Members Currently Inside the Gym",
        value: "64",
        trend: "Live peak capacity",
        isPositive: true,
        icon: Activity,
        color: "cyan"
    },
    {
        title: "Today's Revenue",
        value: "₹68,500",
        trend: "+14.2% vs yesterday",
        isPositive: true,
        icon: IndianRupee,
        color: "green"
    },
    {
        title: "Expiring Memberships",
        value: "18",
        trend: "Within 7 days",
        isPositive: false,
        icon: Clock,
        color: "amber"
    },
    {
        title: "Pending Requests",
        value: "7",
        trend: "3 Transfers · 4 PT Requests",
        isPositive: false,
        icon: FileText,
        color: "indigo"
    }
];

const colorStyles: Record<KPICardData['color'], {
    iconBg: string;
    badgeBg: string;
    glowColor: string;
}> = {
    gold: {
        iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        glowColor: "hsl(45 95% 55% / 0.12)"
    },
    emerald: {
        iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        glowColor: "hsl(160 84% 39% / 0.12)"
    },
    cyan: {
        iconBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        glowColor: "hsl(190 95% 50% / 0.12)"
    },
    green: {
        iconBg: "bg-green-500/10 text-green-400 border border-green-500/20",
        badgeBg: "bg-green-500/10 text-green-400 border-green-500/20",
        glowColor: "hsl(142 71% 45% / 0.12)"
    },
    amber: {
        iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        glowColor: "hsl(38 92% 50% / 0.12)"
    },
    indigo: {
        iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
        badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        glowColor: "hsl(239 84% 67% / 0.12)"
    }
};

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header - Minimal, Clean & Executive Focused */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">
                        Executive Command Center
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        High-level business operations, live check-ins, and financial overview.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live Executive Status Indicator (No Quick Actions or Shortcuts) */}
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-background/60 backdrop-blur-md border border-primary/10 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-heading font-bold text-foreground dark:text-white uppercase tracking-wider">
                            Live Operations
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground font-mono">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Overview Cards - 6 Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpiData.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    const styles = colorStyles[kpi.color];

                    return (
                        <motion.div
                            key={kpi.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07, duration: 0.4 }}
                            className="glass-card rounded-3xl p-6 group transition-all duration-500 hover:border-primary/40 relative overflow-hidden shadow-soft flex flex-col justify-between"
                        >
                            {/* Decorative Radial Glow */}
                            <div
                                className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"
                                style={{ background: `radial-gradient(circle, ${styles.glowColor}, transparent 70%)` }}
                            />

                            <div className="flex justify-between items-start mb-5 relative z-10">
                                <div className={`p-3 rounded-2xl ${styles.iconBg}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                                        kpi.isPositive
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}
                                >
                                    {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 shrink-0" /> : <ArrowDownRight className="w-3 h-3 shrink-0" />}
                                    <span>{kpi.trend}</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                                    {kpi.title}
                                </h3>
                                <p className="text-3xl font-heading font-bold text-foreground dark:text-white tracking-tight">
                                    {kpi.value}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Revenue Overview & Membership Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Revenue Overview Component - Col Span 7 */}
                <div className="lg:col-span-7 flex flex-col">
                    <RevenueOverview />
                </div>

                {/* Membership Overview Component - Col Span 5 */}
                <div className="lg:col-span-5 flex flex-col">
                    <MembershipOverview />
                </div>
            </div>

            {/* Recent Activity Section - Replaces Recent Signups */}
            <div className="pt-2">
                <RecentActivity />
            </div>
        </div>
    );
}
