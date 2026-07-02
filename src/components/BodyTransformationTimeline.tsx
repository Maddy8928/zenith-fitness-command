"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, Zap } from 'lucide-react';

interface TimelineMonth {
  id: number;
  month: string;
  weight: number;
  change: number;
  achievement: string;
}

interface BodyStat {
  label: string;
  initial: number;
  current: number;
  unit: string;
}

interface ProgressMonth {
  id: number;
  month: string;
  image: string;
  weight: number;
}

export default function BodyTransformationTimeline() {
  const [activeMonth, setActiveMonth] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const timelineMonths: TimelineMonth[] = [
    { id: 1, month: 'Month 1', weight: 95.2, change: -4.8, achievement: 'Building momentum' },
    { id: 2, month: 'Month 2', weight: 92.1, change: -3.1, achievement: 'Consistent progress' },
    { id: 3, month: 'Month 3', weight: 88.5, change: -3.6, achievement: 'Lifestyle shift' },
    { id: 4, month: 'Month 4', weight: 85.3, change: -3.2, achievement: 'Strength gains' },
    { id: 5, month: 'Month 5', weight: 81.7, change: -3.6, achievement: 'Peak condition' },
    { id: 6, month: 'Month 6', weight: 78.5, change: -3.2, achievement: 'Transformation complete' },
  ];

  const bodyStats: BodyStat[] = [
    { label: 'Weight', initial: 100, current: 78.5, unit: 'kg' },
    { label: 'Body Fat', initial: 32, current: 16, unit: '%' },
    { label: 'Muscle Mass', initial: 68, current: 82, unit: 'kg' },
    { label: 'Waist', initial: 98, current: 78, unit: 'cm' },
  ];

  const progressGallery: ProgressMonth[] = [
    { id: 1, month: 'Week 4', image: 'gradient-to-r from-primary/20 to-primary/5', weight: 95.2 },
    { id: 2, month: 'Week 8', image: 'gradient-to-r from-accent/20 to-accent/5', weight: 92.1 },
    { id: 3, month: 'Week 12', image: 'gradient-to-r from-primary/20 to-accent/10', weight: 88.5 },
    { id: 4, month: 'Week 16', image: 'gradient-to-r from-accent/20 to-primary/5', weight: 85.3 },
    { id: 5, month: 'Week 20', image: 'gradient-to-r from-primary/20 to-primary/5', weight: 81.7 },
  ];

  const visibleGallery = progressGallery.slice(currentGalleryIndex, currentGalleryIndex + 3);

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background via-background to-accent/3">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary dark:bg-gold-glow" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary dark:text-gold-glow">Transformation Stories</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-4 tracking-tight">
            Journey to Your <span className="font-semibold">Best Self</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Real results from our community members. Track monthly milestones, body composition changes, and lifestyle transformations.
          </p>
        </div>

        <div className="space-y-20">
          {/* Horizontal Progress Timeline */}
          <div className="relative">
            <div className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent top-1/3 pointer-events-none" />
            
            <div className="relative flex items-start justify-between px-4">
              {timelineMonths.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMonth(idx)}
                  className="group flex flex-col items-center gap-4 transition-all duration-500"
                >
                  {/* Timeline dot */}
                  <div className={`relative w-8 h-8 rounded-full border-2 transition-all duration-500 flex items-center justify-center
                    ${activeMonth === idx 
                      ? 'border-primary dark:border-gold-glow bg-primary/10 dark:bg-primary/20 shadow-sm' 
                      : 'border-primary/20 dark:border-primary/40 bg-transparent hover:border-primary/40'}`}>
                    <div className={`w-3 h-3 rounded-full transition-all duration-500
                      ${activeMonth === idx ? 'bg-primary dark:bg-gold-glow' : 'bg-primary/30 dark:bg-primary/50'}`} />
                  </div>

                  {/* Month label */}
                  <div className="text-center space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide transition-colors duration-300
                      ${activeMonth === idx ? 'text-primary dark:text-gold-glow' : ''}">{item.month}</p>
                    <p className="text-lg font-light text-foreground">{item.weight}kg</p>
                    <p className="text-xs text-muted-foreground">{item.achievement}</p>
                  </div>

                  {/* Change indicator */}
                  <div className="flex items-center gap-1 text-xs text-primary dark:text-gold-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <TrendingDown className="w-3 h-3" />
                    <span>{Math.abs(item.change)}kg</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Before/After Slider */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Comparison Slider */}
            <div className="relative">
              <div className="rounded-2xl border border-primary/20 dark:border-primary/40 overflow-hidden bg-gradient-to-br from-white/5 dark:from-background/50 to-background/20 dark:to-background/10 backdrop-blur-xl p-6">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  {/* After image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 opacity-100 transition-opacity duration-700" />
                  
                  {/* Before image overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 transition-all duration-700"
                    style={{ width: `${sliderPosition}%` }}
                  />

                  {/* Slider handle */}
                  <button
                    className="absolute top-0 bottom-0 w-1 bg-primary dark:bg-gold-glow shadow-lg transition-all duration-300 hover:w-1.5 cursor-col-resize"
                    style={{ left: `${sliderPosition}%` }}
                    onClick={(e) => {
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (rect) {
                        const newPos = ((e.clientX - rect.left) / rect.width) * 100;
                        setSliderPosition(Math.max(0, Math.min(100, newPos)));
                      }
                    }}
                    onTouchMove={(e) => {
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (rect) {
                        const newPos = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                        setSliderPosition(Math.max(0, Math.min(100, newPos)));
                      }
                    }}
                  />

                  {/* Labels */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent/70" />
                    <span className="text-xs font-semibold text-accent/70 uppercase tracking-wide">Before</span>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary dark:bg-gold-glow/70" />
                    <span className="text-xs font-semibold text-primary dark:text-gold-glow/70 uppercase tracking-wide">After</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">Drag to compare transformation</p>
              </div>
            </div>

            {/* Body Statistics Panel */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-light text-foreground mb-2">Body Composition</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive tracking of all key metrics showing dramatic improvements in body composition and overall fitness.
                </p>
              </div>

              <div className="space-y-4">
                {bodyStats.map((stat, idx) => {
                  const progress = ((stat.current - stat.initial) / (100 - stat.initial)) * 100;
                  const isPositive = stat.current > stat.initial;

                  return (
                    <div key={idx} className="group rounded-lg border border-primary/15 dark:border-primary/30 bg-white/5 dark:bg-primary/5 p-4 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Initial: {stat.initial}{stat.unit} → Current: {stat.current}{stat.unit}
                          </p>
                        </div>
                        <div className={`text-right text-lg font-light ${isPositive ? 'text-primary dark:text-gold-glow' : 'text-primary dark:text-gold-glow'}`}>
                          <p>{Math.abs(stat.current - stat.initial).toFixed(1)}{stat.unit}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isPositive ? '+' : '-'}{Math.abs(((stat.current - stat.initial) / stat.initial) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-primary/10 dark:bg-primary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 dark:from-gold-glow dark:to-primary transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.abs(progress))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary card */}
              <div className="rounded-lg border border-primary/20 dark:border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary dark:text-gold-glow flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground text-sm">Overall Transformation</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      21.5 kg weight loss with significant improvements in body composition, muscle gain, and fitness metrics. Sustainable lifestyle changes maintained over 6 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Progress Gallery */}
          <div className="relative">
            <h3 className="text-2xl font-light text-foreground mb-8">Monthly Progress Gallery</h3>

            <div className="flex items-center gap-6">
              {/* Previous button */}
              <button
                onClick={() => setCurrentGalleryIndex(Math.max(0, currentGalleryIndex - 1))}
                disabled={currentGalleryIndex === 0}
                className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/20 dark:border-primary/40 
                  flex items-center justify-center text-primary dark:text-gold-glow
                  transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/70 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Gallery items */}
              <div className="flex-1 flex gap-4 overflow-hidden">
                {visibleGallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex-1 group rounded-lg border border-primary/20 dark:border-primary/40 overflow-hidden 
                      bg-gradient-to-br from-white/5 dark:from-background/50 to-background/20 dark:to-background/10 
                      backdrop-blur-xl p-4 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/70"
                  >
                    <div className="relative aspect-[3/4] rounded-md overflow-hidden mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className={`absolute inset-0 bg-${item.image} opacity-100`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">{item.month}</p>
                      <p className="text-xs text-muted-foreground">
                        Weight: <span className="text-primary dark:text-gold-glow font-semibold">{item.weight}kg</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => setCurrentGalleryIndex(Math.min(progressGallery.length - 3, currentGalleryIndex + 1))}
                disabled={currentGalleryIndex >= progressGallery.length - 3}
                className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/20 dark:border-primary/40 
                  flex items-center justify-center text-primary dark:text-gold-glow
                  transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/70 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery indicators */}
            <div className="flex gap-2 justify-center mt-6">
              {progressGallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentGalleryIndex(Math.max(0, idx - 1))}
                  className={`w-2 h-2 rounded-full transition-all duration-300
                    ${idx >= currentGalleryIndex && idx < currentGalleryIndex + 3
                      ? 'bg-primary dark:bg-gold-glow w-6'
                      : 'bg-primary/30 dark:bg-primary/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
