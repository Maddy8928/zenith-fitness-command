'use client';

import React from 'react';
import { 
    Download, 
    FileText, 
    FileSpreadsheet, 
    FileJson,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

interface ExportButtonProps {
    onExport: (format: ExportFormat) => Promise<void> | void;
    isLoading?: boolean;
    filename?: string;
    className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
    onExport, 
    isLoading = false,
    filename = 'Report',
    className = ''
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`bg-slate-900/50 backdrop-blur-xl border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl transition-all hover:border-emerald-500/30 group ${className}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-400" />
                    ) : (
                        <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform text-emerald-400" />
                    )}
                    Export Data
                    <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-56 bg-slate-950/90 backdrop-blur-2xl border-white/10 p-2 rounded-2xl shadow-2xl"
            >
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3 py-2">
                    Select Format
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                
                <DropdownMenuItem 
                    onClick={() => onExport('PDF')}
                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-white/5 cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-black transition-all">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight text-white">PDF Document</p>
                        <p className="text-[9px] text-slate-500 font-bold">Standard PDF (.pdf)</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem 
                    onClick={() => onExport('EXCEL')}
                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-white/5 cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight text-white">Excel Sheet</p>
                        <p className="text-[9px] text-slate-500 font-bold">Spreadsheet (.xlsx)</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem 
                    onClick={() => onExport('CSV')}
                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-white/5 cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                        <FileJson className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight text-white">CSV Data</p>
                        <p className="text-[9px] text-slate-500 font-bold">Comma Separated (.csv)</p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
