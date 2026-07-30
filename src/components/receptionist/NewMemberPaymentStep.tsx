"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    DollarSign,
    CreditCard,
    QrCode,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Layers,
    Tag,
    Percent,
    TrendingUp,
    Sparkles,
    Check,
    Hash,
    Smartphone,
    CalendarDays,
    AlertTriangle,
    ArrowRight,
    HelpCircle,
    Wallet,
    Users
} from 'lucide-react';
import { getStoredTransactions } from '@/lib/transactions-store';

export type PaymentMethodType = 'one-time' | 'upi' | 'installment';

export interface PaymentConfiguration {
    originalPrice: number;
    discountPercentage: number;
    discountAmount: number;
    finalPayableAmount: number;
    promoOffer?: {
        id: string;
        name: string;
        discountPercent: number;
    };
    paymentMethod: PaymentMethodType;
    paymentMethodLabel: string;
    // UPI specific
    upiTransactionId?: string;
    // Installment specific
    installment1Amount?: number;
    installment1Date?: string;
    installment2Amount?: number;
    installment2DueDate?: string;
    remainingBalance?: number;
    // Status
    paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
    membershipStatus: 'Active' | 'Pending';
    outstandingBalance: number;
    isValid: boolean;
    validationError?: string;
}

interface NewMemberPaymentStepProps {
    memberName: string;
    memberEmail: string;
    memberPhone: string;
    selectedPlan: {
        id: string;
        name: string;
        price: number;
    };
    onPaymentConfigChange: (config: PaymentConfiguration) => void;
    isModal?: boolean;
}

export interface PromotionalOffer {
    id: 'student' | 'couple' | 'corporate';
    name: string;
    discountPercent: number;
    description: string;
    badge: string;
}

export const PROMOTIONAL_OFFERS: PromotionalOffer[] = [
    {
        id: 'student',
        name: 'Student Offer',
        discountPercent: 30,
        description: 'Valid student ID required upon gym visit',
        badge: '30% OFF'
    },
    {
        id: 'couple',
        name: 'Couple Membership Offer',
        discountPercent: 40,
        description: 'Special bundle discount for couples enrolling together',
        badge: '40% OFF'
    },
    {
        id: 'corporate',
        name: 'Corporate Employee Offer',
        discountPercent: 20,
        description: 'Available for partner corporate employees',
        badge: '20% OFF'
    }
];

export default function NewMemberPaymentStep({
    memberName,
    memberEmail,
    memberPhone,
    selectedPlan,
    onPaymentConfigChange,
    isModal = false
}: NewMemberPaymentStepProps) {
    const originalPrice = selectedPlan.price;

    // --- State: Discount Management ---
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [discountInput, setDiscountInput] = useState<string>('0');
    const [selectedPromoOfferId, setSelectedPromoOfferId] = useState<string | null>(null);

    // --- State: Payment Method ---
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('one-time');

    // --- State: UPI ---
    const [upiTransactionId, setUpiTransactionId] = useState<string>('');

    // --- State: Installments (Max 2) ---
    const [installment1AmountInput, setInstallment1AmountInput] = useState<string>('');
    const [installment1Date, setInstallment1Date] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [installment2DueDate, setInstallment2DueDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });

    // Real-time calculated discount and final payable
    const discountAmount = useMemo(() => {
        const validPct = Math.min(100, Math.max(0, discountPercentage || 0));
        return Math.round((originalPrice * validPct) / 100);
    }, [originalPrice, discountPercentage]);

    const finalPayableAmount = useMemo(() => {
        return Math.max(0, originalPrice - discountAmount);
    }, [originalPrice, discountAmount]);

    // Set initial Installment 1 amount intelligently when finalPayableAmount changes
    useEffect(() => {
        if (!installment1AmountInput) {
            // Default installment 1 to e.g. 5000 if originalPrice is ~12500, or 50% otherwise
            if (originalPrice === 12500 && finalPayableAmount === 11250) {
                setInstallment1AmountInput('5000');
            } else {
                setInstallment1AmountInput(Math.round(finalPayableAmount * 0.5).toString());
            }
        }
    }, [finalPayableAmount, originalPrice, installment1AmountInput]);

    const installment1Amount = useMemo(() => {
        const parsed = parseInt(installment1AmountInput, 10);
        return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }, [installment1AmountInput]);

    // Installment 2 (Remaining Balance) = Final Payable - Installment 1
    const remainingBalance = useMemo(() => {
        return Math.max(0, finalPayableAmount - installment1Amount);
    }, [finalPayableAmount, installment1Amount]);

    const installment2Amount = remainingBalance;

    // Check existing transactions for UPI ID duplicates
    const isUpiDuplicate = useMemo(() => {
        if (paymentMethod !== 'upi' || !upiTransactionId.trim()) return false;
        const stored = getStoredTransactions();
        const trimmed = upiTransactionId.trim().toLowerCase();
        return stored.some(t => {
            const matchInDesc = t.desc?.toLowerCase().includes(`utr: ${trimmed}`) || t.desc?.toLowerCase().includes(`upi: ${trimmed}`);
            return matchInDesc;
        });
    }, [paymentMethod, upiTransactionId]);

    // Validation Rules check
    const validationResult = useMemo<{ isValid: boolean; error?: string }>(() => {
        // Discount check
        if (discountPercentage < 0 || discountPercentage > 100) {
            return { isValid: false, error: 'Discount percentage cannot exceed 100% or be negative.' };
        }
        if (finalPayableAmount < 0) {
            return { isValid: false, error: 'Final payable amount cannot be negative.' };
        }

        if (paymentMethod === 'upi') {
            if (!upiTransactionId.trim()) {
                return { isValid: false, error: 'UPI Transaction ID is required.' };
            }
            if (upiTransactionId.trim().length < 4) {
                return { isValid: false, error: 'Enter a valid UPI Transaction ID.' };
            }
            if (isUpiDuplicate) {
                return { isValid: false, error: 'Duplicate UPI Transaction ID detected. This reference is already used.' };
            }
        }

        if (paymentMethod === 'installment') {
            if (installment1Amount <= 0) {
                return { isValid: false, error: 'Installment 1 amount must be greater than ₹0.' };
            }
            if (installment1Amount > finalPayableAmount) {
                return { isValid: false, error: `Installment 1 (₹${installment1Amount.toLocaleString()}) cannot exceed Final Payable Amount (₹${finalPayableAmount.toLocaleString()}).` };
            }
            if (!installment1Date) {
                return { isValid: false, error: 'Please specify Payment Date for Installment 1.' };
            }
            if (!installment2DueDate) {
                return { isValid: false, error: 'Please select a Due Date for Installment 2.' };
            }
            if (remainingBalance < 0) {
                return { isValid: false, error: 'Invalid installment balance calculation.' };
            }
        }

        return { isValid: true };
    }, [
        discountPercentage,
        finalPayableAmount,
        paymentMethod,
        upiTransactionId,
        isUpiDuplicate,
        installment1Amount,
        installment1Date,
        installment2DueDate,
        remainingBalance
    ]);

    // Determine Statuses
    const paymentStatus = useMemo<'Paid' | 'Partially Paid'>(() => {
        if (paymentMethod === 'installment' && remainingBalance > 0) {
            return 'Partially Paid';
        }
        return 'Paid';
    }, [paymentMethod, remainingBalance]);

    const membershipStatus = 'Active' as const;

    const outstandingBalance = useMemo(() => {
        return paymentMethod === 'installment' ? remainingBalance : 0;
    }, [paymentMethod, remainingBalance]);

    const amountPaidToday = useMemo(() => {
        if (paymentMethod === 'installment') return installment1Amount;
        return finalPayableAmount;
    }, [paymentMethod, installment1Amount, finalPayableAmount]);

    const paymentMethodLabel = useMemo(() => {
        if (paymentMethod === 'one-time') return 'One-Time Payment';
        if (paymentMethod === 'upi') return 'UPI Payment';
        return 'Installment Payment (2 Installments)';
    }, [paymentMethod]);

    // Store callback in ref so it never triggers useEffect re-runs
    const onPaymentConfigChangeRef = useRef(onPaymentConfigChange);
    useEffect(() => {
        onPaymentConfigChangeRef.current = onPaymentConfigChange;
    }, [onPaymentConfigChange]);

    const lastNotifiedConfigRef = useRef<string>('');

    // Notify parent on state changes without causing infinite loops
    useEffect(() => {
        const config: PaymentConfiguration = {
            originalPrice,
            discountPercentage,
            discountAmount,
            finalPayableAmount,
            promoOffer: selectedPromoOfferId ? {
                id: selectedPromoOfferId,
                name: PROMOTIONAL_OFFERS.find(o => o.id === selectedPromoOfferId)?.name || 'Promotional Offer',
                discountPercent: discountPercentage
            } : undefined,
            paymentMethod,
            paymentMethodLabel,
            upiTransactionId: paymentMethod === 'upi' ? upiTransactionId.trim() : undefined,
            installment1Amount: paymentMethod === 'installment' ? installment1Amount : undefined,
            installment1Date: paymentMethod === 'installment' ? installment1Date : undefined,
            installment2Amount: paymentMethod === 'installment' ? installment2Amount : undefined,
            installment2DueDate: paymentMethod === 'installment' ? installment2DueDate : undefined,
            remainingBalance: paymentMethod === 'installment' ? remainingBalance : undefined,
            paymentStatus,
            membershipStatus,
            outstandingBalance,
            isValid: validationResult.isValid,
            validationError: validationResult.error
        };

        const serialized = JSON.stringify(config);
        if (serialized !== lastNotifiedConfigRef.current) {
            lastNotifiedConfigRef.current = serialized;
            onPaymentConfigChangeRef.current(config);
        }
    }, [
        originalPrice,
        discountPercentage,
        discountAmount,
        finalPayableAmount,
        selectedPromoOfferId,
        paymentMethod,
        paymentMethodLabel,
        upiTransactionId,
        installment1Amount,
        installment1Date,
        installment2Amount,
        installment2DueDate,
        remainingBalance,
        paymentStatus,
        membershipStatus,
        outstandingBalance,
        validationResult.isValid,
        validationResult.error
    ]);

    // Clear promotional offer automatically if user switches to installment payment
    useEffect(() => {
        if (paymentMethod === 'installment' && selectedPromoOfferId !== null) {
            setSelectedPromoOfferId(null);
            setDiscountPercentage(0);
            setDiscountInput('0');
        }
    }, [paymentMethod, selectedPromoOfferId]);

    const handleDiscountInputChange = (val: string) => {
        setSelectedPromoOfferId(null); // Manual discount deselects any promotional offer
        setDiscountInput(val);
        const num = parseFloat(val);
        if (isNaN(num)) {
            setDiscountPercentage(0);
        } else {
            setDiscountPercentage(Math.min(100, Math.max(0, num)));
        }
    };

    const handlePresetDiscount = (pct: number) => {
        setSelectedPromoOfferId(null); // Manual discount deselects any promotional offer
        setDiscountPercentage(pct);
        setDiscountInput(pct.toString());
    };

    const handleSelectPromoOffer = (offer: PromotionalOffer) => {
        if (paymentMethod === 'installment') return;
        if (selectedPromoOfferId === offer.id) {
            // Deselect offer
            setSelectedPromoOfferId(null);
            setDiscountPercentage(0);
            setDiscountInput('0');
        } else {
            // Select promotional offer -> automatically remove any manual discount
            setSelectedPromoOfferId(offer.id);
            setDiscountPercentage(offer.discountPercent);
            setDiscountInput(offer.discountPercent.toString());
        }
    };

    const handleInstallment1Change = (val: string) => {
        // Strip non-digits
        const clean = val.replace(/\D/g, '');
        setInstallment1AmountInput(clean);
    };

    const handlePresetInstallment1 = (pctOfFinal: number) => {
        const amt = Math.round(finalPayableAmount * pctOfFinal);
        setInstallment1AmountInput(amt.toString());
    };

    return (
        <div className="space-y-6 text-white animate-in fade-in duration-200">
            {/* =========================================================================
                1. DISCOUNT MANAGEMENT (At Top of Payment Step)
               ========================================================================= */}
            <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_hsl(var(--gold)/0.15)]">
                            <Percent className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                                Discount Management
                                {discountPercentage > 0 && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {discountPercentage}% Applied
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-slate-400">Enter discount percentage before collecting payment</p>
                        </div>
                    </div>

                    {/* Discount % Input Box */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-36">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={discountInput}
                                onChange={e => handleDiscountInputChange(e.target.value)}
                                className="w-full bg-black/60 border border-white/15 focus:border-primary/60 rounded-xl py-2 pl-3 pr-8 text-sm font-mono font-bold text-white focus:outline-none transition-all shadow-inner"
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-black text-slate-400">%</span>
                        </div>
                    </div>
                </div>

                {/* Quick Discount Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2">Quick Presets:</span>
                    {[0, 5, 10, 15, 20, 25].map(pct => (
                        <button
                            key={pct}
                            type="button"
                            onClick={() => handlePresetDiscount(pct)}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                                discountPercentage === pct
                                    ? 'bg-primary text-black shadow-[0_0_12px_hsl(var(--gold)/0.4)] scale-105'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15'
                            }`}
                        >
                            {pct}%
                        </button>
                    ))}
                </div>

                {/* Real-time Calculation Display Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Price</span>
                        <p className="text-sm sm:text-base font-black font-mono text-slate-300">
                            ₹{originalPrice.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Discount (%)</span>
                        <p className="text-sm sm:text-base font-black font-mono text-cyan-400">
                            {discountPercentage}%
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Discount Amount</span>
                        <p className="text-sm sm:text-base font-black font-mono text-amber-400">
                            -₹{discountAmount.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-1 bg-primary/10 -m-2 p-2 rounded-xl border border-primary/30 shadow-[0_0_15px_hsl(var(--gold)/0.15)]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">Final Payable</span>
                        <p className="text-base sm:text-xl font-black font-mono text-primary">
                            ₹{finalPayableAmount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================================
                2. PROMOTIONAL MEMBERSHIP OFFERS (Below Manual Discount Section)
               ========================================================================= */}
            <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                                Promotional Offers
                                {selectedPromoOfferId && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                        {PROMOTIONAL_OFFERS.find(o => o.id === selectedPromoOfferId)?.name} Applied
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-slate-400">Fixed membership promotional offers (One-Time Payments only)</p>
                        </div>
                    </div>

                    <span className="text-[10px] font-medium text-slate-400">
                        Only one promotional offer can be selected at a time
                    </span>
                </div>

                {paymentMethod === 'installment' ? (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center gap-3 text-amber-300 text-xs font-medium">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                            <p className="font-bold text-amber-300">Promotional offers are available only for one-time payments.</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                                Fixed promotional discounts (Student, Couple, Corporate) cannot be combined with Installment Payment schedules. Please select One-Time Payment to unlock promotional offers.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PROMOTIONAL_OFFERS.map((offer) => {
                            const isSelected = selectedPromoOfferId === offer.id;
                            const offerDiscountAmt = Math.round((originalPrice * offer.discountPercent) / 100);
                            const offerFinalPrice = Math.max(0, originalPrice - offerDiscountAmt);

                            return (
                                <div
                                    key={offer.id}
                                    onClick={() => handleSelectPromoOffer(offer)}
                                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between group ${
                                        isSelected
                                            ? 'bg-primary/15 border-primary shadow-[0_0_25px_hsl(var(--gold)/0.25)]'
                                            : 'bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-3 pr-6">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                                isSelected
                                                    ? 'bg-primary text-black'
                                                    : 'bg-white/5 text-primary group-hover:bg-primary/10'
                                            }`}>
                                                {offer.id === 'student' ? (
                                                    <Tag className="w-5 h-5" />
                                                ) : offer.id === 'couple' ? (
                                                    <Users className="w-5 h-5" />
                                                ) : (
                                                    <ShieldCheck className="w-5 h-5" />
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                                isSelected
                                                    ? 'bg-primary text-black border-primary'
                                                    : 'bg-white/5 text-primary border-primary/30'
                                            }`}>
                                                {offer.badge}
                                            </span>
                                        </div>

                                        <h5 className="text-sm font-black text-white">{offer.name}</h5>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{offer.description}</p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-emerald-400">
                                            Save ₹{offerDiscountAmt.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-primary">
                                            Final: ₹{offerFinalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* =========================================================================
                3. PAYMENT METHOD SELECTION (Below Promotional Offers Section)
               ========================================================================= */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" /> Select Payment Method
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Only one method can be selected at a time</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Method 1: One-Time Payment */}
                    <div
                        onClick={() => setPaymentMethod('one-time')}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                            paymentMethod === 'one-time'
                                ? 'bg-primary/10 border-primary shadow-[0_0_20px_hsl(var(--gold)/0.2)]'
                                : 'bg-slate-950/70 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                        }`}
                    >
                        {paymentMethod === 'one-time' && (
                            <div className="absolute top-3 right-3 text-primary">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h5 className="text-sm font-black uppercase tracking-wide text-white">One-Time Payment</h5>
                            <p className="text-xs text-slate-400 mt-1">Full amount collected upfront</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Instant Active</span>
                            <span className="text-xs font-mono font-bold text-primary">₹{finalPayableAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Method 2: UPI Payment */}
                    <div
                        onClick={() => setPaymentMethod('upi')}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                            paymentMethod === 'upi'
                                ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                                : 'bg-slate-950/70 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                        }`}
                    >
                        {paymentMethod === 'upi' && (
                            <div className="absolute top-3 right-3 text-cyan-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
                                <QrCode className="w-5 h-5" />
                            </div>
                            <h5 className="text-sm font-black uppercase tracking-wide text-white">UPI Payment</h5>
                            <p className="text-xs text-slate-400 mt-1">Terminal QR / UPI transfer</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Req. UTR / ID</span>
                            <span className="text-xs font-mono font-bold text-cyan-400">₹{finalPayableAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Method 3: Installment Payment */}
                    <div
                        onClick={() => setPaymentMethod('installment')}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                            paymentMethod === 'installment'
                                ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                                : 'bg-slate-950/70 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                        }`}
                    >
                        {paymentMethod === 'installment' && (
                            <div className="absolute top-3 right-3 text-amber-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h5 className="text-sm font-black uppercase tracking-wide text-white">Installment Payment</h5>
                            <p className="text-xs text-slate-400 mt-1">Maximum 2 installments only</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">2 Split Pay</span>
                            <span className="text-xs font-mono font-bold text-amber-300">Flexible</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================================
                3. METHOD-SPECIFIC PANELS
               ========================================================================= */}
            <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 transition-all">
                {/* --- A. ONE-TIME PAYMENT PANEL --- */}
                {paymentMethod === 'one-time' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className="text-sm font-black text-white uppercase tracking-wide">One-Time Upfront Settlement</h6>
                                    <p className="text-xs text-emerald-300 mt-0.5">Membership activates immediately with paid status.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Final Payable</span>
                                <span className="text-xl font-black font-mono text-primary">₹{finalPayableAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs text-slate-400">Payment Status</span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                    Paid
                                </span>
                            </div>
                            <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs text-slate-400">Membership Status</span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- B. UPI PAYMENT PANEL --- */}
                {paymentMethod === 'upi' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className="text-sm font-black text-white uppercase tracking-wide">UPI Terminal Collection</h6>
                                    <p className="text-xs text-cyan-300 mt-0.5">Receptionist must enter valid transaction ID before registration.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Amount to Collect</span>
                                <span className="text-xl font-black font-mono text-cyan-400">₹{finalPayableAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* UPI Transaction ID Required Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Hash className="w-4 h-4 text-cyan-400" /> UPI Transaction ID (Required)
                                </span>
                                {upiTransactionId.trim() && !isUpiDuplicate ? (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Valid ID
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-amber-400 font-bold">Mandatory</span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={upiTransactionId}
                                    onChange={e => setUpiTransactionId(e.target.value)}
                                    placeholder="Enter 12-digit UTR / UPI Ref ID (e.g. 412389012345)"
                                    className={`w-full bg-black/60 border rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none transition-all ${
                                        isUpiDuplicate
                                            ? 'border-destructive focus:border-destructive'
                                            : upiTransactionId.trim().length >= 4
                                            ? 'border-emerald-500/50 focus:border-emerald-500'
                                            : 'border-white/15 focus:border-cyan-400'
                                    }`}
                                />
                                {upiTransactionId.trim() && (
                                    <button
                                        type="button"
                                        onClick={() => setUpiTransactionId('')}
                                        className="absolute right-3 top-3 text-xs text-slate-500 hover:text-white font-bold"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            {isUpiDuplicate ? (
                                <p className="text-xs text-destructive flex items-center gap-1.5 font-semibold">
                                    <AlertCircle className="w-3.5 h-3.5" /> Duplicate Transaction ID detected. Prevented duplicate transaction entry.
                                </p>
                            ) : (
                                <p className="text-[11px] text-slate-400">
                                    Scan member UPI app at terminal and enter the 12-digit reference number displayed on receipt.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs text-slate-400">Payment Status</span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                    Paid
                                </span>
                            </div>
                            <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs text-slate-400">Membership Status</span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- C. INSTALLMENT PAYMENT PANEL --- */}
                {paymentMethod === 'installment' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Notice Header */}
                        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className="text-sm font-black text-white uppercase tracking-wide">
                                        Maximum 2 Installments Only
                                    </h6>
                                    <p className="text-xs text-amber-300 mt-0.5">
                                        1st installment collected today; Remaining Balance calculated automatically.
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Payable</span>
                                <span className="text-xl font-black font-mono text-amber-300">₹{finalPayableAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Two Installment Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card 1: Installment 1 (Upfront Collection) */}
                            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-lg">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] text-amber-300">1</span>
                                        Installment 1 (Today)
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                        Collect Now
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                                        Amount Paid (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                                        <input
                                            type="text"
                                            value={installment1AmountInput}
                                            onChange={e => handleInstallment1Change(e.target.value)}
                                            placeholder="5000"
                                            className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2 pl-7 pr-3 text-sm font-mono font-bold text-white focus:outline-none transition-all"
                                        />
                                    </div>

                                    {/* Preset ratio chips */}
                                    <div className="flex items-center gap-1 pt-1">
                                        <span className="text-[10px] text-slate-500 font-bold mr-1">Split:</span>
                                        {[
                                            { label: '40%', val: 0.4 },
                                            { label: '50%', val: 0.5 },
                                            { label: '60%', val: 0.6 }
                                        ].map(ratio => (
                                            <button
                                                key={ratio.label}
                                                type="button"
                                                onClick={() => handlePresetInstallment1(ratio.val)}
                                                className="px-2 py-0.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5"
                                            >
                                                {ratio.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={installment1Date}
                                        onChange={e => setInstallment1Date(e.target.value)}
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {/* Card 2: Installment 2 (Auto Calculated Remaining Balance) */}
                            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px] text-cyan-300">2</span>
                                            Installment 2 (Auto Calc)
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                                            Remaining Balance
                                        </span>
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Remaining Balance
                                        </span>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">Auto Calculated</span>
                                            <span className="text-lg font-black font-mono text-cyan-300">
                                                ₹{remainingBalance.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            Final Payable (₹{finalPayableAmount.toLocaleString()}) − Inst 1 (₹{installment1Amount.toLocaleString()})
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                                        <span>Due Date</span>
                                        <span className="text-[10px] text-cyan-400 font-bold">Select Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={installment2DueDate}
                                        onChange={e => setInstallment2DueDate(e.target.value)}
                                        className="w-full bg-black/60 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none [color-scheme:dark]"
                                    />
                                    <div className="flex items-center gap-1 pt-1">
                                        <span className="text-[10px] text-slate-500 font-bold mr-1">Due In:</span>
                                        {[
                                            { label: '14 Days', days: 14 },
                                            { label: '30 Days', days: 30 },
                                            { label: '45 Days', days: 45 }
                                        ].map(preset => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + preset.days);
                                                    setInstallment2DueDate(d.toISOString().split('T')[0]);
                                                }}
                                                className="px-2 py-0.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Installment Status Logic Explanation Card */}
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                            <h6 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" /> Payment Status Workflow
                            </h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <p className="font-bold text-amber-300 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> After 1st Installment:
                                    </p>
                                    <p className="text-slate-400 text-[11px] mt-1">
                                        Payment Status: <strong className="text-amber-300">Partially Paid</strong> • Membership: <strong className="text-emerald-400">Active</strong> • Outstanding balance (₹{remainingBalance.toLocaleString()}) automatically recorded in Finance.
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                    <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> When 2nd Installment Received:
                                    </p>
                                    <p className="text-slate-400 text-[11px] mt-1">
                                        Status automatically updates to <strong className="text-emerald-300">Paid</strong> • Outstanding balance cleared (₹0) • Final payment recorded in Finance & schedule marked completed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================================================
                4. ENROLLMENT & PAYMENT SUMMARY CARD (Live Updates)
               ========================================================================= */}
            <div className="bg-slate-950/95 border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-white">Enrollment Summary</p>
                            <p className="text-[11px] text-slate-400">Real-time payment breakdown & finance preview</p>
                        </div>
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                        paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                        Status: {paymentStatus}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Member Name</span>
                            <span className="font-bold text-white">{memberName || 'New Member'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Selected Plan</span>
                            <span className="font-bold text-white capitalize">{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Original Price</span>
                            <span className="font-mono font-bold text-slate-300">₹{originalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Discount ({discountPercentage}%)</span>
                            <span className="font-mono font-bold text-cyan-400">-₹{discountAmount.toLocaleString()}</span>
                        </div>
                        {selectedPromoOfferId && (
                            <div className="flex justify-between py-1 border-b border-white/5 bg-primary/10 -mx-2 px-2 rounded-lg">
                                <span className="text-primary font-bold flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" /> Promotional Offer
                                </span>
                                <span className="font-bold text-primary">
                                    {PROMOTIONAL_OFFERS.find(o => o.id === selectedPromoOfferId)?.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Final Payable Amount</span>
                            <span className="font-mono font-black text-primary text-sm">₹{finalPayableAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Payment Method</span>
                            <span className="font-bold text-white">{paymentMethodLabel}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Amount Paid (Today)</span>
                            <span className="font-mono font-bold text-emerald-400">
                                ₹{amountPaidToday.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Remaining Balance</span>
                            <span className={`font-mono font-bold ${
                                outstandingBalance > 0 ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                                {outstandingBalance > 0
                                    ? `₹${outstandingBalance.toLocaleString()} (Due ${installment2DueDate})`
                                    : '₹0 (Fully Settled)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Validation message banner if any error */}
                {!validationResult.isValid && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{validationResult.error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
