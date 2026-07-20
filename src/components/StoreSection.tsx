"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Tag, Star, Sparkles, Dumbbell } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    category: 'supplements' | 'apparel' | 'gear';
    price: string;
    rating: number;
    image: string;
    badge?: string;
    description: string;
}

const PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Flex Iso-Whey Protein',
        category: 'supplements',
        price: '₹5,499',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800&auto=format&fit=crop',
        badge: 'Best Seller',
        description: 'Ultra-pure grass-fed whey isolate with 26g protein per serving and enhanced digestive enzymes.'
    },
    {
        id: 2,
        name: 'Elite Training Hoodie v2',
        category: 'apparel',
        price: '₹3,499',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
        badge: 'New Arrival',
        description: 'Premium heavyweight cotton blend with engineered ventilation and water-resistant finish.'
    },
    {
        id: 3,
        name: 'Carbon Grip lifting Straps',
        category: 'gear',
        price: '₹1,299',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        badge: 'Premium Gear',
        description: 'Heavy-duty cotton webbing with neoprene wrist padding and carbon-fiber textured silicone grip.'
    },
    {
        id: 4,
        name: 'Flex Pre-Workout Ignite',
        category: 'supplements',
        price: '₹3,199',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800&auto=format&fit=crop',
        description: 'Explosive energy and laser focus formula containing 6g L-Citrulline, Beta-Alanine, and natural caffeine.'
    },
    {
        id: 5,
        name: 'Tech-Knit Performance Tee',
        category: 'apparel',
        price: '₹1,899',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
        description: 'Ultra-lightweight, moisture-wicking fabric with silver-ion anti-odor technology.'
    },
    {
        id: 6,
        name: 'Flex Hybrid Gym Duffel',
        category: 'gear',
        price: '₹4,999',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
        badge: 'Essential',
        description: 'Waterproof ballistic nylon construction with dedicated shoe pocket and wet/dry separator.'
    }
];

export default function StoreSection() {
    const [activeTab, setActiveTab] = useState<'all' | 'supplements' | 'apparel' | 'gear'>('all');

    const filteredProducts = activeTab === 'all' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === activeTab);

    return (
        <section id="store" className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-background via-slate-950/20 to-background border-t border-primary/5">
            {/* Background Light Effects */}
            <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle,_hsl(var(--gold)/0.03),_transparent_75%)] pointer-events-none blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,_hsl(var(--neon-cyan)/0.02),_transparent_75%)] pointer-events-none blur-3xl" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <span className="text-xs font-heading font-semibold text-primary uppercase tracking-widest">
                            Flex Official Store
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground pb-2">
                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">Gear & Nutrition</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto font-body">
                        Elevate your routine with our athlete-curated gear, high-performance apparel, and premium science-backed supplements.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 md:gap-4 mb-12 relative z-10">
                    {(['all', 'supplements', 'apparel', 'gear'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 border
                                ${activeTab === tab
                                    ? 'bg-primary border-primary text-black shadow-glow'
                                    : 'bg-background/40 hover:bg-background/80 border-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mb-16">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group relative glass-card p-1.5 rounded-[2rem] overflow-hidden transition-all duration-500 border border-white/5 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--gold)/0.1)] flex flex-col h-full"
                        >
                            {/* Product Image and Overlay */}
                            <div className="relative aspect-[4/3] rounded-[1.8rem] overflow-hidden bg-charcoal/20">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-[10px] font-black text-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" />
                                        {product.badge}
                                    </div>
                                )}

                                {/* Category Tag */}
                                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-heading font-bold text-slate-300 uppercase tracking-widest">
                                    {product.category}
                                </div>

                                {/* Rating */}
                                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5">
                                    <Star className="w-3 h-3 text-primary fill-primary" />
                                    <span className="text-[10px] font-bold text-white">{product.rating}</span>
                                </div>

                                {/* Price */}
                                <div className="absolute bottom-3 right-4 z-20">
                                    <span className="text-2xl font-black text-primary dark:text-gold-glow drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                        {product.price}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-primary/5 mt-6 flex items-center justify-between">
                                    <span className="text-[10px] font-heading font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" />
                                        In Stock
                                    </span>
                                    <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary dark:group-hover:text-gold-glow transition-colors">
                                        View Details
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section Info */}
                <div className="flex flex-col md:flex-row justify-between items-center p-8 rounded-3xl border border-primary/10 bg-primary/5 backdrop-blur-md relative z-10 gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-heading font-bold text-foreground text-base">Exclusive Member Pricing & Merch Reservations</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                Active members get up to 15% off supplements and can pre-order custom merchandise directly from the member portal.
                            </p>
                        </div>
                    </div>
                    <Link href="/member/store" className="group px-6 py-3 rounded-xl bg-slate-950 dark:bg-primary text-white dark:text-black font-heading font-bold text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center gap-3 shrink-0">
                        Member Portal Store
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
