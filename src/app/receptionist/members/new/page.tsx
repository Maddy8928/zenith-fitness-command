"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, User, CreditCard, Dumbbell, ShieldCheck, Mail, Phone, Calendar, 
    Loader2, CheckCircle2, Percent, DollarSign, Smartphone, Layers, AlertCircle,
    CalendarDays, Tag, ShieldAlert, Sparkles, Check, ArrowRight, Clock, Receipt,
    FileText, HelpCircle, RefreshCw, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { addTransaction, isDuplicateUpiId } from '@/lib/transactions-store';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export default function NewMemberRegistration() {
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state - Personal and Plan
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        plan: 'premium',
    });

    // Helper for plan pricing
    const getPlanPrice = (planId: string) => {
        switch (planId) {
            case 'premium': return 12500;
            case 'standard': return 7500;
            case 'basic': return 4200;
            default: return 12500;
        }
    };

    // Step 3 Payment State
    const [discountPercent, setDiscountPercent] = useState<number>(10);
    const [paymentMethodType, setPaymentMethodType] = useState<'One-Time Payment' | 'UPI Payment' | 'Installment Payment'>('One-Time Payment');
    const [upiTransactionId, setUpiTransactionId] = useState<string>('');
    const [installment1Amount, setInstallment1Amount] = useState<number>(5000);
    const [installment1Date, setInstallment1Date] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [installment2DueDate, setInstallment2DueDate] = useState<string>(
        new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    );
    const [lastCompletedTxId, setLastCompletedTxId] = useState<string>('');

    // Real-Time Calculations
    const originalPrice = getPlanPrice(formData.plan);
    const safeDiscount = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
    const discountAmount = Math.round((originalPrice * safeDiscount) / 100);
    const finalPayable = Math.max(0, originalPrice - discountAmount);

    const safeInstallment1 = Math.min(Math.max(Number(installment1Amount) || 0, 0), finalPayable);
    const installment2Amount = Math.max(0, finalPayable - safeInstallment1);

    // Automatic Status Determination
    const paymentStatus = paymentMethodType === 'Installment Payment' ? 'Partially Paid' : 'Paid';
    const membershipStatus = 'Active';
    const amountPaid = paymentMethodType === 'Installment Payment' ? safeInstallment1 : finalPayable;
    const remainingBalance = paymentMethodType === 'Installment Payment' ? installment2Amount : 0;

    const isUpiDuplicate = useMemo(() => {
        if (!upiTransactionId.trim()) return false;
        return isDuplicateUpiId(upiTransactionId);
    }, [upiTransactionId]);

    const handleNext = () => setStep((s) => Math.min(s + 1, 3) as Step);
    const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

    const generateSampleUpiId = () => {
        const sampleId = `UPI-${new Date().getFullYear()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
        setUpiTransactionId(sampleId);
        toast.info(`Sample UPI ID generated: ${sampleId}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Rules
        if (safeDiscount > 100 || safeDiscount < 0) {
            toast.error('Discount cannot exceed 100%');
            return;
        }

        if (paymentMethodType === 'UPI Payment') {
            if (!upiTransactionId || !upiTransactionId.trim()) {
                toast.error('UPI Transaction ID is mandatory for UPI payments');
                return;
            }
            if (isUpiDuplicate) {
                toast.error('Duplicate UPI Transaction ID detected. Please use a unique Transaction ID.');
                return;
            }
        }

        if (paymentMethodType === 'Installment Payment') {
            if (safeInstallment1 <= 0) {
                toast.error('Installment 1 amount must be greater than zero.');
                return;
            }
            if (safeInstallment1 > finalPayable) {
                toast.error('Installment 1 cannot exceed Final Payable Amount.');
                return;
            }
            if (!installment2DueDate) {
                toast.error('Please select a Due Date for Installment 2.');
                return;
            }
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Finance Integration: Save in Finance module
        const txMethod = paymentMethodType === 'UPI Payment' ? 'UPI'
            : paymentMethodType === 'Installment Payment' ? 'Installment'
            : 'Credit/Debit Card';

        const savedTx = addTransaction({
            name: `${formData.firstName} ${formData.lastName}`.trim() || 'New Member',
            amount: finalPayable,
            desc: `${formData.plan.toUpperCase()} Plan Membership (${paymentMethodType})`,
            status: paymentMethodType === 'Installment Payment' ? 'Partially Paid' : 'Completed',
            method: txMethod,
            source: 'Memberships',
            receptionist: 'Sarah Jenkins',
            originalPrice,
            discountPercent: safeDiscount,
            discountAmount,
            finalPayable,
            amountPaid,
            upiTransactionId: paymentMethodType === 'UPI Payment' ? upiTransactionId.trim() : undefined,
            paymentMethodType,
            installmentDetails: paymentMethodType === 'Installment Payment' ? {
                installment1Amount: safeInstallment1,
                installment1Date: installment1Date,
                installment2Amount: installment2Amount,
                installment2DueDate: installment2DueDate,
                scheduleCompleted: false
            } : undefined,
            outstandingBalance: remainingBalance,
            paymentStatus: paymentMethodType === 'Installment Payment' ? 'Partially Paid' : 'Paid',
            membershipStatus: 'Active',
            paymentHistory: [
                {
                    id: `PAY-${Date.now()}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    amount: amountPaid,
                    method: txMethod,
                    note: paymentMethodType === 'Installment Payment' ? '1st Installment collected during enrollment' : 'Full payment collected'
                }
            ]
        });

        setLastCompletedTxId(savedTx.id);
        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success('Registration completed! Payment recorded in Finance module.');
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto mt-12 pb-16"
            >
                <div className="glass-card rounded-3xl p-8 md:p-10 text-center relative overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_hsl(142,70%,45%,0.15)]">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />

                    <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-lg">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>

                    <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Registration Completed!</h2>
                    <p className="text-muted-foreground mb-6">
                        <strong className="text-foreground">{formData.firstName} {formData.lastName}</strong> has been successfully enrolled into the <span className="text-primary font-bold uppercase">{formData.plan}</span> membership. Smart access key activated.
                    </p>

                    {/* ERP Financial Receipt Summary Card */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-left mb-8 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-primary" />
                                <span className="font-heading font-bold text-sm uppercase tracking-wider text-white">Finance Receipt Audit</span>
                            </div>
                            <span className="font-mono text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                                {lastCompletedTxId}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Original Membership Price</span>
                                    <span className="font-mono text-foreground font-semibold">₹{originalPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount Applied ({safeDiscount}%)</span>
                                    <span className="font-mono text-emerald-400 font-semibold">−₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                                    <span className="text-white">Final Payable Amount</span>
                                    <span className="font-mono text-primary text-base">₹{finalPayable.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="space-y-2 md:border-l md:border-white/10 md:pl-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium text-foreground">{paymentMethodType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount Paid Today</span>
                                    <span className="font-mono text-emerald-400 font-bold">₹{amountPaid.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Remaining Balance</span>
                                    <span className={`font-mono font-bold ${remainingBalance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                        ₹{remainingBalance.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {paymentMethodType === 'Installment Payment' && (
                            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs flex items-center justify-between text-amber-300">
                                <span className="flex items-center gap-1.5 font-semibold">
                                    <Clock className="w-4 h-4" />
                                    Installment 2 Due: {new Date(installment2DueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="font-mono font-bold">₹{remainingBalance.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        {paymentMethodType === 'UPI Payment' && upiTransactionId && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs flex items-center justify-between text-primary">
                                <span className="font-semibold">UPI Verification Ref:</span>
                                <span className="font-mono font-bold">{upiTransactionId}</span>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Payment Status:</span>
                                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                                    paymentStatus === 'Paid'
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                }`}>
                                    {paymentStatus}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Membership Status:</span>
                                <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    {membershipStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <button 
                            onClick={() => { 
                                setIsSuccess(false); 
                                setStep(1); 
                                setFormData({ ...formData, firstName: '', lastName: '', email: '', phone: '' }); 
                                setDiscountPercent(10);
                                setPaymentMethodType('One-Time Payment');
                                setUpiTransactionId('');
                                setInstallment1Amount(5000);
                            }} 
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-semibold transition-all border border-white/10"
                        >
                            Register Another Member
                        </button>
                        <Link 
                            href="/admin/finance" 
                            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-primary font-semibold transition-all border border-primary/30 flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> View in Finance
                        </Link>
                        <Link 
                            href="/receptionist" 
                            className="px-6 py-3 rounded-xl bg-primary text-black font-bold uppercase tracking-wide gold-glow hover:bg-primary/90 transition-all"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-16">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/receptionist" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors border border-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">New Member Registration</h1>
                        <p className="text-muted-foreground text-sm">Enterprise multi-step client onboarding with automated finance ERP calculation.</p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Finance Active</span>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center mb-10 relative px-4 max-w-2xl mx-auto">
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/5 -z-10" />
                <div className="absolute top-1/2 left-4 h-0.5 bg-primary transition-all duration-500 -z-10" style={{ width: `${((step - 1) / 2) * 100}%` }} />

                {[
                    { num: 1, label: 'Personal Info', icon: User },
                    { num: 2, label: 'Membership Plan', icon: Dumbbell },
                    { num: 3, label: 'Payment Setup', icon: CreditCard }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 font-bold ${
                            step >= s.num ? 'bg-primary border-primary text-black shadow-[0_0_20px_hsl(var(--gold)/0.4)] scale-105' : 'bg-charcoal border-white/10 text-muted-foreground'
                        }`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Form Area */}
            <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-emerald-400" />

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Personal Info */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-heading font-semibold text-foreground">Personal Details</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">Enter the member&apos;s legal name and verified contact details.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">First Name <span className="text-primary">*</span></label>
                                        <div className="relative">
                                            <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all" placeholder="John" />
                                            <User className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Last Name <span className="text-primary">*</span></label>
                                        <div className="relative">
                                            <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all" placeholder="Doe" />
                                            <User className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email Address <span className="text-primary">*</span></label>
                                        <div className="relative">
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all" placeholder="john@example.com" />
                                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Phone Number <span className="text-primary">*</span></label>
                                        <div className="relative">
                                            <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all" placeholder="+91 98765 43210" />
                                            <Phone className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 md:w-1/2 pr-3">
                                    <label className="text-sm font-medium text-slate-300">Date of Birth <span className="text-primary">*</span></label>
                                    <div className="relative">
                                        <input required type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all [color-scheme:dark]" />
                                        <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Membership Plan */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-heading font-semibold text-foreground">Select Membership Plan</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">All plans include smart access key activation and app synchronization.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'basic', name: 'Basic', price: '₹4,200', val: 4200, desc: 'Gym floor access only', border: 'border-slate-500/30' },
                                        { id: 'standard', name: 'Standard', price: '₹7,500', val: 7500, desc: 'Gym floor + Open Classes', border: 'border-cyan-500/30' },
                                        { id: 'premium', name: 'Premium (Flex)', price: '₹12,500', val: 12500, desc: 'All access + 2 PT sessions/mo', border: 'border-primary/40' }
                                    ].map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => {
                                                setFormData({ ...formData, plan: plan.id });
                                                // Recalculate default installment 1 amount when plan changes
                                                const newOrig = getPlanPrice(plan.id);
                                                const newDisc = Math.round((newOrig * safeDiscount) / 100);
                                                const newFinal = newOrig - newDisc;
                                                setInstallment1Amount(Math.min(installment1Amount, newFinal));
                                            }}
                                            className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${
                                                formData.plan === plan.id 
                                                    ? 'bg-primary/10 border-primary shadow-[0_0_25px_hsl(var(--gold)/0.25)] scale-[1.02]' 
                                                    : 'bg-black/30 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            {formData.plan === plan.id && (
                                                <div className="absolute top-4 right-4 text-primary bg-primary/20 p-1 rounded-full">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly Plan</span>
                                            <h3 className="font-heading font-bold text-2xl text-foreground mt-1 mb-3">{plan.name}</h3>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-3xl font-mono font-black text-primary">{plan.price}</span>
                                                <span className="text-sm text-muted-foreground">/mo</span>
                                            </div>
                                            <p className="text-sm text-slate-400 border-t border-white/10 pt-3">{plan.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Payment Configuration (Enterprise ERP Enhanced) */}
                        {step === 3 && (
                            <motion.div key="step3" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h2 className="text-2xl font-heading font-semibold text-foreground">Step 3 – Payment & Financial Setup</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">Apply discount, select payment method, and review instant calculations.</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                                        <Tag className="w-3.5 h-3.5" />
                                        <span>ERP Auto-Calculate</span>
                                    </div>
                                </div>

                                {/* 1. DISCOUNT MANAGEMENT SECTION (TOP OF PAYMENT STEP) */}
                                <div className="glass-card rounded-2xl p-6 border border-white/10 bg-black/40 space-y-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                                                <Percent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-heading font-bold text-base text-foreground">Discount Management (%)</h3>
                                                <p className="text-xs text-muted-foreground">Enter discount percentage before collecting payment. Updates in real-time.</p>
                                            </div>
                                        </div>

                                        {/* Numerical Input & Quick Presets */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {[0, 5, 10, 15, 20, 25].map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => {
                                                        setDiscountPercent(preset);
                                                        const newDisc = Math.round((originalPrice * preset) / 100);
                                                        const newFinal = originalPrice - newDisc;
                                                        if (installment1Amount > newFinal) setInstallment1Amount(newFinal);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                                                        safeDiscount === preset
                                                            ? 'bg-primary text-black border-primary shadow-sm font-black'
                                                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30'
                                                    }`}
                                                >
                                                    {preset}%
                                                </button>
                                            ))}
                                            <div className="relative w-28">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={discountPercent === 0 ? '' : discountPercent}
                                                    placeholder="0"
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                                                        setDiscountPercent(val);
                                                        const newDisc = Math.round((originalPrice * val) / 100);
                                                        const newFinal = originalPrice - newDisc;
                                                        if (installment1Amount > newFinal) setInstallment1Amount(newFinal);
                                                    }}
                                                    className="w-full bg-black/50 border border-primary/30 rounded-lg py-1.5 pl-3 pr-8 text-sm font-mono font-bold text-primary focus:outline-none focus:border-primary"
                                                />
                                                <span className="absolute right-3 top-1.5 text-xs text-muted-foreground font-mono">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Discount Slider */}
                                    <div className="space-y-2 pt-1">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={safeDiscount}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setDiscountPercent(val);
                                                const newDisc = Math.round((originalPrice * val) / 100);
                                                const newFinal = originalPrice - newDisc;
                                                if (installment1Amount > newFinal) setInstallment1Amount(newFinal);
                                            }}
                                            className="w-full accent-primary h-2 bg-black/60 rounded-lg cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                            <span>0% (No Discount)</span>
                                            <span>25% (Corporate/Staff)</span>
                                            <span>50% (Special Promo)</span>
                                            <span>100% (Full Waiver)</span>
                                        </div>
                                    </div>

                                    {/* Real-Time Price Breakdown Strip */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">Original Price</span>
                                            <span className="font-mono font-bold text-base text-foreground">₹{originalPrice.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">Discount ({safeDiscount}%)</span>
                                            <span className="font-mono font-bold text-base text-emerald-400">−₹{discountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">Discount Amount</span>
                                            <span className="font-mono font-bold text-base text-emerald-400">₹{discountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="bg-white/[0.05] p-3 rounded-xl border border-white/15">
                                            <span className="text-slate-300 block text-[11px] uppercase tracking-wider font-semibold">Final Payable</span>
                                            <span className="font-mono font-bold text-lg text-white">₹{finalPayable.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. PAYMENT METHOD SELECTION */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Select Payment Option</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: 'One-Time Payment' as const,
                                                title: 'One-Time Payment',
                                                icon: DollarSign,
                                                desc: 'Immediate full settlement via card, cash, or terminal.',
                                                badge: 'Instant Paid • Active'
                                            },
                                            {
                                                id: 'UPI Payment' as const,
                                                title: 'UPI Payment',
                                                icon: Smartphone,
                                                desc: 'Instant verification via UPI ID or QR (GPay, PhonePe).',
                                                badge: 'Transaction ID Required'
                                            },
                                            {
                                                id: 'Installment Payment' as const,
                                                title: 'Installment Payment',
                                                icon: Layers,
                                                desc: 'Split fee into a maximum of 2 installments.',
                                                badge: 'Max 2 Installments'
                                            },
                                        ].map((pm) => (
                                            <div
                                                key={pm.id}
                                                onClick={() => setPaymentMethodType(pm.id)}
                                                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative ${
                                                    paymentMethodType === pm.id
                                                        ? 'bg-white/[0.07] border-white/30 shadow-lg scale-[1.02]'
                                                        : 'bg-black/30 border-white/10 hover:border-white/25'
                                                }`}
                                            >
                                                {paymentMethodType === pm.id && (
                                                    <div className="absolute top-3 right-3 text-white">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                                                        paymentMethodType === pm.id ? 'bg-white/15 text-white' : 'bg-white/5 text-muted-foreground'
                                                    }`}>
                                                        <pm.icon className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-heading font-bold text-base text-foreground mb-1">{pm.title}</h4>
                                                    <p className="text-xs text-slate-400 mb-4">{pm.desc}</p>
                                                </div>
                                                <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit ${
                                                    paymentMethodType === pm.id ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-slate-400'
                                                }`}>
                                                    {pm.badge}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. METHOD-SPECIFIC DYNAMIC CONFIGURATION AREA */}
                                <div className="p-6 rounded-2xl bg-charcoal/40 border border-white/10 space-y-4">
                                    {paymentMethodType === 'One-Time Payment' && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-heading font-bold text-base text-foreground">One-Time Full Settlement</h4>
                                                        <p className="text-xs text-muted-foreground">Membership activates immediately upon payment confirmation.</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-muted-foreground block">Amount to Collect</span>
                                                    <span className="font-mono font-black text-2xl text-primary">₹{finalPayable.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                                                <Check className="w-4 h-4 flex-shrink-0" />
                                                <span>Upon completion: Payment Status will be automatically marked as <strong>PAID</strong>, membership status set to <strong>ACTIVE</strong>, and invoice archived in Finance.</span>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethodType === 'UPI Payment' && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-heading font-bold text-base text-foreground">UPI Transaction Verification</h4>
                                                    <p className="text-xs text-muted-foreground">Enter the 12-digit UPI reference or transaction ID from GPay / PhonePe / Paytm.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={generateSampleUpiId}
                                                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    Generate Sample ID
                                                </button>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                                    UPI Transaction ID <span className="text-primary">* (Required)</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g., UPI-2026-98432109 or 420918342109"
                                                        value={upiTransactionId}
                                                        onChange={(e) => setUpiTransactionId(e.target.value)}
                                                        className={`w-full bg-black/50 border rounded-xl py-3 pl-11 pr-4 font-mono text-sm text-foreground focus:outline-none transition-colors ${
                                                            isUpiDuplicate
                                                                ? 'border-rose-500 text-rose-300 focus:border-rose-500'
                                                                : 'border-white/15 focus:border-primary'
                                                        }`}
                                                    />
                                                    <Smartphone className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                                </div>
                                                {isUpiDuplicate ? (
                                                    <p className="text-xs text-rose-400 flex items-center gap-1.5 font-semibold mt-1">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        Duplicate ID detected: This UPI Transaction ID already exists in the Finance module.
                                                    </p>
                                                ) : upiTransactionId.trim() ? (
                                                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Valid Transaction ID format.
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethodType === 'Installment Payment' && (
                                        <div className="space-y-5 animate-in fade-in duration-300">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                                                <div>
                                                    <h4 className="font-heading font-bold text-base text-foreground">Installment Schedule (2 Installments Only)</h4>
                                                    <p className="text-xs text-muted-foreground">The receptionist enters Installment 1; Remaining Balance and Installment 2 calculate automatically.</p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium w-fit">
                                                    Status: Partially Paid upon check-in
                                                </span>
                                            </div>

                                            {/* Two Installment Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* INSTALLMENT 1 CARD (ENTERED BY RECEPTIONIST) */}
                                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm hover:border-white/20 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Installment 1 (Today)</span>
                                                        <span className="text-[10px] uppercase font-medium text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                                                            Immediate
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-slate-400 font-medium">Amount Paid (₹)</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={finalPayable}
                                                                value={installment1Amount === 0 ? '' : installment1Amount}
                                                                placeholder="0"
                                                                onChange={(e) => setInstallment1Amount(e.target.value === '' ? 0 : Number(e.target.value))}
                                                                className="w-full bg-black/50 border border-white/15 rounded-xl py-2.5 pl-8 pr-4 font-mono text-base font-semibold text-white focus:outline-none focus:border-white/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-medium">₹</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-slate-400 font-medium">Payment Date</label>
                                                        <input
                                                            type="date"
                                                            value={installment1Date}
                                                            onChange={(e) => setInstallment1Date(e.target.value)}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* INSTALLMENT 2 CARD (AUTOMATICALLY CALCULATED REMAINING BALANCE) */}
                                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm hover:border-white/20 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Installment 2 (Remaining)</span>
                                                        <span className="text-[10px] uppercase font-medium text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                                                            Auto-Calculated
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-slate-400 font-medium">Remaining Balance (₹)</label>
                                                        <div className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 font-mono text-base font-semibold text-white flex items-center justify-between">
                                                            <span>₹{remainingBalance.toLocaleString('en-IN')}</span>
                                                            <span className="text-[11px] font-sans text-slate-400 uppercase font-normal">
                                                                (₹{finalPayable} − ₹{safeInstallment1})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-slate-400 font-medium">Due Date <span className="text-slate-300">*</span></label>
                                                        <input
                                                            type="date"
                                                            required
                                                            value={installment2DueDate}
                                                            onChange={(e) => setInstallment2DueDate(e.target.value)}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-slate-400 text-xs flex items-start gap-2.5">
                                                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                <p>
                                                    <strong>Automated Installment Lifecycle:</strong> First installment sets payment status to <strong>Partially Paid</strong> and records Outstanding Balance of <strong>₹{remainingBalance.toLocaleString('en-IN')}</strong>. When Installment 2 is received, the Finance module automatically updates status to <strong>PAID</strong> and clears the balance.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 4. ENTERPRISE ENROLLMENT SUMMARY & FINANCIAL BREAKDOWN */}
                                <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-br from-black/60 to-emerald-950/20 space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-emerald-400" />
                                            <h3 className="font-heading font-bold text-base text-white uppercase tracking-wider">Enrollment Summary & Financial Breakdown</h3>
                                        </div>
                                        <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                            Real-Time Auto-Calculate
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Member Legal Name</span>
                                                <span className="font-semibold text-white">{formData.firstName} {formData.lastName || '(Pending)'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Selected Plan</span>
                                                <span className="font-semibold text-primary uppercase">{formData.plan}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Original Membership Price</span>
                                                <span className="font-mono text-white font-medium">₹{originalPrice.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Discount ({safeDiscount}%)</span>
                                                <span className="font-mono text-emerald-400 font-semibold">−₹{discountAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 md:border-l md:border-white/10 md:pl-5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Selected Payment Method</span>
                                                <span className="font-semibold text-white">{paymentMethodType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Final Payable Amount</span>
                                                <span className="font-mono text-primary font-bold">₹{finalPayable.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Amount Paid (Today)</span>
                                                <span className="font-mono text-emerald-400 font-bold">₹{amountPaid.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Remaining Balance</span>
                                                <span className={`font-mono font-bold ${remainingBalance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    ₹{remainingBalance.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-slate-400">Payment Status:</span>
                                                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                                                    paymentStatus === 'Paid'
                                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                }`}>
                                                    {paymentStatus}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-slate-400">Membership Status:</span>
                                                <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    {membershipStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-mono">
                                            All finance records auto-sync to Admin ERP
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-foreground font-semibold transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        <button
                            type="submit"
                            disabled={isSubmitting || isUpiDuplicate}
                            className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center gap-2.5 shadow-lg ${
                                isSubmitting || isUpiDuplicate
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary text-black gold-glow hover:bg-primary/90'
                            }`}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Completing Registration...</>
                            ) : step === 3 ? (
                                <><CheckCircle2 className="w-5 h-5" /> Complete Registration & Sync Finance</>
                            ) : (
                                <>Continue to Step {step + 1} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
