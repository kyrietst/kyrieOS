# PLAN-calendar-alignment (V2)

## Task
Fix Calendar Misalignment - Final Styling (Strict Shadcn UI Structure).

## Context
The previous attempt to fix the calendar alignment failed to produce visual changes. The user has provided a specific, rigid implementation to force the correct layout by removing manual overrides and enforcing a strict flex/grid structure.

## Agents Invoked
- **Project Planner**: Define this plan.
- **Frontend Specialist**: Apply the strict code changes.
- **Test Engineer**: Verify the fix.

## Step-by-Step Implementation

### Phase 1: Clean Slate & Prop Removal
- [ ] **Remove Prop Overrides**:
    - Remove `style={{ width: '100%', margin: 0 } as React.CSSProperties}`.
    - Remove `navLayout="around"`.
    - Remove `kanban-calendar` and `w-full` from the root `className`.

### Phase 2: Strict `classNames` Implementation
- [ ] **Update `classNames`** with the exact structure provided by the user:
    - `table`: `"border-collapse space-y-1"` (CRITICAL: ensure `w-full` is REMOVED).
    - `head_row`: `"flex"`.
    - `row`: `"flex w-full mt-2"`.
    - `head_cell` and `cell`: `"w-9 font-normal text-[0.8rem]"` (and `h-9` for cell).
- [ ] **Remove** `import "react-day-picker/style.css"` (Verify it is gone).

### Phase 3: Exact Component Return
- [ ] Replace the component return statement with the exact code block provided:
    ```tsx
    return (
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          // ... remaining classes
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    )
    ```

## Verification Plan
### Automated
- [ ] Lint check: `npx eslint components/ui/calendar.tsx`

### Manual
- [ ] Verify `w-full` is gone from `table` class.
- [ ] Verify `head_row` is `flex`.
- [ ] Verify `row` is `flex`.
