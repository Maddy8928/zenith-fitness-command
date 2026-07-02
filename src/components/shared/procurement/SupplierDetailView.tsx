'use client';

import React, { useState, useMemo } from 'react';
import { 
    ArrowLeft, 
    Calendar, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight, 
    Package, 
    Clock, 
    ShoppingCart, 
    TrendingUp, 
    IndianRupee,
    ChevronRight,
    ExternalLink,
    Plus,
    History,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Supplier, 
    PurchaseOrder, 
    INITIAL_PURCHASE_ORDERS, 
    getPOStatusConfig 
} from '@/lib/procurement-data';

interface SupplierDetailViewProps {
    supplier: any;
    onBack: () => void;
    onCreatePO: (supplierId: string) => void;
    orders?: any[];
}

export default function SupplierDetailView({ supplier, onBack, onCreatePO, orders: propOrders }: SupplierDetailViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Use provided orders or the global mock data
    const allOrders = propOrders || INITIAL_PURCHASE_ORDERS;

    // Filter orders for this supplier
    const supplierOrders = useMemo(() => {
        return allOrders.filter(o => o.supplierId === supplier.id);
    }, [supplier.id, allOrders]);

    // Derived Insights
    const stats = useMemo(() => {
        const totalOrders = supplierOrders.length;
        const totalSpend = supplierOrders.reduce((acc, o) => acc + o.total, 0);
        const lastOrder = supplierOrders.length > 0 
            ? [...supplierOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
            : 'N/A';
        
        // Frequently ordered items
        const itemFreq: Record<string, { name: string; count: number; totalQty: number; lastPrice: number }> = {};
        supplierOrders.forEach(order => {
            order.items.forEach((item: any) => {
                const itemId = item.productId || item.id || 'unknown';
                const itemName = item.productName || item.name || 'Unknown Item';
                if (!itemFreq[itemId]) {
                    itemFreq[itemId] = { name: itemName, count: 0, totalQty: 0, lastPrice: item.costPrice };
                }
                itemFreq[itemId].count += 1;
                itemFreq[itemId].totalQty += item.qty;
                itemFreq[itemId].lastPrice = item.costPrice;
            });
        });

        const topItems = Object.values(itemFreq)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return { totalOrders, totalSpend, lastOrder, topItems };
    }, [supplierOrders]);

    const filteredTransactions = useMemo(() => {
        return supplierOrders.filter(o => {
            const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 o.items.some((i: any) => (i.productName || i.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
            
            return matchesSearch;
        });
    }, [supplierOrders, searchQuery]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-white italic tracking-tight">{supplier.name}</h2>
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase text-[10px] tracking-widest font-black">
                                {supplier.category}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                            Supplier ID: {supplier.id} • {supplier.city}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        <History className="w-4 h-4 mr-2" /> Activity Log
                    </Button>
                    <Button 
                        onClick={() => onCreatePO(supplier.id)}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-glow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Purchase Order
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'indigo' },
                    { label: 'Total Amount Spent', value: `₹${stats.totalSpend.toLocaleString()}`, icon: IndianRupee, color: 'emerald' },
                    { label: 'Last Purchase Date', value: stats.lastOrder, icon: Calendar, color: 'purple' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={i} className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                                        <h3 className="text-2xl font-black text-white italic">{s.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-2xl bg-${s.color}-500/10 border border-${s.color}-500/20`}>
                                        <Icon className={`w-5 h-5 text-${s.color}-400`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Transaction Table */}
                <Card className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-[600px]">
                    <CardHeader className="border-b border-white/5 bg-black/20 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                                <History className="w-4 h-4 text-indigo-400" /> Transaction History
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <div className="relative w-full md:w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <Input 
                                        placeholder="Search orders..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 bg-black/40 border-white/10 text-[11px] rounded-xl focus:ring-indigo-500/50"
                                    />
                                </div>

                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Items</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredTransactions.map((order, idx) => {
                                        const statusCfg = getPOStatusConfig(order.status);
                                        return (
                                            <motion.tr 
                                                key={order.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono font-black text-indigo-400 group-hover:text-indigo-300 transition-colors">#{order.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-slate-600" />
                                                        <span className="text-xs font-bold text-slate-300">{order.date}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center">
                                                        <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-bold text-slate-400">
                                                            {order.items.length} Products
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-black text-white italic">₹{order.total.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <Badge className={`${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border text-[9px] font-black uppercase tracking-widest px-2 py-0.5`}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <ShoppingCart className="w-12 h-12 mb-3" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No Transactions Found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Insights Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Frequently Ordered */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-indigo-500/5 border-b border-white/5 p-6">
                            <CardTitle className="text-sm font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" /> Top Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {stats.topItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 font-black">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.count} Orders · {item.totalQty} Units</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-emerald-400 italic">₹{item.lastPrice}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Last Price</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topItems.length === 0 && (
                                <p className="text-center text-slate-500 text-xs font-bold py-4">Insufficient data for insights.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <BarChart3 className="w-24 h-24 text-indigo-400" />
                        </div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 italic">Vendor <span className="text-white not-italic">Intelligence</span></h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Lead Time Reliability</span>
                                    <span className="text-indigo-400">92%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Order Accuracy</span>
                                    <span className="text-emerald-400">98%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price Stability</span>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black">STABLE</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-12 border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest">
                            Contact Vendor
                        </Button>
                        <Button variant="outline" className="h-12 border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest">
                            View Contracts
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
