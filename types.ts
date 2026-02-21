
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPRESA = 'EMPRESA',
  CLIENTE = 'CLIENTE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  city: string;
  state: string;
  isDefault: boolean;
  neighborhood?: string;
  zipCode?: string;
  complement?: string;
}

export interface PaymentCard {
  id: string;
  brand: 'visa' | 'mastercard';
  last4: string;
  expiry: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'revenda' | 'uso_profissional';
  stock: number;
  minStock: number;
  price?: number;
}

export interface FlashOffer {
  id: string;
  companyId: string;
  serviceId: string;
  name: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  limit: number;
  used: number;
  active: boolean;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  rating: number;
  distance: string;
  logo: string;
  status: 'active' | 'inactive' | 'pending';
  isOpen?: boolean;
  royaltyPercent: number;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  preparationTime: number;
  attendanceMode?: 'presencial' | 'domicilio' | 'ambos';
  allowScheduling?: boolean;
  assignedProfessionals: string[];
  image: string;
  description?: string;
  active: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline';
  email: string;
  phone: string;
  commission: number;
  commissionEnabled: boolean;
  specialties: string;
  active: boolean;
  cpf?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string;
  companyName: string;
  serviceName: string; // Summary of services
  services?: Service[]; // Multiple services
  serviceLocation?: 'presencial' | 'domicilio';
  addressId?: string; // For at-home service
  professionalName?: string;
  date: string;
  time: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  price: number;
  duration: string;
  isOffline?: boolean;
  type?: 'service' | 'block';
  paymentMetadata?: {
    transactionId: string;
    splitStatus: 'processed' | 'pending' | 'failed';
    gatewayFee: number;
    platformCut: number;
    professionalCut: number;
    companyCut: number;
  };
}

export interface KPI {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
}

