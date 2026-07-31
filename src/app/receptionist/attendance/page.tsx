'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    UserCheck,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
    TrendingUp,
    Flame,
    Activity,
    FileText,
    Download,
    Eye,
    Users,
    Award,
    ShieldCheck,
    ChevronRight,
    X,
    Check,
    RefreshCw,
    SlidersHorizontal,
    Sparkles,
    CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';

// ── TYPES & INTERFACES ────────────────────────────────────────────────────────

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export interface AttendanceDayRecord {
    date: string;         // e.g. "2026-07-31" (or formatted string)
    dateLabel: string;    // e.g. "July 31, 2026 (Today)"
    status: AttendanceStatus;
    checkInTime?: string; // e.g. "06:45 AM"
    checkOutTime?: string;// e.g. "08:15 AM"
    duration?: string;    // e.g. "1 hr 30 mins"
    activityZone?: string;// e.g. "Strength Training Floor" | "Cardio & HIIT Studio" | "Personal Training"
    notes?: string;
}

export interface GymMemberAttendance {
    rollNo: number;       // SEQUENCE-WISE UNIQUE ROLL NO: 1, 2, 3, 4, 5...
    name: string;
    email: string;
    phone: string;
    plan: 'Premium' | 'Standard' | 'Basic' | 'None';
    avatar: string;
    todayStatus: AttendanceStatus;
    todayCheckIn?: string;
    monthlyPresentDays: number;
    monthlyAbsentDays: number;
    monthlyLeaveDays: number;
    attendanceRate: number; // percentage 0 - 100
    currentStreak: number;  // consecutive days
    avgDuration: string;
    history: AttendanceDayRecord[];
}

// ── HELPER: GENERATE REALISTIC DETAILED ATTENDANCE HISTORY ─────────────────────
function generateDetailedHistory(rollNo: number, name: string): {
    history: AttendanceDayRecord[];
    todayStatus: AttendanceStatus;
    todayCheckIn?: string;
    monthlyPresentDays: number;
    monthlyAbsentDays: number;
    monthlyLeaveDays: number;
    attendanceRate: number;
    currentStreak: number;
} {
    const today = new Date();
    const history: AttendanceDayRecord[] = [];

    const zones = [
        'Strength Training Floor',
        'Cardio & HIIT Studio',
        'Personal Training Zone',
        'CrossFit & Functional Arena',
        'Powerlifting Platform',
        'Recovery & Mobility Lounge'
    ];

    const checkInTimes = [
        { in: '06:15 AM', out: '07:45 AM', dur: '1 hr 30 mins' },
        { in: '06:45 AM', out: '08:00 AM', dur: '1 hr 15 mins' },
        { in: '07:30 AM', out: '09:00 AM', dur: '1 hr 30 mins' },
        { in: '08:00 AM', out: '09:15 AM', dur: '1 hr 15 mins' },
        { in: '10:15 AM', out: '11:45 AM', dur: '1 hr 30 mins' },
        { in: '05:00 PM', out: '06:30 PM', dur: '1 hr 30 mins' },
        { in: '06:15 PM', out: '07:30 PM', dur: '1 hr 15 mins' },
        { in: '07:00 PM', out: '08:30 PM', dur: '1 hr 30 mins' },
    ];

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let currentStreak = 0;
    let streakBroken = false;

    // Generate last 30 days history
    for (let i = 0; i < 30; i++) {
        const dateObj = new Date(today);
        dateObj.setDate(today.getDate() - i);
        
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const isToday = i === 0;
        const isYesterday = i === 1;
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const baseLabel = dateObj.toLocaleDateString('en-US', options);
        const dateLabel = isToday ? `${baseLabel} (Today)` : isYesterday ? `${baseLabel} (Yesterday)` : baseLabel;

        // Pseudo-random consistency based on rollNo + day index
        const hash = (rollNo * 31 + i * 17) % 100;
        let status: AttendanceStatus = 'Present';

        if (hash < 12) {
            status = 'Absent';
        } else if (hash < 18) {
            status = 'Leave';
        }

        // Adjust for today so we have a nice mix of checked in vs absent
        if (isToday) {
            if ((rollNo % 5) === 0) status = 'Absent';
            else if ((rollNo % 9) === 0) status = 'Leave';
            else status = 'Present';
        }

        if (status === 'Present') {
            presentCount++;
            if (!streakBroken) currentStreak++;
            const timeSlot = checkInTimes[(rollNo + i) % checkInTimes.length];
            const zone = zones[(rollNo * 3 + i) % zones.length];

            history.push({
                date: dateStr,
                dateLabel,
                status: 'Present',
                checkInTime: timeSlot.in,
                checkOutTime: timeSlot.out,
                duration: timeSlot.dur,
                activityZone: zone,
                notes: isToday ? 'Checked in via Reception Desktop' : 'Standard Workout Check-in'
            });
        } else if (status === 'Absent') {
            absentCount++;
            if (i === 0 || i === 1) streakBroken = true;
            history.push({
                date: dateStr,
                dateLabel,
                status: 'Absent',
                notes: 'Did not check in'
            });
        } else {
            leaveCount++;
            if (i === 0 || i === 1) streakBroken = true;
            history.push({
                date: dateStr,
                dateLabel,
                status: 'Leave',
                notes: 'Approved Rest / Travel Leave'
            });
        }
    }

    const totalDays = 30;
    const attendanceRate = Math.round((presentCount / totalDays) * 100);
    const todayRecord = history[0];

    return {
        history,
        todayStatus: todayRecord.status,
        todayCheckIn: todayRecord.checkInTime,
        monthlyPresentDays: presentCount,
        monthlyAbsentDays: absentCount,
        monthlyLeaveDays: leaveCount,
        attendanceRate,
        currentStreak
    };
}

import { useGymMembers } from '@/lib/gym-members-store';

export default function ReceptionistAttendancePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent' | 'Leave'>('All');
    const [planFilter, setPlanFilter] = useState<'All' | 'Premium' | 'Standard' | 'Basic'>('All');

    // Get live sequence-wise gym members from central store
    const { members: storedMembers } = useGymMembers();

    // Members list state with sequence-wise Roll Numbers
    const [members, setMembers] = useState<GymMemberAttendance[]>([]);

    // Selected member for Detailed Attendance History Modal
    const [selectedMember, setSelectedMember] = useState<GymMemberAttendance | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | 'Present' | 'Absent' | 'Leave'>('All');

    // ── LOAD MEMBERS & ASSIGN UNIQUE SEQUENCE-WISE ROLL NUMBERS ─────────────────
    useEffect(() => {
        const mappedList: GymMemberAttendance[] = storedMembers.map((m, idx) => {
            const rollNo = m.rollNo || idx + 1;
            const generated = generateDetailedHistory(rollNo, m.name);
            return {
                rollNo,
                name: m.name,
                email: m.email,
                phone: m.phone,
                plan: m.plan,
                avatar: m.avatar,
                todayStatus: generated.todayStatus,
                todayCheckIn: generated.todayCheckIn,
                monthlyPresentDays: generated.monthlyPresentDays,
                monthlyAbsentDays: generated.monthlyAbsentDays,
                monthlyLeaveDays: generated.monthlyLeaveDays,
                attendanceRate: generated.attendanceRate,
                currentStreak: generated.currentStreak,
                avgDuration: '78 mins',
                history: generated.history,
            };
        });

        setMembers(mappedList);
    }, [storedMembers]);

    // ── QUICK ATTENDANCE STATUS UPDATE FOR TODAY ────────────────────────────────
    const handleStatusToggle = (rollNo: number, newStatus: AttendanceStatus) => {
        setMembers(prev =>
            prev.map(member => {
                if (member.rollNo !== rollNo) return member;

                const isNowPresent = newStatus === 'Present';
                const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Update today's record inside member history
                const updatedHistory = [...member.history];
                if (updatedHistory.length > 0) {
                    updatedHistory[0] = {
                        ...updatedHistory[0],
                        status: newStatus,
                        checkInTime: isNowPresent ? nowTime : undefined,
                        checkOutTime: isNowPresent ? 'In Session' : undefined,
                        activityZone: isNowPresent ? 'Gym Floor - General Workout' : undefined,
                        notes: `Updated by Reception to ${newStatus}`
                    };
                }

                let newPresent = member.monthlyPresentDays;
                let newAbsent = member.monthlyAbsentDays;
                let newLeave = member.monthlyLeaveDays;

                if (member.todayStatus === 'Present') newPresent = Math.max(0, newPresent - 1);
                if (member.todayStatus === 'Absent') newAbsent = Math.max(0, newAbsent - 1);
                if (member.todayStatus === 'Leave') newLeave = Math.max(0, newLeave - 1);

                if (newStatus === 'Present') newPresent++;
                if (newStatus === 'Absent') newAbsent++;
                if (newStatus === 'Leave') newLeave++;

                const totalDays = 30;
                const newRate = Math.round((newPresent / totalDays) * 100);

                const updatedMember: GymMemberAttendance = {
                    ...member,
                    todayStatus: newStatus,
                    todayCheckIn: isNowPresent ? nowTime : undefined,
                    monthlyPresentDays: newPresent,
                    monthlyAbsentDays: newAbsent,
                    monthlyLeaveDays: newLeave,
                    attendanceRate: newRate,
                    history: updatedHistory
                };

                // If this member is currently open in modal, update modal state too
                if (selectedMember && selectedMember.rollNo === rollNo) {
                    setSelectedMember(updatedMember);
                }

                return updatedMember;
            })
        );

        toast.success(`Roll No. ${rollNo} attendance marked as ${newStatus.toUpperCase()}`);
    };

    // ── FILTER MEMBERS LIST ─────────────────────────────────────────────────────
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch =
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.phone.includes(searchTerm) ||
                member.rollNo.toString() === searchTerm.trim() ||
                `#${member.rollNo}` === searchTerm.trim();

            const matchesStatus =
                statusFilter === 'All' || member.todayStatus === statusFilter;

            const matchesPlan =
                planFilter === 'All' || member.plan === planFilter;

            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [members, searchTerm, statusFilter, planFilter]);

    // ── SUMMARY STATS ───────────────────────────────────────────────────────────
    const totalCount = members.length;
    const presentToday = members.filter(m => m.todayStatus === 'Present').length;
    const absentToday = members.filter(m => m.todayStatus === 'Absent').length;
    const leaveToday = members.filter(m => m.todayStatus === 'Leave').length;
    const avgRate = totalCount > 0
        ? Math.round(members.reduce((acc, m) => acc + m.attendanceRate, 0) / totalCount)
        : 0;

    // Filtered history records in History Modal
    const modalFilteredHistory = useMemo(() => {
        if (!selectedMember) return [];
        return selectedMember.history.filter(record => {
            if (historyStatusFilter === 'All') return true;
            return record.status === historyStatusFilter;
        });
    }, [selectedMember, historyStatusFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* ── HEADER BANNER ───────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" /> Sequential Roll Call
                        </span>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                            {totalCount} Total Enrolled Members
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-white uppercase italic">
                        GYM MEMBERS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold-glow to-amber-300">ATTENDANCE DIRECTORY</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-body mt-1 max-w-3xl">
                        Comprehensive roll-call attendance system. Every member is assigned a unique sequential Roll No. Click <strong className="text-primary font-semibold">&quot;View Detailed History&quot;</strong> on any member to inspect full 30-day workout timelines.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            toast.success('Attendance directory refreshed from live check-in logs');
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-primary" /> Refresh Roll Call
                    </button>
                </div>
            </div>

            {/* ── QUICK METRICS STATS CARDS ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-primary/10 transition-colors" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled Members</span>
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-black text-white">{totalCount}</span>
                        <span className="text-xs text-slate-400 font-medium">Sequence Wise</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Roll No. 1 to Roll No. {totalCount}</p>
                </div>

                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Present Today</span>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-black text-emerald-400">{presentToday}</span>
                        <span className="text-xs text-slate-400 font-medium">Checked In</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">{Math.round((presentToday / (totalCount || 1)) * 100)}% attendance today</p>
                </div>

                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/10 transition-colors" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent / Not In</span>
                        <XCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-black text-rose-400">{absentToday}</span>
                        <span className="text-xs text-slate-400 font-medium">Missed Today</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">{leaveToday} member(s) on approved leave</p>
                </div>

                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-gold-glow/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-glow/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-gold-glow/10 transition-colors" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Avg. Rate</span>
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-black text-primary">{avgRate}%</span>
                        <span className="text-xs text-slate-400 font-medium">Overall Gym</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Consistent workout participation</p>
                </div>
            </div>

            {/* ── SEARCH, FILTERS & CONTROLS ──────────────────────────────────────── */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Roll No (e.g. 1, 12), Member Name, Phone or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all font-body"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter */}
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                        {(['All', 'Present', 'Absent', 'Leave'] as const).map(st => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                                    statusFilter === st
                                        ? 'bg-primary text-black shadow-sm font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    {/* Plan Filter */}
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value as any)}
                        className="bg-black border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-primary uppercase tracking-wider cursor-pointer shadow-lg [color-scheme:dark]"
                    >
                        <option value="All" className="bg-black text-white font-bold py-2">All Plans</option>
                        <option value="Premium" className="bg-black text-white font-bold py-2">Premium Plan</option>
                        <option value="Standard" className="bg-black text-white font-bold py-2">Standard Plan</option>
                        <option value="Basic" className="bg-black text-white font-bold py-2">Basic Plan</option>
                    </select>
                </div>
            </div>

            {/* ── GYM MEMBERS ATTENDANCE TABLE ────────────────────────────────────── */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 md:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">
                            Member Roll Call Directory <span className="text-slate-400 font-normal">({filteredMembers.length} Members)</span>
                        </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                        Showing Sequential Roll Nos
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/30 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                <th className="py-4 px-4 w-24">Roll No.</th>
                                <th className="py-4 px-4">Member Name & Contact</th>
                                <th className="py-4 px-4">Membership Plan</th>
                                <th className="py-4 px-4">Today&apos;s Attendance</th>
                                <th className="py-4 px-4">Check-In Time</th>
                                <th className="py-4 px-4">Monthly Rate & Streak</th>
                                <th className="py-4 px-4 text-right">Detailed History</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-slate-400">
                                        <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                        <p className="font-bold text-base text-white">No members found matching your search.</p>
                                        <p className="text-xs text-slate-500 mt-1">Try resetting your search query or status filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map(member => (
                                    <tr
                                        key={member.rollNo}
                                        className="hover:bg-white/[0.03] transition-colors group"
                                    >
                                        {/* ROLL NO. (UNIQUE & SEQUENCE WISE) */}
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center justify-center min-w-11 px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 font-mono font-black text-sm shadow-[0_0_12px_hsl(var(--gold)/0.15)] group-hover:bg-primary group-hover:text-black transition-all">
                                                #{String(member.rollNo).padStart(2, '0')}
                                            </span>
                                        </td>

                                        {/* MEMBER DETAILS */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/15 flex items-center justify-center font-black text-xs text-white shadow-md flex-shrink-0">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-heading font-bold text-sm text-white group-hover:text-primary transition-colors">
                                                        {member.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">
                                                        {member.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PLAN BADGE */}
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                                member.plan === 'Premium'
                                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                                    : member.plan === 'Standard'
                                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                                    : 'bg-slate-700/50 text-slate-300 border border-white/10'
                                            }`}>
                                                {member.plan}
                                            </span>
                                        </td>

                                        {/* TODAY'S ATTENDANCE TOGGLE */}
                                        <td className="py-4 px-4">
                                            <div className="inline-flex items-center bg-black/50 border border-white/10 rounded-xl p-1 gap-1">
                                                {(['Present', 'Absent', 'Leave'] as const).map(status => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => handleStatusToggle(member.rollNo, status)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1 ${
                                                            member.todayStatus === status
                                                                ? status === 'Present'
                                                                    ? 'bg-emerald-500 text-black font-black shadow-sm'
                                                                    : status === 'Absent'
                                                                    ? 'bg-rose-500 text-white font-black shadow-sm'
                                                                    : 'bg-amber-500 text-black font-black shadow-sm'
                                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {status === 'Present' && <Check className="w-3 h-3" />}
                                                        {status === 'Absent' && <X className="w-3 h-3" />}
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>

                                        {/* CHECK-IN TIME */}
                                        <td className="py-4 px-4">
                                            {member.todayStatus === 'Present' ? (
                                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                                                    <Clock className="w-3.5 h-3.5" /> {member.todayCheckIn || '07:45 AM'}
                                                </div>
                                            ) : member.todayStatus === 'Leave' ? (
                                                <span className="text-xs text-amber-400 font-semibold italic">On Leave</span>
                                            ) : (
                                                <span className="text-xs text-slate-500 font-mono">—</span>
                                            )}
                                        </td>

                                        {/* MONTHLY RATE & STREAK */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-mono font-bold text-white">{member.attendanceRate}% Rate</span>
                                                    <span className="font-bold text-primary flex items-center gap-1">
                                                        <Flame className="w-3.5 h-3.5 text-primary fill-primary" /> {member.currentStreak}d streak
                                                    </span>
                                                </div>
                                                <div className="w-32 bg-black/60 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            member.attendanceRate >= 85 ? 'bg-primary' : member.attendanceRate >= 70 ? 'bg-blue-400' : 'bg-amber-400'
                                                        }`}
                                                        style={{ width: `${member.attendanceRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* VIEW DETAILED HISTORY BUTTON */}
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setHistoryStatusFilter('All');
                                                    setIsHistoryModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/30 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm group-hover:shadow-[0_0_15px_hsl(var(--gold)/0.25)]"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View History
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── DETAILED ATTENDANCE HISTORY MODAL ───────────────────────────────── */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="max-w-4xl w-[94vw] bg-slate-900 border border-white/10 rounded-3xl p-0 overflow-hidden shadow-2xl max-h-[88vh] flex flex-col">
                    {selectedMember && (
                        <>
                            {/* Modal Header */}
                            <div className="p-6 md:p-7 bg-gradient-to-r from-black/80 via-slate-900 to-black border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-black border border-primary/40 flex items-center justify-center font-mono font-black text-xl text-primary shadow-[0_0_20px_hsl(var(--gold)/0.25)]">
                                        #{String(selectedMember.rollNo).padStart(2, '0')}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                                                Sequence Roll No. {selectedMember.rollNo}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                                {selectedMember.plan} Plan
                                            </span>
                                        </div>
                                        <DialogTitle className="text-2xl font-heading font-black text-white uppercase mt-1">
                                            {selectedMember.name} — <span className="text-primary font-normal">Attendance Log</span>
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-slate-400 font-mono">
                                            Phone: {selectedMember.phone} &bull; Email: {selectedMember.email}
                                        </DialogDescription>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toast.success(`Official Attendance Report exported for ${selectedMember.name} (Roll No. ${selectedMember.rollNo})`);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        <Download className="w-4 h-4 text-primary" /> Export Report
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content - Stats & Timeline */}
                            <div className="p-6 md:p-7 overflow-y-auto space-y-6 flex-1">
                                {/* 4 Key Summary Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                                        <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Present (Last 30 Days)</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-black text-emerald-400">{selectedMember.monthlyPresentDays} Days</span>
                                            <span className="text-xs text-slate-400 font-medium">({selectedMember.attendanceRate}%)</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                                        <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Absent / Missed</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-black text-rose-400">{selectedMember.monthlyAbsentDays} Days</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                                        <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Current Active Streak</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-black text-primary">{selectedMember.currentStreak} Days</span>
                                            <Flame className="w-4 h-4 text-primary fill-primary" />
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                                        <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Avg. Workout Session</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-black text-white">{selectedMember.avgDuration}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* History Filter Tabs */}
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-primary" /> Day-by-Day Check-In Log
                                    </h3>

                                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                                        {(['All', 'Present', 'Absent', 'Leave'] as const).map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setHistoryStatusFilter(status)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                                                    historyStatusFilter === status
                                                        ? 'bg-primary text-black font-black'
                                                        : 'text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Day-by-Day Table */}
                                <div className="border border-white/10 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-black/50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                                <th className="py-3 px-4">Date / Timeline</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Check-In</th>
                                                <th className="py-3 px-4">Check-Out</th>
                                                <th className="py-3 px-4">Duration</th>
                                                <th className="py-3 px-4">Activity Zone</th>
                                                <th className="py-3 px-4">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-xs">
                                            {modalFilteredHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                                        No check-in records found for this status filter.
                                                    </td>
                                                </tr>
                                            ) : (
                                                modalFilteredHistory.map((record, index) => (
                                                    <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-white">
                                                            {record.dateLabel}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                                record.status === 'Present'
                                                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                                    : record.status === 'Absent'
                                                                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                            }`}>
                                                                {record.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                                                                {record.status === 'Absent' && <XCircle className="w-3 h-3" />}
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                                                            {record.checkInTime || '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">
                                                            {record.checkOutTime || '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono text-slate-300">
                                                            {record.duration || '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-medium text-white">
                                                            {record.activityZone || <span className="text-slate-500 italic">Not Checked In</span>}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-400">
                                                            {record.notes}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 md:p-6 bg-black/60 border-t border-white/10 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-mono">
                                    Total Records Shown: {modalFilteredHistory.length} Days
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsHistoryModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
                                >
                                    Close History
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
