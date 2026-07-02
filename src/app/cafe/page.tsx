'use client';

import { useAuth } from '@/context/AuthContext';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/context/NotificationContext';
import { 
    Coffee, 
    Utensils, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Flame, 
    Droplets, 
    Zap, 
    TrendingUp, 
    ShoppingBag, 
    ChefHat,
    History,
    RefreshCcw,
    Search,
    Filter,
    Plus,
    X,
    Activity,
    Play,
    Square,
    Timer,
    BellRing,
    Loader2,
    LogOut,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Milk,
    CupSoda,
    TrendingDown,
    LineChart,
    BarChart3,
    PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useShiftControl } from '@/hooks/useShiftControl';
import { ShiftStatusBadge } from '@/components/shared/ShiftStatusBadge';
import { ShiftControlPanel } from '@/components/shared/ShiftControlPanel';

// --- Mock Data ---
const revenueData = [
    { name: '08:00', total: 4200, orders: 12 },
    { name: '10:00', total: 8400, orders: 24 },
    { name: '12:00', total: 16800, orders: 48 },
    { name: '14:00', total: 11200, orders: 32 },
    { name: '16:00', total: 6300, orders: 18 },
    { name: '18:00', total: 15750, orders: 45 },
    { name: '20:00', total: 10500, orders: 30 },
];

const peakHoursData = [
    { hour: '06-09', flow: 45, status: 'Moderate' },
    { hour: '09-12', flow: 85, status: 'High' },
    { hour: '12-15', flow: 65, status: 'Moderate' },
    { hour: '15-18', flow: 40, status: 'Low' },
    { hour: '18-21', flow: 95, status: 'Peak' },
    { hour: '21-00', flow: 30, status: 'Low' },
];

const lowStockIngredients = [
    { name: 'Whole Milk', level: 15, unit: 'Liters', status: 'critical', icon: Milk },
    { name: 'Coffee Beans (Dark Roast)', level: 2.5, unit: 'kg', status: 'low', icon: Coffee },
    { name: 'Vanilla Syrup', level: 0.8, unit: 'Liters', status: 'critical', icon: CupSoda },
    { name: 'Whey Protein (Chocolate)', level: 4.2, unit: 'kg', status: 'low', icon: Package },
];

const topSellingItems = [
    { name: 'Viking Whey Shake', sales: 48, revenue: '₹57,552', growth: '+12%' },
    { name: 'Nordic Chicken Wrap', sales: 36, revenue: '₹53,964', growth: '+8%' },
    { name: 'Ignite Pre-Workout', sales: 32, revenue: '₹20,768', growth: '+15%' },
    { name: 'Keto Power Bowl', sales: 24, revenue: '₹29,976', growth: '+5%' },
];

const consumptionData = [
    { name: 'Milk', used: 45, wasted: 2, total: 47 },
    { name: 'Coffee', used: 12, wasted: 0.5, total: 12.5 },
    { name: 'Sugar', used: 8, wasted: 0.2, total: 8.2 },
    { name: 'Protein Powder', used: 15, wasted: 0.8, total: 15.8 },
];

const INITIAL_MENU = [
    { id: 1, name: 'Viking Whey Shake', category: 'Smoothies', inStock: true, prepTime: '3m' },
    { id: 2, name: 'Ignite Pre-Workout', category: 'Supplements', inStock: true, prepTime: '1m' },
    { id: 3, name: 'Nordic Chicken Wrap', category: 'Food', inStock: false, prepTime: '6m' },
    { id: 4, name: 'Keto Power Bowl', category: 'Food', inStock: true, prepTime: '7m' },
];

export default function CafeDashboard() {
    const { user } = useAuth();
    const { orders: liveOrders, isLoading: ordersLoading } = useOrders();
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [menu] = useState(INITIAL_MENU);
    const { addNotification } = useNotifications();

    const {
        status,
        elapsedTime,
        activityLog,
        upcomingShifts,
        performanceScore,
        totalMinutesWorked,
        handleClockIn,
        handleClockOut,
        handleStartBreak,
        handleEndBreak,
        addLogEntry
    } = useShiftControl('cafe');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (ordersLoading) {
        return (
            <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center text-white gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="italic font-black uppercase tracking-widest text-indigo-400">Syncing Intelligence Core...</p>
            </div>
        );
    }

    const deliveredOrders = liveOrders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.length * 1249; // Simplified math for mock
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent italic uppercase leading-none">
                            Operational <span className="text-white not-italic">Intelligence</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 font-medium flex items-center gap-2 tracking-wide uppercase text-[10px]">
                        Cafe Command Center • Real-time Analytics Enabled
                    </p>
                </div>
                <ShiftStatusBadge status={status} elapsedTime={elapsedTime} themeColor="indigo" />
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Today's Orders" 
                    value={deliveredOrders.length.toString()} 
                    trend="+15.2%" 
                    isPositive={true} 
                    icon={ShoppingBag} 
                    color="indigo" 
                />
                <KPICard 
                    title="Total Revenue" 
                    value={`₹${totalRevenue.toLocaleString()}`} 
                    trend="+8.4%" 
                    isPositive={true} 
                    icon={Zap} 
                    color="indigo" 
                />
                <KPICard 
                    title="Avg Order Value" 
                    value={`₹${avgOrderValue.toFixed(0)}`} 
                    trend="+2.1%" 
                    isPositive={true} 
                    icon={TrendingUp} 
                    color="purple" 
                />
                <KPICard 
                    title="Peak Flow" 
                    value="95/hr" 
                    trend="High" 
                    isPositive={false} 
                    icon={Flame} 
                    color="rose" 
                    isStatus 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left/Main Column (8 spans) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sales Trend Chart */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <LineChart className="w-12 h-12 text-indigo-400" />
                            </div>
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-sm font-black italic uppercase text-white tracking-widest">Revenue <span className="text-indigo-400 not-italic">Velocity</span></CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Intraday Sales Performance</CardDescription>
                            </CardHeader>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px', color: '#fff' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#revenueGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Peak Time Analysis */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BarChart3 className="w-12 h-12 text-cyan-400" />
                            </div>
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-sm font-black italic uppercase text-white tracking-widest">Customer <span className="text-purple-400 not-italic">Density</span></CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Rush Hour Heatmap</CardDescription>
                            </CardHeader>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={peakHoursData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="hour" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px' }}
                                        />
                                        <Bar dataKey="flow" radius={[6, 6, 0, 0]}>
                                            {peakHoursData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.status === 'Peak' ? '#a855f7' : entry.status === 'High' ? '#8b5cf6' : '#1e293b'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Shift Control (Preserved as requested) */}
                    <ShiftControlPanel 
                        status={status}
                        elapsedTime={elapsedTime}
                        activityLog={activityLog}
                        upcomingShifts={upcomingShifts}
                        performanceScore={performanceScore}
                        totalMinutesWorked={totalMinutesWorked}
                        handleClockIn={handleClockIn}
                        handleClockOut={handleClockOut}
                        handleStartBreak={handleStartBreak}
                        handleEndBreak={handleEndBreak}
                        themeColor="indigo"
                        userName={user?.name}
                        role="cafe"
                    />

                    {/* Consumption & Feed Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ingredient Consumption */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl p-6">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-sm font-black italic uppercase text-white tracking-widest">Consumption <span className="text-indigo-400 not-italic">Log</span></CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Usage vs Wastage Monitoring</CardDescription>
                            </CardHeader>
                            <div className="space-y-4">
                                {consumptionData.map((item) => (
                                    <div key={item.name} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-300">{item.name}</span>
                                            <span className="text-slate-500">{item.used} / {item.total} unit</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                            <div 
                                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                                style={{ width: `${(item.used / item.total) * 100}%` }} 
                                            />
                                            <div 
                                                className="h-full bg-rose-500" 
                                                style={{ width: `${(item.wasted / item.total) * 100}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Recent Orders Mini Feed */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl p-6">
                            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-black italic uppercase text-white tracking-widest">Recent <span className="text-indigo-400 not-italic">Activity</span></CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Live Transaction Stream</CardDescription>
                                </div>
                                <div className="animate-pulse bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-2 py-1 rounded-full border border-indigo-500/20 uppercase">Live</div>
                            </CardHeader>
                            <div className="space-y-4 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                {liveOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.member}`} alt="av" className="w-full h-full" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">{order.member}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{order.id} • {order.status}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-black text-indigo-400">₹{order.total || '1,249'}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right/Side Column (4 spans) */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Low Ingredient Alerts */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-rose-500/5">
                            <div>
                                <h3 className="text-sm font-black italic uppercase text-white tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                                    Supply <span className="text-rose-500 not-italic">Alerts</span>
                                </h3>
                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Inventory Depletion Warn</p>
                            </div>
                            <Badge variant="outline" className="bg-rose-500 text-white text-[8px] border-transparent font-black px-2">Critical</Badge>
                        </div>
                        <div className="p-4 space-y-3">
                            {lowStockIngredients.map((ing) => {
                                const Icon = ing.icon;
                                return (
                                    <div key={ing.name} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5 group hover:border-rose-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${ing.status === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-200">{ing.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Remaining: {ing.level} {ing.unit}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-rose-500">
                                            <RefreshCcw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest h-10 rounded-xl mt-2">
                                Open Procurement
                            </Button>
                        </div>
                    </Card>

                    {/* Top Selling Items */}
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
                            <div>
                                <h3 className="text-sm font-black italic uppercase text-white tracking-widest flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-indigo-400" />
                                    Top <span className="text-indigo-400 not-italic">Performers</span>
                                </h3>
                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Revenue Drivers</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {topSellingItems.map((item, idx) => (
                                <div key={item.name} className="relative">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#{idx + 1} {item.name}</span>
                                        <span className="text-[10px] font-black text-emerald-400">{item.growth}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                                style={{ width: `${100 - (idx * 20)}%` }} 
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-white">{item.sales} sold</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Menu Stock System (Simplified) */}
                    <Card className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/10 rounded-3xl p-6">
                        <h3 className="text-sm font-black italic uppercase text-white tracking-widest mb-4">Stock <span className="text-indigo-400 not-italic">Quick Toggle</span></h3>
                        <div className="grid grid-cols-2 gap-3">
                            {menu.slice(0, 4).map(item => (
                                <div key={item.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center text-center gap-1.5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                                    <ChefHat className={`w-4 h-4 ${item.inStock ? 'text-indigo-400' : 'text-slate-600'}`} />
                                    <p className="text-[9px] font-black text-white line-clamp-1 uppercase tracking-tighter">{item.name}</p>
                                    <Badge className={`text-[8px] h-4 px-1.5 ${item.inStock ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                                        {item.inStock ? 'Active' : 'OOS'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                            Manage Full Menu
                        </Button>
                    </Card>

                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, isPositive, icon: Icon, color, isStatus }: any) {
    const colorMap: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };

    return (
        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-6 rounded-3xl hover:border-primary/20 transition-all group overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter italic">{value}</h3>
                    <div className={`flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-emerald-500' : isStatus ? 'text-rose-500' : 'text-slate-500'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isStatus ? <Flame className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                </div>
                <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
                    <Icon className="w-6 h-6 shadow-glow" />
                </div>
            </div>
        </Card>
    );
}
