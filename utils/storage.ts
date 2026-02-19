
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(`be_express_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(`be_express_${key}`, JSON.stringify(value));
  },
  remove: (key: string) => {
    localStorage.removeItem(`be_express_${key}`);
  }
};
