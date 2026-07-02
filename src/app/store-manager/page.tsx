'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, 
    AlertCircle, 
    TrendingUp, 
    IndianRupee, 
    ArrowUpRight, 
    ArrowDownRight,
    ArrowRight, 
    Settings,
    CalendarClock,
    CalendarX2,
    Truck,
    Activity,
    BellRing,
    ShoppingBag,
    Boxes,

    RotateCcw,
    PlusCircle,
    LineChart,
    BarChart3,
    ShoppingCart,
    Clock,
    CheckCircle2,
    Zap,
    LayoutDashboard,
    PieChart,
    Search,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useShiftControl } from '@/hooks/useShiftControl';
import { ShiftStatusBadge } from '@/components/shared/ShiftStatusBadge';
import { ShiftControlPanel } from '@/components/shared/ShiftControlPanel';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// --- Mock Data ---
const salesTrendData = [
    { day: 'Mon', sales: 125000 },
    { day: 'Tue', sales: 145000 },
    { day: 'Wed', sales: 110000 },
    { day: 'Thu', sales: 165000 },
    { day: 'Fri', sales: 210000 },
    { day: 'Sat', sales: 285000 },
    { day: 'Sun', sales: 195000 },
];

const productPerformanceData = [
    { name: 'Whey Protein', value: 85, color: '#6366f1' },
    { name: 'Pre-Workout', value: 65, color: '#8b5cf6' },
    { name: 'Creatine', value: 45, color: '#a855f7' },
    { name: 'Apparel', value: 30, color: '#d946ef' },
];

const lowStockAlerts = [
    { id: 1, name: 'Nexus Whey Isolate', stock: 4, min: 10, status: 'critical' },
    { id: 2, name: 'BCAA Recovery', stock: 8, min: 15, status: 'low' },
    { id: 3, name: 'Lifting Belts (L)', stock: 2, min: 5, status: 'critical' },
];

const fastMovingProducts = [
    { name: 'Energy Gel Pack', velocity: '4.8x', trend: 'up' },
    { name: 'Grip Straps', velocity: '3.2x', trend: 'up' },
    { name: 'Protein Bars', velocity: '2.5x', trend: 'stable' },
];

const recentSales = [
    { id: 'S-9041', product: 'Whey Protein', customer: 'John D.', total: '₹4,499', time: '2m ago' },
    { id: 'S-9040', product: 'Shaker Bottle', customer: 'Sarah L.', total: '₹899', time: '15m ago' },
    { id: 'S-9039', product: 'Creatine Monohydrate', customer: 'Mike R.', total: '₹2,199', time: '45m ago' },
];

const topSellingList = [
    { name: 'Nexus Whey Isolate', sold: 124, revenue: '₹5,57,876', stock: '84%' },
    { name: 'Titan Pre-Workout', sold: 98, revenue: '₹2,44,902', stock: '92%' },
    { name: 'BCAA Recovery', sold: 86, revenue: '₹1,54,714', stock: '45%' },
];

export default function StoreManagerDashboard() {
    const { user } = useAuth();
    const {
        status,
        elapsedTime,
        activityLog,
        upcomingShifts,
        performanceScore,
        totalMinutesWorked,
        handleClockIn,
        handleClockOut,
        handleStartBreak,
        handleEndBreak
    } = useShiftControl('store_manager');

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Operational <span className="text-indigo-400 not-italic">Sync</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">
                        Commerce Control • Live Inventory Intelligence
                    </p>
                </div>
                <div className="flex flex-col md:items-end gap-4">
                    <ShiftStatusBadge status={status} elapsedTime={elapsedTime} themeColor="indigo" />
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest text-[10px] px-6 rounded-xl">
                            <Activity className="w-4 h-4 mr-2" /> System Health
                        </Button>
                        <Link href="/store-manager/inventory">
                            <Button className="h-10 bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-[10px] px-6 rounded-xl shadow-glow-sm">
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Stock
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Weekly Sales" value="₹1.32M" trend="+12.4%" icon={IndianRupee} color="indigo" />
                <SummaryCard title="Live Order Count" value="842" trend="+8.1%" icon={ShoppingCart} color="purple" />
                <SummaryCard title="Avg Order Ticket" value="₹1,568" trend="+2.5%" icon={Zap} color="cyan" />
            </div>

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Section: Operational Pulse (4 spans) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Low Stock Alerts */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-rose-500/5 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" /> Inventory <span className="text-rose-500 not-italic">Risk</span>
                            </h3>
                            <Badge className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest">Alert</Badge>
                        </div>
                        <div className="p-5 space-y-3">
                            {lowStockAlerts.map(alert => (
                                <div key={alert.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-white">{alert.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Stock: {alert.stock} / {alert.min} min</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-500/10">
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Fast-Moving Products */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white italic mb-6">Velocity <span className="text-indigo-400 not-italic">Watch</span></h3>
                        <div className="space-y-6">
                            {fastMovingProducts.map(prod => (
                                <div key={prod.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-10 bg-indigo-500 rounded-full" />
                                        <div>
                                            <p className="text-xs font-bold text-white">{prod.name}</p>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">{prod.velocity} Movement</p>
                                        </div>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Sales Mini Feed */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Sales <span className="text-cyan-400 not-italic">Stream</span></h3>
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            {recentSales.map(sale => (
                                <div key={sale.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{sale.product}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{sale.customer} • {sale.time}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-black text-white">{sale.total}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Section: Intelligence & Performance (8 spans) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Interactive Charts Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sales Trends Chart */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <LineChart className="w-16 h-16 text-indigo-400" />
                            </div>
                            <div className="mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Sales <span className="text-indigo-400 not-italic">Trends</span></h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Weekly Volume Analysis</p>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesTrendData}>
                                        <defs>
                                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#salesGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Product Performance Bar Chart */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <PieChart className="w-16 h-16 text-purple-400" />
                            </div>
                            <div className="mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Category <span className="text-purple-400 not-italic">Share</span></h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Product Performance Breakdown</p>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productPerformanceData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {productPerformanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Top Selling Products List */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Top <span className="text-indigo-400 not-italic">Performers</span></h3>
                            <Button variant="ghost" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/10">View Full List</Button>
                        </div>
                        <div className="p-8 pt-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-4">Product</th>
                                        <th className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pb-4">Sold</th>
                                        <th className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pb-4">Revenue</th>
                                        <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-4">Stock Health</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSellingList.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 text-xs font-bold text-white uppercase tracking-wider">{item.name}</td>
                                            <td className="py-4 text-center text-xs font-black text-slate-300 italic">{item.sold}</td>
                                            <td className="py-4 text-center text-xs font-black text-emerald-400 italic">{item.revenue}</td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500" style={{ width: item.stock }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500">{item.stock}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Bottom Quick Action Panels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <QuickActionCard icon={RotateCcw} title="Quick Restock" desc="Replenish high-velocity items" color="rose" />
                        <QuickActionCard icon={PlusCircle} title="Create Order" desc="Manual POS transaction entry" color="indigo" />
                    </div>
                </div>
            </div>

            {/* Shift Control Panel (Preserved) */}
            <div className="mt-8">
                <ShiftControlPanel 
                    status={status}
                    elapsedTime={elapsedTime}
                    activityLog={activityLog}
                    upcomingShifts={upcomingShifts}
                    performanceScore={performanceScore}
                    totalMinutesWorked={totalMinutesWorked}
                    handleClockIn={handleClockIn}
                    handleClockOut={handleClockOut}
                    handleStartBreak={handleStartBreak}
                    handleEndBreak={handleEndBreak}
                    themeColor="indigo"
                    userName={user?.name}
                    role="store"
                />
            </div>
        </div>
    );
}

function SummaryCard({ title, value, trend, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]',
    };

    return (
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[32px] p-6 hover:border-white/10 transition-all group overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{title}</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{value}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <ArrowUpRight className="w-3 h-3" /> {trend} <span className="text-slate-600 font-bold ml-1">vs avg</span>
                    </div>
                </div>
                <div className={`p-4 rounded-2xl ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </Card>
    );
}

function QuickActionCard({ icon: Icon, title, desc, color }: any) {
    const colorMap: any = {
        rose: 'hover:border-rose-500/30 group-hover:text-rose-400',
        indigo: 'hover:border-indigo-500/30 group-hover:text-indigo-400',
        emerald: 'hover:border-emerald-500/30 group-hover:text-emerald-400',
    };

    return (
        <div className={`p-6 rounded-[32px] bg-slate-900/40 backdrop-blur-xl border border-white/5 flex flex-col items-center text-center cursor-pointer transition-all group ${colorMap[color]}`}>
            <div className={`p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform ${color === 'rose' ? 'group-hover:bg-rose-500/10' : color === 'indigo' ? 'group-hover:bg-indigo-500/10' : 'group-hover:bg-emerald-500/10'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{desc}</p>
        </div>
    );
}
