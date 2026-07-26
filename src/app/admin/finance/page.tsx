"use client";

import React, { useState } from "react";
import { 
    CreditCard, DollarSign, TrendingUp, FileText, Download, Search, 
    Filter, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle,
    PieChart, Receipt, Layers
} from "lucide-react";
import RevenueOverview from "@/components/admin/RevenueOverview";

const paymentsData = [
    { id: "PAY-9041", member: "Alex Johnson", amount: "₹24,999", plan: "Elite Annual", date: "Today, 10:45 AM", status: "Completed", method: "UPI / PhonePe" },
    { id: "PAY-9040", member: "Sarah Williams", amount: "₹4,499", plan: "Pro Monthly", date: "Today, 09:12 AM", status: "Completed", method: "Credit Card" },
    { id: "PAY-9039", member: "Michael Chen", amount: "₹2,499", plan: "Starter Monthly", date: "Yesterday, 06:30 PM", status: "Pending", method: "Bank Transfer" },
    { id: "PAY-9038", member: "Emma Davis", amount: "₹4,499", plan: "Pro Monthly", date: "2 days ago", status: "Completed", method: "UPI / GPay" },
    { id: "PAY-9037", member: "David Miller", amount: "₹24,999", plan: "Elite Annual", date: "3 days ago", status: "Refunded", method: "Debit Card" },
];

const reportsList = [
    { title: "Monthly Tax Summary", description: "GST & Tax collected across memberships and PT packages.", period: "July 2026", size: "1.2 MB", format: "PDF / XLS" },
    { title: "Quarterly P&L Statement", description: "Consolidated profit & loss statement for Q2 2026.", period: "Q2 (Apr - Jun)", size: "3.4 MB", format: "PDF / XLS" },
    { title: "Annual Revenue Forecast", description: "AI-projected run rate and cash flow analysis.", period: "FY 2026-27", size: "2.1 MB", format: "PDF" },
    { title: "Membership Retention Financials", description: "LTV and churn impact breakdown by membership plan.", period: "Last 12 Months", size: "1.8 MB", format: "XLSX" },
];

const expensesList = [
    { category: "Staff & Trainer Payroll", amount: "₹6,50,000", percentage: "68.8%", trend: "+3.2%", description: "Monthly base salaries & trainer revenue share" },
    { category: "Facility & Gym Rent", amount: "₹1,45,000", percentage: "15.3%", trend: "0%", description: "Fixed commercial lease & property tax" },
    { category: "Equipment Maintenance", amount: "₹85,000", percentage: "9.0%", trend: "-12.4%", description: "Cardio & strength equipment servicing" },
    { category: "Utilities (Electricity, Water, HVAC)", amount: "₹45,000", percentage: "4.8%", trend: "+5.1%", description: "Monthly facility electricity & HVAC usage" },
    { category: "Marketing & Software Stack", amount: "₹20,000", percentage: "2.1%", trend: "0%", description: "Member app, SMS alerts & local ads" },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Completed":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "Pending":
            return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        case "Refunded":
            return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        default:
            return "bg-primary/10 text-primary border-primary/20";
    }
};

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<"Revenue" | "Payments" | "Reports" | "Expenses">("Revenue");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPayments = paymentsData.filter(p =>
        p.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.plan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">
                        Finance Command Center
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Consolidated financial performance, payments, reports, and expense tracking.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total MTD Revenue", value: "₹21.50 L", icon: DollarSign, color: "text-primary dark:text-gold-glow" },
                    { label: "Monthly Growth", value: "+15.4%", icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Monthly Expenses", value: "₹9.45 L", icon: Receipt, color: "text-amber-400" },
                    { label: "Net Margin", value: "56.0%", icon: PieChart, color: "text-cyan-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-primary/10">
                        <div className={`p-3 rounded-full bg-background/50 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground dark:text-white">{stat.value}</p>
                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Role Navigation Tabs: Revenue | Payments | Reports | Expenses */}
            <div className="flex items-center gap-2 border-b border-primary/10 pb-1 overflow-x-auto no-scrollbar">
                {(["Revenue", "Payments", "Reports", "Expenses"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            activeTab === tab
                                ? "bg-primary/15 text-primary dark:text-gold-glow border border-primary/30 shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                    >
                        {tab === "Revenue" && <TrendingUp className="w-4 h-4" />}
                        {tab === "Payments" && <CreditCard className="w-4 h-4" />}
                        {tab === "Reports" && <FileText className="w-4 h-4" />}
                        {tab === "Expenses" && <Receipt className="w-4 h-4" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab 1: Revenue View */}
            {activeTab === "Revenue" && (
                <div className="space-y-6">
                    <RevenueOverview />
                </div>
            )}

            {/* Tab 2: Payments View */}
            {activeTab === "Payments" && (
                <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft flex flex-col min-h-[450px]">
                    <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-charcoal/30 dark:bg-black/20">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search payments by member or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                            Showing <span className="font-bold text-foreground dark:text-white">{filteredPayments.length}</span> payment records
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-black/5 dark:bg-white/5">
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Member Name</th>
                                    <th className="px-6 py-4">Plan / Service</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date & Method</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-primary/5">
                                {filteredPayments.map((p) => (
                                    <tr key={p.id} className="group hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-muted-foreground">
                                            {p.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground dark:text-white">
                                            {p.member}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {p.plan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground dark:text-white">
                                            {p.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-xs text-foreground">{p.date}</p>
                                            <p className="text-[10px] text-muted-foreground">{p.method}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="text-xs text-primary dark:text-gold-glow hover:underline">
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Reports View */}
            {activeTab === "Reports" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportsList.map((rep, idx) => (
                        <div key={idx} className="glass-card rounded-3xl p-6 border border-primary/10 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary dark:text-gold-glow" />
                                        <h3 className="text-base font-heading font-bold text-foreground dark:text-white">{rep.title}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{rep.description}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-gold-glow text-[10px] font-bold uppercase">{rep.format}</span>
                            </div>
                            <div className="pt-4 border-t border-primary/10 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Period: <strong className="text-foreground">{rep.period}</strong> ({rep.size})</span>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary dark:text-gold-glow font-bold hover:bg-primary/20 transition-colors">
                                    <Download className="w-3.5 h-3.5" />
                                    Download Report
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 4: Expenses View */}
            {activeTab === "Expenses" && (
                <div className="glass-card rounded-3xl p-8 border border-primary/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground dark:text-white">Monthly Expense Allocation</h3>
                            <p className="text-xs text-muted-foreground">Operational overhead & payroll distribution.</p>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">Total Budget: <strong className="text-foreground dark:text-white">₹9,45,000 / mo</strong></span>
                    </div>

                    <div className="space-y-4">
                        {expensesList.map((exp, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground dark:text-white text-base">{exp.category}</span>
                                        <span className="text-xs font-mono text-muted-foreground">({exp.percentage})</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{exp.description}</p>
                                </div>
                                <div className="flex items-center gap-4 self-end sm:self-auto">
                                    <span className="text-sm font-semibold text-muted-foreground">{exp.trend}</span>
                                    <span className="text-lg font-heading font-bold text-foreground dark:text-white">{exp.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
