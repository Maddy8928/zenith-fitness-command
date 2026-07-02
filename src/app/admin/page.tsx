"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, UserCheck, DollarSign, Activity, TrendingUp, Search, MoreVertical, ArrowUpRight, ArrowDownRight, CalendarDays, Lock, Waves } from "lucide-react";
import RevenueOverview from "@/components/admin/RevenueOverview";

const kpiData = [
    {
        title: "Total Members",
        value: "3,248",
        trend: "+12%",
        isPositive: true,
        icon: Users,
        color: "text-primary dark:text-gold-glow",
        bg: "bg-primary/10 dark:bg-gold-glow/10"
    },
    {
        title: "Active Trainers",
        value: "42",
        trend: "+3",
        isPositive: true,
        icon: UserCheck,
        color: "text-accent dark:text-neon-cyan",
        bg: "bg-accent/10 dark:bg-neon-cyan/10"
    },
    {
        title: "Monthly Revenue",
        value: "₹21.50 Lakh",
        trend: "+15.4%",
        isPositive: true,
        icon: DollarSign,
        color: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        title: "Wellness Utilization",
        value: "84.2%",
        trend: "+5.4%",
        isPositive: true,
        icon: Waves,
        color: "text-cyan-500",
        bg: "bg-cyan-500/10"
    }
];

const recentSignups = [
    { id: "M-1024", name: "Alex Johnson", plan: "Elite Annual", date: "Today, 09:45 AM", status: "Active" },
    { id: "M-1023", name: "Sarah Williams", plan: "Pro Monthly", date: "Today, 08:30 AM", status: "Active" },
    { id: "M-1022", name: "Michael Chen", plan: "Starter Monthly", date: "Yesterday", status: "Pending" },
    { id: "M-1021", name: "Emma Davis", plan: "Pro Monthly", date: "Yesterday", status: "Active" },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "Pending": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const isReceptionist = user?.role === 'RECEPTIONIST';

    const visibleKpis = isReceptionist ? kpiData.filter(kpi => kpi.title !== 'Monthly Revenue') : kpiData;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Dashboard Overview</h1>
                    <p className="text-sm text-muted-foreground mt-1">Monitor gym performance, attendance, and revenue.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <CalendarDays className="w-4 h-4" />
                        View Schedule
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isReceptionist ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                {visibleKpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:border-primary/40 relative overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.1),_transparent_70%)] rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {kpi.trend}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</h3>
                                <p className="text-3xl font-heading font-bold text-foreground dark:text-white tracking-tight">{kpi.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Overview Area */}
                <div className="lg:col-span-2">
                    {isReceptionist ? (
                        <div className="glass-card rounded-3xl border border-primary/10 p-12 flex flex-col items-center justify-center min-h-[400px]">
                            <Lock className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
                            <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Access Restricted</p>
                            <p className="text-xs text-slate-500 mt-2 text-center max-w-[240px]">You do not have permission to view financial analytics.</p>
                        </div>
                    ) : (
                        <RevenueOverview />
                    )}
                </div>

                {/* Recent Signups */}
                <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft flex flex-col">
                    <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-charcoal/30 dark:bg-black/20">
                        <h2 className="text-lg font-heading font-semibold text-foreground">Recent Signups</h2>
                        <button className="text-sm text-primary dark:text-gold-glow hover:underline transition-all">View All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-primary/5">
                            {recentSignups.map((member) => (
                                <div key={member.id} className="p-5 flex items-center justify-between hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground dark:text-white">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.plan}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-semibold mb-1 inline-block ${getStatusColor(member.status)}`}>
                                            {member.status}
                                        </div>
                                        <p className="text-xs text-muted-foreground block">{member.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
