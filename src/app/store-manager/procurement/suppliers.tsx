'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Phone, Mail, MapPin, Package, Plus, Search, X, Check, Users, Clock, IndianRupee, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SUPPLIERS, type Supplier, type SupplierCategory, type PaymentTerms } from '@/lib/procurement-data';

import SupplierDetailView from '@/components/shared/procurement/SupplierDetailView';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CAT_COLORS: Record<SupplierCategory, string> = {
    'Supplements': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Equipment': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    'Apparel': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Accessories': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
            ))}
            <span className="text-[10px] text-slate-500 ml-1 font-bold">{rating}</span>
        </div>
    );
}

function SupplierCard({ s, onClick }: { s: Supplier; onClick: () => void }) {
    const catCls = CAT_COLORS[s.category];
    return (
        <div 
            onClick={onClick}
            className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-lg">
                    <ExternalLink className="w-3.5 h-3.5" />
                </div>
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{s.name}</h3>
                        {s.isPreferred && <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-[8px] font-black px-1.5 py-0">⭐ PREFERRED</Badge>}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.contactPerson}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${catCls}`}>{s.category}</span>
            </div>
            
            <div className="mb-4">
                <Stars rating={s.rating} />
            </div>

            <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2.5 font-medium"><Mail className="w-3.5 h-3.5 text-slate-600 shrink-0"/>{s.email}</div>
                <div className="flex items-center gap-2.5 font-medium"><Phone className="w-3.5 h-3.5 text-slate-600 shrink-0"/>{s.phone}</div>
                <div className="flex items-center gap-2.5 font-medium"><MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0"/>{s.city} · GST: {s.gstNumber}</div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                    <p className="text-sm font-black text-white italic">{s.totalOrders}</p>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Orders</p>
                </div>
                <div className="space-y-1 border-x border-white/5">
                    <p className="text-sm font-black text-emerald-400 italic">{fmt(s.totalSpend)}</p>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Spend</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-indigo-400 italic">{s.leadTimeDays}d</p>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Lead Time</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[9px] font-bold">
                <span className="text-slate-600">Terms: <span className="text-slate-400">{s.paymentTerms}</span></span>
                <span className="text-slate-500 uppercase tracking-tighter">Joined {new Date(s.joinedDate).getFullYear()}</span>
            </div>
        </div>
    );
}

const EMPTY_FORM = { name:'', contactPerson:'', email:'', phone:'', city:'', category:'Supplements' as SupplierCategory, leadTimeDays:'3', paymentTerms:'Net-30' as PaymentTerms, gstNumber:'', isPreferred: false };

export default function SuppliersTab() {
    const [suppliers, setSuppliers] = useState(SUPPLIERS);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState<SupplierCategory | 'All'>('All');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saved, setSaved] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const filtered = suppliers.filter(s => {
        const q = search.toLowerCase();
        const mQ = !q || s.name.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
        const mC = catFilter === 'All' || s.category === catFilter;
        return mQ && mC;
    });

    const totalSpend = suppliers.reduce((s, v) => s + v.totalSpend, 0);
    const avgLead = suppliers.length > 0 ? Math.round(suppliers.reduce((s, v) => s + v.leadTimeDays, 0) / suppliers.length) : 0;
    const preferred = suppliers.filter(s => s.isPreferred).length;

    const handleAdd = () => {
        const ns: Supplier = {
            id: `s-${Date.now()}`, name: form.name, contactPerson: form.contactPerson,
            email: form.email, phone: form.phone, city: form.city, category: form.category,
            rating: 4.0, totalOrders: 0, totalSpend: 0,
            leadTimeDays: Number(form.leadTimeDays), paymentTerms: form.paymentTerms,
            isPreferred: form.isPreferred, joinedDate: new Date().toISOString().split('T')[0],
            gstNumber: form.gstNumber,
        };
        setSuppliers(p => [ns, ...p]);
        setSaved(true);
        setTimeout(() => { setSaved(false); setShowModal(false); setForm(EMPTY_FORM); }, 1200);
    };

    const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600 transition-all";

    if (selectedSupplier) {
        return (
            <SupplierDetailView 
                supplier={selectedSupplier} 
                onBack={() => setSelectedSupplier(null)} 
                onCreatePO={(id) => {
                    // Logic to jump to PO tab with this supplier pre-selected
                    console.log('Create PO for', id);
                    setSelectedSupplier(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Network Size', val: suppliers.length, color: 'text-white', icon: Users, bg: 'indigo' },
                    { label: 'Preferred Partners', val: preferred, color: 'text-yellow-400', icon: Star, bg: 'yellow' },
                    { label: 'Average Lead Time', val: `${avgLead} days`, color: 'text-indigo-400', icon: Clock, bg: 'purple' },
                    { label: 'Global Procurement', val: fmt(totalSpend), color: 'text-emerald-400', icon: IndianRupee, bg: 'emerald' },
                ].map(k => {
                    const Icon = k.icon;
                    return (
                        <div key={k.label} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                <Icon className="w-12 h-12" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">{k.label}</p>
                            <p className={`text-2xl font-black italic ${k.color}`}>{k.val}</p>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier network..." className={inputCls + ' pl-11 w-72'}/>
                    </div>
                    {(['All','Supplements','Equipment','Apparel','Accessories'] as const).map(c => (
                        <button key={c} onClick={() => setCatFilter(c as any)}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 rounded-xl border transition-all ${catFilter === c ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-white/5 text-slate-500 hover:border-white/10'}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-black uppercase tracking-widest shadow-glow-sm hover:-translate-y-0.5 transition-all shrink-0">
                    <Plus className="w-4 h-4"/> Add New Vendor
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map(s => <SupplierCard key={s.id} s={s} onClick={() => setSelectedSupplier(s)}/>)}
                {filtered.length === 0 && (
                    <div className="col-span-3 py-24 flex flex-col items-center justify-center opacity-30">
                        <Users className="w-16 h-16 mb-4" />
                        <p className="text-lg font-black uppercase tracking-widest">No Vendors Found</p>
                    </div>
                )}
            </div>

            {/* Add Supplier Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Onboard <span className="text-indigo-400 not-italic">New Vendor</span></h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Register a partner for the supply network.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            {[
                                { label: 'Vendor Name', key: 'name', placeholder: 'NutriCore Pvt. Ltd.' },
                                { label: 'Point of Contact', key: 'contactPerson', placeholder: 'John Doe' },
                                { label: 'Official Email', key: 'email', placeholder: 'orders@supplier.com' },
                                { label: 'Contact Number', key: 'phone', placeholder: '+91 98765 43210' },
                                { label: 'City of Operation', key: 'city', placeholder: 'Mumbai' },
                                { label: 'GST Registration', key: 'gstNumber', placeholder: '27XXXXX1234A1Z5' },
                                { label: 'Lead Time (Days)', key: 'leadTimeDays', placeholder: '3' },
                            ].map(f => (
                                <div key={f.key} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{f.label}</label>
                                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder} className={inputCls}/>
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Category</label>
                                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value as SupplierCategory}))} className={inputCls + ' appearance-none'}>
                                    {['Supplements','Equipment','Apparel','Accessories'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Terms</label>
                                <select value={form.paymentTerms} onChange={e => setForm(p => ({...p, paymentTerms: e.target.value as PaymentTerms}))} className={inputCls + ' appearance-none'}>
                                    {['Advance','Net-15','Net-30','COD'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between relative z-10 pt-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={form.isPreferred} onChange={e => setForm(p => ({...p, isPreferred: e.target.checked}))} className="w-5 h-5 rounded-lg border-white/10 bg-black accent-indigo-500"/>
                                <span className="text-[11px] text-slate-400 font-bold group-hover:text-slate-200 transition-colors uppercase tracking-widest">Mark as Preferred Strategic Partner</span>
                            </label>
                        </div>
                        <button onClick={handleAdd} disabled={!form.name || !form.email}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all relative z-10 ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-40 shadow-glow-sm hover:shadow-glow'}`}>
                            {saved ? <><Check className="w-4 h-4 inline mr-2"/>Partnership Secured!</> : 'Complete Onboarding'}
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
