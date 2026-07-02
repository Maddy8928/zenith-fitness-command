'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Users, FileText, Zap } from 'lucide-react';
import SuppliersTab from './suppliers';
import PurchaseOrdersTab from './orders';
import SuggestionsTab from './suggestions';
import { type ReorderSuggestion } from '@/lib/reorder-logic';

const TABS = [
    { id: 'suggestions', label: 'Suggestions', icon: Zap },
    { id: 'suppliers',   label: 'Suppliers', icon: Users },
    { id: 'orders',      label: 'Purchase Orders', icon: FileText },
];

export default function ProcurementPage() {
    const [tab, setTab] = useState('suggestions');
    const [prefilledSuggestion, setPrefilledSuggestion] = useState<ReorderSuggestion | null>(null);

    const handleCreatePOFromSuggestion = (suggestion: ReorderSuggestion) => {
        setPrefilledSuggestion(suggestion);
        setTab('orders');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-indigo-400"/>
                        </div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Procurement</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                        Purchase & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">Supplier</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium tracking-wide">
                        Manage vendors, track purchase orders, and monitor cost vs profit.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/50 border border-white/5 rounded-2xl p-1 w-fit relative z-20">
                {TABS.map(t => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                            {active && (
                                <motion.div layoutId="procTab" className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 rounded-xl"/>
                            )}
                            <Icon className={`w-3.5 h-3.5 relative z-10 ${active ? 'text-indigo-400' : ''}`}/>
                            <span className="relative z-10">{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    {tab === 'suggestions' && <SuggestionsTab onCreatePO={handleCreatePOFromSuggestion} />}
                    {tab === 'suppliers' && <SuppliersTab/>}
                    {tab === 'orders' && (
                        <PurchaseOrdersTab 
                            prefilledSuggestion={prefilledSuggestion} 
                            onClearPrefilled={() => setPrefilledSuggestion(null)} 
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
