'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LineChart, Timer, Trophy, Flame, ChevronDown, Activity, TrendingUp, Dumbbell, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// --- MOCK DATA ---
const weightData = [
    { month: 'Jan', weight: 85, bodyFat: 20 },
    { month: 'Feb', weight: 84, bodyFat: 19.5 },
    { month: 'Mar', weight: 82.5, bodyFat: 18.2 },
    { month: 'Apr', weight: 81, bodyFat: 17.5 },
    { month: 'May', weight: 79.5, bodyFat: 16.8 },
    { month: 'Jun', weight: 78, bodyFat: 15.5 },
];

const volumeData = [
    { week: 'W1', calories: 2400, hours: 4.5 },
    { week: 'W2', calories: 2800, hours: 5.2 },
    { week: 'W3', calories: 2100, hours: 3.8 },
    { week: 'W4', calories: 3100, hours: 6.0 },
];

const personalRecords = [
    { id: '1', exercise: 'Bench Press', value: '100 kg', date: 'Jun 15, 2026', icon: <Dumbbell className="w-5 h-5 text-indigo-400" /> },
    { id: '2', exercise: 'Deadlift', value: '140 kg', date: 'Jun 02, 2026', icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { id: '3', exercise: '5K Run', value: '22:45', date: 'May 28, 2026', icon: <Timer className="w-5 h-5 text-blue-400" /> },
    { id: '4', exercise: 'Pull-ups', value: '15 Reps', date: 'May 10, 2026', icon: <Target className="w-5 h-5 text-rose-400" /> },
];

const milestones = [
    { id: '1', title: 'Consistency King', description: 'Attended 20 workouts in one month.', date: 'May 31, 2026', achieved: true },
    { id: '2', title: 'Century Club', description: 'Lifted over 100kg total volume in a session.', date: 'Jun 15, 2026', achieved: true },
    { id: '3', title: 'Marathon Man', description: 'Run a total of 42km in a single week.', date: 'Pending', achieved: false },
];


export default function MemberProgressPage() {
    const [timeframe, setTimeframe] = useState('6M');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-slate-900/40 p-6 md:p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Analytics Hub</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight">
                        Progress Tracking
                    </h1>
                    <p className="text-slate-400 max-w-xl text-lg">
                        Visualize your journey, track your vital statistics, and celebrate your hard-earned milestones.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
                        <Flame className="w-6 h-6 text-orange-500 mb-2" />
                        <span className="text-2xl font-bold text-white">12</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Day Streak</span>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
                        <Dumbbell className="w-6 h-6 text-indigo-500 mb-2" />
                        <span className="text-2xl font-bold text-white">48</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Total Sessions</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Current Weight", value: "78 kg", diff: "-1.5kg", trend: "down", color: "text-emerald-400" },
                    { label: "Body Fat %", value: "15.5%", diff: "-1.3%", trend: "down", color: "text-emerald-400" },
                    { label: "Weekly Volume", value: "12,400", sub: "lbs lifted", diff: "+400", trend: "up", color: "text-blue-400" },
                    { label: "Est. 1RM Bench", value: "105 kg", diff: "+2.5kg", trend: "up", color: "text-indigo-400" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                                {stat.sub && <span className="text-sm text-slate-500 mb-1">{stat.sub}</span>}
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded bg-slate-950/50 ${stat.trend === 'down' && !stat.label.includes('Bench') ? 'text-emerald-400 border border-emerald-500/20' : stat.trend === 'up' && stat.label.includes('Bench') || stat.label.includes('Volume') ? 'text-blue-400 border border-blue-500/20' : 'text-slate-400'}`}>
                                    {stat.diff} {stat.trend === 'down' ? '↓' : '↑'}
                                </span>
                                <span className="text-xs text-slate-500">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weight & Body Fat Trends (Area Chart) */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-xl text-white">Body Composition</CardTitle>
                            <CardDescription className="text-slate-400">Weight & Body Fat % over time</CardDescription>
                        </div>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="w-[120px] bg-slate-950 border-slate-700 text-slate-300">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                <SelectItem value="3M">Last 3 Months</SelectItem>
                                <SelectItem value="6M">Last 6 Months</SelectItem>
                                <SelectItem value="1Y">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 2', 'dataMax + 2']} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 1', 'dataMax + 1']} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#3b82f6" strokeWidth={3} fill="url(#colorWeight)" />
                                    <Area yAxisId="right" type="monotone" dataKey="bodyFat" name="Body Fat (%)" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorFat)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Workout Volume (Bar Chart) */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                    <CardHeader className="pb-8">
                        <CardTitle className="text-xl text-white">Weekly Activity</CardTitle>
                        <CardDescription className="text-slate-400">Calories burned vs Active Hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Bar yAxisId="left" dataKey="calories" name="Calories (kcal)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar yAxisId="right" dataKey="hours" name="Active Time (hrs)" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: PRs & Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Personal Records */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                    <CardHeader className="flex flex-row justify-between items-center pb-4">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Personal Records
                        </CardTitle>
                        <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 text-sm">View All</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {personalRecords.map((pr) => (
                            <div key={pr.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800 transition-colors hover:border-slate-600">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-inner">
                                        {pr.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{pr.exercise}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{pr.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 text-sm font-black">
                                        {pr.value}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Milestones / Achievements */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <LineChart className="w-5 h-5 text-emerald-500" />
                            Journey Milestones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-8 mt-4">
                            {milestones.map((milestone, i) => (
                                <div key={milestone.id} className="relative">
                                    {/* Timeline dot */}
                                    <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${milestone.achieved ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`} />

                                    <div className={`p-4 rounded-xl border ${milestone.achieved ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/30 border-slate-800/50'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-bold ${milestone.achieved ? 'text-white' : 'text-slate-400'}`}>{milestone.title}</h4>
                                            {milestone.achieved ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Achieved</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-800 text-slate-500 border-slate-700 text-[10px]">Locked</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">{milestone.description}</p>
                                        <p className="text-xs text-slate-600 mt-2 font-mono">{milestone.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
