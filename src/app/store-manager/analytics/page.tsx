'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
    PieChart, Pie
} from 'recharts';
import { 
    TrendingUp, 
    IndianRupee, 
    ShoppingCart, 
    PackageOpen,
    ArrowUpRight,
    ArrowDownRight,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExportButton, ExportFormat } from '@/components/shared/ExportButton';
import { handleExport } from '@/utils/exportUtils';

// Mock Data
const revenueData = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 13 },
    { name: 'Wed', revenue: 5500, orders: 38 },
    { name: 'Thu', revenue: 4500, orders: 29 },
    { name: 'Fri', revenue: 6000, orders: 48 },
    { name: 'Sat', revenue: 8000, orders: 61 },
    { name: 'Sun', revenue: 7500, orders: 55 },
];

const topProductsData = [
    { name: 'Nexus Whey Isolate', sales: 420 },
    { name: 'Titan Pre-Workout', sales: 380 },
    { name: 'Mass Gainer Pro', sales: 290 },
    { name: 'Zenith BCAA', sales: 210 },
    { name: 'Compression Tee', sales: 150 },
];

const inventoryDistribution = [
    { name: 'Supplements', value: 45 },
    { name: 'Apparel', value: 25 },
    { name: 'Accessories', value: 20 },
    { name: 'Equipment', value: 10 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-white font-bold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300">{entry.name}:</span>
                        <span className="text-white font-bold">
                            {entry.name === 'revenue' ? `₹${entry.value}` : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsDashboard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const exportAnalytics = async (format: ExportFormat) => {
        // Prepare combined analytics data
        const headers = ['Metric/Product', 'Value/Sales', 'Category/Trend'];
        
        // Add KPI summary
        const kpiData = [
            ['Total Revenue', 'Rs. 38,500', '+12.5%'],
            ['Total Orders', '249', '+8.2%'],
            ['Avg Order Value', 'Rs. 1,546', '-2.1%'],
            ['---', '---', '---']
        ];

        // Add Top Products
        const productData = topProductsData.map(p => [
            p.name,
            p.sales.toString(),
            'High Performance'
        ]);

        const combinedData = [...kpiData, ...productData];

        await handleExport(format, {
            filename: `Analytics_Report_${new Date().toISOString().split('T')[0]}`,
            title: 'Store Performance Analytics Report',
            headers,
            data: combinedData,
            dateRange: 'Last 7 Days'
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    if (!mounted) return null; // Client-side guard for Recharts

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Analytics</span></h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">In-depth performance metrics, sales trends, and inventory intelligence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton onExport={exportAnalytics} />
                </div>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* KPIs */}
                {[
                    { title: "Total Revenue", value: "₹38,500", trend: "+12.5%", isUp: true, icon: IndianRupee, color: "emerald" },
                    { title: "Total Orders", value: "249", trend: "+8.2%", isUp: true, icon: ShoppingCart, color: "indigo" },
                    { title: "Average Order Value", value: "₹1,546", trend: "-2.1%", isUp: false, icon: TrendingUp, color: "amber" },
                    { title: "Active Inventory", value: "1,204", trend: "+5.4%", isUp: true, icon: PackageOpen, color: "purple" },
                ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={idx} variants={itemVariants}>
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden group h-full">
                                <div className={`absolute inset-0 bg-gradient-to-br from-${kpi.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                        {kpi.title}
                                        <div className={`p-2 rounded-lg bg-${kpi.color}-500/10`}>
                                            <Icon className={`w-4 h-4 text-${kpi.color}-400`} />
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-white">{kpi.value}</div>
                                    <div className={`flex items-center gap-2 mt-2 text-sm font-bold ${kpi.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {kpi.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {kpi.trend} vs last week
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl h-full">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="text-lg font-black text-white uppercase italic tracking-wide">Revenue & Order Volume</CardTitle>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Last 7 Days Performance</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-8 h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Inventory Distribution */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl h-full">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="text-lg font-black text-white uppercase italic tracking-wide">Inventory Distribution</CardTitle>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">By Category Value</p>
                        </CardHeader>
                        <CardContent className="p-6 h-[400px] flex flex-col items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={inventoryDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {inventoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        formatter={(value: any) => [`${value}%`, 'Share']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Total</span>
                                <span className="text-3xl font-black text-white">100%</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Top Products */}
            <motion.div variants={itemVariants}>
                <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl">
                    <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-white uppercase italic tracking-wide">Top Performing Products</CardTitle>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">By Sales Volume (Units)</p>
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-black uppercase tracking-widest">
                            This Month
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" stroke="#e2e8f0" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={150} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                                    {topProductsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#colorBar${index})`} />
                                    ))}
                                </Bar>
                                <defs>
                                    {topProductsData.map((_, index) => (
                                        <linearGradient key={`gradient-${index}`} id={`colorBar${index}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6}/>
                                            <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
