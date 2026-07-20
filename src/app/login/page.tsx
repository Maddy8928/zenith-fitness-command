'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Eye, EyeOff, Loader2, LogIn, ShieldCheck, User, Users, Shield, Award, Coffee, Store } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('MEMBER');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState('');

    const { user, login, isLoading } = useAuth();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === 'ADMIN') router.push('/admin');
            else if (user.role === 'TRAINER') router.push('/trainer');
            else if (user.role === 'RECEPTIONIST') router.push('/receptionist');
            else if (user.role === 'CAFE_WORKER') router.push('/cafe');
            else if (user.role === 'STORE_MANAGER') router.push('/store-manager');
            else router.push('/member');
        }
    }, [user, isLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const targetEmail = email || (selectedRole === 'MEMBER' ? 'member@flexgym.com' : `${selectedRole.toLowerCase()}@flexgym.com`);

        setIsLoggingIn(true);

        try {
            await login(targetEmail, selectedRole);
            if (selectedRole === 'ADMIN') router.push('/admin');
            else if (selectedRole === 'TRAINER') router.push('/trainer');
            else if (selectedRole === 'RECEPTIONIST') router.push('/receptionist');
            else if (selectedRole === 'CAFE_WORKER') router.push('/cafe');
            else if (selectedRole === 'STORE_MANAGER') router.push('/store-manager');
            else router.push('/member');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
            setIsLoggingIn(false);
        }
    };

    const handleQuickLogin = async (role: UserRole, demoEmail: string) => {
        setSelectedRole(role);
        setEmail(demoEmail);
        setPassword('password123');
        setIsLoggingIn(true);
        try {
            await login(demoEmail, role);
            if (role === 'ADMIN') router.push('/admin');
            else if (role === 'TRAINER') router.push('/trainer');
            else if (role === 'RECEPTIONIST') router.push('/receptionist');
            else if (role === 'CAFE_WORKER') router.push('/cafe');
            else if (role === 'STORE_MANAGER') router.push('/store-manager');
            else router.push('/member');
        } catch (err) {
            setError('Failed to login. Please try again.');
            setIsLoggingIn(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-50">

            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-rose-600/10 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,1)_100%)]" />
            </div>

            <motion.div
                className="z-10 w-full max-w-md"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="flex justify-center mb-10">
                    <div className="flex items-center gap-4 bg-charcoal/80 backdrop-blur-2xl border border-white/5 py-3 px-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal to-black border border-white/10 flex items-center justify-center shadow-[0_0_20px_hsl(var(--gold)/0.2)]">
                            <Dumbbell className="h-6 w-6 text-primary dark:text-gold-glow" />
                        </div>
                        <span className="text-3xl font-heading font-black tracking-tight text-white">
                            FLEX<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
                        </span>
                    </div>
                </motion.div>

                <Card className="bg-slate-900/60 backdrop-blur-2xl border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

                    <CardHeader className="space-y-3 pb-4 text-center">
                        <motion.div variants={itemVariants}>
                            <CardTitle className="text-3xl font-bold tracking-tight text-white">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-2">
                                Sign in to your account to access your dashboard
                            </CardDescription>
                        </motion.div>
                    </CardHeader>

                    <CardContent>
                        {/* Quick Demo Role Selector */}
                        <div className="mb-6">
                            <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block text-center">Quick Login As</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('MEMBER', 'member@flexgym.com')}
                                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${selectedRole === 'MEMBER' ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    Member
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('TRAINER', 'trainer@flexgym.com')}
                                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${selectedRole === 'TRAINER' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                                >
                                    <Award className="w-3.5 h-3.5" />
                                    Trainer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('ADMIN', 'admin@flexgym.com')}
                                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${selectedRole === 'ADMIN' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Admin
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants} className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email Format</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="member@flexgym.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 transition-all rounded-xl h-12"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-slate-300">Secure Password</Label>
                                    <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-slate-950/50 border-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 transition-all rounded-xl h-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
                                >
                                    {isLoggingIn ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Sign In as Member (`/member`)
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 border-t border-slate-800/50 pt-6">
                        <div className="text-sm text-center text-slate-400">
                            Are you new here? <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Apply for Membership</a>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

