"use client";

import { Activity, TrendingUp, Users, Flame } from 'lucide-react';

function MiniChart() {
  const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];
  return (
    <div className="flex items-end gap-2 h-16 w-full justify-between px-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="group/bar relative flex flex-col justify-end h-full w-full"
        >
          <div
            style={{ height: `${h}%` }}
            className="w-full max-w-[12px] mx-auto rounded-t-sm bg-gradient-to-t from-neon-cyan/20 to-neon-cyan shadow-[0_0_10px_hsl(var(--neon-cyan)/0.5)] group-hover/bar:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.8)] transition-all duration-300 relative"
          >
            {/* Glow cap */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-50 rounded-t-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, accent }: {
  icon: typeof Activity;
  label: string;
  value: string;
  change: string;
  accent: 'gold' | 'cyan';
}) {
  const isGold = accent === 'gold';
  const accentColors = isGold
    ? {
      bg: 'bg-charcoal/40',
      icon: 'bg-primary/10 text-gold-glow border border-primary/20 shadow-[0_0_15px_hsl(var(--gold)/0.2)]',
      border: 'border-white/5 hover:border-primary/40',
      glow: 'group-hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)]'
    }
    : {
      bg: 'bg-charcoal/40',
      icon: 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)]',
      border: 'border-white/5 hover:border-neon-cyan/40',
      glow: 'group-hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.15)]'
    };

  return (
    <div className={`group relative rounded-2xl p-6 border ${accentColors.border} 
      ${accentColors.bg} backdrop-blur-xl ${accentColors.glow}
      transition-all duration-500 cursor-default overflow-hidden`}>

      {/* Subtle background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isGold ? 'from-primary/5 to-transparent' : 'from-neon-cyan/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
          transition-all duration-300 group-hover:scale-110 ${accentColors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white">{value}</p>
            <span className={`text-sm font-bold ${isGold ? 'text-gold-glow' : 'text-neon-cyan'}`}>{change}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="py-24 px-6 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-gold-glow animate-pulse shadow-[0_0_10px_hsl(var(--gold))] " />
            <p className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-gold-glow">Live Terminal</p>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground mb-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Command Center</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-body">
            Real-time analytics and elite facility management at your fingertips.
          </p>
        </div>

        {/* Main Dashboard Panel */}
        <div className="group relative rounded-[2.5rem] border border-white/10 
          bg-charcoal/30 
          backdrop-blur-2xl p-8 md:p-12 transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />

          <div className="relative space-y-8">
            {/* Metric Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <MetricCard icon={Users} label="Active Today" value="847" change="+12%" accent="gold" />
              <MetricCard icon={Activity} label="Workouts Logged" value="2,341" change="+8%" accent="cyan" />
              <MetricCard icon={Flame} label="Calories Burned" value="1.2M" change="+15%" accent="gold" />
            </div>

            {/* Weekly Activity Chart Panel */}
            <div className="group/chart relative rounded-[2rem] border border-white/5 
              bg-black/40 backdrop-blur-md
              p-8 transition-all duration-500 hover:border-neon-cyan/30 hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.1)]">

              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent rounded-[2rem] pointer-events-none opacity-0 group-hover/chart:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-heading font-black text-white">Facility Utilization</h3>
                  <p className="text-sm text-slate-400">Peak hour member engagement</p>
                </div>
                <div className="inline-flex items-center gap-2 text-neon-cyan text-sm font-bold 
                  bg-neon-cyan/10 border border-neon-cyan/20 px-4 py-2 rounded-xl shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)]">
                  <TrendingUp className="w-4 h-4" />
                  +23% VS LAST WEEK
                </div>
              </div>
              <MiniChart />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
