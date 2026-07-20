"use client";

import { Save, User, Building, Bell, Shield, Palette, CreditCard } from "lucide-react";
import { useState } from "react";

const tabs = [
    { id: "profile", label: "Gym Profile", icon: Building },
    { id: "account", label: "Admin Account", icon: User },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage gym preferences, billing, and account settings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Settings Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${isActive
                                        ? "bg-primary/10 text-primary dark:text-gold-glow font-medium shadow-[inset_2px_0_0_0_hsl(var(--gold))]"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "" : "opacity-70"}`} />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Settings Content Area */}
                <div className="lg:col-span-9">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 min-h-[500px]">
                        {activeTab === "profile" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-foreground dark:text-white mb-1">Gym Profile</h2>
                                    <p className="text-sm text-muted-foreground">Update your gym's public information and contact details.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 pb-6 border-b border-primary/10">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-3xl font-bold text-primary dark:text-gold-glow">
                                            NX
                                        </div>
                                        <div>
                                            <button className="px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 transition-colors text-sm font-medium mb-2">
                                                Change Logo
                                            </button>
                                            <p className="text-xs text-muted-foreground">Recommended size: 800x800px. Max 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Gym Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Flex Gym"
                                                className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Contact Email</label>
                                            <input
                                                type="email"
                                                defaultValue="hello@flexgym.com"
                                                className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Phone Number</label>
                                            <input
                                                type="text"
                                                defaultValue="+1 (555) 000-0000"
                                                className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Time Zone</label>
                                            <select className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground appearance-none">
                                                <option>Pacific Time (PT)</option>
                                                <option>Mountain Time (MT)</option>
                                                <option>Central Time (CT)</option>
                                                <option>Eastern Time (ET)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Address</label>
                                        <textarea
                                            rows={3}
                                            defaultValue="123 Fitness Blvd, Suite 100&#10;Metropolis, NY 10001"
                                            className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== "profile" && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground animate-in fade-in duration-500 min-h-[400px]">
                                <SettingsPlaceholderIcon id={activeTab} />
                                <div>
                                    <p className="text-lg font-medium text-foreground mb-1">Coming Soon</p>
                                    <p className="text-sm max-w-sm mx-auto">The {tabs.find(t => t.id === activeTab)?.label} settings panel is currently under development.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsPlaceholderIcon({ id }: { id: string }) {
    switch (id) {
        case 'account': return <User className="w-16 h-16 opacity-20" />;
        case 'billing': return <CreditCard className="w-16 h-16 opacity-20" />;
        case 'notifications': return <Bell className="w-16 h-16 opacity-20" />;
        case 'appearance': return <Palette className="w-16 h-16 opacity-20" />;
        case 'security': return <Shield className="w-16 h-16 opacity-20" />;
        default: return <Building className="w-16 h-16 opacity-20" />
    }
}
