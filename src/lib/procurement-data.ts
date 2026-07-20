// ─── Types ────────────────────────────────────────────────────────────────────

export type POStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Delivered' | 'Cancelled';
export type PaymentTerms = 'Advance' | 'Net-15' | 'Net-30' | 'COD';
export type SupplierCategory = 'Supplements' | 'Equipment' | 'Apparel' | 'Accessories';

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    city: string;
    category: SupplierCategory;
    rating: number;
    totalOrders: number;
    totalSpend: number;
    leadTimeDays: number;
    paymentTerms: PaymentTerms;
    isPreferred: boolean;
    joinedDate: string;
    gstNumber: string;
}

export interface POItem {
    productId: string;
    productName: string;
    sku: string;
    category: string;
    qty: number;
    costPrice: number;
    sellingPrice: number;
    mfd?: string;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    date: string;
    expectedDelivery: string;
    receivedDate?: string;
    status: POStatus;
    items: POItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calcMargin(cost: number, sell: number): number {
    if (sell === 0) return 0;
    return Math.round(((sell - cost) / sell) * 100);
}

export function getPOStatusConfig(status: POStatus) {
    const map: Record<POStatus, { color: string; bg: string; border: string; dot: string }> = {
        Draft:     { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   dot: 'bg-slate-400' },
        Sent:      { color: 'text-blue-400',     bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-400' },
        Confirmed: { color: 'text-amber-400',    bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
        Delivered: { color: 'text-emerald-400',  bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
        Cancelled: { color: 'text-rose-400',     bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    dot: 'bg-rose-400' },
    };
    return map[status];
}

export function calcPOSubtotal(items: POItem[]): number {
    return items.reduce((s, i) => s + i.costPrice * i.qty, 0);
}

export function calcTotalCOGS(orders: PurchaseOrder[]): number {
    return orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
}

export function calcGrossProfit(revenue: number, cogs: number): number {
    return revenue - cogs;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const SUPPLIERS: Supplier[] = [
    {
        id: 's-001', name: 'NutriCore Distributors', contactPerson: 'Rajesh Mehta',
        email: 'orders@nutricore.in', phone: '+91 98001 11001', city: 'Mumbai',
        category: 'Supplements', rating: 4.8, totalOrders: 24, totalSpend: 487500,
        leadTimeDays: 3, paymentTerms: 'Net-30', isPreferred: true, joinedDate: '2022-06-01',
        gstNumber: '27AABCN1234A1Z5',
    },
    {
        id: 's-002', name: 'IronForge Equipment Co.', contactPerson: 'Sunita Rao',
        email: 'supply@ironforge.in', phone: '+91 98001 11002', city: 'Pune',
        category: 'Equipment', rating: 4.5, totalOrders: 12, totalSpend: 312000,
        leadTimeDays: 7, paymentTerms: 'Net-15', isPreferred: true, joinedDate: '2022-09-15',
        gstNumber: '27AABCI5678B1Z3',
    },
    {
        id: 's-003', name: 'ActiveWear Wholesale', contactPerson: 'Priya Kapoor',
        email: 'bulk@activewear.in', phone: '+91 98001 11003', city: 'Delhi',
        category: 'Apparel', rating: 4.2, totalOrders: 18, totalSpend: 198000,
        leadTimeDays: 5, paymentTerms: 'Advance', isPreferred: false, joinedDate: '2023-01-10',
        gstNumber: '07AABCA9012C1Z1',
    },

    {
        id: 's-005', name: 'GripTech Accessories', contactPerson: 'Vikram Nair',
        email: 'sales@griptech.in', phone: '+91 98001 11005', city: 'Chennai',
        category: 'Accessories', rating: 3.9, totalOrders: 9, totalSpend: 67500,
        leadTimeDays: 4, paymentTerms: 'Net-30', isPreferred: false, joinedDate: '2023-08-05',
        gstNumber: '33AABCG7890E1Z7',
    },
    {
        id: 's-006', name: 'ProSport Bulk Supply', contactPerson: 'Neha Joshi',
        email: 'orders@prosport.in', phone: '+91 98001 11006', city: 'Hyderabad',
        category: 'Supplements', rating: 4.1, totalOrders: 15, totalSpend: 234000,
        leadTimeDays: 5, paymentTerms: 'Net-15', isPreferred: false, joinedDate: '2023-02-28',
        gstNumber: '36AABCP2345F1Z2',
    },
];

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: 'PO-2024-001', supplierId: 's-001', supplierName: 'NutriCore Distributors',
        date: '2024-10-20', expectedDelivery: '2024-10-23', receivedDate: '2024-10-23',
        status: 'Delivered', notes: 'Monthly supplement restock.',
        items: [
            { productId: '1', productName: 'Flex Whey Isolate', sku: 'NX-WHEY-01', category: 'Supplements', qty: 50, costPrice: 2800, sellingPrice: 4199, mfd: '2024-10-01' },
            { productId: '2', productName: 'Titan Pre-Workout', sku: 'NX-PRE-02', category: 'Supplements', qty: 24, costPrice: 2100, sellingPrice: 3299, mfd: '2024-09-15' },
        ],
        subtotal: 245000, tax: 44100, total: 289100,
    },
    {
        id: 'PO-2024-002', supplierId: 's-001', supplierName: 'NutriCore Distributors',
        date: '2024-10-15', expectedDelivery: '2024-10-18', receivedDate: '2024-10-19',
        status: 'Delivered', notes: 'Pre-workout batch restock.',
        items: [
            { productId: '2', productName: 'Titan Pre-Workout', sku: 'NX-PRE-02', category: 'Supplements', qty: 40, costPrice: 2100, sellingPrice: 3299 },
            { productId: '3', productName: 'Zenith BCAA Recovery', sku: 'NX-BCAA-03', category: 'Supplements', qty: 60, costPrice: 1600, sellingPrice: 2499 },
        ],
        subtotal: 180000, tax: 32400, total: 212400,
    },
    {
        id: 'PO-2024-003', supplierId: 's-002', supplierName: 'IronForge Equipment Co.',
        date: '2024-10-18', expectedDelivery: '2024-10-25', receivedDate: '2024-10-26',
        status: 'Delivered', notes: 'Equipment restock for high-demand items.',
        items: [
            { productId: '4', productName: 'Pro Powerlifting Belt', sku: 'GR-BELT-01', category: 'Equipment', qty: 20, costPrice: 4800, sellingPrice: 7499 },
            { productId: '8', productName: 'Lifting Straps', sku: 'GR-STRAP-03', category: 'Equipment', qty: 50, costPrice: 550, sellingPrice: 999 },
        ],
        subtotal: 123500, tax: 22230, total: 145730,
    },
    {
        id: 'PO-2024-004', supplierId: 's-003', supplierName: 'ActiveWear Wholesale',
        date: '2024-10-22', expectedDelivery: '2024-10-27',
        status: 'Confirmed', notes: 'New apparel season collection.',
        items: [
            { productId: '5', productName: 'Flex Compression Tee', sku: 'AP-TEE-01', category: 'Apparel', qty: 100, costPrice: 1400, sellingPrice: 2999 },
        ],
        subtotal: 140000, tax: 25200, total: 165200,
    },

    {
        id: 'PO-2024-006', supplierId: 's-006', supplierName: 'ProSport Bulk Supply',
        date: '2024-10-24', expectedDelivery: '2024-10-29',
        status: 'Draft', notes: 'Pending manager approval.',
        items: [
            { productId: '1', productName: 'Flex Whey Isolate', sku: 'NX-WHEY-01', category: 'Supplements', qty: 30, costPrice: 2900, sellingPrice: 4199 },
        ],
        subtotal: 87000, tax: 15660, total: 102660,
    },
    {
        id: 'PO-2024-007', supplierId: 's-005', supplierName: 'GripTech Accessories',
        date: '2024-10-10', expectedDelivery: '2024-10-14',
        status: 'Cancelled', notes: 'Vendor unable to fulfil order — cancelled.',
        items: [
            { productId: '6', productName: 'Elite Wrist Wraps', sku: 'GR-WRAP-02', category: 'Accessories', qty: 40, costPrice: 900, sellingPrice: 1699 },
        ],
        subtotal: 36000, tax: 6480, total: 42480,
    },
];
