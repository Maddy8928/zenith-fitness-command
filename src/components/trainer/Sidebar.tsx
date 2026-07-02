"use client";

import SidebarContent from './SidebarContent';

export default function TrainerSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-charcoal/50 dark:bg-slate-950 backdrop-blur-md border-r border-slate-200 dark:border-slate-900 h-full">
            <SidebarContent />
        </aside>
    );
}
