"use client";

import { CreditCard, DollarSign, TrendingUp, AlertCircle, Search, Download, Plus, MoreVertical, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Mail, Bell, ShieldAlert, Check, RefreshCw, Eye, FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { handleExport } from "@/utils/exportUtils";
import { toast } from "sonner";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const kpiData = [
    {
        title: "Total Revenue",
        value: "₹1.04 Cr",
        trend: "+12.5%",
        isPositive: true,
        icon: DollarSign,
        color: "text-primary dark:text-gold-glow",
        bg: "bg-primary/10 dark:bg-gold-glow/10",
        href: "/admin/payments/revenue-analytics",
        subtitle: "Complete revenue analytics & charts"
    },
    {
        title: "Active Subscriptions",
        value: "2,845",
        trend: "+5.2%",
        isPositive: true,
        icon: TrendingUp,
        color: "text-accent dark:text-neon-cyan",
        bg: "bg-accent/10 dark:bg-neon-cyan/10",
        href: "/admin/members?status=Active",
        subtitle: "Filtered active member plans"
    },
    {
        title: "Pending Payments",
        value: "₹7,08,000",
        trend: "34 invoices",
        isPositive: false,
        icon: Clock,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        href: "/admin/payments?tab=pending",
        subtitle: "All unpaid & pending invoices"
    },
    {
        title: "Overdue",
        value: "₹2,72,000",
        trend: "-2.1%",
        isPositive: false,
        icon: AlertCircle,
        color: "text-destructive",
        bg: "bg-destructive/10",
        href: "/admin/payments?tab=overdue",
        subtitle: "Critical overdue accounts & alerts"
    }
];

const transactions = [
    { id: "TX-9842", member: "Sarah Jenkins", plan: "Elite Annual", amount: "₹1,00,000", date: "Today, 10:42 AM", status: "Completed" },
    { id: "TX-9843", member: "Alex Thompson", plan: "Arctic Cryotherapy", amount: "₹4,499", date: "Today, 10:05 AM", status: "Completed" },
    { id: "TX-9841", member: "Michael Chen", plan: "Pro Monthly", amount: "₹12,499", date: "Today, 09:15 AM", status: "Completed" },
    { id: "TX-9844", member: "Lisa Anderson", plan: "Kinetic Physiotherapy", amount: "₹5,499", date: "Yesterday, 04:30 PM", status: "Completed" },
    { id: "TX-9840", member: "Emma Thompson", plan: "Starter Monthly", amount: "₹7,499", date: "Yesterday", status: "Pending" },
    { id: "TX-9839", member: "David Rodriguez", plan: "Personal Training x5", amount: "₹37,800", date: "Yesterday", status: "Failed" },
];

const pendingInvoicesData = [
    { id: "INV-4091", member: "Emma Thompson", plan: "Starter Monthly", amount: "₹7,499", dueDate: "Today, 5:00 PM", status: "Pending", email: "emma.t@example.com", phone: "+91 98765 43210" },
    { id: "INV-4092", member: "David Rodriguez", plan: "Personal Training x5", amount: "₹37,800", dueDate: "Due in 2 days", status: "Pending", email: "d.rodriguez@example.com", phone: "+91 98765 43211" },
    { id: "INV-4093", member: "Priya Sharma", plan: "Elite Annual", amount: "₹1,00,000", dueDate: "Due in 3 days", status: "Awaiting Confirmation", email: "priya.s@example.com", phone: "+91 98765 43212" },
    { id: "INV-4094", member: "Rajesh Kumar", plan: "Pro Monthly", amount: "₹12,499", dueDate: "Due Tomorrow", status: "Pending", email: "rajesh.k@example.com", phone: "+91 98765 43213" },
    { id: "INV-4095", member: "Neelam Verma", plan: "Kinetic Physiotherapy", amount: "₹5,499", dueDate: "Due in 4 days", status: "Pending", email: "neelam.v@example.com", phone: "+91 98765 43214" },
];

const overdueAccountsData = [
    { id: "OVR-301", member: "David Rodriguez", plan: "Personal Training x5", amount: "₹37,800", overdueBy: "14 Days Overdue", dueDate: "15 Jul 2026", history: "Failed Auto-Pay • Card Expired", actionTaken: "2 Reminders Sent" },
    { id: "OVR-302", member: "Emma Thompson", plan: "Starter Monthly", amount: "₹45,000", overdueBy: "30 Days Overdue", dueDate: "29 Jun 2026", history: "Direct Debit Rejected", actionTaken: "Urgent Notice Sent" },
    { id: "OVR-303", member: "Marcus Vance", plan: "Elite VIP Annual", amount: "₹1,89,200", overdueBy: "60 Days Overdue", dueDate: "29 May 2026", history: "3 Reminders Sent • No Response", actionTaken: "Grace Period Ended" },
    { id: "OVR-304", member: "Sophia Martinez", plan: "Pro Monthly", amount: "₹15,400", overdueBy: "7 Days Overdue", dueDate: "22 Jul 2026", history: "Failed UPI Transaction", actionTaken: "1 Reminder Sent" },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "Pending":
        case "Awaiting Confirmation":
            return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Failed":
        case "Overdue":
            return "bg-destructive/10 text-destructive border-destructive/20";
        case "Refunded": return "bg-muted text-muted-foreground border-muted-foreground/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "Completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
        case "Pending":
        case "Awaiting Confirmation":
            return <Clock className="w-3.5 h-3.5" />;
        case "Failed":
        case "Overdue":
            return <AlertCircle className="w-3.5 h-3.5" />;
        default: return null;
    }
};

function PaymentsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTabParam = searchParams.get("tab");
    const activeTab: "all" | "pending" | "overdue" = 
        initialTabParam === "pending" ? "pending" :
        initialTabParam === "overdue" ? "overdue" : "all";

    const [searchTerm, setSearchTerm] = useState("");

    const handleExportPayments = async () => {
        try {
            const headers = ['Transaction ID', 'Member Name', 'Plan / Detail', 'Amount (INR)', 'Date', 'Status'];
            const data = transactions.map(tx => [
                tx.id,
                tx.member,
                tx.plan,
                tx.amount,
                tx.date,
                tx.status
            ]);

            await handleExport('CSV', {
                filename: `Admin_Payments_Report_${new Date().toISOString().split('T')[0]}`,
                title: 'Zenith Fitness Admin Payments Ledger',
                headers,
                data,
                category: 'Payments'
            });
            toast.success('Payments ledger exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export payments ledger.');
        }
    };

    const handleSendReminder = (memberName: string) => {
        toast.success(`Payment reminder dispatched to ${memberName} via Email & SMS.`);
    };

    const handleMarkPaid = (invoiceId: string) => {
        toast.success(`Invoice ${invoiceId} marked as settled.`);
    };

    const handleSendUrgentAlert = (memberName: string) => {
        toast.success(`Urgent overdue notice dispatched to ${memberName}!`);
    };

    const handleSuspendMembership = (memberName: string) => {
        toast.error(`Membership for ${memberName} has been suspended pending clearance.`);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Finance Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage revenue, active subscriptions, unpaid invoices, and overdue accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportPayments} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* Interactive KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <Link
                            key={idx}
                            href={kpi.href}
                            className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:border-primary/50 dark:hover:border-gold-glow/50 relative overflow-hidden block hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-gold-glow/10 cursor-pointer"
                        >
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.1),_transparent_70%)] rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : (kpi.icon === Clock ? null : <ArrowDownRight className="w-3 h-3" />)}
                                        {kpi.trend}
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 text-primary dark:text-gold-glow p-1 rounded-lg bg-primary/10 dark:bg-gold-glow/10" title="Click to view details">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1 group-hover:text-foreground transition-colors flex items-center justify-between">
                                    <span>{kpi.title}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-gold-glow opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details &rarr;
                                    </span>
                                </h3>
                                <p className="text-3xl font-heading font-bold text-foreground dark:text-white tracking-tight">{kpi.value}</p>
                                <p className="text-xs text-muted-foreground mt-1.5 opacity-80">{kpi.subtitle}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Main Content Area with Navigation Tabs */}
            <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft">
                {/* Section Navigation Tabs & Search */}
                <div className="p-6 border-b border-primary/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-charcoal/30 dark:bg-black/20">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.push("/admin/payments")}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === "all"
                                    ? "bg-primary dark:bg-gold-glow text-black shadow-glow"
                                    : "bg-background/50 text-muted-foreground hover:text-foreground border border-primary/10"
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            All Transactions
                            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px]">1,248</span>
                        </button>
                        <button
                            onClick={() => router.push("/admin/payments?tab=pending")}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === "pending"
                                    ? "bg-orange-500 text-white shadow-glow"
                                    : "bg-background/50 text-muted-foreground hover:text-foreground border border-primary/10"
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            Pending Payments
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-extrabold text-[10px]">142 Invoices</span>
                        </button>
                        <button
                            onClick={() => router.push("/admin/payments?tab=overdue")}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === "overdue"
                                    ? "bg-destructive text-white shadow-glow"
                                    : "bg-background/50 text-muted-foreground hover:text-foreground border border-primary/10"
                            }`}
                        >
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            Overdue Payments
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-extrabold text-[10px]">₹2.72L</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={
                                    activeTab === "pending" ? "Search pending invoice or member..." :
                                    activeTab === "overdue" ? "Search overdue account..." : "Search transaction..."
                                }
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <button className="p-2 rounded-xl border border-primary/10 hover:bg-charcoal dark:hover:bg-white/5 transition-colors text-muted-foreground">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* TAB 1: ALL TRANSACTIONS */}
                {activeTab === "all" && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-primary/10 text-sm font-medium text-muted-foreground">
                                        <th className="px-6 py-4 font-medium w-[15%]">Transaction ID</th>
                                        <th className="px-6 py-4 font-medium w-[28%]">Member</th>
                                        <th className="px-6 py-4 font-medium w-[15%]">Amount</th>
                                        <th className="px-6 py-4 font-medium w-[18%]">Date</th>
                                        <th className="px-6 py-4 font-medium w-[12%]">Status</th>
                                        <th className="px-6 py-4 font-medium w-[12%] text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-primary/5">
                                    {transactions
                                        .filter(tx => 
                                            tx.member.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            tx.id.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((tx) => (
                                            <tr key={tx.id} className="group hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{tx.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground dark:text-white">{tx.member}</span>
                                                        <span className="text-xs text-muted-foreground">{tx.plan}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">{tx.amount}</td>
                                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(tx.status)}`}>
                                                        {getStatusIcon(tx.status)}
                                                        {tx.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                                    <div className="inline-flex items-center gap-3">
                                                        <button className="text-sm font-semibold text-primary dark:text-gold-glow hover:text-primary/80 transition-colors">
                                                            View
                                                        </button>
                                                        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-sm text-muted-foreground bg-charcoal/30 dark:bg-black/20">
                            <p>Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">6</span> of <span className="font-medium text-foreground">1,248</span> results</p>
                            <div className="flex gap-1">
                                <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Previous</button>
                                <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-gold-glow font-medium">1</button>
                                <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">2</button>
                                <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">...</button>
                                <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">Next</button>
                            </div>
                        </div>
                    </>
                )}

                {/* TAB 2: PENDING PAYMENTS SECTION */}
                {activeTab === "pending" && (
                    <div className="p-6 space-y-6">
                        <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Unpaid & Pending Invoices</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Total outstanding receivable balance: <strong className="text-orange-400 font-mono">₹7,08,000 (142 Invoices)</strong></p>
                                </div>
                            </div>
                            <button
                                onClick={() => toast.success("Bulk reminders sent to all 142 pending accounts!")}
                                className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold text-xs shadow-glow hover:bg-orange-600 transition-colors flex items-center gap-2"
                            >
                                <Bell className="w-3.5 h-3.5" />
                                Send Bulk Reminders
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-primary/10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-primary/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-black/20">
                                        <th className="px-6 py-4 w-[14%]">Invoice ID</th>
                                        <th className="px-6 py-4 w-[28%]">Member Details</th>
                                        <th className="px-6 py-4 w-[16%]">Amount Due</th>
                                        <th className="px-6 py-4 w-[18%]">Due Date</th>
                                        <th className="px-6 py-4 w-[12%]">Status</th>
                                        <th className="px-6 py-4 w-[12%] text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-primary/5">
                                    {pendingInvoicesData
                                        .filter(inv =>
                                            inv.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            inv.id.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((inv) => (
                                            <tr key={inv.id} className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{inv.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-foreground">{inv.member}</div>
                                                    <div className="text-xs text-muted-foreground">{inv.plan} • {inv.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-foreground font-mono">{inv.amount}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-orange-400">{inv.dueDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inv.status)}`}>
                                                        {getStatusIcon(inv.status)}
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleSendReminder(inv.member)}
                                                            className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition-colors flex items-center gap-1"
                                                            title="Send Reminder"
                                                        >
                                                            <Mail className="w-3.5 h-3.5" />
                                                            Remind
                                                        </button>
                                                        <button
                                                            onClick={() => handleMarkPaid(inv.id)}
                                                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs transition-colors"
                                                            title="Mark as Paid"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: OVERDUE PAYMENTS SECTION */}
                {activeTab === "overdue" && (
                    <div className="p-6 space-y-6">
                        <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-destructive/20 text-destructive">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Critical Overdue Accounts</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Accounts exceeding grace period. Total overdue amount: <strong className="text-destructive font-mono">₹2,72,000 (18 Accounts)</strong></p>
                                </div>
                            </div>
                            <button
                                onClick={() => toast.error("Urgent legal & suspension notices dispatched to 18 overdue accounts!")}
                                className="px-4 py-2 rounded-xl bg-destructive text-white font-semibold text-xs shadow-glow hover:bg-destructive/90 transition-colors flex items-center gap-2"
                            >
                                <AlertCircle className="w-3.5 h-3.5" />
                                Send Urgent Notice to All
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-primary/10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-primary/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-black/20">
                                        <th className="px-6 py-4 w-[24%]">Overdue Member</th>
                                        <th className="px-6 py-4 w-[16%]">Overdue Amount</th>
                                        <th className="px-6 py-4 w-[18%]">Overdue By & Due Date</th>
                                        <th className="px-6 py-4 w-[24%]">Payment History / Reason</th>
                                        <th className="px-6 py-4 w-[18%] text-left">Available Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-primary/5">
                                    {overdueAccountsData
                                        .filter(acc =>
                                            acc.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            acc.id.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((acc) => (
                                            <tr key={acc.id} className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-foreground">{acc.member}</div>
                                                    <div className="text-xs text-muted-foreground">{acc.plan} • {acc.id}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-destructive font-mono">{acc.amount}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-destructive">{acc.overdueBy}</div>
                                                    <div className="text-[11px] text-muted-foreground">Due: {acc.dueDate}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-foreground font-medium">{acc.history}</div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">Latest: {acc.actionTaken}</div>
                                                </td>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleSendUrgentAlert(acc.member)}
                                                            className="px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold transition-colors flex items-center gap-1"
                                                            title="Send Urgent Alert"
                                                        >
                                                            <Bell className="w-3.5 h-3.5" />
                                                            Alert
                                                        </button>
                                                        <button
                                                            onClick={() => handleSuspendMembership(acc.member)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-destructive text-xs transition-colors"
                                                            title="Suspend Membership"
                                                        >
                                                            Suspend
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading finance dashboard...</div>}>
            <PaymentsPageContent />
        </Suspense>
    );
}
