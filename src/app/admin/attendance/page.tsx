"use client";

import { useState } from "react";
import { handleExport } from "@/utils/exportUtils";
import { toast } from "sonner";
import {
    Users,
    MapPin,
    Search,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    Download,
    MoreHorizontal,
    Fingerprint
} from "lucide-react";

// Mock data for live check-ins
const recentCheckIns = [
    { id: "LOG-101", name: "David Miller", time: "10:45 AM", status: "Checked In", location: "Main Entrance", type: "Member", avatar: "DM" },
    { id: "LOG-102", name: "Sarah Williams", time: "10:32 AM", status: "Checked In", location: "Yoga Studio", type: "VIP", avatar: "SW" },
    { id: "LOG-103", name: "Alex Johnson", time: "10:15 AM", status: "Checked Out", location: "Main Entrance", type: "Staff", avatar: "AJ" },
    { id: "LOG-104", name: "Jessica Taylor", time: "09:50 AM", status: "Checked In", location: "Cycling Room", type: "Member", avatar: "JT" },
    { id: "LOG-105", name: "Mike Tyson", time: "09:45 AM", status: "Checked In", location: "Free Weights", type: "VIP", avatar: "MT" },
    { id: "LOG-106", name: "Emma Davis", time: "09:30 AM", status: "Failed", location: "Main Entrance", type: "Guest", avatar: "ED" },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Checked In": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "Checked Out": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Failed": return "bg-destructive/10 text-destructive border-destructive/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "Checked In": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case "Checked Out": return <Clock className="w-4 h-4 text-orange-500" />;
        case "Failed": return <XCircle className="w-4 h-4 text-destructive" />;
        default: return null;
    }
};

export default function AttendancePage() {
    const [searchTerm, setSearchTerm] = useState("");

    const handleExportLogs = async () => {
        try {
            const headers = ['Log ID', 'Name', 'Time', 'Location', 'Status', 'Type'];
            const data = recentCheckIns.map(log => [
                log.id,
                log.name,
                log.time,
                log.location,
                log.status,
                log.type
            ]);

            await handleExport('CSV', {
                filename: `Attendance_Logs_${new Date().toISOString().split('T')[0]}`,
                title: 'Zenith Fitness Attendance Access Logs',
                headers,
                data,
                category: 'Attendance'
            });
            toast.success('Attendance logs exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export attendance logs.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Check-ins</h1>
                    <p className="text-sm text-muted-foreground mt-1">Live check-ins, access logs, and occupancy rates.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={handleExportLogs} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Export Logs
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Fingerprint className="w-4 h-4" />
                        Manual Check-In
                    </button>
                </div>
            </div>

            {/* Live Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Checked In Today</p>
                            <h3 className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">284</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-green-500 font-medium relative z-10 flex items-center gap-1">
                        +12% <span className="text-muted-foreground font-normal">from yesterday</span>
                    </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Current Occupancy</p>
                            <h3 className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">86<span className="text-lg text-muted-foreground font-normal">/300</span></h3>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <MapPin className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal relative z-10 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Comfortable level
                    </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Classes Active</p>
                            <h3 className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">4</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal relative z-10">
                        78 participants across 4 studios
                    </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Access Denied</p>
                            <h3 className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">3</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                            <XCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal relative z-10">
                        Expired memberships or unpaid dues
                    </p>
                </div>
            </div>

            {/* Core Interface area */}
            <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden bg-charcoal/20 dark:bg-black/20">

                {/* Table Toolbar */}
                <div className="p-4 md:p-6 border-b border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                        <h2 className="text-lg font-heading font-bold text-foreground dark:text-white whitespace-nowrap hidden lg:block">Access Logs</h2>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name or log ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors text-sm font-medium whitespace-nowrap">
                            <Filter className="w-4 h-4" />
                            <span>Location</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors text-sm font-medium whitespace-nowrap">
                            <Calendar className="w-4 h-4" />
                            <span>Today</span>
                        </button>
                    </div>
                </div>

                {/* Access Logs Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-black/5 dark:bg-white/5 border-b border-primary/5">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Member / Entity</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Time</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Location</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {recentCheckIns.map((log) => (
                                <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border justify-center border-primary/20 flex items-center text-primary dark:text-gold-glow font-bold text-xs relative shrink-0">
                                                {log.avatar}
                                                {log.status === "Checked In" && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground dark:text-white flex items-center gap-2">
                                                    {log.name}
                                                    <span className="text-[10px] uppercase bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground font-medium tracking-wider">
                                                        {log.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{log.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            {log.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {log.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                            {log.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 border-t border-primary/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">6</span> out of <span className="font-semibold text-foreground">284</span> check-ins today</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-primary/20 bg-background/50 hover:bg-primary/10 text-sm font-medium transition-colors disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1.5 rounded-lg border border-primary/20 bg-background/50 hover:bg-primary/10 text-sm font-medium transition-colors">Next</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
