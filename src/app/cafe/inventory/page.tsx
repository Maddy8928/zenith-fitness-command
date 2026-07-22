'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Package, 
    Plus, 
    Truck, 
    CheckCircle2, 
    CalendarX2, 
    CalendarClock, 
    Coffee, 
    Utensils, 
    Droplets, 
    Zap, 
    ListFilter, 
    Filter,
    ChefHat,
    ShoppingBag,
    History,
    User,
    Mail,
    AlertCircle,
    Trash2,
    ClipboardList,
    Settings,
    Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotifications } from '@/context/NotificationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportButton, ExportFormat } from '@/components/shared/ExportButton';
import { handleExport } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogClose,
    DialogFooter
} from '@/components/ui/dialog';

// --- Mock Cafe Inventory Data ---
const INITIAL_INVENTORY = [
    { id: '1', name: 'Dark Roast Viking Beans', sku: 'CF-BEANS-01', category: 'Ingredients', price: 1850, stock: 45, status: 'Active', batchNo: 'B-K-01', mfd: '2024-10-01', expiryDate: '2026-12-31', unit: 'Grams', minStock: 20, supplierName: 'Asgard Beans Co.', supplierContact: 'orders@asgardbeans.com' },
    { id: '2', name: 'Premium Almond Milk', sku: 'CF-MILK-02', category: 'Beverages', price: 349, stock: 12, status: 'Expiring Soon', batchNo: 'B-K-02', mfd: '2024-10-24', expiryDate: '2026-05-10', unit: 'Liters', minStock: 10, supplierName: 'Valhalla Dairy', supplierContact: 'delivery@valhalladairy.com' },
    { id: '3', name: 'Nordic Protein Bars', sku: 'CF-SNACK-03', category: 'Snacks', price: 149, stock: 85, status: 'Active', batchNo: 'B-S-09', mfd: '2024-06-01', expiryDate: '2026-08-01', unit: 'Units', minStock: 30, supplierName: 'Odin Nutrition', supplierContact: 'sales@odinnutrition.com' },
    { id: '4', name: 'Fresh Avocado Case', sku: 'CF-FOOD-01', category: 'Ingredients', price: 2499, stock: 3, status: 'Critical', batchNo: 'B-K-03', mfd: '2024-10-28', expiryDate: '2026-05-06', unit: 'Cases', minStock: 5, supplierName: 'Freya Farms', supplierContact: 'support@freyafarms.com' },
    { id: '5', name: 'Bio-Degradable Cups (12oz)', sku: 'CF-SUP-01', category: 'Supplies', price: 1299, stock: 540, status: 'Active', batchNo: 'S-001', mfd: '2024-01-10', expiryDate: null, unit: 'Units', minStock: 100, supplierName: 'Midgard EcoPack', supplierContact: 'sales@midgardecopack.com' },
    { id: '6', name: 'Oat Milk Barista Edition', sku: 'CF-MILK-03', category: 'Beverages', price: 399, stock: 0, status: 'Out of Stock', batchNo: 'B-K-04', mfd: '2024-09-15', expiryDate: '2026-06-15', unit: 'Liters', minStock: 15, supplierName: 'Valhalla Dairy', supplierContact: 'delivery@valhalladairy.com' },
    { id: '7', name: 'Wildflower Honey', sku: 'CF-ING-07', category: 'Ingredients', price: 899, stock: 15, status: 'Low Stock', batchNo: 'B-K-05', mfd: '2024-05-20', expiryDate: '2027-01-20', unit: 'Liters', minStock: 20, supplierName: 'Freya Farms', supplierContact: 'support@freyafarms.com' },
    { id: '8', name: 'Protein Pancake Mix', sku: 'CF-ING-08', category: 'Ingredients', price: 1299, stock: 18, status: 'Active', batchNo: 'B-K-06', mfd: '2024-07-15', expiryDate: '2026-11-15', unit: 'kg', minStock: 10, supplierName: 'Odin Nutrition', supplierContact: 'sales@odinnutrition.com' },
];

const SEED_HISTORY = [
    { id: 'h1', timestamp: new Date(Date.now() - 1000 * 3600 * 4).toISOString(), itemId: '1', itemName: 'Dark Roast Viking Beans', type: 'Deduction', qty: 800, unit: 'Grams', description: 'Stock deduction from recipe preparations (Viking Whey Shake).' },
    { id: 'h2', timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString(), itemId: '3', itemName: 'Nordic Protein Bars', type: 'Restock', qty: 50, unit: 'Units', description: 'Received supplier shipment replenishment.' },
    { id: 'h3', timestamp: new Date(Date.now() - 1000 * 3600 * 48).toISOString(), itemId: '6', itemName: 'Oat Milk Barista Edition', type: 'Alert', qty: 0, unit: 'Liters', description: 'Item reached critical stock limit. Automated restocking initiated.' },
    { id: 'h4', timestamp: new Date(Date.now() - 1000 * 3600 * 72).toISOString(), itemId: '2', itemName: 'Premium Almond Milk', type: 'Alert', qty: 12, unit: 'Liters', description: 'Freshness warning: Item batch B-K-02 approaches expiry soon (2026-05-10).' }
];

const CATEGORIES = [
    { name: 'All', icon: ListFilter },
    { name: 'Ingredients', icon: ChefHat },
    { name: 'Beverages', icon: Coffee },
    { name: 'Snacks', icon: ShoppingBag },
    { name: 'Supplies', icon: Utensils },
    { name: 'Archived', icon: Archive },
];

export default function CafeInventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'ledger' | 'history'>('ledger');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form fields for new item
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<'Ingredients' | 'Beverages' | 'Snacks' | 'Supplies'>('Ingredients');
    const [newItemSku, setNewItemSku] = useState('');
    const [newItemStock, setNewItemStock] = useState('20');
    const [newItemUnit, setNewItemUnit] = useState('Units');
    const [newItemMinStock, setNewItemMinStock] = useState('10');
    const [newItemSupplierName, setNewItemSupplierName] = useState('');
    const [newItemSupplierContact, setNewItemSupplierContact] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemBatchNo, setNewItemBatchNo] = useState('');
    const [newItemMfd, setNewItemMfd] = useState('');
    const [newItemExpiryDate, setNewItemExpiryDate] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const { triggerLowStock, triggerCriticalStock, triggerOutOfStock, triggerNearExpiry, triggerProductExpired, triggerAutoOrder, triggerOrderArrived } = useNotifications();
    const [notifiedItems, setNotifiedItems] = useState<Record<string, { critical: boolean; outOfStock: boolean; ordering: boolean; expired: boolean; expiringSoon: boolean }>>({});
    
    // Items currently being ordered from supplier { id: timestamp }
    const [orderingItems, setOrderingItems] = useState<Record<string, number>>({});

    // Bulk Edit states
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
    const [bulkActionField, setBulkActionField] = useState<'price' | 'category' | 'stock' | 'minStock' | 'supplierName' | 'supplierContact' | 'expiryDate' | 'batchNo' | 'mfd' | 'archive' | 'restore' | 'delete' | ''>('');
    const [bulkActionValue, setBulkActionValue] = useState<string>('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const addAuditLog = (actionType: string, fieldName: string, targetCount: number, details: string) => {
        const newLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            section: 'Inventory',
            actionType,
            fieldName,
            targetCount,
            details
        };
        const savedLogs = localStorage.getItem('zenith_cafe_bulk_audit_logs');
        let currentLogs = [];
        if (savedLogs) {
            try {
                currentLogs = JSON.parse(savedLogs);
            } catch (e) {}
        }
        const updated = [newLog, ...currentLogs];
        setAuditLogs(updated);
        localStorage.setItem('zenith_cafe_bulk_audit_logs', JSON.stringify(updated));
    };

    const applyBulkAction = () => {
        let details = "";
        const updatedInventory = inventory.map(item => {
            if (!selectedItemIds.includes(item.id)) return item;
            
            const updatedItem = { ...item };
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
                    updatedItem.category = bulkActionValue;
                    details = `Set category to ${bulkActionValue}`;
                    break;
                }
                case 'stock': {
                    const val = parseInt(bulkActionValue) || 0;
                    if (bulkActionValue.startsWith('+') || bulkActionValue.startsWith('-')) {
                        updatedItem.stock = Math.max(0, item.stock + val);
                        details = `Adjusted stock quantity by ${val}`;
                    } else {
                        updatedItem.stock = Math.max(0, val);
                        details = `Set stock quantity to ${val}`;
                    }
                    break;
                }
                case 'minStock': {
                    const val = parseInt(bulkActionValue) || 0;
                    if (bulkActionValue.startsWith('+') || bulkActionValue.startsWith('-')) {
                        updatedItem.minStock = Math.max(0, (item.minStock || 0) + val);
                        details = `Adjusted min stock level by ${val}`;
                    } else {
                        updatedItem.minStock = Math.max(0, val);
                        details = `Set min stock level to ${val}`;
                    }
                    break;
                }
                case 'supplierName': {
                    updatedItem.supplierName = bulkActionValue;
                    details = `Set supplier name to ${bulkActionValue}`;
                    break;
                }
                case 'supplierContact': {
                    updatedItem.supplierContact = bulkActionValue;
                    details = `Set supplier contact to ${bulkActionValue}`;
                    break;
                }
                case 'expiryDate': {
                    updatedItem.expiryDate = bulkActionValue === 'null' ? null : bulkActionValue;
                    details = bulkActionValue === 'null' ? 'Removed expiry date' : `Set expiry date to ${bulkActionValue}`;
                    break;
                }
                case 'batchNo': {
                    updatedItem.batchNo = bulkActionValue;
                    details = `Set batch number to ${bulkActionValue}`;
                    break;
                }
                case 'mfd': {
                    updatedItem.mfd = bulkActionValue;
                    details = `Set manufacturing date to ${bulkActionValue}`;
                    break;
                }
                case 'archive': {
                    updatedItem.isArchived = true;
                    details = `Archived items`;
                    break;
                }
                case 'restore': {
                    updatedItem.isArchived = false;
                    details = `Restored items`;
                    break;
                }
            }

            // Recalculate status for this item
            updatedItem.status = calculateStatus(updatedItem.stock, !!orderingItems[item.id], updatedItem.expiryDate, updatedItem.minStock || 10);
            return updatedItem;
        });
        
        let finalInventory = updatedInventory;
        if (bulkActionField === 'delete') {
            finalInventory = inventory.filter(item => !selectedItemIds.includes(item.id));
            details = `Deleted items`;
        }
        
        saveInventory(finalInventory);
        
        // Log transaction to history
        const newLogs = selectedItemIds.map(id => {
            const originalItem = inventory.find(i => i.id === id);
            return {
                id: `h_bulk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                timestamp: new Date().toISOString(),
                itemId: id,
                itemName: originalItem ? originalItem.name : 'Unknown Item',
                type: bulkActionField === 'delete' ? 'Waste' : bulkActionField === 'stock' ? 'Restock' : 'Alert',
                qty: bulkActionField === 'stock' ? (parseInt(bulkActionValue) || 0) : 0,
                unit: originalItem ? originalItem.unit : 'Units',
                description: `Bulk edit (${bulkActionField}): ${details}`
            };
        });

        saveHistory([...newLogs, ...history]);
        
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

    const calculateStatus = (stock: number, isOrdering: boolean, expiryDate: string | null, minStock: number = 10) => {
        if (expiryDate) {
            const now = new Date();
            const exp = new Date(expiryDate);
            const daysToExpiry = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
            if (daysToExpiry < 0) return 'Expired';
            if (daysToExpiry <= 7) return 'Expiring Soon'; // Perishables have shorter window
        }
        if (isOrdering) return 'Ordering...';
        if (stock === 0) return 'Out of Stock';
        if (stock <= minStock / 2) return 'Critical';
        if (stock <= minStock) return 'Low Stock';
        return 'In Stock';
    };

    const saveInventory = (updated: any[]) => {
        setInventory(updated);
        localStorage.setItem('zenith_cafe_inventory', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const saveHistory = (updated: any[]) => {
        setHistory(updated);
        localStorage.setItem('zenith_cafe_inventory_history', JSON.stringify(updated));
    };

    useEffect(() => {
        // Set default manufacturing date to today
        setNewItemMfd(new Date().toISOString().split('T')[0]);

        const savedInv = localStorage.getItem('zenith_cafe_inventory');
        let parsedInv = INITIAL_INVENTORY;
        if (savedInv) {
            try {
                parsedInv = JSON.parse(savedInv);
            } catch (e) {
                parsedInv = INITIAL_INVENTORY;
            }
        } else {
            localStorage.setItem('zenith_cafe_inventory', JSON.stringify(INITIAL_INVENTORY));
        }

        // Recalculate status with minStock
        const recInv = parsedInv.map(item => ({
            ...item,
            unit: item.unit || 'Units',
            minStock: item.minStock || 10,
            supplierName: item.supplierName || 'Viking Wholesale Corp',
            supplierContact: item.supplierContact || 'supply@vikingwholesale.com',
            status: calculateStatus(item.stock, !!orderingItems[item.id], item.expiryDate, item.minStock || 10)
        }));
        setInventory(recInv);

        const savedHist = localStorage.getItem('zenith_cafe_inventory_history');
        if (savedHist) {
            try {
                setHistory(JSON.parse(savedHist));
            } catch (e) {
                setHistory(SEED_HISTORY);
            }
        } else {
            setHistory(SEED_HISTORY);
            localStorage.setItem('zenith_cafe_inventory_history', JSON.stringify(SEED_HISTORY));
        }

        const savedLogs = localStorage.getItem('zenith_cafe_bulk_audit_logs');
        if (savedLogs) {
            try {
                setAuditLogs(JSON.parse(savedLogs));
            } catch (e) {}
        }
    }, []);

    // Automated Supplier Ordering Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const now = Date.now();
            let inventoryUpdated = false;
            const newOrders = { ...orderingItems };
            let updatedInv = [...inventory];
            const newNotified = { ...notifiedItems };
            const notificationsToSend: any[] = [];
            const newLogs: any[] = [];
            
            Object.entries(newOrders).forEach(([id, orderTime]) => {
                if (now - orderTime > 8000) {
                    delete newOrders[id];
                    inventoryUpdated = true;
                    
                    updatedInv = updatedInv.map(item => {
                        if (item.id === id) {
                            const newStock = item.stock + 50; // Cafe orders smaller batches
                            newNotified[id] = { critical: false, outOfStock: false, ordering: false, expired: false, expiringSoon: false };
                            
                            notificationsToSend.push({ _trigger: 'orderArrived', itemId: item.id, itemName: item.name });
                            
                            const newBatch = `B-KDS-${Math.floor(Math.random() * 10000)}`;
                            const newExpiry = new Date();
                            newExpiry.setMonth(newExpiry.getMonth() + 3);
                            const expiryStr = item.expiryDate !== null ? newExpiry.toISOString().split('T')[0] : null;

                            const newLog = {
                                id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                                timestamp: new Date().toISOString(),
                                itemId: item.id,
                                itemName: item.name,
                                type: 'Restock',
                                qty: 50,
                                unit: item.unit || 'Units',
                                description: `Supplier delivery arrived. Replenished 50 units of ${item.name} (Batch: ${newBatch}).`
                            };
                            newLogs.push(newLog);

                            return { 
                                ...item, 
                                stock: newStock, 
                                batchNo: item.category !== 'Supplies' ? newBatch : item.batchNo, 
                                expiryDate: expiryStr, 
                                status: calculateStatus(newStock, false, expiryStr, item.minStock || 10) 
                            };
                        }
                        return item;
                    });
                }
            });
            
            if (inventoryUpdated) {
                setOrderingItems(newOrders);
                saveInventory(updatedInv);
                setNotifiedItems(newNotified);
                if (newLogs.length > 0) {
                    saveHistory([...newLogs, ...history]);
                }
                notificationsToSend.forEach((n: any) => {
                    if (n._trigger === 'orderArrived') triggerOrderArrived({ itemId: n.itemId, itemName: n.itemName });
                });
            }
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [orderingItems, inventory, notifiedItems, triggerOrderArrived, history]);

    // Simulated Real-time Usage (Sales/Prep)
    useEffect(() => {
        const timer = setTimeout(() => {
            let usageMade = false;
            const notificationsToSend: any[] = [];
            const updatedNotifiedItems = { ...notifiedItems };
            const newOrders: Record<string, number> = {};
            const newLogs: any[] = [];

            const nextInventory = inventory.map(item => {
                const isOrdering = !!orderingItems[item.id];
                
                // Random usage simulation
                if (Math.random() > 0.85 && item.stock > 0 && !usageMade && !isOrdering && item.status !== 'Expired') {
                    usageMade = true;
                    const qtyUsed = Math.floor(Math.random() * 3) + 1;
                    const newStock = Math.max(0, item.stock - qtyUsed);
                    
                    const currentTracking = updatedNotifiedItems[item.id] || { critical: false, outOfStock: false, ordering: false, expired: false, expiringSoon: false };
                    
                    let willBeOrdering: boolean = isOrdering;

                    const useLog = {
                        id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                        timestamp: new Date().toISOString(),
                        itemId: item.id,
                        itemName: item.name,
                        type: 'Deduction',
                        qty: qtyUsed,
                        unit: item.unit || 'Units',
                        description: `Simulated usage: consumed ${qtyUsed} ${item.unit || 'Units'} for cafe menu preparations.`
                    };
                    newLogs.push(useLog);
                    
                    if (newStock <= (item.minStock || 10) && !currentTracking.ordering) {
                        willBeOrdering = true;
                        newOrders[item.id] = Date.now();
                        updatedNotifiedItems[item.id] = { ...currentTracking, ordering: true };
                        notificationsToSend.push({ _trigger: 'autoOrder', itemId: item.id, itemName: item.name, stock: newStock, sku: item.sku });

                        const alertLog = {
                            id: `h_alert_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                            timestamp: new Date().toISOString(),
                            itemId: item.id,
                            itemName: item.name,
                            type: 'Alert',
                            qty: newStock,
                            unit: item.unit || 'Units',
                            description: `Stock level fell to ${newStock} ${item.unit || 'Units'} (minimum stock level: ${item.minStock || 10}). Automated restocking order placed.`
                        };
                        newLogs.push(alertLog);
                    }

                    const newStatus = calculateStatus(newStock, willBeOrdering, item.expiryDate, item.minStock || 10);
                    
                    if (newStatus === 'Out of Stock' && !currentTracking.outOfStock && !willBeOrdering) {
                        notificationsToSend.push({ _trigger: 'outOfStock', itemId: item.id, itemName: item.name, sku: item.sku });
                        updatedNotifiedItems[item.id] = { ...currentTracking, outOfStock: true };
                    } else if (newStatus === 'Critical' && !currentTracking.critical && !willBeOrdering) {
                        notificationsToSend.push({ _trigger: 'criticalStock', itemId: item.id, itemName: item.name, sku: item.sku, stock: newStock });
                        updatedNotifiedItems[item.id] = { ...currentTracking, critical: true };
                    }

                    return { ...item, stock: newStock, status: newStatus };
                }
                
                // Expiry Check
                if (item.status === 'Expired' && !updatedNotifiedItems[item.id]?.expired) {
                    updatedNotifiedItems[item.id] = { ...(updatedNotifiedItems[item.id] || {}), expired: true };
                    notificationsToSend.push({ _trigger: 'expired', itemId: item.id, itemName: item.name, batchNo: item.batchNo, expiryDate: item.expiryDate });
                } else if (item.status === 'Expiring Soon' && !updatedNotifiedItems[item.id]?.expiringSoon) {
                    updatedNotifiedItems[item.id] = { ...(updatedNotifiedItems[item.id] || {}), expiringSoon: true };
                    notificationsToSend.push({ _trigger: 'expiringSoon', itemId: item.id, itemName: item.name, batchNo: item.batchNo, expiryDate: item.expiryDate });
                }

                return item;
            });

            if (usageMade || Object.keys(newOrders).length > 0 || notificationsToSend.length > 0) {
                saveInventory(nextInventory);
                setNotifiedItems(updatedNotifiedItems);
                if (Object.keys(newOrders).length > 0) {
                    setOrderingItems(prev => ({ ...prev, ...newOrders }));
                }
                if (newLogs.length > 0) {
                    saveHistory([...newLogs, ...history]);
                }
                notificationsToSend.forEach((n: any) => {
                    if (n._trigger === 'autoOrder') triggerAutoOrder({ itemId: n.itemId, itemName: n.itemName, stock: n.stock, sku: n.sku });
                    else if (n._trigger === 'outOfStock') triggerOutOfStock({ itemId: n.itemId, itemName: n.itemName, sku: n.sku });
                    else if (n._trigger === 'criticalStock') triggerCriticalStock({ itemId: n.itemId, itemName: n.itemName, sku: n.sku, stock: n.stock });
                    else if (n._trigger === 'expired') triggerProductExpired({ itemId: n.itemId, itemName: n.itemName, batchNo: n.batchNo, expiryDate: n.expiryDate });
                    else if (n._trigger === 'expiringSoon') triggerNearExpiry({ itemId: n.itemId, itemName: n.itemName, batchNo: n.batchNo, expiryDate: n.expiryDate });
                });
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [inventory, notifiedItems, orderingItems, triggerAutoOrder, triggerOutOfStock, triggerCriticalStock, triggerProductExpired, triggerNearExpiry, history]);

    const filteredInventory = inventory.filter(p => {
        const isItemArchived = !!p.isArchived;
        if (categoryFilter === 'Archived') {
            if (!isItemArchived) return false;
        } else {
            if (isItemArchived) return false;
        }

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || p.batchNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || categoryFilter === 'Archived' || p.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const exportInventory = async (format: ExportFormat) => {
        const headers = ['Name', 'SKU', 'Category', 'Unit', 'Price', 'Stock', 'Min Stock', 'Supplier', 'Status', 'Batch No', 'MFD', 'Expiry'];
        const data = filteredInventory.map(item => [
            item.name,
            item.sku,
            item.category,
            item.unit || 'Units',
            `Rs. ${item.price}`,
            item.stock.toString(),
            (item.minStock || 10).toString(),
            item.supplierName || 'N/A',
            item.status,
            item.batchNo,
            (item as any).mfd || 'N/A',
            item.expiryDate || 'N/A'
        ]);

        await handleExport(format, {
            filename: `Cafe_Inventory_${new Date().toISOString().split('T')[0]}`,
            title: 'Cafe Smart Inventory Stock Report',
            headers,
            data,
            category: categoryFilter
        });
    };

    const handleCreateItem = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newItemName || !newItemSku || !newItemPrice || !newItemStock || !newItemUnit || !newItemMinStock || !newItemSupplierName || !newItemSupplierContact || !newItemBatchNo || !newItemMfd) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const priceNum = parseFloat(newItemPrice);
        const stockNum = parseInt(newItemStock);
        const minStockNum = parseInt(newItemMinStock);

        if (isNaN(priceNum) || priceNum < 0) {
            toast.error('Price must be a positive number.');
            return;
        }
        if (isNaN(stockNum) || stockNum < 0) {
            toast.error('Stock Quantity must be a positive integer.');
            return;
        }
        if (isNaN(minStockNum) || minStockNum < 0) {
            toast.error('Minimum Stock Level must be a positive integer.');
            return;
        }

        const itemExpiry = newItemExpiryDate || null;
        const itemId = `inv_${Date.now()}`;
        const computedStatus = calculateStatus(stockNum, false, itemExpiry, minStockNum);

        const newItem = {
            id: itemId,
            name: newItemName,
            sku: newItemSku.toUpperCase(),
            category: newItemCategory,
            price: priceNum,
            stock: stockNum,
            unit: newItemUnit,
            minStock: minStockNum,
            supplierName: newItemSupplierName,
            supplierContact: newItemSupplierContact,
            batchNo: newItemBatchNo,
            mfd: newItemMfd,
            expiryDate: itemExpiry,
            status: computedStatus,
            isArchived: false
        };

        const updatedInv = [newItem, ...inventory];
        saveInventory(updatedInv);

        // Add history log
        const newLog = {
            id: `h_${Date.now()}`,
            timestamp: new Date().toISOString(),
            itemId: itemId,
            itemName: newItemName,
            type: 'Restock',
            qty: stockNum,
            unit: newItemUnit,
            description: `Registered new inventory item: ${newItemName} with ${stockNum} ${newItemUnit} initial stock (Batch: ${newItemBatchNo}).`
        };

        const updatedHist = [newLog, ...history];
        saveHistory(updatedHist);

        toast.success(`Inventory item "${newItemName}" registered successfully.`);
        setIsAddOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewItemName('');
        setNewItemCategory('Ingredients');
        setNewItemSku('');
        setNewItemStock('20');
        setNewItemUnit('Units');
        setNewItemMinStock('10');
        setNewItemSupplierName('');
        setNewItemSupplierContact('');
        setNewItemPrice('');
        setNewItemBatchNo('');
        setNewItemMfd(new Date().toISOString().split('T')[0]);
        setNewItemExpiryDate('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Active</Badge>;
            case 'Low Stock': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Low Stock</Badge>;
            case 'Critical': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse px-3 py-1 text-[10px] font-black uppercase tracking-widest">Critical</Badge>;
            case 'Ordering...': return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest"><Truck className="w-3 h-3 animate-bounce" /> Ordering</Badge>;
            case 'Out of Stock': return <Badge className="bg-slate-800 text-slate-400 border-slate-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Out of Stock</Badge>;
            case 'Expiring Soon': return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest"><CalendarClock className="w-3 h-3" /> Expiring</Badge>;
            case 'Expired': return <Badge className="bg-rose-900/50 text-rose-200 border-rose-500/50 flex items-center gap-1.5 opacity-80 px-3 py-1 text-[10px] font-black uppercase tracking-widest"><CalendarX2 className="w-3 h-3" /> Expired</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Ingredients': return <ChefHat className="w-4 h-4 text-emerald-400" />;
            case 'Beverages': return <Coffee className="w-4 h-4 text-cyan-400" />;
            case 'Snacks': return <ShoppingBag className="w-4 h-4 text-indigo-400" />;
            case 'Supplies': return <Utensils className="w-4 h-4 text-amber-400" />;
            default: return <Package className="w-4 h-4 text-slate-400" />;
        }
    };

    const StockLevelIndicator = ({ stock, category }: { stock: number, category: string }) => {
        const maxStock = category === 'Supplies' ? 1000 : 100; 
        const percentage = Math.min((stock / maxStock) * 100, 100);
        const colorClass = stock === 0 ? 'bg-slate-700' : stock <= 5 ? 'bg-rose-500' : stock <= 20 ? 'bg-amber-500' : 'bg-emerald-500';

        return (
            <div className="flex flex-col gap-1.5 w-full max-w-[120px] ml-auto">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Stock</span>
                    <span className={stock === 0 ? 'text-slate-500' : `text-${colorClass.split('-')[1]}-400`}>{stock} {category === 'Supplies' ? '' : 'Units'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full ${colorClass} rounded-full shadow-glow-sm`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Kitchen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 not-italic">Stock</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide text-xs uppercase flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-500" />
                        Automated kitchen inventory, expiry tracking & replenishment
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setIsBulkMode(!isBulkMode);
                            setSelectedItemIds([]);
                        }}
                        className={`border-white/10 uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl transition-all ${
                            isBulkMode 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:text-emerald-400' 
                            : 'text-white bg-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Settings className="w-4 h-4 mr-2 text-emerald-400" /> 
                        {isBulkMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => setIsAuditLogOpen(true)}
                        className="border-white/10 text-white bg-white/5 uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                        Audit Logs
                    </Button>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white hover:text-white bg-transparent h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                        <Droplets className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                        Freshness Audit
                    </Button>
                    <ExportButton onExport={exportInventory} />
                    <Button onClick={() => setIsAddOpen(true)} className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-lg shadow-emerald-900/20 border-0 h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        New Item
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 shadow-2xl flex flex-col h-[750px] overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-white/5 pb-6 bg-black/20 space-y-6">
                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = categoryFilter === cat.name;
                                return (
                                    <button
                                        key={cat.name}
                                        onClick={() => setCategoryFilter(cat.name)}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                            isActive 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-glow-sm' 
                                            : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10 hover:text-slate-300'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-500 bg-black/40 px-4 py-2 rounded-xl border border-white/5 tracking-[0.1em]">
                                <CalendarClock className="w-3 h-3 text-orange-500" />
                                Kitchen Safety On
                            </div>
                            <div className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-500 bg-black/40 px-4 py-2 rounded-xl border border-white/5 tracking-[0.1em]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Replenishment Auto
                            </div>
                        </div>
                    </div>

                    {/* Search & Status Controls */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input 
                                placeholder="Search ingredients, SKUs, or batch numbers..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-black/40 border-white/5 text-white w-full focus:border-emerald-500/50 h-12 rounded-2xl text-xs font-medium placeholder:text-slate-600"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[220px] h-12 bg-black/40 border-white/5 text-white focus:ring-emerald-500/50 rounded-2xl text-xs font-bold uppercase tracking-widest">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl shadow-2xl">
                                <SelectItem value="All" className="text-[10px] font-bold uppercase">All Statuses</SelectItem>
                                <SelectItem value="In Stock" className="text-[10px] font-bold uppercase text-emerald-400">In Stock</SelectItem>
                                <SelectItem value="Low Stock" className="text-[10px] font-bold uppercase text-amber-400">Low Stock</SelectItem>
                                <SelectItem value="Critical" className="text-[10px] font-bold uppercase text-rose-400">Critical</SelectItem>
                                <SelectItem value="Ordering..." className="text-[10px] font-bold uppercase text-indigo-400">Ordering</SelectItem>
                                <SelectItem value="Expiring Soon" className="text-[10px] font-bold uppercase text-orange-400">Expiring Soon</SelectItem>
                                <SelectItem value="Expired" className="text-[10px] font-bold uppercase text-rose-500">Expired</SelectItem>
                                <SelectItem value="Out of Stock" className="text-[10px] font-bold uppercase">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                
                {/* Switcher Tab Headers */}
                <div className="flex border-b border-white/5 bg-black/10 px-8">
                    <button 
                        onClick={() => setActiveTab('ledger')}
                        className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 px-4 transition-all flex items-center gap-2 ${
                            activeTab === 'ledger' 
                            ? 'border-emerald-500 text-emerald-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4" /> Stock Ledger
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 px-4 transition-all flex items-center gap-2 ${
                            activeTab === 'history' 
                            ? 'border-emerald-500 text-emerald-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <History className="w-4 h-4" /> Activity History Log
                    </button>
                </div>

                <CardContent className="p-0 overflow-auto custom-scrollbar flex-1 relative">
                    {activeTab === 'ledger' ? (
                        <>
                            <Table>
                                <TableHeader className="bg-black/60 sticky top-0 z-10 backdrop-blur-xl">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        {isBulkMode && (
                                            <TableHead className="w-[50px] pl-8 h-14">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedItemIds.length > 0 && selectedItemIds.length === filteredInventory.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItemIds(filteredInventory.map(item => item.id));
                                                        } else {
                                                            setSelectedItemIds([]);
                                                        }
                                                    }}
                                                    className="rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/50 w-4 h-4 cursor-pointer accent-emerald-500"
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 ${isBulkMode ? 'pl-4' : 'pl-8'}`}>Ingredient / Supply</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14">Cost (Unit)</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 text-center">Batch, MFD & Expiry</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 text-center">Status</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-14 text-right pr-12">Stock Level</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredInventory.map((item) => (
                                            <motion.tr 
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={() => {
                                                    if (isBulkMode) {
                                                        if (selectedItemIds.includes(item.id)) {
                                                            setSelectedItemIds(selectedItemIds.filter(id => id !== item.id));
                                                        } else {
                                                            setSelectedItemIds([...selectedItemIds, item.id]);
                                                        }
                                                    }
                                                }}
                                                className={`border-b border-white/5 hover:bg-white/[0.02] transition-all group ${item.status === 'Expired' ? 'opacity-40 grayscale' : ''} ${isBulkMode ? 'cursor-pointer' : ''}`}
                                            >
                                                {isBulkMode && (
                                                    <TableCell className="py-5 pl-8" onClick={(e) => e.stopPropagation()}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedItemIds.includes(item.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedItemIds([...selectedItemIds, item.id]);
                                                                } else {
                                                                    setSelectedItemIds(selectedItemIds.filter(id => id !== item.id));
                                                                }
                                                            }}
                                                            className="rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/50 w-4 h-4 cursor-pointer accent-emerald-500"
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell className={`py-5 ${isBulkMode ? 'pl-4' : 'pl-8'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-all group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30">
                                                            {getCategoryIcon(item.category)}
                                                        </div>
                                                        <div className="flex min-w-0 flex-col">
                                                            <span className={`text-sm font-black text-white truncate group-hover:text-emerald-400 transition-colors tracking-tight ${item.status === 'Expired' ? 'line-through text-slate-500' : ''}`}>
                                                                {item.name}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] font-mono font-bold text-slate-600 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.sku}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{item.category} ({item.unit || 'Units'})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-white italic tracking-tighter">₹{item.price.toLocaleString()}</span>
                                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Base Cost</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex flex-col items-center justify-center bg-black/30 rounded-2xl p-2.5 border border-white/5 group-hover:border-white/10 transition-all">
                                                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg shadow-inner tracking-tighter">{item.batchNo}</span>
                                                        <div className="flex flex-col items-center gap-0.5 mt-2">
                                                            {(item as any).mfd && (
                                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">MFD: {(item as any).mfd}</span>
                                                            )}
                                                            {item.expiryDate ? (
                                                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${item.status === 'Expired' ? 'text-rose-500' : item.status === 'Expiring Soon' ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`}>
                                                                    {item.status === 'Expired' ? 'Spoiled: ' : 'EXP: '}{item.expiryDate}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] text-slate-700 font-black uppercase tracking-[0.1em]">Non-Perishable</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 text-center">
                                                    <div className="flex justify-center">
                                                        {getStatusBadge(item.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 pr-12">
                                                    <StockLevelIndicator stock={item.stock} category={item.category} />
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                            
                            {filteredInventory.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-24 h-24 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6"
                                    >
                                        <Package className="w-10 h-10 text-slate-700" />
                                    </motion.div>
                                    <p className="text-xl font-black text-white italic uppercase tracking-widest mb-1">Stock Not Found</p>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Adjust filters or search for another ingredient</p>
                                    <Button 
                                        variant="link" 
                                        onClick={() => {setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('All');}}
                                        className="mt-4 text-emerald-500 font-black uppercase tracking-widest text-[10px]"
                                    >
                                        Reset All Filters
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <History className="w-4 h-4 text-emerald-400" /> Chronological Inventory Transactions
                                </h3>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{history.length} operations logged</span>
                            </div>
                            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/20">
                                <Table>
                                    <TableHeader className="bg-black/40">
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-12 pl-6 w-44">Time</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-12 w-64">Item</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-12 w-32 text-center">Type</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-12 w-28 text-right">Quantity</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 h-12 pl-6">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((log) => {
                                            let typeBadge;
                                            switch (log.type) {
                                                case 'Restock':
                                                    typeBadge = <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Stock In</Badge>;
                                                    break;
                                                case 'Deduction':
                                                    typeBadge = <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Stock Out</Badge>;
                                                    break;
                                                case 'Alert':
                                                    typeBadge = <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">System Alert</Badge>;
                                                    break;
                                                case 'Waste':
                                                    typeBadge = <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Waste</Badge>;
                                                    break;
                                                default:
                                                    typeBadge = <Badge className="bg-slate-800 text-slate-400 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">{log.type}</Badge>;
                                            }

                                            return (
                                                <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.01]">
                                                    <TableCell className="py-4 pl-6 text-[11px] font-mono text-slate-500">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="py-4 font-bold text-white text-xs uppercase tracking-tight">
                                                        {log.itemName}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        {typeBadge}
                                                    </TableCell>
                                                    <TableCell className={`py-4 text-right font-mono font-bold text-xs ${log.type === 'Restock' ? 'text-emerald-400' : log.type === 'Deduction' ? 'text-slate-300' : 'text-slate-500'}`}>
                                                        {log.type === 'Restock' ? '+' : log.type === 'Deduction' ? '-' : ''}{log.qty} {log.unit}
                                                    </TableCell>
                                                    <TableCell className="py-4 pl-6 text-xs text-slate-400">
                                                        {log.description}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {history.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-xs text-slate-600 font-bold uppercase tracking-wider">
                                                    No activity logged yet
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <QuickStatCard title="Total Value" value="₹1.8L" icon={ShoppingBag} color="emerald" />
                <QuickStatCard title="Low Stock Items" value={inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length.toString()} icon={Zap} color="rose" />
                <QuickStatCard title="Active Orders" value={Object.keys(orderingItems).length.toString()} icon={Truck} color="indigo" />
                <QuickStatCard title="Safety Score" value="96%" icon={CheckCircle2} color="cyan" />
            </div>

            {/* Add New Inventory Item Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-4xl bg-slate-950 border border-white/10 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <form onSubmit={handleCreateItem} className="flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 bg-black/20">
                            <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-2">
                                <Plus className="w-6 h-6 text-emerald-400" /> Add New Inventory Item
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-wider">
                                Register a new raw ingredient, beverage base, snack stock, or supply batch
                            </DialogDescription>
                        </div>

                        {/* Form Content */}
                        <div className="p-8 space-y-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:space-y-0">
                            {/* Left Column: Core Fields */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Package className="w-4 h-4 text-emerald-400" /> Stock Profile
                                </h4>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Item Name *</label>
                                    <Input 
                                        placeholder="e.g. Organic Oat Milk" 
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['Ingredients', 'Beverages', 'Snacks', 'Supplies'] as const).map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewItemCategory(cat)}
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    newItemCategory === cat
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-glow-sm'
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
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SKU / Item Code *</label>
                                        <Input 
                                            placeholder="e.g. CF-MILK-05" 
                                            value={newItemSku}
                                            onChange={(e) => setNewItemSku(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unit of Measurement *</label>
                                        <Input 
                                            placeholder="e.g. Liters, Grams, Units" 
                                            value={newItemUnit}
                                            onChange={(e) => setNewItemUnit(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Stock *</label>
                                        <Input 
                                            type="number" 
                                            placeholder="e.g. 24" 
                                            value={newItemStock}
                                            onChange={(e) => setNewItemStock(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Min Stock Level *</label>
                                        <Input 
                                            type="number" 
                                            placeholder="e.g. 10" 
                                            value={newItemMinStock}
                                            onChange={(e) => setNewItemMinStock(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Pricing, Batch, Expiry & Supplier */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Truck className="w-4 h-4 text-emerald-400" /> Procurement & Expiry
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Purchase Price (INR) *</label>
                                        <Input 
                                            type="number" 
                                            placeholder="e.g. 350" 
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Batch Number *</label>
                                        <Input 
                                            placeholder="e.g. B-OAT-99" 
                                            value={newItemBatchNo}
                                            onChange={(e) => setNewItemBatchNo(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">MFD *</label>
                                        <Input 
                                            type="date" 
                                            value={newItemMfd}
                                            onChange={(e) => setNewItemMfd(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Expiry Date</label>
                                        <Input 
                                            type="date" 
                                            value={newItemExpiryDate}
                                            onChange={(e) => setNewItemExpiryDate(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Supplier Name *</label>
                                    <Input 
                                        placeholder="e.g. Viking Wholesalers Ltd" 
                                        value={newItemSupplierName}
                                        onChange={(e) => setNewItemSupplierName(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Supplier Contact Info *</label>
                                    <Input 
                                        placeholder="e.g. orders@vikingwholesalers.com or +91 98765 43210" 
                                        value={newItemSupplierContact}
                                        onChange={(e) => setNewItemSupplierContact(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-12 rounded-2xl pl-4 font-bold focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
                                Required fields are marked with *
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => { setIsAddOpen(false); resetForm(); }}
                                    className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-emerald-900/20 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl active:scale-95 transition-all"
                                >
                                    Register Stock Item
                                </Button>
                            </div>
                        </div>
                                    </form>
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
                            {selectedItemIds.length} of {filteredInventory.length} items selected
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (selectedItemIds.length === filteredInventory.length) {
                                    setSelectedItemIds([]);
                                } else {
                                    setSelectedItemIds(filteredInventory.map(item => item.id));
                                }
                            }}
                            className="border-white/10 text-white hover:bg-white/5 hover:text-white text-[9px] uppercase font-black tracking-wider px-3 h-9 rounded-xl"
                        >
                            {selectedItemIds.length === filteredInventory.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        
                        {(['price', 'category', 'stock', 'minStock', 'supplierName', 'supplierContact', 'expiryDate', 'batchNo', 'mfd'] as const).map(field => {
                            const labels: Record<string, string> = {
                                price: 'Update Price',
                                category: 'Change Category',
                                stock: 'Set Stock',
                                minStock: 'Set Min Stock',
                                supplierName: 'Supplier Name',
                                supplierContact: 'Supplier Contact',
                                expiryDate: 'Expiry Date',
                                batchNo: 'Batch Number',
                                mfd: 'MFD'
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
                            <Settings className="w-5 h-5 text-emerald-400" /> Apply Bulk Modification
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Define the value to apply to the {selectedItemIds.length} selected items
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 my-6">
                        {bulkActionField === 'price' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Purchase Price (e.g. 500, +10%, -50)</label>
                                <Input 
                                    placeholder="e.g. 500 or +10% or -50"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
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
                                        <SelectItem value="Ingredients" className="text-[10px] font-bold uppercase">Ingredients</SelectItem>
                                        <SelectItem value="Beverages" className="text-[10px] font-bold uppercase">Beverages</SelectItem>
                                        <SelectItem value="Snacks" className="text-[10px] font-bold uppercase">Snacks</SelectItem>
                                        <SelectItem value="Supplies" className="text-[10px] font-bold uppercase">Supplies</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {bulkActionField === 'stock' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Stock Quantity (e.g. 50, +10, -5)</label>
                                <Input 
                                    placeholder="e.g. 50 or +10 or -5"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                            </div>
                        )}
                        {bulkActionField === 'minStock' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Minimum Stock Level (e.g. 10, +5, -2)</label>
                                <Input 
                                    placeholder="e.g. 10 or +5 or -2"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                            </div>
                        )}
                        {bulkActionField === 'supplierName' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Supplier Name</label>
                                <Input 
                                    placeholder="e.g. Valhalla Dairy"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                            </div>
                        )}
                        {bulkActionField === 'supplierContact' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Supplier Contact Info</label>
                                <Input 
                                    placeholder="e.g. supply@valhalla.com or +91 98765 00000"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                            </div>
                        )}
                        {bulkActionField === 'expiryDate' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Expiry Date (Use 'null' for non-perishables)</label>
                                <Input 
                                    type="text" 
                                    placeholder="e.g. 2026-12-31 or 'null'"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                                <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase">OR SELECT A DATE BELOW:</span>
                                <Input 
                                    type="date"
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                            </div>
                        )}
                        {bulkActionField === 'batchNo' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Batch Number</label>
                                <Input 
                                    placeholder="e.g. B-OAT-99"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold font-mono"
                                />
                            </div>
                        )}
                        {bulkActionField === 'mfd' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">New Manufacturing Date (YYYY-MM-DD)</label>
                                <Input 
                                    type="text"
                                    placeholder="e.g. 2024-10-24"
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
                                <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase">OR SELECT A DATE:</span>
                                <Input 
                                    type="date"
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white rounded-xl h-11 text-xs font-bold"
                                />
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
                            className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest h-11 rounded-xl px-8"
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
                            <AlertCircle className="w-5 h-5 text-emerald-400" /> Confirm Bulk Action
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
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest h-11 rounded-xl px-8"
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
                            <ClipboardList className="w-5 h-5 text-emerald-400" /> Bulk Action Audit History
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
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
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

function QuickStatCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    };
    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl p-5 rounded-3xl group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    <Icon className="w-5 h-5 shadow-glow-sm" />
                </div>
            </div>
        </Card>
    );
}
