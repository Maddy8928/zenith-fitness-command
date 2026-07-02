'use client';

import React, { useState } from 'react';
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
    ShoppingBag,

    IndianRupee,
    Building2,
    Mail,
    Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/context/NotificationContext';
import { useEffect, useRef } from 'react';
import { ExportButton, ExportFormat } from '@/components/shared/ExportButton';
import { handleExport } from '@/utils/exportUtils';

// Mock Transaction Data
const TRANSACTIONS = [
    { id: 'INV-2024-001', date: '2024-10-24 14:30', customer: 'Alex Thompson', email: 'alex@example.com', phone: '+91 98765 43210', department: 'Store', total: 4199, status: 'Paid', items: [
        { name: 'Nexus Whey Isolate', qty: 1, price: 4199 }
    ]},
    { id: 'INV-2024-003', date: '2024-10-24 16:00', customer: 'David Garcia', email: 'david@example.com', phone: '+91 98765 43212', department: 'Store', total: 7499, status: 'Pending', items: [
        { name: 'Pro Powerlifting Belt', qty: 1, price: 7499 }
    ]},
    { id: 'INV-2024-005', date: '2024-10-24 17:30', customer: 'Michael Chen', email: 'michael@example.com', phone: '+91 98765 43214', department: 'Store', total: 5499, status: 'Refunded', items: [
        { name: 'Mass Gainer Pro', qty: 1, price: 5499 }
    ]},
];

export default function BillingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [selectedInvoice, setSelectedInvoice] = useState<typeof TRANSACTIONS[0] | null>(null);
    const { triggerSaleComplete, triggerPendingBilling, triggerRefund } = useNotifications();
    const firedRef = useRef<Set<string>>(new Set());

    // Auto-fire billing notifications once on mount
    useEffect(() => {
        TRANSACTIONS.forEach(t => {
            if (firedRef.current.has(t.id)) return;
            firedRef.current.add(t.id);
            const payload = { invoiceId: t.id, customerName: t.customer, amount: t.total, department: t.department, email: t.email };
            if (t.status === 'Paid') triggerSaleComplete(payload);
            else if (t.status === 'Pending') triggerPendingBilling(payload);
            else if (t.status === 'Refunded') triggerRefund(payload);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredTransactions = TRANSACTIONS.filter(t => {
        const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              t.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === 'All' || t.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    const exportBilling = async (format: ExportFormat) => {
        const headers = ['Invoice ID', 'Date', 'Customer', 'Department', 'Total Amount', 'Status'];
        const data = filteredTransactions.map(t => [
            t.id,
            t.date,
            t.customer,
            t.department,
            `Rs. ${t.total}`,
            t.status
        ]);

        await handleExport(format, {
            filename: `Billing_Report_${new Date().toISOString().split('T')[0]}`,
            title: 'Unified Billing Transaction Report',
            headers,
            data,
            category: deptFilter
        });
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Paid': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>;
            case 'Pending': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
            case 'Refunded': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20"><XCircle className="w-3 h-3 mr-1"/> Refunded</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getDeptIcon = (dept: string) => {
        return <ShoppingBag className="w-4 h-4 text-indigo-400" />;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Print CSS Injection */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-print-area, #invoice-print-area * {
                        visibility: visible;
                    }
                    #invoice-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background-color: white !important;
                        color: black !important;
                        padding: 40px !important;
                    }
                    /* Ensure backgrounds print correctly for UI elements inside invoice */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Hide scrollbars and dialog overlays */
                    .fixed { position: absolute !important; }
                    [data-state="open"] { overflow: visible !important; }
                    
                    /* Specific overrides for invoice text visibility on white paper */
                    #invoice-print-area .text-white { color: #000 !important; }
                    #invoice-print-area .text-slate-400 { color: #4b5563 !important; }
                    #invoice-print-area .bg-slate-900 { background-color: #f3f4f6 !important; }
                    #invoice-print-area .bg-slate-950 { background-color: #fff !important; }
                    #invoice-print-area .border-white\\/10 { border-color: #e5e7eb !important; }
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Billing</span></h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Manage transactions, generate invoices, and track revenue for store products.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton onExport={exportBilling} />
                </div>
            </div>

            {/* KPIs - Hidden on Print */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
                <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            Total Revenue Today
                            <IndianRupee className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">₹14,545</div>
                        <p className="text-xs text-emerald-400 mt-2 font-bold">+24% vs yesterday</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            Pending Payments
                            <Clock className="w-4 h-4 text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">₹7,499</div>
                        <p className="text-xs text-amber-400 mt-2 font-bold">1 invoice awaiting payment</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            Avg Order Value
                            <Receipt className="w-4 h-4 text-indigo-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">₹2,819</div>
                        <p className="text-xs text-indigo-400 mt-2 font-bold">Store transaction average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table - Hidden on Print */}
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl flex flex-col min-h-[500px] print:hidden">
                <CardHeader className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input 
                                placeholder="Search INV-XXX or Customer..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-black/40 border-white/10 text-white w-72 focus:border-indigo-500"
                            />
                        </div>
                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-white focus:ring-indigo-500">
                                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="All">All Categories</SelectItem>
                                <SelectItem value="Store">Store Items</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto flex-1">
                    <Table>
                        <TableHeader className="bg-black/40">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Invoice ID</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Date & Time</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Dept</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Amount</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Status</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((t) => (
                                <TableRow key={t.id} className="border-white/5 hover:bg-white/[0.02]">
                                    <TableCell className="font-mono text-indigo-400 font-bold">{t.id}</TableCell>
                                    <TableCell className="text-slate-400">{t.date}</TableCell>
                                    <TableCell className="font-bold text-white">{t.customer}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-300">
                                            {getDeptIcon(t.department)}
                                            {t.department}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-white">₹{t.total.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {getStatusBadge(t.status)}
                                            {t.status === 'Paid' && (
                                                <span title="Email receipt sent" className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <Mail className="w-2.5 h-2.5" />
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setSelectedInvoice(t)}
                                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-bold uppercase tracking-wider text-[10px]"
                                        >
                                            <Receipt className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <TableRow className="hover:bg-transparent border-transparent">
                                    <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                                        No transactions found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Invoice Modal */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent className="max-w-2xl bg-slate-950 border-white/10 p-0 overflow-hidden sm:rounded-2xl flex flex-col max-h-[95vh]" id="invoice-modal-content">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Invoice Details</DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && (
                        <>
                            <ScrollArea className="flex-1 w-full">
                                {/* The actual area to be printed */}
                                <div id="invoice-print-area" className="p-6 md:p-12 bg-slate-950">
                                    
                                    {/* Invoice Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black italic tracking-tighter text-white">
                                                ZENITH <span className="text-indigo-500 not-italic">FITNESS</span>
                                            </h2>
                                            <p className="text-slate-500 text-sm flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5"/> 123 Fitness Avenue, Tech District</p>
                                            <p className="text-slate-500 text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> +91 800-ZENITH</p>
                                            <p className="text-slate-500 text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> billing@zenithfitness.com</p>
                                        </div>
                                        <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                                            <h1 className="text-4xl font-black text-indigo-500/40 uppercase tracking-widest mb-4">Invoice</h1>
                                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Invoice No.</p>
                                            <p className="text-white font-mono text-lg">{selectedInvoice.id}</p>
                                            <div className="mt-4">
                                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Date</p>
                                                <p className="text-white font-mono">{selectedInvoice.date}</p>
                                            </div>
                                        </div>
                                    </div>

                                {/* Bill To & Status */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 py-6 border-y border-white/10">
                                        <div className="space-y-1">
                                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">Billed To</p>
                                            <p className="text-xl font-black text-white">{selectedInvoice.customer}</p>
                                            <p className="text-slate-400 text-sm">{selectedInvoice.email}</p>
                                            <p className="text-slate-400 text-sm">{selectedInvoice.phone}</p>
                                        </div>
                                        <div className="text-left md:text-right w-full md:w-auto">
                                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">Payment Status</p>
                                            {getStatusBadge(selectedInvoice.status)}
                                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-4 mb-2">Category</p>
                                            <div className="flex items-center justify-start md:justify-end gap-2 text-white font-bold">
                                                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                                                Store Product
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itemized Table */}
                                    <div className="mb-8 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/20 text-slate-400 text-xs uppercase tracking-widest font-bold">
                                                <th className="pb-4 pl-4">Item Description</th>
                                                <th className="pb-4 text-center">Qty</th>
                                                <th className="pb-4 text-right">Price</th>
                                                <th className="pb-4 pr-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white">
                                            {selectedInvoice.items.map((item, idx) => (
                                                <tr key={idx} className="border-b border-white/5">
                                                    <td className="py-4 pl-4 font-bold">{item.name}</td>
                                                    <td className="py-4 text-center">{item.qty}</td>
                                                    <td className="py-4 text-right text-slate-400">₹{item.price.toLocaleString('en-IN')}</td>
                                                    <td className="py-4 pr-4 text-right font-black">₹{(item.qty * item.price).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals Calculation */}
                                <div className="flex justify-end mb-12">
                                    <div className="w-full max-w-xs space-y-3">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Subtotal</span>
                                            <span>₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Tax (18% GST) Included</span>
                                            <span>₹{(selectedInvoice.total * 0.18).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-white font-black text-2xl pt-4 border-t border-white/20">
                                            <span>Total</span>
                                            <span>₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center text-slate-500 text-xs border-t border-white/10 pt-8">
                                    <p className="font-bold uppercase tracking-widest mb-1">Thank you for your business!</p>
                                    <p>If you have any questions about this invoice, please contact billing@zenithfitness.com</p>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Print / Download Actions - Hidden on Print */}
                            <div className="bg-slate-900 border-t border-white/10 p-6 flex justify-end gap-3 print:hidden shrink-0">
                                <Button variant="outline" onClick={() => setSelectedInvoice(null)} className="border-white/10 text-white hover:!text-white hover:!bg-white/5 font-bold uppercase tracking-widest">
                                    Close
                                </Button>
                                <Button onClick={handlePrint} className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-glow font-bold tracking-widest uppercase px-6">
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print / Download
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
