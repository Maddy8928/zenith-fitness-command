"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-primary/20 group-[.toaster]:shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-2xl p-4 transition-all overflow-hidden relative",
          title: "font-heading font-bold text-foreground",
          description: "group-[.toast]:text-slate-300 font-body text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-black group-[.toast]:font-semibold uppercase tracking-wider group-[.toast]:rounded-xl group-[.toast]:shadow-[0_0_15px_hsl(var(--gold)/0.4)] transition-all",
          cancelButton: "group-[.toast]:bg-white/5 group-[.toast]:text-muted-foreground hover:group-[.toast]:bg-white/10 group-[.toast]:rounded-xl transition-all",
          success: "group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-emerald-500/10",
          error: "group-[.toaster]:border-rose-500/50 group-[.toaster]:bg-rose-500/10",
          warning: "group-[.toaster]:border-amber-500/50 group-[.toaster]:bg-amber-500/10",
          info: "group-[.toaster]:border-blue-500/50 group-[.toaster]:bg-blue-500/10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
