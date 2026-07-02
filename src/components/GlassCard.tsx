"use client";

import { LucideIcon } from 'lucide-react';

interface GlassCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: 'gold' | 'cyan';
}

export default function GlassCard({ icon: Icon, title, description, accent = 'gold' }: GlassCardProps) {
  const accentColors = accent === 'gold' 
    ? {
        light: 'from-primary/15 to-primary/5',
        icon: 'bg-primary/20 dark:bg-primary/30 text-primary dark:text-gold-glow',
        hover: 'hover:from-primary/25 hover:to-primary/10',
        border: 'border-primary/30 dark:border-primary/50',
        glow: 'dark:shadow-glow'
      }
    : {
        light: 'from-accent/15 to-accent/5',
        icon: 'bg-accent/20 dark:bg-accent/30 text-accent dark:text-neon-cyan',
        hover: 'hover:from-accent/25 hover:to-accent/10',
        border: 'border-accent/30 dark:border-accent/50',
        glow: 'dark:shadow-neon'
      };

  return (
    <div className={`group relative p-7 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ${accentColors.hover}`}>
      {/* Premium gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColors.light} dark:${accentColors.light}`} />
      
      {/* Border effect */}
      <div className={`absolute inset-0 rounded-3xl border-2 ${accentColors.border} transition-opacity duration-500 opacity-100 group-hover:opacity-100`} />
      
      {/* Hover glow background */}
      <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${accentColors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl ${accentColors.glow}`} />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${accentColors.icon} flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-gold-glow transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm md:text-base text-muted-foreground dark:text-slate-300 leading-relaxed group-hover:text-foreground dark:group-hover:text-slate-200 transition-colors duration-300">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center gap-2 text-primary dark:text-gold-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
          <span className="text-sm font-semibold">Learn more</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

