"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, CreditCard, CalendarDays, Activity, Mail, Phone, Dumbbell, ShieldCheck, Users, Clock, AlertTriangle, X, User, CheckCircle2, Loader2, ArrowRight, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
    { id: '7', name: 'William Garcia', email: 'william.g@example.com', phone: '(555) 765-4321', plan: 'Premium', status: 'Active', joinDate: '2023-12-10', lastVisit: 'Today, 2:15 PM' },
    { id: '8', name: 'Sophia Martinez', email: 'sophia.m@example.com', phone: '(555) 012-3456', plan: 'Standard', status: 'Pending', joinDate: '2024-02-28', lastVisit: 'Never' },
];

export default function MembersManagementPanel() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [membersList, setMembersList] = useState(mockMembers);
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

    const resetNewMemberModal = () => {
        setNewMemberStep(1);
        setNewMemberForm({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: 'Male', plan: 'standard', paymentMethod: 'UPI' });
        setIsSubmittingMember(false);
        setShowNewMemberModal(false);
    };

    const handleNewMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMemberStep < 3) {
            setNewMemberStep((s) => (s + 1) as 1 | 2 | 3);
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
            status: 'Active',
            joinDate: new Date().toISOString().split('T')[0],
            lastVisit: 'Never',
        };
        setMembersList(prev => [...prev, newMember]);

        addNotification({
            role: 'receptionist',
            category: 'MEMBERSHIP',
            priority: 'low',
            title: '✅ New Member Registered',
            message: `${newMember.name} has been enrolled on the ${newMember.plan} plan.`,
        });

        toast.success(`${newMember.name} registered successfully on the ${newMember.plan} plan!`);
        resetNewMemberModal();
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
        const matchesStatus = filterStatus === 'All' || member.status === filterStatus;
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
            case 'Pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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
                            {['All', 'Active', 'Expiring Soon', 'Inactive', 'Pending'].map(status => (
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
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/20 border-b border-primary/10">
                                        <th className="p-4 text-sm font-semibold text-muted-foreground">Member</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground">Contact</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground">Plan Details</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground">Last Visit</th>
                                        <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
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
                                                <div className="flex items-center gap-2 font-medium text-foreground">
                                                    {getPlanIcon(member.plan)}
                                                    {member.plan}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <CalendarDays className="w-3 h-3" />
                                                    Joined {new Date(member.joinDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs rounded-full border ${getStatusStyle(member.status)}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {member.lastVisit}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors" title="Manage Subscription">
                                                        <CreditCard className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
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
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">

                        {/* Close */}
                        <button
                            type="button"
                            onClick={resetNewMemberModal}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-black/20">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" /> Register New Member
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Enroll a new client into the Nexus Gym system.</p>

                            {/* Step progress */}
                            <div className="flex items-center gap-2 mt-4">
                                {[
                                    { num: 1, label: 'Personal' },
                                    { num: 2, label: 'Plan' },
                                    { num: 3, label: 'Payment' },
                                ].map((s, i) => (
                                    <React.Fragment key={s.num}>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                                                newMemberStep >= s.num
                                                    ? 'bg-primary border-primary text-black shadow-[0_0_10px_hsl(var(--gold)/0.4)]'
                                                    : 'bg-white/5 border-white/10 text-slate-500'
                                            }`}>{s.num}</div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                                                newMemberStep >= s.num ? 'text-primary' : 'text-slate-500'
                                            }`}>{s.label}</span>
                                        </div>
                                        {i < 2 && <div className={`flex-1 h-0.5 rounded transition-all ${ newMemberStep > s.num ? 'bg-primary' : 'bg-white/10' }`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleNewMemberSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

                            {/* STEP 1 — Personal Info */}
                            {newMemberStep === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">First Name</label>
                                            <input
                                                type="text" required placeholder="John"
                                                value={newMemberForm.firstName}
                                                onChange={e => setNewMemberForm(p => ({ ...p, firstName: e.target.value }))}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Last Name</label>
                                            <input
                                                type="text" required placeholder="Doe"
                                                value={newMemberForm.lastName}
                                                onChange={e => setNewMemberForm(p => ({ ...p, lastName: e.target.value }))}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Email Address</label>
                                        <input
                                            type="email" required placeholder="john@example.com"
                                            value={newMemberForm.email}
                                            onChange={e => setNewMemberForm(p => ({ ...p, email: e.target.value }))}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Phone Number</label>
                                            <input
                                                type="tel" required placeholder="+91 9876543210"
                                                value={newMemberForm.phone}
                                                onChange={e => setNewMemberForm(p => ({ ...p, phone: e.target.value }))}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Gender</label>
                                            <select
                                                value={newMemberForm.gender}
                                                onChange={e => setNewMemberForm(p => ({ ...p, gender: e.target.value }))}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                                <option>Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Date of Birth</label>
                                        <input
                                            type="date" required
                                            value={newMemberForm.dob}
                                            onChange={e => setNewMemberForm(p => ({ ...p, dob: e.target.value }))}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 — Membership Plan */}
                            {newMemberStep === 2 && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                                    {[
                                        { id: 'basic',    name: 'Basic',   price: '₹4,199',  desc: 'Gym floor access only',             color: 'text-slate-400',   border: 'border-slate-500/30' },
                                        { id: 'standard', name: 'Standard', price: '₹7,499', desc: 'Gym floor + Open Classes',           color: 'text-cyan-400',    border: 'border-cyan-500/30' },
                                        { id: 'premium',  name: 'Premium',  price: '₹12,499', desc: 'All access + 2 PT sessions/month',  color: 'text-primary',     border: 'border-primary/40' },
                                    ].map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setNewMemberForm(p => ({ ...p, plan: plan.id }))}
                                            className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 ${
                                                newMemberForm.plan === plan.id
                                                    ? `bg-primary/5 ${plan.border} shadow-[0_0_15px_hsl(var(--gold)/0.1)]`
                                                    : 'bg-black/30 border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            <div>
                                                <p className={`font-black text-sm uppercase tracking-wide ${newMemberForm.plan === plan.id ? plan.color : 'text-white'}`}>{plan.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{plan.desc}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`font-black text-lg font-mono ${newMemberForm.plan === plan.id ? plan.color : 'text-slate-300'}`}>{plan.price}</p>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider">/month</p>
                                            </div>
                                            {newMemberForm.plan === plan.id && (
                                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* STEP 3 — Payment */}
                            {newMemberStep === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                                    {/* Summary card */}
                                    <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enrollment Summary</p>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Member</span>
                                            <span className="font-bold text-white">{newMemberForm.firstName} {newMemberForm.lastName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Plan</span>
                                            <span className="font-bold text-white capitalize">{newMemberForm.plan}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                            <span className="text-xs text-slate-400">Due Today</span>
                                            <span className="font-black text-lg text-primary font-mono">
                                                {newMemberForm.plan === 'premium' ? '₹12,499' : newMemberForm.plan === 'standard' ? '₹7,499' : '₹4,199'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment method */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Payment Method</label>
                                        <select
                                            value={newMemberForm.paymentMethod}
                                            onChange={e => setNewMemberForm(p => ({ ...p, paymentMethod: e.target.value as typeof newMemberForm.paymentMethod }))}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        >
                                            <option value="UPI">UPI</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Credit/Debit Card">Credit / Debit Card</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] flex items-start gap-2">
                                        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>Payment is collected via reception terminal. No card numbers are stored in this system.</span>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                {newMemberStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setNewMemberStep(s => (s - 1) as 1 | 2 | 3)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <ArrowLeftIcon className="w-3.5 h-3.5" /> Back
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resetNewMemberModal}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmittingMember}
                                    className="flex-1 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider transition-colors shadow-glow hover:bg-primary/95 flex items-center justify-center gap-1.5 disabled:opacity-70"
                                >
                                    {isSubmittingMember ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...</>
                                    ) : newMemberStep === 3 ? (
                                        <><CheckCircle2 className="w-3.5 h-3.5" /> Complete Registration</>
                                    ) : (
                                        <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ────────────────────────────────────────────────────────────────────── */}
        </div>
    );
}
