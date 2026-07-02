'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    Settings2,
    ShieldCheck,
    SmartphoneNfc,
    Globe,
    BellRing,
    Laptop,
    Moon,
    Sun,
    LockKeyhole,
    Download,
    Trash2,
    EyeOff,
    CheckCircle2,
    Loader2
} from 'lucide-react';

export default function SettingsPanel() {
    const [isSavingSecurity, setIsSavingSecurity] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);

    // Mock State for UI interactivity
    const [twoFactor, setTwoFactor] = useState(true);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [biometric, setBiometric] = useState(false);

    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('EST');

    const handleSaveSecurity = async () => {
        setIsSavingSecurity(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSavingSecurity(false);
    };

    const handleSavePreferences = async () => {
        setIsSavingPreferences(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSavingPreferences(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-slate-900 via-charcoal to-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 w-fit mb-2">
                        <Settings2 className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Configuration</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-white mt-1">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Settings</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-lg">
                        Manage your account security, application preferences, and privacy controls.
                    </p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Security & Privacy) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Security Settings */}
                    <Card className="glass-card bg-slate-900/40 backdrop-blur-xl border-slate-800/60 overflow-hidden relative">
                        {/* Decorative Top Border */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

                        <CardHeader className="pb-4 border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-white">Account Security</CardTitle>
                                    <CardDescription className="text-slate-400">Update your password and manage authentication methods.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-8">

                            {/* Password Change */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">Change Password</h4>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current-password" className="text-slate-400">Current Password</Label>
                                        <div className="relative">
                                            <Input id="current-password" type="password" placeholder="••••••••" className="bg-slate-950/50 border-slate-800 focus-visible:ring-indigo-500 text-slate-200" />
                                            <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="new-password" className="text-slate-400">New Password</Label>
                                            <Input id="new-password" type="password" placeholder="••••••••" className="bg-slate-950/50 border-slate-800 focus-visible:ring-indigo-500 text-slate-200" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm-password" className="text-slate-400">Confirm New Password</Label>
                                            <Input id="confirm-password" type="password" placeholder="••••••••" className="bg-slate-950/50 border-slate-800 focus-visible:ring-indigo-500 text-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-slate-800/50" />

                            {/* Advanced Security */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">Advanced Protection</h4>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800/50 bg-slate-950/30">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-slate-200 font-medium">Two-Factor Authentication (2FA)</Label>
                                        <p className="text-sm text-slate-500">Protect your account with an extra layer of security.</p>
                                    </div>
                                    <Switch checked={twoFactor} onCheckedChange={setTwoFactor} className="data-[state=checked]:bg-indigo-500" />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800/50 bg-slate-950/30">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-base text-slate-200 font-medium">New Login Alerts</Label>
                                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] uppercase font-bold tracking-wider py-0 rounded">Recommended</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500">Get notified of unrecognized logins.</p>
                                    </div>
                                    <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} className="data-[state=checked]:bg-indigo-500" />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800/50 bg-slate-950/30">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-base text-slate-200 font-medium">Biometric Login</Label>
                                        </div>
                                        <p className="text-sm text-slate-500">Allow Face ID or Touch ID on supported mobile devices.</p>
                                    </div>
                                    <Switch checked={biometric} onCheckedChange={setBiometric} className="data-[state=checked]:bg-indigo-500" />
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="bg-slate-950/50 border-t border-slate-800/50 py-4 px-6 flex justify-end">
                            <Button
                                onClick={handleSaveSecurity}
                                disabled={isSavingSecurity}
                                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-indigo-900/20 px-8"
                            >
                                {isSavingSecurity ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <LockKeyhole className="mr-2 h-4 w-4" />
                                        Update Security
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Privacy & Data */}
                    <Card className="glass-card bg-slate-900/40 backdrop-blur-xl border-slate-800/60 overflow-hidden border-l-4 border-l-slate-700">
                        <CardHeader className="pb-4 border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-white">Data & Privacy</CardTitle>
                                    <CardDescription className="text-slate-400">Manage how your personal data is utilized.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="data-export" className="border-slate-800/50">
                                    <AccordionTrigger className="hover:no-underline hover:text-white text-slate-300">
                                        <div className="flex items-center gap-3">
                                            <Download className="w-5 h-5 text-indigo-400" />
                                            <span>Export Personal Data</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-slate-400 pt-2 pb-4">
                                        Request a copy of your personal data, including workout history, diet plans, and billing statements.
                                        This process may take up to 24 hours.
                                        <Button variant="outline" className="mt-4 bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 block">
                                            Request Data Export
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="delete-account" className="border-0">
                                    <AccordionTrigger className="hover:no-underline hover:text-rose-400 text-slate-300">
                                        <div className="flex items-center gap-3">
                                            <Trash2 className="w-5 h-5 text-rose-500" />
                                            <span className="text-rose-500">Delete Account</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-slate-400 pt-2 pb-4">
                                        <p className="mb-4">
                                            Once you delete your account, there is no going back. All your data, active subscriptions, and progress will be permanently erased.
                                        </p>
                                        <Button variant="destructive" className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20">
                                            Initiate Deletion
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column (Preferences) */}
                <div className="space-y-8">
                    <Card className="glass-card bg-slate-900/40 backdrop-blur-xl border-slate-800/60 h-full flex flex-col relative overflow-hidden">
                        {/* Decorative Top Border */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />

                        <CardHeader className="pb-4 border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-white">App Preferences</CardTitle>
                                    <CardDescription className="text-slate-400">Customize your digital experience.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 flex-1">

                            {/* Theme Selection */}
                            <div className="space-y-3">
                                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Application Theme</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-200">
                                        <SelectValue placeholder="Select a theme" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                                        <SelectItem value="light" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Sun className="w-4 h-4 text-amber-500" /> Light Mode
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="dark" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="system" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Laptop className="w-4 h-4 text-slate-400" /> System Default
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Language */}
                            <div className="space-y-3">
                                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Display Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-200">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                                        <SelectItem value="en" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">English (US)</SelectItem>
                                        <SelectItem value="es" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Español</SelectItem>
                                        <SelectItem value="fr" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Français</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Timezone */}
                            <div className="space-y-3">
                                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Timezone</Label>
                                <Select value={timezone} onValueChange={setTimezone}>
                                    <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-200">
                                        <SelectValue placeholder="Select Timezone" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                                        <SelectItem value="EST" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Eastern Time (EST)</SelectItem>
                                        <SelectItem value="CST" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Central Time (CST)</SelectItem>
                                        <SelectItem value="PST" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Pacific Time (PST)</SelectItem>
                                        <SelectItem value="GMT" className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Greenwich Mean Time (GMT)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-slate-500 mt-1">Class times will be formatted based on this.</p>
                            </div>

                        </CardContent>
                        <CardFooter className="bg-slate-950/50 border-t border-slate-800/50 py-4 px-6 flex justify-end mt-auto">
                            <Button
                                onClick={handleSavePreferences}
                                disabled={isSavingPreferences}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                            >
                                {isSavingPreferences ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-400" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                                        Save Preferences
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}
