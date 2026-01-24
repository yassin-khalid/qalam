
export interface ValidationRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: string;
  color: string;
}
