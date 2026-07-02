# Scalable Backend Logic & MongoDB Schema Suggestions

To transition this frontend implementation to a full MERN stack, you should implement the following schemas and backend services.

## Mongoose Schema Definitions

### 1. Product Schema (Inventory)
```javascript
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Supplements', 'Gear', 'Apparel', 'Accessories'] },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minThreshold: { type: Number, default: 15 },
  optimalStock: { type: Number, default: 100 },
  preferredSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  batchHistory: [{
    batchNo: String,
    expiryDate: Date,
    qty: Number
  }],
  salesVelocity: { type: Number, default: 0 } // Updated via daily cron job
}, { timestamps: true });
```

### 2. Supplier Schema
```javascript
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: String,
  email: String,
  phone: String,
  category: String,
  rating: { type: Number, default: 0 },
  leadTimeDays: { type: Number, default: 7 },
  paymentTerms: { type: String, enum: ['Advance', 'Net-15', 'Net-30', 'COD'] },
  isPreferred: { type: Boolean, default: false }
}, { timestamps: true });
```

### 3. Purchase Order Schema
```javascript
const POSchema = new mongoose.Schema({
  poId: { type: String, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Draft' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: Number,
    costPrice: Number
  }],
  totalAmount: Number,
  expectedDelivery: Date,
  receivedDate: Date,
  notes: String
}, { timestamps: true });
```

## Backend Reorder Logic (Controller)

```javascript
// GET /api/procurement/suggestions
export const getReorderSuggestions = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { stock: { $lte: 15 } }, // Low Stock
        { salesVelocity: { $gt: 10 }, stock: { $lt: 50 } } // Fast Moving
      ]
    }).populate('preferredSupplier');

    const suggestions = products.map(p => {
      const recommendedQty = Math.ceil((p.optimalStock - p.stock) / 10) * 10;
      return {
        productId: p._id,
        productName: p.name,
        recommendedQty,
        reason: p.stock <= 5 ? 'Critical' : p.stock <= 15 ? 'Low Stock' : 'Fast Moving'
      };
    });

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

## Implementation Notes
- **Cron Jobs**: Implement a daily cron job to calculate `salesVelocity` by averaging the last 30 days of sales.
- **Transactions**: Use MongoDB transactions when updating stock levels upon PO delivery to ensure data integrity.
