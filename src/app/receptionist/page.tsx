"use client";

import { Users, UserCheck, CalendarDays, ShoppingCart, Zap, Clock, Coffee, Play, Square, History } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShiftControl } from '@/hooks/useShiftControl';
import { ShiftStatusBadge } from '@/components/shared/ShiftStatusBadge';
import { ShiftControlPanel } from '@/components/shared/ShiftControlPanel';

const stats = [
    { label: "Check-ins Today", value: "142", icon: UserCheck, trend: "+12%" },
    { label: "Active Members", value: "856", icon: Users, trend: "+4%" },
    { label: "Classes Today", value: "12", icon: CalendarDays, trend: "0%" },
    { label: "Store Sales", value: "₹35,200", icon: ShoppingCart, trend: "+5%" },
];

// --- Types removed as they are now in the hook ---

export default function ReceptionistDashboard() {
    const {
        status,
        elapsedTime,
        activityLog,
        upcomingShifts,
        performanceScore,
        totalMinutesWorked,
        handleClockIn,
        handleClockOut,
        handleStartBreak,
        handleEndBreak
    } = useShiftControl('receptionist');

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground font-gradient">Front Desk Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Welcome back. Here's what's happening today at Flex Gym.</p>
                </div>
                <ShiftStatusBadge status={status} elapsedTime={elapsedTime} themeColor="primary" />
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-card rounded-2xl p-6 transition-all duration-300 hover:border-primary/30 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className={`font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                    {stat.trend}
                                </span>
                                <span className="ml-2 text-muted-foreground text-xs uppercase tracking-tighter">vs average</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Recent Check-ins */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-foreground">Recent Check-ins</h2>
                                <p className="text-sm text-muted-foreground">Real-time member activity feed</p>
                            </div>
                            <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-xl">View All</button>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {[
                                { name: 'Michael Chen', time: '10:42 AM', status: 'Active', plan: 'Premium' },
                                { name: 'Sarah Jenkins', time: '10:35 AM', status: 'Active', plan: 'Standard' },
                                { name: 'David Miller', time: '10:15 AM', status: 'Expiring Soon', plan: 'Basic' },
                                { name: 'Emma Wilson', time: '09:50 AM', status: 'Active', plan: 'Premium' }
                            ].map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-lg border border-primary/20 group-hover:scale-105 transition-transform">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{member.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{member.plan} Plan</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> {member.time}
                                        </p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mt-2 ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            {member.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Attendance & Actions */}
                <div className="space-y-8">
                    <ShiftControlPanel 
                        status={status}
                        elapsedTime={elapsedTime}
                        activityLog={activityLog}
                        upcomingShifts={upcomingShifts}
                        performanceScore={performanceScore}
                        totalMinutesWorked={totalMinutesWorked}
                        handleClockIn={handleClockIn}
                        handleClockOut={handleClockOut}
                        handleStartBreak={handleStartBreak}
                        handleEndBreak={handleEndBreak}
                        themeColor="primary"
                        userName="Receptionist"
                        role="receptionist"
                    />

                    {/* Quick Actions */}
                    <div className="glass-card rounded-3xl p-6">
                        <h2 className="text-xl font-heading font-black text-foreground mb-6 uppercase tracking-tight">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/40 text-primary transition-all group">
                                <UserCheck className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Check-in</span>
                            </button>
                            <Link href="/receptionist/members/new" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-foreground transition-all group">
                                <Users className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Enroll</span>
                            </Link>
                            <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-foreground transition-all group">
                                <ShoppingCart className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">POS Shop</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-foreground transition-all group">
                                <CalendarDays className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Schedule</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Monitor */}
                    <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 border">
                        <h3 className="font-black text-primary mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                            <Zap className="w-4 h-4 fill-current" /> System Status
                        </h3>
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">Turnstiles and biometric scanners are active. Network latency at <span className="text-emerald-500">12ms</span>. All systems optimal.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
