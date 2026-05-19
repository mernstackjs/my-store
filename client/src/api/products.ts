import client from './client';
import type {
  ProductsResponse,
  SingleProductResponse,
  MessageResponse,
  ProductFormData,
} from '../types';

export async function getProductsApi(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<ProductsResponse> {
  const { data } = await client.get<ProductsResponse>('/products', { params });
  return data;
}

export async function getProductApi(id: string): Promise<SingleProductResponse> {
  const { data } = await client.get<SingleProductResponse>(`/products/${id}`);
  return data;
}

export async function createProductApi(
  product: ProductFormData
): Promise<SingleProductResponse> {
  const { data } = await client.post<SingleProductResponse>('/products', product);
  return data;
}

export async function updateProductApi(
  id: string,
  product: Partial<ProductFormData>
): Promise<SingleProductResponse> {
  const { data } = await client.put<SingleProductResponse>(`/products/${id}`, product);
  return data;
}

export async function deleteProductApi(id: string): Promise<MessageResponse> {
  const { data } = await client.delete<MessageResponse>(`/products/${id}`);
  return data;
}
