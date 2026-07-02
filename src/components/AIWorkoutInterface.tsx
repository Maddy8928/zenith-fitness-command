"use client";

import { Zap, Brain, Heart, Flame, TrendingUp, Cpu } from 'lucide-react';
import { useState } from 'react';

interface EnergyRing {
  id: number;
  label: string;
  value: number;
  color: 'gold' | 'cyan' | 'accent';
  icon: React.ReactNode;
}

const EnergyRing = ({ ring, index }: { ring: EnergyRing; index: number }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (ring.value / 100) * circumference;
  
  const colorMap = {
    gold: 'from-primary to-primary/60',
    cyan: 'from-neon-cyan to-neon-cyan/60',
    accent: 'from-accent to-accent/60'
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        {/* Outer glow ring */}
        <svg className="absolute inset-0 w-24 h-24 transform -rotate-90" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 192, 61, 0.3))' }}>
          <circle cx="48" cy="48" r="45" fill="none" stroke="transparent" strokeWidth="2" />
          <circle
            cx="48"
            cy="48"
            r="45"
            fill="none"
            stroke={ring.color === 'gold' ? '#ffc03d' : ring.color === 'cyan' ? '#00d9ff' : '#00ffff'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity="0.8"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[ring.color]} 
            flex items-center justify-center text-white mb-1 shadow-glow`}>
            {ring.icon}
          </div>
          <span className="text-sm font-bold text-foreground">{ring.value}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-wide">{ring.label}</p>
    </div>
  );
};

export default function AIWorkoutInterface() {
  const [activeMetric, setActiveMetric] = useState(0);
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);

  const energyRings: EnergyRing[] = [
    { id: 1, label: 'Power', value: 87, color: 'gold', icon: <Zap className="w-5 h-5" /> },
    { id: 2, label: 'Endurance', value: 72, color: 'cyan', icon: <Heart className="w-5 h-5" /> },
    { id: 3, label: 'Recovery', value: 64, color: 'accent', icon: <Flame className="w-5 h-5" /> },
  ];

  const recommendations = [
    { icon: <Brain className="w-5 h-5" />, title: 'Smart Training', description: 'Personalized workout based on your performance metrics' },
    { icon: <Cpu className="w-5 h-5" />, title: 'AI Analysis', description: 'Real-time form analysis and optimization suggestions' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Progress Tracking', description: 'Predictive analytics for your fitness goals' },
  ];

  const floatingMetrics = [
    { label: 'Heart Rate', value: '142', unit: 'bpm', position: 'top-8 left-8' },
    { label: 'Calories', value: '342', unit: 'kcal', position: 'top-12 right-12' },
    { label: 'Duration', value: '28:45', unit: 'min', position: 'bottom-16 left-10' },
    { label: 'Intensity', value: '8.3', unit: '/10', position: 'bottom-12 right-8' },
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-neon-cyan">AI Intelligence</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Your <span className="bg-gradient-to-r from-neon-cyan via-accent to-primary bg-clip-text text-transparent">AI Trainer</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Advanced machine learning technology that understands your fitness journey and optimizes every workout
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center mb-16">
          {/* Holographic Assistant Panel */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 
              transition-opacity duration-500 -z-10 blur-2xl bg-gradient-to-br from-neon-cyan/30 via-primary/20 to-accent/30" />
            
            <div className="relative rounded-3xl border-2 border-neon-cyan/30 dark:border-neon-cyan/50 
              bg-gradient-to-br from-white/10 dark:from-background/50 to-neon-cyan/5 dark:to-background/20 
              backdrop-blur-2xl p-8 md:p-10 overflow-hidden">
              
              {/* Holographic glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 
                bg-gradient-radial from-neon-cyan/20 via-transparent to-transparent 
                rounded-full blur-3xl pointer-events-none animate-pulse" />

              <div className="relative space-y-8">
                {/* AI Status */}
                <div className="flex items-center gap-3">
                  <div className="relative w-3 h-3">
                    <div className="absolute inset-0 bg-neon-cyan rounded-full animate-pulse" />
                    <div className="absolute inset-0.5 bg-neon-cyan rounded-full" />
                  </div>
                  <p className="text-sm font-semibold text-neon-cyan uppercase tracking-wide">AI System Active</p>
                </div>

                {/* Assistant Message */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Optimal Performance Detected</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your performance metrics indicate you're in peak condition. I recommend increasing intensity by 12% to maximize gains while maintaining safety thresholds.
                  </p>
                </div>

                {/* Floating Performance Metrics */}
                <div className="relative h-40">
                  {floatingMetrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className={`absolute ${metric.position} group/metric cursor-default`}
                    >
                      <div className="rounded-xl border-1.5 border-primary/40 dark:border-primary/60 
                        bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/20 dark:to-primary/10 
                        backdrop-blur-lg p-3 transition-all duration-300 hover:border-primary/70 dark:hover:border-primary/100">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{metric.label}</p>
                        <p className="text-lg font-bold text-primary dark:text-gold-glow">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button className="w-full group/btn relative rounded-xl border-2 border-neon-cyan/30 
                  dark:border-neon-cyan/50 bg-gradient-to-r from-neon-cyan/10 to-neon-cyan/5 
                  dark:from-neon-cyan/20 dark:to-neon-cyan/10 p-3 font-semibold text-foreground 
                  transition-all duration-300 hover:border-neon-cyan/70 dark:hover:border-neon-cyan/100">
                  <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover/btn:opacity-100 
                    transition-opacity duration-500 -z-10 blur-lg bg-gradient-to-r from-neon-cyan/30 to-neon-cyan/10 dark:shadow-neon" />
                  <span className="relative">Start Recommended Workout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Energy Rings Display */}
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="flex items-center justify-center gap-8 md:gap-12">
              {energyRings.map((ring, idx) => (
                <div
                  key={ring.id}
                  onMouseEnter={() => setHoveredRing(ring.id)}
                  onMouseLeave={() => setHoveredRing(null)}
                  className="transition-transform duration-300 hover:scale-110"
                >
                  <EnergyRing ring={ring} index={idx} />
                </div>
              ))}
            </div>

            {/* Ring Description */}
            <div className="text-center max-w-sm">
              <p className="text-sm text-muted-foreground">
                Real-time energy tracking powered by advanced biometric sensors and AI analysis
              </p>
            </div>
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActiveMetric(idx)}
              className="group relative rounded-2xl border-2 border-primary/20 dark:border-primary/40 
                bg-gradient-to-br from-white/10 dark:from-background/50 to-primary/5 dark:to-background/20 
                backdrop-blur-xl p-6 transition-all duration-300 cursor-default"
            >
              <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 
                transition-opacity duration-500 -z-10 blur-lg bg-gradient-to-br from-primary/30 to-accent/10 dark:shadow-glow" />

              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 
                  flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-glow">
                  {rec.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
