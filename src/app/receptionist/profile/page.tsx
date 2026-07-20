"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, CalendarDays, Clock, ShieldCheck, Settings, Bell, Key, LogOut, Camera, Activity, Award } from 'lucide-react';

export default function ReceptionistProfilePanel() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'settings'>('profile');

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header / Cover Area */}
            <div className="relative rounded-3xl overflow-hidden glass-card border-none bg-black/40 h-64 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                {/* Abstract Background Design */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-black/50 to-accent/20" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/30 rounded-full blur-[80px]" />

                {/* Profile Header Info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="relative group cursor-pointer">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-charcoal to-black border-2 border-primary/50 shadow-[0_0_20px_hsl(var(--gold)/0.3)] flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-primary" />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-black">
                            <ShieldCheck className="w-4 h-4 text-black" />
                        </div>
                    </div>

                    <div className="flex-1 pb-2">
                        <h1 className="text-4xl font-heading font-black text-white tracking-tight">Elena Rodriguez</h1>
                        <p className="text-primary font-medium flex items-center gap-2 mt-1">
                            <span className="uppercase tracking-widest text-xs font-bold">Front Desk Manager</span>
                        </p>
                    </div>

                    <div className="hidden md:flex gap-3 pb-2">
                        <button 
                            onClick={() => router.push('/receptionist/settings')}
                            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all backdrop-blur-md border border-white/10"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary/10">
                {[
                    { id: 'profile', label: 'Personal Information', icon: User },
                    { id: 'schedule', label: 'Shift Schedule', icon: CalendarDays },
                    { id: 'settings', label: 'Preferences', icon: Settings }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'settings') {
                                    router.push('/receptionist/settings');
                                } else {
                                    setActiveTab(tab.id as any);
                                }
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all ${isActive
                                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content (Changes based on tab) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Personal Details */}
                            <div className="glass-card rounded-3xl p-6 border border-primary/10">
                                <h3 className="text-lg font-heading font-bold text-foreground mb-6">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3" /> Email Address</p>
                                        <p className="font-medium text-foreground">elena.r@flexgym.com</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</p>
                                        <p className="font-medium text-foreground">+1 (555) 019-2834</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> Residential Address</p>
                                        <p className="font-medium text-foreground">1428 Elm Street, Apt 4B, Metro City, NY 10001</p>
                                    </div>
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div className="glass-card rounded-3xl p-6 border border-primary/10">
                                <h3 className="text-lg font-heading font-bold text-foreground mb-6">Employment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Employee ID</p>
                                        <p className="font-mono text-sm text-primary">NEX-EMP-8492</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date Joined</p>
                                        <p className="font-medium text-foreground">March 15, 2024</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Award className="w-3 h-3" /> Current Role Level</p>
                                        <div className="w-full bg-black/40 rounded-full h-2 mt-2">
                                            <div className="bg-primary h-2 rounded-full w-[70%] relative">
                                                <div className="absolute right-0 -top-1 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_var(--gold)]" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>Tier 2 (Senior Desk)</span>
                                            <span>Tier 3 (Shift Lead)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="glass-card rounded-3xl p-6 border border-primary/10">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-heading font-bold text-foreground">Next 7 Days</h3>
                                    <button className="text-sm text-primary hover:text-primary/80 transition-colors">Request Time Off</button>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { day: 'Monday', date: 'Oct 26', status: 'Morning Shift', time: '06:00 AM - 02:00 PM', type: 'primary' },
                                        { day: 'Tuesday', date: 'Oct 27', status: 'Morning Shift', time: '06:00 AM - 02:00 PM', type: 'primary' },
                                        { day: 'Wednesday', date: 'Oct 28', status: 'Day Off', time: '-', type: 'muted' },
                                        { day: 'Thursday', date: 'Oct 29', status: 'Evening Shift', time: '02:00 PM - 10:00 PM', type: 'accent' },
                                        { day: 'Friday', date: 'Oct 30', status: 'Evening Shift', time: '02:00 PM - 10:00 PM', type: 'accent' },
                                    ].map((shift, i) => (
                                        <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${shift.type === 'primary' ? 'bg-primary/5 border-primary/20' : shift.type === 'accent' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/5 border-white/5 opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${shift.type === 'primary' ? 'bg-primary/20 text-primary' : shift.type === 'accent' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-muted-foreground'}`}>
                                                    {shift.date.split(' ')[1]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{shift.day}</p>
                                                    <p className={`text-xs ${shift.type === 'primary' ? 'text-primary' : shift.type === 'accent' ? 'text-blue-400' : 'text-muted-foreground'}`}>{shift.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                {shift.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="glass-card rounded-3xl p-6 border border-primary/10 space-y-6">
                                <h3 className="text-lg font-heading font-bold text-foreground border-b border-white/10 pb-4">Application Preferences</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Push Notifications</span>
                                            <span className="text-sm text-muted-foreground mt-1">Receive alerts for new sign-ups and bookings.</span>
                                        </div>
                                        {/* Custom Toggle */}
                                        <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer border border-primary/50 shadow-[0_0_10px_hsl(var(--gold)/0.2)]">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground flex items-center gap-2"><Key className="w-4 h-4 text-slate-400" /> Two-Factor Authentication</span>
                                            <span className="text-sm text-muted-foreground mt-1">Enhance account security with an extra loop.</span>
                                        </div>
                                        <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">Enable 2FA</button>
                                    </div>

                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-semibold uppercase tracking-wide hover:bg-rose-500/20 transition-all w-full justify-center border border-rose-500/20">
                                        <LogOut className="w-4 h-4" />
                                        Sign Out Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar (Performance & Quick Links) */}
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-6 border border-primary/10">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Performance Status
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Shift Punctuality</span>
                                    <span className="text-emerald-400 font-bold">98%</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-1.5">
                                    <div className="bg-emerald-400 h-1.5 rounded-full w-[98%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Issue Resolution</span>
                                    <span className="text-primary font-bold">94%</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-1.5">
                                    <div className="bg-primary h-1.5 rounded-full shadow-[0_0_5px_var(--gold)] w-[94%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_var(--gold)]" />
                            System Notice
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your password is set to expire in 14 days. Please update it through your security preferences soon to ensure un-interrupted system access.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
