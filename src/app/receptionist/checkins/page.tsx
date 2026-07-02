'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, 
    UserCheck, 
    ShieldCheck, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Dumbbell, 
    AlertTriangle,
    QrCode,
    Users,
    TrendingUp,
    Filter,
    X,
    Check,
    UserMinus,
    ArrowUpRight,
    BarChart3,
    Activity,
    Heart,
    Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from 'sonner';
import { 
    getStoredMembers, 
    getStoredCheckIns, 
    validateCheckIn, 
    checkInMember, 
    checkOutMember, 
    getCheckInAnalytics, 
    GymMember, 
    CheckInRecord,
    CheckInValidation 
} from '@/lib/checkins-data';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';

export default function CheckInPanel() {
    const { addNotification } = useNotifications();

    // Tabs state: 'overview' | 'occupancy' | 'history' | 'analytics'
    const [activeTab, setActiveTab] = useState<'overview' | 'occupancy' | 'history' | 'analytics'>('overview');
    
    // Core data state
    const [members, setMembers] = useState<GymMember[]>([]);
    const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);

    // Search and filters for history
    const [historySearch, setHistorySearch] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('All');
    const [historyPlanFilter, setHistoryPlanFilter] = useState<string>('All');

    // Unified check-in dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogView, setDialogView] = useState<'scan' | 'validation'>('scan');
    const [selectedScanMember, setSelectedScanMember] = useState<GymMember | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // Validation results state
    const [currentValidation, setCurrentValidation] = useState<CheckInValidation | null>(null);
    const [policyOverride, setPolicyOverride] = useState(false);

    // Manual input query
    const [manualQuery, setManualQuery] = useState('');

    // Load states on mount & listen to storage sync
    useEffect(() => {
        setMembers(getStoredMembers());
        setCheckIns(getStoredCheckIns());

        const handleStorageChange = () => {
            setMembers(getStoredMembers());
            setCheckIns(getStoredCheckIns());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Derived metrics
    const metrics = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        const todayCheckIns = checkIns.filter(c => new Date(c.checkInTime).getTime() >= startOfToday);
        const totalVisits = todayCheckIns.filter(c => c.status !== 'Denied').length;
        
        const currentlyInside = checkIns.filter(c => !c.checkOutTime && c.status !== 'Denied');
        const activeOccupancyCount = currentlyInside.length;

        const restrictedAttempts = todayCheckIns.filter(c => c.status === 'Denied').length;

        // Avg duration computed from checked-out records today
        const completedToday = todayCheckIns.filter(c => c.checkOutTime && c.durationMinutes);
        const avgDuration = completedToday.length > 0
            ? Math.round(completedToday.reduce((sum, c) => sum + (c.durationMinutes || 0), 0) / completedToday.length)
            : 0;

        return {
            totalVisits,
            activeOccupancyCount,
            restrictedAttempts,
            avgDuration
        };
    }, [checkIns]);

    // Active inside members list (sorted by check-in time, newest first)
    const insideMembers = useMemo(() => {
        return checkIns
            .filter(c => !c.checkOutTime && c.status !== 'Denied')
            .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
    }, [checkIns]);

    // Expiry & Payment Alerts List
    const alerts = useMemo(() => {
        const list: { id: string; name: string; plan: string; type: 'expired' | 'due' | 'expiring'; message: string; date: string }[] = [];
        
        members.forEach(m => {
            const expDate = new Date(m.expiryDate);
            const today = new Date();
            const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / 86400000);

            if (m.status === 'Expired' || expDate < today) {
                list.push({
                    id: m.id,
                    name: m.name,
                    plan: m.plan,
                    type: 'expired',
                    message: 'Membership Expired',
                    date: expDate.toLocaleDateString()
                });
            } else if (daysLeft > 0 && daysLeft <= 7) {
                list.push({
                    id: m.id,
                    name: m.name,
                    plan: m.plan,
                    type: 'expiring',
                    message: `Membership Expires in ${daysLeft} days`,
                    date: expDate.toLocaleDateString()
                });
            }

            if (m.pendingPayments === 'Overdue') {
                list.push({
                    id: m.id,
                    name: m.name,
                    plan: m.plan,
                    type: 'due',
                    message: 'Outstanding Balance Overdue (₹7,499)',
                    date: 'Immediate'
                });
            }
        });

        return list;
    }, [members]);

    // Trigger notification context alerts once on mount for flagged members
    useEffect(() => {
        if (members.length === 0) return;

        // Run checking of critical statuses to push context notifications
        members.forEach(m => {
            const expDate = new Date(m.expiryDate);
            const today = new Date();
            const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / 86400000);

            if (m.status === 'Expired' || expDate < today) {
                addNotification({
                    role: 'receptionist',
                    category: 'MEMBER',
                    priority: 'critical',
                    title: `🚨 Expired Membership: ${m.name}`,
                    message: `${m.name}'s ${m.plan} membership expired on ${expDate.toLocaleDateString()}. Access will be restricted.`,
                    metadata: { memberId: m.memberId, type: 'expired' }
                });
            }

            if (m.pendingPayments === 'Overdue') {
                addNotification({
                    role: 'receptionist',
                    category: 'BILLING',
                    priority: 'high',
                    title: `💳 Overdue Payment Alert: ${m.name}`,
                    message: `${m.name} has an overdue outstanding payment. Access requires front desk clearance.`,
                    metadata: { memberId: m.memberId, type: 'overdue' }
                });
            }
        });
    }, [members, addNotification]);

    // Attendance logs filter
    const filteredHistory = useMemo(() => {
        return checkIns.filter(c => {
            const matchesSearch = c.memberName.toLowerCase().includes(historySearch.toLowerCase()) ||
                c.memberId.toLowerCase().includes(historySearch.toLowerCase()) ||
                c.memberEmail.toLowerCase().includes(historySearch.toLowerCase());

            const matchesStatus = historyStatusFilter === 'All' || c.status === historyStatusFilter;
            const matchesPlan = historyPlanFilter === 'All' || c.plan === historyPlanFilter;

            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [checkIns, historySearch, historyStatusFilter, historyPlanFilter]);

    // Analytics computation
    const analytics = useMemo(() => {
        return getCheckInAnalytics();
    }, [checkIns]);

    // Simulate QR code scan process
    const handleSimulateScan = (member: GymMember) => {
        setSelectedScanMember(member);
        setIsScanning(true);
        setDialogView('scan');
        setDialogOpen(true);

        setTimeout(() => {
            setIsScanning(false);
            const validation = validateCheckIn(member.memberId);
            if (validation) {
                setCurrentValidation(validation);
                setPolicyOverride(false);
                setDialogView('validation');
            } else {
                setDialogOpen(false);
            }
        }, 1200);
    };

    // Handle manual entry form submission
    const handleManualCheckIn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualQuery.trim()) return;

        const validation = validateCheckIn(manualQuery);
        if (validation) {
            setCurrentValidation(validation);
            setPolicyOverride(false);
            setDialogView('validation');
            setDialogOpen(true);
            setManualQuery('');
        } else {
            toast.error('Member profile not found. Please verify the ID or Email.');
        }
    };

    // Execute check-in transaction
    const handleCommitCheckIn = () => {
        if (!currentValidation) return;

        try {
            const record = checkInMember(currentValidation.member.memberId, policyOverride);
            setCheckIns(getStoredCheckIns());
            setMembers(getStoredMembers());
            setDialogOpen(false);

            // Notify via global system
            if (record.status === 'Denied') {
                addNotification({
                    role: 'receptionist',
                    category: 'MEMBER',
                    priority: 'high',
                    title: `🚨 Access Denied Attempt`,
                    message: `${record.memberName} (${record.memberId}) attempted check-in but was denied access: ${record.message}.`,
                });
                toast.error(`Access Denied for ${record.memberName}`);
            } else {
                addNotification({
                    role: 'receptionist',
                    category: 'MEMBER',
                    priority: 'low',
                    title: `👤 Member Checked In`,
                    message: `${record.memberName} (${record.memberId}) successfully checked in.`,
                });
                toast.success(`Access Granted! checked in ${record.memberName}`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Check-in failed');
        }
    };

    // Handle check-out trigger
    const handleCheckOut = (recordId: string, name: string) => {
        try {
            checkOutMember(recordId);
            setCheckIns(getStoredCheckIns());
            
            toast.success(`${name} checked out successfully.`);
        } catch (e: any) {
            toast.error(e.message || 'Check-out failed');
        }
    };

    // Pie chart colors configuration
    const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#64748B'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-slate-900/60 via-charcoal/40 to-slate-900/60 p-6 md:p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                        <QrCode className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary tracking-wider uppercase">Access Management</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight">
                        Check-ins & Attendance
                    </h1>
                    <p className="text-slate-400 max-w-xl text-lg">
                        Validate digital member passes, monitor gym capacity load, and audit real-time visit trends.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4">
                    <Button 
                        onClick={() => {
                            setDialogView('scan');
                            setDialogOpen(true);
                        }}
                        className="bg-primary text-black hover:bg-primary/95 rounded-xl h-12 px-6 shadow-lg shadow-primary/20 transition-all font-bold flex items-center gap-2"
                    >
                        <QrCode className="w-5 h-5" />
                        Simulate QR Scan
                    </Button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-primary/10 pb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'overview', label: 'Check-in Workspace', icon: UserCheck },
                    { id: 'occupancy', label: `Inside Gym (${insideMembers.length})`, icon: Users },
                    { id: 'history', label: 'Attendance Logs', icon: Clock },
                    { id: 'analytics', label: 'Analytics Insights', icon: BarChart3 },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-primary text-black shadow-[0_0_15px_hsl(var(--gold)/0.2)]'
                                    : 'bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Active Workspace tabs */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
                        
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Total Visits Today", value: metrics.totalVisits, desc: "Successful check-ins", color: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-500/5" },
                                { label: "Currently Inside", value: metrics.activeOccupancyCount, desc: "Active visits in gym", color: "text-blue-400", bg: "border-blue-500/20 bg-blue-500/5" },
                                { label: "Restricted Access", value: metrics.restrictedAttempts, desc: "Denied entrance attempts", color: "text-rose-400", bg: "border-rose-500/20 bg-rose-500/5" },
                                { label: "Avg Visit Duration", value: `${metrics.avgDuration}m`, desc: "Checked-out avg today", color: "text-amber-400", bg: "border-amber-500/20 bg-amber-500/5" },
                            ].map((kpi, i) => (
                                <Card key={i} className={`bg-slate-900/60 backdrop-blur-xl border ${kpi.bg} rounded-2xl`}>
                                    <CardContent className="p-5">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{kpi.label}</p>
                                        <h3 className={`text-3xl font-black ${kpi.color} leading-none font-heading`}>{kpi.value}</h3>
                                        <p className="text-[10px] text-slate-500 mt-2">{kpi.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Column: Manual Checkin entry */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card className="bg-slate-900/60 backdrop-blur-2xl border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <UserCheck className="w-5 h-5 text-primary" />
                                            Manual Check-In Entry
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-xs">
                                            Search member profiles by ID or Name to process access validation.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <form onSubmit={handleManualCheckIn} className="space-y-4">
                                            <div className="relative">
                                                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter Member ID (e.g. MEM-1001) or Name..."
                                                    value={manualQuery}
                                                    onChange={e => setManualQuery(e.target.value)}
                                                    className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-black font-bold rounded-xl h-11 uppercase text-xs tracking-wider">
                                                Validate Access
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Quick Simulated scan entry widget */}
                                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <QrCode className="w-4 h-4 text-primary" /> Scan Quick Simulation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 space-y-3">
                                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                                            Click any check status to mock a member scanner swipe at the terminal:
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {members.slice(0, 6).map(m => {
                                                const badgeColor = m.status === 'Active' ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' :
                                                    m.status === 'Expired' ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10' :
                                                    'border-amber-500/20 text-amber-400 hover:bg-amber-500/10';

                                                return (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => handleSimulateScan(m)}
                                                        className={`border text-[11px] font-semibold p-2.5 rounded-xl text-left transition-colors truncate ${badgeColor}`}
                                                    >
                                                        {m.name} ({m.plan})
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Alerts & Expiries Feed */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-slate-900/60 backdrop-blur-2xl border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[460px]">
                                    <CardHeader className="bg-slate-900/40 border-b border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                                Expiry & Payment Alerts Feed
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 text-xs">
                                                Flagged profiles requiring direct attention or payment clearing.
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-rose-500/10 border-rose-500/20 border text-rose-400 text-[10px]">
                                            {alerts.length} Issues Active
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                                        <div className="divide-y divide-slate-800/50">
                                            {alerts.map((alert, idx) => {
                                                const theme = alert.type === 'expired' ? { border: 'border-l-rose-500', bg: 'bg-rose-500/5', color: 'text-rose-400' } :
                                                    alert.type === 'due' ? { border: 'border-l-amber-500', bg: 'bg-amber-500/5', color: 'text-amber-400' } :
                                                    { border: 'border-l-blue-500', bg: 'bg-blue-500/5', color: 'text-blue-400' };

                                                return (
                                                    <div key={idx} className={`p-4 border-l-4 ${theme.border} ${theme.bg} flex items-start justify-between gap-4`}>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-white text-sm">{alert.name}</h4>
                                                                <Badge variant="outline" className="bg-slate-900 text-[10px] text-slate-400 h-5">
                                                                    {alert.plan} Plan
                                                                </Badge>
                                                            </div>
                                                            <p className={`text-xs font-semibold ${theme.color}`}>{alert.message}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Date Action</p>
                                                            <p className="text-xs text-white font-bold">{alert.date}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {alerts.length === 0 && (
                                                <div className="p-12 text-center text-slate-500 text-sm font-semibold">
                                                    No membership expiries or payment warnings currently active!
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Occupancy Tab */}
                {activeTab === 'occupancy' && (
                    <motion.div key="occupancy" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Currently Inside Gym</h2>
                                <p className="text-sm text-slate-400 mt-1">Real-time facility occupancy list</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-900/30 border-blue-500/30 text-blue-400 px-3 py-1">
                                {insideMembers.length} Members Present
                            </Badge>
                        </div>

                        {insideMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
                                <Users className="w-16 h-16 text-slate-700 mb-4" />
                                <h3 className="text-xl font-bold text-slate-300">No Members Inside</h3>
                                <p className="text-slate-500 max-w-sm mt-2">
                                    No checks are logged in the active roster. Use the scanner above to grant entry.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {insideMembers.map((member) => {
                                    // Calculate elapsed time formatted
                                    const mins = Math.max(1, Math.round((Date.now() - new Date(member.checkInTime).getTime()) / 60000));
                                    const elapsedStr = mins >= 60 
                                        ? `${Math.floor(mins / 60)}h ${mins % 60}m`
                                        : `${mins}m inside`;

                                    return (
                                        <Card key={member.id} className="bg-slate-900/60 backdrop-blur-xl border-slate-800/80 hover:border-primary/20 group transition-all rounded-2xl overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-lg">
                                                            {member.memberName.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white group-hover:text-primary transition-colors leading-tight">{member.memberName}</h4>
                                                            <span className="text-[10px] text-slate-400 font-mono">ID: {member.memberId}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border text-[10px] uppercase font-bold tracking-wider px-2">
                                                        {member.plan}
                                                    </Badge>
                                                </div>

                                                <div className="pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-wider text-slate-500">Checked In</p>
                                                        <p className="text-white font-bold mt-0.5">
                                                            {new Date(member.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-wider text-slate-500">Trainer Sourced</p>
                                                        <p className="text-slate-300 font-medium mt-0.5">{member.trainerName || 'None'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 gap-4">
                                                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {elapsedStr}
                                                    </span>
                                                    <Button
                                                        onClick={() => handleCheckOut(member.id, member.memberName)}
                                                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded-xl text-xs h-9 px-4 font-bold flex items-center gap-1.5 transition-all"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                        Check Out
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* History Log Tab */}
                {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                        
                        {/* Filters Card */}
                        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search logs by ID, Name or Email..."
                                    value={historySearch}
                                    onChange={e => setHistorySearch(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="flex gap-3 w-full md:w-auto items-center overflow-x-auto pb-1 md:pb-0">
                                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-slate-800">
                                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status:</span>
                                    <select 
                                        value={historyStatusFilter}
                                        onChange={e => setHistoryStatusFilter(e.target.value)}
                                        className="bg-transparent text-xs text-white outline-none cursor-pointer font-bold"
                                    >
                                        <option value="All" className="bg-slate-900">All</option>
                                        <option value="Success" className="bg-slate-900 text-emerald-400">Granted</option>
                                        <option value="Warning" className="bg-slate-900 text-amber-400">Warnings</option>
                                        <option value="Denied" className="bg-slate-900 text-rose-400">Denied</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Plan:</span>
                                    <select 
                                        value={historyPlanFilter}
                                        onChange={e => setHistoryPlanFilter(e.target.value)}
                                        className="bg-transparent text-xs text-white outline-none cursor-pointer font-bold"
                                    >
                                        <option value="All" className="bg-slate-900">All</option>
                                        <option value="Premium" className="bg-slate-900">Premium</option>
                                        <option value="Standard" className="bg-slate-900">Standard</option>
                                        <option value="Basic" className="bg-slate-900">Basic</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Logs Table */}
                        <Card className="bg-slate-900/60 backdrop-blur-2xl border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[520px]">
                            <div className="overflow-x-auto flex-1 custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black/30 sticky top-0 z-10 backdrop-blur-md border-b border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Member</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Plan</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Time Checked In</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Time Checked Out</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Duration</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 text-xs">
                                        {filteredHistory.map((log) => {
                                            const statusClass = log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                log.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20';

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-white">{log.memberName}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono">ID: {log.memberId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 font-semibold">{log.plan}</td>
                                                    <td className="px-6 py-4 text-slate-400">
                                                        {new Date(log.checkInTime).toLocaleDateString()} {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">
                                                        {log.checkOutTime 
                                                            ? `${new Date(log.checkOutTime).toLocaleDateString()} ${new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-300 font-bold">
                                                        {log.durationMinutes ? `${log.durationMinutes} mins` : log.status === 'Denied' ? 'N/A' : 'Inside'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <Badge variant="outline" className={`${statusClass} border text-[9px] font-bold uppercase tracking-wider px-2`}>
                                                                {log.status === 'Success' ? 'Granted' : log.status}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredHistory.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center text-slate-500 font-semibold text-sm">
                                                    No attendance logs match selected filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Analytics Insights Tab */}
                {activeTab === 'analytics' && (
                    <motion.div key="analytics" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Area trend graph */}
                            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 p-6 rounded-3xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" /> Attendance Trends (Last 7 Days)
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-xs">Gym entries by date</CardDescription>
                                    </div>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                                            <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Bar Chart Peak Hours */}
                            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 p-6 rounded-3xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-400" /> Facility Load: Peak Hours
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-xs">Visits frequency grouped by hour</CardDescription>
                                    </div>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.peakHoursData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                                            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Member mix by plan pie chart */}
                            <Card className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl border-slate-800 p-6 rounded-3xl flex flex-col h-[350px]">
                                <CardTitle className="text-white text-base font-bold flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-primary" /> Active Visitor Mix by Plan
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs mb-6">Enrollment category breakdown</CardDescription>
                                <div className="flex-1 relative flex items-center justify-center">
                                    <div className="w-48 h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.planMixData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={65}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {analytics.planMixData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-col gap-2 pl-4 text-xs font-semibold">
                                        {analytics.planMixData.map((d, index) => (
                                            <div key={d.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-slate-300">{d.name} ({d.value})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Most Active Members List */}
                            <Card className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border-slate-800 p-6 rounded-3xl h-[350px] flex flex-col overflow-hidden">
                                <CardTitle className="text-white text-base font-bold flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Elite Active Visitors (Top 5)
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs mb-6">Highest check-in load frequency</CardDescription>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                    {analytics.activeMembersData.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                                                    {m.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white leading-tight">{m.name}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{m.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-emerald-400 font-heading">{m.count} Visits</p>
                                                <p className="text-[9px] text-slate-600 uppercase font-black">Attendance</p>
                                            </div>
                                        </div>
                                    ))}
                                    {analytics.activeMembersData.length === 0 && (
                                        <p className="text-center text-slate-500 text-xs font-semibold py-8">No visits recorded.</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unified Check-In Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {dialogView === 'scan' ? (
                    <DialogContent className="max-w-md bg-slate-950 border-primary/20 text-slate-100 p-6 rounded-3xl shadow-2xl relative flex flex-col items-center justify-center max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader className="w-full text-center">
                            <DialogTitle className="text-xl font-bold font-heading text-white flex items-center justify-center gap-2">
                                <QrCode className="w-5 h-5 text-primary" /> Simulate digital scanner swipe
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 text-xs mt-1">
                                Awaiting a member card code scan on the terminal sensor.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scanning animation frame */}
                        <div className="my-8 relative w-56 h-56 border-2 border-dashed border-primary/40 rounded-2xl flex flex-col items-center justify-center bg-black/30 overflow-hidden flex-shrink-0">
                            {isScanning ? (
                                <>
                                    {/* Laser line scan anim */}
                                    <motion.div 
                                        initial={{ y: 0 }}
                                        animate={{ y: 220 }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 top-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)] z-10"
                                    />
                                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                    <QrCode className="w-24 h-24 text-primary opacity-80 scale-105 transition-transform" />
                                    <p className="text-xs font-bold text-primary mt-4 tracking-widest uppercase animate-pulse">Reading Pass...</p>
                                </>
                            ) : (
                                <>
                                    <QrCode className="w-20 h-20 text-slate-600 opacity-60" />
                                    <p className="text-xs font-bold text-slate-500 mt-4 uppercase">Laser scanner active</p>
                                </>
                            )}
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-3 w-full">
                                <div className="h-px bg-slate-800 flex-1" />
                                <span className="text-[10px] uppercase font-bold text-slate-500">Pick Profile to Simulate Scan</span>
                                <div className="h-px bg-slate-800 flex-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                {members.map(m => {
                                    let statusLabel = m.status === 'Active' ? 'Valid' : m.status;
                                    if (m.pendingPayments === 'Overdue') statusLabel = 'Overdue Bal';
                                    
                                    return (
                                        <Button
                                            key={m.id}
                                            onClick={() => handleSimulateScan(m)}
                                            disabled={isScanning}
                                            variant="outline"
                                            className="h-11 rounded-xl border-slate-850 hover:bg-slate-900 flex flex-col items-start p-3 hover:text-white w-full"
                                        >
                                            <span className="text-xs font-bold text-white block leading-none truncate w-full text-left">{m.name}</span>
                                            <span className={`text-[9px] uppercase font-black block tracking-wider mt-1.5 ${
                                                m.status === 'Active' && m.pendingPayments === 'None' ? 'text-emerald-400' :
                                                m.status === 'Expired' || m.pendingPayments === 'Overdue' ? 'text-rose-400' : 'text-amber-400'
                                            }`}>
                                                {statusLabel}
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </DialogContent>
                ) : (
                    <DialogContent className="max-w-md bg-slate-950 border-primary/20 text-slate-100 p-6 rounded-3xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <DialogHeader className="pb-3 border-b border-slate-800 flex-shrink-0">
                            <DialogTitle className="text-lg font-bold font-heading text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" /> Access verification checks
                            </DialogTitle>
                        </DialogHeader>

                        {currentValidation && (
                            <div className="py-4 space-y-6 overflow-y-auto flex-1 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                                
                                {/* Member brief summary */}
                                <div className="flex items-center gap-4 bg-black/30 p-4 border border-slate-850 rounded-2xl">
                                    <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-xl text-primary">
                                        {currentValidation.member.avatar}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-white text-base leading-tight">{currentValidation.member.name}</h4>
                                        <p className="text-xs text-slate-400">ID: {currentValidation.member.memberId} • Phone: {currentValidation.member.phone}</p>
                                        <Badge variant="outline" className="bg-slate-900 border-slate-850 text-slate-300 text-[9px] font-bold uppercase tracking-wider py-0.5">
                                            {currentValidation.member.plan} Plan
                                        </Badge>
                                    </div>
                                </div>

                                {/* Verification logs lists */}
                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Access Verification Results</h4>
                                    
                                    <div className="space-y-2.5">
                                        {/* 1. Membership status check */}
                                        <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/40 border border-slate-850">
                                            <span className="text-slate-400 font-medium">Membership Active:</span>
                                            {currentValidation.member.status !== 'Expired' ? (
                                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5" /> Yes (Expiry: {new Date(currentValidation.member.expiryDate).toLocaleDateString()})
                                                </span>
                                            ) : (
                                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                                    <X className="w-3.5 h-3.5" /> No (Expired: {new Date(currentValidation.member.expiryDate).toLocaleDateString()})
                                                </span>
                                            )}
                                        </div>

                                        {/* 2. Overdue billing checks */}
                                        <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/40 border border-slate-850">
                                            <span className="text-slate-400 font-medium">Outstanding Balances:</span>
                                            {currentValidation.member.pendingPayments === 'None' ? (
                                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5" /> None (Cleared)
                                                </span>
                                            ) : currentValidation.member.pendingPayments === 'Due in 3 Days' ? (
                                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Due in 3 days (₹7,499)
                                                </span>
                                            ) : (
                                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                                    <X className="w-3.5 h-3.5" /> Overdue Balance (₹7,499)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Validation Result Box */}
                                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                                    currentValidation.status === 'Success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                    currentValidation.status === 'Warning' ? 'bg-amber-500/5 border-amber-500/20' :
                                    'bg-rose-500/5 border-rose-500/20'
                                }`}>
                                    <div className="mt-0.5">
                                        {currentValidation.status === 'Success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                                            currentValidation.status === 'Warning' ? <AlertCircle className="w-5 h-5 text-amber-500" /> :
                                            <AlertTriangle className="w-5 h-5 text-rose-500" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-white text-sm">
                                            {currentValidation.status === 'Success' ? 'Access Granted' :
                                                currentValidation.status === 'Warning' ? 'Access Warning Alert' :
                                                'Access Blocked'}
                                        </h5>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {currentValidation.status === 'Success' ? 'All checks passed. The member is approved for gym entry.' :
                                                currentValidation.status === 'Warning' ? 'Membership is valid but outstanding payments are due soon.' :
                                                'Gym access policies block this check-in due to expired membership or overdue balance.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Override logic box */}
                                {!currentValidation.allowed && (
                                    <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            id="override" 
                                            checked={policyOverride}
                                            onChange={e => setPolicyOverride(e.target.checked)}
                                            className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                                        />
                                        <label htmlFor="override" className="text-xs font-semibold text-rose-300 cursor-pointer select-none">
                                            Apply Receptionist Override (Log Exception Entry)
                                        </label>
                                    </div>
                                )}

                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t border-slate-800 flex-shrink-0 flex gap-3">
                            <DialogClose asChild>
                                <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                onClick={handleCommitCheckIn}
                                disabled={currentValidation ? (!currentValidation.allowed && !policyOverride) : true}
                                className={`rounded-xl font-bold uppercase text-xs tracking-wider px-6 h-10 ${
                                    currentValidation && (currentValidation.allowed || policyOverride)
                                        ? 'bg-primary text-black hover:bg-primary/95 shadow-lg shadow-primary/20'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                Process Check-in
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
