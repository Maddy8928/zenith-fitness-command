"use client";

import React, { useState } from 'react';
import { Search, Plus, Minus, X, CreditCard, ShoppingCart, User, Tag, Zap } from 'lucide-react';
import { toast } from 'sonner';

type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
};

type CartItem = Product & { quantity: number };

const mockProducts: Product[] = [
    { id: 'p1', name: 'Flex Whey Isolate', category: 'Supplements', price: 4199, stock: 45, image: 'bg-emerald-500/20 text-emerald-500' },
    { id: 'p2', name: 'Pre-Workout Energizer', category: 'Supplements', price: 2949, stock: 22, image: 'bg-amber-500/20 text-amber-500' },
    { id: 'p3', name: 'BCAA Recovery', category: 'Supplements', price: 2499, stock: 15, image: 'bg-blue-500/20 text-blue-500' },
    { id: 'p4', name: 'Flex Gym Tee', category: 'Apparel', price: 1999, stock: 50, image: 'bg-slate-500/20 text-slate-300' },
    { id: 'p5', name: 'Performance Shorts', category: 'Apparel', price: 3299, stock: 30, image: 'bg-slate-500/20 text-slate-300' },
    { id: 'p6', name: 'Smart Shaker Bottle', category: 'Accessories', price: 1249, stock: 100, image: 'bg-primary/20 text-primary' },
    { id: 'p7', name: 'Lifting Straps', category: 'Accessories', price: 1699, stock: 40, image: 'bg-rose-500/20 text-rose-500' },
    { id: 'p8', name: 'Protein Bar Box (12x)', category: 'Snacks', price: 2499, stock: 25, image: 'bg-amber-500/20 text-amber-500' },
];

const categories = ['All', 'Supplements', 'Apparel', 'Accessories', 'Snacks'];

export default function POSPanel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState<CartItem[]>([]);

    const filteredProducts = mockProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCat;
    });

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        toast.success(`Checkout completed for ₹${total.toLocaleString()}`);
        setCart([]);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
            {/* Main Product Area (Left side) */}
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <header>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Point of Sale</h1>
                    <p className="text-muted-foreground mt-1">Manage store inventory and process member purchases.</p>
                </header>

                {/* Filters & Search */}
                <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products or scan barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_hsl(var(--gold)/0.2)]' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto pr-2 pb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="glass-card rounded-2xl p-4 cursor-pointer hover:border-primary/50 transition-all active:scale-95 group flex flex-col"
                        >
                            {/* Product Image Placeholder */}
                            <div className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center border border-white/5 ${product.image}`}>
                                <Zap className="w-8 h-8 opacity-50 shadow-black drop-shadow-lg" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
                                    <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                                    <span className="text-xs text-slate-400">{product.stock} in stock</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No products found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Sidebar (Right side) */}
            <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col h-full bg-charcoal/30 border border-primary/20 rounded-3xl overflow-hidden glass-card relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Cart Header */}
                <div className="p-6 border-b border-primary/10 bg-black/20 flex justify-between items-center">
                    <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Current Order
                    </h2>
                    <button className="text-sm text-primary hover:underline" onClick={() => setCart([])}>Clear</button>
                </div>

                {/* Member Selection (Optional) */}
                <div className="p-4 border-b border-primary/10 bg-black/10">
                    <button className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        Attach to Member Account
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-black/20 border border-white/5 flex gap-3">
                            <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center ${item.image}`}>
                                <Zap className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sm text-foreground truncate pr-2">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-rose-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>

                                    <div className="flex items-center gap-3 bg-black/30 rounded-lg px-2 py-1 border border-white/5">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-muted-foreground hover:text-foreground">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="text-muted-foreground hover:text-foreground">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-20">
                            <ShoppingCart className="w-12 h-12 mb-4" />
                            <p>Cart is empty</p>
                            <p className="text-sm text-center px-8 mt-2">Select items from the inventory to add them to the order.</p>
                        </div>
                    )}
                </div>

                {/* Checkout Section */}
                <div className="p-6 bg-black/40 border-t border-primary/20 backdrop-blur-xl">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-slate-300">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-300">
                            <span>Tax (8%)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-400">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Discount</span>
                            <span>₹0</span>
                        </div>
                        <div className="h-px bg-white/10 w-full my-2" />
                        <div className="flex justify-between font-bold text-xl">
                            <span className="text-foreground">Total</span>
                            <span className="text-primary">₹{total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                            className={`col-span-2 py-4 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${cart.length > 0 ? 'bg-primary text-black gold-glow hover:bg-primary/90' : 'bg-white/5 text-muted-foreground cursor-not-allowed'}`}
                        >
                            <CreditCard className="w-5 h-5" />
                            Charge ₹{total.toLocaleString()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
