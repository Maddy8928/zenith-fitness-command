"use client";

import { CreditCard, DollarSign, TrendingUp, AlertCircle, Search, Download, Plus, MoreVertical, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from "lucide-react";
import { handleExport } from "@/utils/exportUtils";
import { toast } from "sonner";

const kpiData = [
    {
        title: "Total Revenue",
        value: "₹1.04 Cr",
        trend: "+12.5%",
        isPositive: true,
        icon: DollarSign,
        color: "text-primary dark:text-gold-glow",
        bg: "bg-primary/10 dark:bg-gold-glow/10"
    },
    {
        title: "Active Subscriptions",
        value: "2,845",
        trend: "+5.2%",
        isPositive: true,
        icon: TrendingUp,
        color: "text-accent dark:text-neon-cyan",
        bg: "bg-accent/10 dark:bg-neon-cyan/10"
    },
    {
        title: "Pending Payments",
        value: "₹7,08,000",
        trend: "34 invoices",
        isPositive: false,
        icon: Clock,
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    },
    {
        title: "Overdue",
        value: "₹2,72,000",
        trend: "-2.1%",
        isPositive: false,
        icon: AlertCircle,
        color: "text-destructive",
        bg: "bg-destructive/10"
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

const getStatusColor = (status: string) => {
    switch (status) {
        case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "Pending": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Failed": return "bg-destructive/10 text-destructive border-destructive/20";
        case "Refunded": return "bg-muted text-muted-foreground border-muted-foreground/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "Completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
        case "Pending": return <Clock className="w-3.5 h-3.5" />;
        case "Failed": return <AlertCircle className="w-3.5 h-3.5" />;
        default: return null;
    }
}

export default function PaymentsPage() {
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Payments</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage transactions, invoices, and financial overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportPayments} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Export
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:border-primary/40 relative overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.1),_transparent_70%)] rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : (kpi.icon === Clock ? null : <ArrowDownRight className="w-3 h-3" />)}
                                    {kpi.trend}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</h3>
                                <p className="text-3xl font-heading font-bold text-foreground dark:text-white tracking-tight">{kpi.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft">
                {/* Table Header / Filters */}
                <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-charcoal/30 dark:bg-black/20">
                    <h2 className="text-lg font-heading font-semibold text-foreground">Recent Transactions</h2>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search transaction..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <button className="p-2 rounded-xl border border-primary/10 hover:bg-charcoal dark:hover:bg-white/5 transition-colors text-muted-foreground">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/10 text-sm font-medium text-muted-foreground">
                                <th className="px-6 py-4 font-medium">Transaction ID</th>
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-primary/5">
                            {transactions.map((tx) => (
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
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(tx.status)}`}>
                                            {getStatusIcon(tx.status)}
                                            {tx.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="text-sm font-medium text-primary dark:text-gold-glow hover:text-primary/80 transition-colors">
                                            View
                                        </button>
                                        <button className="ml-4 text-muted-foreground hover:text-foreground transition-colors">
                                            <MoreVertical className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
            </div>
        </div>
    );
}
