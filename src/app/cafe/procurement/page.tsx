'use client';

import React, { useState, useMemo } from 'react';
import { handleExport } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, Search, Filter, Plus, FileText, CheckCircle2,
    Clock, XCircle, ChevronRight, IndianRupee, Building2,
    Mail, Phone, Calendar, ArrowUpRight, BarChart3,
    History, Users, Star, Package, AlertCircle, ShoppingCart,
    Coffee, Utensils, Droplets, Zap, ShieldCheck, Printer,
    ChevronDown, MoreVertical, Download, ArrowLeft
} from 'lucide-react';
import SupplierDetailView from '@/components/shared/procurement/SupplierDetailView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CAFE_SUPPLIERS, INITIAL_CAFE_POS, getCafePOStatusConfig,
    type CafePurchaseOrder, type CafeSupplier, type CafeUnit
} from '@/lib/cafe-procurement-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: any }) {
    const cfg = getCafePOStatusConfig(status);
    return (
        <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit`}>
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </Badge>
    );
}

export default function CafeProcurementPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'suppliers' | 'insights'>('orders');
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
    const [orders, setOrders] = useState<CafePurchaseOrder[]>(INITIAL_CAFE_POS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Stats
    const totalSpend = useMemo(() => orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0), [orders]);
    const pendingOrders = useMemo(() => orders.filter(o => o.status === 'Sent' || o.status === 'Confirmed').length, [orders]);
    const criticalItems = 4; // Mock from inventory

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Procurement Control</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Supply <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 not-italic">Chain</span>
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wide text-xs uppercase flex items-center gap-2">
                        Manage ingredient sourcing, PO history & supplier performance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                        {[
                            { id: 'orders', label: 'Purchase Orders', icon: FileText },
                            { id: 'suppliers', label: 'Suppliers', icon: Users },
                            { id: 'insights', label: 'Insights', icon: BarChart3 },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-emerald-500 text-black shadow-glow'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <KPICard title="Total Spend" value={fmt(totalSpend)} trend="+12.5%" icon={IndianRupee} color="emerald" />
                <KPICard title="Active POs" value={pendingOrders.toString()} trend="Live" icon={Clock} color="amber" />
                <KPICard title="Supply Score" value="98%" trend="Elite" icon={ShieldCheck} color="cyan" />
                <KPICard title="Low Stock Alerts" value={criticalItems.toString()} trend="Action Required" icon={AlertCircle} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'orders' && <PurchaseOrdersTab key="orders" orders={orders} setOrders={setOrders} />}
                        {activeTab === 'suppliers' && (
                            selectedSupplier ? (
                                <SupplierDetailView 
                                    supplier={selectedSupplier} 
                                    orders={orders}
                                    onBack={() => setSelectedSupplier(null)} 
                                    onCreatePO={() => { setActiveTab('orders'); setSelectedSupplier(null); }}
                                />
                            ) : (
                                <SuppliersTab key="suppliers" onSelect={setSelectedSupplier} />
                            )
                        )}
                        {activeTab === 'insights' && <InsightsTab key="insights" orders={orders} />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─── Purchase Orders Tab ─────────────────────────────────────────────────────

function PurchaseOrdersTab({ orders, setOrders }: { orders: CafePurchaseOrder[]; setOrders: any }) {
    const [search, setSearch] = useState('');

    const filtered = orders.filter(o => 
        o.id.toLowerCase().includes(search.toLowerCase()) || 
        o.supplierName.toLowerCase().includes(search.toLowerCase())
    );

    const handleExportPOs = async () => {
        try {
            const headers = ['Order ID', 'Supplier', 'Date Issued', 'Expected Delivery', 'Subtotal', 'Tax', 'Total Amount', 'Status'];
            const data = filtered.map(o => [
                o.id,
                o.supplierName,
                o.date,
                o.expectedDelivery,
                `Rs. ${o.subtotal}`,
                `Rs. ${o.tax}`,
                `Rs. ${o.total}`,
                o.status
            ]);

            await handleExport('CSV', {
                filename: `Cafe_PO_Report_${new Date().toISOString().split('T')[0]}`,
                title: 'Cafe Purchase Orders Report',
                headers,
                data,
                category: 'Procurement'
            });
            toast.success('Purchase orders exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export purchase orders.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-white/5 px-8 py-6 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input
                                placeholder="Search by PO ID or Supplier..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 bg-black/40 border-white/10 text-white w-full focus:border-emerald-500/50 h-11 rounded-xl text-xs font-medium"
                            />
                        </div>
                        <Select defaultValue="All">
                            <SelectTrigger className="w-full md:w-48 h-11 bg-black/40 border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Sent">Sent</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={handleExportPOs} variant="outline" className="border-white/10 hover:bg-white/10 hover:text-emerald-400 text-white h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                            <Download className="w-3.5 h-3.5 mr-2" /> Export
                        </Button>
                        <NewPOModal setOrders={setOrders} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-black/40">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12 pl-8">Order Identifier</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Supplier</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Date Issued</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Delivery Date</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Amount</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12 text-center">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(order => (
                                <TableRow key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-8 py-4 font-mono text-emerald-400 font-bold text-xs">{order.id}</TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{order.supplierName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-xs text-slate-400 font-medium">{order.date}</TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                            {order.expectedDelivery}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm font-black text-white italic tracking-tighter">{fmt(order.total)}</TableCell>
                                    <TableCell className="py-4 text-center">
                                        <div className="flex justify-center">
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-right pr-8">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest">
                                                View
                                            </Button>
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest">
                                                    Receive
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ─── Suppliers Tab ───────────────────────────────────────────────────────────

function SuppliersTab({ onSelect }: { onSelect: (s: any) => void }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAFE_SUPPLIERS.map(s => (
                <Card key={s.id} className="bg-slate-900/40 backdrop-blur-3xl border-white/5 hover:border-emerald-500/30 transition-all group rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <CardHeader className="pb-4 relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                <Building2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] font-black text-white">{s.rating}</span>
                            </div>
                        </div>
                        <CardTitle className="text-xl font-black text-white italic">{s.name}</CardTitle>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">{s.category}</p>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                {s.contactPerson}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                {s.email}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                {s.phone}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Spend</p>
                                <p className="text-sm font-black text-white italic">{fmt(s.totalSpend)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lead Time</p>
                                <p className="text-sm font-black text-white italic">{s.leadTimeDays} Days</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => onSelect(s)}
                            className="w-full bg-white/5 hover:bg-emerald-500 hover:text-black text-white border border-white/10 rounded-2xl h-11 font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            View Order History
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </motion.div>
    );
}

// ─── Insights Tab ───────────────────────────────────────────────────────────

function InsightsTab({ orders }: { orders: CafePurchaseOrder[] }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Spending <span className="text-emerald-400 not-italic">Distribution</span></h3>
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-6">
                    {[
                        { label: 'Dairy & Fresh', spend: 45000, color: 'bg-emerald-500', pct: 45 },
                        { label: 'Coffee Beans', spend: 32000, color: 'bg-cyan-500', pct: 32 },
                        { label: 'Dry Goods & Syrups', spend: 15000, color: 'bg-indigo-500', pct: 15 },
                        { label: 'Packaging', spend: 8000, color: 'bg-amber-500', pct: 8 },
                    ].map(cat => (
                        <div key={cat.label} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-300">{cat.label}</span>
                                <span className="text-sm font-black text-white italic">{fmt(cat.spend)}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }} className={`h-full ${cat.color} rounded-full`} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Reorder <span className="text-rose-400 not-italic">Suggestions</span></h3>
                    <Zap className="w-5 h-5 text-rose-400" />
                </div>
                <div className="space-y-4">
                    {[
                        { item: 'Full Cream Milk', stock: '2.5L', threshold: '5L', supplier: 'Alpine Dairy', urgency: 'High' },
                        { item: 'Oat Milk Barista', stock: '0L', threshold: '3L', supplier: 'Alpine Dairy', urgency: 'Critical' },
                        { item: 'Viking Blend Beans', stock: '2kg', threshold: '5kg', supplier: 'Highland Coffee', urgency: 'Medium' },
                        { item: 'Paper Cups (12oz)', stock: '120pcs', threshold: '200pcs', supplier: 'EcoPack', urgency: 'Low' },
                    ].map(sug => (
                        <div key={sug.item} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sug.urgency === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{sug.item}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sug.supplier} • Stock: {sug.stock}</p>
                                </div>
                            </div>
                            <Button size="sm" className="bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl font-black uppercase text-[9px] tracking-widest px-4 h-9">
                                Create PO
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function NewPOModal({ setOrders }: { setOrders: any }) {
    const [supplier, setSupplier] = useState('');
    const [items, setItems] = useState([{ name: '', qty: 0, unit: 'Liters' as CafeUnit, cost: 0 }]);

    const handleAdd = () => {
        const newOrder: CafePurchaseOrder = {
            id: `CPO-2024-${Math.floor(Math.random() * 1000)}`,
            supplierId: 'cs-001',
            supplierName: supplier || 'New Supplier',
            date: new Date().toISOString().split('T')[0],
            expectedDelivery: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            status: 'Draft',
            items: items.map((it, idx) => ({ 
                id: idx.toString(), 
                name: it.name, 
                sku: 'TEMP-SKU', 
                category: 'Misc', 
                qty: it.qty, 
                unit: it.unit, 
                costPrice: it.cost,
                mfd: (it as any).mfd,
                expiryDate: (it as any).expiry
            })),
            subtotal: items.reduce((s, i) => s + (i.qty * i.cost), 0),
            tax: items.reduce((s, i) => s + (i.qty * i.cost), 0) * 0.05,
            total: items.reduce((s, i) => s + (i.qty * i.cost), 0) * 1.05,
            notes: ''
        };
        setOrders((prev: any) => [newOrder, ...prev]);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 text-black hover:bg-emerald-400 shadow-glow h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                    <Plus className="w-3.5 h-3.5 mr-2" /> New Purchase Order
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-slate-950 border-white/10 text-white rounded-[2rem] p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase italic">Create <span className="text-emerald-400 not-italic">Purchase Order</span></DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Supplier</label>
                        <Select onValueChange={setSupplier}>
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-xs font-bold uppercase">
                                <SelectValue placeholder="Select a supplier..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                {CAFE_SUPPLIERS.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ingredients & Quantity</label>
                            <Button variant="link" className="text-emerald-400 text-[10px] font-black uppercase p-0 h-auto">Add Ingredient</Button>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-4 space-y-2">
                                    <Input placeholder="Ingredient (e.g. Milk)" className="bg-white/5 border-white/10 h-11 rounded-xl text-xs" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Input type="number" placeholder="Qty" className="bg-white/5 border-white/10 h-11 rounded-xl text-xs" />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Select defaultValue="Liters">
                                        <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-[10px] uppercase font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                            <SelectItem value="Liters">Liters</SelectItem>
                                            <SelectItem value="ml">ml</SelectItem>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="Grams">Grams</SelectItem>
                                            <SelectItem value="Units">Units</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Input type="number" placeholder="Cost" className="bg-white/5 border-white/10 h-11 rounded-xl text-xs" />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-600 ml-1">MFD</label>
                                    <Input type="date" className="bg-white/5 border-white/10 h-9 rounded-lg text-[9px] px-2 invert-calendar-icon" />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-600 ml-1">EXP</label>
                                    <Input type="date" className="bg-white/5 border-white/10 h-9 rounded-lg text-[9px] px-2 invert-calendar-icon" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <style jsx global>{`
                    .invert-calendar-icon::-webkit-calendar-picker-indicator {
                        filter: invert(1) brightness(0.8);
                        cursor: pointer;
                    }
                `}</style>
                <DialogFooter className="pt-6 border-t border-white/5">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleAdd} className="bg-emerald-500 text-black hover:bg-emerald-400 shadow-glow rounded-xl h-11 px-10 font-black uppercase text-[10px] tracking-widest">Generate PO</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function KPICard({ title, value, trend, icon: Icon, color }: any) {
    const colors: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };
    return (
        <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-all relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{value}</h3>
                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${color === 'rose' ? 'text-rose-400' : 'text-emerald-400'}`}>{trend} <span className="text-slate-600 font-medium tracking-normal lowercase">this month</span></p>
                </div>
                <div className={`p-4 rounded-2xl ${colors[color]}`}>
                    <Icon className="w-6 h-6 shadow-glow-sm" />
                </div>
            </div>
        </Card>
    );
}
