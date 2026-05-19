import client from './client';
import type { AuthResponse } from '../types';

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

export async function getMeApi(): Promise<AuthResponse> {
  const { data } = await client.get<AuthResponse>('/auth/me');
  return data;
}
