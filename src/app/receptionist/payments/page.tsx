"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, CreditCard, TrendingUp, AlertCircle, FileText, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getStoredTransactions, addTransaction, Transaction } from '@/lib/transactions-store';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const matchesDateRange = (rawDateStr: string, range: string, customStart?: string, customEnd?: string) => {
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
            if (!customStart || !customEnd) return true;
            const start = new Date(customStart);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
            return d >= start && d <= end;
        }
        case 'All':
        default:
            return true;
    }
};

export default function PaymentsPanel() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Date filter dropdown state
    const [dateRange, setDateRange] = useState<'All' | 'Today' | 'Yesterday' | '7D' | '30D' | 'ThisMonth' | 'LastMonth' | 'ThisYear' | 'Custom'>('All');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    // Process Payment Modal State
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Credit/Debit Card' | 'Bank Transfer' | 'Other'>('UPI');
    const [revSource, setRevSource] = useState<'Memberships' | 'Personal Training' | 'Classes' | 'HYROX' | 'Product Sales'>('Memberships');
    const [receptionistName, setReceptionistName] = useState('Sarah Jenkins');

    useEffect(() => {
        // Load initial transactions
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

    const filteredTransactions = useMemo(() => {
        return transactions.filter(trx => {
            const matchesSearch = trx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trx.desc.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' ||
                (filterStatus === 'Installment'
                    ? (trx.paymentMethodType === 'Installment Payment' ||
                       trx.status === 'Partially Paid' ||
                       trx.status === 'Installment' ||
                       trx.status === 'Pending' ||
                       !!trx.installmentDetails)
                    : trx.status === filterStatus);

            // Filter by Date
            const matchesDate = matchesDateRange(trx.rawDate, dateRange, customStartDate, customEndDate);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [transactions, searchTerm, filterStatus, dateRange, customStartDate, customEndDate]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Paid':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Installment':
            case 'Partially Paid':
            case 'Pending':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Failed':
                return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Paid':
                return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'Installment':
            case 'Partially Paid':
            case 'Pending':
                return <TrendingUp className="w-3.5 h-3.5" />;
            case 'Failed':
                return <AlertCircle className="w-3.5 h-3.5" />;
            default:
                return null;
        }
    };

    // Calculate real-time stats
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayCompleted = transactions.filter(t => t.status === 'Completed' && new Date(t.rawDate).toDateString() === today);
        const todayRevenue = todayCompleted.reduce((sum, t) => sum + t.amount, 0);

        const last7DaysCompleted = transactions.filter(t => t.status === 'Completed' && new Date(t.rawDate) >= sevenDaysAgo);
        const last7DaysCount = last7DaysCompleted.length;
        const last7DaysAvg = last7DaysCount > 0 ? Math.round(last7DaysCompleted.reduce((sum, t) => sum + t.amount, 0) / last7DaysCount) : 0;

        const pendingClearing = transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
        
        const failedTrx = transactions.filter(t => t.status === 'Failed');
        const failedCount = failedTrx.length;
        const failedTotal = failedTrx.reduce((sum, t) => sum + t.amount, 0);

        return {
            todayRevenue,
            last7DaysCount,
            last7DaysAvg,
            pendingClearing,
            failedCount,
            failedTotal
        };
    }, [transactions]);

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

    // ── CSV EXPORT ──────────────────────────────────────────────────────────────
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            toast.error('No records to export for the current filter selection.');
            return;
        }

        setIsExporting(true);

        try {
            // Build a human-readable filter summary for the audit header
            const filterLabel = (() => {
                const parts: string[] = [];
                if (dateRange !== 'All') {
                    const labels: Record<string, string> = {
                        Today: 'Today', Yesterday: 'Yesterday', '7D': 'Last 7 Days',
                        '30D': 'Last 30 Days', ThisMonth: 'This Month', LastMonth: 'Last Month',
                        ThisYear: 'This Year', Custom: `${customStartDate} to ${customEndDate}`,
                    };
                    parts.push(`Date Range: ${labels[dateRange] ?? dateRange}`);
                }
                if (filterStatus !== 'All') parts.push(`Status: ${filterStatus}`);
                if (searchTerm) parts.push(`Search: "${searchTerm}"`);
                return parts.length ? parts.join(' | ') : 'All Records';
            })();

            const exportedAt = new Date().toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });

            // Utility: escape a cell value for CSV (handles commas, quotes, newlines)
            const esc = (val: string | number | undefined | null): string => {
                const s = String(val ?? '');
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            // Utility: derive membership start / expiry from payment date & plan source
            const getMembershipDates = (rawDate: string, source: string) => {
                const payDate = new Date(rawDate);
                const isMembership = source === 'Memberships';
                if (!isMembership) return { start: 'N/A', expiry: 'N/A' };
                const start = payDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                const expiryDate = new Date(payDate);
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                const expiry = expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                return { start, expiry };
            };

            // ── Audit Header ──────────────────────────────────────────────────────
            const auditLines = [
                `"ZENITH FITNESS — PAYMENT EXPORT REPORT"`,
                `"Generated At:","${exportedAt}"`,
                `"Filter Applied:","${filterLabel}"`,
                `"Total Records Exported:","${filteredTransactions.length}"`,
                `"Total Amount (Completed):","INR ${filteredTransactions
                    .filter(t => t.status === 'Completed')
                    .reduce((s, t) => s + t.amount, 0)
                    .toLocaleString('en-IN')}"`,
                `""`, // blank separator row
            ];

            // ── Column Headers ────────────────────────────────────────────────────
            const headers = [
                'Receipt ID',
                'Member Name',
                'Revenue Source / Plan',
                'Description',
                'Amount Paid (INR)',
                'Payment Method',
                'Payment Date',
                'Payment Time',
                'Membership Start Date',
                'Membership Expiry Date',
                'Payment Status',
                'Collected By',
                'Notes',
            ].map(esc).join(',');

            // ── Data Rows ─────────────────────────────────────────────────────────
            const rows = filteredTransactions.map(trx => {
                const d = new Date(trx.rawDate);
                const payDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                const payTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                const { start, expiry } = getMembershipDates(trx.rawDate, trx.source);
                const notes = trx.status === 'Failed'
                    ? 'Payment failed — follow up required'
                    : trx.status === 'Pending'
                    ? 'Awaiting payment clearance'
                    : '';

                return [
                    trx.id,
                    trx.name,
                    trx.source,
                    trx.desc,
                    trx.amount,
                    trx.method,
                    payDate,
                    payTime,
                    start,
                    expiry,
                    trx.status,
                    trx.receptionist,
                    notes,
                ].map(esc).join(',');
            });

            const csvContent = [
                ...auditLines,
                headers,
                ...rows,
            ].join('\n');

            // ── Trigger Download ──────────────────────────────────────────────────
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const safeDateLabel = exportedAt.replace(/[/:,\s]+/g, '_').replace(/_+$/, '');
            link.href = url;
            link.download = `Zenith_Payments_${safeDateLabel}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${filteredTransactions.length} records successfully!`);
        } catch (err) {
            console.error('CSV export failed:', err);
            toast.error('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };
    // ────────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Payments & Billing</h1>
                    <p className="text-muted-foreground mt-1">Review facility transactions and process dues.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Exporting…
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export CSV
                                {filteredTransactions.length > 0 && (
                                    <span className="ml-1 text-[10px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                                        {filteredTransactions.length}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link 
                    href="/receptionist/payments/revenue-details" 
                    className="glass-card rounded-2xl p-5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent hover:border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer block group relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground group-hover:text-emerald-400 transition-colors">Today's Revenue</p>
                        <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">₹{stats.todayRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-emerald-500/70 mt-2">Click to view details →</p>
                </Link>

                <div className="glass-card rounded-2xl p-5 border-primary/10">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">Transactions (7d)</p>
                        <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.last7DaysCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Avg. transaction: ₹{stats.last7DaysAvg.toLocaleString('en-IN')}</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-amber-500/20">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">Pending clearing</p>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-3xl font-bold text-amber-400">₹{stats.pendingClearing.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-amber-500/70 mt-2">Cleared within 48h</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border-rose-500/20">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">Failed (Action Req)</p>
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-3xl font-bold text-rose-400">{stats.failedCount}</p>
                    <p className="text-xs text-rose-500/70 mt-2">Totaling ₹{stats.failedTotal.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or TRX ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner animate-in fade-in"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Status Pills - scrollable */}
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 flex-1 md:flex-none">
                        {['All', 'Completed', 'Installment', 'Failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Date Dropdown - outside overflow-x-auto so it renders freely */}
                    <div className="relative flex-shrink-0">
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setShowDateDropdown(prev => !prev); }}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border transition-all flex items-center gap-2 text-sm font-medium ${
                                dateRange !== 'All' ? 'border-primary/40 text-primary bg-primary/5' : 'border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
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
                                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2 duration-150 text-left">
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
            </div>

            {/* Transactions Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 border-b border-primary/10">
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Transaction ID</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Member & Description</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Amount</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Date & Method</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredTransactions.map((trx) => (
                                <tr key={trx.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-mono text-sm text-slate-300">{trx.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-foreground">{trx.name}</div>
                                        <div className="text-xs text-muted-foreground">{trx.desc}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-foreground">₹{trx.amount.toLocaleString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full border flex items-center gap-1.5 w-fit ${getStatusStyle(trx.status)}`}>
                                            {getStatusIcon(trx.status)}
                                            {(trx.paymentMethodType === 'Installment Payment' || trx.status === 'Partially Paid' || trx.status === 'Installment' || trx.status === 'Pending' || !!trx.installmentDetails) ? 'Installment' : trx.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-300">{trx.date}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <CreditCard className="w-3 h-3" />
                                            {trx.method}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-foreground">
                                                Receipt
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No transactions found matching your criteria.
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
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Credit/Debit Card">Credit/Debit Card</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Other">Other Methods</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Revenue Source</label>
                                    <select 
                                        value={revSource}
                                        onChange={(e) => setRevSource(e.target.value as 'Memberships' | 'Personal Training' | 'Classes' | 'HYROX' | 'Product Sales')}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Memberships">Memberships</option>
                                        <option value="Personal Training">Personal Training</option>
                                        <option value="Classes">Classes</option>
                                        <option value="HYROX">HYROX</option>
                                        <option value="Product Sales">Product Sales</option>
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
