'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Search, Clock, CheckCircle2, 
    XCircle, MoreVertical, Receipt, User, Mail, 
    Phone, IndianRupee, ShoppingCart, ArrowUpRight, 
    AlertCircle, RefreshCcw, ChefHat, Coffee, 
    Flame, Timer, BellRing, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useNotifications } from '@/context/NotificationContext';

const fmt = (val: string | number) => {
    if (typeof val === 'number') return `₹${val.toLocaleString('en-IN')}`;
    return val.startsWith('₹') ? val : `₹${val}`;
};

const CAFE_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
    incoming: { label: 'Incoming', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: BellRing },
    preparing: { label: 'Preparing', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Flame },
    ready: { label: 'Ready', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: CheckCircle2 },
    delivered: { label: 'Delivered', color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-white/5', icon: Receipt },
};

export default function CafeOrderManagementPage() {
    const { orders, updateStatus, isLoading } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const { addNotification } = useNotifications();

    const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId) || null, [orders, selectedOrderId]);

    const filteredOrders = useMemo(() => orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              o.member.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [orders, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'incoming' || o.status === 'preparing').length,
            ready: orders.filter(o => o.status === 'ready').length,
            revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => {
                const val = parseInt(o.total.replace(/[^0-9]/g, '')) || 0;
                return sum + val;
            }, 0)
        };
    }, [orders]);

    const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
        updateStatus(id, newStatus);
        const order = orders.find(o => o.id === id);
        
        if (newStatus === 'preparing') {
            addNotification({
                type: 'CAFE',
                role: 'member',
                title: 'Kitchen Preparing Your Fuel 🍳',
                message: `The kitchen has started preparing your order ${id} (${order?.items.join(', ')}).`,
                actionLabel: 'Track Status',
                actionUrl: '/member/cafe'
            });
        } else if (newStatus === 'ready') {
            addNotification({
                type: 'CAFE',
                role: 'member',
                title: 'Order Ready for Pickup! ☕',
                message: `Your order ${id} is ready at the kitchen bar. Grab it and refuel!`,
                actionLabel: 'Track Status',
                actionUrl: '/member/cafe',
                priority: 'high'
            });
        } else if (newStatus === 'delivered') {
            addNotification({
                type: 'CAFE',
                role: 'member',
                title: 'Order Delivered! 🎉',
                message: `Your order ${id} has been confirmed as picked up. Please rate your experience!`,
                actionLabel: 'Leave a Review',
                actionUrl: '/member/cafe'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center text-white gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="italic font-black uppercase tracking-widest text-indigo-400">Loading Order Ledger...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <ChefHat className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Kitchen Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                        Cafe <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Order Hub</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium tracking-wide">Manage, track, and process kitchen orders in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Feed
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Orders', val: stats.pending, icon: Flame, color: 'rose' },
                    { label: 'Awaiting Pickup', val: stats.ready, icon: Clock, color: 'amber' },
                    { label: 'Total Revenue', val: fmt(stats.revenue), icon: IndianRupee, color: 'indigo' },
                    { label: 'Total Volume', val: stats.total, icon: ShoppingBag, color: 'indigo' },
                ].map(k => {
                    const Icon = k.icon;
                    return (
                        <Card key={k.label} className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl group hover:border-white/10 transition-all">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-xl bg-${k.color}-500/10 border border-${k.color}-500/20`}>
                                        <Icon className={`w-5 h-5 text-${k.color}-400 shadow-glow-sm`} />
                                    </div>
                                    <Badge className="bg-white/5 text-slate-400 border-white/10 text-[9px] uppercase font-black tracking-widest">Live</Badge>
                                </div>
                                <div className="text-3xl font-black text-white italic tracking-tighter">{k.val}</div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{k.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Orders List */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-3xl">
                        <CardHeader className="border-b border-white/5 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <Input 
                                    placeholder="Search by Order ID or Member..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 bg-black/40 border-white/10 text-white focus:border-indigo-500/50 h-11 rounded-xl text-xs"
                                />
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                                {(['all', 'incoming', 'preparing', 'ready', 'delivered'] as const).map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === s ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-glow-sm' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <ScrollArea className="h-[600px]">
                            <div className="divide-y divide-white/5">
                                {filteredOrders.map((order) => {
                                    const config = CAFE_STATUS_CONFIG[order.status];
                                    return (
                                        <div 
                                            key={order.id} 
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition-all ${selectedOrderId === order.id ? 'bg-indigo-500/5 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className="flex gap-5 min-w-0">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-all overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.member}`} alt={order.member} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-sm font-black text-white truncate group-hover:text-indigo-400 transition-colors">{order.member}</span>
                                                        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{order.id}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 truncate font-medium">
                                                        {order.items.join(', ')}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                                                            <Timer className="w-3 h-3" /> {order.time}
                                                        </span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                        <Badge className={`text-[8px] px-2 py-0 h-4 ${order.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                                            {order.priority.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 justify-between md:justify-end">
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-white italic tracking-tighter">{fmt(order.total)}</p>
                                                    <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-black">Total Bill</p>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-xl border ${config.bg} ${config.border} ${config.color} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                                                    <config.icon className="w-3.5 h-3.5 shadow-glow-sm" />
                                                    {config.label}
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white rounded-xl">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <div className="p-20 text-center text-slate-600">
                                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center mx-auto mb-6">
                                            <AlertCircle className="w-10 h-10 opacity-20" />
                                        </div>
                                        <p className="text-lg font-black text-white italic uppercase tracking-widest">No matching orders</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Adjust filters or search for another order</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Right Panel: Order Detail View */}
                <div className="lg:col-span-4 sticky top-8">
                    <AnimatePresence mode="wait">
                        {selectedOrder ? (
                            <motion.div 
                                key={selectedOrder.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card className="bg-slate-900/50 backdrop-blur-3xl border-indigo-500/20 shadow-2xl relative overflow-hidden rounded-3xl">
                                    <div className="absolute top-0 right-0 p-5">
                                        <button onClick={() => setSelectedOrderId(null)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/5">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <CardHeader className="pb-6 pt-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-glow-sm">
                                                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOrder.member}`} alt={selectedOrder.member} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white italic leading-none mb-1">{selectedOrder.member}</h3>
                                                <p className="text-[10px] text-indigo-400 mt-1 font-black uppercase tracking-[0.2em] bg-indigo-500/10 px-2 py-0.5 rounded-lg inline-block">Member Hub ID: NEX-2045</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/5">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Process State</p>
                                                <StatusBadge status={selectedOrder.status} />
                                            </div>
                                            <div className="text-right space-y-1.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Reference</p>
                                                <p className="text-sm font-mono text-white font-bold tracking-tight">{selectedOrder.id}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        {/* Contact & Logistics */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-indigo-500"/> Received
                                                </p>
                                                <p className="text-xs text-white font-bold">{selectedOrder.time}</p>
                                            </div>
                                            <div className="text-right space-y-1.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5 justify-end">
                                                    <Receipt className="w-3 h-3 text-indigo-500"/> Station
                                                </p>
                                                <p className="text-xs text-white font-bold uppercase">Smoothie Bar</p>
                                            </div>
                                        </div>

                                        {/* Kitchen Items */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-2">
                                                <Utensils className="w-3.5 h-3.5 text-indigo-400" /> Kitchen Payload
                                            </p>
                                            <div className="space-y-2.5">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-emerald-500/20 transition-all">
                                                        <div className="flex gap-4 items-center">
                                                            <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-8 h-8 rounded-xl flex items-center justify-center border border-indigo-500/20">1x</div>
                                                            <div className="text-xs font-bold text-white uppercase tracking-tight">{item}</div>
                                                        </div>
                                                        <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-indigo-500 shadow-glow-sm transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bill Summary */}
                                        <div className="space-y-3 pt-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20 p-5 rounded-b-3xl">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-slate-500 uppercase tracking-widest">Transaction Value</span>
                                                <span className="text-white italic">{fmt(selectedOrder.total)}</span>
                                            </div>
                                            <div className="flex justify-between text-2xl pt-2">
                                                <span className="text-white font-black uppercase italic tracking-tighter">Total</span>
                                                <span className="text-indigo-400 font-black italic tracking-tighter drop-shadow-glow">{fmt(selectedOrder.total)}</span>
                                            </div>
                                        </div>

                                        {/* Kitchen Workflow Actions */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Production Control</p>
                                            <div className="flex flex-col gap-3">
                                                {selectedOrder.status === 'incoming' && (
                                                    <Button 
                                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-widest py-7 rounded-2xl shadow-glow-sm transition-all active:scale-95"
                                                    >
                                                        <Flame className="w-4 h-4 mr-2" /> Start Preparing
                                                    </Button>
                                                )}
                                                {selectedOrder.status === 'preparing' && (
                                                    <Button 
                                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'ready')}
                                                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest py-7 rounded-2xl shadow-glow-sm transition-all active:scale-95"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Ready for Pickup
                                                    </Button>
                                                )}
                                                {selectedOrder.status === 'ready' && (
                                                    <Button 
                                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                                                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-black font-black text-xs uppercase tracking-widest py-7 rounded-2xl shadow-glow-sm transition-all active:scale-95"
                                                    >
                                                        <ShoppingBag className="w-4 h-4 mr-2" /> Confirm Delivery
                                                    </Button>
                                                )}
                                                {selectedOrder.status === 'delivered' && (
                                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                        <CheckCircle2 className="w-8 h-8 text-indigo-500 mx-auto mb-2 opacity-40" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Completed</p>
                                                    </div>
                                                )}
                                                
                                                {selectedOrder.status !== 'delivered' && (
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl"
                                                    >
                                                        Reject / Void Order
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-[650px] flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-dashed border-white/10 rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 shadow-inner border border-white/5">
                                    <Coffee className="w-10 h-10 text-slate-700 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tight">Focus an order</h3>
                                <p className="text-xs text-slate-600 mt-3 max-w-[220px] font-medium leading-relaxed uppercase tracking-wider">Select a ticket from the live feed to engage production control.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const config = CAFE_STATUS_CONFIG[status];
    const Icon = config.icon;
    return (
        <div className={`px-4 py-1.5 rounded-xl border ${config.bg} ${config.border} ${config.color} text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-glow-sm`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text', 'bg')} animate-pulse`} />
            {config.label}
        </div>
    );
}
