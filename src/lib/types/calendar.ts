
export type CalendarType = 'gregorian' | 'hijri';

export interface DateState {
  day: number;
  month: number;
  year: number;
}

export interface CalendarMonth {
  name: string;
  year: number;
  monthIndex: number; // 0-11 for Gregorian, 1-12 for Hijri logic usually
}
