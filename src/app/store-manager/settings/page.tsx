'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Store, User, Bell, Shield, Palette,
    Save, Camera, Mail, Phone, MapPin, Globe, Clock,
    Package, AlertTriangle, ToggleLeft, ToggleRight,
    Eye, EyeOff, KeyRound, Smartphone, ChevronRight,
    Sun, Moon, Monitor, Check, Zap, Truck, IndianRupee,
    BellRing, BellOff, Volume2, VolumeX, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'store' | 'account' | 'notifications' | 'inventory' | 'appearance' | 'security';

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'store',         label: 'Store Profile',   icon: Store },
    { id: 'account',       label: 'My Account',      icon: User },
    { id: 'notifications', label: 'Notifications',   icon: Bell,   badge: 'NEW' },
    { id: 'inventory',     label: 'Inventory Rules',  icon: Package },
    { id: 'appearance',    label: 'Appearance',       icon: Palette },
    { id: 'security',      label: 'Security',         icon: Shield },
];

// ─── Shared Field Components ──────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600";

function Input({ placeholder, defaultValue, type = 'text' }: { placeholder?: string; defaultValue?: string; type?: string }) {
    return <input type={type} defaultValue={defaultValue} placeholder={placeholder} className={inputCls} />;
}

function Select({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
    return (
        <select defaultValue={defaultValue} className={inputCls + ' appearance-none'}>
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
    );
}

function Toggle({ label, desc, defaultOn = false, color = 'indigo' }: { label: string; desc: string; defaultOn?: boolean; color?: string }) {
    const [on, setOn] = useState(defaultOn);
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <button onClick={() => setOn(v => !v)} className="ml-4 shrink-0">
                {on
                    ? <ToggleRight className={`w-8 h-8 text-${color}-400`} />
                    : <ToggleLeft className="w-8 h-8 text-slate-600" />
                }
            </button>
        </div>
    );
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
            </div>
            {children}
        </div>
    );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function StoreProfile() {
    return (
        <div className="space-y-6">
            <SectionCard title="Store Identity" desc="Public information displayed on receipts and customer-facing screens.">
                <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                            NS
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                            <Camera className="w-3 h-3 text-slate-400" />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Store Logo</p>
                        <p className="text-xs text-slate-500 mt-1">PNG or JPG · Max 2MB · Recommended 200×200px</p>
                        <button className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Upload new logo</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Store Name"><Input defaultValue="NexusStore" /></Field>
                    <Field label="GST Number"><Input defaultValue="27AAAAA0000A1Z5" /></Field>
                    <Field label="Contact Email"><Input type="email" defaultValue="store@nexusgym.com" /></Field>
                    <Field label="Phone Number"><Input type="tel" defaultValue="+91 98765 43210" /></Field>
                </div>
            </SectionCard>

            <SectionCard title="Location & Operations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="City"><Input defaultValue="Mumbai" /></Field>
                    <Field label="State"><Input defaultValue="Maharashtra" /></Field>
                    <Field label="Time Zone"><Select options={['IST (UTC+5:30)', 'UTC', 'EST (UTC-5)', 'PST (UTC-8)']} defaultValue="IST (UTC+5:30)" /></Field>
                    <Field label="Currency"><Select options={['INR (₹)', 'USD ($)', 'EUR (€)']} defaultValue="INR (₹)" /></Field>
                </div>
                <Field label="Full Address">
                    <textarea rows={3} defaultValue={"Ground Floor, Nexus Building\nBandra West, Mumbai - 400050"} className={inputCls + ' resize-none'} />
                </Field>
            </SectionCard>
        </div>
    );
}

function MyAccount() {
    const [showPass, setShowPass] = useState(false);
    return (
        <div className="space-y-6">
            <SectionCard title="Personal Details">
                <div className="flex items-center gap-5 pb-6 border-b border-white/5">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl font-black text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0">
                        SM
                    </div>
                    <div>
                        <p className="font-black text-white">Store Manager</p>
                        <p className="text-xs text-slate-500 mt-1">store.manager@nexusgym.com</p>
                        <Badge className="mt-2 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">STORE_MANAGER</Badge>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Full Name"><Input defaultValue="Store Manager" /></Field>
                    <Field label="Display Name"><Input defaultValue="SM" /></Field>
                    <Field label="Email Address"><Input type="email" defaultValue="store.manager@nexusgym.com" /></Field>
                    <Field label="Phone"><Input type="tel" defaultValue="+91 98765 43210" /></Field>
                </div>
            </SectionCard>

            <SectionCard title="Change Password">
                <div className="space-y-4">
                    <Field label="Current Password">
                        <div className="relative">
                            <input type={showPass ? 'text' : 'password'} placeholder="Enter current password" className={inputCls + ' pr-12'} />
                            <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="New Password"><input type="password" placeholder="Min 8 characters" className={inputCls} /></Field>
                        <Field label="Confirm Password"><input type="password" placeholder="Repeat new password" className={inputCls} /></Field>
                    </div>
                    <Button className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-black uppercase tracking-widest">
                        <KeyRound className="w-3 h-3 mr-2" /> Update Password
                    </Button>
                </div>
            </SectionCard>
        </div>
    );
}

function NotificationsPanel() {
    return (
        <div className="space-y-6">
            <SectionCard title="Notification Channels" desc="Choose how you receive store alerts.">
                <Toggle label="In-App Notifications" desc="Show alerts inside the Store Command panel." defaultOn color="indigo" />
                <Toggle label="Email Alerts" desc="Receive critical inventory and billing alerts via email." defaultOn color="indigo" />
                <Toggle label="Sound Effects" desc="Play audio cues for high-priority events." color="indigo" />
                <Toggle label="Browser Push Notifications" desc="Allow push notifications even when tab is closed." color="indigo" />
            </SectionCard>

            <SectionCard title="Alert Categories" desc="Choose which events trigger notifications.">
                <Toggle label="📦 Inventory Alerts" desc="Low stock, critical stock, and expiry warnings." defaultOn color="amber" />
                <Toggle label="💳 Billing & Sales" desc="New transactions, daily summaries, and refunds." defaultOn color="emerald" />
                <Toggle label="🚚 Supplier & Deliveries" desc="Delivery confirmations and auto-order events." defaultOn color="indigo" />
                <Toggle label="⚙️ System Alerts" desc="Shift events, login activity, and system health." defaultOn color="purple" />
            </SectionCard>

            <SectionCard title="Quiet Hours" desc="Suppress non-critical notifications during these hours.">
                <div className="grid grid-cols-2 gap-5">
                    <Field label="Start Time"><Input type="time" defaultValue="22:00" /></Field>
                    <Field label="End Time"><Input type="time" defaultValue="07:00" /></Field>
                </div>
                <Toggle label="Enable Quiet Hours" desc="Snooze non-urgent alerts during off-hours." color="indigo" />
            </SectionCard>
        </div>
    );
}

function InventoryRules() {
    return (
        <div className="space-y-6">
            <SectionCard title="Stock Thresholds" desc="Define when alerts and auto-actions are triggered.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Low Stock Threshold">
                        <div className="relative">
                            <Input defaultValue="20" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">units</span>
                        </div>
                    </Field>
                    <Field label="Critical Stock Threshold">
                        <div className="relative">
                            <Input defaultValue="5" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">units</span>
                        </div>
                    </Field>
                    <Field label="Expiry Warning Period">
                        <div className="relative">
                            <Input defaultValue="30" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">days</span>
                        </div>
                    </Field>
                </div>
            </SectionCard>

            <SectionCard title="Automation Rules">
                <Toggle label="⚡ Auto-Order on Critical Stock" desc="Automatically place supplier orders when stock hits critical level." defaultOn color="indigo" />
                <Toggle label="🚫 Auto-Halt Sales on Expiry" desc="Stop selling products once they reach their expiry date." defaultOn color="rose" />
                <Toggle label="📊 Daily Stock Sync Report" desc="Generate a stock summary report at end of each business day." defaultOn color="emerald" />
                <Toggle label="🔁 Auto-Reorder on Supplier Confirmation" desc="Replenish stock automatically after supplier delivery confirmation." color="indigo" />
            </SectionCard>

            <SectionCard title="Supplier Defaults" desc="Default supplier contact for auto-order requests.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Default Supplier Name"><Input defaultValue="Nexus Distributors" /></Field>
                    <Field label="Supplier Email"><Input type="email" defaultValue="orders@nexusdist.com" /></Field>
                    <Field label="Lead Time"><Select options={['1-2 days', '3-5 days', '1 week', '2 weeks']} defaultValue="3-5 days" /></Field>
                    <Field label="Order Method"><Select options={['Email', 'WhatsApp', 'Portal', 'Phone']} defaultValue="Email" /></Field>
                </div>
            </SectionCard>
        </div>
    );
}

function AppearancePanel() {
    const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
    const [accent, setAccent] = useState('indigo');

    const accents = [
        { id: 'indigo', label: 'Indigo', cls: 'bg-indigo-500' },
        { id: 'purple', label: 'Purple', cls: 'bg-purple-500' },
        { id: 'cyan',   label: 'Cyan',   cls: 'bg-cyan-500' },
        { id: 'rose',   label: 'Rose',   cls: 'bg-rose-500' },
        { id: 'amber',  label: 'Amber',  cls: 'bg-amber-500' },
        { id: 'emerald',label: 'Emerald',cls: 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-6">
            <SectionCard title="Theme Mode">
                <div className="grid grid-cols-3 gap-4">
                    {([
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark',  label: 'Dark',  icon: Moon },
                        { id: 'system',label: 'System',icon: Monitor },
                    ] as const).map(t => {
                        const Icon = t.icon;
                        const active = theme === t.id;
                        return (
                            <button key={t.id} onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${active ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}>
                                <Icon className={`w-6 h-6 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>{t.label}</span>
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            <SectionCard title="Accent Color" desc="Choose your dashboard accent color.">
                <div className="flex flex-wrap gap-3">
                    {accents.map(a => (
                        <button key={a.id} onClick={() => setAccent(a.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${accent === a.id ? 'border-white/20 bg-white/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}>
                            <div className={`w-3 h-3 rounded-full ${a.cls}`} />
                            {accent === a.id && <Check className="w-3 h-3 text-white" />}
                            {a.label}
                        </button>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Display Preferences">
                <Toggle label="Compact Sidebar" desc="Use a slimmer sidebar to maximize content area." color="indigo" />
                <Toggle label="Animated Transitions" desc="Enable motion animations across the dashboard." defaultOn color="indigo" />
                <Toggle label="Dense Table Mode" desc="Show more inventory rows per screen." color="indigo" />
                <Toggle label="Show Currency Symbol" desc="Prefix prices with ₹ symbol throughout the UI." defaultOn color="indigo" />
            </SectionCard>
        </div>
    );
}

function SecurityPanel() {
    return (
        <div className="space-y-6">
            <SectionCard title="Two-Factor Authentication" desc="Add an extra layer of protection to your account.">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">2FA is not enabled</p>
                        <p className="text-xs text-slate-500 mt-0.5">Secure your account with an authenticator app.</p>
                    </div>
                    <Button className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-black uppercase tracking-widest shrink-0">
                        <Smartphone className="w-3 h-3 mr-2" /> Enable 2FA
                    </Button>
                </div>
            </SectionCard>

            <SectionCard title="Active Sessions" desc="Devices currently logged into your account.">
                {[
                    { device: 'Chrome on Windows 11', location: 'Mumbai, IN', time: 'Active now', current: true },
                    { device: 'Safari on iPhone 15', location: 'Mumbai, IN', time: '2 hours ago', current: false },
                ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                            <Monitor className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{s.device}</p>
                            <p className="text-xs text-slate-500">{s.location} · {s.time}</p>
                        </div>
                        {s.current
                            ? <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black">CURRENT</Badge>
                            : <button className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors">Revoke</button>
                        }
                    </div>
                ))}
                <button className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> Revoke all other sessions
                </button>
            </SectionCard>

            <SectionCard title="Login Activity">
                <div className="space-y-3">
                    {[
                        { event: 'Successful login', time: 'Today, 9:14 AM', ip: '192.168.1.1', ok: true },
                        { event: 'Password changed', time: 'Yesterday, 6:30 PM', ip: '192.168.1.1', ok: true },
                        { event: 'Failed login attempt', time: '2 days ago, 11:02 PM', ip: '203.0.113.42', ok: false },
                    ].map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${ev.ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="text-white font-bold flex-1">{ev.event}</span>
                            <span className="text-slate-500">{ev.ip}</span>
                            <span className="text-slate-600">{ev.time}</span>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StoreSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('store');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const panels: Record<Tab, React.ReactNode> = {
        store:         <StoreProfile />,
        account:       <MyAccount />,
        notifications: <NotificationsPanel />,
        inventory:     <InventoryRules />,
        appearance:    <AppearancePanel />,
        security:      <SecurityPanel />,
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Configuration</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                        Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Settings</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">
                        Manage store preferences, inventory rules, and account configuration.
                    </p>
                </div>

                <button onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${saved
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5'
                    }`}>
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <aside className="lg:col-span-3 space-y-1">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-left group relative ${active
                                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/5 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.08)]'
                                    : 'border border-transparent hover:bg-white/[0.02] hover:border-white/5'
                                }`}>
                                {active && (
                                    <motion.div layoutId="settingsNav"
                                        className="absolute left-0 w-0.5 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                                )}
                                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                <span className={`text-sm font-bold tracking-wide flex-1 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {tab.label}
                                </span>
                                {tab.badge && (
                                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[9px] font-black px-1.5 py-0">
                                        {tab.badge}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* Content */}
                <main className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}>
                            {panels[activeTab]}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
