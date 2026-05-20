import { Order } from '../types';
import { apiService } from './apiService';

export async function createOrder(orderData: Omit<Order, 'status' | 'createdAt'>) {
  try {
    const order = await apiService.createOrder(orderData);
    return order.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
