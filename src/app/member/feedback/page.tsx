'use client';

import React, { useState } from 'react';
import { useFeedback, FeedbackRole } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import { 
    MessageSquare, 
    Star, 
    Send, 
    CheckCircle2, 
    ChefHat, 
    Zap, 
    UserCheck,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MemberFeedbackPage() {
    const { addFeedback } = useFeedback();
    const { user } = useAuth();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        role: 'Receptionist' as FeedbackRole,
        target: '',
        rating: 5,
        comment: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        await addFeedback({
            member: user?.name || 'Anonymous Member',
            target: formData.target || `${formData.role} Team`,
            role: formData.role,
            rating: formData.rating,
            comment: formData.comment
        });

        setIsSubmitting(false);
        setStep('success');
    };

    const roles: { id: FeedbackRole; label: string; icon: any; color: string }[] = [
        { id: 'Receptionist', label: 'Reception', icon: UserCheck, color: 'text-amber-400' },
        { id: 'Trainer', label: 'Trainer', icon: Zap, color: 'text-cyan-400' },
        { id: 'Cafe', label: 'Cafe Team', icon: ChefHat, color: 'text-emerald-400' },
        { id: 'Facility', label: 'Facility', icon: MessageSquare, color: 'text-purple-400' },
    ];

    if (step === 'success') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 relative z-10" />
                </div>
                <h1 className="text-3xl font-heading font-black text-white mb-4 italic">FEEDBACK <span className="text-emerald-400 not-italic">RECEIVED</span></h1>
                <p className="text-muted-foreground text-center max-w-md mb-10 font-medium">
                    Thank you for helping us improve the Zenith experience. Our management team has been notified.
                </p>
                <Link href="/member">
                    <Button className="px-8 py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest transition-all">
                        Return to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link href="/member" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-4 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back</span>
                    </Link>
                    <h1 className="text-4xl font-heading font-black tracking-tight text-white flex items-center gap-3 italic">
                        <MessageSquare className="w-10 h-10 text-primary animate-pulse" />
                        SHARE YOUR <span className="text-primary tracking-tighter not-italic">THOUGHTS</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Help us shape the future of Zenith Fitness.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-3 glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Role Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Who are you reviewing?</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r.id })}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                                            formData.role === r.id 
                                            ? 'bg-white/10 border-primary shadow-glow' 
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <r.icon className={`w-5 h-5 ${formData.role === r.id ? 'text-primary' : r.color}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${formData.role === r.id ? 'text-white' : 'text-muted-foreground'}`}>
                                            {r.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1 text-center block">Overall Experience</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="p-2 transition-transform hover:scale-125"
                                    >
                                        <Star 
                                            className={`w-10 h-10 transition-all ${
                                                star <= formData.rating 
                                                ? 'fill-primary text-primary drop-shadow-[0_0_8px_rgba(251,191,35,0.4)]' 
                                                : 'text-white/10 fill-transparent'
                                            }`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Staff Member Name <span className="text-[10px] lowercase text-white/20">(Optional)</span></label>
                            <input 
                                type="text"
                                placeholder={`e.g. ${formData.role === 'Cafe' ? 'Bjorn' : formData.role === 'Trainer' ? 'Alex' : 'Sarah'}`}
                                value={formData.target}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            />
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Detailed Comments</label>
                            <textarea 
                                required
                                rows={4}
                                placeholder="What stood out to you? Any areas for improvement?"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
                            />
                        </div>

                        <Button 
                            disabled={isSubmitting}
                            className="w-full py-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest shadow-glow group"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    SUBMITTING...
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    SEND FEEDBACK
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                </div>

                {/* Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <h3 className="text-xl font-heading font-black text-white italic mb-4">WHY WE <span className="text-primary not-italic">LISTEN</span></h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            Your feedback is directly routed to our management workstation. We use your insights to optimize our services, recognize top-performing staff, and ensure every visit to Zenith is peak performance.
                        </p>
                        
                        <div className="space-y-4 mt-8">
                            {[
                                { title: "Response Time", desc: "Reviewed within 24 hours", icon: CheckCircle2 },
                                { title: "Direct Impact", desc: "Influence gym policy", icon: CheckCircle2 },
                                { title: "Anonymous Choice", desc: "Privacy honored on request", icon: CheckCircle2 },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-xs font-bold text-white leading-none">{item.title}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
