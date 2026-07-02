'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, Star, ShoppingBag, Coffee,
    IndianRupee, TrendingUp, Award, Calendar, CreditCard,
    CheckCircle2, Clock, XCircle, ChevronRight, Wallet,
    Banknote, Package, ArrowUpRight, Receipt, Gift, Utensils
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    CUSTOMERS, TIER_CONFIG, getLifetimeSpend, getLoyaltyTier,
    calcLoyaltyPoints, getTierProgress, getMonthlySpend,
    type Customer, type LoyaltyTier, type PaymentMethod
} from '@/lib/customer-data';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const TIER_EMOJI: Record<LoyaltyTier, string> = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };

const PAY_ICON: Record<PaymentMethod, React.ElementType> = {
    Cash: Banknote, UPI: Wallet, Card: CreditCard, Wallet: Wallet,
};

function StatusBadge({ status }: { status: string }) {
    if (status === 'Paid')     return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"><CheckCircle2 className="w-2.5 h-2.5 mr-1"/>Paid</Badge>;
    if (status === 'Pending')  return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"><Clock className="w-2.5 h-2.5 mr-1"/>Pending</Badge>;
    return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]"><XCircle className="w-2.5 h-2.5 mr-1"/>Refunded</Badge>;
}

function TierBadge({ tier }: { tier: LoyaltyTier }) {
    const cfg = TIER_CONFIG[tier];
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {TIER_EMOJI[tier]} {tier}
        </span>
    );
}

// ─── Customer Card ─────────────────────────────────────────────────────────────

function CustomerCard({ customer, selected, onClick }: { customer: Customer; selected: boolean; onClick: () => void }) {
    const spend = getLifetimeSpend(customer);
    const tier = getLoyaltyTier(spend);
    const points = calcLoyaltyPoints(customer);
    const cfg = TIER_CONFIG[tier];
    return (
        <button onClick={onClick}
            className={`w-full text-left px-4 py-4 rounded-2xl border transition-all duration-200 group ${selected
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]'
                : 'border-white/5 hover:bg-white/[0.02] hover:border-white/10'
            }`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{customer.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{customer.memberId}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm font-black text-white">{fmt(spend)}</p>
                    <p className={`text-[10px] font-bold ${cfg.color}`}>{points} pts</p>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <TierBadge tier={tier} />
                <span className="text-[10px] text-slate-600">{customer.purchases.length} orders</span>
            </div>
        </button>
    );
}

// ─── Profile Panel ─────────────────────────────────────────────────────────────

function ProfilePanel({ customer }: { customer: Customer }) {
    const [statusFilter, setStatusFilter] = useState('All');
    const [payFilter, setPayFilter] = useState('All');

    const spend = getLifetimeSpend(customer);
    const tier = getLoyaltyTier(spend);
    const points = calcLoyaltyPoints(customer);
    const { pct, remaining } = getTierProgress(spend);
    const cfg = TIER_CONFIG[tier];
    const monthly = getMonthlySpend(customer);

    const paidOrders = customer.purchases.filter(p => p.status === 'Paid');
    const avgOrder = paidOrders.length > 0 ? paidOrders.reduce((s, p) => s + p.total, 0) / paidOrders.length : 0;
    const lastPurchase = customer.purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const favProduct = (() => {
        const freq: Record<string, number> = {};
        customer.purchases.forEach(p => p.items.forEach(i => { freq[i.name] = (freq[i.name] || 0) + i.qty; }));
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    })();

    const filteredPurchases = useMemo(() => customer.purchases
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter(p => (statusFilter === 'All' || p.status === statusFilter) && (payFilter === 'All' || p.paymentMethod === payFilter)),
        [customer, statusFilter, payFilter]);

    return (
        <motion.div key={customer.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
            {/* Header */}
            <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center gap-6 ${cfg.bg} ${cfg.border}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-black text-white">{customer.name}</h2>
                        <TierBadge tier={tier} />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                        <span>{customer.email}</span>
                        <span>{customer.phone}</span>
                        <span className="font-mono">{customer.memberId}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>Since {new Date(customer.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</span>
                    </div>
                </div>
                <div className="flex gap-6 shrink-0">
                    <div className="text-center">
                        <p className="text-2xl font-black text-white">{fmt(spend)}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Lifetime Spend</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-black ${cfg.color}`}>{points}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Loyalty Pts</p>
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', val: customer.purchases.length, icon: Receipt, color: 'emerald' },
                    { label: 'Avg Order', val: fmt(avgOrder), icon: IndianRupee, color: 'teal' },
                    { label: 'Fav Product', val: favProduct, icon: Star, color: 'yellow', small: true },
                    { label: 'Last Purchase', val: lastPurchase ? new Date(lastPurchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—', icon: Calendar, color: 'cyan' },
                ].map(k => {
                    const Icon = k.icon;
                    return (
                        <div key={k.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{k.label}</p>
                                <Icon className={`w-3.5 h-3.5 text-${k.color}-400`} />
                            </div>
                            <p className={`font-black text-white ${k.small ? 'text-sm truncate' : 'text-xl'}`}>{k.val}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Spending Chart */}
                <div className="md:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">6-Month Spend</p>
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={monthly} barSize={28}>
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 11 }}
                                formatter={(v: number) => [fmt(v), 'Spend']}
                                cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                            />
                            <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                                {monthly.map((_, i) => (
                                    <Cell key={i} fill={_ .spend > 0 ? '#10b981' : '#1e293b'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Loyalty Card */}
                <div className={`bg-slate-900/50 border rounded-2xl p-5 flex flex-col gap-4 ${cfg.border}`}>
                    <div className="flex items-center gap-2">
                        <Gift className={`w-4 h-4 ${cfg.color}`} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loyalty Status</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className={`text-lg font-black ${cfg.color}`}>{TIER_EMOJI[tier]} {tier}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${tier === 'Platinum' ? 'bg-emerald-400' : tier === 'Gold' ? 'bg-yellow-400' : tier === 'Silver' ? 'bg-slate-300' : 'bg-amber-600'}`} />
                        </div>
                        {cfg.next && <p className="text-[10px] text-slate-500 mt-2">{fmt(remaining)} to {cfg.next}</p>}
                    </div>
                    <div className="border-t border-white/5 pt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Points Balance</span>
                            <span className={`font-black ${cfg.color}`}>{points} pts</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Points Rate</span>
                            <span className="text-white font-bold">{cfg.rate}x / ₹100</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Redeemable</span>
                            <span className="text-emerald-400 font-bold">{fmt(Math.floor(points / 10))}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase History */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Purchase History</p>
                    <div className="flex gap-2 flex-wrap">
                        {['All', 'Paid', 'Pending', 'Refunded'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${statusFilter === s ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                                {s}
                            </button>
                        ))}
                        <span className="h-5 w-px bg-white/10 self-center" />
                        {['All', 'Cash', 'UPI', 'Card', 'Wallet'].map(p => (
                            <button key={p} onClick={() => setPayFilter(p)}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${payFilter === p ? 'bg-teal-500/20 border-teal-500/30 text-teal-400' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredPurchases.length === 0 && (
                        <div className="py-12 text-center text-slate-600 text-sm">No purchases match the selected filters.</div>
                    )}
                    {filteredPurchases.map(p => {
                        const PayIcon = PAY_ICON[p.paymentMethod];
                        return (
                            <div key={p.invoiceId} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${p.department === 'Store' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                            {p.department === 'Store'
                                                ? <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                                                : <Coffee className="w-3.5 h-3.5 text-emerald-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-mono font-bold ${p.department === 'Store' ? 'text-indigo-400' : 'text-emerald-400'}`}>{p.invoiceId}</span>
                                                <StatusBadge status={p.status} />
                                                <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 flex items-center gap-0.5 ${p.department === 'Store' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
                                                    {p.department}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {new Date(p.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {p.items.map((item, i) => (
                                                    <span key={i} className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
                                                        {item.qty}× {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-white">{fmt(p.total)}</p>
                                        <div className="flex items-center gap-1 justify-end mt-1 text-[10px] text-slate-500">
                                            <PayIcon className="w-3 h-3" /> {p.paymentMethod}
                                        </div>
                                        {p.pointsEarned > 0 && (
                                            <p className="text-[10px] text-yellow-500 mt-1 font-bold">+{p.pointsEarned} pts</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CafeCustomersPage() {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<LoyaltyTier | 'All'>('All');
    const [selected, setSelected] = useState<Customer>(CUSTOMERS[0]);

    const filtered = useMemo(() => CUSTOMERS
        .map(c => ({ c, spend: getLifetimeSpend(c), tier: getLoyaltyTier(getLifetimeSpend(c)) }))
        .filter(({ c, tier }) => {
            const q = search.toLowerCase();
            const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.memberId.toLowerCase().includes(q);
            const matchT = tierFilter === 'All' || tier === tierFilter;
            return matchQ && matchT;
        })
        .sort((a, b) => b.spend - a.spend),
        [search, tierFilter]);

    const totalSpend = CUSTOMERS.reduce((s, c) => s + getLifetimeSpend(c), 0);
    const totalPts = CUSTOMERS.reduce((s, c) => s + calcLoyaltyPoints(c), 0);

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Customer Relationship</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                        Loyalty <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 not-italic">& Insights</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium tracking-wide">Manage cafe members, track loyalty points, and spending habits.</p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-xl font-black text-white">{fmt(totalSpend)}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Aggregate Spend</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-emerald-400">{totalPts.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Points Issued</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left — Customer Roster */}
                <div className="lg:col-span-4 space-y-3">
                    {/* Search + Tier Filter */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, email, ID..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600"
                            />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {(['All', 'Platinum', 'Gold', 'Silver', 'Bronze'] as const).map(t => (
                                <button key={t} onClick={() => setTierFilter(t)}
                                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all ${tierFilter === t ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'border-white/5 text-slate-600 hover:border-white/10 hover:text-slate-400'}`}>
                                    {t !== 'All' && TIER_EMOJI[t as LoyaltyTier]} {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="h-[calc(100vh-320px)]">
                        <div className="space-y-2 pr-1">
                            {filtered.length === 0 && (
                                <div className="py-12 text-center text-slate-600 text-sm">No customers found.</div>
                            )}
                            {filtered.map(({ c }) => (
                                <CustomerCard key={c.id} customer={c} selected={selected?.id === c.id} onClick={() => setSelected(c)} />
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right — Profile */}
                <div className="lg:col-span-8">
                    <ScrollArea className="h-[calc(100vh-260px)]">
                        <div className="pr-1">
                            <AnimatePresence mode="wait">
                                {selected && <ProfilePanel key={selected.id} customer={selected} />}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
