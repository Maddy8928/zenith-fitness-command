"use client";

import { Dumbbell, Zap, Menu, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  { label: 'Classes', href: '#classes' },
  { label: 'Trainers', href: '#trainers' },
  { label: 'HYROX', href: '#hyrox' },
  { label: 'Plans', href: '#plans' },
  { label: 'Store', href: '#store' },
  { label: 'Cafe', href: '#cafe' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  const portalHref = isAuthenticated
    ? (user?.role === 'ADMIN' ? '/admin' : user?.role === 'TRAINER' ? '/trainer' : '/member')
    : '/login';

  const portalLabel = isAuthenticated ? 'Member Portal' : 'Member Login';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-background/40 dark:bg-background/30 border-b border-primary/10 dark:border-primary/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Premium gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

            {/* Icon container */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center border border-primary/30 dark:border-primary/50">
              <Zap className="w-5 h-5 text-primary dark:text-gold-glow" />
            </div>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg tracking-tight leading-none text-foreground dark:text-white">
              FLEX<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
            </span>
            <span className="text-xs font-body text-muted-foreground dark:text-slate-400 tracking-widest uppercase hidden sm:block">Elite Fitness</span>
          </div>
        </Link>

        {/* Navigation Items - Desktop */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative text-sm font-body font-semibold text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-gold-glow transition-colors duration-300"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Member Login - Desktop */}
          <Link href={portalHref} className="hidden sm:block relative group px-6 md:px-8 py-2.5 rounded-xl font-heading font-bold text-xs tracking-[0.2em] uppercase text-white bg-slate-950 dark:bg-charcoal/90 border border-white/10 hover:border-gold-glow/40 transition-all duration-500 shadow-soft hover:shadow-[0_0_20px_hsl(var(--gold)/0.2)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-3 z-10">
              <span className="group-hover:text-gold-glow transition-colors duration-500">{portalLabel}</span>
              <div className="w-6 h-6 rounded-full bg-black/50 border border-white/10 flex items-center justify-center group-hover:border-gold-glow/50 transition-all duration-500 group-hover:shadow-[0_0_10px_hsl(var(--gold)/0.5)]">
                {isAuthenticated ? (
                  <UserCheck className="w-3 h-3 text-gold-glow" />
                ) : (
                  <Zap className="w-3 h-3 text-slate-400 group-hover:text-gold-glow transition-colors duration-500 animate-pulse" />
                )}
              </div>
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-glow to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
          </Link>

          {/* Theme Toggle */}
          <div className="rounded-xl backdrop-blur-sm bg-background/50 dark:bg-charcoal/50 border border-primary/20 dark:border-primary/40 p-1">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary dark:text-gold-glow hover:bg-primary/20 transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l border-primary/10 dark:border-primary/20 bg-background/95 backdrop-blur-xl p-0">
                <SheetHeader className="p-6 border-b border-primary/5 dark:border-primary/10 text-left">
                  <SheetTitle className="font-heading font-black text-2xl tracking-tight">
                    FLEX<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto py-6 px-6">
                    <div className="flex flex-col gap-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="text-lg font-heading font-bold text-muted-foreground hover:text-primary dark:hover:text-gold-glow mb-2 transition-colors duration-300"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 border-t border-primary/5 dark:border-primary/10 mb-20">
                    <Link href={portalHref} className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-primary text-black font-heading font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-all">
                      {portalLabel}
                      <Zap className="w-4 h-4 fill-current" />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Animated bottom border on scroll - optional */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent dark:via-gold-glow/30" />
    </nav>
  );
}
