"use client";

import { Zap, Shield, BarChart3, Users, Clock, Target } from 'lucide-react';
import GlassCard from './GlassCard';

const features = [
  { icon: BarChart3, title: 'Real-Time Analytics', description: 'Track performance metrics, attendance patterns, and revenue streams with live dashboards.', accent: 'gold' as const },
  { icon: Users, title: 'Member Management', description: 'Comprehensive member profiles, automated billing, and personalized engagement tracking.', accent: 'cyan' as const },
  { icon: Clock, title: 'Smart Scheduling', description: 'AI-powered class scheduling that optimizes trainer availability and member preferences.', accent: 'gold' as const },
  { icon: Shield, title: 'Access Control', description: 'Biometric and RFID-integrated access management with real-time occupancy monitoring.', accent: 'cyan' as const },
  { icon: Target, title: 'Goal Tracking', description: 'Personalized fitness goals with progress visualization and automated milestone alerts.', accent: 'gold' as const },
  { icon: Zap, title: 'Automated Workflows', description: 'Streamline operations with intelligent automation for billing, communications, and reports.', accent: 'cyan' as const },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 dark:bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/5 dark:bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 dark:border-primary/40 bg-primary/5 dark:bg-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary dark:bg-gold-glow" />
            <span className="text-xs md:text-sm font-body font-semibold text-primary dark:text-gold-glow uppercase tracking-widest">
              Command & Control
            </span>
          </div>

          <h2 className="font-heading text-4xl md:text-6xl font-black text-foreground dark:text-white mb-6 leading-tight">
            Everything You <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">Need</span>
          </h2>

          <p className="max-w-2xl mx-auto font-body text-lg text-muted-foreground dark:text-slate-300 leading-relaxed">
            Powerful tools designed for elite fitness facilities. Streamline operations, enhance member experiences, and drive growth with our comprehensive platform.
          </p>

          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan mx-auto mt-8 rounded-full" />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <GlassCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

