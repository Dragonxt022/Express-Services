
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, '');
  return digits.length === 14;
};

export const validateRequired = (value: any) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};
