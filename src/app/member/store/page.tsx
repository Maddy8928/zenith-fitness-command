'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, ShoppingCart, Info, Search, ShieldCheck, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useOrders } from '@/context/OrderContext';
import { INVENTORY_DATA } from '@/lib/inventory-data';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

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

export default function StorePage() {
    const { addOrder } = useOrders();
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [inventory, setInventory] = useState<any[]>([]);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Initial load for inventory and cart from LocalStorage
    useEffect(() => {
        const savedInventory = localStorage.getItem('zenith_store_inventory');
        if (savedInventory) {
            try {
                setInventory(JSON.parse(savedInventory));
            } catch (e) {
                setInventory(INVENTORY_DATA);
            }
        } else {
            setInventory(INVENTORY_DATA);
            localStorage.setItem('zenith_store_inventory', JSON.stringify(INVENTORY_DATA));
        }

        const savedCart = localStorage.getItem('zenith_store_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                setCart({});
            }
        }
    }, []);

    const saveCart = (newCart: Record<string, number>) => {
        setCart(newCart);
        localStorage.setItem('zenith_store_cart', JSON.stringify(newCart));
    };

    // Merge PRODUCTS with stock levels from inventory state
    const productsWithStock = PRODUCTS.map(p => {
        const invItem = inventory.find(item => item.id === p.id);
        return {
            ...p,
            stock: invItem ? invItem.stock : 0
        };
    });

    const filteredProducts = productsWithStock.filter(p => {
        const matchesCategory = activeTab === 'ALL' || p.category === activeTab;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (productId: string) => {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const invItem = inventory.find(item => item.id === productId);
        const currentStock = invItem ? invItem.stock : 0;
        const currentQtyInCart = cart[productId] || 0;

        if (currentStock <= 0 || currentQtyInCart >= currentStock) {
            toast.error("Out of Stock", {
                description: `Cannot add more ${product.name}. Only ${currentStock} units available.`,
            });
            return;
        }

        const newQty = currentQtyInCart + 1;
        const newCart = {
            ...cart,
            [productId]: newQty
        };
        saveCart(newCart);

        toast.custom((t) => (
            <div className="bg-slate-950/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col gap-3 shadow-2xl max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300 text-white">
                <div className="flex gap-3">
                    <div className="bg-violet-500/10 p-2.5 rounded-xl text-violet-400 border border-violet-500/20">
                        <ShoppingCart className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm">Item added to your cart successfully.</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.name} (Qty: {newQty})</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => toast.dismiss(t)} 
                        className="px-3.5 py-2 text-xs font-bold rounded-xl hover:bg-white/5 border border-white/10 text-muted-foreground transition-all hover:text-white"
                    >
                        Continue Shopping
                    </button>
                    <button 
                        onClick={() => {
                            setIsCartOpen(true);
                            toast.dismiss(t);
                        }} 
                        className="px-3.5 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30"
                    >
                        View Cart
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleUpdateQuantity = (productId: string, delta: number) => {
        const currentQty = cart[productId] || 0;
        const newQty = currentQty + delta;
        
        if (newQty <= 0) {
            handleRemoveFromCart(productId);
            return;
        }

        const invItem = inventory.find(item => item.id === productId);
        const currentStock = invItem ? invItem.stock : 0;

        if (newQty > currentStock) {
            const product = PRODUCTS.find(p => p.id === productId);
            toast.error("Stock Limit Reached", {
                description: `Only ${currentStock} units of ${product?.name || 'this item'} are available.`,
            });
            return;
        }

        const newCart = {
            ...cart,
            [productId]: newQty
        };
        saveCart(newCart);
    };

    const handleRemoveFromCart = (productId: string) => {
        const newCart = { ...cart };
        delete newCart[productId];
        saveCart(newCart);
        
        const product = PRODUCTS.find(p => p.id === productId);
        toast.info("Item Removed", {
            description: `${product?.name || 'Item'} has been removed from your cart.`,
        });
    };

    // Calculate cart count
    const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    // Map cart items with their full product details and stock status
    const cartItems = Object.entries(cart).map(([id, quantity]) => {
        const product = PRODUCTS.find(p => p.id === id);
        const invProduct = inventory.find(p => p.id === id);
        if (!product) return null;
        return {
            ...product,
            quantity,
            stock: invProduct ? invProduct.stock : 0
        };
    }).filter((item): item is (typeof PRODUCTS[0] & { quantity: number; stock: number }) => item !== null);

    // Calculate billing details
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.15; // 15% off VIP
    const deliveryFee = subtotal > 4000 || subtotal === 0 ? 0 : 250;
    const total = subtotal - discount + deliveryFee;

    const handleCheckout = () => {
        if (cartCount === 0) return;

        // 1. Deduct stock in LocalStorage
        const updatedInventory = inventory.map(item => {
            const qtyInCart = cart[item.id] || 0;
            if (qtyInCart > 0) {
                return {
                    ...item,
                    stock: Math.max(0, item.stock - qtyInCart)
                };
            }
            return item;
        });
        
        setInventory(updatedInventory);
        localStorage.setItem('zenith_store_inventory', JSON.stringify(updatedInventory));

        // 2. Register order in OrderContext
        const itemsList = Object.entries(cart).map(([id, qty]) => {
            const product = PRODUCTS.find(p => p.id === id);
            return `${qty}x ${product?.name || 'Store Item'}`;
        });

        addOrder({
            member: 'Alex Thompson',
            items: itemsList,
            total: `₹${total.toLocaleString()}`,
            status: 'incoming',
            time: 'Just now',
            priority: total > 5000 ? 'high' : 'normal'
        });

        // 3. Clear cart
        saveCart({});
        setIsCartOpen(false);

        // 4. Show success toast
        toast.success("Order Placed Successfully!", {
            description: "Your order has been logged. You can collect your items at the gym's reception counter.",
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-violet-600/20 via-primary/5 to-transparent p-6 md:p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit mb-2">
                        <Flame className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold text-violet-400 tracking-wider uppercase">Pro Shop</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-heading font-black text-foreground dark:text-white mt-1">
                        Fuel Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-primary">Performance</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base max-w-lg mt-2">
                        Premium supplements and elite gear curated for peak performance. Enjoy 15% off as a VIP member.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-charcoal/80 backdrop-blur-md border border-white/10 hover:border-violet-500/50 text-white font-semibold transition-all hover:bg-white/5 whitespace-nowrap relative group"
                    >
                        <ShoppingCart className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                        View Cart
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-in zoom-in duration-300">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/30 backdrop-blur-sm p-2 rounded-2xl border border-white/5">
                <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide space-x-2">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap ${activeTab === category
                                    ? 'bg-violet-600 shadow-lg shadow-violet-600/25 border-transparent text-white'
                                    : 'bg-transparent border border-white/10 text-muted-foreground hover:bg-white/5'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-black/20 border-white/10 focus:border-violet-500 h-11 rounded-xl"
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
                            className="group glass-card rounded-3xl border border-white/5 hover:border-violet-500/30 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 bg-gradient-to-b from-white/[0.02] to-transparent"
                        >
                            {/* Product Image Area */}
                            <div className="relative h-64 w-full overflow-hidden bg-black/40">
                                <img
                                    src={product.src}
                                    alt={product.name}
                                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

                                {product.tag && (
                                    <div className="absolute top-4 left-4 bg-violet-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                                        {product.tag}
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/10">
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-bold text-white">{product.rating}</span>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="p-6 flex-1 flex flex-col justify-between relative z-10 -mt-8 bg-background/50 backdrop-blur-md rounded-t-3xl border-t border-white/5">
                                <div>
                                    <h3 className="text-xl font-heading font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        High quality {product.category.toLowerCase()}
                                    </p>
                                </div>

                                 <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 w-full">
                                    <div className="flex flex-col flex-shrink-0">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
                                        <span className="text-2xl font-black text-white">₹{product.price.toLocaleString()}</span>
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <span className="text-[10px] text-amber-400 font-bold mt-0.5 animate-pulse">
                                                Only {product.stock} left!
                                            </span>
                                        )}
                                    </div>
                                    {product.stock === 0 ? (
                                        <Button
                                            disabled
                                            className="rounded-xl bg-zinc-850 border border-white/5 text-zinc-500 cursor-not-allowed h-12 px-5 font-bold"
                                        >
                                            Out of Stock
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleAddToCart(product.id)}
                                            className="rounded-xl bg-white text-black hover:bg-violet-500 hover:text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all w-12 h-12 p-0 group-hover:w-36 group-hover:px-4 duration-300"
                                        >
                                            <ShoppingCart className="w-5 h-5 mx-auto group-hover:hidden" />
                                            <span className="hidden group-hover:inline font-bold">Add to Cart</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white">No products found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                {[
                    { title: "Secure Checkout", desc: "256-bit encryption", icon: ShieldCheck },
                    { title: "Fast Shipping", desc: "2-day delivery on orders over ₹4,000", icon: Flame },
                    { title: "Quality Guaranteed", desc: "Tested for purity and potency", icon: Star },
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                        <div className="bg-violet-500/10 p-3 rounded-xl border border-violet-500/20">
                            <feature.icon className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Shopping Cart Drawer */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetContent side="right" className="p-0 w-full sm:max-w-md border-l border-white/10 bg-slate-950/95 backdrop-blur-xl flex flex-col text-white h-full z-50">
                    <SheetHeader className="p-6 border-b border-white/5">
                        <SheetTitle className="text-xl font-heading font-black text-white flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-violet-400" />
                            Shopping Cart
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Manage your items and proceed to checkout
                        </SheetDescription>
                    </SheetHeader>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-20">
                                <div className="bg-violet-500/10 p-4 rounded-full text-violet-400">
                                    <ShoppingCart className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-base">Your cart is empty</p>
                                    <p className="text-xs mt-1 max-w-[240px]">Add products from our pro shop to start fueling your performance.</p>
                                </div>
                                <Button 
                                    onClick={() => setIsCartOpen(false)} 
                                    className="mt-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold px-6 py-2 border-none"
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 items-center">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/5 relative shrink-0">
                                        <img src={item.src} alt={item.name} className="object-cover w-full h-full" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm text-white truncate pr-2">{item.name}</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveFromCart(item.id)} 
                                                className="text-muted-foreground hover:text-rose-400 transition-colors p-1" 
                                                title="Remove item"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-black text-sm text-violet-400">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-2.5 py-1 border border-white/5 shrink-0">
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.id, -1)} 
                                                    className="text-muted-foreground hover:text-white transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center text-white">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.id, 1)} 
                                                    className="text-muted-foreground hover:text-white transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Checkout */}
                    {cartItems.length > 0 && (
                        <div className="p-6 bg-black/45 border-t border-white/5 backdrop-blur-md space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>VIP Discount (15%)</span>
                                    <span className="text-emerald-400">-₹{discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>Delivery/Handling</span>
                                    <span className="text-white">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="h-px bg-white/5 my-2" />
                                <div className="flex justify-between font-black text-lg items-end">
                                    <span className="text-white">Total</span>
                                    <span className="text-violet-400">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button 
                                onClick={handleCheckout} 
                                className="w-full py-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-violet-600/25 active:scale-95 transition-all border-none"
                            >
                                Place Order
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

