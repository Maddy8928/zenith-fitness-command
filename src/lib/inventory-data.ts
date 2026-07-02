export interface InventoryProduct {
    id: string;
    name: string;
    sku: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    stock: number;
    minThreshold: number;
    optimalStock: number;
    preferredSupplierId: string;
    status: string;
    batchNo: string;
    expiryDate: string | null;
    salesVelocity: number; // Avg units sold per day
}

export const INVENTORY_DATA: InventoryProduct[] = [
    { 
        id: '1', name: 'Nexus Whey Isolate', sku: 'NX-WHEY-01', category: 'Supplements', 
        sellingPrice: 4199, costPrice: 2800, stock: 145, minThreshold: 30, optimalStock: 150, 
        preferredSupplierId: 's-001', status: 'Active', batchNo: 'B-2601', expiryDate: '2027-12-31',
        salesVelocity: 12.5
    },
    { 
        id: '2', name: 'Titan Pre-Workout', sku: 'NX-PRE-02', category: 'Supplements', 
        sellingPrice: 3299, costPrice: 2100, stock: 12, minThreshold: 20, optimalStock: 100, 
        preferredSupplierId: 's-001', status: 'Low Stock', batchNo: 'B-2602', expiryDate: '2026-05-15',
        salesVelocity: 8.2
    },
    { 
        id: '3', name: 'Zenith BCAA Recovery', sku: 'NX-BCAA-03', category: 'Supplements', 
        sellingPrice: 2499, costPrice: 1600, stock: 85, minThreshold: 25, optimalStock: 120, 
        preferredSupplierId: 's-001', status: 'Active', batchNo: 'B-2509', expiryDate: '2026-03-01',
        salesVelocity: 15.4 // Fast Moving
    },
    { 
        id: '4', name: 'Pro Powerlifting Belt', sku: 'GR-BELT-01', category: 'Gear', 
        sellingPrice: 7499, costPrice: 4800, stock: 4, minThreshold: 10, optimalStock: 30, 
        preferredSupplierId: 's-002', status: 'Critical', batchNo: 'G-001', expiryDate: null,
        salesVelocity: 1.2
    },
    { 
        id: '5', name: 'Nexus Compression Tee', sku: 'AP-TEE-01', category: 'Apparel', 
        sellingPrice: 2999, costPrice: 1400, stock: 54, minThreshold: 20, optimalStock: 100, 
        preferredSupplierId: 's-003', status: 'Active', batchNo: 'A-001', expiryDate: null,
        salesVelocity: 9.8
    },
    { 
        id: '6', name: 'Elite Wrist Wraps', sku: 'GR-WRAP-02', category: 'Gear', 
        sellingPrice: 1699, costPrice: 900, stock: 0, minThreshold: 15, optimalStock: 60, 
        preferredSupplierId: 's-005', status: 'Out of Stock', batchNo: 'G-002', expiryDate: null,
        salesVelocity: 4.5
    },
    { 
        id: '7', name: 'Mass Gainer Pro', sku: 'NX-MASS-07', category: 'Supplements', 
        sellingPrice: 5499, costPrice: 3500, stock: 30, minThreshold: 25, optimalStock: 100, 
        preferredSupplierId: 's-001', status: 'Low Stock', batchNo: 'B-2603', expiryDate: '2026-11-20',
        salesVelocity: 2.1
    },
    { 
        id: '8', name: 'Lifting Straps', sku: 'GR-STRAP-03', category: 'Gear', 
        sellingPrice: 999, costPrice: 550, stock: 18, minThreshold: 15, optimalStock: 80, 
        preferredSupplierId: 's-002', status: 'Active', batchNo: 'G-003', expiryDate: null,
        salesVelocity: 12.1 // High velocity for its stock
    },
];
