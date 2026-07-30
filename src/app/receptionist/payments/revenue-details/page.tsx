"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Search, Filter, Download, CreditCard, TrendingUp, AlertCircle, FileText, 
    CheckCircle2, X, ArrowLeft, ArrowUpRight, ArrowDownRight, IndianRupee, 
    Calendar, Users, ShoppingCart, Activity, ShieldCheck, ChevronDown, Check
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { getStoredTransactions, addTransaction, Transaction } from '@/lib/transactions-store';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const matchesDateRange = (rawDateStr: string, range: string, customStartDate?: string, customEndDate?: string) => {
    const d = new Date(rawDateStr);
    const now = new Date();
    const today = new Date();

    switch (range) {
        case 'Today':
            return isSameDay(d, today);
        case 'Yesterday': {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return isSameDay(d, yesterday);
        }
        case '7D': {
            const limit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return d >= limit;
        }
        case '30D': {
            const limit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return d >= limit;
        }
        case 'ThisMonth': {
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }
        case 'LastMonth': {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
        }
        case 'ThisYear': {
            return d.getFullYear() === now.getFullYear();
        }
        case 'Custom': {
            if (!customStartDate || !customEndDate) return true;
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            return d >= start && d <= end;
        }
        case 'All':
        default:
            return true;
    }
};

export default function RevenueDetailsPage({ backHref = "/receptionist/payments" }: { backHref?: string } = {}) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [dateRange, setDateRange] = useState<'All' | 'Today' | 'Yesterday' | '7D' | '30D' | 'ThisMonth' | 'LastMonth' | 'ThisYear' | 'Custom'>('All');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('All');
    const [selectedSource, setSelectedSource] = useState<string>('All');
    const [showMethodDropdown, setShowMethodDropdown] = useState(false);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Date dropdown positioning
    const dateBtnRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

    useEffect(() => {
        if (showDateDropdown && dateBtnRef.current) {
            const rect = dateBtnRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [showDateDropdown]);

    // Process Payment Modal State
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Credit/Debit Card' | 'Bank Transfer' | 'Other'>('UPI');
    const [revSource, setRevSource] = useState<'Memberships' | 'Personal Training' | 'Classes' | 'HYROX' | 'Product Sales'>('Memberships');
    const [receptionistName, setReceptionistName] = useState('Sarah Jenkins');

    useEffect(() => {
        setTransactions(getStoredTransactions());

        const handleUpdate = () => {
            setTransactions(getStoredTransactions());
        };

        window.addEventListener('storage_transactions_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('storage_transactions_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    // Filtered Completed transactions for Analytics
    const filteredCompleted = useMemo(() => {
        return transactions.filter(t => {
            if (t.status !== 'Completed') return false;
            
            const inDate = matchesDateRange(t.rawDate, dateRange, customStartDate, customEndDate);
            const inMethod = selectedMethod === 'All' || t.method === selectedMethod;
            const inSource = selectedSource === 'All' || t.source === selectedSource;
            
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 t.desc.toLowerCase().includes(searchTerm.toLowerCase());
            
            return inDate && inMethod && inSource && matchesSearch;
        });
    }, [transactions, dateRange, selectedMethod, selectedSource, searchTerm, customStartDate, customEndDate]);

    // Interval Card Stats
    const intervalStats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const filterSum = (filterFn: (t: Transaction) => boolean) => 
            transactions.filter(t => t.status === 'Completed' && filterFn(t)).reduce((sum, t) => sum + t.amount, 0);

        return {
            today: filterSum(t => new Date(t.rawDate).toDateString() === todayStr),
            weekly: filterSum(t => new Date(t.rawDate) >= sevenDaysAgo),
            monthly: filterSum(t => new Date(t.rawDate) >= thirtyDaysAgo),
            yearly: filterSum(t => new Date(t.rawDate) >= startOfYear)
        };
    }, [transactions]);

    // Trend Data Aggregation
    const trendData = useMemo(() => {
        const now = new Date();
        const completed = transactions.filter(t => t.status === 'Completed');

        if (dateRange === 'Today') {
            const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
            const baselines = [12000, 18500, 24000, 31000, 28000, 42000, 49000];
            const res = hours.map((h, i) => ({ label: h, Revenue: baselines[i] }));
            completed.forEach(t => {
                if (new Date(t.rawDate).toDateString() === now.toDateString()) {
                    const h = new Date(t.rawDate).getHours();
                    let slot = '08:00';
                    if (h >= 20) slot = '20:00';
                    else if (h >= 18) slot = '18:00';
                    else if (h >= 16) slot = '16:00';
                    else if (h >= 14) slot = '14:00';
                    else if (h >= 12) slot = '12:00';
                    else if (h >= 10) slot = '10:00';

                    const item = res.find(r => r.label === slot);
                    if (item) item.Revenue += t.amount;
                }
            });
            return res;
        }

        if (dateRange === 'Yesterday') {
            const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
            const baselines = [11000, 16000, 22000, 29000, 26000, 39000, 46000];
            const res = hours.map((h, i) => ({ label: h, Revenue: baselines[i] }));
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            completed.forEach(t => {
                if (new Date(t.rawDate).toDateString() === yesterdayStr) {
                    const h = new Date(t.rawDate).getHours();
                    let slot = '08:00';
                    if (h >= 20) slot = '20:00';
                    else if (h >= 18) slot = '18:00';
                    else if (h >= 16) slot = '16:00';
                    else if (h >= 14) slot = '14:00';
                    else if (h >= 12) slot = '12:00';
                    else if (h >= 10) slot = '10:00';

                    const item = res.find(r => r.label === slot);
                    if (item) item.Revenue += t.amount;
                }
            });
            return res;
        }

        if (dateRange === '7D') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const baselines = [42000, 48000, 53000, 49000, 61000, 68000, 75000];
            const res: { label: string; Revenue: number }[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                res.push({ label: days[d.getDay()], Revenue: baselines[6 - i] });
            }
            completed.forEach(t => {
                const txDate = new Date(t.rawDate);
                const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (24 * 60 * 60 * 1000));
                if (diffDays < 7) {
                    const dayName = days[txDate.getDay()];
                    const item = res.find(r => r.label === dayName);
                    if (item) item.Revenue += t.amount;
                }
            });
            return res;
        }

        if (dateRange === '30D') {
            const res = [
                { label: 'Week 1', Revenue: 125000 },
                { label: 'Week 2', Revenue: 142000 },
                { label: 'Week 3', Revenue: 168000 },
                { label: 'Week 4', Revenue: 195000 }
            ];
            completed.forEach(t => {
                const txDate = new Date(t.rawDate);
                const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (24 * 60 * 60 * 1000));
                if (diffDays < 30) {
                    if (diffDays <= 7) res[3].Revenue += t.amount;
                    else if (diffDays <= 14) res[2].Revenue += t.amount;
                    else if (diffDays <= 21) res[1].Revenue += t.amount;
                    else res[0].Revenue += t.amount;
                }
            });
            return res;
        }

        if (dateRange === 'ThisMonth' || dateRange === 'LastMonth') {
            const res = [
                { label: 'Week 1', Revenue: 125000 },
                { label: 'Week 2', Revenue: 142000 },
                { label: 'Week 3', Revenue: 168000 },
                { label: 'Week 4', Revenue: 195000 }
            ];
            const targetMonth = dateRange === 'ThisMonth' ? now.getMonth() : (now.getMonth() - 1 + 12) % 12;
            const targetYear = dateRange === 'ThisMonth' ? now.getFullYear() : (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

            completed.forEach(t => {
                const txDate = new Date(t.rawDate);
                if (txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear) {
                    const day = txDate.getDate();
                    if (day <= 7) res[0].Revenue += t.amount;
                    else if (day <= 14) res[1].Revenue += t.amount;
                    else if (day <= 21) res[2].Revenue += t.amount;
                    else res[3].Revenue += t.amount;
                }
            });
            return res;
        }

        if (dateRange === 'Custom') {
            if (!customStartDate || !customEndDate) return [];
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            const diffDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));

            if (diffDays <= 8) {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const res: { label: string; Revenue: number }[] = [];
                for (let i = 0; i <= diffDays; i++) {
                    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
                    res.push({ label: `${d.getDate()} ${days[d.getDay()]}`, Revenue: 35000 + i * 4000 });
                }
                completed.forEach(t => {
                    const txDate = new Date(t.rawDate);
                    if (txDate >= start && txDate <= end) {
                        const label = `${txDate.getDate()} ${days[txDate.getDay()]}`;
                        const item = res.find(r => r.label === label);
                        if (item) item.Revenue += t.amount;
                    }
                });
                return res;
            } else if (diffDays <= 45) {
                const weeksCount = Math.ceil(diffDays / 7);
                const res = Array.from({ length: weeksCount }, (_, i) => ({ label: `Week ${i + 1}`, Revenue: 110000 + i * 15000 }));
                completed.forEach(t => {
                    const txDate = new Date(t.rawDate);
                    if (txDate >= start && txDate <= end) {
                        const dDays = Math.floor((txDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
                        const wIdx = Math.min(weeksCount - 1, Math.floor(dDays / 7));
                        res[wIdx].Revenue += t.amount;
                    }
                });
                return res;
            } else {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const baselines = [320000, 345000, 380000, 410000, 435000, 460000, 510000, 540000, 580000, 620000, 670000, 720000];
                const res = months.map((m, i) => ({ label: m, Revenue: baselines[i] }));
                completed.forEach(t => {
                    const txDate = new Date(t.rawDate);
                    if (txDate >= start && txDate <= end) {
                        const mIdx = txDate.getMonth();
                        res[mIdx].Revenue += t.amount;
                    }
                });
                return res;
            }
        }

        // Yearly or All Time
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const baselines = [320000, 345000, 380000, 410000, 435000, 460000, 510000, 540000, 580000, 620000, 670000, 720000];
        const res = months.map((m, i) => ({ label: m, Revenue: baselines[i] }));
        completed.forEach(t => {
            const txDate = new Date(t.rawDate);
            const m = txDate.getMonth();
            res[m].Revenue += t.amount;
        });
        return res;
    }, [transactions, dateRange, customStartDate, customEndDate]);

    // Source Breakdown Data
    const sourceData = useMemo(() => {
        const sources = ['Memberships', 'Personal Training', 'Classes', 'HYROX', 'Product Sales'] as const;
        return sources.map(s => {
            const total = filteredCompleted.filter(t => t.source === s).reduce((sum, t) => sum + t.amount, 0);
            return { name: s, Revenue: total };
        });
    }, [filteredCompleted]);

    // Payment Method Breakdown Data
    const methodData = useMemo(() => {
        const methods = ['Cash', 'UPI', 'Credit/Debit Card', 'Bank Transfer', 'Other'] as const;
        const colors = {
            'Cash': '#10b981', // emerald
            'UPI': '#f59e0b', // amber
            'Credit/Debit Card': '#06b6d4', // cyan
            'Bank Transfer': '#6366f1', // indigo
            'Other': '#a855f7' // purple
        };
        return methods.map(m => {
            const total = filteredCompleted.filter(t => t.method === m).reduce((sum, t) => sum + t.amount, 0);
            return { name: m, value: total, color: colors[m] };
        }).filter(item => item.value > 0);
    }, [filteredCompleted]);

    // Separate Cash Transactions List (filtered by date range and search term)
    const cashTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (t.method !== 'Cash' || t.status !== 'Completed') return false;
            const inDate = matchesDateRange(t.rawDate, dateRange, customStartDate, customEndDate);
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 t.desc.toLowerCase().includes(searchTerm.toLowerCase());
            return inDate && matchesSearch;
        });
    }, [transactions, dateRange, searchTerm, customStartDate, customEndDate]);

    // Growth Analytics Calculations
    const growthAnalytics = useMemo(() => {
        const totalRev = filteredCompleted.reduce((sum, t) => sum + t.amount, 0);
        const txCount = filteredCompleted.length;
        const avgTicket = txCount > 0 ? Math.round(totalRev / txCount) : 0;
        
        // Cash share percentage
        const cashRev = filteredCompleted.filter(t => t.method === 'Cash').reduce((sum, t) => sum + t.amount, 0);
        const cashShare = totalRev > 0 ? Math.round((cashRev / totalRev) * 100) : 0;

        return {
            totalRev,
            txCount,
            avgTicket,
            cashShare
        };
    }, [filteredCompleted]);

    const handleProcessPayment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!memberName || !amount || !purpose) {
            toast.error('Please fill out all fields.');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Amount must be a positive number.');
            return;
        }

        addTransaction({
            name: memberName,
            amount: numericAmount,
            desc: purpose,
            status: 'Completed',
            method: payMethod,
            source: revSource,
            receptionist: receptionistName
        });

        toast.success(`Payment of ₹${numericAmount.toLocaleString('en-IN')} successfully processed!`);

        // Reset
        setMemberName('');
        setAmount('');
        setPurpose('');
        setPayMethod('UPI');
        setRevSource('Memberships');
        setReceptionistName('Sarah Jenkins');
        setShowProcessModal(false);

        // Force local state update
        setTransactions(getStoredTransactions());
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'Memberships': return <Users className="w-4 h-4 text-cyan-400" />;
            case 'Personal Training': return <Activity className="w-4 h-4 text-indigo-400" />;
            case 'Classes': return <Calendar className="w-4 h-4 text-rose-400" />;
            case 'HYROX': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case 'Product Sales': return <ShoppingCart className="w-4 h-4 text-amber-400" />;
            default: return <CreditCard className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Back Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link 
                        href={backHref}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">Revenue Analytics & Details</h1>
                        <p className="text-muted-foreground mt-1">Dedicated breakdown of facility earnings, collections, and channel metrics.</p>
                    </div>
                </div>
            </div>

            {/* Quick Interval Revenue Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today's Revenue</p>
                    <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">₹{intervalStats.today.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-emerald-500/70 mt-1 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Real-time updated
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-cyan-500/20">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Weekly Revenue</p>
                    <p className="text-2xl font-black text-cyan-400 mt-2 font-mono">₹{intervalStats.weekly.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Last 7 days completed</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-indigo-500/20">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monthly Revenue</p>
                    <p className="text-2xl font-black text-indigo-400 mt-2 font-mono">₹{intervalStats.monthly.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Last 30 days completed</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-amber-500/20">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Yearly Revenue</p>
                    <p className="text-2xl font-black text-amber-400 mt-2 font-mono">₹{intervalStats.yearly.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Year-to-date total</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-transparent via-primary/5 to-transparent border-white/5 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        />
                    </div>

                    {/* Date Filters Dropdown */}
                    <div className="relative flex-shrink-0">
                        <button 
                            ref={dateBtnRef}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setShowDateDropdown(prev => !prev); }}
                            className={`px-4 py-2 rounded-xl bg-white/5 border transition-all flex items-center gap-2 text-xs font-semibold ${
                                dateRange !== 'All' ? 'border-primary/40 text-primary bg-primary/5' : 'border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Date: {
                                dateRange === 'All' ? 'All Time' :
                                dateRange === 'Today' ? 'Today' :
                                dateRange === 'Yesterday' ? 'Yesterday' :
                                dateRange === '7D' ? 'Last 7 Days' :
                                dateRange === '30D' ? 'Last 30 Days' :
                                dateRange === 'ThisMonth' ? 'This Month' :
                                dateRange === 'LastMonth' ? 'Last Month' :
                                dateRange === 'ThisYear' ? 'This Year' :
                                'Custom Range'
                            }
                        </button>

                        {showDateDropdown && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowDateDropdown(false)} />
                                <div 
                                    className="fixed w-72 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2 duration-150 text-left"
                                    style={{ top: `${dropdownPos.top}px`, right: `${dropdownPos.right}px` }}
                                >
                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Select Date Range</h4>
                                    <div className="space-y-1">
                                        {[
                                            { label: 'All Time', value: 'All' },
                                            { label: 'Today', value: 'Today' },
                                            { label: 'Yesterday', value: 'Yesterday' },
                                            { label: 'Last 7 Days', value: '7D' },
                                            { label: 'Last 30 Days', value: '30D' },
                                            { label: 'This Month', value: 'ThisMonth' },
                                            { label: 'Last Month', value: 'LastMonth' },
                                            { label: 'This Year', value: 'ThisYear' },
                                            { label: 'Custom Range...', value: 'Custom' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    if (opt.value !== 'Custom') {
                                                        setDateRange(opt.value as 'All' | 'Today' | 'Yesterday' | '7D' | '30D' | 'ThisMonth' | 'LastMonth' | 'ThisYear' | 'Custom');
                                                        setShowDateDropdown(false);
                                                    } else {
                                                        setDateRange('Custom');
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex justify-between items-center ${
                                                    dateRange === opt.value 
                                                        ? 'bg-primary/10 text-primary border border-primary/20' 
                                                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                                                }`}
                                            >
                                                {opt.label}
                                                {dateRange === opt.value && <span className="text-primary font-bold">✓</span>}
                                            </button>
                                        ))}
                                    </div>

                                    {dateRange === 'Custom' && (
                                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-1">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Start Date</label>
                                                <input 
                                                    type="date" 
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">End Date</label>
                                                <input 
                                                    type="date" 
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!customStartDate || !customEndDate) {
                                                        toast.error('Please select both start and end dates.');
                                                        return;
                                                    }
                                                    if (new Date(customStartDate) > new Date(customEndDate)) {
                                                        toast.error('Start date cannot be after end date.');
                                                        return;
                                                    }
                                                    setShowDateDropdown(false);
                                                }}
                                                className="w-full py-2 rounded-xl bg-primary text-black font-black uppercase text-[10px] shadow-glow hover:bg-primary/95 transition-all mt-1"
                                            >
                                                Apply Custom Range
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center border-t border-white/5 pt-4">
                    {/* Method Filter */}
                    <div className="relative flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Method</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSourceDropdown(false);
                                setShowMethodDropdown(prev => !prev);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#11141c] hover:bg-[#181d28] border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-2 font-medium"
                        >
                            <span>{selectedMethod === 'All' ? 'All Methods' : selectedMethod}</span>
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                        </button>
                        {showMethodDropdown && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowMethodDropdown(false)} />
                                <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#11141c] border border-white/10 rounded-xl p-1.5 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                                    {[
                                        { label: 'All Methods', value: 'All' },
                                        { label: 'UPI', value: 'UPI' },
                                        { label: 'Cash', value: 'Cash' },
                                        { label: 'Credit/Debit Card', value: 'Credit/Debit Card' },
                                        { label: 'Bank Transfer', value: 'Bank Transfer' },
                                        { label: 'Other Methods', value: 'Other' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setSelectedMethod(opt.value);
                                                setShowMethodDropdown(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                                                selectedMethod === opt.value
                                                    ? 'bg-primary/15 text-primary font-bold'
                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {selectedMethod === opt.value && <Check className="w-3.5 h-3.5 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Source Filter */}
                    <div className="relative flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Source</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMethodDropdown(false);
                                setShowSourceDropdown(prev => !prev);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#11141c] hover:bg-[#181d28] border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-2 font-medium"
                        >
                            <span>{selectedSource === 'All' ? 'All Sources' : selectedSource}</span>
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                        </button>
                        {showSourceDropdown && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowSourceDropdown(false)} />
                                <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#11141c] border border-white/10 rounded-xl p-1.5 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                                    {[
                                        { label: 'All Sources', value: 'All' },
                                        { label: 'Memberships', value: 'Memberships' },
                                        { label: 'Personal Training', value: 'Personal Training' },
                                        { label: 'Classes', value: 'Classes' },
                                        { label: 'HYROX', value: 'HYROX' },
                                        { label: 'Product Sales', value: 'Product Sales' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setSelectedSource(opt.value);
                                                setShowSourceDropdown(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                                                selectedSource === opt.value
                                                    ? 'bg-primary/15 text-primary font-bold'
                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {selectedSource === opt.value && <Check className="w-3.5 h-3.5 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Growth Analytics Summary Box */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Total Period Earnings</span>
                    <span className="text-xl font-bold text-white font-mono">₹{growthAnalytics.totalRev.toLocaleString('en-IN')}</span>
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Transaction Volume</span>
                    <span className="text-xl font-bold text-white font-mono">{growthAnalytics.txCount} txs</span>
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Average Ticket Size</span>
                    <span className="text-xl font-bold text-white font-mono">₹{growthAnalytics.avgTicket.toLocaleString('en-IN')}</span>
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Cash Collection Share</span>
                    <span className="text-xl font-bold text-primary font-mono">{growthAnalytics.cashShare}%</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart (Line/Area) */}
                <div className="glass-card rounded-2xl border border-white/5 p-5 lg:col-span-2 relative overflow-hidden min-w-0 w-full">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Revenue Growth Trend</h3>
                    <div className="h-[260px] w-full min-w-0 mt-2">
                        <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={200}>
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevDetails" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `₹${v >= 1000 ? v/1000 + 'k' : v}`} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                                                    <p className="text-sm font-black text-emerald-400 font-mono">₹{payload[0].value?.toLocaleString('en-IN')}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevDetails)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Method Breakdown Pie Chart */}
                <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col justify-between min-w-0 w-full">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Payment Methods</h3>
                    <div className="h-[220px] w-full min-w-0 relative flex items-center justify-center">
                        {methodData.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center">No payment data</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220} minWidth={100} minHeight={150}>
                                <PieChart>
                                    <Pie
                                        data={methodData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {methodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-900 border border-white/10 p-2.5 rounded-lg text-xs font-black">
                                                        <span style={{ color: data.color }} className="uppercase tracking-wider">{data.name}:</span>
                                                        <span className="ml-2 font-mono text-white">₹{data.value?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                        {methodData.map(m => (
                            <div key={m.name} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                                <span>{m.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Source Breakdown Chart */}
            <div className="glass-card rounded-2xl border border-white/5 p-5 min-w-0 w-full">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Revenue Streams Breakdown</h3>
                <div className="h-[220px] w-full min-w-0 mt-2">
                    <ResponsiveContainer width="100%" height={220} minWidth={100} minHeight={180}>
                        <BarChart data={sourceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} tickFormatter={(v) => `₹${v >= 1000 ? v/1000 + 'k' : v}`} />
                            <RechartsTooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                                                <p className="text-sm font-black text-primary font-mono">₹{payload[0].value?.toLocaleString('en-IN')}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="Revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40}>
                                {sourceData.map((entry, index) => {
                                    const colors = ['#06b6d4', '#6366f1', '#f43f5e', '#10b981', '#f59e0b'];
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Separate Cash Payments Section */}
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Dedicated Cash Collections
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Separate logs of cash payments collected by receptionists.</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Total Cash: ₹{cashTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 border-b border-white/10 text-muted-foreground text-xs font-semibold">
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Member Name</th>
                                <th className="p-4">Amount Paid</th>
                                <th className="p-4">Purpose of Payment</th>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Collected By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                            {cashTransactions.map(trx => (
                                <tr key={trx.id} className="hover:bg-emerald-500/5 transition-colors">
                                    <td className="p-4 font-mono text-slate-400">{trx.id}</td>
                                    <td className="p-4 font-bold text-white">{trx.name}</td>
                                    <td className="p-4 font-black text-emerald-400 font-mono">₹{trx.amount.toLocaleString()}</td>
                                    <td className="p-4 text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                            {getSourceIcon(trx.source)}
                                            {trx.desc}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400">{trx.date}</td>
                                    <td className="p-4">
                                        <span className="bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg">
                                            👤 {trx.receptionist}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {cashTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No cash transactions found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* General Filtered Transactions List */}
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-slate-950/20">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Filtered Revenue Ledger</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Audit log of all completed transactions matching current filters.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 border-b border-white/10 text-muted-foreground text-xs font-semibold">
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Member</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payment Method</th>
                                <th className="p-4">Revenue Stream</th>
                                <th className="p-4">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                            {filteredCompleted.map(trx => (
                                <tr key={trx.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4 font-mono text-slate-400">{trx.id}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-white">{trx.name}</p>
                                        <p className="text-[10px] text-slate-500 font-semibold">{trx.desc}</p>
                                    </td>
                                    <td className="p-4 font-black text-white font-mono">₹{trx.amount.toLocaleString()}</td>
                                    <td className="p-4 text-slate-300">
                                        <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                                            {trx.method}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                            {getSourceIcon(trx.source)}
                                            {trx.source}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400">{trx.date}</td>
                                </tr>
                            ))}
                            {filteredCompleted.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No matching transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PROCESS PAYMENT MODAL */}
            {showProcessModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowProcessModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="p-6 border-b border-white/5 bg-black/20">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" /> Process New Payment
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Receive payment and record the transaction in the system.</p>
                        </div>

                        <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Member Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. John Doe"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Amount Paid (₹)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1"
                                        placeholder="e.g. 5000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Receptionist</label>
                                    <select 
                                        value={receptionistName}
                                        onChange={(e) => setReceptionistName(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Sarah Jenkins">Sarah Jenkins</option>
                                        <option value="Michael Chen">Michael Chen</option>
                                        <option value="Emma Wilson">Emma Wilson</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Payment Method</label>
                                    <select 
                                        value={payMethod}
                                        onChange={(e) => setPayMethod(e.target.value as 'Cash' | 'UPI' | 'Credit/Debit Card' | 'Bank Transfer' | 'Other')}
                                        className="w-full bg-[#11141c] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-primary/50 transition-colors"
                                        style={{ backgroundColor: "#11141c", color: "#e2e8f0" }}
                                    >
                                        <option value="UPI" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>UPI</option>
                                        <option value="Cash" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Cash</option>
                                        <option value="Credit/Debit Card" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Credit/Debit Card</option>
                                        <option value="Bank Transfer" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Bank Transfer</option>
                                        <option value="Other" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Other Methods</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Revenue Source</label>
                                    <select 
                                        value={revSource}
                                        onChange={(e) => setRevSource(e.target.value as 'Memberships' | 'Personal Training' | 'Classes' | 'HYROX' | 'Product Sales')}
                                        className="w-full bg-[#11141c] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-primary/50 transition-colors"
                                        style={{ backgroundColor: "#11141c", color: "#e2e8f0" }}
                                    >
                                        <option value="Memberships" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Memberships</option>
                                        <option value="Personal Training" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Personal Training</option>
                                        <option value="Classes" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Classes</option>
                                        <option value="HYROX" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>HYROX</option>
                                        <option value="Product Sales" style={{ backgroundColor: "#11141c", color: "#cbd5e1" }}>Product Sales</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Description / Purpose</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Standard Plan (Monthly) or Whey Protein"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => setShowProcessModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider transition-colors shadow-glow hover:bg-primary/95"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
