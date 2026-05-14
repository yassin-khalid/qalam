import { z } from "zod";
import i18n from "@/lib/i18n";
import { ValidationRule } from "./types";

// The main schema provided by the user
export const passwordSchema = z.string()
  .min(8, { message: i18n.t('teacher:auth.register.stepOne.validation.passwordMin') })
  .regex(/[A-Z]/, i18n.t('teacher:auth.register.stepOne.validation.passwordUppercase'))
  .regex(/[^A-Za-z0-9]/, i18n.t('teacher:auth.register.stepOne.validation.passwordSpecial'))
  .regex(/\d/, i18n.t('teacher:auth.register.stepOne.validation.passwordNumber'));

// Mapping rules to Zod tests for real-time checklist feedback
export const PASSWORD_RULES: ValidationRule[] = [
  {
    id: 'min-length',
    get label() { return i18n.t('teacher:auth.register.stepOne.validation.passwordMin'); },
    test: (val) => z.string().min(8).safeParse(val).success,
  },
  {
    id: 'uppercase',
    get label() { return i18n.t('teacher:auth.register.stepOne.validation.passwordUppercase'); },
    test: (val) => z.string().regex(/[A-Z]/).safeParse(val).success,
  },
  {
    id: 'special',
    get label() { return i18n.t('teacher:auth.register.stepOne.validation.passwordSpecial'); },
    test: (val) => z.string().regex(/[^A-Za-z0-9]/).safeParse(val).success,
  },
  {
    id: 'digit',
    get label() { return i18n.t('teacher:auth.register.stepOne.validation.passwordNumber'); },
    test: (val) => z.string().regex(/\d/).safeParse(val).success,
  },
];
