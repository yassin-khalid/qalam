import React from "react";
import { CalendarType } from "../../types/calendar";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getDateParts,
  hijriToDate,
} from "../../utils/dateUtils";

interface CalendarGridProps {
  viewDate: { month: number; year: number };
  selectedDate: Date | null;
  calendarType: CalendarType;
  onDateSelect: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  viewDate,
  selectedDate,
  calendarType,
  onDateSelect,
}) => {
  const daysInMonth = getDaysInMonth(
    viewDate.year,
    viewDate.month,
    calendarType,
  );
  const firstDay = getFirstDayOfMonth(
    viewDate.year,
    viewDate.month,
    calendarType,
  );

  const days = [];
  // Padding for start of month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
  }

  const today = new Date();
  const todayParts = getDateParts(today, calendarType);
  const selectedParts = selectedDate
    ? getDateParts(selectedDate, calendarType)
    : null;

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      todayParts.day === d &&
      todayParts.month === viewDate.month &&
      todayParts.year === viewDate.year;
    const isSelected =
      selectedParts &&
      selectedParts.day === d &&
      selectedParts.month === viewDate.month &&
      selectedParts.year === viewDate.year;

    days.push(
      <button
        key={d}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const date =
            calendarType === "gregorian"
              ? new Date(viewDate.year, viewDate.month - 1, d)
              : hijriToDate(viewDate.year, viewDate.month, d);
          onDateSelect(date);
        }}
        className={`h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all relative
          ${
            isSelected
              ? "bg-[#003049] text-white shadow-lg"
              : isToday
                ? "border-2 border-[#00B5B5] text-[#00B5B5] font-bold"
                : "text-gray-700 dark:text-gray-300 hover:bg-[#00B5B5]/10 hover:text-[#00B5B5]"
          }`}
      >
        {d}
      </button>,
    );
  }

  const weekDays = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day) => (
        <div
          key={day}
          className="h-10 w-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500"
        >
          {day}
        </div>
      ))}
      {days}
    </div>
  );
};

export default CalendarGrid;
