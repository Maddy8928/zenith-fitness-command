"use client";

import { motion } from 'framer-motion';
import { Dumbbell, Instagram, Twitter, Youtube } from 'lucide-react';
import { ChevronRight, Facebook } from 'lucide-react'; // Added Facebook import

export default function Footer() {
  return (
    <footer className="relative bg-slate-50 dark:bg-black pt-12 md:pt-24 pb-8 md:pb-12 overflow-hidden border-t border-slate-200 dark:border-white/5">
      {/* Ambient Graphic Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 dark:bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 dark:bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-6 md:gap-12 mb-8 md:mb-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary dark:text-gold-glow drop-shadow-[0_0_8px_hsl(var(--gold)/0.5)]" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-slate-900 dark:text-white flex gap-1">
                NEXUS
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">
                  GYM
                </span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-body text-sm leading-relaxed mb-8 max-w-sm">
              The future of personal and facility performance. Elite tools for elite environments.
            </p>
          </div>

          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
            { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
            { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Security'] },
          ].map((col) => (
                        <div key={col.title} className="text-center md:text-left">
              <h4 className="font-heading font-bold text-slate-900 dark:text-white mb-6 tracking-wider uppercase text-sm">
                {col.title}
              </h4>
              <ul className="space-y-4">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-gold-glow font-body text-sm transition-colors duration-300 flex justify-center md:justify-start items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500 font-body tracking-wider uppercase">© 2026 NexusGym Corporate. All rights reserved.</p>
                      <div className="flex gap-4 flex-wrap justify-center md:justify-end">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary dark:hover:bg-gold-glow hover:text-white dark:hover:text-black hover:scale-110 hover:shadow-[0_0_15px_hsl(var(--gold)/0.3)] transition-all duration-300">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
