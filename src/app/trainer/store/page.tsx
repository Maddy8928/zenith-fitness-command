'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Info, Search, ShieldCheck, ChevronLeft, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Mock Data
const PRODUCTS = [
    { id: '1', name: 'Flex Whey Isolate', category: 'SUPPLEMENTS', price: 4199, rating: 4.9, src: '/images/store/flex-whey-isolate.png', tag: 'Bestseller' },
    { id: '2', name: 'Titan Pre-Workout', category: 'SUPPLEMENTS', price: 3299, rating: 4.8, src: '/images/store/titan-pre-workout.png' },
    { id: '3', name: 'Zenith BCAA Recovery', category: 'SUPPLEMENTS', price: 2499, rating: 4.7, src: '/images/store/zenith-bcaa-recovery.png' },
    { id: '4', name: 'Pro Powerlifting Belt', category: 'GEAR', price: 7499, rating: 5.0, src: '/images/store/pro-powerlifting-belt.png', tag: 'Premium' },
    { id: '5', name: 'Flex Compression Tee', category: 'APPAREL', price: 2999, rating: 4.6, src: '/images/store/flex-compression-tee.png' },
    { id: '6', name: 'Elite Wrist Wraps', category: 'GEAR', price: 1699, rating: 4.5, src: '/images/store/elite-wrist-wraps.png' },
];

const CATEGORIES = ['ALL', 'SUPPLEMENTS', 'GEAR', 'APPAREL'];

export default function TrainerStorePage() {
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = PRODUCTS.filter(p => {
        const matchesCategory = activeTab === 'ALL' || p.category === activeTab;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Header / Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-red-600/20 via-orange-500/5 to-transparent p-6 md:p-8 rounded-3xl border border-red-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 w-fit mb-2">
                            <ShieldCheck className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-bold text-red-400 tracking-wider uppercase">Trainer Access</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-foreground dark:text-white mt-1">
                            Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Catalog</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base max-w-lg mt-2">
                            Browse the inventory to recommend supplements and gear to your clients.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-4 w-full md:w-auto">
                        <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-charcoal/80 backdrop-blur-md border border-red-500/30 text-amber-200 font-semibold relative overflow-hidden group w-full md:w-auto">
                            <AlertOctagon className="w-5 h-5 text-red-400" />
                            Browse Only
                        </div>
                    </div>
                </div>

                {/* Trainer Restriction Alert */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-4 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Restricted Point of Sale Access</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            As a trainer, you have catalog viewing permissions to advise clients on their nutrition and gear. For checkout and staff purchases, please visit the Front Desk.
                        </p>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-800">
                    <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide space-x-2">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap ${activeTab === category
                                    ? 'bg-red-600/80 shadow-lg shadow-red-600/25 border-transparent text-white'
                                    : 'bg-transparent border border-slate-700 text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-red-500 focus-visible:border-red-500 rounded-xl"
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProducts.map(product => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                key={product.id}
                                className="group bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl hover:border-red-500/30 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500"
                            >
                                {/* Product Image Area */}
                                <div className="relative h-64 w-full overflow-hidden bg-black/40">
                                    <img
                                        src={product.src}
                                        alt={product.name}
                                        className="object-cover w-full h-full opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                                    {product.tag && (
                                        <div className="absolute top-4 left-4 bg-amber-500/90 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                                            {product.tag}
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-slate-700">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-white">{product.rating}</span>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="p-6 flex-1 flex flex-col justify-between relative z-10 -mt-8 bg-slate-950/80 backdrop-blur-md rounded-t-3xl border-t border-slate-800">
                                    <div>
                                        <h3 className="text-xl font-heading font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            High quality {product.category.toLowerCase()}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Price</span>
                                            <span className="text-2xl font-black text-white">₹{product.price}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                        >
                                            View Specs
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 backdrop-blur-sm">
                        <Info className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white">No products found</h3>
                        <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
