export interface StepOneData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export type StepOneDataOmitPassword = Omit<StepOneData, 'password' | 'confirmPassword'>;
