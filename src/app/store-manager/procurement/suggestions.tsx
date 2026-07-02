'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { calculateReorderSuggestions, type ReorderSuggestion } from '@/lib/reorder-logic';

export default function SuggestionsTab({ onCreatePO }: { onCreatePO: (suggestion: ReorderSuggestion) => void }) {
    const suggestions = useMemo(() => calculateReorderSuggestions(), []);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const activeSuggestions = suggestions.filter(s => !dismissed.includes(s.productId));

    const getReasonBadge = (reason: string) => {
        switch (reason) {
            case 'Critical':
                return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 font-black uppercase tracking-widest text-[10px] animate-pulse">Critical Level</Badge>;
            case 'Low Stock':
                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-black uppercase tracking-widest text-[10px]">Low Inventory</Badge>;
            case 'Fast Moving':
                return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-black uppercase tracking-widest text-[10px]">High Velocity</Badge>;
            default:
                return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{reason}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Analysis Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-24 h-24 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            <Zap className="w-4 h-4 text-white fill-white" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-wide">AI Demand <span className="text-indigo-400 not-italic">Forecast</span></h2>
                    </div>
                    <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                        Our intelligent replenishment engine has analyzed your sales velocity, current stock buffers, and supplier lead times. We recommend restock for <span className="text-white font-bold">{activeSuggestions.length} items</span> to maintain optimal service levels.
                    </p>
                </div>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                    {activeSuggestions.map((s, idx) => (
                        <motion.div
                            key={s.productId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 hover:border-indigo-500/20 transition-all group h-full">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-white">{s.productName}</h3>
                                                {getReasonBadge(s.reason)}
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{s.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Current Stock</p>
                                            <p className={`text-xl font-black ${s.currentStock <= s.minThreshold / 2 ? 'text-rose-400' : 'text-amber-400'}`}>
                                                {s.currentStock} <span className="text-[10px] text-slate-600 font-bold">/ {s.optimalStock}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Bar */}
                                    <div className="grid grid-cols-3 gap-3 mb-6 bg-black/20 rounded-2xl p-3 border border-white/5">
                                        <div className="text-center">
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Velocity</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-indigo-400" />
                                                <span className="text-xs font-black text-white">{s.velocity}/day</span>
                                            </div>
                                        </div>
                                        <div className="text-center border-x border-white/5 px-2">
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Threshold</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                <span className="text-xs font-black text-white">{s.minThreshold}</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Lead Time</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <History className="w-3 h-3 text-slate-500" />
                                                <span className="text-xs font-black text-white">3-5d</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendation & Action */}
                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Recommended Reorder</p>
                                            <p className="text-lg font-black text-indigo-400">+{s.recommendedQty} Units</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setDismissed(p => [...p, s.productId])}
                                                className="text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                Dismiss
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                onClick={() => onCreatePO(s)}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest px-4 h-9 shadow-glow"
                                            >
                                                Create PO <ArrowRight className="w-3 h-3 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activeSuggestions.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-3xl">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase italic tracking-wide">Inventory Optimal</h3>
                        <p className="text-slate-500 text-sm mt-2">All products are currently within their target stock levels.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
