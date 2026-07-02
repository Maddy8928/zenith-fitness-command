'use client';

import React, { useState, useEffect } from 'react';
import { useOrders, Order } from '@/context/OrderContext';
import { useNotifications } from '@/context/NotificationContext';
import { 
    Coffee, 
    Utensils, 
    Zap, 
    Star, 
    Clock, 
    ArrowLeft,
    ShoppingBag,
    Plus,
    Minus,
    Flame,
    CreditCard,
    Wallet,
    QrCode,
    CheckCircle2,
    MessageSquare,
    AlertCircle,
    ChevronRight,
    Sparkles,
    ShieldCheck,
    Download,
    Dumbbell,
    Salad,
    Activity,
    History,
    TrendingUp,
    Heart,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CAFE_MENU_ITEMS, MenuItem } from '@/lib/cafe-menu-data';
import { CAFE_INVENTORY_DATA } from '@/lib/cafe-inventory-data';

const CATEGORY_STYLES: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
    'Protein Shakes': { icon: Dumbbell, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    'Smoothies': { icon: Coffee, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    'Healthy Meals': { icon: Salad, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    'Pre-Workout Drinks': { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    'Post-Workout Meals': { icon: Utensils, color: 'text-rose-400', bg: 'bg-rose-450/10' },
    'Snacks': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
};

const getCategoryStyle = (category: string) => {
    return CATEGORY_STYLES[category] || { icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' };
};

const NUTRITION_MAP: Record<string, { calories: number; protein: string; carbs: string; fat: string }> = {
    'm1': { calories: 320, protein: '35g', carbs: '12g', fat: '5g' },
    'm2': { calories: 540, protein: '42g', carbs: '35g', fat: '12g' },
    'm3': { calories: 500, protein: '28g', carbs: '65g', fat: '8g' },
    'm4': { calories: 15, protein: '2g', carbs: '2g', fat: '0g' },
};

const getNutrition = (item: MenuItem) => {
    if (item.nutrition) {
        return { 
            calories: item.nutrition.calories, 
            protein: item.nutrition.protein.endsWith('g') ? item.nutrition.protein : `${item.nutrition.protein}g`,
            carbs: item.nutrition.carbs.endsWith('g') ? item.nutrition.carbs : `${item.nutrition.carbs}g`,
            fat: item.nutrition.fat.endsWith('g') ? item.nutrition.fat : `${item.nutrition.fat}g`,
        };
    }
    if (NUTRITION_MAP[item.id]) {
        return NUTRITION_MAP[item.id];
    }
    switch (item.category) {
        case 'Protein Shakes':
            return { calories: 350, protein: '30g', carbs: '15g', fat: '6g' };
        case 'Smoothies':
            return { calories: 250, protein: '15g', carbs: '45g', fat: '2g' };
        case 'Healthy Meals':
            return { calories: 550, protein: '40g', carbs: '35g', fat: '12g' };
        case 'Pre-Workout Drinks':
            return { calories: 20, protein: '2g', carbs: '2g', fat: '0g' };
        case 'Post-Workout Meals':
            return { calories: 600, protein: '45g', carbs: '70g', fat: '14g' };
        case 'Snacks':
            return { calories: 200, protein: '8g', carbs: '10g', fat: '8g' };
        default:
            return { calories: 200, protein: '15g', carbs: '20g', fat: '5g' };
    }
};

const checkAvailability = (item: MenuItem) => {
    return item.ingredients.every(ing => {
        const invItem = CAFE_INVENTORY_DATA.find(i => i.id === ing.inventoryId);
        return invItem && invItem.stock > 0;
    });
};

const TRACKING_STEPS = [
    { status: 'incoming', label: 'Order Received', desc: 'Awaiting kitchen queue confirmation' },
    { status: 'preparing', label: 'In the Kitchen', desc: 'Viking chef has started preparing your order' },
    { status: 'ready', label: 'Ready for Pickup', desc: 'Freshly prepared and hot at the counter' },
    { status: 'delivered', label: 'Delighted & Fuelled', desc: 'Delivered and enjoyed!' }
];

const getStatusIndex = (status: string) => {
    switch (status) {
        case 'incoming': return 0;
        case 'preparing': return 1;
        case 'ready': return 2;
        case 'delivered': return 3;
        default: return 0;
    }
};

const FITNESS_GOALS = [
    { id: 'Muscle Gain', label: 'Muscle Gain', sub: 'High Protein', icon: Dumbbell, color: 'text-purple-400', border: 'border-purple-500/20 hover:border-purple-500/40', bg: 'bg-purple-500/5' },
    { id: 'Fat Loss', label: 'Fat Loss', sub: 'Low Cal & Fat', icon: Heart, color: 'text-emerald-400', border: 'border-emerald-500/20 hover:border-emerald-500/40', bg: 'bg-emerald-500/5' },
    { id: 'Endurance', label: 'Endurance', sub: 'High Carbs & Energy', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/20 hover:border-amber-500/40', bg: 'bg-amber-500/5' },
    { id: 'Recovery', label: 'Recovery', sub: 'Balanced Refuel', icon: Activity, color: 'text-cyan-400', border: 'border-cyan-500/20 hover:border-cyan-500/40', bg: 'bg-cyan-500/5' }
];

const isRecommendedForGoal = (item: MenuItem, goal: string) => {
    const calories = item.nutrition?.calories || 0;
    const proteinVal = parseInt(item.nutrition?.protein || '0');
    const carbsVal = parseInt(item.nutrition?.carbs || '0');
    const fatVal = parseInt(item.nutrition?.fat || '0');
    
    switch (goal) {
        case 'Muscle Gain':
            return proteinVal >= 25 || item.tags.some(t => t.toLowerCase().includes('protein') || t.toLowerCase().includes('gainer'));
        case 'Fat Loss':
            return (calories > 0 && calories <= 350 && fatVal <= 8) || item.tags.some(t => t.toLowerCase().includes('keto') || t.toLowerCase().includes('low carb') || t.toLowerCase().includes('detox') || t.toLowerCase().includes('vegan'));
        case 'Endurance':
            return carbsVal >= 40 || item.tags.some(t => t.toLowerCase().includes('energy') || t.toLowerCase().includes('carb') || t.toLowerCase().includes('caffeine'));
        case 'Recovery':
            return (proteinVal >= 15 && carbsVal >= 15) || item.tags.some(t => t.toLowerCase().includes('recovery') || t.toLowerCase().includes('healthy fats') || t.toLowerCase().includes('heart healthy'));
        default:
            return false;
    }
};

const MenuItemImage = ({ src, alt }: { src: string; alt: string }) => {
    const [imgSrc, setImgSrc] = useState(src);
    return (
        <div className="relative w-full h-40 overflow-hidden bg-slate-900 flex items-center justify-center">
            <img 
                src={imgSrc} 
                alt={alt}
                onError={() => setImgSrc('/images/placeholder.svg')}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        </div>
    );
};

const MenuItemCard = ({ 
    item, 
    isAvailable, 
    cartCount, 
    onAdd, 
    onRemove 
}: { 
    item: MenuItem; 
    isAvailable: boolean; 
    cartCount: number; 
    onAdd: () => void; 
    onRemove: () => void; 
}) => {
    const style = getCategoryStyle(item.category);
    const nutrition = getNutrition(item);
    const CategoryIcon = style.icon;

    return (
        <motion.div 
            whileHover={isAvailable ? { y: -5 } : {}}
            className={`glass-card rounded-3xl border relative overflow-hidden group transition-all duration-300 flex flex-col justify-between ${
                isAvailable 
                ? 'border-white/5 hover:border-indigo-500/30 bg-slate-900/40' 
                : 'border-white/5 bg-slate-950/45 opacity-65'
            }`}
        >
            <div className="relative">
                <MenuItemImage src={item.image} alt={item.name} />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md">
                    <CategoryIcon className={`w-3.5 h-3.5 ${style.color}`} />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">
                        {item.category}
                    </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md text-[9px] font-bold text-slate-300">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{item.prepTime}</span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map(tag => (
                            <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-[8px] px-1.5 py-0.2 font-black tracking-wider uppercase bg-white/5 border border-white/5 hover:bg-white/10 text-slate-350"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h3 className="text-lg font-black text-white mb-1 uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                        {item.name}
                    </h3>
                    
                    <p className="text-slate-400 text-xs leading-relaxed min-h-[36px] line-clamp-2 mb-4 font-medium">
                        {item.description}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-1.5 bg-black/45 rounded-2xl p-2.5 border border-white/5 mb-4 text-center">
                        <div className="border-r border-white/5 last:border-0 pr-1">
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Cals</span>
                            <span className="text-xs font-black text-white leading-none">{nutrition.calories}</span>
                        </div>
                        <div className="border-r border-white/5 last:border-0 px-1">
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Prot</span>
                            <span className="text-xs font-black text-indigo-400 leading-none">{nutrition.protein}</span>
                        </div>
                        <div className="border-r border-white/5 last:border-0 px-1">
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Carb</span>
                            <span className="text-xs font-black text-amber-400 leading-none">{nutrition.carbs}</span>
                        </div>
                        <div className="px-1">
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Fat</span>
                            <span className="text-xs font-black text-rose-400 leading-none">{nutrition.fat}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-xl font-black text-white italic">₹{item.price.toLocaleString()}</span>
                    
                    {isAvailable ? (
                        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-0.5 border border-white/10">
                            <button 
                                onClick={onRemove}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black w-4 text-center">{cartCount}</span>
                            <button 
                                onClick={onAdd}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-indigo-400"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <Badge className="bg-rose-500/20 text-rose-450 border border-rose-500/10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Unavailable
                        </Badge>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SpecialsSection = ({ 
    items, 
    cart, 
    updateCart, 
    menuItems 
}: { 
    items: MenuItem[]; 
    cart: Record<string, number>; 
    updateCart: (id: string, delta: number) => void; 
    menuItems: MenuItem[] 
}) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Today's Specials</h2>
                <Badge className="bg-amber-400/20 text-amber-400 border border-amber-400/10 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black animate-pulse">
                    Daily Deals
                </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.slice(0, 3).map(item => {
                    const isStocked = checkAvailability(item);
                    const isAvailable = item.isAvailable && isStocked;
                    const nutrition = getNutrition(item);

                    return (
                        <motion.div
                            key={`special-${item.id}`}
                            whileHover={isAvailable ? { scale: 1.02 } : {}}
                            className={`glass-card rounded-[2rem] border relative overflow-hidden group transition-all duration-300 flex flex-col justify-between p-1 bg-gradient-to-b from-indigo-500/10 via-slate-900/50 to-slate-900/50 ${
                                isAvailable 
                                ? 'border-indigo-500/20 hover:border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
                                : 'border-white/5 opacity-60'
                            }`}
                        >
                            <div className="relative rounded-[1.75rem] overflow-hidden">
                                <MenuItemImage src={item.image} alt={item.name} />
                                
                                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-black border border-amber-600/20 backdrop-blur-md text-[8px] font-black uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3 fill-black" />
                                    <span>Chef Special</span>
                                </div>

                                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md text-[9px] font-bold text-slate-350">
                                    <Clock className="w-3 h-3 text-indigo-400" />
                                    <span>{item.prepTime}</span>
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    
                                    <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-black/35 px-3 py-1.5 rounded-xl border border-white/5">
                                        <span>🔥 {nutrition.calories} Cal</span>
                                        <span>💪 {nutrition.protein} Prot</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-500 line-through leading-none">₹{Math.round(item.price * 1.15).toLocaleString()}</span>
                                        <span className="text-xl font-black text-emerald-450 italic leading-none">₹{item.price.toLocaleString()}</span>
                                    </div>
                                    
                                    {isAvailable ? (
                                        <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-0.5 border border-white/10">
                                            <button 
                                                onClick={() => updateCart(item.id, -1)}
                                                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-black w-4 text-center">{cart[item.id] || 0}</span>
                                            <button 
                                                onClick={() => updateCart(item.id, 1)}
                                                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-emerald-400"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Badge className="bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                                            Out of Stock
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

const FitnessGoalSelector = ({ 
    activeGoal, 
    setActiveGoal 
}: { 
    activeGoal: string | null; 
    setActiveGoal: (goal: string | null) => void 
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Target Fuel</h2>
                </div>
                {activeGoal && (
                    <button 
                        onClick={() => setActiveGoal(null)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
            
            <p className="text-slate-400 text-xs font-semibold uppercase leading-relaxed max-w-xl">
                Align your fuel with your focus. Choose a goal to display custom recommended menu items.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FITNESS_GOALS.map(goal => {
                    const GoalIcon = goal.icon;
                    const isSelected = activeGoal === goal.id;

                    return (
                        <button
                            key={goal.id}
                            onClick={() => setActiveGoal(isSelected ? null : goal.id)}
                            className={`p-4 rounded-3xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all duration-300 ${
                                isSelected
                                ? `bg-indigo-600/10 border-indigo-500 text-white shadow-glow-sm scale-[1.02]`
                                : `bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10`
                            }`}
                        >
                            <div className={`p-2.5 rounded-2xl w-fit ${isSelected ? 'bg-indigo-600/20 text-white' : `${goal.bg} ${goal.color}`}`}>
                                <GoalIcon className="w-5 h-5" />
                            </div>
                            
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight text-white">{goal.label}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none mt-0.5">{goal.sub}</p>
                            </div>

                            {isSelected && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const GoalRecommendations = ({
    goal,
    items,
    cart,
    updateCart
}: {
    goal: string;
    items: MenuItem[];
    cart: Record<string, number>;
    updateCart: (id: string, delta: number) => void;
}) => {
    if (items.length === 0) {
        return (
            <div className="glass-card p-6 rounded-3xl border border-white/5 text-center">
                <Info className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No matching items found for this goal yet.</p>
            </div>
        );
    }

    const goalLabel = FITNESS_GOALS.find(g => g.id === goal)?.label || goal;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[2.5rem] bg-indigo-950/20 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.02)] space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                    <span className="text-sm font-black uppercase tracking-widest text-indigo-400 animate-pulse">
                        Goal Focus: {goalLabel}
                    </span>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] uppercase tracking-wider font-black">
                    Recommended For You
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.slice(0, 3).map(item => {
                    const isStocked = checkAvailability(item);
                    const isAvailable = item.isAvailable && isStocked;
                    const nutrition = getNutrition(item);

                    return (
                        <div key={`reco-${item.id}`} className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-indigo-500/20 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0">
                                    <MenuItemImage src={item.image} alt={item.name} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-black uppercase text-white truncate">{item.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">🔥 {nutrition.calories} Cal • {nutrition.protein} Prot</p>
                                </div>
                            </div>

                            {isAvailable ? (
                                <button
                                    onClick={() => updateCart(item.id, 1)}
                                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white rounded-xl transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            ) : (
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-455 shrink-0">Out</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const RefuelHistoryTab = ({ 
    orders, 
    onReorder 
}: { 
    orders: Order[]; 
    onReorder: (order: Order) => void 
}) => {
    const memberOrders = orders.filter(o => o.member === 'Alex Thompson');

    if (memberOrders.length === 0) {
        return (
            <div className="glass-card p-12 rounded-[2rem] border border-white/5 text-center space-y-4">
                <History className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-wide">No Refuel History</h3>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Your fuel intake records will be logged here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Refuel History</h2>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Logs of your previous protein payloads and pre-workout boosts</p>
            </div>

            <div className="space-y-4">
                {memberOrders.map(order => {
                    const statusColors: Record<string, string> = {
                        incoming: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                        preparing: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
                        ready: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
                        delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                    };

                    return (
                        <div key={order.id} className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-mono font-bold text-slate-400">{order.id}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{order.time}</span>
                                    <Badge className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black ${statusColors[order.status] || 'bg-slate-500/10 text-slate-400'}`}>
                                        {order.status}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {order.items.map((item, idx) => (
                                        <Badge key={idx} variant="outline" className="text-[10px] bg-white/5 border-white/5 text-slate-350 px-2.5 py-0.5 font-semibold uppercase">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 shrink-0 border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Paid Amount</p>
                                    <p className="text-xl font-black text-white italic leading-none">{order.total}</p>
                                </div>

                                <Button
                                    onClick={() => onReorder(order)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white hover:text-white font-black uppercase text-[10px] tracking-widest px-6 h-11 rounded-2xl active:scale-95 transition-all shadow-md shadow-indigo-500/10"
                                >
                                    Reorder
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CAFE_CATEGORIES = ['All', 'Protein Shakes', 'Smoothies', 'Healthy Meals', 'Pre-Workout Drinks', 'Post-Workout Meals', 'Snacks'];

export default function MemberCafePage() {
    const { addOrder, orders } = useOrders();
    const { addNotification } = useNotifications();
    const [cart, setCart] = useState<Record<string, number>>({});
    const [isOrdering, setIsOrdering] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    
    // Member Dashboard Active Tabs
    const [viewTab, setViewTab] = useState<'menu' | 'history'>('menu');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeGoal, setActiveGoal] = useState<string | null>(null);

    // Workflow States
    const [checkoutStep, setCheckoutStep] = useState<'menu' | 'payment' | 'processing' | 'success' | 'tracker'>('menu');
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'upi'>('wallet');
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(2500);
    const [receiptSummary, setReceiptSummary] = useState<{
        id: string;
        date: string;
        method: string;
        items: Array<{ name: string; price: number; count: number }>;
        total: number;
    } | null>(null);

    // Card Input States
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    // Review & Rating States
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    useEffect(() => {
        const loadMenu = () => {
            const saved = localStorage.getItem('zenith_cafe_menu');
            if (saved) {
                try {
                    setMenuItems(JSON.parse(saved));
                } catch (e) {
                    setMenuItems(CAFE_MENU_ITEMS);
                }
            } else {
                setMenuItems(CAFE_MENU_ITEMS);
                localStorage.setItem('zenith_cafe_menu', JSON.stringify(CAFE_MENU_ITEMS));
            }
        };

        loadMenu();

        window.addEventListener('storage', loadMenu);
        return () => {
            window.removeEventListener('storage', loadMenu);
        };
    }, []);

    // Load active order tracker & Wallet balance from storage on mount
    useEffect(() => {
        const savedOrderId = localStorage.getItem('zenith_active_cafe_order_id');
        if (savedOrderId) {
            setActiveOrderId(savedOrderId);
            setCheckoutStep('tracker');
        }

        const savedBalance = localStorage.getItem('zenith_wallet_balance');
        if (savedBalance) {
            setWalletBalance(parseInt(savedBalance));
        } else {
            localStorage.setItem('zenith_wallet_balance', '2500');
        }

        const savedReceipt = localStorage.getItem('zenith_active_cafe_receipt_summary');
        if (savedReceipt) {
            try {
                setReceiptSummary(JSON.parse(savedReceipt));
            } catch (e) {}
        }
    }, []);

    const activeOrder = orders.find(o => o.id === activeOrderId);

    // Compute Specials
    const specials = menuItems.filter(item => 
        item.tags.some(tag => 
            tag.toLowerCase().includes("special") || 
            tag.toLowerCase().includes("recommended")
        )
    );

    // Compute Recommendations
    const recommendedItems = menuItems.filter(item => 
        activeGoal ? isRecommendedForGoal(item, activeGoal) : false
    );

    const updateCart = (id: string, delta: number) => {
        const item = menuItems.find(i => i.id === id);
        if (!item) return;
        
        const isStocked = checkAvailability(item);
        const isAvailable = item.isAvailable && isStocked;

        // If trying to add but not available, prevent it
        if (delta > 0 && !isAvailable) {
            toast.error("Unavailable", {
                description: `${item.name} is currently unavailable.`,
            });
            return;
        }

        setCart(prev => {
            const count = (prev[id] || 0) + delta;
            if (count <= 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: count };
        });
    };

    const total = Object.entries(cart).reduce((acc, [id, count]) => {
        const item = menuItems.find(i => i.id === id);
        if (!item || !item.isAvailable || !checkAvailability(item)) return acc;
        return acc + (item.price || 0) * count;
    }, 0);

    const handlePlaceOrderClick = () => {
        if (Object.keys(cart).length === 0) return;
        setCheckoutStep('payment');
    };

    const handleBackToMenu = () => {
        setCheckoutStep('menu');
    };

    const processPayment = () => {
        if (paymentMethod === 'wallet' && walletBalance < total) {
            toast.error("Insufficient Wallet Balance", {
                description: "Top up your gym wallet or choose a different payment method.",
            });
            return;
        }

        if (paymentMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
            toast.error("Incomplete Card Details", {
                description: "Please fill out all card payment fields.",
            });
            return;
        }

        setCheckoutStep('processing');

        // Simulate secure banking API delay
        setTimeout(() => {
            if (paymentMethod === 'wallet') {
                const newBalance = walletBalance - total;
                setWalletBalance(newBalance);
                localStorage.setItem('zenith_wallet_balance', newBalance.toString());
            }

            const items = Object.entries(cart)
                .map(([id, count]) => {
                    const item = menuItems.find(i => i.id === id);
                    if (!item || !item.isAvailable || !checkAvailability(item)) return null;
                    return `${count}x ${item.name}`;
                })
                .filter(Boolean) as string[];

            const generatedId = addOrder({
                member: 'Alex Thompson', // Mocked active member
                items,
                total: `₹${total.toLocaleString()}`,
                status: 'incoming',
                time: 'Just now',
                priority: total > 1500 ? 'high' : 'normal'
            });

            const summaryItems = Object.entries(cart)
                .map(([id, count]) => {
                    const item = menuItems.find(i => i.id === id);
                    return {
                        name: item?.name || 'Unknown Item',
                        price: item?.price || 0,
                        count
                    };
                });

            const receiptData = {
                id: generatedId,
                date: new Date().toLocaleString(),
                method: paymentMethod === 'wallet' ? 'Viking Gym Wallet' : paymentMethod === 'card' ? 'Credit Card' : 'UPI Instant Pay',
                items: summaryItems,
                total
            };

            setReceiptSummary(receiptData);
            localStorage.setItem('zenith_active_cafe_receipt_summary', JSON.stringify(receiptData));

            // Dispatch notification to Cafe Workers
            addNotification({
                type: 'CAFE',
                role: 'cafe_staff',
                title: 'New Order Received! ☕',
                message: `Order ${generatedId} placed by Alex Thompson for ₹${total.toLocaleString()}.`,
                actionLabel: 'View Order Hub',
                actionUrl: '/cafe/orders',
                priority: total > 1500 ? 'high' : 'medium'
            });

            setActiveOrderId(generatedId);
            localStorage.setItem('zenith_active_cafe_order_id', generatedId);
            setCart({});
            setCheckoutStep('success');
            toast.success("Payment Approved!", {
                description: `Order ${generatedId} has been successfully sent to the kitchen.`,
            });
        }, 2200);
    };

    const handleTrackOrderClick = () => {
        setCheckoutStep('tracker');
    };

    const handleDownloadReceipt = () => {
        const summary = receiptSummary;
        if (!summary) {
            toast.error("No active invoice summary found.");
            return;
        }

        const cgst = summary.total * 0.09;
        const sgst = summary.total * 0.09;
        const netTotal = summary.total + cgst + sgst;

        const receiptContent = `
==================================================
              ZENITH FITNESS CAFE
               PAYMENT INVOICE
==================================================
Date: ${summary.date}
Order Reference: ${summary.id}
Customer: Alex Thompson (NEX-2045)
Payment Method: ${summary.method}
Status: PAID / APPROVED

--------------------------------------------------
ITEMS ORDERED
--------------------------------------------------
${summary.items
  .map(item => {
      const line = `${item.name} x${item.count}`;
      const costStr = `₹${(item.price * item.count).toLocaleString()}`;
      const padLength = 38 - line.length;
      return `${line}${' '.repeat(padLength > 0 ? padLength : 2)}${costStr}`;
  })
  .join('\n')}

--------------------------------------------------
Subtotal:                              ₹${summary.total.toLocaleString()}
CGST (9.0%):                           ₹${cgst.toFixed(2)}
SGST (9.0%):                           ₹${sgst.toFixed(2)}
--------------------------------------------------
TOTAL CHARGED (INCL. GST):             ₹${netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
==================================================
    Thank you for fueling your fitness journey!
==================================================
`;

        const blob = new Blob([receiptContent.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${summary.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded!");
    };

    // Review Handlers
    const handleSubmitReview = () => {
        if (rating === 0) return;
        
        const review = {
            orderId: activeOrderId,
            rating,
            comments: reviewText,
            timestamp: Date.now()
        };

        const existing = localStorage.getItem('zenith_cafe_reviews');
        let reviewsList = [];
        if (existing) {
            try {
                reviewsList = JSON.parse(existing);
            } catch (e) {}
        }
        reviewsList.push(review);
        localStorage.setItem('zenith_cafe_reviews', JSON.stringify(reviewsList));

        // Cleanup tracker states
        localStorage.removeItem('zenith_active_cafe_order_id');
        localStorage.removeItem('zenith_active_cafe_receipt_summary');
        setReceiptSummary(null);
        setActiveOrderId(null);
        setRating(0);
        setReviewText('');
        setCheckoutStep('menu');

        toast.success("Thank You!", {
            description: "Your rating feedback helps our kitchen stay premium.",
        });
    };

    const handleSkipReview = () => {
        localStorage.removeItem('zenith_active_cafe_order_id');
        localStorage.removeItem('zenith_active_cafe_receipt_summary');
        setReceiptSummary(null);
        setActiveOrderId(null);
        setRating(0);
        setReviewText('');
        setCheckoutStep('menu');
    };

    const handleReorder = (order: Order) => {
        const newCart: Record<string, number> = {};
        let missingOrUnavailable = false;

        order.items.forEach(orderItemStr => {
            const match = orderItemStr.match(/^(\d+)x\s+(.+)$/);
            if (match) {
                const count = parseInt(match[1]);
                const name = match[2];
                const item = menuItems.find(i => i.name.toLowerCase() === name.toLowerCase());
                if (item && item.isAvailable && checkAvailability(item)) {
                    newCart[item.id] = count;
                } else {
                    missingOrUnavailable = true;
                }
            } else {
                const item = menuItems.find(i => i.name.toLowerCase() === orderItemStr.toLowerCase());
                if (item && item.isAvailable && checkAvailability(item)) {
                    newCart[item.id] = (newCart[item.id] || 0) + 1;
                } else {
                    missingOrUnavailable = true;
                }
            }
        });

        if (Object.keys(newCart).length === 0) {
            toast.error("Reorder Failed", {
                description: "All items in this order are currently out of stock or unavailable."
            });
            return;
        }

        if (missingOrUnavailable) {
            toast.warning("Some items unavailable", {
                description: "Some items from your original order are out of stock and were not added."
            });
        }

        setCart(newCart);
        setCheckoutStep('payment');
        toast.success("Order Cart Loaded", {
            description: "Redirecting to payment..."
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans pb-32">
            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
                
                {/* Back to Dashboard */}
                {checkoutStep === 'menu' && (
                    <div className="flex items-center justify-between">
                        <Link href="/member" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Kitchen Open</span>
                        </div>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {/* STEP 1: Main Cafe Menu Grid */}
                    {checkoutStep === 'menu' && (
                        <motion.div
                            key="menu-grid"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-8"
                        >
                            {/* Layout Toggle Tabs */}
                            <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl max-w-sm">
                                <button
                                    onClick={() => setViewTab('menu')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        viewTab === 'menu'
                                        ? 'bg-indigo-650 text-white shadow-glow-sm border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Coffee className="w-4 h-4" />
                                    Smoothie Bar
                                </button>
                                <button
                                    onClick={() => setViewTab('history')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        viewTab === 'history'
                                        ? 'bg-indigo-650 text-white shadow-glow-sm border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <History className="w-4 h-4" />
                                    Refuel History
                                </button>
                            </div>

                            {viewTab === 'menu' ? (
                                <>
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter bg-gradient-to-r from-emerald-450 to-cyan-550 bg-clip-text text-transparent uppercase">
                                            Viking <span className="not-italic text-white">Fuel Cafe</span>
                                        </h1>
                                        <p className="text-slate-400 font-medium">Refuel your journey with premium protein and nordic nutrition.</p>
                                    </div>

                                    {/* Today's Specials */}
                                    <SpecialsSection 
                                        items={specials} 
                                        cart={cart} 
                                        updateCart={updateCart} 
                                        menuItems={menuItems} 
                                    />

                                    {/* Goal Selector */}
                                    <FitnessGoalSelector 
                                        activeGoal={activeGoal} 
                                        setActiveGoal={setActiveGoal} 
                                    />

                                    {/* Goal Recommendations (if goal is selected) */}
                                    {activeGoal && (
                                        <GoalRecommendations 
                                            goal={activeGoal} 
                                            items={recommendedItems} 
                                            cart={cart} 
                                            updateCart={(id, delta) => updateCart(id, delta)} 
                                        />
                                    )}

                                    {/* Browse Menu Header */}
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Browse Menu</h2>
                                        
                                        {/* Categories tabs */}
                                        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                                            {CAFE_CATEGORIES.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setActiveCategory(cat)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                                                        activeCategory === cat
                                                        ? 'bg-indigo-650 border-indigo-500 text-white shadow-glow-sm'
                                                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Grid Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {menuItems
                                            .filter(item => activeCategory === 'All' || item.category === activeCategory)
                                            .map((item) => {
                                                const isStocked = checkAvailability(item);
                                                const isAvailable = item.isAvailable && isStocked;

                                                return (
                                                    <MenuItemCard
                                                        key={item.id}
                                                        item={item}
                                                        isAvailable={isAvailable}
                                                        cartCount={cart[item.id] || 0}
                                                        onAdd={() => updateCart(item.id, 1)}
                                                        onRemove={() => updateCart(item.id, -1)}
                                                    />
                                                );
                                            })}
                                    </div>
                                </>
                            ) : (
                                <RefuelHistoryTab 
                                    orders={orders} 
                                    onReorder={handleReorder} 
                                />
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: Checkout & Payment Section */}
                    {checkoutStep === 'payment' && (
                        <motion.div
                            key="checkout-payment"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-8 max-w-2xl mx-auto"
                        >
                            <div className="flex items-center justify-between">
                                <button onClick={handleBackToMenu} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Modify Cart</span>
                                </button>
                                <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl">
                                    Step 2 of 3
                                </Badge>
                            </div>

                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Choose Payment</h2>
                                <p className="text-slate-400 text-xs font-semibold uppercase mt-1">Select a refueling method for your protein payload</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Wallet Selector */}
                                <button
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-40 ${
                                        paymentMethod === 'wallet' 
                                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-glow-sm' 
                                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10'
                                    }`}
                                >
                                    <Wallet className={`w-8 h-8 ${paymentMethod === 'wallet' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Gym Wallet</p>
                                        <p className="text-lg font-black italic tracking-tight text-white leading-none">₹{walletBalance.toLocaleString()}</p>
                                    </div>
                                </button>

                                {/* Credit Card Selector */}
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-40 ${
                                        paymentMethod === 'card' 
                                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-glow-sm' 
                                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10'
                                    }`}
                                >
                                    <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Card Payment</p>
                                        <p className="text-sm font-black italic tracking-tight text-white leading-none">Visa / Mastercard</p>
                                    </div>
                                </button>

                                {/* UPI Selector */}
                                <button
                                    onClick={() => setPaymentMethod('upi')}
                                    className={`p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-40 ${
                                        paymentMethod === 'upi' 
                                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-glow-sm' 
                                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10'
                                    }`}
                                >
                                    <QrCode className={`w-8 h-8 ${paymentMethod === 'upi' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">UPI Pay</p>
                                        <p className="text-sm font-black italic tracking-tight text-white leading-none">GPay, PhonePe, Paytm</p>
                                    </div>
                                </button>
                            </div>

                            {/* Payment Method Details */}
                            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl space-y-6">
                                {paymentMethod === 'wallet' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                            <Wallet className="w-6 h-6 text-indigo-400" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available Credits</p>
                                                <p className="text-lg font-black text-white">₹{walletBalance.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {walletBalance < total && (
                                            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>Insufficient funds. Refuel your wallet or use a different gateway.</span>
                                            </div>
                                        )}
                                        <p className="text-slate-400 text-xs leading-relaxed font-medium">Refueling balance is linked to your membership profile. Deductions occur instantly upon authorization.</p>
                                    </div>
                                )}

                                {paymentMethod === 'card' && (
                                    <div className="space-y-6">
                                        {/* Dynamic Credit Card Render */}
                                        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-950 p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                                            <div className="flex justify-between items-start">
                                                <CreditCard className="w-10 h-10 text-white/90" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 bg-white/10 px-2.5 py-1 rounded-lg">REFUEL CARD</span>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-lg font-mono text-white tracking-widest font-bold">
                                                    {cardNumber || '•••• •••• •••• ••••'}
                                                </p>
                                                <div className="flex justify-between items-end text-white">
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/45 uppercase tracking-widest">Card Holder</p>
                                                        <p className="text-xs uppercase font-bold tracking-wider truncate max-w-[150px]">{cardName || 'ALEX THOMPSON'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-white/45 uppercase tracking-widest">Expires</p>
                                                        <p className="text-xs font-bold tracking-wider">{cardExpiry || 'MM/YY'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Input Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Card Number</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="4111 2222 3333 4444"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19))}
                                                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl h-12 pl-4 text-xs font-bold text-white transition-all focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Cardholder Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Alex Thompson"
                                                    value={cardName}
                                                    onChange={(e) => setCardName(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl h-12 pl-4 text-xs font-bold text-white transition-all focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Expiry Date</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="MM/YY"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                                                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl h-12 pl-4 text-xs font-bold text-white transition-all focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CVV / CVC</label>
                                                <input 
                                                    type="password" 
                                                    placeholder="•••"
                                                    value={cardCvv}
                                                    onChange={(e) => setCardCvv(e.target.value.slice(0, 3))}
                                                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl h-12 pl-4 text-xs font-bold text-white transition-all focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'upi' && (
                                    <div className="flex flex-col items-center py-6 space-y-6">
                                        <div className="relative p-4 bg-white rounded-3xl border-4 border-indigo-500 shadow-glow-sm flex items-center justify-center">
                                            {/* Simulated Scan line animation */}
                                            <div className="absolute left-0 right-0 h-1 bg-emerald-500 animate-bounce top-4 bottom-4" />
                                            <img 
                                                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=zenith-fitness-cafe-pos" 
                                                alt="UPI QR Code" 
                                                className="w-40 h-40 object-contain rounded-xl"
                                            />
                                        </div>
                                        <div className="text-center space-y-1.5">
                                            <p className="text-xs font-black uppercase tracking-widest text-white">Scan to Pay via UPI</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Waiting for secure webhook confirmation...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bill Summary Footer */}
                                <div className="border-t border-white/5 pt-6 space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-black uppercase tracking-widest">Payable Amount</span>
                                        <span className="text-xl font-black text-white italic">₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleBackToMenu}
                                            variant="outline"
                                            className="flex-1 border-white/10 !text-white hover:!bg-white/5 hover:!text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={processPayment}
                                            disabled={paymentMethod === 'wallet' && walletBalance < total}
                                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm Refuel (₹{total.toLocaleString()})
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Processing Payment Screen */}
                    {checkoutStep === 'processing' && (
                        <motion.div
                            key="checkout-processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse scale-150" />
                                <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin flex items-center justify-center shadow-2xl relative" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Securing Gateway</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Contacting financial API servers...</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Success Checkout Screen */}
                    {checkoutStep === 'success' && (
                        <motion.div
                            key="checkout-success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-16 text-center space-y-8 max-w-md mx-auto bg-slate-900/40 border border-emerald-500/20 p-8 rounded-[2.5rem] backdrop-blur-3xl"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Payment Approved!</h3>
                                <p className="text-slate-450 text-xs font-bold uppercase tracking-widest">Order sent to the Smoothie kitchen</p>
                            </div>

                            <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-left space-y-3">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-500 uppercase tracking-wider">Order ID</span>
                                    <span className="text-white font-mono">{activeOrderId}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-500 uppercase tracking-wider">Method</span>
                                    <span className="text-white uppercase">{paymentMethod === 'wallet' ? 'Viking Wallet' : paymentMethod === 'card' ? 'Credit Card' : 'UPI Instant'}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold border-t border-white/5 pt-3">
                                    <span className="text-slate-500 uppercase tracking-wider">Total Debited</span>
                                    <span className="text-emerald-400 font-black italic">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <Button 
                                    onClick={handleTrackOrderClick}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-black uppercase text-xs tracking-widest py-6 rounded-2xl shadow-glow active:scale-95 transition-all"
                                >
                                    Track Order Status
                                </Button>
                                <Button 
                                                    variant="outline"
                                                    onClick={handleDownloadReceipt}
                                                    className="w-full border-white/10 !text-white hover:!bg-white/5 hover:!text-white font-black uppercase text-[10px] tracking-widest py-6 rounded-2xl gap-2"
                                                >
                                                    <Download className="w-4 h-4 text-indigo-400" /> Download Invoice
                                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: Live Order Status Tracker */}
                    {checkoutStep === 'tracker' && activeOrder && (
                        <motion.div
                            key="order-tracker"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                    Refuel <span className="text-indigo-400">Tracker</span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    {receiptSummary && (
                                        <button 
                                            onClick={handleDownloadReceipt}
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/10"
                                        >
                                            <Download className="w-3.5 h-3.5 text-indigo-400" /> Invoice
                                        </button>
                                    )}
                                    <span className="text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                        ID: {activeOrder.id}
                                    </span>
                                </div>
                            </div>

                            {activeOrder.status !== 'delivered' ? (
                                <div className="glass-card border-white/5 p-8 rounded-3xl space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

                                    {/* Order Payload Summary */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order Payload</p>
                                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                                            {activeOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs font-bold text-white">
                                                    <span className="uppercase tracking-tight">{item}</span>
                                                    <span className="text-slate-500">1x</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-white/5 pt-3 mt-1 flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-black uppercase tracking-widest">Refuel Price</span>
                                                <span className="text-indigo-400 font-black italic">{activeOrder.total}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Progression Timeline */}
                                    <div className="space-y-6 relative">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progression State</p>
                                        <div className="relative pl-6 space-y-8 text-sm">
                                            {TRACKING_STEPS.map((step, idx) => {
                                                const currentIdx = getStatusIndex(activeOrder.status);
                                                const isCompleted = idx < currentIdx;
                                                const isActive = idx === currentIdx;
                                                const isLast = idx === TRACKING_STEPS.length - 1;

                                                return (
                                                    <div key={step.status} className="relative pb-2 last:pb-0">
                                                        {/* Stepper Connector line */}
                                                        {!isLast && (
                                                            <div 
                                                                className={`absolute left-[-15px] top-[24px] bottom-[-24px] w-[2px] -z-10 transition-colors duration-500 ${
                                                                    isCompleted ? 'bg-indigo-500' : 'bg-slate-800'
                                                                }`} 
                                                            />
                                                        )}

                                                        {/* Stepper Node */}
                                                        <div className="absolute left-[-23px] top-[3px]">
                                                            <div 
                                                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${
                                                                    isCompleted 
                                                                        ? 'bg-indigo-500 border-indigo-500 shadow-glow-sm'
                                                                        : isActive
                                                                        ? 'bg-slate-950 border-indigo-400 animate-pulse scale-125 shadow-glow'
                                                                        : 'bg-slate-900 border-slate-800'
                                                                }`}
                                                            >
                                                                {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-black" />}
                                                            </div>
                                                        </div>

                                                        {/* Stepper Content */}
                                                        <div className={`space-y-0.5 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-white font-black' : 'text-slate-400'}`}>
                                                                    {step.label}
                                                                </h4>
                                                                {isActive && (
                                                                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] uppercase tracking-widest px-1.5 py-0 rounded">
                                                                        Live
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* POST-DELIVERY: Rating & Review Panel */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card p-8 rounded-3xl border border-emerald-500/20 text-center space-y-6 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-emerald-500/[0.02] blur-xl pointer-events-none" />
                                    
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                        <Sparkles className="w-8 h-8 text-emerald-400" />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Fuel Delivered!</h3>
                                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Help us maintain peak performance</p>
                                    </div>

                                    {/* 5-Star Interactive Rating */}
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                                className="transition-transform active:scale-90"
                                            >
                                                <Star 
                                                    className={`w-10 h-10 ${
                                                        star <= (hoveredRating || rating) 
                                                        ? 'fill-amber-400 text-amber-400 drop-shadow-glow scale-110' 
                                                        : 'text-slate-650'
                                                    } transition-all duration-200`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Comments Textarea */}
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comments</label>
                                        <textarea
                                            placeholder="Rate taste, consistency, or presentation..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl p-4 text-xs font-semibold placeholder:text-slate-700 transition-all text-white h-24 resize-none focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <Button
                                            onClick={handleSkipReview}
                                            variant="outline"
                                            className="flex-1 border-white/10 !text-white hover:!bg-white/5 hover:!text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                                        >
                                            Skip Feedback
                                        </Button>
                                        <Button
                                            onClick={handleSubmitReview}
                                            disabled={rating === 0}
                                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Submit Review
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Floating Bar */}
            {checkoutStep === 'menu' && total > 0 && (
                <AnimatePresence>
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50"
                    >
                        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] shadow-glow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4 pl-4">
                                <div className="p-3 bg-emerald-500 rounded-2xl text-black">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Order</p>
                                    <p className="text-2xl font-black text-white italic">₹{total.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={handlePlaceOrderClick}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-10 h-14 rounded-[2rem] text-base shadow-glow uppercase italic tracking-tighter"
                            >
                                Order Now
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
