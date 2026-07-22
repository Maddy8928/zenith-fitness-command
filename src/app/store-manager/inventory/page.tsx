'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Plus, Truck, CheckCircle2, CalendarX2, CalendarClock, Beaker, Shirt, Dumbbell, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotifications } from '@/context/NotificationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportButton, ExportFormat } from '@/components/shared/ExportButton';
import { handleExport } from '@/utils/exportUtils';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddProductForm from '@/components/store/AddProductForm';

// Mock Inventory Data
const INITIAL_INVENTORY = [
    { id: '1', name: 'Flex Whey Isolate', sku: 'NX-WHEY-01', category: 'Supplements', price: 4199, stock: 145, status: 'Active', batchNo: 'B-2601', mfd: '2024-10-01', expiryDate: '2027-12-31' },
    { id: '2', name: 'Titan Pre-Workout', sku: 'NX-PRE-02', category: 'Supplements', price: 3299, stock: 12, status: 'Expiring Soon', batchNo: 'B-2602', mfd: '2024-09-15', expiryDate: '2026-05-15' },
    { id: '3', name: 'Zenith BCAA Recovery', sku: 'NX-BCAA-03', category: 'Supplements', price: 2499, stock: 85, status: 'Expired', batchNo: 'B-2509', mfd: '2024-03-01', expiryDate: '2026-03-01' },
    { id: '4', name: 'Pro Powerlifting Belt', sku: 'GR-BELT-01', category: 'Gear', price: 7499, stock: 4, status: 'Critical', batchNo: 'G-001', mfd: '2024-01-20', expiryDate: null },
    { id: '5', name: 'Flex Compression Tee', sku: 'AP-TEE-01', category: 'Apparel', price: 2999, stock: 54, status: 'Active', batchNo: 'A-001', mfd: '2024-06-10', expiryDate: null },
    { id: '6', name: 'Elite Wrist Wraps', sku: 'GR-WRAP-02', category: 'Gear', price: 1699, stock: 0, status: 'Out of Stock', batchNo: 'G-002', mfd: '2024-02-05', expiryDate: null },
    { id: '7', name: 'Mass Gainer Pro', sku: 'NX-MASS-07', category: 'Supplements', price: 5499, stock: 30, status: 'Active', batchNo: 'B-2603', mfd: '2024-08-25', expiryDate: '2026-11-20' },
    { id: '8', name: 'Lifting Straps', sku: 'GR-STRAP-03', category: 'Gear', price: 999, stock: 18, status: 'Active', batchNo: 'G-003', mfd: '2024-05-12', expiryDate: null },
];

const CATEGORIES = [
    { name: 'All', icon: ListFilter },
    { name: 'Supplements', icon: Beaker },
    { name: 'Gear', icon: Dumbbell },
    { name: 'Apparel', icon: Shirt },
];

export default function SmartInventoryPage() {
    const [inventory, setInventory] = useState(INITIAL_INVENTORY);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const { triggerLowStock, triggerCriticalStock, triggerOutOfStock, triggerNearExpiry, triggerProductExpired, triggerAutoOrder, triggerOrderArrived } = useNotifications();
    const [notifiedItems, setNotifiedItems] = useState<Record<string, { critical: boolean; outOfStock: boolean; ordering: boolean; expired: boolean; expiringSoon: boolean }>>({});
    
    // Items currently being ordered from supplier { id: timestamp }
    const [orderingItems, setOrderingItems] = useState<Record<string, number>>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const calculateStatus = (stock: number, isOrdering: boolean, expiryDate: string | null) => {
        if (expiryDate) {
            const now = new Date();
            const exp = new Date(expiryDate);
            const daysToExpiry = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
            if (daysToExpiry < 0) return 'Expired';
            if (daysToExpiry <= 30) return 'Expiring Soon';
        }
        if (isOrdering) return 'Ordering...';
        if (stock === 0) return 'Out of Stock';
        if (stock <= 5) return 'Critical';
        if (stock <= 15) return 'Low Stock';
        return 'Active';
    };

    useEffect(() => {
        setInventory(prev => prev.map(item => ({
            ...item,
            status: calculateStatus(item.stock, !!orderingItems[item.id], item.expiryDate)
        })));
    }, []);

    // Automated Supplier Ordering Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const now = Date.now();
            let inventoryUpdated = false;
            const newOrders = { ...orderingItems };
            let updatedInv = [...inventory];
            const newNotified = { ...notifiedItems };
            const notificationsToSend: any[] = [];
            
            Object.entries(newOrders).forEach(([id, orderTime]) => {
                if (now - orderTime > 8000) {
                    delete newOrders[id];
                    inventoryUpdated = true;
                    
                    updatedInv = updatedInv.map(item => {
                        if (item.id === id) {
                            const newStock = item.stock + 100;
                            newNotified[id] = { critical: false, outOfStock: false, ordering: false, expired: false, expiringSoon: false };
                            
                            notificationsToSend.push({ _trigger: 'orderArrived', itemId: item.id, itemName: item.name });
                            
                            const newBatch = `B-NEW-${Math.floor(Math.random() * 10000)}`;
                            const newExpiry = new Date();
                            newExpiry.setMonth(newExpiry.getMonth() + 6);
                            const expiryStr = item.expiryDate !== null ? newExpiry.toISOString().split('T')[0] : null;

                            return { 
                                ...item, 
                                stock: newStock, 
                                batchNo: item.category === 'Supplements' ? newBatch : item.batchNo, 
                                expiryDate: expiryStr, 
                                status: calculateStatus(newStock, false, expiryStr) 
                            };
                        }
                        return item;
                    });
                }
            });
            
            if (inventoryUpdated) {
                setOrderingItems(newOrders);
                setInventory(updatedInv);
                setNotifiedItems(newNotified);
                notificationsToSend.forEach((n: any) => {
                    if (n._trigger === 'orderArrived') triggerOrderArrived({ itemId: n.itemId, itemName: n.itemName });
                });
            }
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [orderingItems, inventory, notifiedItems, triggerOrderArrived]);

    // Simulated Real-time Sales
    useEffect(() => {
        const timer = setTimeout(() => {
            let saleMade = false;
            const notificationsToSend: any[] = [];
            const updatedNotifiedItems = { ...notifiedItems };
            const newOrders: Record<string, number> = {};

            const nextInventory = inventory.map(item => {
                const isOrdering = !!orderingItems[item.id];
                
                if (Math.random() > 0.85 && item.stock > 0 && !saleMade && !isOrdering && item.status !== 'Expired') {
                    saleMade = true;
                    const qtySold = Math.floor(Math.random() * 2) + 1;
                    const newStock = Math.max(0, item.stock - qtySold);
                    
                    const currentTracking = updatedNotifiedItems[item.id] || { critical: false, outOfStock: false, ordering: false, expired: false, expiringSoon: false };
                    
                    let willBeOrdering: boolean = isOrdering;
                    
                    if (newStock <= 5 && !currentTracking.ordering) {
                        willBeOrdering = true;
                        newOrders[item.id] = Date.now();
                        updatedNotifiedItems[item.id] = { ...currentTracking, ordering: true };
                        notificationsToSend.push({ _trigger: 'autoOrder', itemId: item.id, itemName: item.name, stock: newStock, sku: item.sku });
                    }

                    const newStatus = calculateStatus(newStock, willBeOrdering, item.expiryDate);
                    
                    if (newStatus === 'Out of Stock' && !currentTracking.outOfStock && !willBeOrdering) {
                        notificationsToSend.push({ _trigger: 'outOfStock', itemId: item.id, itemName: item.name, sku: item.sku });
                        updatedNotifiedItems[item.id] = { ...currentTracking, outOfStock: true };
                    } else if (newStatus === 'Critical' && !currentTracking.critical && !willBeOrdering) {
                        notificationsToSend.push({ _trigger: 'criticalStock', itemId: item.id, itemName: item.name, sku: item.sku, stock: newStock });
                        updatedNotifiedItems[item.id] = { ...currentTracking, critical: true };
                    }

                    return { ...item, stock: newStock, status: newStatus };
                }
                
                if (item.status === 'Expired' && !updatedNotifiedItems[item.id]?.expired) {
                    updatedNotifiedItems[item.id] = { ...(updatedNotifiedItems[item.id] || {}), expired: true };
                    notificationsToSend.push({ _trigger: 'expired', itemId: item.id, itemName: item.name, batchNo: item.batchNo, expiryDate: item.expiryDate });
                } else if (item.status === 'Expiring Soon' && !updatedNotifiedItems[item.id]?.expiringSoon) {
                    updatedNotifiedItems[item.id] = { ...(updatedNotifiedItems[item.id] || {}), expiringSoon: true };
                    notificationsToSend.push({ _trigger: 'expiringSoon', itemId: item.id, itemName: item.name, batchNo: item.batchNo, expiryDate: item.expiryDate });
                }

                return item;
            });

            if (saleMade || Object.keys(newOrders).length > 0 || notificationsToSend.length > 0) {
                setInventory(nextInventory);
                setNotifiedItems(updatedNotifiedItems);
                if (Object.keys(newOrders).length > 0) {
                    setOrderingItems(prev => ({ ...prev, ...newOrders }));
                }
                notificationsToSend.forEach((n: any) => {
                    if (n._trigger === 'autoOrder') triggerAutoOrder({ itemId: n.itemId, itemName: n.itemName, stock: n.stock, sku: n.sku });
                    else if (n._trigger === 'outOfStock') triggerOutOfStock({ itemId: n.itemId, itemName: n.itemName, sku: n.sku });
                    else if (n._trigger === 'criticalStock') triggerCriticalStock({ itemId: n.itemId, itemName: n.itemName, sku: n.sku, stock: n.stock });
                    else if (n._trigger === 'expired') triggerProductExpired({ itemId: n.itemId, itemName: n.itemName, batchNo: n.batchNo, expiryDate: n.expiryDate });
                    else if (n._trigger === 'expiringSoon') triggerNearExpiry({ itemId: n.itemId, itemName: n.itemName, batchNo: n.batchNo, expiryDate: n.expiryDate });
                });
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [inventory, notifiedItems, orderingItems, triggerAutoOrder, triggerOutOfStock, triggerCriticalStock, triggerProductExpired, triggerNearExpiry]);

    const filteredInventory = inventory.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || p.batchNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const exportInventory = async (format: ExportFormat) => {
        const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Batch No', 'MFD', 'Expiry'];
        const data = filteredInventory.map(item => [
            item.name,
            item.sku,
            item.category,
            `Rs. ${item.price}`,
            item.stock.toString(),
            item.status,
            item.batchNo,
            (item as any).mfd || 'N/A',
            item.expiryDate || 'N/A'
        ]);

        await handleExport(format, {
            filename: `Inventory_Report_${new Date().toISOString().split('T')[0]}`,
            title: 'Smart Inventory Stock Report',
            headers,
            data,
            category: categoryFilter
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-[10px]">Active</Badge>;
            case 'Low Stock': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 text-[10px]">Low Stock</Badge>;
            case 'Critical': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse px-3 py-1 text-[10px]">Critical</Badge>;
            case 'Ordering...': return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex items-center gap-1.5 px-3 py-1 text-[10px]"><Truck className="w-3 h-3 animate-bounce" /> Ordering</Badge>;
            case 'Out of Stock': return <Badge className="bg-slate-800 text-slate-400 border-slate-700 px-3 py-1 text-[10px]">Out of Stock</Badge>;
            case 'Expiring Soon': return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 flex items-center gap-1.5 px-3 py-1 text-[10px]"><CalendarClock className="w-3 h-3" /> Expiring</Badge>;
            case 'Expired': return <Badge className="bg-rose-900/50 text-rose-200 border-rose-500/50 flex items-center gap-1.5 opacity-80 px-3 py-1 text-[10px]"><CalendarX2 className="w-3 h-3" /> Expired</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Supplements': return <Beaker className="w-4 h-4 text-emerald-400" />;
            case 'Gear': return <Dumbbell className="w-4 h-4 text-indigo-400" />;
            case 'Apparel': return <Shirt className="w-4 h-4 text-purple-400" />;
            default: return <Package className="w-4 h-4 text-slate-400" />;
        }
    };

    const StockLevelIndicator = ({ stock }: { stock: number }) => {
        const maxStock = 150; 
        const percentage = Math.min((stock / maxStock) * 100, 100);
        const colorClass = stock === 0 ? 'bg-slate-700' : stock <= 5 ? 'bg-rose-500' : stock <= 15 ? 'bg-amber-500' : 'bg-emerald-500';

        return (
            <div className="flex flex-col gap-1.5 w-full max-w-[120px] ml-auto">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Level</span>
                    <span className={stock === 0 ? 'text-slate-500' : `text-${colorClass.split('-')[1]}-400`}>{stock} / {maxStock}</span>
                </div>
                <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full ${colorClass} rounded-full`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Inventory</span></h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Automated stock control, batch freshness tracking, and supplier automation.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton onExport={exportInventory} />
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border-0">
                                <Plus className="w-4 h-4 mr-2" />
                                New Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-none w-screen h-screen p-0 border-0 bg-slate-950 overflow-hidden m-0 translate-x-0 translate-y-0 left-0 top-0">
                            <div className="sr-only">
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>Fill in the details to add a new product to the inventory.</DialogDescription>
                            </div>
                            <AddProductForm 
                                onClose={() => setIsAddModalOpen(false)} 
                                onSuccess={(newProd) => {
                                    setInventory(prev => [newProd, ...prev]);
                                    setIsAddModalOpen(false);
                                }} 
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl flex flex-col h-[700px] overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-6 bg-black/20 space-y-6">
                    {/* Quick Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = categoryFilter === cat.name;
                                return (
                                    <button
                                        key={cat.name}
                                        onClick={() => setCategoryFilter(cat.name)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                            isActive 
                                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                            : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-300'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 tracking-wider">
                                <CalendarClock className="w-3 h-3 text-orange-400" />
                                Batch Tracking
                            </div>
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 tracking-wider">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Auto-Ordering
                            </div>
                        </div>
                    </div>

                    {/* Search & Status Filters */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input 
                                placeholder="Search products, SKUs, or batches..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-black/40 border-white/10 text-white w-full focus:border-indigo-500 h-11 rounded-xl"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px] h-11 bg-black/40 border-white/10 text-white focus:ring-indigo-500 rounded-xl">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl shadow-2xl">
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Low Stock">Low Stock</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                                <SelectItem value="Ordering...">Ordering</SelectItem>
                                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                                <SelectItem value="Expired">Expired</SelectItem>
                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0 overflow-auto custom-scrollbar flex-1 relative">
                    <Table>
                        <TableHeader className="bg-black/60 sticky top-0 z-10 backdrop-blur-md">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 h-12">Product Info</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 h-12">Price</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 h-12 text-center">Batch, MFD & Expiry</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 h-12 text-center">Status</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 h-12 text-right pr-8">Stock Level</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {filteredInventory.map((item) => (
                                    <motion.tr 
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors group ${item.status === 'Expired' ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30">
                                                    {getCategoryIcon(item.category)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold text-white group-hover:text-indigo-300 transition-colors ${item.status === 'Expired' ? 'line-through text-slate-400' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[10px] text-slate-400">{item.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-black text-white">₹{item.price.toLocaleString()}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col items-center justify-center bg-black/20 rounded-lg p-2 border border-white/5 space-y-1">
                                                <span className="text-xs font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded shadow-inner">{item.batchNo}</span>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    {(item as any).mfd && (
                                                        <span className="text-[9px] text-slate-500 font-bold">MFD: {(item as any).mfd}</span>
                                                    )}
                                                    {item.expiryDate ? (
                                                        <span className={`text-[10px] font-bold ${item.status === 'Expired' ? 'text-rose-400' : item.status === 'Expiring Soon' ? 'text-orange-400' : 'text-slate-500'}`}>
                                                            EXP: {item.expiryDate}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 font-medium">No Expiry</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <div className="flex justify-center">
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 pr-8">
                                            <StockLevelIndicator stock={item.stock} />
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                    {filteredInventory.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Package className="w-10 h-10 text-slate-600" />
                            </div>
                            <p className="text-lg font-bold text-white mb-1">No products found</p>
                            <p className="text-sm">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
