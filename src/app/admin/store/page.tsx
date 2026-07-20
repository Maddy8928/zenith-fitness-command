'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, TrendingUp, Package, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useNotifications } from '@/context/NotificationContext';

// Mock Inventory Data
const INVENTORY = [
    { id: '1', name: 'Flex Whey Isolate', sku: 'NX-WHEY-01', category: 'Supplements', price: 4199, stock: 145, status: 'Active', src: '/images/store/flex-whey-isolate.png' },
    { id: '2', name: 'Titan Pre-Workout', sku: 'NX-PRE-02', category: 'Supplements', price: 3299, stock: 12, status: 'Low Stock', src: '/images/store/titan-pre-workout.png' },
    { id: '3', name: 'Zenith BCAA Recovery', sku: 'NX-BCAA-03', category: 'Supplements', price: 2499, stock: 85, status: 'Active', src: '/images/store/zenith-bcaa-recovery.png' },
    { id: '4', name: 'Pro Powerlifting Belt', sku: 'GR-BELT-01', category: 'Gear', price: 7499, stock: 4, status: 'Critical', src: '/images/store/pro-powerlifting-belt.png' },
    { id: '5', name: 'Flex Compression Tee', sku: 'AP-TEE-01', category: 'Apparel', price: 2999, stock: 54, status: 'Active', src: '/images/store/flex-compression-tee.png' },
    { id: '6', name: 'Elite Wrist Wraps', sku: 'GR-WRAP-02', category: 'Gear', price: 1699, stock: 0, status: 'Out of Stock', src: '/images/store/elite-wrist-wraps.png' },
];

const RECENT_ORDERS = [
    { id: 'ORD-5829', customer: 'Sarah Johnson', date: 'Today, 10:42 AM', amount: 7499, status: 'Completed', items: 2 },
    { id: 'ORD-5828', customer: 'Michael Chen', date: 'Today, 09:15 AM', amount: 2999, status: 'Completed', items: 1 },
    { id: 'ORD-5827', customer: 'Emma Davis', date: 'Yesterday, 04:30 PM', amount: 12500, status: 'Refunded', items: 3 },
    { id: 'ORD-5826', customer: 'James Wilson', date: 'Yesterday, 02:20 PM', amount: 4199, status: 'Completed', items: 1 },
];

export default function AdminStorePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('inventory');
    const [inventory, setInventory] = useState(INVENTORY);
    const { addNotification } = useNotifications();
    const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', price: '', stock: '' });

    const filteredInventory = inventory.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.price) return;
        
        const newItem = {
            id: Math.random().toString(36).substring(7),
            name: newProduct.name,
            sku: newProduct.sku || `NX-${Math.floor(Math.random() * 1005)}`,
            category: newProduct.category || 'Supplements',
            price: Number(newProduct.price),
            stock: Number(newProduct.stock) || 10,
            status: Number(newProduct.stock) > 0 ? 'Active' : 'Out of Stock',
            src: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=600&auto=format&fit=crop'
        };
        
        setInventory([newItem, ...inventory]);
        addNotification({
            type: 'STORE',
            title: 'New Product Available!',
            message: `Check out our new ${newItem.name} now available in the store for ₹${newItem.price}!`
        });
        setNewProduct({ name: '', sku: '', category: '', price: '', stock: '' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'Low Stock': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            case 'Critical': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
            case 'Out of Stock': return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
            default: return 'bg-primary/10 border-primary/20 text-primary';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-4 md:p-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground dark:text-white pb-1">
                        Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Management</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Oversee inventory, track sales, and manage point-of-sale operations.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 flex-1 md:flex-none">
                        <Package className="w-4 h-4 mr-2" />
                        Restock Alert
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-black hover:bg-primary/90 flex-1 md:flex-none shadow-[0_0_15px_hsl(var(--gold)/0.3)]">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-slate-950 border-primary/20 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black italic uppercase">Add New <span className="text-primary not-italic">Product</span></DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Name</label>
                                    <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-slate-900 border-white/10 text-white" placeholder="Flex Whey Protein..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">SKU</label>
                                        <Input value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="bg-slate-900 border-white/10 text-white" placeholder="NX-WHEY-01" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Category</label>
                                        <Input value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="bg-slate-900 border-white/10 text-white" placeholder="Supplements" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Price (₹)</label>
                                        <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="bg-slate-900 border-white/10 text-white" placeholder="4199" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Initial Stock</label>
                                        <Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="bg-slate-900 border-white/10 text-white" placeholder="100" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button onClick={handleAddProduct} className="bg-primary text-black hover:bg-primary/90 w-full font-bold uppercase tracking-wider">
                                        Save Product
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-primary/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Revenue (30d)</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">₹11.97 Lakh</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                            <span className="text-emerald-400 font-bold">+18.2%</span>
                            <span className="text-slate-500 ml-2">vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-primary/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Orders (30d)</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">342</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                            <span className="text-emerald-400 font-bold">+5.4%</span>
                            <span className="text-slate-500 ml-2">vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-primary/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Active Products</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">48</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            <span className="text-primary font-bold">4 Categories</span>
                            <span className="text-slate-500 ml-2">in inventory</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-rose-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-16 h-16 text-rose-500" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardDescription className="text-rose-400/80 font-medium uppercase tracking-wider text-xs">Low Stock Alerts</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">3</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex items-center text-sm">
                            <span className="text-rose-400 font-bold">Action Required</span>
                            <span className="text-slate-500 ml-2">view items below</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-2 border-b border-primary/10 pb-4 overflow-x-auto scrollbar-hide">
                {['inventory', 'orders', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap capitalize ${activeTab === tab
                            ? 'bg-primary text-black shadow-[0_0_15px_hsl(var(--gold)/0.2)]'
                            : 'bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    {activeTab === 'inventory' && (
                        <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-primary/10 bg-black/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <div className="relative w-full sm:w-96 flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products, SKU, or category..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-black/40 border-primary/20 h-10 w-full"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="outline" className="h-10 border-primary/20 text-muted-foreground hover:text-white flex-1 sm:flex-none">
                                        <Filter className="w-4 h-4 mr-2" /> Filters
                                    </Button>
                                    <Button variant="outline" className="h-10 border-primary/20 text-muted-foreground hover:text-white flex-1 sm:flex-none">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Sync
                                    </Button>
                                </div>
                            </div>

                            {/* Inventory Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="text-xs uppercase bg-black/40 text-muted-foreground border-b border-primary/10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                                            <th className="px-6 py-4 font-semibold tracking-wider">SKU</th>
                                            <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                                            <th className="px-6 py-4 font-semibold tracking-wider">Price</th>
                                            <th className="px-6 py-4 font-semibold tracking-wider">Stock</th>
                                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {filteredInventory.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-primary/10 flex-shrink-0">
                                                            <img src={item.src} alt={item.name} className="w-full h-full object-cover opacity-80" />
                                                        </div>
                                                        <span className="font-semibold text-white">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-400 text-xs">{item.sku}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                                                <td className="px-6 py-4 font-bold text-primary">₹{item.price.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-8 text-right font-medium ${item.stock < 10 ? 'text-rose-400' : 'text-slate-300'}`}>{item.stock}</span>
                                                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                            <div
                                                                className={`h-full ${item.stock < 10 ? 'bg-rose-500' : item.stock < 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min(100, (item.stock / 150) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={`font-semibold border ${getStatusStyle(item.status)}`}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-400">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredInventory.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    No products found matching your search.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 glass-card rounded-2xl border border-primary/10 overflow-hidden h-fit">
                                <div className="p-4 border-b border-primary/10 bg-black/20 flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Recent Store Orders</h3>
                                    <Button variant="link" className="text-primary h-auto p-0">View All</Button>
                                </div>
                                <div className="divide-y divide-primary/5">
                                    {RECENT_ORDERS.map(order => (
                                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                    <ShoppingCart className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-white">{order.customer}</h4>
                                                        <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-400 mt-0.5">{order.date} • {order.items} items</div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className="font-bold text-lg text-primary">₹{order.amount.toLocaleString()}</span>
                                                <Badge variant="outline" className={`text-[10px] ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* POS Quick Summary */}
                            <Card className="glass-card border-primary/10 h-fit">
                                <CardHeader>
                                    <CardTitle className="text-lg">POS Summary</CardTitle>
                                    <CardDescription>Shift activity (Today)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-slate-400">Transactions</span>
                                        <span className="font-bold text-white">42</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-slate-400">Avg. Order Value</span>
                                        <span className="font-bold text-white">₹5,499</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-slate-400">Gross Sales</span>
                                        <span className="font-bold text-primary">₹2,31,084</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-slate-400">Refunds</span>
                                        <span className="font-bold text-rose-400">-₹12,600</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-white font-bold">Net Sales</span>
                                        <span className="text-xl font-bold text-primary">₹2,18,484</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="p-12 text-center border border-dashed border-primary/20 rounded-2xl glass-card">
                            <TrendingUp className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white">Analytics Dashboard in Development</h3>
                            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                                The comprehensive store analytics suite will provide deep insights into sales velocity, margin analysis, and inventory forecasting.
                            </p>
                            <Button className="mt-6 bg-white/5 border border-white/10 hover:bg-white/10">Request Early Access</Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

        </div>
    );
}
