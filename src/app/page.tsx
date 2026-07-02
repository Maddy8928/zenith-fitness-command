"use client";

import { useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FeaturesSection from '@/components/FeaturesSection';
import WatchDemoSection from '@/components/WatchDemoSection';
import BodyTransformationTimeline from '@/components/BodyTransformationTimeline';
import DashboardPreview from '@/components/DashboardPreview';
import ServiceSelection from '@/components/ServiceSelection';
import FoodCourtSection from '@/components/FoodCourtSection';
import StoreSection from '@/components/StoreSection';
import ClassesSection from '@/components/ClassesSection';
import TrainersSection from '@/components/TrainersSection';

import MembershipPlans from '@/components/MembershipPlans';
import AboutSection from '@/components/AboutSection';
import HyroxSection from '@/components/HyroxSection';
import Footer from '@/components/Footer';

export default function Home() {
    const heroRef = useRef<HTMLDivElement>(null);

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--gold)/0.06)_0%,_transparent_70%)]" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <p className="text-primary text-sm font-body uppercase tracking-[0.4em] mb-6">
                        Next Generation Fitness Platform
                    </p>

                    <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-8">
                        <span className="text-foreground">The Future</span>
                        <br />
                        <span className="gold-text">of Fitness</span>
                    </h1>

                    <p className="text-muted-foreground text-lg md:text-xl font-body max-w-2xl mx-auto mb-10 leading-relaxed">
                        A premium command center for elite gyms. Manage members, track performance,
                        and elevate your facility with cutting-edge intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#plans" className="group px-8 py-5 rounded-2xl bg-primary text-black font-heading font-bold text-base tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 flex items-center gap-4">
                            View Plans
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="#watch-demo" className="group px-8 py-5 rounded-2xl glass-card text-foreground font-heading font-bold text-base tracking-widest uppercase hover:border-primary/30 transition-all duration-300 flex items-center gap-4">
                            <Play className="w-5 h-5 text-primary" />
                            Watch Demo
                        </a>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground font-body tracking-widest uppercase">Scroll</span>
                    <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
                </div>
            </section>

            {/* Content sections */}
            <div className="relative">
                <div className="absolute -top-32 left-[10%] w-64 h-64 rounded-full bg-[radial-gradient(circle,_hsl(var(--gold)/0.04),_transparent_70%)] blur-3xl pointer-events-none" />
                <div className="absolute top-48 right-[5%] w-96 h-96 rounded-full bg-[radial-gradient(circle,_hsl(var(--neon-cyan)/0.03),_transparent_70%)] blur-3xl pointer-events-none" />

                <div className="section-divider" />

                <FeaturesSection />

                <div className="section-divider" />

                <WatchDemoSection />

                <div className="section-divider" />

                <ServiceSelection />

                <div className="section-divider" />

                <ClassesSection />

                <div className="section-divider" />

                <TrainersSection />

                <div className="section-divider" />

                <HyroxSection />

                <div className="section-divider" />

                <MembershipPlans />

                <div className="section-divider" />

                <StoreSection />

                <div className="section-divider" />

                <FoodCourtSection />

                <div className="section-divider" />

                <AboutSection />

                <div className="absolute bottom-96 left-[15%] w-80 h-80 rounded-full bg-[radial-gradient(circle,_hsl(var(--gold)/0.03),_transparent_70%)] blur-3xl pointer-events-none" />

                <div className="section-divider" />

                <BodyTransformationTimeline />

                <div className="section-divider" />

                <DashboardPreview />
            </div>

            <Footer />
        </div>
    );
}
