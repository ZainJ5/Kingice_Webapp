import mongoose from "mongoose";

const VariationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    previousPrice: { type: Number },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const ExtraSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const SideOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    category: { 
      type: String, 
      enum: ['drinks', 'appetizers', 'desserts', 'other'],
      default: 'other' 
    },
  },
  { _id: false }
);

const FoodItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: {
      type: Number,
      required: function () {
        return !this.variations || this.variations.length === 0;
      },
    },
    previousPrice: { type: Number },
    imageUrl: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: false,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    isAvailable: { type: Boolean, default: true }, 
    variations: [VariationSchema],
    extras: [ExtraSchema],
    sideOrders: [SideOrderSchema],
  },
  { timestamps: true }
);

export default mongoose.models.FoodItem ||
  mongoose.model("FoodItem", FoodItemSchema);