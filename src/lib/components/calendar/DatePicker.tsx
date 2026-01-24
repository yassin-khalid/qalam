import React, { useState, useRef, useEffect } from "react";
import { CalendarType } from "@/lib/types/calendar";
import { formatDate, getDateParts } from "@/lib/utils/dateUtils";
import CalendarHeader from "./CalendarHijri";
import CalendarGrid from "./CalendarGrid";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  initialType?: CalendarType;
  onChange?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder = "اختر التاريخ",
  initialType = "hijri",
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarType>(initialType);
  const [viewDate, setViewDate] = useState({ month: 1, year: 1446 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = selectedDate || new Date();
    const parts = getDateParts(initial, calendarType);
    setViewDate({ month: parts.month, year: parts.year });
  }, [isOpen, calendarType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrev = () => {
    setViewDate((prev) => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      return { month: newMonth, year: newYear };
    });
  };

  const handleNext = () => {
    setViewDate((prev) => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      return { month: newMonth, year: newYear };
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
    if (onChange) onChange(date);
  };

  return (
    <div className="relative w-full group" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-[#003049] dark:text-gray-300 mb-2 mr-1">
          {label}
        </label>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={`
          w-full py-2.5 flex items-center justify-between px-3 rounded-xl
          border transition-all duration-300 ease-in-out cursor-pointer
          text-slate-900 dark:text-slate-100
        bg-gray-50/50 dark:bg-slate-950
          ${isOpen ? "border-[#00B5B5] ring-4 ring-[#00B5B5]/10" : "border-transparent hover:border-[#00B5B5] shadow-sm"}
        `}
      >
        <div className="flex items-center gap-4">
          {/* <i className={`fa-regular fa-calendar ${selectedDate ? 'text-[#00B5B5]' : 'text-gray-300'} text-xl transition-colors`}></i> */}
          <CalendarIcon
            className={`w-5 h-5 transition-colors ${selectedDate ? "text-[#00B5B5]" : "text-gray-300"}`}
          />
          <span
            className={`text-base font-medium ${selectedDate ? "text-[#003049] dark:text-white" : "text-gray-400"}`}
          >
            {selectedDate
              ? formatDate(selectedDate, calendarType)
              : placeholder}
          </span>
        </div>
        <i
          className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${isOpen ? "rotate-180 text-[#00B5B5]" : "text-gray-300"}`}
        ></i>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 right-0 left-0 z-50 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 animate-in fade-in zoom-in duration-200 origin-top">
          <CalendarHeader
            viewDate={viewDate}
            calendarType={calendarType}
            onPrev={handlePrev}
            onNext={handleNext}
            onTypeToggle={setCalendarType}
            onYearChange={(year) => setViewDate((prev) => ({ ...prev, year }))}
          />

          <CalendarGrid
            viewDate={viewDate}
            selectedDate={selectedDate}
            calendarType={calendarType}
            onDateSelect={handleDateSelect}
          />

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDateSelect(new Date());
              }}
              className="text-xs font-bold text-[#00B5B5] hover:underline decoration-2 underline-offset-4"
            >
              اليوم
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedDate(null);
              }}
              className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
            >
              مسح
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
