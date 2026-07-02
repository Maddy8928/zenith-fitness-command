"use client";

import SidebarContent from './SidebarContent';

export default function ReceptionistSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-charcoal/50 dark:bg-background/40 backdrop-blur-md border-r border-primary/10 dark:border-primary/20 h-full shadow-[5px_0_30px_rgba(0,0,0,0.05)] dark:shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
            <SidebarContent />
        </aside>
    );
}
