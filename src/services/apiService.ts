import { Polo, Order } from "../types";

export interface AppSettings {
  logoUrl: string;
  brandName: string;
  brandSubtitle: string;
  contactPhone: string;
  yapeNumber: string;
  yapeTitular: string;
  whatsappLink: string;
  instagramLink: string;
  tiktokLink: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImages?: string[];
  qrCodeUrl?: string;
  adminPassword?: string;
}

export const apiService = {
  async getProducts(): Promise<Polo[]> {
    const response = await fetch("/api/products");
    return response.json();
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return response.json();
  },

  async getSettings(): Promise<AppSettings> {
    const response = await fetch("/api/settings");
    return response.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  async updateProduct(id: string, product: Partial<Polo>): Promise<Polo> {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  async createProduct(product: Partial<Polo>): Promise<Polo> {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE"
    });
    return response.json();
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    const response = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  async deleteOrder(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/orders/${id}`, {
      method: "DELETE"
    });
    return response.json();
  }
};
