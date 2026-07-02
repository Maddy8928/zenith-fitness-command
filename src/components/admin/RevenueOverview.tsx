'use client';

import { useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Legend, Cell, ComposedChart, Line, Area
} from 'recharts';
import { 
    TrendingUp, ShoppingBag, Coffee, IndianRupee, 
    ArrowUpRight, ArrowDownRight, Calendar, Filter,
    UserCheck, CreditCard, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRevenueData, type TimeRange } from '@/lib/revenue-data';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
};

export default function RevenueOverview() {
    const [range, setRange] = useState<TimeRange>('Monthly');
    const revenue = useMemo(() => getRevenueData(range), [range]);

    return (
        <div className="space-y-6">
            {/* Range Selector & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Activity className="w-5 h-5 text-primary dark:text-gold-glow" />
                    </div>
                    <div>
                        <h2 className="text-xl font-heading font-bold text-foreground">Revenue Command Center</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Consolidated Finance Overview</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-1 rounded-xl border border-primary/10">
                    {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                range === r
                                    ? 'bg-primary text-primary-foreground shadow-glow'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Total Revenue" 
                    value={fmt(revenue.total)} 
                    icon={IndianRupee} 
                    trend={revenue.growth} 
                    color="gold"
                    delay={0}
                />
                <KPICard 
                    title="Memberships" 
                    value={fmt(revenue.receptionist)} 
                    icon={UserCheck} 
                    color="cyan" 
                    delay={0.1}
                />
                <KPICard 
                    title="Store Sales" 
                    value={fmt(revenue.store)} 
                    icon={ShoppingBag} 
                    color="indigo" 
                    delay={0.2}
                />
                <KPICard 
                    title="Cafe Sales" 
                    value={fmt(revenue.cafe)} 
                    icon={Coffee} 
                    color="emerald" 
                    delay={0.3}
                />
            </div>

            {/* Chart Area */}
            <div className="glass-card rounded-3xl border border-primary/10 p-6 min-h-[450px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 gap-4">
                    <div>
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Growth Streams</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Multi-channel revenue distribution analysis</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <LegendItem color="#06b6d4" label="Memberships" />
                        <LegendItem color="#6366f1" label="Store" />
                        <LegendItem color="#10b981" label="Cafe" />
                        <LegendItem color="#f59e0b" label="Total Trend" isLine />
                    </div>
                </div>

                <div className="h-[320px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenue.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorStore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorCafe" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey="label" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                                tickFormatter={(v) => `₹${v >= 1000 ? v/1000 + 'k' : v}`}
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">{label}</p>
                                                <div className="space-y-2">
                                                    {payload.map((p: any) => (
                                                        <div key={p.name} className="flex items-center justify-between gap-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{p.name}</span>
                                                            </div>
                                                            <span className="text-xs font-black text-white italic">{fmt(p.value)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-8 mt-2">
                                                        <span className="text-[10px] font-black text-gold-glow uppercase">Consolidated</span>
                                                        <span className="text-sm font-black text-gold-glow italic">
                                                            {fmt(payload.reduce((acc, curr) => curr.name !== 'Total' ? acc + (Number(curr.value) || 0) : acc, 0))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar 
                                dataKey="receptionist" 
                                name="Memberships" 
                                stackId="a" 
                                fill="url(#colorRec)" 
                                radius={[0, 0, 0, 0]} 
                                barSize={range === 'Yearly' ? 12 : 25}
                            />
                            <Bar 
                                dataKey="store" 
                                name="Store" 
                                stackId="a" 
                                fill="url(#colorStore)" 
                                radius={[0, 0, 0, 0]} 
                                barSize={range === 'Yearly' ? 12 : 25}
                            />
                            <Bar 
                                dataKey="cafe" 
                                name="Cafe" 
                                stackId="a" 
                                fill="url(#colorCafe)" 
                                radius={[4, 4, 0, 0]} 
                                barSize={range === 'Yearly' ? 12 : 25}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="total" 
                                name="Total"
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4, stroke: '#000' }} 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function LegendItem({ color, label, isLine }: { color: string; label: string; isLine?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`rounded-full ${isLine ? 'h-1 w-4' : 'h-3 w-3'}`} style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, color, delay }: any) {
    const isPositive = trend && trend > 0;
    const colors: any = {
        gold: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="glass-card rounded-3xl p-5 group hover:border-primary/40 transition-all duration-500 relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{title}</h3>
                <p className="text-2xl font-heading font-bold text-foreground dark:text-white tracking-tighter italic">{value}</p>
            </div>
        </motion.div>
    );
}
