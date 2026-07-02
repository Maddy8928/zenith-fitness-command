'use client';

import React, { useState, useEffect } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { 
    MessageSquare, 
    Star, 
    ThumbsUp, 
    ThumbsDown, 
    TrendingUp, 
    Zap, 
    Activity, 
    Users, 
    UserCheck, 
    Filter, 
    Search, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Coffee,
    ChefHat
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// --- Data now managed by FeedbackContext ---

const sentimentTrend = [
    { day: 'Mon', positive: 85, negative: 15 },
    { day: 'Tue', positive: 88, negative: 12 },
    { day: 'Wed', positive: 82, negative: 18 },
    { day: 'Thu', positive: 90, negative: 10 },
    { day: 'Fri', positive: 92, negative: 8 },
    { day: 'Sat', positive: 85, negative: 15 },
    { day: 'Sun', positive: 80, negative: 20 },
];

export default function AdminFeedbackPanel() {
    const { feedback: feedbackData, isLoading, refreshFeedback } = useFeedback();
    const [activeTab, setActiveTab] = useState<'overview' | 'receptionist' | 'trainer' | 'cafe'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshFeedback();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Shared Analytics logic
    const totalFeedback = feedbackData.length || 1;
    const avgRating = (feedbackData.reduce((acc, f) => acc + f.rating, 0) / totalFeedback).toFixed(1);
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">
            
            {/* Page Header & Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-black tracking-tight text-white flex items-center gap-3 italic">
                        <MessageSquare className="w-10 h-10 text-primary animate-pulse" />
                        GUEST <span className="text-primary tracking-tighter not-italic">SATISFACTION</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium tracking-wide">
                        <Activity className="w-4 h-4 text-primary" />
                        Monitoring feedback across all <span className="text-white font-bold">{activeTab.toUpperCase()}</span> divisions.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/10 shadow-soft backdrop-blur-md">
                    <div className="flex items-center gap-2 px-4 py-2 mr-2 border-r border-white/10">
                        <div className={`w-2 h-2 rounded-full ${isLoading || isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{isLoading || isRefreshing ? 'Syncing' : 'Live'}</span>
                    </div>

                    <button 
                        onClick={handleRefresh}
                        className={`p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <Activity className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'overview' ? 'bg-primary text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('receptionist')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'receptionist' ? 'bg-amber-400 text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Reception
                    </button>
                    <button 
                        onClick={() => setActiveTab('trainer')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'trainer' ? 'bg-cyan-400 text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Trainers
                    </button>
                    <button 
                        onClick={() => setActiveTab('cafe')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${activeTab === 'cafe' ? 'bg-emerald-400 text-black shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Cafe
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <OverviewSection key="overview" data={feedbackData} />
                ) : (
                    <RoleSpecificSection 
                        key={activeTab} 
                        role={activeTab === 'receptionist' ? 'Receptionist' : activeTab === 'trainer' ? 'Trainer' : 'Cafe'} 
                        data={feedbackData} 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Sub-sections ---

function OverviewSection({ data }: { data: any[] }) {
    const totalCount = data.length || 1;
    const avgRating = (data.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(1);
    const positiveCount = data.filter(f => f.sentiment === 'Positive').length;
    const negativeCount = data.filter(f => f.sentiment === 'Negative').length;
    
    const categoryDistribution = [
        { name: 'Reception', count: data.filter(f => f.role === 'Receptionist').length, color: '#FBBD23' },
        { name: 'Trainer', count: data.filter(f => f.role === 'Trainer').length, color: '#22D3EE' },
        { name: 'Cafe', count: data.filter(f => f.role === 'Cafe').length, color: '#10B981' },
        { name: 'Facility', count: data.filter(f => f.role === 'Facility').length, color: '#A855F7' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Globel Rating" value={avgRating} trend="+1.2%" isPositive={true} icon={Star} color="text-primary" bg="bg-primary/10" glow="shadow-glow-sm" />
                <MetricCard title="Positive Ratio" value={`${((positiveCount/totalCount)*100).toFixed(0)}%`} trend="+2.4%" isPositive={true} icon={ThumbsUp} color="text-emerald-400" bg="bg-emerald-400/10" glow="shadow-glow-sm" />
                <MetricCard title="Urgent Issues" value={data.filter(f => f.priority === 'Urgent').length} trend="-1" isPositive={true} icon={AlertCircle} color="text-rose-400" bg="bg-rose-400/10" glow="shadow-glow-sm" />
                <MetricCard title="Total Volume" value={data.length} trend="+12" isPositive={true} icon={MessageSquare} color="text-cyan-400" bg="bg-cyan-400/10" glow="shadow-glow-sm" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-heading font-black text-white italic">GLOBAL <span className="text-primary not-italic">SENTIMENT</span></h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[10px] text-slate-400 font-bold uppercase">Positive</span></div>
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-700" /><span className="text-[10px] text-slate-400 font-bold uppercase">Mixed</span></div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sentimentTrend}>
                                <defs>
                                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBD23" stopOpacity={0.3}/><stop offset="95%" stopColor="#FBBD23" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} axisLine={false} />
                                <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10' }} />
                                <Area type="monotone" dataKey="positive" stroke="#FBBD23" strokeWidth={4} fill="url(#colorPos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-heading font-black text-white italic mb-8">CATEGORY <span className="text-primary not-italic">MIX</span></h2>
                    <div className="relative w-48 h-48 mb-8">
                        <div className="absolute inset-0 rounded-full border-[10px] border-white/5 shadow-inner" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="text-4xl font-black text-white">{data.length}</div>
                            <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Total</div>
                        </div>
                    </div>
                    <div className="w-full space-y-3">
                        {categoryDistribution.map((item, i) => (
                            <div key={i} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] font-black text-white uppercase">{item.name}</span>
                                <span className="text-[10px] font-bold text-primary">{item.count} items</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <RecentFeedback data={data} />
        </motion.div>
    );
}

function RoleSpecificSection({ role, data, searchTerm, setSearchTerm }: { role: string, data: any[], searchTerm: string, setSearchTerm: any }) {
    const roleData = data.filter(f => f.role === role);
    const filteredData = roleData.filter(f => 
        f.member.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.target.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const avgRating = (roleData.reduce((acc, f) => acc + f.rating, 0) / (roleData.length || 1)).toFixed(1);
    const positiveCount = roleData.filter(f => f.sentiment === 'Positive').length;
    const satisfactionRate = ((positiveCount / (roleData.length || 1)) * 100).toFixed(0);

    const accentColor = role === 'Receptionist' ? 'text-amber-400' : role === 'Trainer' ? 'text-cyan-400' : 'text-emerald-400';
    const accentBg = role === 'Receptionist' ? 'bg-amber-400/10' : role === 'Trainer' ? 'bg-cyan-400/10' : 'bg-emerald-400/10';

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title={`${role} Rating`} value={avgRating} trend="+0.3" isPositive={true} icon={Star} color={accentColor} bg={accentBg} glow="shadow-glow-sm" />
                <MetricCard title="Satisfaction" value={`${satisfactionRate}%`} trend="+5%" isPositive={true} icon={ThumbsUp} color="text-white" bg="bg-white/5" glow="" />
                <MetricCard title="Active Submissions" value={roleData.length} trend="Live" isPositive={true} icon={MessageSquare} color="text-white" bg="bg-white/5" glow="" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-heading font-black text-white italic">FILTERED <span className={`${accentColor} not-italic`}>INBOX</span></h2>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder={`Search ${role} feedback...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredData.map((fb, idx) => (
                        <FeedbackCard key={fb.id} fb={fb} idx={idx} roleColor={accentColor} />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// --- Helper UI Components ---

function RecentFeedback({ data }: { data: any[] }) {
    const urgent = data.filter(f => f.priority === 'Urgent').slice(0, 3);
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-heading font-black text-white italic">CRITICAL <span className="text-rose-500 not-italic">ALERTS</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {urgent.map((fb, idx) => (
                    <FeedbackCard key={fb.id} fb={fb} idx={idx} roleColor="text-rose-400" />
                ))}
            </div>
        </div>
    );
}

function FeedbackCard({ fb, idx, roleColor }: { fb: any, idx: number, roleColor: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex flex-col group"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fb.member}`} />
                        <AvatarFallback>{fb.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-black text-white text-sm">{fb.member}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black uppercase tracking-widest">{fb.role}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex gap-0.5 text-primary">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-primary' : 'text-slate-800'}`} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 italic text-sm text-slate-300 font-medium mb-6">
                "{fb.comment}"
            </div>
            <div className="mt-auto flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{fb.date}</span>
                <span className={roleColor}>{fb.target}</span>
            </div>
        </motion.div>
    );
}

// --- Helper Components ---

function MetricCard({ title, value, trend, isPositive, icon: Icon, color, bg, glow }: any) {
    return (
        <div className={`glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-luxury ${glow}`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <h3 className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">{title}</h3>
            <div className="text-4xl font-heading font-black text-white tracking-tighter italic">{value}</div>
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${bg} blur-3xl opacity-20 group-hover:scale-150 transition-all duration-700`} />
        </div>
    );
}
