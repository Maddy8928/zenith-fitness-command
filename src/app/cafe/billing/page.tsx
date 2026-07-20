'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    Receipt, 
    Download, 
    Printer, 
    CheckCircle2, 
    XCircle, 
    Clock,
    Coffee,
    IndianRupee,
    Building2,
    Mail,
    Phone,
    ArrowUpRight,
    CreditCard,
    Wallet,
    Trash2,
    User,
    Percent,
    Coins,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/context/NotificationContext';
import { ExportButton, ExportFormat } from '@/components/shared/ExportButton';
import { handleExport } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { CAFE_MENU_ITEMS, MenuItem } from '@/lib/cafe-menu-data';

// Mock Cafe Transaction Data
const CAFE_TRANSACTIONS = [
    { id: 'INV-CF-001', date: '2024-10-24 14:30', customer: 'Alex Thompson', email: 'alex@example.com', phone: '+91 98765 43210', category: 'Smoothies', total: 1199, status: 'Paid', items: [
        { name: 'Viking Whey Shake', qty: 1, price: 850 },
        { name: 'Almond Croissant', qty: 1, price: 349 }
    ]},
    { id: 'INV-CF-002', date: '2024-10-24 15:15', customer: 'Jessica Miller', email: 'jessica@example.com', phone: '+91 98765 43211', category: 'Supplements', total: 649, status: 'Paid', items: [
        { name: 'Pre-Workout Ignite Shot', qty: 1, price: 500 },
        { name: 'Banana', qty: 2, price: 74.5 }
    ]},
    { id: 'INV-CF-003', date: '2024-10-24 16:00', customer: 'David Garcia', email: 'david@example.com', phone: '+91 98765 43212', category: 'Food', total: 1499, status: 'Pending', items: [
        { name: 'Nordic Chicken Wrap', qty: 1, price: 1299 },
        { name: 'Green Tea', qty: 1, price: 200 }
    ]},
    { id: 'INV-CF-004', date: '2024-10-24 16:45', customer: 'Lisa Anderson', email: 'lisa@example.com', phone: '+91 98765 43213', category: 'Food', total: 1249, status: 'Paid', items: [
        { name: 'Keto Power Bowl', qty: 1, price: 1249 }
    ]},
    { id: 'INV-CF-005', date: '2024-10-24 17:30', customer: 'Michael Chen', email: 'michael@example.com', phone: '+91 98765 43214', category: 'Smoothies', total: 850, status: 'Refunded', items: [
        { name: 'Protein Berry Blast', qty: 1, price: 850 }
    ]},
];

export default function CafeBillingPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const { 
        triggerSaleComplete, 
        triggerPendingBilling, 
        triggerRefund,
        triggerLowStock,
        triggerCriticalStock,
        triggerOutOfStock
    } = useNotifications();
    const firedRef = useRef<Set<string>>(new Set());

    // Sale Dialog state
    const [isSaleOpen, setIsSaleOpen] = useState(false);

    // Form inputs for new sale
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedMember, setSelectedMember] = useState('');

    // Menu list and active basket
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
    const [selectedQty, setSelectedQty] = useState('1');
    const [basket, setBasket] = useState<{ item: any; qty: number }[]>([]);

    // Discount & calculations
    const [discountPct, setDiscountPct] = useState('0');

    // Payment methods
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
    const [splitCash, setSplitCash] = useState('0');
    const [splitUpi, setSplitUpi] = useState('0');
    const [splitCard, setSplitCard] = useState('0');

    // Seed members list for selection
    const SEED_MEMBERS = [
        { name: 'Alex Thompson', email: 'alex@example.com', phone: '+91 98765 43210' },
        { name: 'Jessica Miller', email: 'jessica@example.com', phone: '+91 98765 43211' },
        { name: 'David Garcia', email: 'david@example.com', phone: '+91 98765 43212' },
        { name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+91 98765 43213' },
        { name: 'Michael Chen', email: 'michael@example.com', phone: '+91 98765 43214' }
    ];

    const handleMemberSelect = (val: string) => {
        setSelectedMember(val);
        if (val === 'custom') {
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
        } else {
            const member = SEED_MEMBERS.find(m => m.name === val);
            if (member) {
                setCustomerName(member.name);
                setCustomerEmail(member.email);
                setCustomerPhone(member.phone);
            }
        }
    };

    const saveTransactions = (updated: any[]) => {
        setTransactions(updated);
        localStorage.setItem('zenith_cafe_transactions', JSON.stringify(updated));
    };

    const handleAddToBasket = () => {
        if (!selectedMenuItemId) {
            toast.error("Please select a product first.");
            return;
        }
        const item = menuItems.find(m => m.id === selectedMenuItemId);
        if (!item) {
            toast.error("Product not found.");
            return;
        }
        const qty = parseInt(selectedQty);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please specify a valid quantity.");
            return;
        }

        setBasket(prev => {
            const existingIndex = prev.findIndex(b => b.item.id === item.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    qty: updated[existingIndex].qty + qty
                };
                return updated;
            } else {
                return [...prev, { item, qty }];
            }
        });

        setSelectedMenuItemId('');
        setSelectedQty('1');
        toast.success(`Added ${item.name} x${qty} to basket.`);
    };

    const handleRemoveFromBasket = (index: number) => {
        setBasket(prev => {
            const updated = [...prev];
            const removed = updated[index];
            updated.splice(index, 1);
            if (removed) {
                toast.success(`Removed ${removed.item.name} from basket.`);
            }
            return updated;
        });
    };

    const resetSaleForm = () => {
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setSelectedMember('');
        setSelectedMenuItemId('');
        setSelectedQty('1');
        setBasket([]);
        setDiscountPct('0');
        setPaymentMethod('Cash');
        setSplitCash('0');
        setSplitUpi('0');
        setSplitCard('0');
    };

    const handleProcessSale = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (basket.length === 0) {
            toast.error("Checkout basket is empty.");
            return;
        }
        if (!customerName.trim()) {
            toast.error("Please specify a customer name.");
            return;
        }

        const subtotal = basket.reduce((sum, b) => sum + (b.qty * b.item.price), 0);
        const discount = parseFloat(discountPct) || 0;
        const serviceTax = Math.round((subtotal * (1 - discount / 100)) * 0.05);
        const grandTotal = Math.round((subtotal * (1 - discount / 100)) * 1.05);

        if (paymentMethod === 'Split') {
            const cashAmt = parseFloat(splitCash) || 0;
            const upiAmt = parseFloat(splitUpi) || 0;
            const cardAmt = parseFloat(splitCard) || 0;
            const splitSum = Math.round(cashAmt + upiAmt + cardAmt);
            if (splitSum !== grandTotal) {
                toast.error(`Split payments sum (₹${splitSum}) must equal the Grand Total (₹${grandTotal}).`);
                return;
            }
        }

        // Load latest inventory and history
        const savedInv = localStorage.getItem('zenith_cafe_inventory');
        let currentInventory: any[] = [];
        if (savedInv) {
            try {
                currentInventory = JSON.parse(savedInv);
            } catch (err) {
                currentInventory = [];
            }
        }

        const savedHist = localStorage.getItem('zenith_cafe_inventory_history');
        let currentHistory: any[] = [];
        if (savedHist) {
            try {
                currentHistory = JSON.parse(savedHist);
            } catch (err) {
                currentHistory = [];
            }
        }

        // Process stock deductions for recipe ingredients
        const updatedInventory = [...currentInventory];
        let stockUpdated = false;

        basket.forEach(basketItem => {
            const recipeIngredients = basketItem.item.ingredients || [];
            recipeIngredients.forEach((ingredient: any) => {
                // Find matching inventory item
                const idx = updatedInventory.findIndex(
                    invItem => invItem.id === ingredient.inventoryId || 
                    invItem.name.toLowerCase() === ingredient.name.toLowerCase()
                );
                
                if (idx > -1) {
                    const inventoryItem = updatedInventory[idx];
                    let qtyUsed = ingredient.quantity * basketItem.qty;

                    // Apply unit conversion if needed
                    if (ingredient.unit.toLowerCase() === 'ml' && inventoryItem.unit.toLowerCase() === 'liters') {
                        qtyUsed = qtyUsed / 1000;
                    } else if (ingredient.unit.toLowerCase() === 'grams' && inventoryItem.unit.toLowerCase() === 'kg') {
                        qtyUsed = qtyUsed / 1000;
                    }

                    const nextStock = Math.max(0, parseFloat((inventoryItem.stock - qtyUsed).toFixed(3)));
                    
                    // Re-calculate status
                    const minStock = inventoryItem.minStock || 10;
                    const wasOrdering = inventoryItem.status === 'Ordering...';
                    let newStatus = 'In Stock';
                    if (inventoryItem.expiryDate) {
                        const exp = new Date(inventoryItem.expiryDate);
                        const daysToExpiry = (exp.getTime() - Date.now()) / (1000 * 3600 * 24);
                        if (daysToExpiry < 0) newStatus = 'Expired';
                        else if (daysToExpiry <= 7) newStatus = 'Expiring Soon';
                    }
                    if (newStatus !== 'Expired' && newStatus !== 'Expiring Soon') {
                        if (wasOrdering) {
                            newStatus = 'Ordering...';
                        } else if (nextStock === 0) {
                            newStatus = 'Out of Stock';
                        } else if (nextStock <= minStock / 2) {
                            newStatus = 'Critical';
                        } else if (nextStock <= minStock) {
                            newStatus = 'Low Stock';
                        }
                    }

                    // Update inventory item properties
                    updatedInventory[idx] = {
                        ...inventoryItem,
                        stock: nextStock,
                        status: newStatus
                    };
                    stockUpdated = true;

                    // Log history entry
                    const historyEntry = {
                        id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                        timestamp: new Date().toISOString(),
                        itemId: inventoryItem.id,
                        itemName: inventoryItem.name,
                        type: 'Deduction',
                        qty: parseFloat(qtyUsed.toFixed(3)),
                        unit: inventoryItem.unit || 'Units',
                        description: `Deduction: consumed ${parseFloat(qtyUsed.toFixed(3))} ${inventoryItem.unit || 'Units'} for preparing ${basketItem.qty}x ${basketItem.item.name}.`
                    };
                    currentHistory.unshift(historyEntry);

                    // Raise stock level notifications via socket context
                    if (newStatus === 'Out of Stock') {
                        triggerOutOfStock({ itemId: inventoryItem.id, itemName: inventoryItem.name, sku: inventoryItem.sku, stock: nextStock });
                    } else if (newStatus === 'Critical') {
                        triggerCriticalStock({ itemId: inventoryItem.id, itemName: inventoryItem.name, sku: inventoryItem.sku, stock: nextStock });
                    } else if (newStatus === 'Low Stock') {
                        triggerLowStock({ itemId: inventoryItem.id, itemName: inventoryItem.name, sku: inventoryItem.sku, stock: nextStock });
                    }
                }
            });
        });

        // Save inventory changes to localStorage if any updates happened
        if (stockUpdated) {
            localStorage.setItem('zenith_cafe_inventory', JSON.stringify(updatedInventory));
            localStorage.setItem('zenith_cafe_inventory_history', JSON.stringify(currentHistory));
            window.dispatchEvent(new Event('storage'));
        }

        // Create transaction ID
        let nextNum = transactions.length + 1;
        let newId = `INV-CF-${String(nextNum).padStart(3, '0')}`;
        while (transactions.some(t => t.id === newId)) {
            nextNum++;
            newId = `INV-CF-${String(nextNum).padStart(3, '0')}`;
        }

        // Format Date
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Create Transaction
        const newTx = {
            id: newId,
            date: dateStr,
            customer: customerName,
            email: customerEmail,
            phone: customerPhone,
            category: basket[0]?.item.category || 'Food',
            total: grandTotal,
            status: 'Paid',
            items: basket.map(b => ({
                name: b.item.name,
                qty: b.qty,
                price: b.item.price
            }))
        };

        const updatedTxList = [newTx, ...transactions];
        saveTransactions(updatedTxList);

        // Raise notification
        triggerSaleComplete({
            invoiceId: newId,
            customerName: customerName,
            amount: grandTotal,
            department: 'Cafe',
            email: customerEmail
        });

        toast.success(`Checkout completed! Invoice ${newId} generated.`);
        setIsSaleOpen(false);
        resetSaleForm();
    };

    useEffect(() => {
        const savedTx = localStorage.getItem('zenith_cafe_transactions');
        let activeTxList = CAFE_TRANSACTIONS;
        if (savedTx) {
            try {
                activeTxList = JSON.parse(savedTx);
            } catch (e) {
                activeTxList = CAFE_TRANSACTIONS;
            }
        } else {
            localStorage.setItem('zenith_cafe_transactions', JSON.stringify(CAFE_TRANSACTIONS));
        }
        setTransactions(activeTxList);

        // Also load menu items to populate new sale selector
        const savedMenu = localStorage.getItem('zenith_cafe_menu');
        if (savedMenu) {
            try {
                setMenuItems(JSON.parse(savedMenu));
            } catch (e) {
                setMenuItems(CAFE_MENU_ITEMS);
            }
        } else {
            setMenuItems(CAFE_MENU_ITEMS);
        }

        // Auto-fire billing notifications once on mount
        activeTxList.forEach(t => {
            if (firedRef.current.has(t.id)) return;
            firedRef.current.add(t.id);
            const payload = { invoiceId: t.id, customerName: t.customer, amount: t.total, department: 'Cafe', email: t.email };
            if (t.status === 'Paid') triggerSaleComplete(payload);
            else if (t.status === 'Pending') triggerPendingBilling(payload);
            else if (t.status === 'Refunded') triggerRefund(payload);
        });
    }, [triggerSaleComplete, triggerPendingBilling, triggerRefund]);

    const kpis = useMemo(() => {
        const paidRevenue = transactions
            .filter(t => t.status === 'Paid')
            .reduce((sum, t) => sum + t.total, 0);

        const totalTxCount = transactions.length;

        const pendingSum = transactions
            .filter(t => t.status === 'Pending')
            .reduce((sum, t) => sum + t.total, 0);

        return {
            revenueToday: paidRevenue,
            totalTransactions: totalTxCount,
            pendingInvoices: pendingSum
        };
    }, [transactions]);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               t.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const exportBilling = async (format: ExportFormat) => {
        const headers = ['Invoice ID', 'Date', 'Customer', 'Category', 'Total Amount', 'Status'];
        const data = filteredTransactions.map(t => [
            t.id,
            t.date,
            t.customer,
            t.category,
            `Rs. ${t.total}`,
            t.status
        ]);

        await handleExport(format, {
            filename: `Cafe_Billing_Report_${new Date().toISOString().split('T')[0]}`,
            title: 'Cafe Transaction Ledger Report',
            headers,
            data,
            category: categoryFilter
        });
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Paid': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> Paid</Badge>;
            case 'Pending': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest"><Clock className="w-3.5 h-3.5 mr-1.5"/> Pending</Badge>;
            case 'Refunded': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest"><XCircle className="w-3.5 h-3.5 mr-1.5"/> Refunded</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Print CSS Injection */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-print-area, #invoice-print-area * { visibility: visible; }
                    #invoice-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background-color: white !important;
                        color: black !important;
                        padding: 40px !important;
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    #invoice-print-area .text-white { color: #000 !important; }
                    #invoice-print-area .text-slate-400 { color: #4b5563 !important; }
                    #invoice-print-area .bg-slate-900 { background-color: #f3f4f6 !important; }
                    #invoice-print-area .bg-slate-950 { background-color: #fff !important; }
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Cafe <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500 not-italic">Billing</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide text-xs uppercase flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                        Transaction ledger, revenue tracking & invoice generation
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton onExport={exportBilling} />
                    <Button onClick={() => setIsSaleOpen(true)} className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-lg shadow-emerald-900/20 border-0 h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Sale
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
                <KPISmall title="Revenue Today" value={`₹${kpis.revenueToday.toLocaleString('en-IN')}`} trend="Live Update" icon={IndianRupee} color="emerald" />
                <KPISmall title="Total Transactions" value={kpis.totalTransactions.toString()} trend="Transactions" icon={CreditCard} color="indigo" />
                <KPISmall title="Pending Invoices" value={`₹${kpis.pendingInvoices.toLocaleString('en-IN')}`} trend="Awaiting Settlement" icon={Clock} color="amber" />
            </div>

            {/* Ledger Table */}
            <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 shadow-2xl flex flex-col min-h-[600px] rounded-3xl overflow-hidden print:hidden">
                <CardHeader className="border-b border-white/5 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input 
                                placeholder="Search Invoice or Member..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-black/40 border-white/10 text-white w-full focus:border-emerald-500/50 h-11 rounded-xl text-xs"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[200px] h-11 bg-black/40 border-white/10 text-white focus:ring-emerald-500/50 rounded-xl text-xs font-bold uppercase tracking-widest">
                                <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                <SelectItem value="All">All Categories</SelectItem>
                                <SelectItem value="Smoothies">Smoothies</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Supplements">Supplements</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0 overflow-auto flex-1">
                    <Table>
                        <TableHeader className="bg-black/60 sticky top-0 z-10 backdrop-blur-xl">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 pl-8">Invoice ID</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14">Date & Time</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14">Customer</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14">Category</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 text-right">Amount</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 text-center">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((t) => (
                                <TableRow key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                                    <TableCell className="pl-8 font-mono text-emerald-400 font-black text-xs tracking-tighter">{t.id}</TableCell>
                                    <TableCell className="text-slate-400 text-xs font-medium">{t.date}</TableCell>
                                    <TableCell className="font-black text-white text-sm italic">{t.customer}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                            {t.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-white italic tracking-tighter text-sm">₹{t.total.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {getStatusBadge(t.status)}
                                            {t.status === 'Paid' && (
                                                <span title="Email receipt sent" className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Mail className="w-2.5 h-2.5" />
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setSelectedInvoice(t)}
                                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-black uppercase tracking-widest text-[10px] rounded-xl px-4"
                                        >
                                            <Receipt className="w-4 h-4 mr-2" />
                                            Invoice
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <Search className="w-10 h-10 opacity-20 mb-4" />
                                            <p className="text-lg font-black text-white italic uppercase tracking-widest">No matching records</p>
                                            <p className="text-xs font-bold uppercase tracking-widest mt-1">Adjust filters or search for another invoice</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Invoice Modal */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent className="max-w-2xl bg-slate-950 border-white/10 p-0 overflow-hidden sm:rounded-[2rem] flex flex-col max-h-[95vh] shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Invoice Details</DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && (
                        <>
                            <ScrollArea className="flex-1 w-full">
                                <div id="invoice-print-area" className="p-8 md:p-12 bg-slate-950">
                                    {/* Invoice Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                                        <div className="space-y-1.5">
                                            <h2 className="text-3xl font-black italic tracking-tighter text-white">
                                                FLEX <span className="text-emerald-500 not-italic">CAFE</span>
                                            </h2>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-emerald-500"/> Zenith Fitness HQ, Command Center</p>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-500"/> +91 800-ZENITH-CF</p>
                                        </div>
                                        <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                                            <h1 className="text-5xl font-black text-emerald-500/20 uppercase tracking-widest mb-4 italic leading-none">Invoice</h1>
                                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Record Identifier</p>
                                            <p className="text-white font-mono text-lg font-bold">{selectedInvoice.id}</p>
                                            <div className="mt-4">
                                                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Timestamp</p>
                                                <p className="text-white font-mono font-bold">{selectedInvoice.date}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bill To & Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 py-8 border-y border-white/5 bg-black/20 rounded-2xl px-8">
                                        <div className="space-y-2">
                                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Member Info</p>
                                            <p className="text-2xl font-black text-white italic">{selectedInvoice.customer}</p>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <p className="text-slate-400 text-xs font-bold">{selectedInvoice.email}</p>
                                                <p className="text-slate-400 text-xs font-bold">{selectedInvoice.phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right space-y-4">
                                            <div>
                                                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Payment State</p>
                                                {getStatusBadge(selectedInvoice.status)}
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Category</p>
                                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black uppercase text-[9px] tracking-widest px-3 py-1">
                                                    {selectedInvoice.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itemized Table */}
                                    <div className="mb-10">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                                                    <th className="pb-4 pl-4">Item Payload</th>
                                                    <th className="pb-4 text-center">Qty</th>
                                                    <th className="pb-4 text-right">Unit Price</th>
                                                    <th className="pb-4 pr-4 text-right">Extended</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-white">
                                                {selectedInvoice.items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-5 pl-4 font-black italic text-sm">{item.name}</td>
                                                        <td className="py-5 text-center font-bold text-slate-400">{item.qty}</td>
                                                        <td className="py-5 text-right text-slate-400 font-mono text-xs">₹{item.price.toLocaleString('en-IN')}</td>
                                                        <td className="py-5 pr-4 text-right font-black italic tracking-tighter text-sm">₹{(item.qty * item.price).toLocaleString('en-IN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end mb-12">
                                        <div className="w-full max-w-xs space-y-4 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <span>Subtotal</span>
                                                <span className="text-white">₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <span>Service Tax (5%)</span>
                                                <span className="text-white">₹{(selectedInvoice.total * 0.05).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-white font-black text-3xl pt-4 border-t border-white/10 italic tracking-tighter">
                                                <span>Total</span>
                                                <span className="text-emerald-400 drop-shadow-glow">₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-t border-white/10 pt-10">
                                        <p className="mb-2">Fuel your potential with Zenith Cafe</p>
                                        <p className="opacity-60 italic">This is a system-generated electronic receipt.</p>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Actions */}
                            <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 p-6 flex justify-end gap-3 print:hidden shrink-0">
                                <Button variant="outline" onClick={() => setSelectedInvoice(null)} className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl">
                                    Close Feed
                                </Button>
                                <Button onClick={handlePrint} className="bg-emerald-500 text-black hover:bg-emerald-400 shadow-glow font-black tracking-widest uppercase text-[10px] h-11 px-8 rounded-xl">
                                    <Printer className="w-4 h-4 mr-2" />
                                    Generate Print
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* New Sale Dialog Modal */}
            <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
                <DialogContent className="max-w-4xl bg-slate-950 border border-white/10 p-0 overflow-hidden sm:rounded-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl text-white">
                    <form onSubmit={handleProcessSale} className="flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div>
                                <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-2">
                                    <Receipt className="w-6 h-6 text-emerald-400" /> Process New Sale
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-wider">
                                    Register items, apply discounts, set payment terms, and deduct kitchen stock
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Modal Body (Scrollable form grid) */}
                        <div className="p-8 space-y-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:space-y-0">
                            {/* Left Column: Customer and Item Selection */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <User className="w-4 h-4 text-emerald-400" /> Customer & Items
                                </h4>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Member / Customer *</label>
                                    <Select value={selectedMember} onValueChange={handleMemberSelect}>
                                        <SelectTrigger className="w-full h-11 bg-black/40 border-white/10 text-white rounded-xl text-xs font-bold uppercase">
                                            <SelectValue placeholder="Select Member" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                            <SelectItem value="custom" className="text-[10px] font-bold uppercase text-emerald-400">+ Walk-in Customer</SelectItem>
                                            {SEED_MEMBERS.map(m => (
                                                <SelectItem key={m.name} value={m.name} className="text-[10px] font-bold uppercase">{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Name *</label>
                                        <Input 
                                            placeholder="Customer Name" 
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            disabled={selectedMember !== 'custom' && selectedMember !== ''}
                                            className="bg-black/40 border-white/10 text-white h-11 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                                        <Input 
                                            placeholder="Email" 
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            disabled={selectedMember !== 'custom' && selectedMember !== ''}
                                            className="bg-black/40 border-white/10 text-white h-11 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone</label>
                                        <Input 
                                            placeholder="Phone Number" 
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            disabled={selectedMember !== 'custom' && selectedMember !== ''}
                                            className="bg-black/40 border-white/10 text-white h-11 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Basket Add Form */}
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Menu Item</span>
                                        <span className="text-[9px] font-mono text-slate-500 uppercase font-black">{menuItems.length} Offerings Available</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Select value={selectedMenuItemId} onValueChange={setSelectedMenuItemId}>
                                                <SelectTrigger className="w-full h-10 bg-black/40 border-white/10 text-white rounded-xl text-xs">
                                                    <SelectValue placeholder="Choose product..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                                    {menuItems.map(m => (
                                                        <SelectItem key={m.id} value={m.id} className="text-[10px] font-bold uppercase">{m.name} (₹{m.price})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-16">
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                placeholder="Qty" 
                                                value={selectedQty}
                                                onChange={(e) => setSelectedQty(e.target.value)}
                                                className="bg-black/40 border-white/10 text-white h-10 rounded-xl text-center text-xs"
                                            />
                                        </div>
                                        <Button 
                                            type="button" 
                                            onClick={handleAddToBasket} 
                                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 h-10 px-3 rounded-xl"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Basket table */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Active basket ({basket.length} items)</span>
                                    <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/20 max-h-48 overflow-y-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-black/40 text-slate-500 text-[9px] uppercase tracking-wider font-black">
                                                    <th className="py-2 pl-4">Item</th>
                                                    <th className="py-2 text-center">Qty</th>
                                                    <th className="py-2 text-right">Price</th>
                                                    <th className="py-2 text-right pr-4">Total</th>
                                                    <th className="py-2 text-center w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {basket.map((b, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                                                        <td className="py-2.5 pl-4 font-black uppercase text-[11px] tracking-tight">{b.item.name}</td>
                                                        <td className="py-2.5 text-center font-bold text-slate-400">{b.qty}</td>
                                                        <td className="py-2.5 text-right font-mono text-[10px] text-slate-500">₹{b.item.price}</td>
                                                        <td className="py-2.5 text-right font-black italic tracking-tighter">₹{b.qty * b.item.price}</td>
                                                        <td className="py-2.5 text-center">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveFromBasket(idx)}
                                                                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {basket.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-8 text-center text-slate-600 uppercase font-black tracking-widest text-[9px]">
                                                            Basket is empty
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Checkout Computations & Payments */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Coins className="w-4 h-4 text-emerald-400" /> Checkout Settlement
                                </h4>

                                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Basket Subtotal</span>
                                        <span className="text-white font-mono">₹{basket.reduce((sum, b) => sum + (b.qty * b.item.price), 0).toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5 text-emerald-400" /> Apply Discount</span>
                                            <span className="text-white font-mono">{discountPct}%</span>
                                        </div>
                                        <Input 
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discountPct}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value) || 0;
                                                setDiscountPct(Math.min(100, Math.max(0, v)).toString());
                                            }}
                                            className="bg-black/40 border-white/10 text-white h-9 rounded-xl text-xs w-28 font-mono pl-3"
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">
                                        <span>Service Tax (5%)</span>
                                        <span className="text-white font-mono">
                                            ₹{Math.round(
                                                (basket.reduce((sum, b) => sum + (b.qty * b.item.price), 0) * (1 - (parseFloat(discountPct) || 0) / 100)) * 0.05
                                            ).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-white font-black text-2xl pt-4 border-t border-white/5 italic tracking-tighter">
                                        <span>Grand Total</span>
                                        <span className="text-emerald-400 drop-shadow-glow">
                                            ₹{Math.round(
                                                (basket.reduce((sum, b) => sum + (b.qty * b.item.price), 0) * (1 - (parseFloat(discountPct) || 0) / 100)) * 1.05
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Methods selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Method</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['Cash', 'UPI', 'Card', 'Split'] as const).map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPaymentMethod(method)}
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    paymentMethod === method
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-glow-sm'
                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                                                }`}
                                            >
                                                {method === 'Card' ? <CreditCard className="w-3.5 h-3.5 inline mr-1.5" /> : method === 'UPI' ? <Wallet className="w-3.5 h-3.5 inline mr-1.5" /> : <Coins className="w-3.5 h-3.5 inline mr-1.5" />}
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Split inputs view */}
                                {paymentMethod === 'Split' && (
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 border-b border-white/5 pb-2">
                                            Configure Split Transactions
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Cash (₹)</label>
                                                <Input 
                                                    type="number"
                                                    value={splitCash}
                                                    onChange={(e) => setSplitCash(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl font-mono text-xs text-center"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">UPI (₹)</label>
                                                <Input 
                                                    type="number"
                                                    value={splitUpi}
                                                    onChange={(e) => setSplitUpi(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl font-mono text-xs text-center"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Card (₹)</label>
                                                <Input 
                                                    type="number"
                                                    value={splitCard}
                                                    onChange={(e) => setSplitCard(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl font-mono text-xs text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
                                Processing syncs directly with kitchen inventory stock
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => { setIsSaleOpen(false); resetSaleForm(); }}
                                    className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-emerald-900/20 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl active:scale-95 transition-all"
                                >
                                    Complete Checkout
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function KPISmall({ title, value, trend, icon: Icon, color }: any) {
    const colors: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl p-6 rounded-3xl group hover:border-white/10 transition-all relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{value}</h3>
                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-indigo-400'}`}>{trend}</p>
                </div>
                <div className={`p-3.5 rounded-2xl ${colors[color]}`}>
                    <Icon className="w-5 h-5 shadow-glow-sm" />
                </div>
            </div>
        </Card>
    );
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
