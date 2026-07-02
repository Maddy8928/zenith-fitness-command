import { 
    Waves, 
    Sparkles, 
    Wind, 
    Droplets, 
    Flame, 
    Snowflake, 
    Sun, 
    HeartPulse, 
    Zap, 
    Moon,
    UserCircle
} from 'lucide-react';

export type RecoveryCategory = 'Thermal Therapy' | 'Physical Therapy' | 'Recovery Tech' | 'Massage Therapy' | 'Traditional Spa';

export interface RecoveryService {
    id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
    icon: any;
    type: 'thermal' | 'physical' | 'tech' | 'massage' | 'steam';
    category: RecoveryCategory;
    isPremium?: boolean;
    benefits: string[];
}

export const RECOVERY_SERVICES: RecoveryService[] = [
    // Thermal Therapy
    {
        id: 'rs-1',
        title: 'Himalayan Salt Steam',
        description: 'Infused with mineral-rich salts to detoxify and clear the respiratory system.',
        duration: '30 min',
        price: 2199,
        icon: Flame,
        type: 'steam',
        category: 'Thermal Therapy',
        isPremium: true,
        benefits: ['Detoxification', 'Respiratory Relief', 'Skin Hydration']
    },
    {
        id: 'rs-2',
        title: 'Infrared Sauna Elite',
        description: 'Deep-penetrating heat to reduce inflammation and boost cardiovascular health.',
        duration: '45 min',
        price: 3499,
        icon: Sun,
        type: 'thermal',
        category: 'Thermal Therapy',
        benefits: ['Muscle Recovery', 'Heart Health', 'Stress Relief']
    },
    // Recovery Tech
    {
        id: 'rs-3',
        title: 'Arctic Cryotherapy',
        description: '3-minute sub-zero exposure to trigger system-wide anti-inflammatory response.',
        duration: '15 min',
        price: 4499,
        icon: Snowflake,
        type: 'tech',
        category: 'Recovery Tech',
        isPremium: true,
        benefits: ['Reduced Inflammation', 'Metabolic Boost', 'Pain Relief']
    },
    {
        id: 'rs-4',
        title: 'Compression Therapy',
        description: 'Pneumatic compression session to flush metabolic waste and reduce edema.',
        duration: '30 min',
        price: 1899,
        icon: Zap,
        type: 'tech',
        category: 'Recovery Tech',
        benefits: ['Lactic Acid Flush', 'Circulation Improvement', 'Limb Lightness']
    },
    // Physical Therapy
    {
        id: 'rs-5',
        title: 'Kinetic Physiotherapy',
        description: 'Professional physical assessment and targeted structural alignment.',
        duration: '60 min',
        price: 5999,
        icon: HeartPulse,
        type: 'physical',
        category: 'Physical Therapy',
        isPremium: true,
        benefits: ['Injury Prevention', 'Joint Mobility', 'Corrective Alignment']
    },
    // Massage Therapy
    {
        id: 'rs-6',
        title: 'Valkyrie Deep Tissue',
        description: 'Highly intensive focused pressure to release chronic muscle tension.',
        duration: '60 min',
        price: 6999,
        icon: Sparkles,
        type: 'massage',
        category: 'Massage Therapy',
        isPremium: true,
        benefits: ['Tension Release', 'Deep Recovery', 'Post-Workout Bliss']
    },
    {
        id: 'rs-7',
        title: 'Nordic Swedish Bliss',
        description: 'Gentle strokes and rhythmic movements for full-body relaxation.',
        duration: '90 min',
        price: 7999,
        icon: Waves,
        type: 'massage',
        category: 'Massage Therapy',
        benefits: ['Relaxation', 'Blood Flow', 'Mental Rest']
    },
    // Mental Recovery
    {
        id: 'rs-8',
        title: 'Zero-G Flotation',
        description: 'Sensory deprivation therapy in epsom salt-saturated water.',
        duration: '60 min',
        price: 5499,
        icon: Moon,
        type: 'tech',
        category: 'Recovery Tech',
        benefits: ['Mental Clarity', 'Theta Wave State', 'Weightlessness']
    }
];
