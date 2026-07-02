'use client';

import React, { useMemo, useState } from 'react';
import { handleExport } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { 
    BarChart3, 
    TrendingUp, 
    ShoppingBag, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight, 
    Filter, 
    Download,
    Calendar,
    ChevronDown,
    Zap,
    Utensils,
    PieChart as PieChartIcon,
    AlertTriangle,
    Target,
    Activity,
    ChefHat,
    DollarSign,
    Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    Cell, 
    PieChart, 
    Pie,
    Legend,
    ComposedChart,
    Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/context/OrderContext';

// --- Enhanced Mock Data ---
const categoryData = [
    { name: 'Beverages', value: 45, color: '#10b981' }, // Emerald-500
    { name: 'Snacks', value: 25, color: '#6366f1' },    // Indigo-500
    { name: 'Supplements', value: 30, color: '#06b6d4' } // Cyan-500
];

const topItems = [
    { name: 'Viking Whey', sales: 450, revenue: 112500, margin: 35 },
    { name: 'Nordic Wrap', sales: 380, revenue: 57000, margin: 28 },
    { name: 'Ignite Shot', sales: 310, revenue: 46500, margin: 42 },
    { name: 'Keto Bowl', sales: 290, revenue: 58000, margin: 31 },
    { name: 'Berry Blast', sales: 240, revenue: 19200, margin: 45 },
];

const profitData = [
    { name: 'Whey', profit: 4500, cost: 6750 },
    { name: 'Wrap', profit: 2100, cost: 3600 },
    { name: 'Shot', profit: 1800, cost: 2850 },
    { name: 'Bowl', profit: 2400, cost: 3400 },
    { name: 'Shake', profit: 1500, cost: 1200 },
];

const hourlySalesData = [
    { time: '06:00', sales: 12, revenue: 4500 },
    { time: '08:00', sales: 45, revenue: 18000 },
    { time: '10:00', sales: 38, revenue: 15200 },
    { time: '12:00', sales: 65, revenue: 32000 },
    { time: '14:00', sales: 42, revenue: 16800 },
    { time: '16:00', sales: 28, revenue: 11200 },
    { time: '18:00', sales: 85, revenue: 42500 },
    { time: '20:00', sales: 55, revenue: 27500 },
];

const lowPerformingItems = [
    { name: 'Greek Salad', lastSold: '3 days ago', stock: 12, trend: 'down' },
    { name: 'Oatmeal Cookie', lastSold: 'Yesterday', stock: 45, trend: 'stable' },
    { name: 'Protein Bar (Choc)', lastSold: '5 days ago', stock: 88, trend: 'down' },
];

export default function CafeAnalyticsPage() {
    const { orders } = useOrders();
    const [timeRange, setTimeRange] = useState('Today');

    // Real-time calculations from OrderContext
    const totalRevenue = useMemo(() => {
        return orders.filter(o => o.status === 'delivered').reduce((acc, order) => {
            const numericValue = parseInt(order.total.replace(/[^0-9]/g, '')) || 0;
            return acc + numericValue;
        }, 0);
    }, [orders]);

    const orderCount = useMemo(() => orders.length, [orders]);
    const avgOrderValue = useMemo(() => orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0, [totalRevenue, orderCount]);

    const handleExportData = async () => {
        try {
            const headers = ['Category/Item/Time', 'Sales/Value/Revenue', 'Details/Profit'];
            const data: (string | number)[][] = [];

            // Add KPI values
            data.push(['--- SUMMARY STATISTICS ---', '', '']);
            data.push(['Total Revenue', `Rs. ${totalRevenue.toLocaleString()}`, 'Live from billing']);
            data.push(['Average Order Value', `Rs. ${avgOrderValue.toLocaleString()}`, 'Per transaction']);
            data.push(['Total Order Count', orderCount, 'Total orders']);
            data.push(['Peak Hour', '18:00', 'Post-workout rush']);
            data.push(['Kitchen Prep Efficiency', '98.2%', 'Kitchen prep speed']);
            data.push([], []);

            // Add top selling items
            data.push(['--- TOP SELLING ITEMS ---', '', '']);
            data.push(['Item Name', 'Sales Volume', 'Revenue (INR)']);
            topItems.forEach(item => {
                data.push([item.name, item.sales, `Rs. ${item.revenue}`]);
            });
            data.push([], []);

            // Add hourly sales data
            data.push(['--- HOURLY SALES TREND ---', '', '']);
            data.push(['Time Slot', 'Sales Volume', 'Revenue (INR)']);
            hourlySalesData.forEach(hour => {
                data.push([hour.time, hour.sales, `Rs. ${hour.revenue}`]);
            });
            data.push([], []);

            // Add category breakdown
            data.push(['--- CATEGORY BREAKDOWN ---', '', '']);
            data.push(['Category Name', 'Distribution Share %', '']);
            categoryData.forEach(cat => {
                data.push([cat.name, `${cat.value}%`, '']);
            });

            await handleExport('CSV', {
                filename: `Cafe_Intelligence_Report_${new Date().toISOString().split('T')[0]}`,
                title: 'Cafe Intelligence Performance Report',
                headers,
                data,
                category: 'Cafe Analytics'
            });
            toast.success('Analytics report exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export analytics report.');
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            Cafe <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 not-italic">Intelligence</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 font-medium tracking-wide text-xs uppercase flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        Real-time revenue monitoring & menu performance analytics
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-slate-900/50 border border-white/5 rounded-xl p-1 backdrop-blur-md">
                        {['Today', 'Week', 'Month'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-emerald-500 text-black shadow-glow' : 'text-slate-500 hover:text-white'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl hover:bg-white/10 transition-all gap-2">
                        <Filter className="w-3.5 h-3.5" /> Filters
                    </Button>
                    <Button onClick={handleExportData} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all gap-2">
                        <Download className="w-3.5 h-3.5" /> Export
                    </Button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Total Revenue" 
                    value={`₹${totalRevenue.toLocaleString()}`} 
                    trend="+15.4%" 
                    isUp={true} 
                    icon={DollarSign} 
                    color="emerald" 
                    subtitle="Live from billing"
                />
                <KPICard 
                    title="Average Order" 
                    value={`₹${avgOrderValue.toLocaleString()}`} 
                    trend="+4.2%" 
                    isUp={true} 
                    icon={Target} 
                    color="indigo" 
                    subtitle="Per transaction"
                />
                <KPICard 
                    title="Peak Hour" 
                    value="18:00" 
                    trend="Steady" 
                    isUp={true} 
                    icon={Clock} 
                    color="amber" 
                    subtitle="Post-workout rush"
                />
                <KPICard 
                    title="Efficiency" 
                    value="98.2%" 
                    trend="+1.5%" 
                    isUp={true} 
                    icon={Zap} 
                    color="cyan" 
                    subtitle="Kitchen prep speed"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Trends Chart */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-3xl overflow-hidden rounded-3xl group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Sales <span className="text-emerald-400 not-italic">Trends</span>
                            </CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-slate-500">Hourly revenue performance</CardDescription>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3">Live Feed</Badge>
                    </CardHeader>
                    <CardContent className="h-[400px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlySalesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                    tickFormatter={(v) => `₹${v/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Breakdown (Pie Chart) */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-400" />
                            Category <span className="text-indigo-400 not-italic">Mix</span>
                        </CardTitle>
                        <CardDescription className="text-xs uppercase font-bold tracking-widest text-slate-500">Sales distribution by type</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[340px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Top Sellers & Profit Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Selling Items (Bar Chart) */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-cyan-400" />
                            Top <span className="text-cyan-400 not-italic">Sellers</span>
                        </CardTitle>
                        <CardDescription className="text-xs uppercase font-bold tracking-widest text-slate-500">Highest volume items</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    stroke="#94a3b8" 
                                    fontSize={10} 
                                    width={80} 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontWeight: 'bold' }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={20}>
                                    {topItems.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                                    ))}
                                </Bar>
                                <defs>
                                    {topItems.map((_, index) => (
                                        <linearGradient key={`grad-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={1}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Profit Margin Analysis */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl overflow-hidden rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                            <Percent className="w-5 h-5 text-purple-400" />
                            Profit <span className="text-purple-400 not-italic">Margins</span>
                        </CardTitle>
                        <CardDescription className="text-xs uppercase font-bold tracking-widest text-slate-500">Cost vs Profit comparison</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={profitData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Bar dataKey="cost" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={25} />
                                <Line type="monotone" dataKey="profit" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Actionable Insights: Low Performing Items */}
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl overflow-hidden rounded-3xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                Inventory <span className="text-rose-500 not-italic">Alerts</span>
                            </CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-slate-500">Low performing & overstock items</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">
                            View Full Inventory <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {lowPerformingItems.map((item, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-rose-500/20 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <ArrowDownRight className="w-12 h-12 text-rose-500" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase mb-1">{item.name}</h4>
                                <div className="flex items-center justify-between mt-3">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">In Stock</p>
                                        <p className="text-xl font-black text-rose-400">{item.stock}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">Last Sold</p>
                                        <p className="text-xs font-black text-white">{item.lastSold}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                    <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] uppercase tracking-tighter">Slow Moving</Badge>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">Strategy: Clearance</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KPICard({ title, value, trend, isUp, icon: Icon, color, subtitle }: any) {
    const colorMap: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    };

    return (
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10 -mr-12 -mt-12 transition-all group-hover:opacity-20 bg-${color}-500`} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
                    <div className={`p-2.5 rounded-xl ${colorMap[color].split(' ')[1]} ${colorMap[color].split(' ')[0]} border ${colorMap[color].split(' ')[2]}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-white italic tracking-tighter mb-1">{value}</div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-0.5 text-[10px] font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{subtitle}</span>
                </div>
            </CardContent>
        </Card>
    );
}
