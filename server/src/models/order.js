import mongoose from 'mongoose';
import { generateOrderId } from '../utils/orderId.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Order item must reference a product'],
    },
    name: {
      type: String,
      required: [true, 'Order item name is required'],
    },
    image: {
      type: String,
      required: [true, 'Order item image is required'],
    },
    price: {
      type: Number,
      required: [true, 'Order item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Order item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: [true, 'Order must have at least one item'],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Shipping full name is required'],
        trim: true,
      },
      street: {
        type: String,
        required: [true, 'Shipping street is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Shipping city is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Shipping state is required'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'Shipping ZIP code is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Shipping country is required'],
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['stripe', 'paypal', 'cod'],
        message: 'Payment method must be stripe, paypal, or cod',
      },
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Payment status must be pending, paid, failed, or refunded',
      },
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['processing', 'shipped', 'delivered', 'cancelled'],
        message:
          'Order status must be processing, shipped, delivered, or cancelled',
      },
      default: 'processing',
    },
    itemsPrice: {
      type: Number,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      default: 0.0,
    },
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

orderSchema.pre('save', function () {
  if (this.isNew && !this.orderId) {
    this.orderId = generateOrderId();
  }

  if (this.isModified('orderItems')) {
    this.itemsPrice = this.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;
    this.totalPrice = Math.round(this.totalPrice * 100) / 100;
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
