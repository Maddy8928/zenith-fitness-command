'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Target, Activity, CheckCircle2, Ruler, Weight, Dumbbell, UserCircle, Settings2, Snowflake, History, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useMembershipFreeze } from '@/lib/membership-freeze-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from '@/components/ui/separator';

// --- MOCK DATA ---
const INITIAL_PROFILE = {
    firstName: 'Alex',
    lastName: 'Reynolds',
    email: 'alex.reynolds@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fitness Ave, Apt 4B',
    dob: '1992-05-15',
    gender: 'Male',
    height: '180',
    weight: '78',
    goal: 'Hypertrophy',
    notifications: {
        email: true,
        sms: false,
        marketing: true
    }
};

export default function MemberProfilePage() {
    const [profile, setProfile] = useState(INITIAL_PROFILE);
    const { activeFreeze, freezeHistory = [] } = useMembershipFreeze(1);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">

            {/* Header / Avatar Profile Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-r from-rose-900/40 via-red-900/40 to-slate-900/40 p-8 md:p-10 rounded-3xl border border-rose-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="group relative">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-slate-900 shadow-2xl transition-transform group-hover:scale-[1.02]">
                            {/* Realistic placeholder image */}
                            <AvatarImage src="https://i.pravatar.cc/300?img=11" alt="Profile avatar" className="object-cover" />
                            <AvatarFallback className="bg-slate-800 text-slate-300 text-4xl">AR</AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-2 right-2 p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl transform transition-transform hover:scale-110 border-2 border-slate-900">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 flex-1 text-center md:text-left pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit mb-3">
                        <UserCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-rose-400 tracking-wider uppercase">Member Profile</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                        {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center justify-center md:justify-start gap-2 mb-4">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active Member
                        </Badge>
                        <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                            Joined: Jan 2026
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Personal info & Settings */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Personal Information */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                        <CardHeader>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-rose-400" />
                                Personal Information
                            </CardTitle>
                            <CardDescription className="text-slate-400">Update your basic profile details and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">First Name</Label>
                                    <Input
                                        defaultValue={profile.firstName}
                                        className="bg-slate-950/50 border-slate-800 focus-visible:ring-rose-500 text-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Last Name</Label>
                                    <Input
                                        defaultValue={profile.lastName}
                                        className="bg-slate-950/50 border-slate-800 focus-visible:ring-rose-500 text-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <Input
                                            defaultValue={profile.email}
                                            type="email"
                                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-rose-500 text-slate-200 pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <Input
                                            defaultValue={profile.phone}
                                            type="tel"
                                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-rose-500 text-slate-200 pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-slate-300">Residential Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <Input
                                            defaultValue={profile.address}
                                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-rose-500 text-slate-200 pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                        <CardHeader>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-blue-400" />
                                Communication Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/30 border border-slate-800">
                                <div className="space-y-0.5">
                                    <Label className="text-white text-base">Email Notifications</Label>
                                    <p className="text-sm text-slate-400">Receive schedule updates and trainer messages via email.</p>
                                </div>
                                <Switch defaultChecked={profile.notifications.email} className="data-[state=checked]:bg-rose-500" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/30 border border-slate-800">
                                <div className="space-y-0.5">
                                    <Label className="text-white text-base">SMS Alerts</Label>
                                    <p className="text-sm text-slate-400">Get text messages for class reminders (Requires valid phone).</p>
                                </div>
                                <Switch defaultChecked={profile.notifications.sms} className="data-[state=checked]:bg-rose-500" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/30 border border-slate-800">
                                <div className="space-y-0.5">
                                    <Label className="text-white text-base">Marketing & Offers</Label>
                                    <p className="text-sm text-slate-400">Receive discounts on supplements and PT sessions.</p>
                                </div>
                                <Switch defaultChecked={profile.notifications.marketing} className="data-[state=checked]:bg-rose-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Physical Attributes & Save */}
                <div className="space-y-8">
                    {/* Physical Attributes */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                        <CardHeader>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                Physical Attributes
                            </CardTitle>
                            <CardDescription className="text-slate-400">Used by trainers to tailor your programs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Date of Birth</Label>
                                <Input
                                    defaultValue={profile.dob}
                                    type="date"
                                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500 text-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Height (cm)</Label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <Input
                                            defaultValue={profile.height}
                                            type="number"
                                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500 text-slate-200 pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Weight (kg)</Label>
                                    <div className="relative">
                                        <Weight className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <Input
                                            defaultValue={profile.weight}
                                            type="number"
                                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500 text-slate-200 pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Primary Fitness Goal</Label>
                                <Select defaultValue={profile.goal}>
                                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-emerald-500">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                            <SelectValue placeholder="Select Goal" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                                        <SelectItem value="Hypertrophy">Muscle Gain (Hypertrophy)</SelectItem>
                                        <SelectItem value="Strength">Strength & Power</SelectItem>
                                        <SelectItem value="Endurance">Cardio Endurance</SelectItem>
                                        <SelectItem value="Maintenance">General Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Card */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/60 sticky top-24 shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg text-white">Save Changes</CardTitle>
                            <CardDescription className="text-slate-400">Ensure all your information is up to date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20 h-12 rounded-xl transition-all"
                            >
                                {isSaving ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-5 h-5" />
                                        Update Profile
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Membership Status & Freeze History Card */}
                    <Card className="bg-slate-900/60 border-slate-800/60 shadow-2xl overflow-hidden">
                        <CardHeader className="pb-3 border-b border-slate-800/60 bg-slate-900/40">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base text-white flex items-center gap-2">
                                    <Snowflake className="w-4 h-4 text-cyan-400" />
                                    Membership & Freeze History
                                </CardTitle>
                                <Badge className={activeFreeze ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}>
                                    {activeFreeze ? 'Frozen' : 'Active'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3 text-xs">
                            {activeFreeze ? (
                                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                                    <div className="flex justify-between font-bold text-white">
                                        <span>Current Freeze:</span>
                                        <span className="text-cyan-300">{activeFreeze.totalDays} Days</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Period:</span>
                                        <span>{activeFreeze.startDate} — {activeFreeze.endDate}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Extended Expiry:</span>
                                        <span className="text-emerald-400 font-semibold">{activeFreeze.newExpiryDate}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 text-slate-400">
                                    No active freeze. Your gym membership is currently active.
                                </div>
                            )}

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                                    <History className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Past Freeze Records</span>
                                </div>
                                {freezeHistory.length === 0 ? (
                                    <p className="text-slate-500 text-[11px] italic">No previous freeze history recorded.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {freezeHistory.map((rec) => (
                                            <div key={rec.id} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-[11px]">
                                                <div>
                                                    <div className="font-bold text-white">{rec.startDate} to {rec.endDate}</div>
                                                    <div className="text-slate-400">{rec.reason} · {rec.totalDays} Days</div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    rec.status === 'Active' ? 'bg-cyan-500/20 text-cyan-300' :
                                                    rec.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-300' :
                                                    'bg-slate-500/20 text-slate-300'
                                                }`}>
                                                    {rec.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
