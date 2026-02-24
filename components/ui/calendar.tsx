"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, UI, SelectionState, DayFlag } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onHeaderClick?: () => void;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onHeaderClick,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      formatters={{
        formatWeekdayName: (date) =>
          date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      }}
      classNames={{
        [UI.Root]: "relative w-full flex justify-center",
        [UI.Months]:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        [UI.Month]: "space-y-6 w-full max-w-[280px]",
        [UI.MonthCaption]:
          "relative flex items-center justify-center h-10 mb-2 px-10",
        [UI.CaptionLabel]: cn(
          "text-base font-bold text-foreground cursor-pointer hover:text-[#7C5DFA] transition-colors",
          onHeaderClick && "hover:underline underline-offset-4",
        ),
        [UI.Nav]:
          "absolute top-0 inset-x-0 h-10 flex items-center justify-between pointer-events-none z-10",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-background border shadow-sm rounded-lg p-0 opacity-70 hover:opacity-100 hover:bg-accent transition-all pointer-events-auto",
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-background border shadow-sm rounded-lg p-0 opacity-70 hover:opacity-100 hover:bg-accent transition-all pointer-events-auto",
        ),
        [UI.MonthGrid]: "w-full border-collapse",
        [UI.Weekdays]: "flex mb-2",
        [UI.Weekday]:
          "text-muted-foreground w-10 font-medium text-[0.85rem] text-center",
        [UI.Weeks]: "space-y-1",
        [UI.Week]: "flex w-full mt-1",
        [UI.Day]:
          "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors aria-selected:opacity-100",
        ),
        [SelectionState.selected]:
          "bg-[#7C5DFA] text-white hover:bg-[#6C4DFA] hover:text-white focus:bg-[#7C5DFA] focus:text-white rounded-xl shadow-md",
        [DayFlag.today]:
          "text-[#7C5DFA] font-bold after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#7C5DFA] after:rounded-full",
        [DayFlag.outside]:
          "text-muted-foreground/40 opacity-50 aria-selected:bg-[#7C5DFA]/50 aria-selected:text-white",
        [DayFlag.disabled]: "text-muted-foreground/30 opacity-30",
        [DayFlag.hidden]: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left")
            return <ChevronLeft className="h-4 w-4" />;
          if (orientation === "right")
            return <ChevronRight className="h-4 w-4" />;
          return <></>;
        },
        CaptionLabel: (props) => (
          <span
            onClick={onHeaderClick}
            className={cn(
              "text-base font-bold text-foreground cursor-pointer hover:text-[#7C5DFA] transition-colors",
              onHeaderClick && "hover:underline underline-offset-4",
            )}
          >
            {props.children}
          </span>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
