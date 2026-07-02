'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, X, TrendingUp, IndianRupee, Truck, FileText, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/context/NotificationContext';
import {
    INITIAL_PURCHASE_ORDERS, SUPPLIERS, getPOStatusConfig, calcMargin, calcTotalCOGS,
    type PurchaseOrder, type POStatus, type POItem,
} from '@/lib/procurement-data';
import { INVENTORY_DATA } from '@/lib/inventory-data';
import { type ReorderSuggestion } from '@/lib/reorder-logic';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const TAX_RATE = 0.18;

const INVENTORY_PRODUCTS = INVENTORY_DATA.map(p => ({
    productId: p.id,
    productName: p.name,
    sku: p.sku,
    category: p.category,
    sellingPrice: p.sellingPrice
}));

function StatusBadge({ status }: { status: POStatus }) {
    const c = getPOStatusConfig(status);
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>
            {status}
        </span>
    );
}

function PODetail({ po, onClose, onDeliver }: { po: PurchaseOrder; onClose: () => void; onDeliver: (id: string) => void }) {
    const sub = po.items.reduce((s, i) => s + i.costPrice * i.qty, 0);
    const tax = sub * TAX_RATE;
    const projRevenue = po.items.reduce((s, i) => s + i.sellingPrice * i.qty, 0);
    const profit = projRevenue - sub;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div>
                        <div className="flex items-center gap-3"><span className="font-mono text-indigo-400 font-black">{po.id}</span><StatusBadge status={po.status}/></div>
                        <p className="text-xs text-slate-500 mt-0.5">{po.supplierName} · Ordered {po.date}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
                </div>
                <div className="p-6 space-y-5">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-slate-500 font-black uppercase tracking-widest border-b border-white/5">
                                <th className="pb-3 text-left">Product</th>
                                <th className="pb-3 text-center">Qty</th>
                                <th className="pb-3 text-right">Cost</th>
                                <th className="pb-3 text-right">Sell</th>
                                <th className="pb-3 text-right">Margin</th>
                                <th className="pb-3 text-right">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {po.items.map((item, i) => {
                                const margin = calcMargin(item.costPrice, item.sellingPrice);
                                return (
                                    <tr key={i} className="py-2">
                                        <td className="py-3">
                                            <p className="text-white font-bold">{item.productName}</p>
                                            <p className="text-slate-600 font-mono text-[10px]">{item.sku}</p>
                                        </td>
                                        <td className="py-3 text-center text-white font-bold">{item.qty}</td>
                                        <td className="py-3 text-right text-slate-400">{fmt(item.costPrice)}</td>
                                        <td className="py-3 text-right text-slate-400">{fmt(item.sellingPrice)}</td>
                                        <td className="py-3 text-right">
                                            <span className={`font-black ${margin >= 30 ? 'text-emerald-400' : margin >= 15 ? 'text-amber-400' : 'text-rose-400'}`}>{margin}%</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-white font-black">{fmt(item.costPrice * item.qty)}</span>
                                                {item.mfd && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">MFD: {item.mfd}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Cost (incl. GST)</p>
                            <p className="text-lg font-black text-white">{fmt(sub + tax)}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">GST: {fmt(tax)}</p>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Projected Revenue</p>
                            <p className="text-lg font-black text-emerald-400">{fmt(projRevenue)}</p>
                        </div>
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Gross Profit</p>
                            <p className="text-lg font-black text-indigo-400">{fmt(profit)}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{calcMargin(sub, projRevenue)}% margin</p>
                        </div>
                    </div>
                    {(po.status === 'Sent' || po.status === 'Confirmed') && (
                        <button onClick={() => onDeliver(po.id)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Truck className="w-3.5 h-3.5 inline mr-2"/>Mark as Delivered — Update Inventory
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PurchaseOrdersTab({ 
    prefilledSuggestion, 
    onClearPrefilled 
}: { 
    prefilledSuggestion?: ReorderSuggestion | null;
    onClearPrefilled?: () => void;
}) {
    const [orders, setOrders] = useState(INITIAL_PURCHASE_ORDERS);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<POStatus | 'All'>('All');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [step, setStep] = useState(1);
    const [supplierId, setSupplierId] = useState('');
    const [lineItems, setLineItems] = useState<POItem[]>([]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const { triggerOrderArrived } = useNotifications();

    useEffect(() => {
        if (prefilledSuggestion) {
            setShowCreate(true);
            setStep(2); // Go straight to items step
            setSupplierId(prefilledSuggestion.preferredSupplierId);
            
            // Add the suggested item
            const p = INVENTORY_DATA.find(inv => inv.id === prefilledSuggestion.productId);
            if (p) {
                setLineItems([{
                    productId: p.id,
                    productName: p.name,
                    sku: p.sku,
                    category: p.category,
                    qty: prefilledSuggestion.recommendedQty,
                    costPrice: p.costPrice,
                    sellingPrice: p.sellingPrice
                }]);
            }
            
            // Clear the prefilled trigger
            onClearPrefilled?.();
        }
    }, [prefilledSuggestion, onClearPrefilled]);

    const filtered = orders.filter(o => {
        const q = search.toLowerCase();
        const mQ = !q || o.id.toLowerCase().includes(q) || o.supplierName.toLowerCase().includes(q);
        const mS = statusFilter === 'All' || o.status === statusFilter;
        return mQ && mS;
    });

    const cogs = calcTotalCOGS(orders);
    const pendingVal = orders.filter(o => o.status === 'Sent' || o.status === 'Confirmed').reduce((s, o) => s + o.total, 0);
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const MOCK_REVENUE = 1441000;

    const handleDeliver = (id: string) => {
        setOrders(p => p.map(o => o.id === id ? { ...o, status: 'Delivered' as POStatus, receivedDate: new Date().toISOString().split('T')[0] } : o));
        const po = orders.find(o => o.id === id);
        if (po) po.items.forEach(item => triggerOrderArrived({ itemId: item.productId, itemName: item.productName }));
        setSelectedPO(null);
    };

    const addLineItem = (productId: string) => {
        const p = INVENTORY_PRODUCTS.find(p => p.productId === productId);
        if (!p || lineItems.find(l => l.productId === productId)) return;
        setLineItems(prev => [...prev, { ...p, qty: 10, costPrice: Math.round(p.sellingPrice * 0.65) }]);
    };

    const handleSubmitPO = () => {
        const supplier = SUPPLIERS.find(s => s.id === supplierId);
        if (!supplier || lineItems.length === 0) return;
        const sub = lineItems.reduce((s, i) => s + i.costPrice * i.qty, 0);
        const tax = sub * TAX_RATE;
        const newPO: PurchaseOrder = {
            id: `PO-${Date.now().toString().slice(-4)}`, supplierId, supplierName: supplier.name,
            date: new Date().toISOString().split('T')[0], expectedDelivery: deliveryDate,
            status: 'Draft', items: lineItems, subtotal: sub, tax, total: sub + tax, notes,
        };
        setOrders(p => [newPO, ...p]);
        setSaved(true);
        setTimeout(() => { setSaved(false); setShowCreate(false); setStep(1); setSupplierId(''); setLineItems([]); setDeliveryDate(''); setNotes(''); }, 1200);
    };

    const inputCls = "w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600";

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total POs', val: orders.length, color: 'text-white' },
                    { label: 'Pending Value', val: fmt(pendingVal), color: 'text-amber-400' },
                    { label: 'Delivered', val: deliveredCount, color: 'text-emerald-400' },
                    { label: 'Total COGS', val: fmt(cogs), color: 'text-indigo-400' },
                ].map(k => (
                    <div key={k.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{k.label}</p>
                        <p className={`text-xl font-black ${k.color}`}>{k.val}</p>
                    </div>
                ))}
            </div>

            {/* Profit Panel */}
            <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5"/>Cost & Profit Summary</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue', val: fmt(MOCK_REVENUE), color: 'text-emerald-400' },
                        { label: 'Total COGS', val: fmt(cogs), color: 'text-rose-400' },
                        { label: 'Gross Profit', val: fmt(MOCK_REVENUE - cogs), color: 'text-white' },
                        { label: 'Gross Margin', val: `${calcMargin(cogs, MOCK_REVENUE)}%`, color: 'text-indigo-400' },
                    ].map(k => (
                        <div key={k.label} className="text-center">
                            <p className={`text-2xl font-black ${k.color}`}>{k.val}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{k.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"/>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search POs..." className={inputCls + ' pl-8 w-48'}/>
                    </div>
                    {(['All','Draft','Sent','Confirmed','Delivered','Cancelled'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s as any)}
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border transition-all ${statusFilter === s ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'border-white/5 text-slate-500 hover:border-white/10'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <button onClick={() => { setShowCreate(true); setStep(1); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all shrink-0">
                    <Plus className="w-3.5 h-3.5"/>Create PO
                </button>
            </div>

            {/* PO Table */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-0 text-[10px] font-black uppercase tracking-widest text-slate-500 px-5 py-3 border-b border-white/5 bg-black/20">
                    <span>PO ID</span><span>Supplier</span><span className="text-center">Items</span><span className="text-right">Total</span><span className="text-center">Status</span><span className="text-right">Action</span>
                </div>
                {filtered.length === 0 && <p className="text-center text-slate-600 py-10 text-sm">No purchase orders match your filters.</p>}
                {filtered.map(po => (
                    <div key={po.id} className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-0 items-center px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <span className="font-mono text-indigo-400 text-xs font-black">{po.id}</span>
                        <div>
                            <p className="text-sm font-bold text-white">{po.supplierName}</p>
                            <p className="text-[10px] text-slate-600">{po.date} → {po.expectedDelivery}</p>
                        </div>
                        <span className="text-center text-sm font-bold text-white px-4">{po.items.length}</span>
                        <span className="text-right text-sm font-black text-white px-4">{fmt(po.total)}</span>
                        <span className="text-center px-4"><StatusBadge status={po.status}/></span>
                        <button onClick={() => setSelectedPO(po)} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest flex items-center gap-1 justify-end">
                            <FileText className="w-3 h-3"/>View
                        </button>
                    </div>
                ))}
            </div>

            {/* PO Detail */}
            {selectedPO && <PODetail po={selectedPO} onClose={() => setSelectedPO(null)} onDeliver={handleDeliver}/>}

            {/* Create PO Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Create Purchase Order</h3>
                                <div className="flex gap-2 mt-2">
                                    {['Select Supplier','Add Items','Review & Submit'].map((l, i) => (
                                        <span key={i} className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${step === i+1 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-600'}`}>{i+1}. {l}</span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {step === 1 && (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-500">Select a supplier for this purchase order.</p>
                                    <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                                        {SUPPLIERS.map(s => (
                                            <button key={s.id} onClick={() => setSupplierId(s.id)}
                                                className={`text-left px-4 py-3 rounded-xl border transition-all ${supplierId === s.id ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/5 hover:border-white/10'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{s.name}</p>
                                                        <p className="text-[10px] text-slate-500">{s.category} · Lead: {s.leadTimeDays}d · {s.paymentTerms}</p>
                                                    </div>
                                                    {supplierId === s.id && <Check className="w-4 h-4 text-indigo-400"/>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => supplierId && setStep(2)} disabled={!supplierId}
                                        className="w-full py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-black text-xs uppercase tracking-widest disabled:opacity-40 hover:bg-indigo-500/30 transition-all">
                                        Next: Add Items →
                                    </button>
                                </div>
                            )}
                            {step === 2 && (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <select onChange={e => addLineItem(e.target.value)} defaultValue="" className={inputCls + ' appearance-none flex-1'}>
                                            <option value="" disabled>Add product to order...</option>
                                            {INVENTORY_PRODUCTS.filter(p => !lineItems.find(l => l.productId === p.productId)).map(p => (
                                                <option key={p.productId} value={p.productId}>{p.productName} ({p.sku})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {lineItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                                                    <p className="text-[10px] text-slate-500">Sell: {fmt(item.sellingPrice)} · Margin: {calcMargin(item.costPrice, item.sellingPrice)}%</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] text-slate-600 text-center">Qty</p>
                                                        <input type="number" value={item.qty} min={1}
                                                            onChange={e => setLineItems(p => p.map((l, j) => j===i ? {...l, qty: Number(e.target.value)} : l))}
                                                            className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-indigo-500/50"/>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] text-slate-600 text-center">Cost ₹</p>
                                                        <input type="number" value={item.costPrice} min={1}
                                                            onChange={e => setLineItems(p => p.map((l, j) => j===i ? {...l, costPrice: Number(e.target.value)} : l))}
                                                            className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-indigo-500/50"/>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] text-slate-600 text-center">MFD</p>
                                                        <input type="date" value={item.mfd || ''}
                                                            onChange={e => setLineItems(p => p.map((l, j) => j===i ? {...l, mfd: e.target.value} : l))}
                                                            className="w-28 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-[9px] focus:outline-none focus:border-indigo-500/50"/>
                                                    </div>
                                                    <button onClick={() => setLineItems(p => p.filter((_, j) => j!==i))} className="text-slate-600 hover:text-rose-400 transition-colors"><X className="w-3.5 h-3.5"/></button>
                                                </div>
                                            </div>
                                        ))}
                                        {lineItems.length === 0 && <p className="text-center text-slate-600 text-xs py-4">No items added yet.</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Delivery</label>
                                            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className={inputCls}/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</label>
                                            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." className={inputCls}/>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">← Back</button>
                                        <button onClick={handleSubmitPO} disabled={lineItems.length === 0 || saved}
                                            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-40 hover:-translate-y-0.5'}`}>
                                            {saved ? <><Check className="w-3 h-3 inline mr-1"/>PO Created!</> : 'Submit Purchase Order'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
