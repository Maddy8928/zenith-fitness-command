"use client";

import React, { useState } from 'react';
import {
    User, Mail, Phone, Camera, Lock, Eye, EyeOff, Bell, BellOff,
    Sun, Moon, Monitor, Globe, Calendar, LayoutDashboard, ShieldCheck,
    Smartphone, LogOut, Activity, Clock, Users, CreditCard,
    CheckCircle2, AlertCircle, ChevronRight, Save, Trash2,
    ClipboardList, ArrowUpRight, Dumbbell, RefreshCw, Shield, Key,
    UserCheck, Package
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────
type SettingsTab =
    | 'profile'
    | 'security'
    | 'notifications'
    | 'appearance'
    | 'regional'
    | 'dashboard'
    | 'sessions'
    | 'activity';

interface ActivityEntry {
    id: string;
    action: string;
    detail: string;
    timestamp: string;
    category: 'member' | 'payment' | 'checkin' | 'transfer' | 'class' | 'system';
    status: 'success' | 'info' | 'warning';
}

// ── Mock Activity Log Data ─────────────────────────────────────────────────────
const activityLog: ActivityEntry[] = [
    { id: 'a1', action: 'New Member Registered', detail: 'Enrolled Lucas Robinson on Standard Plan (₹7,499)', timestamp: '2026-06-14 17:05', category: 'member', status: 'success' },
    { id: 'a2', action: 'Payment Collected', detail: 'Cash payment of ₹4,500 from Priya Sharma for PT sessions', timestamp: '2026-06-14 16:48', category: 'payment', status: 'success' },
    { id: 'a3', action: 'Check-In Processed', detail: 'Michael Chen checked in at Gate A — 10:42 AM', timestamp: '2026-06-14 10:42', category: 'checkin', status: 'info' },
    { id: 'a4', action: 'Membership Transfer Approved', detail: 'Premium plan transferred from James T. to Olivia Davis', timestamp: '2026-06-14 09:30', category: 'transfer', status: 'success' },
    { id: 'a5', action: 'Class Participant Added', detail: 'Emma Wilson added to HIIT Power — Tuesday 6 PM', timestamp: '2026-06-13 18:15', category: 'class', status: 'success' },
    { id: 'a6', action: 'Payment Failed', detail: 'Credit card declined for David Miller — Basic Plan renewal', timestamp: '2026-06-13 15:22', category: 'payment', status: 'warning' },
    { id: 'a7', action: 'New Member Registered', detail: 'Enrolled Aria Montgomery on Premium Plan (₹12,499)', timestamp: '2026-06-13 11:05', category: 'member', status: 'success' },
    { id: 'a8', action: 'Check-In Processed', detail: 'Emma Wilson checked in at Gate B — 09:15 AM', timestamp: '2026-06-13 09:15', category: 'checkin', status: 'info' },
    { id: 'a9', action: 'Membership Transfer Rejected', detail: 'Transfer request from Sophia Martinez rejected — reason: incomplete docs', timestamp: '2026-06-12 14:40', category: 'transfer', status: 'warning' },
    { id: 'a10', action: 'Export Generated', detail: 'Payment records exported for Jun 1–14 (14 records)', timestamp: '2026-06-12 10:00', category: 'system', status: 'info' },
    { id: 'a11', action: 'Class Participant Removed', detail: 'William Garcia removed from Yoga Flow — Thursday 7 AM', timestamp: '2026-06-11 20:30', category: 'class', status: 'info' },
    { id: 'a12', action: 'Payment Collected', detail: 'UPI payment of ₹12,499 from Ethan Hunt for Premium renewal', timestamp: '2026-06-11 16:10', category: 'payment', status: 'success' },
];

const activeSessions = [
    { id: 's1', device: 'Chrome on Windows 11', location: 'Mumbai, IN', ip: '103.48.xx.xx', lastActive: 'Now', current: true },
    { id: 's2', device: 'Safari on iPhone 14 Pro', location: 'Mumbai, IN', ip: '103.48.xx.xx', lastActive: '2 hours ago', current: false },
    { id: 's3', device: 'Firefox on MacBook Pro', location: 'Pune, IN', ip: '49.206.xx.xx', lastActive: 'Yesterday, 9:41 PM', current: false },
];

// ── Toggle Component ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${
                checked ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10'
            }`}
        >
            <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${
                checked ? 'bg-primary right-1' : 'bg-slate-500 left-1'
            }`} />
        </button>
    );
}

// ── Category Icon & Color Map ──────────────────────────────────────────────────
const categoryMeta = {
    member:   { icon: Users,        color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'    },
    payment:  { icon: CreditCard,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    checkin:  { icon: UserCheck,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
    transfer: { icon: ArrowUpRight, color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
    class:    { icon: Dumbbell,     color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20'  },
    system:   { icon: Package,      color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20'   },
};

const statusDot = {
    success: 'bg-emerald-400',
    info:    'bg-blue-400',
    warning: 'bg-amber-400',
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReceptionistSettingsPage() {

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    // Profile state
    const [profileForm, setProfileForm] = useState({ firstName: 'Elena', lastName: 'Rodriguez', email: 'elena.r@nexusgym.com', phone: '+91 98765 43210' });
    const [profileSaving, setProfileSaving] = useState(false);

    // Security state
    const [showCurrent, setShowCurrent]     = useState(false);
    const [showNew, setShowNew]             = useState(false);
    const [showConfirm, setShowConfirm]     = useState(false);
    const [pwForm, setPwForm]               = useState({ current: '', next: '', confirm: '' });
    const [twoFA, setTwoFA]                 = useState(false);

    // Notifications
    const [notifs, setNotifs] = useState({
        memberSignup: true, paymentSuccess: true, paymentFailed: true,
        transferRequest: true, classUpdates: false, systemAlerts: true,
        emailDigest: false, smsAlerts: false,
    });

    // Appearance
    const [theme, setTheme]             = useState<'light' | 'dark' | 'system'>('dark');
    const [accentColor, setAccentColor] = useState<'gold' | 'cyan' | 'violet' | 'rose'>('gold');
    const [compactMode, setCompactMode] = useState(false);
    const [animations, setAnimations]   = useState(true);

    // Regional
    const [language, setLanguage]     = useState('en-IN');
    const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
    const [timeFormat, setTimeFormat] = useState('12h');
    const [timezone, setTimezone]     = useState('Asia/Kolkata');
    const [currency, setCurrency]     = useState('INR');

    // Dashboard prefs
    const [dashPrefs, setDashPrefs] = useState({
        showRevCard: true, showCheckins: true, showPendingTransfers: true,
        showClassOverview: true, showRecentPayments: true, defaultTab: 'overview',
    });

    // Activity filter
    const [activityFilter, setActivityFilter] = useState<'all' | ActivityEntry['category']>('all');

    const filteredLog = activityLog.filter(a => activityFilter === 'all' || a.category === activityFilter);

    // Handlers
    const handleSaveProfile = async () => {
        setProfileSaving(true);
        await new Promise(r => setTimeout(r, 900));
        setProfileSaving(false);
        toast.success('Profile updated successfully!');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.next !== pwForm.confirm) { toast.error('New passwords do not match.'); return; }
        if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
        toast.success('Password changed successfully!');
        setPwForm({ current: '', next: '', confirm: '' });
    };

    const handleRevokeSession = (id: string) => {
        toast.success('Session revoked.');
        console.log('Revoke:', id);
    };

    // ── Sidebar tabs ────────────────────────────────────────────────────────────
    const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
        { id: 'profile',       label: 'Profile',              icon: User },
        { id: 'security',      label: 'Password & Security',  icon: Lock },
        { id: 'notifications', label: 'Notifications',        icon: Bell },
        { id: 'appearance',    label: 'Appearance',           icon: Sun },
        { id: 'regional',      label: 'Language & Region',    icon: Globe },
        { id: 'dashboard',     label: 'Dashboard Prefs',      icon: LayoutDashboard },
        { id: 'sessions',      label: 'Sessions',             icon: Smartphone },
        { id: 'activity',      label: 'Activity Log',         icon: Activity },
    ];

    // ── Input class helper ──────────────────────────────────────────────────────
    const input = "w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors";
    const label = "text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block";
    const sectionCard = "glass-card rounded-2xl p-6 border border-primary/10 space-y-5";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account, preferences, and security options.</p>
            </div>

            {/* ── Layout: Sidebar + Content ────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Sidebar Nav */}
                <aside className="lg:w-56 flex-shrink-0">
                    <div className="glass-card rounded-2xl p-2 border border-primary/10 space-y-0.5 lg:sticky lg:top-4">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                                        active
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{tab.label}</span>
                                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">

                    {/* ── PROFILE ─────────────────────────────────────────────── */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            {/* Avatar */}
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide">Profile Photo</h3>
                                <div className="flex items-center gap-5">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-black border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                                            <User className="w-9 h-9 text-primary" />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                <Camera className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 rounded-full p-1 border-2 border-slate-900">
                                            <ShieldCheck className="w-3 h-3 text-black" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-white">Elena Rodriguez</p>
                                        <p className="text-xs text-slate-400">Front Desk Manager · NEX-EMP-8492</p>
                                        <label className="cursor-pointer px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition-colors inline-block">
                                            <input type="file" accept="image/*" className="hidden" />
                                            Upload Photo
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide">Personal Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>First Name</label>
                                        <input className={input} value={profileForm.firstName}
                                            onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={label}>Last Name</label>
                                        <input className={input} value={profileForm.lastName}
                                            onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={label}><Mail className="w-3 h-3 inline mr-1" />Email Address</label>
                                        <input type="email" className={input} value={profileForm.email}
                                            onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={label}><Phone className="w-3 h-3 inline mr-1" />Mobile Number</label>
                                        <input type="tel" className={input} value={profileForm.phone}
                                            onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={profileSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
                                    >
                                        {profileSaving
                                            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                                            : <><Save className="w-3.5 h-3.5" /> Save Changes</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SECURITY ────────────────────────────────────────────── */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">

                            {/* Change Password */}
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <Key className="w-4 h-4 text-primary" /> Change Password
                                </h3>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {[
                                        { field: 'current', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                                        { field: 'next',    label: 'New Password',     show: showNew,     toggle: () => setShowNew(p => !p) },
                                        { field: 'confirm', label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
                                    ].map(({ field, label: lbl, show, toggle }) => (
                                        <div key={field}>
                                            <label className={label}>{lbl}</label>
                                            <div className="relative">
                                                <input
                                                    type={show ? 'text' : 'password'}
                                                    required
                                                    className={`${input} pr-10`}
                                                    placeholder="••••••••"
                                                    value={pwForm[field as keyof typeof pwForm]}
                                                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                                                />
                                                <button type="button" onClick={toggle}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Strength hint */}
                                    {pwForm.next && (
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                {[0, 1, 2, 3].map(i => (
                                                    <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                                                        pwForm.next.length > i * 3 + 3
                                                            ? i < 1 ? 'bg-rose-500' : i < 2 ? 'bg-amber-500' : i < 3 ? 'bg-cyan-400' : 'bg-emerald-400'
                                                            : 'bg-white/10'
                                                    }`} />
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-400">
                                                {pwForm.next.length < 4 ? 'Too short' : pwForm.next.length < 7 ? 'Fair' : pwForm.next.length < 10 ? 'Good' : 'Strong'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex justify-end pt-1">
                                        <button type="submit"
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors">
                                            <Lock className="w-3.5 h-3.5" /> Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* 2FA */}
                            <div className={sectionCard}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                                            <Shield className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security with an authenticator app.</p>
                                        </div>
                                    </div>
                                    <Toggle checked={twoFA} onChange={setTwoFA} />
                                </div>
                                {twoFA && (
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 mt-2">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                        2FA is enabled. Use your authenticator app to generate codes on login.
                                    </div>
                                )}
                            </div>

                            {/* Login & Security Info */}
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" /> Login & Security
                                </h3>
                                {[
                                    { label: 'Last Successful Login', value: 'Today, 05:15 PM · Mumbai, IN', color: 'text-emerald-400' },
                                    { label: 'Last Password Change', value: '23 May 2026', color: 'text-slate-300' },
                                    { label: 'Account Created', value: '15 March 2024', color: 'text-slate-300' },
                                    { label: 'Failed Login Attempts (30d)', value: '0', color: 'text-emerald-400' },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-xs text-slate-400">{row.label}</span>
                                        <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS ───────────────────────────────────────── */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" /> In-App Notifications
                                </h3>
                                <div className="space-y-1">
                                    {([
                                        { key: 'memberSignup',     label: 'New Member Registrations',     desc: 'Alert when a new member is enrolled' },
                                        { key: 'paymentSuccess',   label: 'Successful Payments',          desc: 'Notify on every successful payment' },
                                        { key: 'paymentFailed',    label: 'Failed Payments',              desc: 'Alert on payment failures to follow up' },
                                        { key: 'transferRequest',  label: 'Membership Transfer Requests', desc: 'Pending transfers awaiting your review' },
                                        { key: 'classUpdates',     label: 'Class Schedule Changes',       desc: 'Instructor or time slot updates' },
                                        { key: 'systemAlerts',     label: 'System Alerts',                desc: 'Critical system notices from admin' },
                                    ] as { key: keyof typeof notifs; label: string; desc: string }[]).map(({ key, label: lbl, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{lbl}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                                            </div>
                                            <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-cyan-400" /> External Alerts
                                </h3>
                                <div className="space-y-1">
                                    {([
                                        { key: 'emailDigest', label: 'Daily Email Digest',  desc: 'Receive end-of-day summary via email', icon: Mail },
                                        { key: 'smsAlerts',   label: 'SMS Alerts',          desc: 'Critical alerts via SMS (uses quota)', icon: Smartphone },
                                    ] as { key: keyof typeof notifs; label: string; desc: string; icon: React.ElementType }[]).map(({ key, label: lbl, desc, icon: Icon }) => (
                                        <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                                            <div className="flex items-start gap-2">
                                                <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{lbl}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                                                </div>
                                            </div>
                                            <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => toast.success('Notification preferences saved!')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors">
                                    <Save className="w-3.5 h-3.5" /> Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── APPEARANCE ──────────────────────────────────────────── */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide">Theme Mode</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {([
                                        { id: 'light',  label: 'Light',  icon: Sun },
                                        { id: 'dark',   label: 'Dark',   icon: Moon },
                                        { id: 'system', label: 'System', icon: Monitor },
                                    ] as { id: typeof theme; label: string; icon: React.ElementType }[]).map(({ id, label: lbl, icon: Icon }) => (
                                        <button key={id} onClick={() => setTheme(id)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                                                theme === id
                                                    ? 'bg-primary/10 border-primary/40 text-primary'
                                                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/15'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-wide">{lbl}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide">Accent Color</h3>
                                <div className="flex gap-3">
                                    {([
                                        { id: 'gold',   color: '#F4C542', label: 'Gold'   },
                                        { id: 'cyan',   color: '#22d3ee', label: 'Cyan'   },
                                        { id: 'violet', color: '#a78bfa', label: 'Violet' },
                                        { id: 'rose',   color: '#fb7185', label: 'Rose'   },
                                    ] as { id: typeof accentColor; color: string; label: string }[]).map(({ id, color, label: lbl }) => (
                                        <button key={id} onClick={() => setAccentColor(id)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                                                accentColor === id ? 'border-white/30 bg-white/5' : 'border-transparent hover:bg-white/5'
                                            }`}>
                                            <div className="w-7 h-7 rounded-full border-2 border-white/20"
                                                style={{ backgroundColor: color }} />
                                            <span className="text-[10px] font-bold text-slate-400">{lbl}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide">Interface Options</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Compact Mode</p>
                                            <p className="text-[11px] text-slate-400">Reduce spacing for a denser layout</p>
                                        </div>
                                        <Toggle checked={compactMode} onChange={setCompactMode} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">UI Animations</p>
                                            <p className="text-[11px] text-slate-400">Smooth transitions and micro-animations</p>
                                        </div>
                                        <Toggle checked={animations} onChange={setAnimations} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => toast.success('Appearance settings saved!')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors">
                                    <Save className="w-3.5 h-3.5" /> Apply Settings
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── REGIONAL ────────────────────────────────────────────── */}
                    {activeTab === 'regional' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary" /> Language & Region
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>Language</label>
                                        <select className={input} value={language} onChange={e => setLanguage(e.target.value)}>
                                            <option value="en-IN">English (India)</option>
                                            <option value="en-US">English (US)</option>
                                            <option value="hi-IN">Hindi</option>
                                            <option value="mr-IN">Marathi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={label}>Currency</label>
                                        <select className={input} value={currency} onChange={e => setCurrency(e.target.value)}>
                                            <option value="INR">₹ Indian Rupee (INR)</option>
                                            <option value="USD">$ US Dollar (USD)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" /> Date & Time Format
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>Date Format</label>
                                        <select className={input} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                                            <option value="DD MMM YYYY">14 Jun 2026</option>
                                            <option value="DD/MM/YYYY">14/06/2026</option>
                                            <option value="MM/DD/YYYY">06/14/2026</option>
                                            <option value="YYYY-MM-DD">2026-06-14</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={label}>Time Format</label>
                                        <div className="flex gap-2">
                                            {[{ id: '12h', label: '12-hour (05:15 PM)' }, { id: '24h', label: '24-hour (17:15)' }].map(f => (
                                                <button key={f.id} onClick={() => setTimeFormat(f.id)}
                                                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                                        timeFormat === f.id
                                                            ? 'bg-primary/10 border-primary/40 text-primary'
                                                            : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/15'
                                                    }`}>
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={label}>Timezone</label>
                                        <select className={input} value={timezone} onChange={e => setTimezone(e.target.value)}>
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => toast.success('Regional settings saved!')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors">
                                    <Save className="w-3.5 h-3.5" /> Save
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── DASHBOARD PREFS ──────────────────────────────────────── */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4 text-primary" /> Visible Dashboard Widgets
                                </h3>
                                <div className="space-y-1">
                                    {([
                                        { key: 'showRevCard',           label: "Today's Revenue Card",         desc: 'Show revenue summary on the main dashboard' },
                                        { key: 'showCheckins',          label: 'Live Check-In Counter',         desc: 'Real-time check-in activity widget' },
                                        { key: 'showPendingTransfers',  label: 'Pending Transfers Badge',       desc: 'Badge on Members tab for pending transfers' },
                                        { key: 'showClassOverview',     label: 'Class Overview Widget',         desc: 'Upcoming classes quick overview' },
                                        { key: 'showRecentPayments',    label: 'Recent Payments Table',         desc: 'Last 5 transactions on dashboard' },
                                    ] as { key: keyof typeof dashPrefs; label: string; desc: string }[]).map(({ key, label: lbl, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{lbl}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                                            </div>
                                            <Toggle
                                                checked={dashPrefs[key] as boolean}
                                                onChange={v => setDashPrefs(p => ({ ...p, [key]: v }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={sectionCard}>
                                <h3 className="text-base font-black text-white uppercase tracking-wide">Default Landing Tab</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'overview', label: 'Overview' },
                                        { id: 'payments', label: 'Payments' },
                                        { id: 'members',  label: 'Members'  },
                                        { id: 'classes',  label: 'Classes'  },
                                        { id: 'checkins', label: 'Check-Ins'},
                                    ].map(opt => (
                                        <button key={opt.id}
                                            onClick={() => setDashPrefs(p => ({ ...p, defaultTab: opt.id }))}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                                dashPrefs.defaultTab === opt.id
                                                    ? 'bg-primary/10 border-primary/40 text-primary'
                                                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/15'
                                            }`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => toast.success('Dashboard preferences saved!')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors">
                                    <Save className="w-3.5 h-3.5" /> Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SESSIONS ─────────────────────────────────────────────── */}
                    {activeTab === 'sessions' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className={sectionCard}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-primary" /> Active Sessions
                                    </h3>
                                    <button
                                        onClick={() => toast.success('Logged out from all other devices.')}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-colors">
                                        <LogOut className="w-3.5 h-3.5" /> Logout All Devices
                                    </button>
                                </div>
                                <div className="space-y-3 mt-2">
                                    {activeSessions.map(session => (
                                        <div key={session.id}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                session.current
                                                    ? 'bg-primary/5 border-primary/20'
                                                    : 'bg-black/20 border-white/5 hover:border-white/10'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${session.current ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/5'}`}>
                                                    <Smartphone className={`w-4 h-4 ${session.current ? 'text-primary' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white">{session.device}</p>
                                                        {session.current && (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {session.location} · {session.ip} · {session.lastActive}
                                                    </p>
                                                </div>
                                            </div>
                                            {!session.current && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black hover:bg-rose-500/20 transition-colors">
                                                    <Trash2 className="w-3 h-3" /> Revoke
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={`${sectionCard} bg-rose-950/10 border-rose-500/15`}>
                                <h3 className="text-sm font-black text-rose-400 uppercase tracking-wide flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Danger Zone
                                </h3>
                                <p className="text-xs text-slate-400">
                                    This will immediately sign you out from all devices including this one and invalidate all active tokens.
                                </p>
                                <button
                                    onClick={() => toast.error('You have been signed out from all devices.')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 text-xs font-black uppercase tracking-wider hover:bg-rose-500/25 transition-colors">
                                    <LogOut className="w-3.5 h-3.5" /> Sign Out Everywhere
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── ACTIVITY LOG ─────────────────────────────────────────── */}
                    {activeTab === 'activity' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
                            {/* Filter pills */}
                            <div className="flex flex-wrap gap-2">
                                {([
                                    { id: 'all',      label: 'All Activity'  },
                                    { id: 'member',   label: 'Members'       },
                                    { id: 'payment',  label: 'Payments'      },
                                    { id: 'checkin',  label: 'Check-Ins'     },
                                    { id: 'transfer', label: 'Transfers'     },
                                    { id: 'class',    label: 'Classes'       },
                                    { id: 'system',   label: 'System'        },
                                ] as { id: typeof activityFilter; label: string }[]).map(f => (
                                    <button key={f.id}
                                        onClick={() => setActivityFilter(f.id)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            activityFilter === f.id
                                                ? 'bg-primary/15 text-primary border border-primary/30'
                                                : 'bg-white/5 text-slate-400 border border-transparent hover:border-white/10 hover:text-white'
                                        }`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Log entries */}
                            <div className="glass-card rounded-2xl border border-primary/10 divide-y divide-white/5 overflow-hidden">
                                {filteredLog.length === 0 && (
                                    <div className="p-10 text-center text-slate-500">No activity found for this filter.</div>
                                )}
                                {filteredLog.map(entry => {
                                    const meta = categoryMeta[entry.category];
                                    const Icon = meta.icon;
                                    return (
                                        <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                                            {/* Category icon */}
                                            <div className={`p-2 rounded-xl ${meta.bg} border ${meta.border} flex-shrink-0 mt-0.5`}>
                                                <Icon className={`w-4 h-4 ${meta.color}`} />
                                            </div>
                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-white leading-tight">{entry.action}</p>
                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[entry.status]}`} />
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{entry.detail}</p>
                                            </div>
                                            {/* Timestamp */}
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0 font-mono">
                                                <Clock className="w-3 h-3" />
                                                {entry.timestamp}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary footer */}
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span className="flex items-center gap-1.5">
                                    <ClipboardList className="w-3.5 h-3.5" />
                                    Showing {filteredLog.length} of {activityLog.length} entries
                                </span>
                                <button
                                    onClick={() => toast.success('Activity log exported!')}
                                    className="flex items-center gap-1 text-primary hover:text-primary/80 font-bold uppercase tracking-wider transition-colors">
                                    Export Log
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
