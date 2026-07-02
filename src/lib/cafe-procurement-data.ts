// ─── Types ────────────────────────────────────────────────────────────────────

export type CafePOStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Delivered' | 'Cancelled';
export type CafePaymentTerms = 'Advance' | 'Net-15' | 'Net-30' | 'COD';
export type CafeSupplierCategory = 'Dairy' | 'Coffee & Tea' | 'Dry Goods' | 'Perishables' | 'Packaging';
export type CafeUnit = 'Liters' | 'ml' | 'Grams' | 'kg' | 'Units';

export interface CafeSupplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    city: string;
    category: CafeSupplierCategory;
    rating: number;
    totalOrders: number;
    totalSpend: number;
    leadTimeDays: number;
    paymentTerms: CafePaymentTerms;
    isPreferred: boolean;
    joinedDate: string;
    gstNumber: string;
}

export interface CafePOItem {
    id: string;
    name: string;
    sku: string;
    category: string;
    qty: number;
    unit: CafeUnit;
    costPrice: number;
    mfd?: string;
    expiryDate?: string;
}

export interface CafePurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    date: string;
    expectedDelivery: string;
    receivedDate?: string;
    status: CafePOStatus;
    items: CafePOItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const CAFE_SUPPLIERS: CafeSupplier[] = [
    {
        id: 'cs-001', name: 'Alpine Dairy Farms', contactPerson: 'Suresh Kumar',
        email: 'sales@alpinedairy.in', phone: '+91 98111 22334', city: 'Pune',
        category: 'Dairy', rating: 4.9, totalOrders: 42, totalSpend: 85400,
        leadTimeDays: 1, paymentTerms: 'COD', isPreferred: true, joinedDate: '2023-01-10',
        gstNumber: '27AABCD1122E1Z2',
    },
    {
        id: 'cs-002', name: 'Highland Coffee Roasters', contactPerson: 'Anita Rao',
        email: 'bulk@highlandcoffee.in', phone: '+91 98222 33445', city: 'Chikmagalur',
        category: 'Coffee & Tea', rating: 4.7, totalOrders: 15, totalSpend: 125000,
        leadTimeDays: 4, paymentTerms: 'Net-15', isPreferred: true, joinedDate: '2023-03-15',
        gstNumber: '29AABCH2233F1Z3',
    },
    {
        id: 'cs-003', name: 'Kitchen Masters Supply', contactPerson: 'Vikram Singh',
        email: 'orders@kitchenmasters.in', phone: '+91 98333 44556', city: 'Mumbai',
        category: 'Dry Goods', rating: 4.2, totalOrders: 28, totalSpend: 42000,
        leadTimeDays: 3, paymentTerms: 'Net-30', isPreferred: false, joinedDate: '2023-06-20',
        gstNumber: '27AABCJ3344G1Z4',
    },
    {
        id: 'cs-004', name: 'EcoPack Solutions', contactPerson: 'Priya Verma',
        email: 'sales@ecopack.in', phone: '+91 98444 55667', city: 'Delhi',
        category: 'Packaging', rating: 4.5, totalOrders: 12, totalSpend: 18500,
        leadTimeDays: 5, paymentTerms: 'Advance', isPreferred: true, joinedDate: '2023-08-05',
        gstNumber: '07AABCE4455H1Z5',
    },
];

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const INITIAL_CAFE_POS: CafePurchaseOrder[] = [
    {
        id: 'CPO-2024-001', supplierId: 'cs-001', supplierName: 'Alpine Dairy Farms',
        date: '2024-10-24', expectedDelivery: '2024-10-25', receivedDate: '2024-10-25',
        status: 'Delivered', notes: 'Urgent milk restock for peak weekend.',
        items: [
            { id: '1', name: 'Full Cream Milk', sku: 'CF-MLK-01', category: 'Dairy', qty: 20, unit: 'Liters', costPrice: 65, mfd: '2024-10-24', expiryDate: '2024-10-31' },
            { id: '2', name: 'Almond Milk (Unsweetened)', sku: 'CF-MLK-02', category: 'Dairy', qty: 12, unit: 'Liters', costPrice: 280, mfd: '2024-10-20', expiryDate: '2024-11-20' },
        ],
        subtotal: 4660, tax: 233, total: 4893,
    },
    {
        id: 'CPO-2024-002', supplierId: 'cs-002', supplierName: 'Highland Coffee Roasters',
        date: '2024-10-20', expectedDelivery: '2024-10-24', receivedDate: '2024-10-24',
        status: 'Delivered', notes: 'Monthly bean restock.',
        items: [
            { id: '3', name: 'Viking Blend Beans', sku: 'CF-BN-01', category: 'Coffee & Tea', qty: 10, unit: 'kg', costPrice: 1450, mfd: '2024-10-01', expiryDate: '2025-04-01' },
            { id: '4', name: 'Ethiopian Single Origin', sku: 'CF-BN-02', category: 'Coffee & Tea', qty: 5, unit: 'kg', costPrice: 1850, mfd: '2024-09-20', expiryDate: '2025-03-20' },
        ],
        subtotal: 23750, tax: 1188, total: 24938,
    },
    {
        id: 'CPO-2024-003', supplierId: 'cs-003', supplierName: 'Kitchen Masters Supply',
        date: '2024-10-22', expectedDelivery: '2024-10-25',
        status: 'Confirmed', notes: 'Dry goods and syrups.',
        items: [
            { id: '5', name: 'Vanilla Syrup', sku: 'CF-SYP-01', category: 'Dry Goods', qty: 6, unit: 'ml', costPrice: 450 },
            { id: '6', name: 'Organic Brown Sugar', sku: 'CF-SGR-01', category: 'Dry Goods', qty: 5, unit: 'kg', costPrice: 120 },
        ],
        subtotal: 3300, tax: 165, total: 3465,
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCafePOStatusConfig(status: CafePOStatus) {
    const map: Record<CafePOStatus, { color: string; bg: string; border: string; dot: string }> = {
        Draft:     { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   dot: 'bg-slate-400' },
        Sent:      { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    dot: 'bg-cyan-400' },
        Confirmed: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
        Delivered: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
        Cancelled: { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    dot: 'bg-rose-400' },
    };
    return map[status];
}
