import { Address } from '../types';
import { storage } from './storage';

type SessionUser = {
  id?: string | number;
  addresses?: Partial<Address>[];
};

type CouponRule = {
  code: string;
  label: string;
  type: 'fixed' | 'percent';
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
};

type CouponValidationResult = {
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: CouponRule;
};

const DEFAULT_COUPONS: CouponRule[] = [
  { code: 'BEMVINDO10', label: 'Boas-vindas', type: 'fixed', value: 10, minSubtotal: 40 },
  { code: 'BELEZA15', label: 'Cupom promocional', type: 'percent', value: 15, minSubtotal: 60, maxDiscount: 40 },
  { code: 'FRETEGRATIS', label: 'Atendimento em casa', type: 'fixed', value: 20, minSubtotal: 120 }
];

const normalizeAddress = (address: Partial<Address>, index = 0): Address => ({
  id: address.id ? String(address.id) : `${Date.now()}_${index}`,
  label: address.label || 'EndereÃ§o',
  street: address.street || '',
  number: address.number || '',
  city: address.city || '',
  state: address.state || '',
  isDefault: Boolean(address.isDefault),
  neighborhood: address.neighborhood,
  zipCode: address.zipCode,
  complement: address.complement
});

export const getCurrentSessionUser = (): SessionUser | null => {
  return storage.get<SessionUser | null>('session', null);
};

const getAddressStorageKey = (userId?: string | number) => {
  return `customer_addresses_${userId ? String(userId) : 'guest'}`;
};

export const getCustomerAddresses = (): Address[] => {
  const user = getCurrentSessionUser();
  const key = getAddressStorageKey(user?.id);

  const saved = storage.get<Address[]>(key, []);
  if (saved.length > 0) {
    return saved.map((addr, index) => normalizeAddress(addr, index));
  }

  const fromSession = (user?.addresses || []).map((addr, index) => normalizeAddress(addr, index));
  if (fromSession.length > 0) {
    storage.set(key, fromSession);
    return fromSession;
  }

  return [];
};

export const saveCustomerAddresses = (addresses: Address[]) => {
  const user = getCurrentSessionUser();
  const key = getAddressStorageKey(user?.id);
  const normalized = addresses.map((addr, index) => normalizeAddress(addr, index));
  storage.set(key, normalized);
  return normalized;
};

export const getAvailableCoupons = (): CouponRule[] => {
  const coupons = storage.get<CouponRule[]>('coupon_catalog', DEFAULT_COUPONS);
  if (!coupons || coupons.length === 0) {
    storage.set('coupon_catalog', DEFAULT_COUPONS);
    return DEFAULT_COUPONS;
  }
  return coupons;
};

export const validateCoupon = (code: string, subtotal: number): CouponValidationResult => {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, discount: 0, message: 'Digite um cupom para aplicar.' };
  }

  const coupon = getAvailableCoupons().find((item) => item.code.toUpperCase() === normalizedCode);
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Cupom invÃ¡lido.' };
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      discount: 0,
      message: `Cupom vÃ¡lido para pedidos acima de R$ ${coupon.minSubtotal.toFixed(2)}.`
    };
  }

  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discount,
    coupon
  };
};

