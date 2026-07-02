'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Upload, 
    Barcode, 
    RefreshCcw, 
    Save, 
    RotateCcw, 
    ChevronRight,
    Info,
    DollarSign,
    Package,
    Tag,
    Calendar,
    Truck,
    Check,
    AlertCircle,
    Image as ImageIcon,
    LayoutDashboard,
    ArrowUpRight,
    MousePointer2,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotifications } from '@/context/NotificationContext';

interface AddProductFormProps {
    onClose: () => void;
    onSuccess: (product: any) => void;
}

export default function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
    const { triggerSaleComplete } = useNotifications();
    const [activeTab, setActiveTab] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brand: '',
        description: '',
        image: null as File | null,
        costPrice: '',
        sellingPrice: '',
        discount: '0',
        stockQty: '',
        minStock: '10',
        unit: 'pcs',
        sku: '',
        productCode: '',
        expiryDate: '',
        mfd: '',
        batchNo: '',
        supplier: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const generateSKU = () => {
        const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PROD';
        const random = Math.floor(1000 + Math.random() * 9000);
        const namePart = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'XXX';
        const newSku = `${prefix}-${namePart}-${random}`;
        setFormData(prev => ({ ...prev, sku: newSku }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Product name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
        if (!formData.stockQty) newErrors.stockQty = 'Initial stock is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            setActiveTab('basic'); // Fallback to first tab if errors
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newProduct = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
            status: 'Active',
            price: parseFloat(formData.sellingPrice),
            stock: parseInt(formData.stockQty)
        };

        triggerSaleComplete({ 
            invoiceId: newProduct.sku, 
            customerName: 'System', 
            amount: 0, 
            department: 'Store' 
        });

        onSuccess(newProduct);
        setIsSubmitting(false);
    };

    const resetForm = () => {
        setFormData({
            name: '', category: '', brand: '', description: '', image: null,
            costPrice: '', sellingPrice: '', discount: '0', stockQty: '',
            minStock: '10', unit: 'pcs', sku: '', productCode: '',
            expiryDate: '', mfd: '', batchNo: '', supplier: ''
        });
        setErrors({});
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-[#020617] text-slate-200 overflow-hidden relative">
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-slate-950/40 backdrop-blur-3xl flex-none z-20">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                                <LayoutDashboard className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                    Inventory <span className="text-indigo-400">Command</span>
                                </h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Product Integration Nexus</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-12 h-12 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row p-8 gap-8">
                        
                        {/* Tabs Container (Left) */}
                        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/20 rounded-[2.5rem] border border-white/5">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                                <TabsList className="bg-slate-950/50 p-2 rounded-none border-b border-white/5 justify-start gap-2 h-auto flex-wrap">
                                    <TabsTrigger value="basic" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                                        <Info className="w-4 h-4 mr-2" />
                                        Basic Info
                                    </TabsTrigger>
                                    <TabsTrigger value="pricing" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Pricing & Stock
                                    </TabsTrigger>
                                    <TabsTrigger value="id" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                                        <Barcode className="w-4 h-4 mr-2" />
                                        Identification
                                    </TabsTrigger>
                                    <TabsTrigger value="additional" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Additional Details
                                    </TabsTrigger>
                                </TabsList>

                                <div className="p-8 pb-32">
                                    <AnimatePresence mode="wait">
                                        <TabsContent key="basic" value="basic" className="m-0 focus-visible:ring-0">
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Product Name *</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger><HelpCircle className="w-3 h-3 text-slate-700" /></TooltipTrigger>
                                                            <TooltipContent>The official name as it will appear in bills and catalogs.</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Input 
                                                        placeholder="e.g. Nexus Ultra Whey"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        className={`bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 text-lg font-bold placeholder:text-slate-800 focus:ring-indigo-500/20 transition-all ${errors.name ? 'border-rose-500' : ''}`}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Category *</Label>
                                                        <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                                                            <SelectTrigger className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-bold">
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-950 border-white/10 text-white rounded-xl">
                                                                <SelectItem value="Supplements">Supplements</SelectItem>
                                                                <SelectItem value="Gear">Gear</SelectItem>
                                                                <SelectItem value="Apparel">Apparel</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Brand</Label>
                                                        <Input 
                                                            placeholder="Nexus"
                                                            value={formData.brand}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                                            className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Description</Label>
                                                    <Textarea 
                                                        placeholder="Enter detailed product specifications..."
                                                        value={formData.description}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                        className="bg-black/40 border-white/5 text-white min-h-[120px] rounded-2xl p-6 text-sm font-medium resize-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Media Assets</Label>
                                                    <div className="border-2 border-dashed border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-black/20 hover:bg-white/5 transition-all cursor-pointer">
                                                        <Upload className="w-8 h-8 text-indigo-400" />
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Product Image</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </TabsContent>

                                        <TabsContent key="pricing" value="pricing" className="m-0 focus-visible:ring-0">
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Cost Price</Label>
                                                        <Input type="number" placeholder="0.00" value={formData.costPrice} onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Selling Price *</Label>
                                                        <Input type="number" placeholder="0.00" value={formData.sellingPrice} onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Stock Qty *</Label>
                                                        <Input type="number" value={formData.stockQty} onChange={(e) => setFormData(prev => ({ ...prev, stockQty: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Min. Alert</Label>
                                                        <Input type="number" value={formData.minStock} onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Unit</Label>
                                                        <Select value={formData.unit} onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}>
                                                            <SelectTrigger className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-slate-900 border-white/5 text-white"><SelectItem value="pcs">Pcs</SelectItem><SelectItem value="kg">Kg</SelectItem></SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Profit Analysis</p>
                                                        <p className="text-sm font-bold text-white italic">
                                                            Margin: {formData.costPrice && formData.sellingPrice ? `${(((parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.sellingPrice)) * 100).toFixed(1)}%` : '0.0%'}
                                                        </p>
                                                    </div>
                                                    <div className="h-2 w-full bg-emerald-950 rounded-full mt-4 overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-emerald-500" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </TabsContent>

                                        <TabsContent key="id" value="id" className="m-0 focus-visible:ring-0">
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">SKU / Barcode</Label>
                                                    <div className="flex gap-4">
                                                        <Input value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono flex-1" />
                                                        <Button onClick={generateSKU} variant="outline" className="h-14 rounded-2xl border-white/10 text-white hover:!text-white hover:!bg-white/5 px-6">
                                                            <RefreshCcw className="w-4 h-4 mr-2" />
                                                            Auto-Gen
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Product Code (HSN/EAN)</Label>
                                                    <Input value={formData.productCode} onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono" />
                                                </div>
                                            </motion.div>
                                        </TabsContent>

                                        <TabsContent key="additional" value="additional" className="m-0 focus-visible:ring-0">
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Mfg. Date (MFD)</Label>
                                                        <Input type="date" value={formData.mfd} onChange={(e) => setFormData(prev => ({ ...prev, mfd: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 invert-calendar-icon" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Expiry Date</Label>
                                                        <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 invert-calendar-icon" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Batch Number</Label>
                                                    <Input value={formData.batchNo} onChange={(e) => setFormData(prev => ({ ...prev, batchNo: e.target.value }))} className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-mono" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Preferred Supplier</Label>
                                                    <Select value={formData.supplier} onValueChange={(v) => setFormData(prev => ({ ...prev, supplier: v }))}>
                                                        <SelectTrigger className="bg-black/40 border-white/5 text-white h-14 rounded-2xl px-6 font-bold"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                                        <SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="nexus_global">Nexus Global Distribution</SelectItem></SelectContent>
                                                    </Select>
                                                </div>
                                            </motion.div>
                                        </TabsContent>
                                    </AnimatePresence>
                                </div>
                            </Tabs>
                        </div>

                        {/* Sticky Side Preview (Right) */}
                        <div className="w-full lg:w-[400px] flex-none relative">
                            <div className="lg:sticky lg:top-8 space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-2xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
                                                <ImageIcon className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-black uppercase tracking-widest px-3">Live Preview</Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Product Title</p>
                                                <h3 className="text-2xl font-black text-white leading-tight truncate uppercase italic">{formData.name || 'Untitled Product'}</h3>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">MSRP</p>
                                                    <p className="text-xl font-black text-emerald-400">₹{formData.sellingPrice || '0.00'}</p>
                                                </div>
                                                <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Inventory</p>
                                                    <p className="text-xl font-black text-white">{formData.stockQty || '0'} <span className="text-[10px] text-slate-600">{formData.unit}</span></p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SKU Identity</p>
                                                    <Barcode className="w-3 h-3 text-indigo-400" />
                                                </div>
                                                <p className="text-xs font-mono text-indigo-300 truncate">{formData.sku || 'SKU-PENDING-SYNC'}</p>
                                            </div>
                                            {formData.mfd && (
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-500 uppercase tracking-widest">MFD:</span>
                                                    <span className="text-slate-300">{formData.mfd}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-4">
                                    <MousePointer2 className="w-5 h-5 text-indigo-400 flex-none mt-1" />
                                    <div>
                                        <h5 className="text-sm font-bold text-white uppercase italic">Interactive Sync</h5>
                                        <p className="text-xs text-slate-500 leading-relaxed mt-1">Details entered in the tabs are synchronized instantly with the live preview card.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Action Bar */}
                <div className="p-8 border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl flex-none z-30">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <Button onClick={resetForm} variant="ghost" className="text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Form
                        </Button>
                        <div className="flex gap-4">
                            <Button onClick={onClose} variant="outline" className="border-white/5 text-white hover:!text-white hover:!bg-white/5 font-black uppercase tracking-widest text-[10px] px-12 py-6 rounded-2xl">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] px-16 py-6 rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all">
                                {isSubmitting ? (
                                    <>
                                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                        Synchronizing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Deploy Product
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    .invert-calendar-icon::-webkit-calendar-picker-indicator {
                        filter: invert(1) brightness(0.8);
                        cursor: pointer;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                    }
                `}</style>
            </div>
        </TooltipProvider>
    );
}
