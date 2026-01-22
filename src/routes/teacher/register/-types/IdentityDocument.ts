export interface IdentityDocument {
  identityType: number;
  documentNumber: string;
  issuingCountryCode: string;
  file: File | null;
  fileName?: string;
}