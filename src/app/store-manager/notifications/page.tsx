'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCheck, Trash2, Filter, Search, Mail, Smartphone, Globe,
    Package, CreditCard, Users, Settings, Megaphone, BarChart3,
    Clock, Calendar, Zap, BellOff, BellRing, Play, RefreshCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import {
    useNotifications,
    formatTimestamp,
    getPriorityConfig,
    getCategoryConfig,
    type NotificationCategory,
} from '@/context/NotificationContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

const CATEGORY_TABS: { key: 'ALL' | NotificationCategory; label: string; emoji: string }[] = [
    { key: 'ALL', label: 'All', emoji: '🔔' },
    { key: 'INVENTORY', label: 'Inventory', emoji: '📦' },
    { key: 'BILLING', label: 'Billing', emoji: '💳' },
    { key: 'MEMBER', label: 'Member', emoji: '👤' },
    { key: 'SYSTEM', label: 'System', emoji: '⚙️' },
    { key: 'PROMO', label: 'Promo', emoji: '🎁' },
];

export default function NotificationsPage() {
    const router = useRouter();
    const {
        notifications, unreadCount, markAsRead, markAllAsRead,
        removeNotification, clearAll, triggerDailySalesReport,
        triggerPromoOffer, triggerLowStock, triggerMembershipExpiry,
    } = useNotifications();
    const { prefs, updatePrefs, toggleCategory } = useNotificationPreferences();

    const [activeTab, setActiveTab] = useState<'ALL' | NotificationCategory>('ALL');
    const [search, setSearch] = useState('');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const filtered = useMemo(() => {
        return notifications.filter(n => {
            if (activeTab !== 'ALL' && n.category !== activeTab) return false;
            if (showUnreadOnly && n.isRead) return false;
            if (search && !n.title.toLowerCase().includes(search.toLowerCase()) &&
                !n.message.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [notifications, activeTab, search, showUnreadOnly]);

    const stats = useMemo(() => {
        const today = notifications.filter(n =>
            Date.now() - new Date(n.timestamp).getTime() < 86_400_000
        );
        const byCategory = CATEGORY_TABS.slice(1).map(c => ({
            ...c,
            count: notifications.filter(n => n.category === c.key).length,
            unread: notifications.filter(n => n.category === c.key && !n.isRead).length,
        }));
        return { total: notifications.length, todayCount: today.length, byCategory };
    }, [notifications]);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Notifications</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Auto-triggered alerts, history, preferences & scheduling.</p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead}
                            className="border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 text-xs font-bold uppercase tracking-widest">
                            <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
                        </Button>
                    )}
                    <Button variant="outline" onClick={clearAll}
                        className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-widest">
                        <Trash2 className="w-4 h-4 mr-2" /> Clear All
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'indigo', icon: Bell },
                    { label: 'Unread', value: unreadCount, color: 'rose', icon: BellRing },
                    { label: 'Today', value: stats.todayCount, color: 'emerald', icon: Calendar },
                    { label: 'Email Sent', value: notifications.filter(n => n.emailSent).length, color: 'amber', icon: Mail },
                ].map(s => (
                    <Card key={s.label} className="bg-slate-900/50 border-white/5">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center`}>
                                <s.icon className={`w-5 h-5 text-${s.color}-400`} />
                            </div>
                            <div>
                                <div className={`text-2xl font-black text-${s.color}-400`}>{s.value}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="history">
                <TabsList className="bg-black/40 border border-white/5 p-1 h-auto">
                    {[
                        { value: 'history', label: 'History', icon: Clock },
                        { value: 'preferences', label: 'Preferences', icon: Settings },
                        { value: 'schedule', label: 'Schedule Center', icon: Calendar },
                        { value: 'analytics', label: 'Analytics', icon: BarChart3 },
                    ].map(t => (
                        <TabsTrigger key={t.value} value={t.value}
                            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-400 font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all flex items-center gap-2">
                            <t.icon className="w-3.5 h-3.5" />{t.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ── HISTORY TAB ── */}
                <TabsContent value="history" className="mt-6 space-y-4">
                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_TABS.map(c => (
                            <button key={c.key}
                                onClick={() => setActiveTab(c.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    activeTab === c.key
                                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                        : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
                                }`}>
                                {c.emoji} {c.label}
                                {c.key !== 'ALL' && (
                                    <span className="ml-1.5 text-[10px] opacity-60">
                                        ({notifications.filter(n => n.category === c.key).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search notifications…"
                                className="pl-10 bg-black/40 border-white/10 text-white focus:border-indigo-500 h-10 rounded-xl" />
                        </div>
                        <Button variant="outline" onClick={() => setShowUnreadOnly(p => !p)}
                            className={`border-white/10 text-xs font-bold uppercase tracking-widest h-10 ${showUnreadOnly ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:bg-white/5'}`}>
                            <Filter className="w-3.5 h-3.5 mr-2" />
                            {showUnreadOnly ? 'Unread Only' : 'All'}
                        </Button>
                    </div>

                    {/* Notification List */}
                    <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
                        <ScrollArea className="h-[520px]">
                            <AnimatePresence>
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                        <BellOff className="w-10 h-10 mb-3 opacity-30" />
                                        <p className="font-bold">No notifications found</p>
                                    </div>
                                ) : filtered.map((n, i) => {
                                    const pc = getPriorityConfig(n.priority);
                                    const cc = getCategoryConfig(n.category);
                                    return (
                                        <motion.div key={n.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`flex gap-4 p-4 border-b border-white/5 border-l-2 ${pc.border} ${!n.isRead ? 'bg-indigo-500/[0.04]' : ''} hover:bg-white/[0.02] transition-colors group`}>
                                            {/* Dot */}
                                            <div className="mt-1.5 shrink-0">
                                                <div className={`w-2 h-2 rounded-full ${!n.isRead ? pc.dot : 'bg-transparent'}`} />
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className={`text-sm font-bold leading-tight ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                            {n.title}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {n.emailSent && (
                                                            <span title="Email sent" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                                <Mail className="w-2.5 h-2.5" /> Email
                                                            </span>
                                                        )}
                                                        <Badge className={`text-[10px] px-2 py-0.5 border ${pc.badge}`}>
                                                            {n.priority}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {cc.emoji} {cc.label}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600">•</span>
                                                    <span className="text-[10px] text-slate-500">{formatTimestamp(new Date(n.timestamp))}</span>
                                                    {n.actionUrl && (
                                                        <>
                                                            <span className="text-[10px] text-slate-600">•</span>
                                                            <button onClick={() => router.push(n.actionUrl!)}
                                                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                                                                {n.actionLabel || 'View'} →
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                {!n.isRead && (
                                                    <button onClick={() => markAsRead(n.id)}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-colors" title="Mark read">
                                                        <CheckCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button onClick={() => removeNotification(n.id)}
                                                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors" title="Delete">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </ScrollArea>
                    </Card>
                </TabsContent>

                {/* ── PREFERENCES TAB ── */}
                <TabsContent value="preferences" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Channel Toggles */}
                        <Card className="bg-slate-900/50 border-white/5">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-400" /> Delivery Channels
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {[
                                    { key: 'emailEnabled', label: 'Email Notifications', desc: 'Send alerts to admin email', icon: Mail, available: true },
                                    { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Future — requires Twilio', icon: Smartphone, available: false },
                                    { key: 'pushEnabled', label: 'Push Notifications', desc: 'Future — requires service worker', icon: Globe, available: false },
                                ].map(c => (
                                    <div key={c.key} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                <c.icon className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{c.label}</p>
                                                <p className="text-[10px] text-slate-500">{c.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!c.available && <Badge className="text-[10px] bg-slate-800 text-slate-500 border-slate-700">Soon</Badge>}
                                            <Switch
                                                checked={prefs[c.key as keyof typeof prefs] as boolean}
                                                onCheckedChange={v => updatePrefs({ [c.key]: v })}
                                                disabled={!c.available}
                                                className="data-[state=checked]:bg-indigo-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Thresholds */}
                        <Card className="bg-slate-900/50 border-white/5">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-400" /> Alert Thresholds
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                                        Low Stock Threshold: <span className="text-white">{prefs.lowStockThreshold} units</span>
                                    </label>
                                    <input type="range" min="5" max="50" value={prefs.lowStockThreshold}
                                        onChange={e => updatePrefs({ lowStockThreshold: Number(e.target.value) })}
                                        className="w-full accent-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                                        Expiry Warning: <span className="text-white">{prefs.expiryWarningDays} days</span>
                                    </label>
                                    <input type="range" min="7" max="90" value={prefs.expiryWarningDays}
                                        onChange={e => updatePrefs({ expiryWarningDays: Number(e.target.value) })}
                                        className="w-full accent-indigo-500" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Toggles */}
                        <Card className="bg-slate-900/50 border-white/5 lg:col-span-2">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-purple-400" /> Notification Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {CATEGORY_TABS.slice(1).map(c => {
                                        const enabled = prefs.enabledCategories[c.key as NotificationCategory];
                                        return (
                                            <button key={c.key}
                                                onClick={() => toggleCategory(c.key as NotificationCategory)}
                                                className={`p-4 rounded-xl border text-left transition-all ${enabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                                <div className="text-xl mb-2">{c.emoji}</div>
                                                <p className="text-sm font-bold text-white">{c.label}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{enabled ? 'Enabled' : 'Disabled'}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── SCHEDULE CENTER TAB ── */}
                <TabsContent value="schedule" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Daily Sales Report',
                                desc: 'Auto-sends revenue summary every morning.',
                                icon: BarChart3,
                                color: 'indigo',
                                enabled: prefs.dailyReportEnabled,
                                onToggle: () => updatePrefs({ dailyReportEnabled: !prefs.dailyReportEnabled }),
                                onFire: () => triggerDailySalesReport(14545, 5),
                                badge: 'Daily 9:00 AM',
                            },
                            {
                                title: 'Promo Blast',
                                desc: 'Send promotional offers to all members.',
                                icon: Megaphone,
                                color: 'pink',
                                enabled: prefs.promoAlertsEnabled,
                                onToggle: () => updatePrefs({ promoAlertsEnabled: !prefs.promoAlertsEnabled }),
                                onFire: () => triggerPromoOffer('Weekend Flash Sale!', 'Get 20% off all supplements this weekend. Use code ZENITH20 at checkout.', 'member'),
                                badge: 'Manual Trigger',
                            },
                            {
                                title: 'Low Stock Audit',
                                desc: 'Scan inventory and alert on critical items.',
                                icon: Package,
                                color: 'amber',
                                enabled: true,
                                onToggle: () => {},
                                onFire: () => triggerLowStock({ itemId: 'audit-001', itemName: 'Titan Pre-Workout', sku: 'NX-PRE-02', stock: 12 }),
                                badge: 'Auto every 4h',
                            },
                            {
                                title: 'Membership Expiry Check',
                                desc: 'Alert admins about expiring member plans.',
                                icon: Users,
                                color: 'purple',
                                enabled: true,
                                onToggle: () => {},
                                onFire: () => triggerMembershipExpiry({ memberId: 'demo-001', memberName: 'John Doe', planName: 'Premium Plan', daysLeft: 5 }),
                                badge: 'Daily 8:00 AM',
                            },
                        ].map(item => (
                            <Card key={item.title} className="bg-slate-900/50 border-white/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center`}>
                                                <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{item.title}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                        <Switch checked={item.enabled} onCheckedChange={item.onToggle}
                                            className="data-[state=checked]:bg-indigo-500" />
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <Badge className="text-[10px] bg-black/40 text-slate-400 border-white/5">
                                            <Clock className="w-3 h-3 mr-1" /> {item.badge}
                                        </Badge>
                                        <Button size="sm" onClick={item.onFire}
                                            className={`bg-${item.color}-500/10 text-${item.color}-400 hover:bg-${item.color}-500/20 border border-${item.color}-500/20 text-[10px] font-bold uppercase tracking-widest h-8`}>
                                            <Play className="w-3 h-3 mr-1.5" /> Fire Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── ANALYTICS TAB ── */}
                <TabsContent value="analytics" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/50 border-white/5">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest">By Category</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                {stats.byCategory.map(c => (
                                    <div key={c.key} className="flex items-center gap-3">
                                        <span className="text-base w-6 text-center">{c.emoji}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-slate-300">{c.label}</span>
                                                <span className="text-slate-400">{c.count} total · <span className="text-rose-400">{c.unread} unread</span></span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${stats.total ? (c.count / stats.total) * 100 : 0}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/50 border-white/5">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest">Summary Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {[
                                    { label: 'Total Notifications', value: stats.total, color: 'indigo' },
                                    { label: 'Unread', value: unreadCount, color: 'rose' },
                                    { label: 'Sent Today', value: stats.todayCount, color: 'emerald' },
                                    { label: 'Email Triggered', value: notifications.filter(n => n.emailSent).length, color: 'amber' },
                                    { label: 'Critical Priority', value: notifications.filter(n => n.priority === 'critical').length, color: 'red' },
                                    { label: 'Auto-Triggered', value: notifications.filter(n => n.category === 'INVENTORY').length, color: 'purple' },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                        <span className="text-sm text-slate-400 font-medium">{s.label}</span>
                                        <span className={`text-lg font-black text-${s.color}-400`}>{s.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
