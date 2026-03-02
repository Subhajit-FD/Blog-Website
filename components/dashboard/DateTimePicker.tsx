"use client";

import * as React from "react";
import {
  format,
  setYear,
  setMonth,
  getDaysInMonth,
  startOfMonth,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onClose?: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DateTimePicker({
  value,
  onChange,
  onClose,
}: DateTimePickerProps) {
  const initial = value ? new Date(value) : new Date();

  const [viewDate, setViewDate] = React.useState(initial);
  const [selectedDate, setSelectedDate] = React.useState<Date>(initial);

  const [hourStr, setHourStr] = React.useState(
    value ? format(value, "hh") : "01",
  );
  const [minuteStr, setMinuteStr] = React.useState(
    value ? format(value, "mm") : "00",
  );
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(
    value ? (format(value, "a") as "AM" | "PM") : "AM",
  );

  const [dayStr, setDayStr] = React.useState(format(selectedDate, "dd"));
  const [yearStr, setYearStr] = React.useState(format(selectedDate, "yyyy"));
  const [selectedMonth, setSelectedMonth] = React.useState(
    selectedDate.getMonth(),
  );

  // Sync day/year inputs when calendar date changes
  React.useEffect(() => {
    setDayStr(format(selectedDate, "dd"));
    setYearStr(format(selectedDate, "yyyy"));
    setSelectedMonth(selectedDate.getMonth());
    setViewDate(selectedDate);
  }, [selectedDate]);

  const handleConfirm = () => {
    const finalDate = new Date(selectedDate);
    let h = parseInt(hourStr) || 1;
    const m = parseInt(minuteStr) || 0;
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    finalDate.setHours(h, m, 0, 0);
    onChange?.(finalDate);
    onClose?.();
  };

  const handleNow = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewDate(now);
    setHourStr(format(now, "hh"));
    setMinuteStr(format(now, "mm"));
    setAmpm(format(now, "a") as "AM" | "PM");
  };

  const prevMonth = () => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const nextMonth = () => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  // Build calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(viewDate);
  // getDay: 0=Sun, 1=Mon... We want Mon-first so offset:
  // Mon=0, Tue=1 ... Sun=6
  const firstDayOfWeek = (getDay(startOfMonth(viewDate)) + 6) % 7;
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const isSelected = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
  };

  // Sync date inputs → update selectedDate on blur
  const commitInputs = () => {
    const d = parseInt(dayStr) || 1;
    const y = parseInt(yearStr) || year;
    const m2 = selectedMonth;
    const clamped = Math.min(d, getDaysInMonth(new Date(y, m2, 1)));
    const newDate = new Date(y, m2, clamped);
    setSelectedDate(newDate);
  };

  const handleMonthChange = (val: string) => {
    const m2 = parseInt(val);
    setSelectedMonth(m2);
    const y = parseInt(yearStr) || year;
    const clamped = Math.min(
      parseInt(dayStr) || 1,
      getDaysInMonth(new Date(y, m2, 1)),
    );
    const newDate = new Date(y, m2, clamped);
    setSelectedDate(newDate);
    setViewDate(newDate);
  };

  const padTime = (val: string, max: number) => {
    const n = Math.min(parseInt(val) || 0, max);
    return String(n).padStart(2, "0");
  };

  return (
    <div className="w-[280px] bg-background border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-semibold text-base text-foreground">Publish</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNow}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            Now
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* TIME Row */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Time
          </p>
          <div className="flex items-center gap-2">
            {/* Hour */}
            <input
              type="text"
              maxLength={2}
              value={hourStr}
              onChange={(e) => setHourStr(e.target.value.replace(/\D/g, ""))}
              onBlur={() => setHourStr(padTime(hourStr, 12) || "01")}
              className="w-12 h-9 text-center font-semibold text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="font-bold text-muted-foreground">:</span>
            {/* Minute */}
            <input
              type="text"
              maxLength={2}
              value={minuteStr}
              onChange={(e) => setMinuteStr(e.target.value.replace(/\D/g, ""))}
              onBlur={() => setMinuteStr(padTime(minuteStr, 59))}
              className="w-12 h-9 text-center font-semibold text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {/* AM/PM */}
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setAmpm("AM")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold transition-colors",
                  ampm === "AM"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                AM
              </button>
              <button
                onClick={() => setAmpm("PM")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold transition-colors",
                  ampm === "PM"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                PM
              </button>
            </div>
            <span className="text-xs text-muted-foreground font-medium ml-auto">
              UTC
            </span>
          </div>
        </div>

        {/* DATE Row */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Date
          </p>
          <div className="flex items-center gap-2">
            {/* Day */}
            <input
              type="text"
              maxLength={2}
              value={dayStr}
              onChange={(e) => setDayStr(e.target.value.replace(/\D/g, ""))}
              onBlur={commitInputs}
              className="w-12 h-9 text-center font-semibold text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {/* Month */}
            <Select
              value={String(selectedMonth)}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-9 flex-1 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Year */}
            <input
              type="text"
              maxLength={4}
              value={yearStr}
              onChange={(e) => setYearStr(e.target.value.replace(/\D/g, ""))}
              onBlur={commitInputs}
              className="w-[52px] h-9 text-center font-semibold text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-2">
          {/* Month Nav */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">
              {MONTHS[month]} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 text-center">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="text-[11px] font-semibold text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 text-center gap-y-0.5">
            {calendarCells.map((day, idx) => {
              if (!day)
                return <div key={`empty-${idx}`} className="h-8 w-full" />;
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-8 w-8 mx-auto text-sm rounded-full flex items-center justify-center transition-colors relative",
                    isSelected(day)
                      ? "bg-primary text-primary-foreground font-bold"
                      : "hover:bg-muted text-foreground",
                    !isSelected(day) && isToday(day) && "font-semibold",
                  )}
                >
                  {day}
                  {isToday(day) && !isSelected(day) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="flex-1" size="sm" onClick={handleConfirm}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
