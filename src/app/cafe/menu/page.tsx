'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Utensils, 
    Search, 
    Plus, 
    Filter, 
    Coffee, 
    Zap, 
    Star, 
    Clock, 
    ChevronRight, 
    Edit3, 
    CheckCircle2, 
    AlertCircle,
    Settings,
    MoreHorizontal,
    ArrowUpRight,
    Flame,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CAFE_MENU_ITEMS, MenuItem, CafeCategory } from '@/lib/cafe-menu-data';
import { CAFE_INVENTORY_DATA } from '@/lib/cafe-inventory-data';
import Image from 'next/image';

const CATEGORIES = ['All', 'Protein Shakes', 'Smoothies', 'Healthy Meals', 'Pre-Workout Drinks', 'Post-Workout Meals', 'Snacks', 'Archived'];

function MenuCardImage({ src, alt, category, className }: { src: string; alt: string; category: string; className?: string }) {
    const [hasError, setHasError] = useState(false);
    
    if (hasError || !src) {
        const gradients: Record<string, string> = {
            Beverages: 'from-blue-600 to-indigo-900',
            Food: 'from-emerald-600 to-teal-900',
            Snacks: 'from-amber-500 to-orange-850',
            Supplements: 'from-purple-600 to-pink-900',
            default: 'from-slate-700 to-slate-900'
        };
        const gradient = gradients[category] || gradients.default;
        return (
            <div className="absolute inset-0 bg-gradient-to-br bg-slate-950 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`} />
                <div className="text-white/20 text-3xl font-black italic tracking-tighter uppercase opacity-35 relative z-10">
                    {category}
                </div>
            </div>
        );
    }
    
    return (
        <Image 
            src={src} 
            alt={alt}
            fill
            onError={() => setHasError(true)}
            className={className || "object-cover group-hover:scale-110 transition-transform duration-700"}
        />
    );
}

export default function CafeMenuPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // Bulk Edit states
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
    const [bulkActionField, setBulkActionField] = useState<'price' | 'category' | 'isAvailable' | 'stockQuantity' | 'discount' | 'visibility' | 'archive' | 'restore' | 'delete' | ''>('');
    const [bulkActionValue, setBulkActionValue] = useState<string>('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const addAuditLog = (actionType: string, fieldName: string, targetCount: number, details: string) => {
        const newLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            section: 'Menu',
            actionType,
            fieldName,
            targetCount,
            details
        };
        const updated = [newLog, ...auditLogs];
        setAuditLogs(updated);
        localStorage.setItem('zenith_cafe_bulk_audit_logs', JSON.stringify(updated));
    };

    const applyBulkAction = () => {
        let details = "";
        const updatedItems = menuItems.map(item => {
            if (!selectedItemIds.includes(item.id)) return item;
            
            let updatedItem = { ...item };
            switch (bulkActionField) {
                case 'price': {
                    if (bulkActionValue.endsWith('%')) {
                        const pct = parseFloat(bulkActionValue.slice(0, -1)) || 0;
                        updatedItem.price = Math.max(0, Math.round(item.price * (1 + pct / 100)));
                        details = `Adjusted price by ${pct}%`;
                    } else if (bulkActionValue.startsWith('+') || bulkActionValue.startsWith('-')) {
                        const amt = parseFloat(bulkActionValue) || 0;
                        updatedItem.price = Math.max(0, item.price + amt);
                        details = `Adjusted price by ₹${amt}`;
                    } else {
                        const amt = parseFloat(bulkActionValue) || 0;
                        updatedItem.price = Math.max(0, amt);
                        details = `Set price to ₹${amt}`;
                    }
                    break;
                }
                case 'category': {
                    updatedItem.category = bulkActionValue as any;
                    details = `Set category to ${bulkActionValue}`;
                    break;
                }
                case 'isAvailable': {
                    const isAvail = bulkActionValue === 'true';
                    updatedItem.isAvailable = isAvail;
                    details = `Set availability status to ${isAvail ? 'Available' : 'Disabled'}`;
                    break;
                }
                case 'stockQuantity': {
                    const val = parseInt(bulkActionValue) || 0;
                    if (bulkActionValue.startsWith('+') || bulkActionValue.startsWith('-')) {
                        updatedItem.stockQuantity = Math.max(0, (item.stockQuantity || 0) + val);
                        details = `Adjusted stock quantity by ${val}`;
                    } else {
                        updatedItem.stockQuantity = Math.max(0, val);
                        details = `Set stock quantity to ${val}`;
                    }
                    break;
                }
                case 'discount': {
                    const val = Math.min(100, Math.max(0, parseInt(bulkActionValue) || 0));
                    updatedItem.discount = val;
                    details = `Set discount to ${val}%`;
                    break;
                }
                case 'visibility': {
                    const isAvail = bulkActionValue === 'true';
                    updatedItem.isAvailable = isAvail;
                    updatedItem.status = isAvail ? 'Published' : 'Draft';
                    details = `Set visibility status to ${isAvail ? 'Published' : 'Draft'}`;
                    break;
                }
                case 'archive': {
                    updatedItem.isAvailable = false;
                    updatedItem.status = 'Draft';
                    updatedItem.isArchived = true;
                    details = `Archived items`;
                    break;
                }
                case 'restore': {
                    updatedItem.isAvailable = true;
                    updatedItem.status = 'Published';
                    updatedItem.isArchived = false;
                    details = `Restored items`;
                    break;
                }
            }
            return updatedItem;
        });
        
        let finalItems = updatedItems;
        if (bulkActionField === 'delete') {
            finalItems = menuItems.filter(item => !selectedItemIds.includes(item.id));
            details = `Deleted items`;
        }
        
        setMenuItems(finalItems);
        localStorage.setItem('zenith_cafe_menu', JSON.stringify(finalItems));
        window.dispatchEvent(new Event('storage'));
        
        addAuditLog(
            bulkActionField.toUpperCase(),
            bulkActionField,
            selectedItemIds.length,
            `${details} for ${selectedItemIds.length} items.`
        );
        
        toast.success(`Successfully processed bulk action for ${selectedItemIds.length} items.`);
        
        setSelectedItemIds([]);
        setIsBulkMode(false);
        setIsConfirmOpen(false);
        setIsBulkActionOpen(false);
        setBulkActionField('');
        setBulkActionValue('');
    };

    // Add New Item modal state
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Form fields for new item
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<CafeCategory>('Protein Shakes');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemPrepTime, setNewItemPrepTime] = useState('5 mins');
    const [newItemStock, setNewItemStock] = useState('20');
    
    // Nutrition
    const [newItemCalories, setNewItemCalories] = useState('');
    const [newItemProtein, setNewItemProtein] = useState('');
    const [newItemCarbs, setNewItemCarbs] = useState('');
    const [newItemFat, setNewItemFat] = useState('');
    
    // Dietary Tags
    const [newItemTags, setNewItemTags] = useState<string[]>([]);
    
    // Add-ons
    const [newItemAddOns, setNewItemAddOns] = useState<{ name: string; price: number }[]>([]);
    const [newAddOnName, setNewAddOnName] = useState('');
    const [newAddOnPrice, setNewAddOnPrice] = useState('');
    
    // Customizations
    const [newItemCustomizations, setNewItemCustomizations] = useState<{ title: string; options: string[] }[]>([]);
    const [newCustTitle, setNewCustTitle] = useState('');
    const [newCustOptions, setNewCustOptions] = useState('');

    const handleAddAddOn = () => {
        if (!newAddOnName || !newAddOnPrice) {
            toast.error('Please enter both name and price for the add-on.');
            return;
        }
        const priceNum = parseFloat(newAddOnPrice);
        if (isNaN(priceNum) || priceNum < 0) {
            toast.error('Add-on price must be a positive number.');
            return;
        }
        setNewItemAddOns([...newItemAddOns, { name: newAddOnName, price: priceNum }]);
        setNewAddOnName('');
        setNewAddOnPrice('');
    };

    const handleRemoveAddOn = (index: number) => {
        setNewItemAddOns(newItemAddOns.filter((_, i) => i !== index));
    };

    const handleAddCustomization = () => {
        if (!newCustTitle || !newCustOptions) {
            toast.error('Please enter a title and options (comma-separated).');
            return;
        }
        const optionsArray = newCustOptions.split(',').map(o => o.trim()).filter(Boolean);
        if (optionsArray.length === 0) {
            toast.error('Please enter valid comma-separated options.');
            return;
        }
        setNewItemCustomizations([...newItemCustomizations, { title: newCustTitle, options: optionsArray }]);
        setNewCustTitle('');
        setNewCustOptions('');
    };

    const handleRemoveCustomization = (index: number) => {
        setNewItemCustomizations(newItemCustomizations.filter((_, i) => i !== index));
    };

    const handleToggleTag = (tag: string) => {
        if (newItemTags.includes(tag)) {
            setNewItemTags(newItemTags.filter(t => t !== tag));
        } else {
            setNewItemTags([...newItemTags, tag]);
        }
    };

    const handleCreateItem = (status: 'Published' | 'Draft') => {
        if (!newItemName) {
            toast.error('Please enter the item name.');
            return;
        }
        const priceNum = parseFloat(newItemPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            toast.error('Please enter a valid price.');
            return;
        }

        const caloriesNum = newItemCalories ? parseInt(newItemCalories) : 0;
        const stockNum = newItemStock ? parseInt(newItemStock) : 0;

        const newItem: MenuItem = {
            id: `m_${Date.now()}`,
            name: newItemName,
            description: newItemDesc || 'No description provided.',
            price: priceNum,
            category: newItemCategory,
            image: newItemImage || 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
            isAvailable: status === 'Published',
            prepTime: newItemPrepTime || '5 mins',
            tags: newItemTags,
            ingredients: [], // Empty ingredients initially, to be configured later
            status: status,
            stockQuantity: stockNum,
            nutrition: {
                calories: caloriesNum,
                protein: newItemProtein || '0g',
                carbs: newItemCarbs || '0g',
                fat: newItemFat || '0g'
            },
            addOns: newItemAddOns,
            customizations: newItemCustomizations
        };

        const updated = [newItem, ...menuItems];
        setMenuItems(updated);
        localStorage.setItem('zenith_cafe_menu', JSON.stringify(updated));
        
        // Dispatch storage event to alert other context listeners
        window.dispatchEvent(new Event('storage'));

        toast.success(status === 'Published' ? 'Menu item published successfully!' : 'Menu item saved as draft.');
        
        // Close modal and reset state
        setIsAddOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewItemName('');
        setNewItemCategory('Protein Shakes');
        setNewItemDesc('');
        setNewItemImage('https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop');
        setNewItemPrice('');
        setNewItemPrepTime('5 mins');
        setNewItemStock('20');
        setNewItemCalories('');
        setNewItemProtein('');
        setNewItemCarbs('');
        setNewItemFat('');
        setNewItemTags([]);
        setNewItemAddOns([]);
        setNewAddOnName('');
        setNewAddOnPrice('');
        setNewItemCustomizations([]);
        setNewCustTitle('');
        setNewCustOptions('');
    };

    useEffect(() => {
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

        const savedLogs = localStorage.getItem('zenith_cafe_bulk_audit_logs');
        if (savedLogs) {
            try {
                setAuditLogs(JSON.parse(savedLogs));
            } catch (e) {}
        }
    }, []);

    // Logic to check availability based on ingredients
    const checkAvailability = (item: MenuItem) => {
        return item.ingredients.every(ing => {
            const invItem = CAFE_INVENTORY_DATA.find(i => i.id === ing.inventoryId);
            return invItem && invItem.stock > 0; // Simplified check: at least 1 unit/batch
        });
    };

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const isItemArchived = !!item.isArchived;
            if (activeCategory === 'Archived') {
                if (!isItemArchived) return false;
            } else {
                if (isItemArchived) return false;
            }

            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || activeCategory === 'Archived' || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, menuItems]);

    const handleUpdatePrice = (id: string, newPrice: number) => {
        const updated = menuItems.map(item => item.id === id ? { ...item, price: newPrice } : item);
        setMenuItems(updated);
        localStorage.setItem('zenith_cafe_menu', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const handleToggleStatus = (id: string) => {
        const updated = menuItems.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item);
        setMenuItems(updated);
        localStorage.setItem('zenith_cafe_menu', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const activeItem = menuItems.find(i => i.id === selectedItem?.id) || selectedItem;

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Menu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 not-italic">Configuration</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide text-xs uppercase flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-indigo-400" />
                        Manage your cafe offerings, ingredients & pricing
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setIsBulkMode(!isBulkMode);
                            setSelectedItemIds([]);
                        }}
                        className={`border-white/10 uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl transition-all ${
                            isBulkMode 
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:text-indigo-400' 
                            : 'text-white bg-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Settings className="w-4 h-4 mr-2 text-indigo-400" /> 
                        {isBulkMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => setIsAuditLogOpen(true)}
                        className="border-white/10 text-white bg-white/5 uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                        Audit Logs
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl transition-all active:scale-95">
                        <Plus className="w-4 h-4 mr-2" /> Add New Item
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-6 bg-slate-900/40 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                activeCategory === cat 
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                                : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input 
                        placeholder="Search recipes, ingredients or categories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 bg-black/40 border-white/5 text-white w-full focus:border-indigo-500/50 h-12 rounded-2xl text-xs font-medium placeholder:text-slate-600 transition-all"
                    />
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, idx) => {
                        const isStocked = checkAvailability(item);
                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <Card 
                                    onClick={() => {
                                        if (isBulkMode) {
                                            setSelectedItemIds(prev => 
                                                prev.includes(item.id) 
                                                ? prev.filter(id => id !== item.id) 
                                                : [...prev, item.id]
                                            );
                                        } else {
                                            setSelectedItem(item);
                                        }
                                    }}
                                    className={`bg-slate-900/50 border backdrop-blur-xl group hover:border-indigo-500/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full rounded-[2rem] ${
                                        selectedItemIds.includes(item.id) ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/5'
                                    }`}
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <MenuCardImage 
                                            src={item.image} 
                                            alt={item.name} 
                                            category={item.category} 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                                        
                                        {isBulkMode && (
                                            <div className="absolute top-4 right-4 z-20">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedItemIds.includes(item.id)}
                                                    readOnly
                                                    className="w-5 h-5 rounded-lg accent-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Badges on Image */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            {item.tags.map(tag => (
                                                <Badge key={tag} className="bg-indigo-500 text-white border-0 font-black uppercase text-[8px] tracking-widest px-2 py-0.5 shadow-lg flex items-center gap-1">
                                                    {tag === 'Popular' && <Flame className="w-2.5 h-2.5" />}
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <Badge className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-0 ${
                                                isStocked && item.isAvailable 
                                                ? 'bg-emerald-500/20 text-emerald-400 backdrop-blur-md' 
                                                : 'bg-rose-500/20 text-rose-400 backdrop-blur-md'
                                            }`}>
                                                {isStocked && item.isAvailable ? 'Available' : !isStocked ? 'Out of Stock' : 'Disabled'}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 text-white/70 text-[9px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
                                                <Clock className="w-3 h-3" /> {item.prepTime}
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight group-hover:text-indigo-400 transition-colors leading-tight">{item.name}</h3>
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                                <Edit3 className="w-4 h-4 text-slate-500 hover:text-white" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                            {item.category} <span className="w-1 h-1 rounded-full bg-slate-800" /> 
                                            {item.ingredients.length} Ingredients
                                        </p>
                                        
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6">
                                            {item.description}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Price Point</span>
                                                <span className="text-2xl font-black text-white italic tracking-tighter">₹{item.price.toLocaleString()}</span>
                                            </div>
                                            <Button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                className="bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 border border-white/10 hover:border-indigo-500/30 rounded-2xl h-10 px-4 transition-all group/btn"
                                            >
                                                <Settings className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="p-24 border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01] text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-widest">No Items Found</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2">Try adjusting your filters or search query</p>
                    <Button 
                        variant="link" 
                        onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                        className="mt-4 text-indigo-400 font-black uppercase tracking-widest text-[10px]"
                    >
                        Reset All Filters
                    </Button>
                </div>
            )}

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-2xl bg-slate-950 border-white/10 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                    {activeItem && (
                        <div className="flex flex-col max-h-[90vh]">
                            <div className="relative h-48">
                                <MenuCardImage 
                                    src={activeItem.image} 
                                    alt={activeItem.name} 
                                    category={activeItem.category} 
                                    className="object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                <div className="absolute bottom-6 left-8">
                                    <Badge className="mb-2 bg-indigo-500 text-white uppercase text-[8px] font-black tracking-widest">{activeItem.category}</Badge>
                                    <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{activeItem.name}</DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Configure the details, pricing, and ingredients for {activeItem.name}.
                                    </DialogDescription>
                                </div>
                                <button 
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-6 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors"
                                >
                                    <Plus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto">
                                {/* Basic Config */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Price (INR)</label>
                                        <div className="relative">
                                            <Input 
                                                type="number" 
                                                defaultValue={activeItem.price} 
                                                onChange={(e) => handleUpdatePrice(activeItem.id, parseInt(e.target.value))}
                                                className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Status</label>
                                        <Button 
                                            onClick={() => handleToggleStatus(activeItem.id)}
                                            className={`w-full h-12 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest ${
                                                activeItem.isAvailable 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                            }`}
                                        >
                                            {activeItem.isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {activeItem.isAvailable ? 'Item Enabled' : 'Item Disabled'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Ingredients Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Settings className="w-3.5 h-3.5 text-indigo-400" /> Recipe Ingredients
                                        </h4>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{activeItem.ingredients.length} items linked</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {activeItem.ingredients.map((ing, i) => {
                                            const inv = CAFE_INVENTORY_DATA.find(inv => inv.id === ing.inventoryId);
                                            const isLow = inv ? inv.stock <= 5 : true;
                                            
                                            return (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                                                            isLow ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                        }`}>
                                                            {inv?.category === 'Ingredients' ? <Utensils className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{ing.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                                Deduction: {ing.quantity} {ing.unit} 
                                                                <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                                Stock: <span className={isLow ? 'text-rose-400 animate-pulse' : 'text-slate-400'}>{inv?.stock || 0} batches left</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white hover:bg-white/5 rounded-xl">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                        
                                        <Button className="w-full bg-white/[0.03] hover:bg-white/[0.08] border border-dashed border-white/10 hover:border-indigo-500/30 text-slate-500 hover:text-indigo-400 h-12 rounded-2xl transition-all group">
                                            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Add Ingredient Link</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Changes sync instantly to POS
                                </div>
                                <div className="flex gap-3">
                                    <DialogClose asChild>
                                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button onClick={() => setSelectedItem(null)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 font-black uppercase tracking-widest text-[10px] h-11 px-10 rounded-xl active:scale-95 transition-all">
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add New Item Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-4xl bg-slate-950 border border-white/10 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <div className="flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 bg-black/20">
                            <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-2">
                                <Plus className="w-6 h-6 text-indigo-400" /> Add New Menu Item
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-wider">
                                Create a new offering with dietary options, nutritional data, and customizations
                            </DialogDescription>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="p-8 space-y-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:space-y-0">
                            {/* Left Column: Core Details */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Utensils className="w-4 h-4 text-indigo-400" /> Core Details
                                </h4>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Item Name *</label>
                                    <Input 
                                        placeholder="e.g. Viking Whey Protein Shake" 
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-indigo-500/50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['Protein Shakes', 'Smoothies', 'Healthy Meals', 'Pre-Workout Drinks', 'Post-Workout Meals', 'Snacks'] as const).map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewItemCategory(cat)}
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    newItemCategory === cat
                                                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Price (INR) *</label>
                                        <Input 
                                            type="number" 
                                            placeholder="Price" 
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Prep Time</label>
                                        <Input 
                                            placeholder="e.g. 5 mins" 
                                            value={newItemPrepTime}
                                            onChange={(e) => setNewItemPrepTime(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Stock</label>
                                        <Input 
                                            type="number" 
                                            placeholder="e.g. 20" 
                                            value={newItemStock}
                                            onChange={(e) => setNewItemStock(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Image URL</label>
                                        <Input 
                                            placeholder="e.g. https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800" 
                                            value={newItemImage}
                                            onChange={(e) => setNewItemImage(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</label>
                                    <textarea 
                                        placeholder="Enter details, features, ingredients or highlights..." 
                                        value={newItemDesc}
                                        onChange={(e) => setNewItemDesc(e.target.value)}
                                        rows={3}
                                        className="bg-black/40 border border-white/10 text-white rounded-2xl p-4 font-bold placeholder:text-slate-600 focus:border-indigo-500/50 resize-none outline-none w-full transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Nutrition, Tags, Customizations */}
                            <div className="space-y-6">
                                {/* Nutrition */}
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                                        <Flame className="w-4 h-4 text-orange-400" /> Nutrition Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Calories</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 350"
                                                value={newItemCalories}
                                                onChange={(e) => setNewItemCalories(e.target.value)}
                                                className="bg-black/40 border-white/10 text-white h-10 rounded-xl pl-4 font-bold focus:border-indigo-500/50 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Protein</label>
                                            <Input
                                                placeholder="e.g. 30g"
                                                value={newItemProtein}
                                                onChange={(e) => setNewItemProtein(e.target.value)}
                                                className="bg-black/40 border-white/10 text-white h-10 rounded-xl pl-4 font-bold focus:border-indigo-500/50 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Carbs</label>
                                            <Input
                                                placeholder="e.g. 20g"
                                                value={newItemCarbs}
                                                onChange={(e) => setNewItemCarbs(e.target.value)}
                                                className="bg-black/40 border-white/10 text-white h-10 rounded-xl pl-4 font-bold focus:border-indigo-500/50 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Fat</label>
                                            <Input
                                                placeholder="e.g. 10g"
                                                value={newItemFat}
                                                onChange={(e) => setNewItemFat(e.target.value)}
                                                className="bg-black/40 border-white/10 text-white h-10 rounded-xl pl-4 font-bold focus:border-indigo-500/50 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dietary Tags */}
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                                        <Star className="w-4 h-4 text-purple-400" /> Dietary Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Sugar-Free'].map((tag) => {
                                            const isSelected = newItemTags.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => handleToggleTag(tag)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                        isSelected
                                                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                                            : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/10'
                                                    }`}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Add-ons */}
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                                        <Plus className="w-4 h-4 text-emerald-400" /> Add-ons (Optional)
                                    </h4>
                                    <div className="space-y-3">
                                        {newItemAddOns.length > 0 && (
                                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                                {newItemAddOns.map((addon, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-white uppercase tracking-tight">{addon.name}</span>
                                                            <span className="text-[10px] text-indigo-400 font-black">₹{addon.price}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAddOn(index)}
                                                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Add-on Name (e.g. Extra Whey)"
                                                    value={newAddOnName}
                                                    onChange={(e) => setNewAddOnName(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl pl-3 font-bold focus:border-indigo-500/50 text-[11px]"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={newAddOnPrice}
                                                    onChange={(e) => setNewAddOnPrice(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl pl-3 font-bold focus:border-indigo-500/50 text-[11px]"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAddAddOn}
                                                size="sm"
                                                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 h-9 px-3 rounded-xl active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Customizations */}
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                                        <Settings className="w-4 h-4 text-indigo-400" /> Customizations (Optional)
                                    </h4>
                                    <div className="space-y-3">
                                        {newItemCustomizations.length > 0 && (
                                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                                {newItemCustomizations.map((cust, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                                                        <div className="space-y-0.5">
                                                            <span className="font-bold text-white uppercase tracking-tight text-[11px]">{cust.title}</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {cust.options.map((opt, i) => (
                                                                    <span key={i} className="text-[8px] font-black uppercase bg-white/5 text-slate-400 px-1.5 py-0.5 rounded-md">
                                                                        {opt}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCustomization(index)}
                                                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Title (e.g. Milk Option)"
                                                    value={newCustTitle}
                                                    onChange={(e) => setNewCustTitle(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl pl-3 font-bold focus:border-indigo-500/50 text-[11px]"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Options (comma-separated)"
                                                    value={newCustOptions}
                                                    onChange={(e) => setNewCustOptions(e.target.value)}
                                                    className="bg-black/40 border-white/10 text-white h-9 rounded-xl pl-3 font-bold focus:border-indigo-500/50 text-[11px]"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAddCustomization}
                                                size="sm"
                                                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 h-9 px-3 rounded-xl active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                                Required fields are marked with *
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button 
                                    variant="outline" 
                                    onClick={() => { setIsAddOpen(false); resetForm(); }}
                                    className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleCreateItem('Draft')} 
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl transition-all"
                                >
                                    Save Draft
                                </Button>
                                <Button 
                                    onClick={() => handleCreateItem('Published')} 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl active:scale-95 transition-all"
                                >
                                    Publish Item
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Edit Docked Action Bar */}
            {isBulkMode && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-white/10 backdrop-blur-2xl px-8 py-5 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-2xl z-50 max-w-[95%] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.1em] text-white">
                            Bulk Operation Control
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                            {selectedItemIds.length} of {filteredItems.length} items selected
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (selectedItemIds.length === filteredItems.length) {
                                    setSelectedItemIds([]);
                                } else {
                                    setSelectedItemIds(filteredItems.map(item => item.id));
                                }
                            }}
                            className="border-white/10 text-white hover:bg-white/5 hover:text-white text-[9px] uppercase font-black tracking-wider px-3 h-9 rounded-xl"
                        >
                            {selectedItemIds.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        
                        {(['price', 'category', 'isAvailable', 'stockQuantity', 'discount', 'visibility'] as const).map(field => {
                            const labels: Record<string, string> = {
                                price: 'Update Price',
                                category: 'Change Category',
                                isAvailable: 'Availability',
                                stockQuantity: 'Set Stock',
                                discount: 'Apply Discount',
                                visibility: 'Visibility'
                            };
                            return (
                                <Button
                                    key={field}
                                    size="sm"
                                    disabled={selectedItemIds.length === 0}
                                    onClick={() => {
                                        setBulkActionField(field);
                                        setBulkActionValue('');
                                        setIsBulkActionOpen(true);
                                    }}
                                    className="bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-[9px] uppercase font-black tracking-wider px-3.5 h-9 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {labels[field]}
                                </Button>
                            );
                        })}
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <Button 
                            size="sm"
                            disabled={selectedItemIds.length === 0}
                            onClick={() => {
                                setBulkActionField('archive');
                                setIsConfirmOpen(true);
                            }}
                            className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-[9px] uppercase font-black tracking-wider px-3.5 h-9 rounded-xl disabled:opacity-30"
                        >
                            Archive
                        </Button>
                        <Button 
                            size="sm"
                            disabled={selectedItemIds.length === 0}
                            onClick={() => {
                                setBulkActionField('restore');
                                setIsConfirmOpen(true);
                            }}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[9px] uppercase font-black tracking-wider px-3.5 h-9 rounded-xl disabled:opacity-30"
                        >
                            Restore
                        </Button>
                        <Button 
                            size="sm"
                            disabled={selectedItemIds.length === 0}
                            onClick={() => {
                                setBulkActionField('delete');
                                setIsConfirmOpen(true);
                            }}
                            className="bg-rose-500/15 text-rose-400 hover:bg-rose-500/20 border border-rose-500/25 text-[9px] uppercase font-black tracking-wider px-3.5 h-9 rounded-xl disabled:opacity-30"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Bulk Action Config Dialog */}
            <Dialog open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
                <DialogContent className="max-w-md bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-400" /> Apply Bulk Modification
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Define the value to apply to the {selectedItemIds.length} selected items
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 my-6">
                        {bulkActionField === 'price' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Price Value (e.g. 500, +10%, -50)</label>
                                <Input 
                                    placeholder="e.g. 500 or +10% or -50"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs"
                                />
                            </div>
                        )}
                        {bulkActionField === 'category' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Select Category</label>
                                <Select value={bulkActionValue} onValueChange={setBulkActionValue}>
                                    <SelectTrigger className="w-full h-11 bg-black/40 border-white/10 text-white rounded-xl text-xs uppercase font-bold">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                        <SelectItem value="Protein Shakes" className="text-[10px] font-bold uppercase">Protein Shakes</SelectItem>
                                        <SelectItem value="Smoothies" className="text-[10px] font-bold uppercase">Smoothies</SelectItem>
                                        <SelectItem value="Healthy Meals" className="text-[10px] font-bold uppercase">Healthy Meals</SelectItem>
                                        <SelectItem value="Pre-Workout Drinks" className="text-[10px] font-bold uppercase">Pre-Workout Drinks</SelectItem>
                                        <SelectItem value="Post-Workout Meals" className="text-[10px] font-bold uppercase">Post-Workout Meals</SelectItem>
                                        <SelectItem value="Snacks" className="text-[10px] font-bold uppercase">Snacks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {bulkActionField === 'isAvailable' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Set Availability Status</label>
                                <Select value={bulkActionValue} onValueChange={setBulkActionValue}>
                                    <SelectTrigger className="w-full h-11 bg-black/40 border-white/10 text-white rounded-xl text-xs uppercase font-bold">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                        <SelectItem value="true" className="text-[10px] font-bold uppercase text-emerald-400">Available / Enabled</SelectItem>
                                        <SelectItem value="false" className="text-[10px] font-bold uppercase text-rose-400">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {bulkActionField === 'stockQuantity' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Stock Quantity (e.g. 50, +10, -5)</label>
                                <Input 
                                    placeholder="e.g. 50 or +10 or -5"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs"
                                />
                            </div>
                        )}
                        {bulkActionField === 'discount' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Discount Percentage (0-100)</label>
                                <Input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="e.g. 15"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs"
                                />
                            </div>
                        )}
                        {bulkActionField === 'visibility' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Set Item Visibility</label>
                                <Select value={bulkActionValue} onValueChange={setBulkActionValue}>
                                    <SelectTrigger className="w-full h-11 bg-black/40 border-white/10 text-white rounded-xl text-xs uppercase font-bold">
                                        <SelectValue placeholder="Select Visibility" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                        <SelectItem value="true" className="text-[10px] font-bold uppercase text-emerald-400">Published / Visible</SelectItem>
                                        <SelectItem value="false" className="text-[10px] font-bold uppercase text-rose-400">Draft / Hidden</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsBulkActionOpen(false)}
                            className="border-white/10 text-white hover:bg-white/5 text-[10px] uppercase font-black tracking-widest h-11 rounded-xl px-6"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                if (bulkActionValue === '') {
                                    toast.error('Please specify a valid value.');
                                    return;
                                }
                                setIsConfirmOpen(true);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[10px] font-black uppercase tracking-widest h-11 rounded-xl px-8"
                        >
                            Review Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="max-w-md bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-indigo-400" /> Confirm Bulk Action
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            You are about to modify {selectedItemIds.length} items. Please confirm.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="my-6 space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Action Field:</span>
                            <span className="text-white font-mono font-bold uppercase">{bulkActionField}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Target Value:</span>
                            <span className="text-emerald-400 font-mono font-bold">{bulkActionValue || 'Toggle/Archive/Delete'}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-white/5 pt-3">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Affected Count:</span>
                            <span className="text-white font-black font-bold">{selectedItemIds.length} items</span>
                        </div>
                    </div>
                    
                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsConfirmOpen(false)}
                            className="border-white/10 text-white hover:bg-white/5 text-[10px] uppercase font-black tracking-widest h-11 rounded-xl px-6"
                        >
                            Back
                        </Button>
                        <Button 
                            onClick={applyBulkAction}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest h-11 rounded-xl px-8"
                        >
                            Confirm & Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Audit Logs Dialog */}
            <Dialog open={isAuditLogOpen} onOpenChange={setIsAuditLogOpen}>
                <DialogContent className="max-w-2xl bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-indigo-400" /> Bulk Action Audit History
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Review all chronological bulk edit operations executed by staff
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="my-6 max-h-[350px] overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl bg-black/40">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/40 text-slate-500 text-[9px] uppercase tracking-wider font-black">
                                    <th className="py-3 pl-4">Timestamp</th>
                                    <th className="py-3">Section</th>
                                    <th className="py-3">Action</th>
                                    <th className="py-3">Targets</th>
                                    <th className="py-3 pr-4">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log: any) => (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                        <td className="py-3 pl-4 text-slate-400 font-mono text-[10px]">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="py-3 font-bold text-slate-500 uppercase tracking-widest text-[9px]">{log.section}</td>
                                        <td className="py-3">
                                            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                                                {log.actionType}
                                            </Badge>
                                        </td>
                                        <td className="py-3 font-mono font-bold text-white text-[11px]">{log.targetCount}</td>
                                        <td className="py-3 pr-4 text-slate-300 font-medium text-[11px]">{log.details}</td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-600 uppercase font-black tracking-widest text-[9px]">
                                            No bulk audit logs recorded
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsAuditLogOpen(false)}
                            className="border-white/10 text-white hover:bg-white/5 text-[10px] uppercase font-black tracking-widest h-11 rounded-xl px-6"
                        >
                            Close Logs
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
