
export interface Certificate {
  id: string;
  file: File | null;
  fileName?: string;
  title: string;
  issuer: string;
  issueDate: string;
  dateType: 'gregorian' | 'hijri';
}