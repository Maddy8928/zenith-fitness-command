import { INVENTORY_DATA, type InventoryProduct } from './inventory-data';

export interface ReorderSuggestion {
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    minThreshold: number;
    optimalStock: number;
    recommendedQty: number;
    preferredSupplierId: string;
    reason: 'Low Stock' | 'Critical' | 'Fast Moving';
    velocity: number;
}

export function calculateReorderSuggestions(): ReorderSuggestion[] {
    const suggestions: ReorderSuggestion[] = [];
    
    // Sort products by velocity to identify "Fast Moving" items
    const sortedByVelocity = [...INVENTORY_DATA].sort((a, b) => b.salesVelocity - a.salesVelocity);
    const topVelocityThreshold = sortedByVelocity[Math.floor(sortedByVelocity.length * 0.3)]?.salesVelocity || 10;

    INVENTORY_DATA.forEach(product => {
        let reason: 'Low Stock' | 'Critical' | 'Fast Moving' | null = null;
        
        // Priority 1: Critical Stock
        if (product.stock <= product.minThreshold / 3 || product.stock <= 5) {
            reason = 'Critical';
        }
        // Priority 2: Low Stock
        else if (product.stock <= product.minThreshold) {
            reason = 'Low Stock';
        }
        // Priority 3: Fast Moving with declining stock
        else if (product.salesVelocity >= topVelocityThreshold && product.stock <= product.optimalStock * 0.6) {
            reason = 'Fast Moving';
        }

        if (reason) {
            // Calculate recommended quantity: (Optimal - Current) rounded to nearest 10
            let recommendedQty = product.optimalStock - product.stock;
            recommendedQty = Math.ceil(recommendedQty / 10) * 10;

            suggestions.push({
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                currentStock: product.stock,
                minThreshold: product.minThreshold,
                optimalStock: product.optimalStock,
                recommendedQty,
                preferredSupplierId: product.preferredSupplierId,
                reason,
                velocity: product.salesVelocity
            });
        }
    });

    // Sort suggestions: Critical first, then by recommended quantity
    return suggestions.sort((a, b) => {
        if (a.reason === 'Critical' && b.reason !== 'Critical') return -1;
        if (a.reason !== 'Critical' && b.reason === 'Critical') return 1;
        return b.recommendedQty - a.recommendedQty;
    });
}
