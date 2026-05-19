import client from './client';
import type { OrdersResponse, SingleOrderResponse } from '../types';

export async function getMyOrdersApi(): Promise<OrdersResponse> {
  const { data } = await client.get<OrdersResponse>('/orders/myorders');
  return data;
}

export async function getOrdersApi(): Promise<OrdersResponse> {
  const { data } = await client.get<OrdersResponse>('/orders');
  return data;
}

export async function getOrderApi(id: string): Promise<SingleOrderResponse> {
  const { data } = await client.get<SingleOrderResponse>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatusApi(
  id: string,
  orderStatus: string
): Promise<SingleOrderResponse> {
  const { data } = await client.put<SingleOrderResponse>(`/orders/${id}/status`, {
    orderStatus,
  });
  return data;
}

export async function updatePaymentStatusApi(
  id: string,
  paymentStatus: string
): Promise<SingleOrderResponse> {
  const { data } = await client.put<SingleOrderResponse>(`/orders/${id}/payment-status`, {
    paymentStatus,
  });
  return data;
}
