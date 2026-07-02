"use client";

import React, { useState } from "react";
import { handleExport } from "@/utils/exportUtils";
import { toast } from "sonner";
import { 
    Users, 
    ArrowUpRight, 
    ArrowDownRight, 
    Zap, 
    TrendingUp, 
    Award, 
    Settings, 
    Download,
    Search,
    Filter,
    Clock,
    UserCheck,
    CreditCard,
    Dumbbell,
    Target,
    Activity,
    Star,
    ChefHat,
    Coffee,
    ShoppingBag,
    CheckCircle2
} from "lucide-react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

// --- Data ---
const receptionistData = [
    { name: "Mon", inquiries: 45, conversions: 28 },
    { name: "Tue", inquiries: 52, conversions: 35 },
    { name: "Wed", inquiries: 38, conversions: 22 },
    { name: "Thu", inquiries: 65, conversions: 48 },
    { name: "Fri", inquiries: 48, conversions: 30 },
    { name: "Sat", inquiries: 30, conversions: 25 },
    { name: "Sun", inquiries: 25, conversions: 18 },
];

const trainerTrendData = [
    { hour: "6 AM", count: 12 },
    { hour: "8 AM", count: 45 },
    { hour: "10 AM", count: 32 },
    { hour: "12 PM", count: 18 },
    { hour: "2 PM", count: 15 },
    { hour: "4 PM", count: 38 },
    { hour: "6 PM", count: 52 },
    { hour: "8 PM", count: 28 },
];

const specializationData = [
    { name: "HIIT", value: 35, color: "#FBBD23" },
    { name: "Strength", value: 25, color: "#22D3EE" },
    { name: "Yoga", value: 20, color: "#A855F7" },
    { name: "Cycling", value: 15, color: "#34D399" },
    { name: "Recovery", value: 5, color: "#F472B6" },
];

const receptionists = [
    { id: "REC-01", name: "Sarah Wilson", status: "Online", sales: "₹3,57,000", checkins: 142, rating: 98, trend: "up", avatar: "S" },
    { id: "REC-02", name: "James Chen", status: "Offline", sales: "₹3,22,500", checkins: 128, rating: 95, trend: "up", avatar: "J" },
    { id: "REC-03", name: "Emma Davis", status: "Online", sales: "₹2,47,800", checkins: 95, rating: 92, trend: "down", avatar: "E" },
    { id: "REC-04", name: "Michael Brown", status: "Online", sales: "₹4,28,400", checkins: 164, rating: 99, trend: "up", avatar: "M" },
];

const trainers = [
    { id: "T-01", name: "Alex Johnson", role: "Head Trainer", rating: 4.9, clients: 24, sessions: 156, retention: 94, trend: "up", avatar: "AJ" },
    { id: "T-02", name: "Sarah Williams", role: "Yoga Instructor", rating: 4.8, clients: 35, sessions: 128, retention: 98, trend: "up", avatar: "SW" },
    { id: "T-03", name: "Mike Tyson", role: "Strength Coach", rating: 4.7, clients: 18, sessions: 142, retention: 88, trend: "down", avatar: "MT" },
    { id: "T-04", name: "Emma Davis", role: "Cycling Instructor", rating: 4.9, clients: 42, sessions: 184, retention: 96, trend: "up", avatar: "ED" },
];

const liveMonitoringData = [
    { id: 1, trainer: "Alex Johnson", activity: "Power HIIT", attendance: 18, capacity: 20, status: "Active", timeRemaining: "24m" },
    { id: 2, trainer: "Sarah Williams", activity: "Vinyasa Flow", attendance: 12, capacity: 15, status: "Active", timeRemaining: "12m" },
    { id: 3, trainer: "Emma Davis", activity: "Endurance Spin", attendance: 24, capacity: 25, status: "Active", timeRemaining: "45m" },
    { id: 4, trainer: "David Miller", activity: "CrossFit WOD", attendance: 8, capacity: 12, status: "Ending", timeRemaining: "3m" },
];

const availabilityData = [
    { day: "Mon", morning: 85, afternoon: 45, evening: 90 },
    { day: "Tue", morning: 70, afternoon: 60, evening: 85 },
    { day: "Wed", morning: 90, afternoon: 50, evening: 95 },
    { day: "Thu", morning: 65, afternoon: 75, evening: 80 },
    { day: "Fri", morning: 80, afternoon: 40, evening: 90 },
];

const cafePrepData = [
    { hour: "8 AM", volume: 15, speed: 2.1 },
    { hour: "10 AM", volume: 35, speed: 2.8 },
    { hour: "12 PM", volume: 45, speed: 4.2 },
    { hour: "2 PM", volume: 28, speed: 3.5 },
    { hour: "4 PM", volume: 22, speed: 2.9 },
    { hour: "6 PM", volume: 52, speed: 4.8 },
    { hour: "8 PM", volume: 30, speed: 3.1 },
];

const cafeCategoryMix = [
    { name: "Smoothies", value: 45, color: "#10B981" },
    { name: "Healthy Food", value: 25, color: "#22D3EE" },
    { name: "Supplements", value: 18, color: "#FBBD23" },
    { name: "Snacks", value: 12, color: "#F472B6" },
];

const cafeStaff = [
    { id: "CF-01", name: "Bjorn Refreshment", role: "Head Barista", rating: 4.9, prepTime: "2.4m", orders: 428, accuracy: 98, trend: "up", avatar: "BR" },
    { id: "CF-02", name: "Astrid Nutrition", role: "Smoothie Specialist", rating: 4.8, prepTime: "2.1m", orders: 354, accuracy: 99, trend: "up", avatar: "AN" },
    { id: "CF-03", name: "Lars Kitchen", role: "Lead Cook", rating: 4.7, prepTime: "6.5m", orders: 184, accuracy: 95, trend: "down", avatar: "LK" },
];

export default function PerformanceDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "receptionist" | "trainer" | "cafe">("overview");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-black tracking-tight text-white flex items-center gap-3 italic">
                        <Award className="w-10 h-10 text-primary animate-pulse" />
                        PERFORMANCE <span className="text-primary tracking-tighter not-italic">HUB</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium tracking-wide">
                        <Activity className="w-4 h-4 text-primary" />
                        Real-time monitoring and analytics for all gym staff.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/10 shadow-soft backdrop-blur-md">
                    <button 
                        onClick={() => setActiveTab("overview")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'overview' ? 'bg-primary text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab("receptionist")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'receptionist' ? 'bg-primary text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Receptionist
                    </button>
                    <button 
                        onClick={() => setActiveTab("trainer")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'trainer' ? 'bg-primary text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Trainers
                    </button>
                    <button 
                        onClick={() => setActiveTab("cafe")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'cafe' ? 'bg-primary text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Cafe
                    </button>
                </div>
            </div>

            {activeTab === "overview" && <OverviewSection />}
            {activeTab === "receptionist" && <ReceptionistSection />}
            {activeTab === "trainer" && <TrainerSection />}
            {activeTab === "cafe" && <CafeSection />}
        </div>
    );
}

// --- Overview Section ---
function OverviewSection() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Top Level KPIs - Receptionist & Trainer Combined */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-cyan-400/10 text-cyan-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">+12%</span>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Daily Check-ins</p>
                    <h3 className="text-3xl font-heading font-black text-white mt-1">1,284</h3>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-amber-400/10 text-amber-400">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">+8.4%</span>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Sessions</p>
                    <h3 className="text-3xl font-heading font-black text-white mt-1">42</h3>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-fuchsia-400/10 text-fuchsia-400">
                            <Star className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">4.8</span>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Avg. Satisfaction</p>
                    <h3 className="text-3xl font-heading font-black text-white mt-1">96%</h3>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-400/10 text-emerald-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">₹6.9L</span>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Daily Revenue</p>
                    <h3 className="text-3xl font-heading font-black text-white mt-1">₹4,40,200</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Unified Activity Monitor */}
                <TrainerMonitoringSection />
                
                <div className="glass-card rounded-3xl p-8 border border-white/5 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-heading font-black text-white italic">TRAINER <span className="text-primary not-italic">LOAD</span></h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Weekly Peak Performance</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-primary shadow-glow"></div>
                             <div className="w-3 h-3 rounded-full bg-white/10"></div>
                             <div className="w-3 h-3 rounded-full bg-white/10"></div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={availabilityData}>
                                <defs>
                                    <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBD23" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FBBD23" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorEvening" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '16px' }} />
                                <Area type="monotone" dataKey="morning" stroke="#FBBD23" strokeWidth={3} fillOpacity={1} fill="url(#colorMorning)" />
                                <Area type="monotone" dataKey="evening" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorEvening)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Combined Leaderboard Highlight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass-card rounded-3xl p-6 border border-white/5">
                    <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-primary" /> Top Receptionists
                    </h3>
                    <div className="space-y-4">
                        {receptionists.slice(0, 3).map((rec) => (
                            <div key={rec.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary">{rec.avatar}</div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{rec.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Rating: {rec.rating}%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">{rec.sales}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Top Seller</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="glass-card rounded-3xl p-6 border border-white/5">
                    <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-accent" /> Top Trainers
                    </h3>
                    <div className="space-y-4">
                        {trainers.slice(0, 3).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center font-bold text-accent">{t.avatar}</div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{t.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Retention: {t.retention}%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-primary fill-primary" />
                                        <p className="text-sm font-bold text-white">{t.rating}</p>
                                    </div>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Elite Status</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
}

// --- Trainer Monitoring Section ---
function TrainerMonitoringSection() {
    return (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/5 flex flex-col bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-heading font-black text-white italic">LIVE <span className="text-primary not-italic">MONITORING</span></h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Real-time Trainer Activity</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl border border-emerald-500/20 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">LIVE NOW</span>
                </div>
            </div>
            <div className="p-6 space-y-4">
                {liveMonitoringData.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-primary font-black border border-white/10">
                                    {item.trainer.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111] ${item.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                            </div>
                            <div>
                                <h4 className="font-black text-white text-sm tracking-tight">{item.trainer}</h4>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.activity}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="hidden sm:block text-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Check-ins</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${item.attendance/item.capacity > 0.8 ? 'bg-primary shadow-glow' : 'bg-cyan-400'}`} 
                                            style={{ width: `${(item.attendance/item.capacity) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-black text-white">{item.attendance}/{item.capacity}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Remaining</p>
                                <div className="flex items-center gap-1 font-black text-white text-sm">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    {item.timeRemaining}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.01]">
                <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-all">
                    View Full Floor Schedule
                </button>
            </div>
        </div>
    );
}

// --- Receptionist Section ---
function ReceptionistSection() {
    const kpis = [
        { title: "Avg. Response Time", value: "2.4m", trend: "-12%", isPositive: true, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]" },
        { title: "Total Check-ins", value: "842", trend: "+8%", isPositive: true, icon: UserCheck, color: "text-amber-400", bg: "bg-amber-400/10", glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]" },
        { title: "Lead Conversion", value: "64.2%", trend: "+5.4%", isPositive: true, icon: TrendingUp, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10", glow: "shadow-[0_0_20px_rgba(232,121,249,0.2)]" },
        { title: "Front Desk Rev.", value: "₹13.8L", trend: "+12.5%", isPositive: true, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]" }
    ];

    const handleExportInquiries = async () => {
        try {
            const headers = ['Day of Week', 'Inquiries Received', 'Conversions'];
            const data = receptionistData.map(d => [
                d.name,
                d.inquiries,
                d.conversions
            ]);

            await handleExport('CSV', {
                filename: `Receptionist_Inquiries_Report_${new Date().toISOString().split('T')[0]}`,
                title: 'Receptionist Inquiry Activity Performance Report',
                headers,
                data,
                category: 'Receptionist'
            });
            toast.success('Inquiry activity report exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export inquiry activity report.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-luxury ${kpi.glow}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {kpi.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <h3 className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-[0.1em]">{kpi.title}</h3>
                        <div className="text-3xl font-heading font-black text-white">{kpi.value}</div>
                        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${kpi.bg} blur-3xl opacity-20 group-hover:scale-150 transition-all duration-700`} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 relative">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h2 className="text-2xl font-heading font-extrabold text-white">Inquiry Activity</h2>
                        <button onClick={handleExportInquiries} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground transition-all">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={receptionistData}>
                                <defs>
                                    <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBD23" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FBBD23" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="inquiries" stroke="#FBBD23" strokeWidth={3} fillOpacity={1} fill="url(#colorInq)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-3xl overflow-hidden flex flex-col border border-white/5">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-xl font-heading font-black text-white italic">TOP <span className="text-primary not-italic">STARS</span></h2>
                        <p className="text-xs text-muted-foreground mt-1 font-bold">Based on weekly performance score</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {receptionists.map((rec) => (
                            <div key={rec.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-black text-primary">
                                        {rec.avatar}
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-sm">{rec.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">{rec.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-white">{rec.rating}%</div>
                                    <div className={`text-[10px] flex items-center justify-end font-black ${rec.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {rec.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        TREND
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Trainer Section ---
function TrainerSection() {
    const kpis = [
        { title: "Avg. Rating", value: "4.82", trend: "+0.4", isPositive: true, icon: Star, color: "text-purple-400", bg: "bg-purple-400/10", glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]" },
        { title: "Total Sessions", value: "1,248", trend: "+12%", isPositive: true, icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]" },
        { title: "Client Retention", value: "92.4%", trend: "+2.1%", isPositive: true, icon: Target, color: "text-amber-400", bg: "bg-amber-400/10", glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]" },
        { title: "PT Revenue", value: "₹28.7L", trend: "+15.8%", isPositive: true, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-luxury ${kpi.glow}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {kpi.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <h3 className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-[0.1em]">{kpi.title}</h3>
                        <div className="text-3xl font-heading font-black text-white">{kpi.value}</div>
                        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${kpi.bg} blur-3xl opacity-20 group-hover:scale-150 transition-all duration-700`} />
                    </div>
                ))}
            </div>

            <TrainerMonitoringSection />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-10">
                        <h2 className="text-2xl font-heading font-extrabold text-white">Peak Training Load</h2>
                        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
                            <button className="px-4 py-1 bg-primary/20 text-primary rounded-lg text-xs font-black">TODAY</button>
                            <button className="px-4 py-1 text-muted-foreground text-xs font-bold">WEEK</button>
                        </div>
                    </div>
                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trainerTrendData}>
                                <defs>
                                    <linearGradient id="colorTrain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="hour" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '16px' }} />
                                <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={4} fillOpacity={1} fill="url(#colorTrain)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
                    <h2 className="text-xl font-heading font-black text-white italic">CLASS <span className="text-primary not-italic">MIX</span></h2>
                    <div className="h-[200px] w-full relative my-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={specializationData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                    {specializationData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <div className="text-xl font-black text-white">100%</div>
                            <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Global</div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {specializationData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trainer Leaderboard */}
            <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                    <h2 className="text-2xl font-heading font-black text-white">ELITE TRAINERS</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Trainer</th>
                                <th className="px-6 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Performance</th>
                                <th className="px-6 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Retention</th>
                                <th className="px-6 py-5 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {trainers.map((t) => (
                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-primary border border-white/10">{t.avatar}</div>
                                            <div>
                                                <p className="font-black text-white text-base">{t.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black">{t.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-white font-black">
                                            <Star className="w-4 h-4 text-primary fill-primary" />
                                            {t.rating}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-black text-emerald-400">{t.retention}%</td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-all"><Settings className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Cafe Section ---
function CafeSection() {
    const kpis = [
        { title: "Avg. Prep Time", value: "3.8m", trend: "-15%", isPositive: true, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
        { title: "Total Orders", value: "1,248", trend: "+12%", isPositive: true, icon: ShoppingBag, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]" },
        { title: "Cafe Revenue", value: "₹10.5L", trend: "+8.4%", isPositive: true, icon: Coffee, color: "text-amber-400", bg: "bg-amber-400/10", glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]" },
        { title: "Prep Accuracy", value: "98.2%", trend: "+2.1%", isPositive: true, icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-400/10", glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-luxury ${kpi.glow}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {kpi.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <h3 className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-[0.1em]">{kpi.title}</h3>
                        <div className="text-3xl font-heading font-black text-white">{kpi.value}</div>
                        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${kpi.bg} blur-3xl opacity-20 group-hover:scale-150 transition-all duration-700`} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-heading font-extrabold text-white italic">PREP <span className="text-emerald-400 not-italic tracking-tighter">LOAD</span></h2>
                            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Hourly Service Speed Monitor</p>
                        </div>
                        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
                            <button className="px-4 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black">VOL</button>
                            <button className="px-4 py-1 text-muted-foreground text-xs font-bold">SPD</button>
                        </div>
                    </div>
                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cafePrepData}>
                                <defs>
                                    <linearGradient id="colorCafe" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="hour" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '16px' }} />
                                <Area type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorCafe)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
                    <h2 className="text-xl font-heading font-black text-white italic">CATEGORY <span className="text-emerald-400 not-italic">MIX</span></h2>
                    <div className="h-[200px] w-full relative my-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={cafeCategoryMix} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                    {cafeCategoryMix.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <div className="text-xl font-black text-white">100%</div>
                            <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Global</div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {cafeCategoryMix.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cafe Staff Leaderboard */}
            <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                    <h2 className="text-2xl font-heading font-black text-white italic tracking-tighter">ELITE CAFE <span className="text-emerald-400 not-italic">TEAM</span></h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Worker</th>
                                <th className="px-6 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Prep Speed</th>
                                <th className="px-6 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Accuracy</th>
                                <th className="px-6 py-5 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {cafeStaff.map((s) => (
                                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-emerald-400 border border-white/10">{s.avatar}</div>
                                            <div>
                                                <p className="font-black text-white text-base">{s.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black">{s.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-black text-white">{s.prepTime}</td>
                                    <td className="px-6 py-6 font-black text-indigo-400">{s.accuracy}%</td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-all"><Settings className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
