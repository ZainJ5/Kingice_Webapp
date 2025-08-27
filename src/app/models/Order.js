import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const OrderItemVariationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const OrderItemExtraSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const OrderItemSideOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ['drinks', 'appetizers', 'desserts', 'other'],
      default: 'other' 
    }
  },
  { _id: false }
);

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  imageUrl: { type: String },
  selectedVariation: OrderItemVariationSchema,
  selectedExtras: [OrderItemExtraSchema],
  selectedSideOrders: [OrderItemSideOrderSchema],
  specialInstructions: { type: String }
});

const OrderSchema = new mongoose.Schema(
  {
    orderNo: { type: Number, unique: true },
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    alternateMobile: { type: String },
    deliveryAddress: { type: String },
    nearestLandmark: { type: String },
    email: { type: String },
    paymentInstructions: { type: String },
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    bankName: { type: String }, 
    receiptImageUrl: { type: String }, 
    changeRequest: { type: String },
    status: { 
      type: String, 
      enum: ["Pending", "In-Process", "Dispatched", "Complete", "Cancel"],
      default: "Pending"
    },
    riderName: { type: String }, 
    cancelReason: { type: String }, 
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true },
    promoCode: { type: String },
    isGift: { type: Boolean, default: false },
    giftMessage: { type: String },
    isCompleted: { type: Boolean, default: false },
    orderType: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
  },
  { timestamps: true }
);

OrderSchema.pre('save', async function(next) {
  const doc = this;
  
  if (!doc.orderNo) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderNo' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      doc.orderNo = counter.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

OrderSchema.path('status').validate(function(value) {
  if (value === 'Cancel' && !this.cancelReason) {
    this.invalidate('cancelReason', 'Cancel reason is required when status is Cancel');
  }
  
  return true;
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);