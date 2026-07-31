'use client';

import { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Legend
} from 'recharts';
import { 
    TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight, 
    Activity, Calendar, BarChart3, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ExecutiveRevenueRange = 'Today' | 'This Week' | 'This Month';

interface ExecutiveRevenuePoint {
    label: string;
    current: number;
    previous: number;
}

interface ExecutiveRevenueSummary {
    range: ExecutiveRevenueRange;
    total: number;
    previousPeriodTotal: number;
    growth: number;
    periodLabel: string;
    averageRate: string;
    data: ExecutiveRevenuePoint[];
}

const fmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
};

const getExecutiveRevenueData = (range: ExecutiveRevenueRange): ExecutiveRevenueSummary => {
    switch (range) {
        case 'Today':
            return {
                range,
                total: 68500,
                previousPeriodTotal: 59980,
                growth: 14.2,
                periodLabel: 'vs Yesterday',
                averageRate: '₹11,416 / hour',
                data: [
                    { label: '06:00', current: 4500, previous: 3800 },
                    { label: '09:00', current: 14200, previous: 11500 },
                    { label: '12:00', current: 11000, previous: 9800 },
                    { label: '15:00', current: 9800, previous: 9100 },
                    { label: '18:00', current: 18500, previous: 16200 },
                    { label: '21:00', current: 10500, previous: 9580 },
                ]
            };
        case 'This Week':
            return {
                range,
                total: 485000,
                previousPeriodTotal: 430000,
                growth: 12.8,
                periodLabel: 'vs Last Week',
                averageRate: '₹69,285 / day',
                data: [
                    { label: 'Mon', current: 69000, previous: 61000 },
                    { label: 'Tue', current: 71000, previous: 64000 },
                    { label: 'Wed', current: 74000, previous: 66000 },
                    { label: 'Thu', current: 64000, previous: 59000 },
                    { label: 'Fri', current: 88000, previous: 76000 },
                    { label: 'Sat', current: 69000, previous: 60000 },
                    { label: 'Sun', current: 50000, previous: 44000 },
                ]
            };
        case 'This Month':
            return {
                range,
                total: 2150000,
                previousPeriodTotal: 1863000,
                growth: 15.4,
                periodLabel: 'vs Last Month',
                averageRate: '₹5,37,500 / week',
                data: [
                    { label: 'Week 1', current: 510000, previous: 445000 },
                    { label: 'Week 2', current: 495000, previous: 438000 },
                    { label: 'Week 3', current: 605000, previous: 520000 },
                    { label: 'Week 4', current: 540000, previous: 460000 },
                ]
            };
    }
};

export default function RevenueOverview() {
    const range: ExecutiveRevenueRange = 'Today';
    const revenue = useMemo(() => getExecutiveRevenueData(range), [range]);
    const isPositive = revenue.growth >= 0;
    const netDifference = revenue.total - revenue.previousPeriodTotal;

    return (
        <div className="glass-card rounded-3xl border border-primary/10 p-6 sm:p-8 shadow-soft relative overflow-hidden group h-full flex flex-col justify-between">
            {/* Decorative Luxury Radial Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_hsl(45_95%_55%/0.08),_transparent_70%)] rounded-full blur-[90px] -mr-36 -mt-36 transition-transform duration-1000 group-hover:scale-110 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary dark:text-gold-glow">
                    <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-heading font-bold text-foreground dark:text-white tracking-tight">
                        Revenue Overview
                    </h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        Executive Financial Analytics
                    </p>
                </div>
            </div>

            {/* Executive Comparison Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                {/* Total Revenue */}
                <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                        Total Revenue
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-heading font-bold text-foreground dark:text-white tracking-tight">
                            {fmt(revenue.total)}
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 mt-1">
                        Average: {revenue.averageRate}
                    </span>
                </div>

                {/* Previous Period Comparison */}
                <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                        Previous Period
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-heading font-bold text-slate-400 dark:text-slate-300 tracking-tight">
                            {fmt(revenue.previousPeriodTotal)}
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 mt-1">
                        Comparison baseline ({revenue.periodLabel})
                    </span>
                </div>

                {/* Growth / Variance */}
                <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                        Net Growth
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-heading font-bold text-emerald-400 tracking-tight">
                            +{fmt(netDifference)}
                        </span>
                        <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${
                            isPositive 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(revenue.growth)}%
                        </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400/80 mt-1">
                        {isPositive ? 'Outperforming previous period' : 'Below previous period'}
                    </span>
                </div>
            </div>

            {/* Chart Section */}
            <div className="flex-1 min-h-[280px] w-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <LegendItem color="#f59e0b" label="Current Period" />
                        <LegendItem color="#06b6d4" label="Previous Period" isDashed />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                        {range} comparison mode
                    </span>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenue.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis 
                                dataKey="label" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`}
                            />
                            <Tooltip 
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const currentVal = Number(payload[0]?.value) || 0;
                                        const prevVal = Number(payload[1]?.value) || 0;
                                        const diff = currentVal - prevVal;
                                        const diffPercent = prevVal ? ((diff / prevVal) * 100).toFixed(1) : '0';

                                        return (
                                            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[220px]">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pb-2 border-b border-white/10">
                                                    {label}
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                                            <span className="text-xs font-bold text-slate-200">Current Period</span>
                                                        </div>
                                                        <span className="text-xs font-black text-white font-mono">
                                                            {fmt(currentVal)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                                            <span className="text-xs font-bold text-slate-400">Previous Period</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 font-mono">
                                                            {fmt(prevVal)}
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-6">
                                                        <span className="text-[10px] font-black uppercase text-emerald-400">
                                                            Growth Variance
                                                        </span>
                                                        <span className="text-xs font-black text-emerald-400 font-mono">
                                                            +{diffPercent}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="current" 
                                name="Current Period"
                                stroke="#f59e0b" 
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCurrent)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="previous" 
                                name="Previous Period"
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                fillOpacity={1}
                                fill="url(#colorPrev)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function LegendItem({ color, label, isDashed }: { color: string; label: string; isDashed?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div 
                className={`rounded-full ${isDashed ? 'h-0.5 w-4 border-b-2 border-dashed' : 'h-2.5 w-2.5'}`} 
                style={{ 
                    backgroundColor: isDashed ? 'transparent' : color, 
                    borderColor: isDashed ? color : 'transparent',
                    boxShadow: isDashed ? 'none' : `0 0 8px ${color}80` 
                }} 
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}
