"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ptBR } from "date-fns/locale"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomMonthCaption(props: { calendarMonth: any }) {
    const { goToMonth, nextMonth, previousMonth } = useDayPicker()
    return (
        <div className="flex items-center justify-between px-2 pt-1 relative">
            <button
                disabled={!previousMonth}
                onClick={() => previousMonth && goToMonth(previousMonth)}
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full" // Added rounded-full
                )}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
                {format(props.calendarMonth.date, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
                disabled={!nextMonth}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full" // Added rounded-full
                )}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            fixedWeeks
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center", // Added justify-center
                month: "space-y-4 w-full", // Added w-full
                month_caption: "hidden", // Hide default caption container as we use custom
                caption_label: "hidden", // Hide default label
                nav: "hidden", // Hide default nav
                button_previous: "hidden", // Hide default buttons
                button_next: "hidden",
                month_grid: "w-fit mx-auto border-collapse space-y-1",
                weekdays: "flex justify-center", // Keep flex for row of headers but ensure justification
                week: "flex w-full mt-2 justify-center", // Keep flex for row of days but ensure justification
                weekday:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                // Make the day container selection background rounded for ranges
                day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full" // Added rounded-full
                ),
                range_end: "day-range-end",
                selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full", // Added rounded-full
                today: "bg-accent text-accent-foreground rounded-full", // Added rounded-full
                outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                disabled: "text-muted-foreground opacity-50",
                range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                MonthCaption: CustomMonthCaption,
            }}
            locale={ptBR}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }