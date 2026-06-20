"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DatePicker({ value, onChange, min }: DatePickerProps) {
  const today = new Date();
  const minDate = min ? new Date(min) : today;

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selected = value ? new Date(value + "T00:00:00") : null;

  const toStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isSelected = (d: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === d;

  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  const isDisabled = (d: number) => {
    const date = new Date(viewYear, viewMonth, d);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return date < min;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const canGoPrev = () => {
    return viewYear > minDate.getFullYear() ||
      (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-cocoa/10 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-flame px-4 py-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev()}
          className="rounded-full p-1.5 text-white transition hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-sm font-semibold tracking-wide text-white uppercase">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-full p-1.5 text-white transition hover:bg-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 bg-peach-100 px-2 py-1.5">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-cocoa/50">
            {d}
          </div>
        ))}
      </div>

      {/* Dates grid */}
      <div className="grid grid-cols-7 gap-y-1 p-2">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const todayMark = isToday(day);

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onChange(toStr(viewYear, viewMonth, day))}
              className={`
                mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition
                ${selected
                  ? "bg-flame text-white shadow-glow"
                  : todayMark
                  ? "bg-peach-100 text-cocoa font-bold"
                  : disabled
                  ? "text-cocoa/20 cursor-not-allowed"
                  : "text-cocoa hover:bg-peach-100"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected date display */}
      {value && (
        <div className="border-t border-cocoa/10 px-4 py-2 text-center text-xs text-cocoa/60">
          Selected:{" "}
          <span className="font-semibold text-flame">
            {selected?.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      )}
    </div>
  );
}
