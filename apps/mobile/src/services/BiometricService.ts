export const BiometricService = {
  enableBiometrics(): Promise<boolean> {
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
  },
  authenticate(): Promise<boolean> {
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
  },
};
