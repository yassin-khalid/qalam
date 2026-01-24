

import { CalendarType, DateState } from '@/lib/types/calendar';

export const getToday = (): Date => new Date();

export const formatDate = (date: Date, type: CalendarType, locale: string = 'ar-SA'): string => {
  if (type === 'gregorian') {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } else {
    return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
};

export const getDateParts = (date: Date, type: CalendarType): DateState => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };
  const locale = type === 'gregorian' ? 'en-GB' : 'en-u-ca-islamic-umalqura-nu-latn';
  const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
  
  const getPart = (pName: string) => parseInt(parts.find(p => p.type === pName)?.value || '0', 10);
  
  return {
    day: getPart('day'),
    month: getPart('month'),
    year: getPart('year')
  };
};

export const getMonthName = (month: number, year: number, type: CalendarType, locale: string = 'ar'): string => {
  const date = type === 'gregorian' 
    ? new Date(year, month - 1, 15) 
    : hijriToDate(year, month, 15);
    
  const localeString = type === 'gregorian' ? locale : `${locale}-u-ca-islamic-umalqura-nu-latn`;
  return new Intl.DateTimeFormat(localeString, { month: 'long' }).format(date);
};

export const hijriToDate = (year: number, month: number, day: number): Date => {
  let date = new Date(year - 579, month - 1, day); 
  for (let i = 0; i < 100; i++) {
    const parts = getDateParts(date, 'hijri');
    if (parts.year === year && parts.month === month && parts.day === day) return date;
    
    const diffDays = (year - parts.year) * 354 + (month - parts.month) * 29 + (day - parts.day);
    date.setDate(date.getDate() + diffDays);
    if (Math.abs(diffDays) === 0) break;
  }
  return date;
};

export const getDaysInMonth = (year: number, month: number, type: CalendarType): number => {
  if (type === 'gregorian') {
    return new Date(year, month, 0).getDate();
  } else {
    const d30 = hijriToDate(year, month, 30);
    const parts = getDateParts(d30, 'hijri');
    return parts.month === month ? 30 : 29;
  }
};

export const getFirstDayOfMonth = (year: number, month: number, type: CalendarType): number => {
  const date = type === 'gregorian' 
    ? new Date(year, month - 1, 1) 
    : hijriToDate(year, month, 1);
  return date.getDay(); 
};
