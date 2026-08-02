"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, CreditCard, CalendarDays, Activity, Mail, Phone, Dumbbell, ShieldCheck, Users, Clock, AlertTriangle, X, User, Check, CheckCircle2, Loader2, ArrowRight, ArrowLeft as ArrowLeftIcon, Edit, Trash2, Flame, History, Award, Download } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import NewMemberPaymentStep, { PaymentConfiguration } from '@/components/receptionist/NewMemberPaymentStep';
import { addTransaction } from '@/lib/transactions-store';

interface Transfer {
    id: string;
    senderName: string;
    senderEmail: string;
    senderId?: string;
    recipientType: 'existing' | 'new';
    recipientEmail: string;
    recipientName?: string;
    recipientPhone?: string;
    planName: string;
    nextBilling?: string;
    requestedAt?: string;
    processedAt?: string;
    processedBy?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    remainingValidity?: string;
    notes?: string;
    rejectionReason?: string;
    cancelledAt?: string;
}

const mockMembers = [
    { id: '1', name: 'Michael Chen', email: 'michael.c@example.com', phone: '(555) 123-4567', plan: 'Premium', status: 'Active', joinDate: '2023-10-15', lastVisit: 'Today, 10:42 AM' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '(555) 987-6543', plan: 'Standard', status: 'Active', joinDate: '2023-11-02', lastVisit: 'Yesterday, 6:15 PM' },
    { id: '3', name: 'David Miller', email: 'david.m@example.com', phone: '(555) 456-7890', plan: 'Basic', status: 'Expiring Soon', joinDate: '2024-01-20', lastVisit: '3 days ago' },
    { id: '4', name: 'Emma Wilson', email: 'emma.w@example.com', phone: '(555) 234-5678', plan: 'Premium', status: 'Active', joinDate: '2023-08-10', lastVisit: 'Today, 09:50 AM' },
    { id: '5', name: 'James Thompson', email: 'james.t@example.com', phone: '(555) 876-5432', plan: 'Basic', status: 'Inactive', joinDate: '2023-05-15', lastVisit: '2 weeks ago' },
    { id: '6', name: 'Olivia Davis', email: 'olivia.d@example.com', phone: '(555) 345-6789', plan: 'Standard', status: 'Active', joinDate: '2024-02-01', lastVisit: 'Yesterday, 8:30 AM' },
    { id: '8', name: 'Sophia Martinez', email: 'sophia.m@example.com', phone: '(555) 012-3456', plan: 'Standard', status: 'Installment', joinDate: '2024-02-28', lastVisit: 'Never', paymentStatus: 'Partially Paid', paymentMethod: 'Installment Payment', outstandingBalance: 3750 },
    { id: '9', name: 'Alex Mercer', email: 'alex.m@example.com', phone: '(555) 890-1234', plan: 'Premium', status: 'Installment', joinDate: '2024-03-01', lastVisit: 'Yesterday, 5:00 PM', paymentStatus: 'Partially Paid', paymentMethod: 'Installment Payment', outstandingBalance: 6000 },
];

export default function MembersManagementPanel() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [membersList, setMembersList] = useState<any[]>(mockMembers);
    const [activeTab, setActiveTab] = useState<'directory' | 'transfers'>('directory');
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const { addNotification } = useNotifications();

    // ── New Member Modal ────────────────────────────────────────────────────────
    const [showNewMemberModal, setShowNewMemberModal] = useState(false);
    const [newMemberStep, setNewMemberStep] = useState<1 | 2 | 3>(1);
    const [isSubmittingMember, setIsSubmittingMember] = useState(false);
    const [newMemberForm, setNewMemberForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'Male',
        plan: 'standard',
        paymentMethod: 'UPI' as 'UPI' | 'Cash' | 'Credit/Debit Card' | 'Bank Transfer',
    });
    const [paymentConfig, setPaymentConfig] = useState<PaymentConfiguration | null>(null);

    // ── Three-Dots Actions & Modals ─────────────────────────────────────────────
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [selectedAttendanceMember, setSelectedAttendanceMember] = useState<any | null>(null);
    const [selectedEditMember, setSelectedEditMember] = useState<any | null>(null);
    const [selectedDeleteMember, setSelectedDeleteMember] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        plan: 'Standard',
        status: 'Active'
    });
    const [attendanceTab, setAttendanceTab] = useState<'all' | 'this_week' | 'this_month'>('all');

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdownId(null);
        };
        if (activeDropdownId) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [activeDropdownId]);

    const handleSaveEditMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEditMember) return;
        setMembersList(prev =>
            prev.map(m =>
                m.id === selectedEditMember.id
                    ? { ...m, ...editForm }
                    : m
            )
        );
        toast.success(`Member details for "${editForm.name}" updated successfully!`);
        setSelectedEditMember(null);
    };

    const handleConfirmDeleteMember = () => {
        if (!selectedDeleteMember) return;
        setMembersList(prev => prev.filter(m => m.id !== selectedDeleteMember.id));
        toast.success(`${selectedDeleteMember.name} has been removed from the directory.`);
        setSelectedDeleteMember(null);
    };

    const getMemberAttendanceLogs = (member: any) => {
        if (!member) return [];
        const logs = [
            {
                id: 'log-1',
                date: 'Today, 30 Jul 2026',
                checkIn: '06:45 AM',
                checkOut: '08:15 AM',
                duration: '1h 30m',
                status: 'Present — On Time',
                zone: 'Main Gym Floor & Cardio Zone',
                type: 'on_time'
            },
            {
                id: 'log-2',
                date: 'Yesterday, 29 Jul 2026',
                checkIn: '07:05 AM',
                checkOut: '08:30 AM',
                duration: '1h 25m',
                status: 'Present — On Time',
                zone: 'Free Weights & Strength Area',
                type: 'on_time'
            },
            {
                id: 'log-3',
                date: '28 Jul 2026',
                checkIn: '07:25 AM',
                checkOut: '08:45 AM',
                duration: '1h 20m',
                status: 'Late Check-in',
                zone: 'Cardio & HIIT Zone',
                type: 'late'
            },
            {
                id: 'log-4',
                date: '26 Jul 2026',
                checkIn: '06:50 AM',
                checkOut: '08:20 AM',
                duration: '1h 30m',
                status: 'Present — On Time',
                zone: 'Main Gym Floor & Functional',
                type: 'on_time'
            },
            {
                id: 'log-5',
                date: '25 Jul 2026',
                checkIn: '06:40 AM',
                checkOut: '08:10 AM',
                duration: '1h 30m',
                status: 'Present — On Time',
                zone: 'Free Weights Area',
                type: 'on_time'
            },
            {
                id: 'log-6',
                date: '23 Jul 2026',
                checkIn: '07:15 AM',
                checkOut: '08:40 AM',
                duration: '1h 25m',
                status: 'Late Check-in',
                zone: 'Cardio Zone',
                type: 'late'
            },
            {
                id: 'log-7',
                date: '21 Jul 2026',
                checkIn: '06:55 AM',
                checkOut: '08:30 AM',
                duration: '1h 35m',
                status: 'Present — On Time',
                zone: 'Strength & Conditioning',
                type: 'on_time'
            }
        ];
        if (attendanceTab === 'this_week') {
            return logs.slice(0, 3);
        }
        if (attendanceTab === 'this_month') {
            return logs.slice(0, 5);
        }
        return logs;
    };

    const resetNewMemberModal = () => {
        setNewMemberStep(1);
        setNewMemberForm({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: 'Male', plan: 'standard', paymentMethod: 'UPI' });
        setPaymentConfig(null);
        setIsSubmittingMember(false);
        setShowNewMemberModal(false);
    };

    const handleNewMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMemberStep < 3) {
            setNewMemberStep((s) => (s + 1) as 1 | 2 | 3);
            return;
        }
        if (newMemberStep === 3 && !paymentConfig?.isValid) {
            toast.error(paymentConfig?.validationError || "Please complete all required payment fields.");
            return;
        }
        setIsSubmittingMember(true);
        await new Promise(resolve => setTimeout(resolve, 1200));

        const newMember = {
            id: (membersList.length + 1).toString(),
            name: `${newMemberForm.firstName} ${newMemberForm.lastName}`,
            email: newMemberForm.email,
            phone: newMemberForm.phone,
            plan: newMemberForm.plan === 'premium' ? 'Premium' : newMemberForm.plan === 'standard' ? 'Standard' : 'Basic',
            status: (paymentConfig?.paymentMethod === 'installment' || paymentConfig?.paymentStatus === 'Partially Paid') ? 'Installment' : 'Active',
            joinDate: new Date().toISOString().split('T')[0],
            lastVisit: 'Never',
            paymentStatus: paymentConfig?.paymentStatus || 'Paid',
            outstandingBalance: paymentConfig?.outstandingBalance || 0,
            paymentMethod: paymentConfig?.paymentMethodLabel || 'One-Time Payment',
            upiTransactionId: paymentConfig?.upiTransactionId,
            installmentDetails: paymentConfig?.installment1Amount ? {
                installment1Amount: paymentConfig.installment1Amount,
                installment1Date: paymentConfig.installment1Date || new Date().toISOString().split('T')[0],
                installment2Amount: paymentConfig.installment2Amount || 0,
                dueDate: paymentConfig.installment2DueDate || '',
                remainingBalance: paymentConfig.remainingBalance || 0,
                completed: false
            } : undefined
        };
        setMembersList(prev => [...prev, newMember as any]);

        if (paymentConfig) {
            addTransaction({
                name: newMember.name,
                amount: paymentConfig.paymentMethod === 'installment' ? (paymentConfig.installment1Amount || 0) : paymentConfig.finalPayableAmount,
                desc: `${newMember.plan} Plan (${paymentConfig.paymentMethodLabel})`,
                status: paymentConfig.paymentStatus === 'Paid' ? 'Completed' : 'Partially Paid',
                method: paymentConfig.paymentMethod === 'upi' ? 'UPI' : paymentConfig.paymentMethod === 'installment' ? 'Installment Payment' : 'Credit/Debit Card',
                source: 'Memberships',
                receptionist: user?.name || 'Sarah Jenkins',
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

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'low',
            title: '✅ New Member Registered',
            message: `${newMember.name} enrolled on ${newMember.plan} (${paymentConfig?.paymentStatus || 'Paid'}).`,
        });

        toast.success(`${newMember.name} registered on ${newMember.plan} plan! Final Payable: ₹${(paymentConfig?.finalPayableAmount || 0).toLocaleString()} (${paymentConfig?.paymentStatus || 'Paid'})`);
        resetNewMemberModal();
    };

    const handleCollectInstallment = (memberId: string) => {
        setMembersList(prev => prev.map(m => {
            if (m.id === memberId) {
                const bal = (m as any).outstandingBalance || 0;
                if (bal > 0) {
                    addTransaction({
                        name: m.name,
                        amount: bal,
                        desc: `${m.plan} Plan (2nd Installment Settlement)`,
                        status: 'Completed',
                        method: 'Cash',
                        source: 'Memberships',
                        receptionist: user?.name || 'Sarah Jenkins',
                        paymentStatus: 'Paid',
                        outstandingBalance: 0
                    });
                    toast.success(`Collected 2nd Installment of ₹${bal.toLocaleString()} for ${m.name}! Status updated to Paid.`);
                }
                return {
                    ...m,
                    paymentStatus: 'Paid',
                    outstandingBalance: 0
                };
            }
            return m;
        }));
    };
    // ────────────────────────────────────────────────────────────────────────────

    // Unified Transfer module filter states
    const [transferSearchTerm, setTransferSearchTerm] = useState('');
    const [transferFilterStatus, setTransferFilterStatus] = useState('All');
    const [transferStartDate, setTransferStartDate] = useState('');
    const [transferEndDate, setTransferEndDate] = useState('');
    const [selectedHistoryTransfer, setSelectedHistoryTransfer] = useState<Transfer | null>(null);
    const [isHistoryDetailsOpen, setIsHistoryDetailsOpen] = useState(false);

    const loadTransfers = () => {
        try {
            const savedTransfers = localStorage.getItem('zenith_membership_transfers');
            if (savedTransfers) {
                setTransfers(JSON.parse(savedTransfers));
            } else {
                setTransfers([]);
            }
        } catch (e) {
            setTransfers([]);
        }
    };

    useEffect(() => {
        loadTransfers();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'zenith_membership_transfers') {
                loadTransfers();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', loadTransfers);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', loadTransfers);
        };
    }, []);

    const handleApproveTransfer = (transfer: Transfer) => {
        const updatedTransfers = transfers.map(t => 
            t.id === transfer.id ? { 
                ...t, 
                status: 'approved' as const,
                processedBy: user?.name || 'Alice Frontdesk',
                processedAt: new Date().toISOString(),
                remainingValidity: transfer.nextBilling || 'N/A'
            } : t
        );
        setTransfers(updatedTransfers);
        localStorage.setItem('zenith_membership_transfers', JSON.stringify(updatedTransfers));

        const senderSubscription = {
            name: transfer.planName,
            price: 7499,
            interval: 'monthly',
            nextBilling: transfer.nextBilling,
            status: 'Transferred',
            features: []
        };
        localStorage.setItem('zenith_member_subscription', JSON.stringify(senderSubscription));

        let updatedMembers = [...membersList];
        updatedMembers = updatedMembers.map(m => 
            m.email === transfer.senderEmail
                ? { ...m, plan: 'None', status: 'Inactive' }
                : m
        );

        if (transfer.recipientType === 'existing') {
            updatedMembers = updatedMembers.map(m => 
                m.email === transfer.recipientEmail
                    ? { ...m, plan: transfer.planName.replace(' VIP', ''), status: 'Active' }
                    : m
            );
            
            const recipientSubscription = {
                name: transfer.planName,
                price: 7499,
                interval: 'monthly',
                nextBilling: transfer.nextBilling,
                status: 'Active',
                features: ['Unlimited Gym Access', '2 PT Sessions / Month', 'Locker Included', 'Spa & Sauna Access']
            };
            localStorage.setItem(`zenith_member_${transfer.recipientEmail}_subscription`, JSON.stringify(recipientSubscription));
        } else {
            const newMemberId = (updatedMembers.length + 1).toString();
            const newMember = {
                id: newMemberId,
                name: transfer.recipientName || 'New Recipient',
                email: transfer.recipientEmail,
                phone: transfer.recipientPhone || '(555) 000-0000',
                plan: transfer.planName.replace(' VIP', ''),
                status: 'Active',
                joinDate: new Date().toISOString().split('T')[0],
                lastVisit: 'Never'
            };
            updatedMembers.push(newMember);

            const recipientSubscription = {
                name: transfer.planName,
                price: 7499,
                interval: 'monthly',
                nextBilling: transfer.nextBilling,
                status: 'Active',
                features: ['Unlimited Gym Access', '2 PT Sessions / Month', 'Locker Included', 'Spa & Sauna Access']
            };
            localStorage.setItem(`zenith_member_${transfer.recipientEmail}_subscription`, JSON.stringify(recipientSubscription));
        }

        setMembersList(updatedMembers);
        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            userId: transfer.senderId,
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '✅ Membership Transfer Approved',
            message: `Your request to transfer your ${transfer.planName} membership to ${transfer.recipientEmail} has been approved.`,
        });

        addNotification({
            role: 'member',
            userId: transfer.recipientType === 'existing' ? 'recipient_id' : undefined,
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '🎉 Membership Received',
            message: `You have received a transferred ${transfer.planName} membership from ${transfer.senderName}, valid until ${transfer.nextBilling}.`,
        });

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'low',
            title: '✅ Transfer Request Processed',
            message: `Approved transfer of ${transfer.planName} membership from ${transfer.senderName} to ${transfer.recipientEmail}.`,
        });

        toast.success("Membership transfer approved successfully!");
        setIsReviewOpen(false);
        setSelectedTransfer(null);
    };

    const handleRejectTransfer = (transfer: Transfer) => {
        if (!rejectionReason) {
            toast.error("Please enter a reason for rejection.");
            return;
        }

        const updatedTransfers = transfers.map(t => 
            t.id === transfer.id ? { 
                ...t, 
                status: 'rejected' as const,
                processedBy: user?.name || 'Alice Frontdesk',
                processedAt: new Date().toISOString(),
                rejectionReason: rejectionReason,
                remainingValidity: transfer.nextBilling || 'N/A'
            } : t
        );
        setTransfers(updatedTransfers);
        localStorage.setItem('zenith_membership_transfers', JSON.stringify(updatedTransfers));

        const restoredSubscription = {
            name: transfer.planName,
            price: 7499,
            interval: 'monthly',
            nextBilling: transfer.nextBilling,
            status: 'Active',
            features: ['Unlimited Gym Access', '2 PT Sessions / Month', 'Locker Included', 'Spa & Sauna Access']
        };
        localStorage.setItem('zenith_member_subscription', JSON.stringify(restoredSubscription));

        window.dispatchEvent(new Event('storage'));

        addNotification({
            role: 'member',
            userId: transfer.senderId,
            category: 'MEMBERSHIP',
            priority: 'high',
            title: '❌ Membership Transfer Rejected',
            message: `Your request to transfer your ${transfer.planName} membership was declined. Reason: ${rejectionReason}`,
        });

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'low',
            title: '❌ Transfer Request Rejected',
            message: `Declined transfer request from ${transfer.senderName}. Reason: ${rejectionReason}`,
        });

        toast.success("Membership transfer request rejected.");
        setIsReviewOpen(false);
        setSelectedTransfer(null);
        setRejectionReason('');
        setIsRejecting(false);
    };
    const filteredMembers = membersList.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm);
        const isInstallmentMember = member.status === 'Installment' ||
            member.status === 'Pending' ||
            member.status === 'Partially Paid' ||
            (member as any).paymentStatus === 'Partially Paid' ||
            (member as any).paymentMethod === 'Installment Payment' ||
            ((member as any).paymentMethod && (member as any).paymentMethod.toLowerCase().includes('installment')) ||
            !!(member as any).installmentDetails ||
            (((member as any).outstandingBalance !== undefined) && ((member as any).outstandingBalance > 0));

        const matchesStatus =
            filterStatus === 'All' ||
            ((filterStatus === 'Installment' || filterStatus === 'Installation') && isInstallmentMember) ||
            member.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredTransfers = transfers.filter(t => {
        const matchesSearch = !transferSearchTerm || 
            (t.id && t.id.toLowerCase().includes(transferSearchTerm.toLowerCase())) ||
            (t.senderName && t.senderName.toLowerCase().includes(transferSearchTerm.toLowerCase())) ||
            (t.senderEmail && t.senderEmail.toLowerCase().includes(transferSearchTerm.toLowerCase())) ||
            (t.recipientName && t.recipientName.toLowerCase().includes(transferSearchTerm.toLowerCase())) ||
            (t.recipientEmail && t.recipientEmail.toLowerCase().includes(transferSearchTerm.toLowerCase()));

        const matchesStatus = transferFilterStatus === 'All' || t.status === transferFilterStatus;

        let matchesDate = true;
        if (t.requestedAt) {
            const reqDate = new Date(t.requestedAt).setHours(0, 0, 0, 0);
            if (transferStartDate) {
                const startDate = new Date(transferStartDate).setHours(0, 0, 0, 0);
                if (reqDate < startDate) matchesDate = false;
            }
            if (transferEndDate) {
                const endDate = new Date(transferEndDate).setHours(23, 59, 59, 999);
                if (reqDate > endDate) matchesDate = false;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Expiring Soon': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Inactive': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'Pending':
            case 'Installment':
            case 'Partially Paid':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'Premium': return <ShieldCheck className="w-4 h-4 text-primary" />;
            case 'Standard': return <Activity className="w-4 h-4 text-blue-400" />;
            case 'Basic': return <Dumbbell className="w-4 h-4 text-slate-400" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Members Hub</h1>
                    <p className="text-muted-foreground mt-1">Manage gym members, profiles, and subscription statuses.</p>
                </div>
                <button
                    onClick={() => setShowNewMemberModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black font-semibold uppercase tracking-wide hover:bg-primary/90 transition-all text-xs font-black"
                >
                    <Plus className="w-5 h-5" />
                    New Member
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-primary/10 pb-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => {
                        setActiveTab('directory');
                        setFilterStatus('All');
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                        activeTab === 'directory'
                            ? 'bg-primary text-black shadow-[0_0_15px_hsl(var(--gold)/0.2)]'
                            : 'bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                    }`}
                >
                    Member Directory
                </button>
                <button
                    onClick={() => {
                        setActiveTab('transfers');
                        setTransferFilterStatus('All');
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeTab === 'transfers'
                            ? 'bg-primary text-black shadow-[0_0_15px_hsl(var(--gold)/0.2)]'
                            : 'bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                    }`}
                >
                    Membership Transfers
                    {transfers.filter(t => t.status === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black animate-pulse">
                            {transfers.filter(t => t.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                    <p className="text-2xl font-bold text-foreground">{membersList.length}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border-emerald-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-emerald-400">{membersList.filter(m => m.status === 'Active').length}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border-amber-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Expiring Soon</p>
                    <p className="text-2xl font-bold text-amber-400">{membersList.filter(m => m.status === 'Expiring Soon').length}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Premium Plan</p>
                    <p className="text-2xl font-bold text-primary">{membersList.filter(m => m.plan === 'Premium').length}</p>
                </div>
            </div>

            {activeTab === 'directory' && (
                <>
                    {/* Filters & Search */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/20 border border-primary/10 rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {['All', 'Active', 'Expiring Soon', 'Inactive', 'Installment'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'}`}
                                >
                                    {status}
                                </button>
                            ))}
                            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                More Filters
                            </button>
                        </div>
                    </div>

                    {/* Members Directory */}
                    <div className="glass-card rounded-2xl overflow-visible">
                        <div className="overflow-x-auto overflow-y-visible pb-24">
                            <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                                <thead>
                                    <tr className="bg-black/20 border-b border-primary/10">
                                        <th className="p-4 text-sm font-semibold text-muted-foreground w-[22%]">Member</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground w-[22%]">Contact</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground w-[18%]">Plan Details</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground w-[12%]">Status</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground w-[14%]">Last Visit</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground text-right w-[12%]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 group-hover:shadow-[0_0_10px_hsl(var(--gold)/0.3)] transition-all">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{member.name}</div>
                                                        <div className="text-xs text-muted-foreground">ID: #{member.id.padStart(4, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {member.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {member.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                    {getPlanIcon(member.plan)}
                                                    {member.plan}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <CalendarDays className="w-3 h-3" />
                                                    Joined {new Date(member.joinDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-3 py-1 text-xs rounded-full border w-fit ${getStatusStyle(member.status)}`}>
                                                        {member.status === 'Pending' ? 'Installment' : member.status}
                                                    </span>
                                                    {(member as any).paymentStatus === 'Partially Paid' && (
                                                        <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold w-fit">
                                                            Due: ₹{((member as any).outstandingBalance || 0).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300 whitespace-nowrap">
                                                {member.lastVisit}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {((member as any).paymentStatus === 'Partially Paid' && ((member as any).outstandingBalance || 0) > 0) && (
                                                        <button
                                                            onClick={() => handleCollectInstallment(member.id)}
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-glow flex items-center gap-1"
                                                        >
                                                            Collect 2nd Inst (₹{((member as any).outstandingBalance || 0).toLocaleString()})
                                                        </button>
                                                    )}
                                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors" title="Manage Subscription">
                                                        <CreditCard className="w-4 h-4" />
                                                    </button>
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdownId(activeDropdownId === member.id ? null : member.id);
                                                            }}
                                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-colors"
                                                            title="More Actions"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>

                                                        {/* 3-Dots Action Dropdown Menu */}
                                                        {activeDropdownId === member.id && (
                                                            <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="absolute right-0 top-10 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedAttendanceMember(member);
                                                                        setActiveDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                                                                >
                                                                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                                                                    <span className="font-semibold">Attendance Log</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedEditMember(member);
                                                                        setEditForm({
                                                                            name: member.name,
                                                                            email: member.email,
                                                                            phone: member.phone,
                                                                            plan: member.plan,
                                                                            status: member.status
                                                                        });
                                                                        setActiveDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-400 shrink-0" />
                                                                    <span className="font-semibold">Edit Member</span>
                                                                </button>
                                                                <div className="my-1 border-t border-white/10" />
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDeleteMember(member);
                                                                        setActiveDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 shrink-0" />
                                                                    <span className="font-semibold">Delete Member</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredMembers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No members found matching your search criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'transfers' && (
                <div className="space-y-6">
                    {/* Unified Search & Filters Control Panel */}
                    <div className="glass-card rounded-2xl p-5 border border-primary/10 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, sender, or recipient..."
                                    value={transferSearchTerm}
                                    onChange={(e) => setTransferSearchTerm(e.target.value)}
                                    className="w-full bg-black/20 border border-primary/10 rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all text-sm"
                                />
                            </div>

                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                {[
                                    { status: 'All', label: `All (${transfers.length})` },
                                    { status: 'pending', label: `Pending (${transfers.filter(t => t.status === 'pending').length})` },
                                    { status: 'approved', label: `Approved (${transfers.filter(t => t.status === 'approved').length})` },
                                    { status: 'rejected', label: `Rejected (${transfers.filter(t => t.status === 'rejected').length})` },
                                    { status: 'cancelled', label: `Cancelled (${transfers.filter(t => t.status === 'cancelled').length})` }
                                ].map(({ status, label }) => (
                                    <button
                                        key={status}
                                        onClick={() => setTransferFilterStatus(status)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            transferFilterStatus === status 
                                                ? 'bg-primary/20 text-primary border border-primary/30' 
                                                : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Range Filters */}
                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-primary/5 w-full">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From:</span>
                                <input
                                    type="date"
                                    value={transferStartDate}
                                    onChange={(e) => setTransferStartDate(e.target.value)}
                                    className="bg-black/20 border border-primary/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 transition-all text-xs font-semibold"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To:</span>
                                <input
                                    type="date"
                                    value={transferEndDate}
                                    onChange={(e) => setTransferEndDate(e.target.value)}
                                    className="bg-black/20 border border-primary/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 transition-all text-xs font-semibold"
                                />
                            </div>
                            {(transferSearchTerm || transferFilterStatus !== 'All' || transferStartDate || transferEndDate) && (
                                <button
                                    onClick={() => {
                                        setTransferSearchTerm('');
                                        setTransferFilterStatus('All');
                                        setTransferStartDate('');
                                        setTransferEndDate('');
                                    }}
                                    className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors md:ml-auto"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Unified Transfers Table */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/20 border-b border-primary/10">
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Transfer ID</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">From Member</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">To Member</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Plan Sourced</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Request Date</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Transfer Date</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Remaining Validity</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Processed By</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5 text-sm">
                                    {filteredTransfers.map((transfer) => (
                                        <tr key={transfer.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="p-4 font-mono text-xs text-slate-300 font-bold">
                                                {transfer.id ? `#${transfer.id.replace('trsf_', '').substring(0, 8)}` : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-foreground">{transfer.senderName}</div>
                                                <div className="text-xs text-muted-foreground">{transfer.senderEmail}</div>
                                            </td>
                                            <td className="p-4">
                                                {transfer.recipientType === 'existing' ? (
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 mr-1.5">Existing</span>
                                                        <span className="text-xs font-semibold text-slate-300">{transfer.recipientEmail}</span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border-blue-500/20 mr-1.5">New</span>
                                                        <span className="text-xs font-semibold text-white">{transfer.recipientName}</span>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">{transfer.recipientEmail}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-foreground">{transfer.planName}</div>
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                {transfer.requestedAt ? new Date(transfer.requestedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                {transfer.processedAt ? new Date(transfer.processedAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="p-4 text-xs font-semibold text-slate-300">
                                                {transfer.remainingValidity || transfer.nextBilling || 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-[10px] rounded-full border font-bold uppercase tracking-wider ${
                                                    transfer.status === 'approved' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                        : transfer.status === 'rejected'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                        : transfer.status === 'cancelled'
                                                        ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                                }`}>
                                                    {transfer.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs font-semibold text-slate-300">
                                                {transfer.processedBy || '—'}
                                            </td>
                                            <td className="p-4 text-right">
                                                {transfer.status === 'pending' ? (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTransfer(transfer);
                                                            setIsReviewOpen(true);
                                                            setIsRejecting(false);
                                                            setRejectionReason('');
                                                        }}
                                                        className="px-4 py-2 rounded-xl bg-primary text-black font-bold uppercase text-xs tracking-wider gold-glow hover:bg-primary/90 transition-all"
                                                    >
                                                        Review
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedHistoryTransfer(transfer);
                                                            setIsHistoryDetailsOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/10 hover:text-white transition-all"
                                                    >
                                                        Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredTransfers.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-slate-500">
                                                No transfers matching filter criteria found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Transfer Request Dialog */}
            <Dialog open={isReviewOpen} onOpenChange={(open) => !open && setIsReviewOpen(false)}>
                <DialogContent className="max-w-md bg-slate-950 border-primary/20 text-slate-100 p-6 rounded-2xl shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Review Transfer Request</DialogTitle>
                        <DialogDescription>Verify eligibility and approve or decline membership transfer</DialogDescription>
                    </DialogHeader>
                    {selectedTransfer && (
                        <div className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black font-heading uppercase text-foreground tracking-tighter flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-primary" /> Review Transfer Request
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                                    Verify eligibility and approve or decline membership transfer
                                </DialogDescription>
                            </DialogHeader>

                            {/* Verification Checklist */}
                            <div className="space-y-3 bg-slate-900/50 p-4 border border-white/5 rounded-xl">
                                <h4 className="text-xs uppercase font-black tracking-widest text-primary font-heading italic">Eligibility Checklist</h4>
                                <ul className="space-y-2 text-xs font-semibold">
                                    <li className="flex items-center gap-2 text-emerald-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sender has active {selectedTransfer.planName} plan
                                    </li>
                                    <li className="flex items-center gap-2 text-emerald-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> No outstanding unpaid billing invoices
                                    </li>
                                    <li className="flex items-center gap-2 text-emerald-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Recipient is verified for membership release
                                    </li>
                                </ul>
                            </div>

                            {/* Sender / Recipient Summary */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <span className="font-black uppercase tracking-wider text-slate-500 block mb-1">Sender</span>
                                        <p className="font-bold text-white leading-tight">{selectedTransfer.senderName}</p>
                                    </div>
                                    <p className="text-slate-400 text-[10px] truncate">{selectedTransfer.senderEmail}</p>
                                </div>
                                <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <span className="font-black uppercase tracking-wider text-slate-500 block mb-1">Recipient</span>
                                        <p className="font-bold text-white leading-tight">
                                            {selectedTransfer.recipientType === 'existing' ? 'Existing Member' : selectedTransfer.recipientName}
                                        </p>
                                    </div>
                                    <p className="text-slate-400 text-[10px] truncate">{selectedTransfer.recipientEmail}</p>
                                </div>
                            </div>

                            {selectedTransfer.notes && (
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Transfer Reason</span>
                                    <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 border border-white/5 rounded-xl italic">
                                        "{selectedTransfer.notes}"
                                    </p>
                                </div>
                            )}

                            {isRejecting ? (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <label className="text-[10px] uppercase font-black tracking-wider text-rose-400">Specify Rejection Reason (Required)</label>
                                    <Textarea
                                        required
                                        placeholder="Reason for declining the transfer..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="bg-slate-900 border-rose-500/30 text-white placeholder:text-slate-600 focus:border-rose-500 rounded-xl min-h-[80px]"
                                    />
                                </div>
                            ) : null}

                            {/* Actions */}
                            <DialogFooter className="flex gap-3 pt-2">
                                {isRejecting ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRejecting(false);
                                                setRejectionReason('');
                                            }}
                                            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/5 text-slate-300 flex-1"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRejectTransfer(selectedTransfer)}
                                            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex-1 text-center shadow-md"
                                        >
                                            Confirm Decline
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsRejecting(true)}
                                            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 flex-1"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleApproveTransfer(selectedTransfer)}
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-xs uppercase tracking-wider flex-1 text-center shadow-glow"
                                        >
                                            Approve Transfer
                                        </button>
                                    </>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Transfer History Details Dialog */}
            <Dialog open={isHistoryDetailsOpen} onOpenChange={(open) => !open && setIsHistoryDetailsOpen(false)}>
                <DialogContent className="max-w-md bg-slate-950 border-primary/20 text-slate-100 p-6 rounded-2xl shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Transfer Audit Details</DialogTitle>
                        <DialogDescription>Full audit trail and information regarding this membership transfer request.</DialogDescription>
                    </DialogHeader>
                    {selectedHistoryTransfer && (
                        <div className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black font-heading uppercase text-foreground tracking-tighter flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-primary" /> Transfer Audit Log
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                                    Permanent record for request #{selectedHistoryTransfer.id ? selectedHistoryTransfer.id.replace('trsf_', '').substring(0, 12) : 'N/A'}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Status Timeline */}
                            <div className="space-y-4 bg-slate-900/50 p-4 border border-white/5 rounded-xl">
                                <h4 className="text-xs uppercase font-black tracking-widest text-primary font-heading italic">Audit Timeline</h4>
                                <div className="space-y-3 text-xs relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5 pl-6">
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-950" />
                                        <p className="font-bold text-slate-300">Requested</p>
                                        <p className="text-[10px] text-slate-500">{selectedHistoryTransfer.requestedAt ? new Date(selectedHistoryTransfer.requestedAt).toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <div className="relative">
                                        <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                                            selectedHistoryTransfer.status === 'approved' 
                                                ? 'bg-emerald-500' 
                                                : selectedHistoryTransfer.status === 'rejected'
                                                ? 'bg-rose-500'
                                                : selectedHistoryTransfer.status === 'cancelled'
                                                ? 'bg-slate-500'
                                                : 'bg-amber-500'
                                        }`} />
                                        <p className="font-bold text-slate-300 capitalize">{selectedHistoryTransfer.status}</p>
                                        {selectedHistoryTransfer.status === 'cancelled' && selectedHistoryTransfer.cancelledAt ? (
                                            <p className="text-[10px] text-slate-500">{new Date(selectedHistoryTransfer.cancelledAt).toLocaleString()}</p>
                                        ) : selectedHistoryTransfer.processedAt ? (
                                            <p className="text-[10px] text-slate-500">{new Date(selectedHistoryTransfer.processedAt).toLocaleString()}</p>
                                        ) : null}
                                        {selectedHistoryTransfer.processedBy && (
                                            <p className="text-[10px] text-primary mt-0.5 font-bold uppercase tracking-wider">Processed By: {selectedHistoryTransfer.processedBy}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sender / Recipient Summary */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <span className="font-black uppercase tracking-wider text-slate-500 block mb-1">Sender</span>
                                        <p className="font-bold text-white leading-tight">{selectedHistoryTransfer.senderName}</p>
                                    </div>
                                    <p className="text-slate-400 text-[10px] truncate">{selectedHistoryTransfer.senderEmail}</p>
                                </div>
                                <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <span className="font-black uppercase tracking-wider text-slate-500 block mb-1">Recipient</span>
                                        <p className="font-bold text-white leading-tight">
                                            {selectedHistoryTransfer.recipientType === 'existing' 
                                                ? 'Existing Gym Member' 
                                                : selectedHistoryTransfer.recipientName || 'New Recipient'}
                                        </p>
                                    </div>
                                    <p className="text-slate-400 text-[10px] truncate">{selectedHistoryTransfer.recipientEmail}</p>
                                </div>
                            </div>

                            {/* Plan Sourced & Remaining Validity */}
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-400">Membership Plan</span>
                                    <span className="font-bold text-white">{selectedHistoryTransfer.planName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-400">Remaining Validity</span>
                                    <span className="font-bold text-primary">{selectedHistoryTransfer.remainingValidity || selectedHistoryTransfer.nextBilling || 'N/A'}</span>
                                </div>
                            </div>

                            {selectedHistoryTransfer.notes && (
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Transfer Reason</span>
                                    <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 border border-white/5 rounded-xl italic">
                                        "{selectedHistoryTransfer.notes}"
                                    </p>
                                </div>
                            )}

                            {selectedHistoryTransfer.rejectionReason && (
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-rose-400">Decline Reason</span>
                                    <p className="text-xs text-rose-300 leading-relaxed bg-rose-950/20 p-3 border border-rose-500/20 rounded-xl italic">
                                        "{selectedHistoryTransfer.rejectionReason}"
                                    </p>
                                </div>
                            )}

                            {selectedHistoryTransfer.status === 'cancelled' && selectedHistoryTransfer.cancelledAt && (
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Cancellation Info</span>
                                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 border border-slate-800 rounded-xl italic">
                                        Request cancelled by the member on {new Date(selectedHistoryTransfer.cancelledAt).toLocaleString()}.
                                    </p>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <DialogClose asChild>
                                    <button
                                        type="button"
                                        className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/5 text-slate-300 w-full text-center"
                                    >
                                        Close Log Entry
                                    </button>
                                </DialogClose>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* ── NEW MEMBER MODAL ─────────────────────────────────────────────────── */}
            {showNewMemberModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-slate-900/95 border border-white/10 rounded-3xl w-full max-w-4xl h-[88vh] max-h-[850px] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="p-6 sm:px-8 sm:py-6 border-b border-white/10 bg-black/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
                            <div className="flex items-center justify-between gap-3.5 w-full lg:w-auto">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_hsl(var(--gold)/0.2)] shrink-0">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">
                                            Register New Member
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                            Enroll a new client into the Nexus Gym system with smart access.
                                        </p>
                                    </div>
                                </div>
                                {/* Close button on mobile/tablet */}
                                <button
                                    type="button"
                                    onClick={resetNewMemberModal}
                                    className="lg:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 justify-between lg:justify-end">
                                {/* Step progress */}
                                <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shrink-0 overflow-x-auto">
                                    {[
                                        { num: 1, label: 'Personal' },
                                        { num: 2, label: 'Plan' },
                                        { num: 3, label: 'Payment Setup' },
                                    ].map((s, i) => (
                                        <React.Fragment key={s.num}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                                                    newMemberStep >= s.num
                                                        ? 'bg-primary border-primary text-black shadow-[0_0_12px_hsl(var(--gold)/0.4)]'
                                                        : 'bg-white/5 border-white/10 text-slate-400'
                                                }`}>{s.num}</div>
                                                <span className={`text-xs font-bold uppercase tracking-wider hidden md:inline ${
                                                    newMemberStep >= s.num ? 'text-white font-black' : 'text-slate-500'
                                                }`}>{s.label}</span>
                                            </div>
                                            {i < 2 && <div className={`w-6 sm:w-8 h-0.5 rounded transition-all ${ newMemberStep > s.num ? 'bg-primary' : 'bg-white/15' }`} />}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Close button on desktop */}
                                <button
                                    type="button"
                                    onClick={resetNewMemberModal}
                                    className="hidden lg:flex p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 ml-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleNewMemberSubmit} className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 sm:p-8 pb-32 flex-1 overflow-y-auto space-y-8">

                                {/* STEP 1 — Personal Info */}
                                {newMemberStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black uppercase tracking-wide text-white">1. Member Identity & Contact</h4>
                                                <p className="text-xs text-slate-400">Please provide accurate contact information for membership records and smart access setup</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">First Name</label>
                                                <input
                                                    type="text" required placeholder="e.g. John"
                                                    value={newMemberForm.firstName}
                                                    onChange={e => setNewMemberForm(p => ({ ...p, firstName: e.target.value }))}
                                                    className="w-full bg-slate-950/90 border border-white/15 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Last Name</label>
                                                <input
                                                    type="text" required placeholder="e.g. Doe"
                                                    value={newMemberForm.lastName}
                                                    onChange={e => setNewMemberForm(p => ({ ...p, lastName: e.target.value }))}
                                                    className="w-full bg-slate-950/90 border border-white/15 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Email Address</label>
                                                <input
                                                    type="email" required placeholder="e.g. john.doe@example.com"
                                                    value={newMemberForm.email}
                                                    onChange={e => setNewMemberForm(p => ({ ...p, email: e.target.value }))}
                                                    className="w-full bg-slate-950/90 border border-white/15 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Phone Number</label>
                                                <input
                                                    type="tel" required placeholder="e.g. +91 9876543210"
                                                    value={newMemberForm.phone}
                                                    onChange={e => setNewMemberForm(p => ({ ...p, phone: e.target.value }))}
                                                    className="w-full bg-slate-950/90 border border-white/15 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Gender</label>
                                                <select
                                                    value={newMemberForm.gender}
                                                    onChange={e => setNewMemberForm(p => ({ ...p, gender: e.target.value }))}
                                                    className="w-full bg-slate-950/90 border border-white/15 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                >
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Date of Birth</label>
                                                <input
                                                    type="date" required
                                                    value={newMemberForm.dob}
                                                    onChange={e => setNewMemberForm(p => ({ ...p, dob: e.target.value }))}
                                                    className="w-full bg-slate-950/90 border border-white/15 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2 — Membership Plan */}
                                {newMemberStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <Dumbbell className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black uppercase tracking-wide text-white">2. Select Membership Plan</h4>
                                                <p className="text-xs text-slate-400">Choose the monthly tier that best fits the member&apos;s fitness goals</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            {[
                                                {
                                                    id: 'basic',
                                                    name: 'Basic',
                                                    price: '₹4,199',
                                                    desc: 'Gym floor access only',
                                                    features: ['Full Gym Floor Access', 'Locker Room & Showers', 'Free WiFi & App Tracking'],
                                                    color: 'text-slate-300',
                                                    border: 'border-slate-500/30'
                                                },
                                                {
                                                    id: 'standard',
                                                    name: 'Standard',
                                                    price: '₹7,499',
                                                    desc: 'Gym floor + Open Classes',
                                                    features: ['Everything in Basic', 'Unlimited Group Classes', '1 Free Guest Pass/Month'],
                                                    color: 'text-cyan-400',
                                                    border: 'border-cyan-500/40'
                                                },
                                                {
                                                    id: 'premium',
                                                    name: 'Premium',
                                                    price: '₹12,499',
                                                    desc: 'All access + 2 PT sessions/month',
                                                    features: ['Everything in Standard', '2 PT Sessions / Month', '20% Cafe & Juice Bar Discount', 'VIP Lounge Access'],
                                                    color: 'text-primary',
                                                    border: 'border-primary/50'
                                                },
                                            ].map(plan => {
                                                const isSelected = newMemberForm.plan === plan.id;
                                                return (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setNewMemberForm(p => ({ ...p, plan: plan.id }))}
                                                        className={`cursor-pointer rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                                                            isSelected
                                                                ? 'bg-primary/15 border-primary shadow-[0_0_30px_hsl(var(--gold)/0.25)]'
                                                                : 'bg-slate-950/70 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-4 right-4 text-primary">
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            </div>
                                                        )}

                                                        <div>
                                                            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                                isSelected
                                                                    ? 'bg-primary text-black border-primary'
                                                                    : 'bg-white/5 text-slate-300 border-white/10'
                                                            }`}>
                                                                {plan.name}
                                                            </span>

                                                            <div className="mt-5 mb-2">
                                                                <span className="text-3xl font-black font-mono text-white">{plan.price}</span>
                                                                <span className="text-xs text-slate-400 font-medium"> /month</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 pb-4 border-b border-white/10">{plan.desc}</p>

                                                            <ul className="mt-4 space-y-2.5">
                                                                {plan.features.map((feat, fi) => (
                                                                    <li key={fi} className="text-xs text-slate-300 flex items-center gap-2">
                                                                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                                                        <span>{feat}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                                                            <span className={`text-xs font-black uppercase tracking-wider ${
                                                                isSelected ? 'text-primary' : 'text-slate-500'
                                                            }`}>
                                                                {isSelected ? 'Selected Plan' : 'Click to Select'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 — Payment Setup */}
                                {newMemberStep === 3 && (
                                    <NewMemberPaymentStep
                                        memberName={`${newMemberForm.firstName} ${newMemberForm.lastName}`}
                                        memberEmail={newMemberForm.email}
                                        memberPhone={newMemberForm.phone}
                                        selectedPlan={{
                                            id: newMemberForm.plan,
                                            name: newMemberForm.plan,
                                            price: newMemberForm.plan === 'premium' ? 12500 : newMemberForm.plan === 'standard' ? 7500 : 4500
                                        }}
                                        onPaymentConfigChange={setPaymentConfig}
                                        isModal={true}
                                    />
                                )}

                            </div>

                            {/* Sticky Footer Buttons */}
                            <div className="p-6 sm:px-8 py-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4 shrink-0">
                                {newMemberStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setNewMemberStep(s => (s - 1) as 1 | 2 | 3)}
                                        className="py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" /> Back
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resetNewMemberModal}
                                        className="py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmittingMember || (newMemberStep === 3 && !paymentConfig?.isValid)}
                                    className="py-3.5 px-8 rounded-2xl bg-primary text-black text-xs font-black uppercase tracking-wider transition-colors shadow-[0_0_20px_hsl(var(--gold)/0.3)] hover:bg-primary/95 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmittingMember ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                                    ) : newMemberStep === 3 ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Complete Registration</>
                                    ) : (
                                        <>Continue <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 1. ATTENDANCE LOG MODAL ────────────────────────────────────────────── */}
            {selectedAttendanceMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-4xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 sm:px-8 border-b border-white/10 bg-slate-900/60 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    {selectedAttendanceMember.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                                        <span>{selectedAttendanceMember.name}</span>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                            {selectedAttendanceMember.plan}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ID: #{selectedAttendanceMember.id.padStart(4, '0')} • Joined {selectedAttendanceMember.joinDate} • Current Status: {selectedAttendanceMember.status}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAttendanceMember(null)}
                                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                            {/* Stats Banner Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent flex items-center gap-3.5">
                                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Attendance Rate</div>
                                        <div className="text-lg font-heading font-black text-white">92%</div>
                                    </div>
                                </div>

                                <div className="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent flex items-center gap-3.5">
                                    <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                                        <Flame className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Current Streak</div>
                                        <div className="text-lg font-heading font-black text-white">5 Days</div>
                                    </div>
                                </div>

                                <div className="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent flex items-center gap-3.5">
                                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                        <CalendarDays className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">This Month</div>
                                        <div className="text-lg font-heading font-black text-white">18 Sessions</div>
                                    </div>
                                </div>

                                <div className="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent flex items-center gap-3.5">
                                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Avg Duration</div>
                                        <div className="text-lg font-heading font-black text-white">1h 28m</div>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Tabs and Export */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                                    <button
                                        onClick={() => setAttendanceTab('all')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            attendanceTab === 'all' ? 'bg-primary text-black shadow-glow' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        All History
                                    </button>
                                    <button
                                        onClick={() => setAttendanceTab('this_month')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            attendanceTab === 'this_month' ? 'bg-primary text-black shadow-glow' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        This Month
                                    </button>
                                    <button
                                        onClick={() => setAttendanceTab('this_week')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            attendanceTab === 'this_week' ? 'bg-primary text-black shadow-glow' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        This Week
                                    </button>
                                </div>

                                <button
                                    onClick={() => toast.success(`Attendance history exported to CSV for ${selectedAttendanceMember.name}!`)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-semibold flex items-center gap-2 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Export Log (CSV)
                                </button>
                            </div>

                            {/* Detailed Attendance Log Table */}
                            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/40 border-b border-white/10">
                                                <th className="p-4 text-xs font-semibold text-slate-400">Date</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400">Check-In Time</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400">Check-Out Time</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400">Duration</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400">Gym Zone / Area</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {getMemberAttendanceLogs(selectedAttendanceMember).map((log: any) => (
                                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-sm font-semibold text-white">
                                                        {log.date}
                                                    </td>
                                                    <td className="p-4 text-sm font-mono text-emerald-400">
                                                        {log.checkIn}
                                                    </td>
                                                    <td className="p-4 text-sm font-mono text-slate-300">
                                                        {log.checkOut}
                                                    </td>
                                                    <td className="p-4 text-sm font-medium text-slate-200">
                                                        {log.duration}
                                                    </td>
                                                    <td className="p-4 text-xs text-slate-400">
                                                        {log.zone}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
                                                            log.type === 'on_time'
                                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                        }`}>
                                                            {log.type === 'on_time' ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Clock className="w-3.5 h-3.5" />
                                                            )}
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 sm:px-8 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Showing <strong className="text-white">{getMemberAttendanceLogs(selectedAttendanceMember).length}</strong> check-in records
                            </span>
                            <button
                                onClick={() => setSelectedAttendanceMember(null)}
                                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 2. EDIT MEMBER MODAL ───────────────────────────────────────────────── */}
            {selectedEditMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-lg rounded-3xl border border-white/15 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-heading font-bold text-foreground">Edit Member Profile</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Update directory details for #{selectedEditMember.id.padStart(4, '0')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedEditMember(null)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditMember} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Membership Plan</label>
                                    <select
                                        value={editForm.plan}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Premium">Premium</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Basic">Basic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Expiring Soon">Expiring Soon</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Installment">Installment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEditMember(null)}
                                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-primary text-black hover:bg-primary/95 text-xs font-black uppercase tracking-wider transition-colors shadow-glow flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 3. DELETE MEMBER MODAL ─────────────────────────────────────────────── */}
            {selectedDeleteMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-md rounded-3xl border border-white/15 overflow-hidden shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-foreground">
                            Delete &quot;{selectedDeleteMember.name}&quot;?
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 px-2 leading-relaxed">
                            You are about to permanently remove this member from the receptionist directory. Their smart access key will be deactivated and their attendance records will be archived.
                        </p>

                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedDeleteMember(null)}
                                className="flex-1 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteMember}
                                className="flex-1 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ────────────────────────────────────────────────────────────────────── */}
        </div>
    );
}
