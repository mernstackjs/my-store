export interface UserAddress {
  _id?: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses?: UserAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  user: { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'stripe' | 'paypal' | 'cod';
  paymentResult?: {
    id: string;
    status: string;
    updateTime: string;
    emailAddress: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface SingleProductResponse {
  product: Product;
}

export interface SingleOrderResponse {
  order: Order;
}

export interface MessageResponse {
  message: string;
}
