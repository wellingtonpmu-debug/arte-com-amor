export type ProductType = 'pulseira' | 'colar' | 'chaveiro' | 'tornozeleira';

export interface Product {
  id: string; // e.g., 'pulseira', 'colar', 'chaveiro', 'tornozeleira'
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface Customization {
  productType: string;
  beadsColor1: string;
  beadsColor2: string; // optional or transparent
  beadShape: string;
  letters: string;
  size: string;
  pendant: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  clientName: string;
  clientWhatsapp: string;
  clientAddress?: string;
  paymentMethod: string;
  productType: string;
  beadsColor1: string;
  beadsColor2: string;
  beadShape: string;
  letters: string;
  size: string;
  pendant: string;
  price: number;
  status: 'Recebido' | 'Em andamento' | 'Concluído';
  createdAt: string; // ISO string
}

export interface AppConfig {
  adminWhatsapp: string;
  aboutText: string;
  aboutPhotoUrl: string;
  adminPassword?: string;
}

export interface BeadShapeOption {
  id: string;
  name: string;
  symbol: string;
}

export interface PendantOption {
  id: string;
  name: string;
  icon: string;
}

export interface ColorOption {
  id: string;
  name: string;
  value: string;
}
