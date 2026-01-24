import { z } from "zod";
import { ValidationRule } from "./types";

// The main schema provided by the user
export const passwordSchema = z.string()
  .min(8, { message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" })
  .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف أو أكثر من الحروف الكبيرة')
  .regex(/[^A-Za-z0-9]/, 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
  .regex(/\d/, 'يجب أن تحتوي كلمة المرور على عدد واحد على الأقل');

// Mapping rules to Zod tests for real-time checklist feedback
export const PASSWORD_RULES: ValidationRule[] = [
  {
    id: 'min-length',
    label: 'كلمة المرور يجب أن تكون على الأقل 8 أحرف',
    test: (val) => z.string().min(8).safeParse(val).success,
  },
  {
    id: 'uppercase',
    label: 'يجب أن تحتوي كلمة المرور على حرف أو أكثر من الحروف الكبيرة',
    test: (val) => z.string().regex(/[A-Z]/).safeParse(val).success,
  },
  {
    id: 'special',
    label: 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل',
    test: (val) => z.string().regex(/[^A-Za-z0-9]/).safeParse(val).success,
  },
  {
    id: 'digit',
    label: 'يجب أن تحتوي كلمة المرور على عدد واحد على الأقل',
    test: (val) => z.string().regex(/\d/).safeParse(val).success,
  },
];
