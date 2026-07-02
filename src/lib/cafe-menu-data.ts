export interface MenuIngredient {
    inventoryId: string;
    name: string;
    quantity: number;
    unit: 'ml' | 'Grams' | 'Units' | 'kg' | 'Liters';
}

export type CafeCategory = 'Protein Shakes' | 'Smoothies' | 'Healthy Meals' | 'Pre-Workout Drinks' | 'Post-Workout Meals' | 'Snacks';

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: CafeCategory;
    image: string;
    isAvailable: boolean;
    prepTime: string;
    tags: string[];
    ingredients: MenuIngredient[];
    status?: 'Published' | 'Draft';
    stockQuantity?: number;
    discount?: number;
    isArchived?: boolean;
    nutrition?: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    addOns?: { name: string; price: number }[];
    customizations?: { title: string; options: string[] }[];
}

export const CAFE_MENU_ITEMS: MenuItem[] = [
    {
        id: 'm1',
        name: 'Viking Whey Shake',
        description: 'High-protein shake with premium dark roast espresso and almond milk.',
        price: 1199,
        category: 'Protein Shakes',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '3-5 mins',
        tags: ['Popular', 'Recommended', 'High Protein'],
        nutrition: { calories: 320, protein: '35g', carbs: '12g', fat: '5g' },
        ingredients: [
            { inventoryId: '1', name: 'Dark Roast Viking Beans', quantity: 20, unit: 'Grams' },
            { inventoryId: '2', name: 'Premium Almond Milk', quantity: 250, unit: 'ml' },
        ]
    },
    {
        id: 'm5',
        name: 'Asgard Berry Smoothie',
        description: 'Blended organic strawberries, blueberries, and oats with Greek yogurt.',
        price: 999,
        category: 'Smoothies',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '4 mins',
        tags: ['Today\'s Special', 'Organic', 'Energy Boost'],
        nutrition: { calories: 280, protein: '12g', carbs: '48g', fat: '2g' },
        ingredients: [
            { inventoryId: '2', name: 'Premium Almond Milk', quantity: 150, unit: 'ml' },
            { inventoryId: '7', name: 'Wildflower Honey', quantity: 10, unit: 'ml' },
        ]
    },
    {
        id: 'm2',
        name: 'Nordic Chicken Wrap',
        description: 'Grilled chicken breast with fresh mixed greens and honey mustard dressing.',
        price: 1499,
        category: 'Healthy Meals',
        image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '8-10 mins',
        tags: ['Popular', 'High Protein'],
        nutrition: { calories: 540, protein: '42g', carbs: '35g', fat: '12g' },
        ingredients: [
            { inventoryId: '7', name: 'Wildflower Honey', quantity: 15, unit: 'ml' },
        ]
    },
    {
        id: 'm4',
        name: 'Ignite Pre-Workout Shot',
        description: 'Concentrated caffeine and BCAA blend for raw power and focus.',
        price: 499,
        category: 'Pre-Workout Drinks',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '2 mins',
        tags: ['High Caffeine', 'Energy Boost'],
        nutrition: { calories: 15, protein: '2g', carbs: '2g', fat: '0g' },
        ingredients: [
            { inventoryId: '1', name: 'Dark Roast Viking Beans', quantity: 15, unit: 'Grams' },
        ]
    },
    {
        id: 'm3',
        name: 'Protein Pancake stack',
        description: 'Fluffy whole-grain protein pancakes served with organic wildflower honey.',
        price: 899,
        category: 'Post-Workout Meals',
        image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '10-12 mins',
        tags: ['Recommended', 'High Carb'],
        nutrition: { calories: 500, protein: '28g', carbs: '65g', fat: '8g' },
        ingredients: [
            { inventoryId: '8', name: 'Protein Pancake Mix', quantity: 100, unit: 'Grams' },
            { inventoryId: '7', name: 'Wildflower Honey', quantity: 20, unit: 'ml' },
        ]
    },
    {
        id: 'm6',
        name: 'Odin Keto Salad',
        description: 'Avocado slice, baby spinach, boiled eggs, and olive oil dressing.',
        price: 1399,
        category: 'Healthy Meals',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '6 mins',
        tags: ['Keto', 'Low Carb', 'Healthy Fats'],
        nutrition: { calories: 420, protein: '30g', carbs: '8g', fat: '28g' },
        ingredients: [
            { inventoryId: '4', name: 'Fresh Avocado Case', quantity: 1, unit: 'Units' },
        ]
    },
    {
        id: 'm7',
        name: 'Thor Salmon Rice Bowl',
        description: 'Seared wild salmon over brown rice, served with broccoli and honey glaze.',
        price: 1899,
        category: 'Post-Workout Meals',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '12-15 mins',
        tags: ['Mass Gainer', 'Popular', 'Recovery'],
        nutrition: { calories: 680, protein: '45g', carbs: '75g', fat: '16g' },
        ingredients: [
            { inventoryId: '7', name: 'Wildflower Honey', quantity: 15, unit: 'ml' },
        ]
    },
    {
        id: 'm8',
        name: 'Viking Seed & Nut Mix',
        description: 'Raw almonds, walnuts, pumpkin seeds, and clean dried cranberries.',
        price: 349,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '1 min',
        tags: ['Vegan', 'Keto', 'Heart Healthy'],
        nutrition: { calories: 180, protein: '6g', carbs: '8g', fat: '14g' },
        ingredients: [
            { inventoryId: '3', name: 'Nordic Protein Bars', quantity: 1, unit: 'Units' },
        ]
    },
    {
        id: 'm9',
        name: 'Green Valhalla Detox',
        description: 'Cold-pressed spinach, green apple, cucumber, and ginger juice.',
        price: 1099,
        category: 'Smoothies',
        image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?q=80&w=800&auto=format&fit=crop',
        isAvailable: true,
        prepTime: '4 mins',
        tags: ['Detox', 'Vegan', 'Organic'],
        nutrition: { calories: 190, protein: '8g', carbs: '28g', fat: '1g' },
        ingredients: [
            { inventoryId: '7', name: 'Wildflower Honey', quantity: 5, unit: 'ml' },
        ]
    }
];

