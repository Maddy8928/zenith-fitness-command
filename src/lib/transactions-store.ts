export interface Transaction {
    id: string;
    name: string; // Member Name
    amount: number;
    desc: string; // Description / Purpose
    date: string; // Formatted display date (e.g., "Today, 10:45 AM")
    status: 'Completed' | 'Pending' | 'Failed' | 'Partially Paid' | 'Paid' | 'Refunded' | 'Installment';
    method: 'Cash' | 'UPI' | 'Credit/Debit Card' | 'Bank Transfer' | 'Installment' | 'Other' | string;
    source: 'Memberships' | 'Personal Training' | 'Classes' | 'HYROX' | 'Product Sales';
    receptionist: string; // Who collected it
    rawDate: string; // ISO date string
    // Extended ERP Finance fields
    originalPrice?: number;
    discountPercent?: number;
    discountAmount?: number;
    finalPayable?: number;
    amountPaid?: number;
    upiTransactionId?: string;
    paymentMethodType?: 'One-Time Payment' | 'UPI Payment' | 'Installment Payment';
    installmentDetails?: {
        installment1Amount: number;
        installment1Date: string;
        installment2Amount: number;
        installment2DueDate: string;
        scheduleCompleted: boolean;
    };
    outstandingBalance?: number;
    paymentStatus?: 'Paid' | 'Partially Paid' | 'Pending' | 'Refunded';
    membershipStatus?: 'Active' | 'Pending' | 'Inactive';
    paymentHistory?: Array<{
        id: string;
        date: string;
        amount: number;
        method: string;
        note: string;
    }>;
}

export const getInitialTransactions = (): Transaction[] => {
    const now = new Date();
    
    // Helper to generate ISO strings relative to now
    const relativeDate = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0): string => {
        const d = new Date(now.getTime());
        d.setDate(d.getDate() - daysAgo);
        d.setHours(d.getHours() - hoursAgo);
        d.setMinutes(d.getMinutes() - minutesAgo);
        return d.toISOString();
    };

    const initial = [
        {
            id: 'TRX-10143',
            name: 'Vikram Mehta',
            amount: 11250,
            desc: 'Premium Plan (Installment 1 of 2)',
            rawDate: relativeDate(0, 0, 20), // 20m ago
            status: 'Partially Paid',
            method: 'Installment',
            source: 'Memberships',
            receptionist: 'Sarah Jenkins',
            originalPrice: 12500,
            discountPercent: 10,
            discountAmount: 1250,
            finalPayable: 11250,
            amountPaid: 5000,
            paymentMethodType: 'Installment Payment',
            installmentDetails: {
                installment1Amount: 5000,
                installment1Date: new Date().toISOString().split('T')[0],
                installment2Amount: 6250,
                installment2DueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                scheduleCompleted: false
            },
            outstandingBalance: 6250,
            paymentStatus: 'Partially Paid',
            membershipStatus: 'Active',
            paymentHistory: [
                {
                    id: 'PAY-INST-1',
                    date: new Date().toLocaleDateString('en-IN'),
                    amount: 5000,
                    method: 'UPI',
                    note: '1st Installment received'
                }
            ]
        },
        {
            id: 'TRX-10142',
            name: 'Michael Chen',
            amount: 12499,
            desc: 'Premium Plan (Monthly)',
            rawDate: relativeDate(0, 1, 30), // 1.5h ago
            status: 'Completed',
            method: 'Credit/Debit Card',
            source: 'Memberships',
            receptionist: 'Sarah Jenkins'
        },
        {
            id: 'TRX-10141',
            name: 'Sarah Jenkins',
            amount: 7499,
            desc: 'Standard Plan (Monthly)',
            rawDate: relativeDate(0, 2, 45), // 2.75h ago
            status: 'Completed',
            method: 'UPI',
            source: 'Memberships',
            receptionist: 'Michael Chen'
        },
        {
            id: 'TRX-10140',
            name: 'David Miller',
            amount: 4149,
            desc: 'Basic Plan (Monthly)',
            rawDate: relativeDate(0, 4, 15), // 4.25h ago
            status: 'Failed',
            method: 'Credit/Debit Card',
            source: 'Memberships',
            receptionist: 'Sarah Jenkins'
        },
        {
            id: 'TRX-10139',
            name: 'Emma Wilson',
            amount: 7999,
            desc: 'Store Purchase (Supplements)',
            rawDate: relativeDate(1, 2, 10), // yesterday
            status: 'Completed',
            method: 'UPI',
            source: 'Product Sales',
            receptionist: 'Michael Chen'
        },
        {
            id: 'TRX-10138',
            name: 'James Thompson',
            amount: 12499,
            desc: 'Premium Plan (Monthly)',
            rawDate: relativeDate(1, 4, 20), // yesterday
            status: 'Pending',
            method: 'Bank Transfer',
            source: 'Memberships',
            receptionist: 'Sarah Jenkins'
        },
        {
            id: 'TRX-10137',
            name: 'Olivia Davis',
            amount: 7499,
            desc: 'Standard Plan (Monthly)',
            rawDate: relativeDate(2, 7, 5), // 2 days ago
            status: 'Completed',
            method: 'Credit/Debit Card',
            source: 'Memberships',
            receptionist: 'Michael Chen'
        },
        {
            id: 'TRX-10136',
            name: 'William Garcia',
            amount: 1699,
            desc: 'Store Purchase (Accessories)',
            rawDate: relativeDate(3, 5, 45), // 3 days ago
            status: 'Completed',
            method: 'Cash',
            source: 'Product Sales',
            receptionist: 'Emma Wilson'
        },
        {
            id: 'TRX-10135',
            name: 'Sophia Martinez',
            amount: 21000,
            desc: 'Annual Locker Rental',
            rawDate: relativeDate(4, 9, 30), // 4 days ago
            status: 'Completed',
            method: 'Visa •••• 9012', // Map to other
            rawMethod: 'Bank Transfer', // We'll map to Bank Transfer
            source: 'Memberships',
            receptionist: 'Sarah Jenkins'
        },
        {
            id: 'TRX-10134',
            name: 'Lucas Robinson',
            amount: 4500,
            desc: 'Personal Training Session x3',
            rawDate: relativeDate(0, 0, 45), // 45m ago
            status: 'Completed',
            method: 'Cash',
            source: 'Personal Training',
            receptionist: 'Sarah Jenkins'
        },
        {
            id: 'TRX-10133',
            name: 'Aria Montgomery',
            amount: 3200,
            desc: 'HYROX Prep Class Entry',
            rawDate: relativeDate(2, 3, 15), // 2 days ago
            status: 'Completed',
            method: 'UPI',
            source: 'HYROX',
            receptionist: 'Emma Wilson'
        },
        {
            id: 'TRX-10132',
            name: 'Ethan Hunt',
            amount: 15000,
            desc: '10-Pack HYROX Training',
            rawDate: relativeDate(5, 5, 20), // 5 days ago
            status: 'Completed',
            method: 'Cash',
            source: 'HYROX',
            receptionist: 'Michael Chen'
        },
        {
            id: 'TRX-10131',
            name: 'Chloe Bennett',
            amount: 1200,
            desc: 'Yoga Block & Strap',
            rawDate: relativeDate(0, 3, 5), // today
            status: 'Completed',
            method: 'Cash',
            source: 'Product Sales',
            receptionist: 'Emma Wilson'
        },
        {
            id: 'TRX-10130',
            name: 'Benjamin Sisko',
            amount: 25000,
            desc: 'Yearly Premium Membership',
            rawDate: relativeDate(15, 6, 0), // 15 days ago
            status: 'Completed',
            method: 'Bank Transfer',
            source: 'Memberships',
            receptionist: 'Sarah Jenkins'
        },
        {
            id: 'TRX-10129',
            name: 'Kira Nerys',
            amount: 8000,
            desc: 'Personal Training Package',
            rawDate: relativeDate(20, 2, 30), // 20 days ago
            status: 'Completed',
            method: 'UPI',
            source: 'Personal Training',
            receptionist: 'Michael Chen'
        },
        {
            id: 'TRX-10128',
            name: 'Julian Bashir',
            amount: 3500,
            desc: 'Supplement Bundle',
            rawDate: relativeDate(45, 12, 0), // 45 days ago
            status: 'Completed',
            method: 'Credit/Debit Card',
            source: 'Product Sales',
            receptionist: 'Emma Wilson'
        },
        {
            id: 'TRX-10127',
            name: 'Ezri Dax',
            amount: 7499,
            desc: 'Standard Plan (Monthly)',
            rawDate: relativeDate(60, 4, 15), // 60 days ago
            status: 'Completed',
            method: 'UPI',
            source: 'Memberships',
            receptionist: 'Sarah Jenkins'
        }
    ];

    return initial.map(t => {
        const method = (t.method === 'Visa •••• 9012' || t.method === 'Apple Pay' || t.method === 'MasterCard •••• 2221' || t.method === 'MasterCard •••• 8812' || t.method === 'Visa •••• 4242' || t.method === 'Visa •••• 5555') 
            ? 'Credit/Debit Card' 
            : (t.method === 'Bank ACH' ? 'Bank Transfer' : t.method);
        return {
            ...t,
            method: method as any,
            date: formatDisplayDate(t.rawDate)
        };
    }) as Transaction[];
};

export const formatDisplayDate = (isoStr: string): string => {
    const d = new Date(isoStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    if (d.toDateString() === today.toDateString()) {
        return `Today, ${timeStr}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${timeStr}`;
    } else {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
    }
};

const STORAGE_KEY = 'flex_gym_receptionist_transactions';

export const getStoredTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const initial = getInitialTransactions();
        saveStoredTransactions(initial);
        return initial;
    }
    
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse stored transactions, resetting...', e);
        const initial = getInitialTransactions();
        saveStoredTransactions(initial);
        return initial;
    }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        // Dispatch custom storage update event so other tabs/hooks hear about it in real-time
        window.dispatchEvent(new Event('storage_transactions_updated'));
    }
};

export const addTransaction = (
    tx: Omit<Transaction, 'id' | 'date' | 'rawDate'>
): Transaction => {
    const transactions = getStoredTransactions();
    const nextId = `TRX-${10143 + transactions.length}`;
    const rawDate = new Date().toISOString();
    
    const newTx: Transaction = {
        ...tx,
        id: nextId,
        rawDate,
        date: formatDisplayDate(rawDate)
    };
    
    const updated = [newTx, ...transactions];
    saveStoredTransactions(updated);
    return newTx;
};

export const isDuplicateUpiId = (upiId: string): boolean => {
    if (!upiId || !upiId.trim()) return false;
    const cleanId = upiId.trim().toLowerCase();
    const transactions = getStoredTransactions();
    return transactions.some(t => t.upiTransactionId && t.upiTransactionId.trim().toLowerCase() === cleanId);
};

export const completeInstallmentPayment = (txId: string): Transaction | null => {
    const transactions = getStoredTransactions();
    const index = transactions.findIndex(t => t.id === txId);
    if (index === -1) return null;

    const tx = transactions[index];
    const remaining = tx.outstandingBalance || (tx.installmentDetails ? tx.installmentDetails.installment2Amount : 0);

    const updatedTx: Transaction = {
        ...tx,
        status: 'Completed',
        paymentStatus: 'Paid',
        outstandingBalance: 0,
        amountPaid: (tx.amountPaid || 0) + remaining,
        installmentDetails: tx.installmentDetails ? {
            ...tx.installmentDetails,
            scheduleCompleted: true
        } : undefined,
        paymentHistory: [
            ...(tx.paymentHistory || []),
            {
                id: `PAY-INST-${(tx.paymentHistory?.length || 0) + 1}`,
                date: new Date().toLocaleDateString('en-IN'),
                amount: remaining,
                method: 'Installment Settlement',
                note: '2nd Installment collected - schedule completed'
            }
        ]
    };

    transactions[index] = updatedTx;
    saveStoredTransactions(transactions);
    return updatedTx;
};
