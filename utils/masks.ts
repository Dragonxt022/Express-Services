
export const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\dt{2})(\d)/, '$1.$2')
    .replace(/^(\dt{2})\.(\dt{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\dt{3})(\d)/, '.$1/$2')
    .replace(/(\dt{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

export const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\dt{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

export const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\dt{2})(\d)/, '($1) $2')
    .replace(/(\dt{5})(\d)/, '$1-$2')
    .substring(0, 15);
};

export const unmask = (value: string) => value.replace(/\D/g, '');
