import React, { useState, useRef, useEffect } from "react";
import { CalendarType } from "../../types/calendar";
import { getMonthName } from "../../utils/dateUtils";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

interface CalendarHeaderProps {
  viewDate: { month: number; year: number };
  calendarType: CalendarType;
  onPrev: () => void;
  onNext: () => void;
  onTypeToggle: (type: CalendarType) => void;
  onYearChange: (year: number) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewDate,
  calendarType,
  onPrev,
  onNext,
  onTypeToggle,
  onYearChange,
}) => {
  const [showYears, setShowYears] = useState(false);
  const yearsRef = useRef<HTMLDivElement>(null);
  const monthName = getMonthName(viewDate.month, viewDate.year, calendarType);

  const startYear = calendarType === "hijri" ? 1350 : 1900;
  const endYear = calendarType === "hijri" ? 1500 : 2100;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  ).reverse();

  useEffect(() => {
    if (showYears && yearsRef.current) {
      const activeYear = yearsRef.current.querySelector(
        `[data-year="${viewDate.year}"]`,
      );
      if (activeYear) {
        activeYear.scrollIntoView({
          block: "center",
          behavior: "instant" as any,
        });
      }
    }
  }, [showYears, viewDate.year]);

  return (
    <div className="flex flex-col space-y-3 mb-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onTypeToggle("gregorian");
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              calendarType === "gregorian"
                ? "bg-white dark:bg-slate-600 text-[#003049] shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-primary"
            }`}
          >
            ميلادي
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onTypeToggle("hijri");
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              calendarType === "hijri"
                ? "bg-white dark:bg-slate-600 text-[#003049] shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-[#00B5B5]"
            }`}
          >
            هجري
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onPrev();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
          >
            {/* <i className="fa-solid fa-chevron-right text-xs"></i> */}
            <ChevronRightIcon className={`w-4 h-4 transition-transform`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onNext();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
          >
            {/* <i className="fa-solid fa-chevron-left text-xs"></i> */}
            <ChevronLeftIcon className={`w-4 h-4 transition-transform`} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-[#003049] dark:text-[#00B5B5]">
          {monthName}{" "}
          <span className="font-medium text-gray-400 mr-1">
            {viewDate.year}
          </span>
        </h3>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowYears(!showYears);
            }}
            className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#003049`] transition-colors"
          >
            {viewDate.year}
            {/* <i className={`fa-solid fa-caret-down text-[10px] transition-transform ${showYears ? 'rotate-180' : ''}`}></i> */}
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${showYears ? "rotate-180" : ""}`}
            />
          </button>

          {showYears && (
            <div
              ref={yearsRef}
              className="absolute top-full left-0 z-50 mt-1 w-24 max-h-48 overflow-y-auto bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-100 dark:border-slate-600 elegant-scroll animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {years.map((year) => (
                <button
                  key={year}
                  data-year={year}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onYearChange(year);
                    setShowYears(false);
                  }}
                  className={`w-full text-center py-2 text-sm hover:bg-[#00B5B5]/10 hover:text-[#00B5B5] transition-colors ${
                    viewDate.year === year
                      ? "bg-[#003049] text-white font-bold"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
