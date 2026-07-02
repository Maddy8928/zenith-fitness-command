'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Search, Filter, Clock, CheckCircle2, 
    XCircle, MoreVertical, Receipt, User, Mail, 
    Phone, Calendar, IndianRupee, CreditCard, 
    Wallet, Banknote, ShoppingCart, ArrowRight,
    ArrowUpRight, AlertCircle, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    MOCK_ORDERS, ORDER_STATUS_CONFIG, 
    type StoreOrder, type OrderStatus 
} from '@/lib/store-order-data';
import { useNotifications } from '@/context/NotificationContext';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function OrderManagementPage() {
    const [orders, setOrders] = useState<StoreOrder[]>(MOCK_ORDERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
    const { triggerSaleComplete, triggerRefund } = useNotifications();

    const filteredOrders = useMemo(() => orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [orders, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const today = orders.filter(o => o.date.startsWith('2024-10-24'));
        return {
            totalToday: today.length,
            pending: orders.filter(o => o.status === 'pending').length,
            completedValue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),
            successRate: Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)
        };
    }, [orders]);

    const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                const updated = { ...o, status: newStatus };
                if (newStatus === 'completed') triggerSaleComplete({ invoiceId: o.id, customerName: o.customerName, amount: o.totalAmount, department: o.department });
                if (newStatus === 'cancelled') triggerRefund({ invoiceId: o.id, customerName: o.customerName, amount: o.totalAmount, department: o.department });
                return updated;
            }
            return o;
        }));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Order Processing</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                        Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Management</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium tracking-wide">Track, manage, and process customer orders for all store products.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Feed
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Orders Today', val: stats.totalToday, icon: ShoppingCart, color: 'indigo' },
                    { label: 'Pending Fulfillment', val: stats.pending, icon: Clock, color: 'amber' },
                    { label: 'Completed Sales', val: fmt(stats.completedValue), icon: IndianRupee, color: 'emerald' },
                    { label: 'Fulfillment Rate', val: `${stats.successRate}%`, icon: CheckCircle2, color: 'purple' },
                ].map(k => {
                    const Icon = k.icon;
                    return (
                        <Card key={k.label} className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg bg-${k.color}-500/10 border border-${k.color}-500/20`}>
                                        <Icon className={`w-5 h-5 text-${k.color}-400`} />
                                    </div>
                                    <Badge className="bg-white/5 text-slate-400 border-white/10 text-[10px]">Real-time</Badge>
                                </div>
                                <div className="text-3xl font-black text-white">{k.val}</div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{k.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Orders List */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/20">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <Input 
                                    placeholder="Search Order ID or Customer..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-black/40 border-white/10 text-white focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(['all', 'pending', 'completed', 'cancelled'] as const).map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${statusFilter === s ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/5 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <ScrollArea className="h-[600px]">
                            <div className="divide-y divide-white/5">
                                {filteredOrders.map((order) => {
                                    const config = ORDER_STATUS_CONFIG[order.status];
                                    return (
                                        <div 
                                            key={order.id} 
                                            onClick={() => setSelectedOrder(order)}
                                            className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            <div className="flex gap-4 min-w-0">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-500/10 border border-indigo-500/20">
                                                    <Receipt className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-white truncate">{order.customerName}</span>
                                                        <span className="text-[10px] font-mono text-slate-500">{order.id}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{order.paymentMethod}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 justify-between md:justify-end">
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-white">{fmt(order.totalAmount)}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nexus Store</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.color} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text', 'bg')}`} />
                                                    {config.label}
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <div className="p-12 text-center text-slate-600">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No orders found</p>
                                        <p className="text-xs">Adjust your search or filters to find what you're looking for.</p>
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
                                <Card className="bg-slate-900/50 backdrop-blur-xl border-indigo-500/20 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-white transition-colors">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                                                {selectedOrder.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white leading-none">{selectedOrder.customerName}</h3>
                                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{selectedOrder.memberId}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-y border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Status</p>
                                                <StatusBadge status={selectedOrder.status} />
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Order ID</p>
                                                <p className="text-sm font-mono text-white font-bold">{selectedOrder.id}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contact Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1"><Mail className="w-3 h-3"/> Email</p>
                                                <p className="text-xs text-white truncate">{selectedOrder.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</p>
                                                <p className="text-xs text-white">{selectedOrder.phone}</p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Items</p>
                                            <div className="space-y-2">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
                                                        <div className="flex gap-3 items-center">
                                                            <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded flex items-center justify-center">{item.qty}</div>
                                                            <div className="text-xs font-bold text-white">{item.name}</div>
                                                        </div>
                                                        <div className="text-xs font-black text-white">{fmt(item.price * item.qty)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Financial Breakdown */}
                                        <div className="space-y-2 pt-4 border-t border-white/5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Subtotal</span>
                                                <span className="text-slate-300 font-bold">{fmt(selectedOrder.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Tax (18%)</span>
                                                <span className="text-slate-300 font-bold">{fmt(selectedOrder.tax)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg pt-2">
                                                <span className="text-white font-black uppercase italic tracking-tighter">Total</span>
                                                <span className="text-white font-black">{fmt(selectedOrder.totalAmount)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3 pt-4">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Update Fulfillment</p>
                                            <div className="flex gap-2">
                                                {selectedOrder.status === 'pending' ? (
                                                    <>
                                                        <Button 
                                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-6"
                                                        >
                                                            Mark Complete
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                                            variant="outline" 
                                                            className="flex-1 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest py-6"
                                                        >
                                                            Cancel Order
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button 
                                                        disabled 
                                                        className="w-full bg-white/5 border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest py-6"
                                                    >
                                                        Order Already {selectedOrder.status}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <ArrowUpRight className="w-8 h-8 text-slate-700 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-400">Select an order</h3>
                                <p className="text-xs text-slate-600 mt-2 max-w-[200px]">Click on any order in the feed to see full details and process fulfillment.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const config = ORDER_STATUS_CONFIG[status];
    return (
        <div className={`px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.color} text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text', 'bg')}`} />
            {config.label}
        </div>
    );
}
