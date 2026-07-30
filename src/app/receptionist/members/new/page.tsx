"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, CreditCard, Dumbbell, ShieldCheck, Mail, Phone, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import NewMemberPaymentStep, { PaymentConfiguration } from '@/components/receptionist/NewMemberPaymentStep';
import { addTransaction } from '@/lib/transactions-store';

type Step = 1 | 2 | 3;

export default function NewMemberRegistration() {
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        plan: 'premium',
        paymentMethod: 'credit'
    });
    const [paymentConfig, setPaymentConfig] = useState<PaymentConfiguration | null>(null);

    const handleNext = () => setStep((s) => Math.min(s + 1, 3) as Step);
    const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 3 && !paymentConfig?.isValid) {
            toast.error(paymentConfig?.validationError || "Please complete all required payment fields.");
            return;
        }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1200));

        if (paymentConfig) {
            addTransaction({
                name: `${formData.firstName} ${formData.lastName}`,
                amount: paymentConfig.paymentMethod === 'installment' ? (paymentConfig.installment1Amount || 0) : paymentConfig.finalPayableAmount,
                desc: `${formData.plan.toUpperCase()} Plan (${paymentConfig.paymentMethodLabel})`,
                status: paymentConfig.paymentStatus === 'Paid' ? 'Completed' : 'Partially Paid',
                method: paymentConfig.paymentMethod === 'upi' ? 'UPI' : paymentConfig.paymentMethod === 'installment' ? 'Installment Payment' : 'Credit/Debit Card',
                source: 'Memberships',
                receptionist: 'Sarah Jenkins',
                originalPrice: paymentConfig.originalPrice,
                discountPercentage: paymentConfig.discountPercentage,
                discountAmount: paymentConfig.discountAmount,
                finalPayableAmount: paymentConfig.finalPayableAmount,
                promoOffer: paymentConfig.promoOffer,
                upiTransactionId: paymentConfig.upiTransactionId,
                installmentDetails: paymentConfig.installment1Amount ? {
                    installment1Amount: paymentConfig.installment1Amount,
                    installment1Date: paymentConfig.installment1Date || new Date().toISOString().split('T')[0],
                    installment2Amount: paymentConfig.installment2Amount || 0,
                    dueDate: paymentConfig.installment2DueDate || '',
                    remainingBalance: paymentConfig.remainingBalance || 0,
                    completed: false
                } : undefined,
                outstandingBalance: paymentConfig.outstandingBalance,
                paymentStatus: paymentConfig.paymentStatus,
                paymentHistory: [
                    {
                        amount: paymentConfig.paymentMethod === 'installment' ? (paymentConfig.installment1Amount || 0) : paymentConfig.finalPayableAmount,
                        date: new Date().toISOString(),
                        method: paymentConfig.paymentMethodLabel,
                        note: `Initial Registration Payment${paymentConfig.upiTransactionId ? ` (UTR: ${paymentConfig.upiTransactionId})` : ''}`
                    }
                ]
            });
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success(`Registration completed! Final Payable: ₹${(paymentConfig?.finalPayableAmount || 0).toLocaleString()} (${paymentConfig?.paymentStatus || 'Paid'})`);
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
                className="max-w-xl mx-auto mt-20"
            >
                <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />

                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>

                    <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Registration Successful!</h2>
                    <p className="text-muted-foreground mb-6">
                        {formData.firstName} {formData.lastName} has been successfully registered to the {formData.plan.toUpperCase()} plan. Their smart access key has been activated.
                    </p>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-8 text-left space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Payment Method:</span>
                            <span className="font-bold text-white">{paymentConfig?.paymentMethodLabel || 'One-Time Payment'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Final Payable Amount:</span>
                            <span className="font-mono font-bold text-primary">₹{(paymentConfig?.finalPayableAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Payment Status:</span>
                            <span className="font-bold text-emerald-400">{paymentConfig?.paymentStatus || 'Paid'}</span>
                        </div>
                        {paymentConfig?.outstandingBalance ? (
                            <div className="flex justify-between border-t border-white/5 pt-2">
                                <span className="text-slate-400">Outstanding Balance (Inst 2):</span>
                                <span className="font-mono font-bold text-amber-400">₹{paymentConfig.outstandingBalance.toLocaleString()} (Due {paymentConfig.installment2DueDate})</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button onClick={() => { setIsSuccess(false); setStep(1); setFormData({ ...formData, firstName: '', lastName: '', email: '', phone: '' }) }} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-all">
                            Register Another
                        </button>
                        <Link href="/receptionist" className="px-6 py-3 rounded-xl bg-primary text-black font-bold gold-glow hover:bg-primary/90 transition-all">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/receptionist" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">New Member Registration</h1>
                    <p className="text-muted-foreground">Enroll new clients quickly into the Nexus System.</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center mb-12 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />
                <div className={`absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -z-10`} style={{ width: `${((step - 1) / 2) * 100}%` }} />

                {[
                    { num: 1, label: 'Personal Info', icon: User },
                    { num: 2, label: 'Membership Plan', icon: Dumbbell },
                    { num: 3, label: 'Payment Setup', icon: CreditCard }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.num ? 'bg-primary border-primary text-black shadow-[0_0_15px_hsl(var(--gold)/0.5)]' : 'bg-charcoal border-white/10 text-muted-foreground'}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-medium ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Form Area */}
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Personal Info */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">Personal Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">First Name</label>
                                        <div className="relative">
                                            <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-black/20 border border-primary/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all" placeholder="John" />
                                            <User className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Last Name</label>
                                        <div className="relative">
                                            <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-black/20 border border-primary/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all" placeholder="Doe" />
                                            <User className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                                        <div className="relative">
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-black/20 border border-primary/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all" placeholder="john@example.com" />
                                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Phone Number</label>
                                        <div className="relative">
                                            <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black/20 border border-primary/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all" placeholder="+1 (555) 000-0000" />
                                            <Phone className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 md:w-1/2 pr-3">
                                    <label className="text-sm font-medium text-slate-300">Date of Birth</label>
                                    <div className="relative">
                                        <input required type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full bg-black/20 border border-primary/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]" />
                                        <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Membership Plan */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">Select a Plan</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'basic', name: 'Basic', price: '₹4,500', desc: 'Gym floor access only' },
                                        { id: 'standard', name: 'Standard', price: '₹7,500', desc: 'Gym floor + Open Classes' },
                                        { id: 'premium', name: 'Premium (Nexus)', price: '₹12,500', desc: 'All access + 2 PT sessions/mo' }
                                    ].map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setFormData({ ...formData, plan: plan.id })}
                                            className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${formData.plan === plan.id ? 'bg-primary/10 border-primary shadow-[0_0_20px_hsl(var(--gold)/0.15)]' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}
                                        >
                                            {formData.plan === plan.id && (
                                                <div className="absolute top-4 right-4 text-primary">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                            <h3 className="font-heading font-bold text-xl text-foreground mb-2">{plan.name}</h3>
                                            <div className="flex items-end gap-1 mb-4">
                                                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                                                <span className="text-sm text-muted-foreground pb-1">/mo</span>
                                            </div>
                                            <p className="text-sm text-slate-400">{plan.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Payment */}
                        {step === 3 && (
                            <motion.div key="step3" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">Payment Configuration</h2>
                                <NewMemberPaymentStep
                                    memberName={`${formData.firstName} ${formData.lastName}`}
                                    memberEmail={formData.email}
                                    memberPhone={formData.phone}
                                    selectedPlan={{
                                        id: formData.plan,
                                        name: formData.plan,
                                        price: formData.plan === 'premium' ? 12500 : formData.plan === 'standard' ? 7500 : 4500
                                    }}
                                    onPaymentConfigChange={setPaymentConfig}
                                    isModal={false}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-12 pt-6 border-t border-white/10">
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-foreground transition-all">
                                Back
                            </button>
                        ) : <div />} {/* Empty div to keep Next button aligned right */}

                        <button
                            type="submit"
                            disabled={isSubmitting || (step === 3 && !paymentConfig?.isValid)}
                            className="px-8 py-2.5 rounded-xl bg-primary text-black font-bold uppercase tracking-wide gold-glow hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing</>
                            ) : step === 3 ? (
                                'Complete Registration'
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
