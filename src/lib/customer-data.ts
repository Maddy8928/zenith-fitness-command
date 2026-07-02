// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Wallet';
export type PurchaseStatus = 'Paid' | 'Pending' | 'Refunded';
export type Department = 'Store' | 'Cafe';
export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface PurchaseItem {
    name: string;
    qty: number;
    price: number;
    category: string;
}

export interface Purchase {
    invoiceId: string;
    date: string;         // ISO string
    items: PurchaseItem[];
    total: number;
    paymentMethod: PaymentMethod;
    department: Department;
    status: PurchaseStatus;
    pointsEarned: number;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberId: string;
    avatar: string;       // initials
    joinDate: string;
    purchases: Purchase[];
}

// ─── Tier Logic ───────────────────────────────────────────────────────────────

export const TIER_CONFIG: Record<LoyaltyTier, { min: number; max: number; rate: number; color: string; bg: string; border: string; next: LoyaltyTier | null }> = {
    Bronze:   { min: 0,      max: 9999,  rate: 1, color: 'text-amber-600',   bg: 'bg-amber-600/10',   border: 'border-amber-600/20',   next: 'Silver'   },
    Silver:   { min: 10000,  max: 24999, rate: 2, color: 'text-slate-300',   bg: 'bg-slate-300/10',   border: 'border-slate-300/20',   next: 'Gold'     },
    Gold:     { min: 25000,  max: 49999, rate: 3, color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/20',  next: 'Platinum' },
    Platinum: { min: 50000,  max: Infinity, rate: 5, color: 'text-indigo-300', bg: 'bg-indigo-300/10', border: 'border-indigo-300/20', next: null       },
};

export function getLifetimeSpend(customer: Customer): number {
    return customer.purchases
        .filter(p => p.status !== 'Refunded')
        .reduce((sum, p) => sum + p.total, 0);
}

export function getLoyaltyTier(spend: number): LoyaltyTier {
    if (spend >= 50000) return 'Platinum';
    if (spend >= 25000) return 'Gold';
    if (spend >= 10000) return 'Silver';
    return 'Bronze';
}

export function calcLoyaltyPoints(customer: Customer): number {
    return customer.purchases
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + p.pointsEarned, 0);
}

export function getTierProgress(spend: number): { tier: LoyaltyTier; pct: number; remaining: number } {
    const tier = getLoyaltyTier(spend);
    const cfg = TIER_CONFIG[tier];
    if (!cfg.next) return { tier, pct: 100, remaining: 0 };
    const range = cfg.max - cfg.min + 1;
    const progress = spend - cfg.min;
    const pct = Math.min(100, Math.round((progress / range) * 100));
    const remaining = cfg.max + 1 - spend;
    return { tier, pct, remaining };
}

export function getMonthlySpend(customer: Customer): { month: string; spend: number }[] {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        months[key] = 0;
    }
    customer.purchases
        .filter(p => p.status !== 'Refunded')
        .forEach(p => {
            const d = new Date(p.date);
            const key = d.toLocaleString('default', { month: 'short' });
            if (key in months) months[key] += p.total;
        });
    return Object.entries(months).map(([month, spend]) => ({ month, spend }));
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
    {
        id: 'c-001', name: 'Alex Thompson', email: 'alex@example.com',
        phone: '+91 98765 43210', memberId: 'MEM-1001', avatar: 'AT', joinDate: '2023-01-15',
        purchases: [
            { invoiceId: 'INV-2024-001', date: '2024-10-24T14:30:00', items: [{ name: 'Nexus Whey Isolate', qty: 1, price: 4199, category: 'Supplements' }], total: 4199, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 84 },
            { invoiceId: 'INV-2024-021', date: '2024-10-10T11:00:00', items: [{ name: 'Pro Powerlifting Belt', qty: 1, price: 7499, category: 'Equipment' }], total: 7499, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 150 },
            { invoiceId: 'INV-2024-031', date: '2024-09-18T09:30:00', items: [{ name: 'Mass Gainer Pro', qty: 2, price: 2750, category: 'Supplements' }], total: 5500, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 110 },
            { invoiceId: 'INV-2024-041', date: '2024-09-01T16:00:00', items: [{ name: 'Pre-Workout Ignite Shot', qty: 3, price: 500, category: 'Supplements' }, { name: 'Protein Bar', qty: 2, price: 150, category: 'Food' }], total: 1800, paymentMethod: 'Cash', department: 'Cafe', status: 'Paid', pointsEarned: 36 },
            { invoiceId: 'INV-2024-051', date: '2024-08-14T12:00:00', items: [{ name: 'Zenith Compression Tee', qty: 2, price: 1299, category: 'Apparel' }], total: 2598, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 52 },
        ],
    },
    {
        id: 'c-002', name: 'Jessica Miller', email: 'jessica@example.com',
        phone: '+91 98765 43211', memberId: 'MEM-1002', avatar: 'JM', joinDate: '2023-03-22',
        purchases: [
            { invoiceId: 'INV-2024-002', date: '2024-10-24T15:15:00', items: [{ name: 'Pre-Workout Ignite Shot', qty: 1, price: 500, category: 'Supplements' }, { name: 'Banana', qty: 2, price: 74.5, category: 'Food' }], total: 649, paymentMethod: 'UPI', department: 'Cafe', status: 'Paid', pointsEarned: 13 },
            { invoiceId: 'INV-2024-022', date: '2024-10-08T10:00:00', items: [{ name: 'Keto Power Bowl', qty: 1, price: 1249, category: 'Food' }], total: 1249, paymentMethod: 'Wallet', department: 'Cafe', status: 'Paid', pointsEarned: 25 },
            { invoiceId: 'INV-2024-032', date: '2024-09-25T13:00:00', items: [{ name: 'Nexus Whey Isolate', qty: 1, price: 4199, category: 'Supplements' }], total: 4199, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 84 },
            { invoiceId: 'INV-2024-042', date: '2024-09-12T08:30:00', items: [{ name: 'Yoga Mat Pro', qty: 1, price: 3499, category: 'Equipment' }], total: 3499, paymentMethod: 'UPI', department: 'Store', status: 'Refunded', pointsEarned: 0 },
        ],
    },
    {
        id: 'c-003', name: 'David Garcia', email: 'david@example.com',
        phone: '+91 98765 43212', memberId: 'MEM-1003', avatar: 'DG', joinDate: '2022-07-10',
        purchases: [
            { invoiceId: 'INV-2024-003', date: '2024-10-24T16:00:00', items: [{ name: 'Pro Powerlifting Belt', qty: 1, price: 7499, category: 'Equipment' }], total: 7499, paymentMethod: 'Card', department: 'Store', status: 'Pending', pointsEarned: 0 },
            { invoiceId: 'INV-2024-023', date: '2024-10-05T14:00:00', items: [{ name: 'Titan Pre-Workout', qty: 3, price: 2499, category: 'Supplements' }], total: 7497, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 225 },
            { invoiceId: 'INV-2024-033', date: '2024-09-20T11:30:00', items: [{ name: 'Nexus Compression Shorts', qty: 2, price: 1899, category: 'Apparel' }], total: 3798, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 114 },
            { invoiceId: 'INV-2024-043', date: '2024-09-08T09:00:00', items: [{ name: 'Mass Gainer Pro', qty: 2, price: 2750, category: 'Supplements' }], total: 5500, paymentMethod: 'Cash', department: 'Store', status: 'Paid', pointsEarned: 165 },
            { invoiceId: 'INV-2024-053', date: '2024-08-22T16:45:00', items: [{ name: 'Steel Shaker Bottle', qty: 2, price: 699, category: 'Accessories' }, { name: 'Protein Bar', qty: 5, price: 150, category: 'Food' }], total: 2148, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 64 },
            { invoiceId: 'INV-2024-063', date: '2024-08-01T12:00:00', items: [{ name: 'Nexus Whey Isolate', qty: 2, price: 4199, category: 'Supplements' }], total: 8398, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 252 },
        ],
    },
    {
        id: 'c-004', name: 'Lisa Anderson', email: 'lisa@example.com',
        phone: '+91 98765 43213', memberId: 'MEM-1004', avatar: 'LA', joinDate: '2023-06-01',
        purchases: [
            { invoiceId: 'INV-2024-004', date: '2024-10-24T16:45:00', items: [{ name: 'Keto Power Bowl', qty: 1, price: 1249, category: 'Food' }], total: 1249, paymentMethod: 'Wallet', department: 'Cafe', status: 'Paid', pointsEarned: 25 },
            { invoiceId: 'INV-2024-024', date: '2024-10-12T12:00:00', items: [{ name: 'Yoga Mat Pro', qty: 1, price: 3499, category: 'Equipment' }], total: 3499, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 70 },
            { invoiceId: 'INV-2024-034', date: '2024-09-30T10:00:00', items: [{ name: 'Zenith Compression Tee', qty: 1, price: 1299, category: 'Apparel' }], total: 1299, paymentMethod: 'Cash', department: 'Store', status: 'Paid', pointsEarned: 26 },
        ],
    },
    {
        id: 'c-005', name: 'Michael Chen', email: 'michael@example.com',
        phone: '+91 98765 43214', memberId: 'MEM-1005', avatar: 'MC', joinDate: '2022-11-05',
        purchases: [
            { invoiceId: 'INV-2024-005', date: '2024-10-24T17:30:00', items: [{ name: 'Mass Gainer Pro', qty: 1, price: 5499, category: 'Supplements' }], total: 5499, paymentMethod: 'Card', department: 'Store', status: 'Refunded', pointsEarned: 0 },
            { invoiceId: 'INV-2024-025', date: '2024-10-15T09:00:00', items: [{ name: 'Titan Pre-Workout', qty: 2, price: 2499, category: 'Supplements' }], total: 4998, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 150 },
            { invoiceId: 'INV-2024-035', date: '2024-10-01T14:30:00', items: [{ name: 'Nexus Whey Isolate', qty: 3, price: 4199, category: 'Supplements' }], total: 12597, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 378 },
            { invoiceId: 'INV-2024-045', date: '2024-09-15T11:00:00', items: [{ name: 'Pro Powerlifting Belt', qty: 1, price: 7499, category: 'Equipment' }], total: 7499, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 225 },
            { invoiceId: 'INV-2024-055', date: '2024-09-03T16:00:00', items: [{ name: 'Mass Gainer Pro', qty: 3, price: 2750, category: 'Supplements' }], total: 8250, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 248 },
            { invoiceId: 'INV-2024-065', date: '2024-08-20T10:30:00', items: [{ name: 'Zenith BCAA Recovery', qty: 2, price: 1899, category: 'Supplements' }], total: 3798, paymentMethod: 'Cash', department: 'Store', status: 'Paid', pointsEarned: 114 },
        ],
    },
    {
        id: 'c-006', name: 'Priya Sharma', email: 'priya@example.com',
        phone: '+91 98765 43215', memberId: 'MEM-1006', avatar: 'PS', joinDate: '2024-01-10',
        purchases: [
            { invoiceId: 'INV-2024-006', date: '2024-10-22T10:00:00', items: [{ name: 'Yoga Mat Pro', qty: 1, price: 3499, category: 'Equipment' }], total: 3499, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 35 },
            { invoiceId: 'INV-2024-026', date: '2024-10-10T09:00:00', items: [{ name: 'Pre-Workout Ignite Shot', qty: 2, price: 500, category: 'Supplements' }, { name: 'Keto Power Bowl', qty: 1, price: 1249, category: 'Food' }], total: 2249, paymentMethod: 'Wallet', department: 'Cafe', status: 'Paid', pointsEarned: 45 },
        ],
    },
    {
        id: 'c-007', name: 'Rahul Verma', email: 'rahul@example.com',
        phone: '+91 98765 43216', memberId: 'MEM-1007', avatar: 'RV', joinDate: '2023-08-20',
        purchases: [
            { invoiceId: 'INV-2024-007', date: '2024-10-20T14:00:00', items: [{ name: 'Titan Pre-Workout', qty: 1, price: 2499, category: 'Supplements' }, { name: 'Steel Shaker Bottle', qty: 1, price: 699, category: 'Accessories' }], total: 3198, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 64 },
            { invoiceId: 'INV-2024-027', date: '2024-10-05T11:30:00', items: [{ name: 'Nexus Whey Isolate', qty: 1, price: 4199, category: 'Supplements' }], total: 4199, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 84 },
            { invoiceId: 'INV-2024-037', date: '2024-09-22T09:00:00', items: [{ name: 'Nexus Compression Shorts', qty: 1, price: 1899, category: 'Apparel' }], total: 1899, paymentMethod: 'Cash', department: 'Store', status: 'Paid', pointsEarned: 38 },
            { invoiceId: 'INV-2024-047', date: '2024-09-10T16:00:00', items: [{ name: 'Zenith BCAA Recovery', qty: 1, price: 1899, category: 'Supplements' }], total: 1899, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 38 },
            { invoiceId: 'INV-2024-057', date: '2024-08-28T12:00:00', items: [{ name: 'Pro Powerlifting Belt', qty: 1, price: 7499, category: 'Equipment' }], total: 7499, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 225 },
        ],
    },
    {
        id: 'c-008', name: 'Anjali Nair', email: 'anjali@example.com',
        phone: '+91 98765 43217', memberId: 'MEM-1008', avatar: 'AN', joinDate: '2024-03-05',
        purchases: [
            { invoiceId: 'INV-2024-008', date: '2024-10-18T11:00:00', items: [{ name: 'Banana', qty: 3, price: 74.5, category: 'Food' }, { name: 'Pre-Workout Ignite Shot', qty: 1, price: 500, category: 'Supplements' }], total: 723.5, paymentMethod: 'Cash', department: 'Cafe', status: 'Paid', pointsEarned: 7 },
            { invoiceId: 'INV-2024-028', date: '2024-10-02T14:00:00', items: [{ name: 'Zenith Compression Tee', qty: 2, price: 1299, category: 'Apparel' }], total: 2598, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 26 },
        ],
    },
    {
        id: 'c-009', name: 'Karthik Iyer', email: 'karthik@example.com',
        phone: '+91 98765 43218', memberId: 'MEM-1009', avatar: 'KI', joinDate: '2022-04-18',
        purchases: [
            { invoiceId: 'INV-2024-009', date: '2024-10-16T09:00:00', items: [{ name: 'Nexus Whey Isolate', qty: 2, price: 4199, category: 'Supplements' }], total: 8398, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 252 },
            { invoiceId: 'INV-2024-029', date: '2024-10-01T15:00:00', items: [{ name: 'Mass Gainer Pro', qty: 2, price: 2750, category: 'Supplements' }], total: 5500, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 165 },
            { invoiceId: 'INV-2024-039', date: '2024-09-18T10:00:00', items: [{ name: 'Pro Powerlifting Belt', qty: 1, price: 7499, category: 'Equipment' }], total: 7499, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 225 },
            { invoiceId: 'INV-2024-049', date: '2024-09-05T14:00:00', items: [{ name: 'Titan Pre-Workout', qty: 2, price: 2499, category: 'Supplements' }], total: 4998, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 150 },
            { invoiceId: 'INV-2024-059', date: '2024-08-20T11:30:00', items: [{ name: 'Nexus Compression Shorts', qty: 3, price: 1899, category: 'Apparel' }], total: 5697, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 285 },
            { invoiceId: 'INV-2024-069', date: '2024-08-05T09:00:00', items: [{ name: 'Steel Shaker Bottle', qty: 3, price: 699, category: 'Accessories' }, { name: 'Zenith BCAA Recovery', qty: 2, price: 1899, category: 'Supplements' }], total: 5895, paymentMethod: 'Cash', department: 'Store', status: 'Paid', pointsEarned: 295 },
            { invoiceId: 'INV-2024-079', date: '2024-07-22T16:00:00', items: [{ name: 'Mass Gainer Pro', qty: 3, price: 2750, category: 'Supplements' }], total: 8250, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 413 },
        ],
    },
    {
        id: 'c-010', name: 'Sneha Pillai', email: 'sneha@example.com',
        phone: '+91 98765 43219', memberId: 'MEM-1010', avatar: 'SP', joinDate: '2023-11-20',
        purchases: [
            { invoiceId: 'INV-2024-010', date: '2024-10-14T13:00:00', items: [{ name: 'Keto Power Bowl', qty: 2, price: 1249, category: 'Food' }], total: 2498, paymentMethod: 'Wallet', department: 'Cafe', status: 'Paid', pointsEarned: 50 },
            { invoiceId: 'INV-2024-030', date: '2024-09-28T10:30:00', items: [{ name: 'Yoga Mat Pro', qty: 1, price: 3499, category: 'Equipment' }], total: 3499, paymentMethod: 'UPI', department: 'Store', status: 'Paid', pointsEarned: 70 },
            { invoiceId: 'INV-2024-040', date: '2024-09-14T16:00:00', items: [{ name: 'Zenith Compression Tee', qty: 1, price: 1299, category: 'Apparel' }, { name: 'Steel Shaker Bottle', qty: 1, price: 699, category: 'Accessories' }], total: 1998, paymentMethod: 'Card', department: 'Store', status: 'Paid', pointsEarned: 60 },
            { invoiceId: 'INV-2024-050', date: '2024-08-30T11:00:00', items: [{ name: 'Pre-Workout Ignite Shot', qty: 2, price: 500, category: 'Supplements' }], total: 1000, paymentMethod: 'Cash', department: 'Cafe', status: 'Paid', pointsEarned: 20 },
        ],
    },
];
