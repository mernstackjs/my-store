import Order from '../models/order.js';
import Product from '../models/products.js';
import { sendOrderConfirmation } from '../utils/sendMail.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      taxPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const populatedItems = orderItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      return {
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      };
    });

    const order = await Order.create({
      user: req.user._id,
      orderItems: populatedItems,
      shippingAddress,
      paymentMethod,
      shippingPrice: shippingPrice || 0,
      taxPrice: taxPrice || 0,
    });

    await sendOrderConfirmation({
      to: req.user.email,
      orderId: order.orderId,
      total: order.totalPrice,
      items: populatedItems,
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email',
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') order.deliveredAt = Date.now();
    if (orderStatus === 'cancelled') order.cancelledAt = Date.now();

    await order.save();

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;

    await order.save();

    res.json({ order });
  } catch (error) {
    next(error);
  }
};
