/**
 * MONGODB SCHEMA DEFINITION (For Backend)
 * 
 * const OrderSchema = new mongoose.Schema({
 *   orderId: { type: String, required: true, unique: true },
 *   memberId: { type: String, required: true, ref: 'Member' },
 *   customerName: { type: String, required: true },
 *   items: [{
 *     productId: { type: String, required: true },
 *     name: { type: String, required: true },
 *     qty: { type: Number, required: true },
 *     price: { type: Number, required: true }
 *   }],
 *   subtotal: { type: Number, required: true },
 *   tax: { type: Number, required: true },
 *   totalAmount: { type: Number, required: true },
 *   status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
 *   paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Wallet'], required: true },
 *   department: { type: String, enum: ['Store'], required: true },
 *   createdAt: { type: Date, default: Date.now },
 *   updatedAt: { type: Date, default: Date.now }
 * });
 */

export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Wallet';
export type Department = 'Store';

export interface OrderItem {
    productId: string;
    name: string;
    qty: number;
    price: number;
}

export interface StoreOrder {
    id: string;
    memberId: string;
    customerName: string;
    email: string;
    phone: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    department: Department;
    date: string; // ISO string
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    cancelled: { label: 'Cancelled', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
};

export const MOCK_ORDERS: StoreOrder[] = [
    {
        id: 'ORD-5001',
        memberId: 'MEM-1001',
        customerName: 'Alex Thompson',
        email: 'alex@example.com',
        phone: '+91 98765 43210',
        items: [
            { productId: '1', name: 'Nexus Whey Isolate', qty: 1, price: 4199 }
        ],
        subtotal: 3558,
        tax: 641,
        totalAmount: 4199,
        status: 'completed',
        paymentMethod: 'UPI',
        department: 'Store',
        date: '2024-10-24T14:30:00'
    },
    {
        id: 'ORD-5003',
        memberId: 'MEM-1003',
        customerName: 'David Garcia',
        email: 'david@example.com',
        phone: '+91 98765 43212',
        items: [
            { productId: '4', name: 'Pro Powerlifting Belt', qty: 1, price: 7499 }
        ],
        subtotal: 6355,
        tax: 1144,
        totalAmount: 7499,
        status: 'pending',
        paymentMethod: 'Card',
        department: 'Store',
        date: '2024-10-24T16:00:00'
    },
    {
        id: 'ORD-5005',
        memberId: 'MEM-1005',
        customerName: 'Michael Chen',
        email: 'michael@example.com',
        phone: '+91 98765 43214',
        items: [
            { productId: '7', name: 'Mass Gainer Pro', qty: 1, price: 5499 }
        ],
        subtotal: 4660,
        tax: 839,
        totalAmount: 5499,
        status: 'cancelled',
        paymentMethod: 'Card',
        department: 'Store',
        date: '2024-10-24T17:30:00'
    }
];
