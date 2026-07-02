export type TimeRange = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface RevenueDataPoint {
    label: string;
    store: number;
    cafe: number;
    receptionist: number;
    total: number;
}

export interface RevenueSummary {
    total: number;
    store: number;
    cafe: number;
    receptionist: number;
    growth: number;
    range: TimeRange;
    data: RevenueDataPoint[];
}

export const getRevenueData = (range: TimeRange): RevenueSummary => {
    switch (range) {
        case 'Daily':
            return {
                range,
                total: 68500,
                receptionist: 44000,
                store: 15200,
                cafe: 9300,
                growth: 5.8,
                data: [
                    { label: '08:00', receptionist: 5000, store: 1200, cafe: 800, total: 7000 },
                    { label: '10:00', receptionist: 8500, store: 2500, cafe: 1500, total: 12500 },
                    { label: '12:00', receptionist: 6000, store: 1800, cafe: 2200, total: 10000 },
                    { label: '14:00', receptionist: 4500, store: 3100, cafe: 1200, total: 8800 },
                    { label: '16:00', receptionist: 7000, store: 2200, cafe: 1800, total: 11000 },
                    { label: '18:00', receptionist: 13000, store: 4400, cafe: 1800, total: 19200 },
                ]
            };
        case 'Weekly':
            return {
                range,
                total: 485000,
                receptionist: 300000,
                store: 112000,
                cafe: 73000,
                growth: 8.2,
                data: [
                    { label: 'Mon', receptionist: 45000, store: 15000, cafe: 9000, total: 69000 },
                    { label: 'Tue', receptionist: 42000, store: 18000, cafe: 11000, total: 71000 },
                    { label: 'Wed', receptionist: 48000, store: 14000, cafe: 12000, total: 74000 },
                    { label: 'Thu', receptionist: 38000, store: 16000, cafe: 10000, total: 64000 },
                    { label: 'Fri', receptionist: 52000, store: 22000, cafe: 14000, total: 88000 },
                    { label: 'Sat', receptionist: 45000, store: 28000, cafe: 18000, total: 91000 },
                    { label: 'Sun', receptionist: 30000, store: 12000, cafe: 8000, total: 50000 },
                ]
            };
        case 'Monthly':
            return {
                range,
                total: 2150000,
                receptionist: 1365000,
                store: 495000,
                cafe: 290000,
                growth: 15.4,
                data: [
                    { label: 'Week 1', receptionist: 320000, store: 120000, cafe: 70000, total: 510000 },
                    { label: 'Week 2', receptionist: 315000, store: 115000, cafe: 65000, total: 495000 },
                    { label: 'Week 3', receptionist: 385000, store: 135000, cafe: 85000, total: 605000 },
                    { label: 'Week 4', receptionist: 345000, store: 125000, cafe: 70000, total: 540000 },
                ]
            };
        case 'Yearly':
            return {
                range,
                total: 24500000,
                receptionist: 16080000,
                store: 5240000,
                cafe: 3180000,
                growth: 28.5,
                data: [
                    { label: 'Jan', receptionist: 1200000, store: 420000, cafe: 250000, total: 1870000 },
                    { label: 'Feb', receptionist: 1150000, store: 380000, cafe: 240000, total: 1770000 },
                    { label: 'Mar', receptionist: 1300000, store: 450000, cafe: 280000, total: 2030000 },
                    { label: 'Apr', receptionist: 1400000, store: 510000, cafe: 310000, total: 2220000 },
                    { label: 'May', receptionist: 1350000, store: 480000, cafe: 290000, total: 2120000 },
                    { label: 'Jun', receptionist: 1450000, store: 530000, cafe: 330000, total: 2310000 },
                    { label: 'Jul', receptionist: 1500000, store: 580000, cafe: 350000, total: 2430000 },
                    { label: 'Aug', receptionist: 1550000, store: 620000, cafe: 380000, total: 2550000 },
                    { label: 'Sep', receptionist: 1250000, store: 490000, cafe: 290000, total: 2030000 },
                    { label: 'Oct', receptionist: 1300000, store: 520000, cafe: 320000, total: 2140000 },
                    { label: 'Nov', receptionist: 1380000, store: 540000, cafe: 340000, total: 2260000 },
                    { label: 'Dec', receptionist: 1750000, store: 650000, cafe: 400000, total: 2800000 },
                ]
            };
    }
};
