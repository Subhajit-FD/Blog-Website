"use client";

import * as React from "react";
import { format, setYear } from "date-fns";
import { ChevronUp, ChevronDown, ChevronLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onClose?: () => void;
}

type ViewMode = "calendar" | "year";

export function DateTimePicker({
  value,
  onChange,
  onClose,
}: DateTimePickerProps) {
  const [view, setView] = React.useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    value ? new Date(value) : new Date(),
  );

  // Stepper states
  const [hour, setHour] = React.useState(
    value ? parseInt(format(value, "h")) : 9,
  );
  const [minute, setMinute] = React.useState(
    value ? parseInt(format(value, "mm")) : 0,
  );
  const [second, setSecond] = React.useState(
    value ? parseInt(format(value, "ss")) : 0,
  );
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(
    value ? (format(value, "a") as "AM" | "PM") : "AM",
  );

  // For Year view
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const incrementHour = () => setHour((prev) => (prev === 12 ? 1 : prev + 1));
  const decrementHour = () => setHour((prev) => (prev === 1 ? 12 : prev - 1));
  const incrementMinute = () =>
    setMinute((prev) => (prev >= 59 ? 0 : prev + 1));
  const decrementMinute = () =>
    setMinute((prev) => (prev <= 0 ? 59 : prev - 1));
  const incrementSecond = () =>
    setSecond((prev) => (prev >= 59 ? 0 : prev + 1));
  const decrementSecond = () =>
    setSecond((prev) => (prev <= 0 ? 59 : prev - 1));

  const handleConfirm = () => {
    if (onChange) {
      const finalDate = new Date(selectedDate);
      let h = hour;
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;

      finalDate.setHours(h);
      finalDate.setMinutes(minute);
      finalDate.setSeconds(second);
      finalDate.setMilliseconds(0);
      onChange(finalDate);
    }
    if (onClose) onClose();
  };

  const handleYearSelect = (year: number) => {
    const newDate = setYear(selectedDate, year);
    setSelectedDate(newDate);
    setView("calendar");
  };

  const formattedTime = `${hour}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")} ${ampm}`;

  return (
    <div className="flex flex-col lg:flex-row bg-background rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 w-max mx-auto lg:mx-0">
      {/* Panel 1: Calendar or Year Select */}
      <div className="w-full lg:w-[320px] p-4 flex flex-col border-b lg:border-b-0 lg:border-r bg-background">
        {view === "calendar" ? (
          <>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              onHeaderClick={() => setView("year")}
              className="rounded-md border-0 p-0"
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl h-10 font-semibold text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl h-10 font-semibold text-sm border-none shadow-md shadow-blue-500/20"
              >
                OK
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-[328px]">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("calendar")}
                className="rounded-lg h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <span className="font-bold text-base">Select Year</span>
              <div className="w-10"></div>
            </div>
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-3 gap-2">
                {years.map((y) => (
                  <Button
                    key={y}
                    variant={
                      selectedDate.getFullYear() === y ? "default" : "ghost"
                    }
                    onClick={() => handleYearSelect(y)}
                    className={cn(
                      "rounded-xl h-9 font-medium text-sm",
                      selectedDate.getFullYear() === y
                        ? "bg-[#2563EB] text-white"
                        : "",
                    )}
                  >
                    {y}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Panel 2: Stepper Time Selection */}
      <div className="w-full lg:w-[320px] p-6 flex flex-col bg-muted/5 border-t lg:border-t-0">
        <div className="text-center font-bold text-base mb-6 text-foreground/80 lowercase">
          Time
        </div>

        <div className="flex justify-between items-start flex-1 px-1 gap-1">
          {/* Hour Stepper */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={incrementHour}
              className="rounded-xl border shadow-sm h-9 w-9 bg-background hover:bg-accent"
            >
              <ChevronUp className="h-4 w-4 text-foreground/70" />
            </Button>
            <div className="flex flex-col items-center py-1">
              <span className="text-3xl font-bold tracking-tight">{hour}</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">
                hour
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={decrementHour}
              className="rounded-xl border shadow-sm h-9 w-9 bg-background hover:bg-accent"
            >
              <ChevronDown className="h-4 w-4 text-foreground/70" />
            </Button>
          </div>

          {/* Minute Stepper */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={incrementMinute}
              className="rounded-xl border shadow-sm h-9 w-9 bg-background hover:bg-accent"
            >
              <ChevronUp className="h-4 w-4 text-foreground/70" />
            </Button>
            <div className="flex flex-col items-center py-1">
              <span className="text-3xl font-bold tracking-tight">
                {minute.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">
                min
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={decrementMinute}
              className="rounded-xl border shadow-sm h-9 w-9 bg-background hover:bg-accent"
            >
              <ChevronDown className="h-4 w-4 text-foreground/70" />
            </Button>
          </div>

          {/* Second Stepper */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={incrementSecond}
              className="rounded-xl border shadow-sm h-9 w-9 bg-background hover:bg-accent"
            >
              <ChevronUp className="h-4 w-4 text-foreground/70" />
            </Button>
            <div className="flex flex-col items-center py-1">
              <span className="text-3xl font-bold tracking-tight">
                {second.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">
                sec
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={decrementSecond}
              className="rounded-xl border shadow-sm h-9 w-9 bg-background hover:bg-accent"
            >
              <ChevronDown className="h-4 w-4 text-foreground/70" />
            </Button>
          </div>

          {/* AM/PM Toggle */}
          <div className="flex flex-col items-center h-full justify-center lg:pt-0 pt-2">
            <div className="flex flex-col bg-muted/50 rounded-xl p-1 shadow-inner border">
              <button
                onClick={() => setAmpm("AM")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  ampm === "AM"
                    ? "bg-background shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                AM
              </button>
              <button
                onClick={() => setAmpm("PM")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  ampm === "PM"
                    ? "bg-background shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-center text-[13px] font-semibold text-foreground/60 mb-5 tracking-wide">
            {formattedTime}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleConfirm}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl h-10 font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all border-none"
            >
              OK
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-muted-foreground hover:bg-background rounded-xl h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
