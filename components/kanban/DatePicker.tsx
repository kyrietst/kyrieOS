"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, X, Loader2 } from "lucide-react"
import { format, addDays, startOfDay, isBefore, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CardActionButton } from "./CardActionButton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
    cardId: string
    startDate?: string | null
    dueDate?: string | null
    reminder?: string | null
    completed?: boolean
    onUpdate: (data: { startDate?: string | null, dueDate?: string | null, reminder?: string | null }) => Promise<void>
    trigger?: React.ReactNode
}

export function DatePicker({
    cardId,
    startDate: initialStartDate,
    dueDate: initialDueDate,
    reminder: initialReminder,
    completed,
    onUpdate,
    trigger
}: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate ? new Date(initialStartDate) : undefined)
    const [dueDate, setDueDate] = useState<Date | undefined>(initialDueDate ? new Date(initialDueDate) : undefined)
    const [startTime, setStartTime] = useState(initialStartDate ? format(new Date(initialStartDate), "HH:mm") : "09:00")
    const [dueTime, setDueTime] = useState(initialDueDate ? format(new Date(initialDueDate), "HH:mm") : "17:00")
    const [reminder, setReminder] = useState<string>(initialReminder || "none")
    const [useStartDate, setUseStartDate] = useState(!!initialStartDate)
    const [useDueDate, setUseDueDate] = useState(!!initialDueDate)
    const [loading, setLoading] = useState(false)

    // Sync with props when opened
    useEffect(() => {
        if (open) {
            setStartDate(initialStartDate ? new Date(initialStartDate) : undefined)
            setDueDate(initialDueDate ? new Date(initialDueDate) : undefined)
            setStartTime(initialStartDate ? format(new Date(initialStartDate), "HH:mm") : "09:00")
            setDueTime(initialDueDate ? format(new Date(initialDueDate), "HH:mm") : "17:00")
            setReminder(initialReminder || "none")
            setUseStartDate(!!initialStartDate)
            setUseDueDate(!!initialDueDate || true) // Default to true if opening fresh, or keep logic
            if (!initialDueDate && !initialStartDate) {
                setUseDueDate(true)
                const tomorrow = addDays(new Date(), 1)
                tomorrow.setHours(17, 0, 0, 0)
                setDueDate(tomorrow)
            }
        }
    }, [open, initialStartDate, initialDueDate, initialReminder])

    const handleSave = async () => {
        setLoading(true)
        try {
            let finalStartDate = null
            let finalDueDate = null

            if (useStartDate && startDate) {
                const [hours, minutes] = startTime.split(":").map(Number)
                finalStartDate = new Date(startDate)
                finalStartDate.setHours(hours, minutes)
            }

            if (useDueDate && dueDate) {
                const [hours, minutes] = dueTime.split(":").map(Number)
                finalDueDate = new Date(dueDate)
                finalDueDate.setHours(hours, minutes)
            }

            // Validation: Start cannot be after Due
            if (finalStartDate && finalDueDate && isBefore(finalDueDate, finalStartDate)) {
                // Swap or just warn? Trello usually acts smart. Let's just save.
            }

            await onUpdate({
                startDate: finalStartDate?.toISOString() || null,
                dueDate: finalDueDate?.toISOString() || null,
                reminder: reminder === "none" ? null : reminder
            })
            setOpen(false)
        } catch (error) {
            console.error("Failed to save dates", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async () => {
        setLoading(true)
        try {
            await onUpdate({ startDate: null, dueDate: null, reminder: null })
            setOpen(false)
        } catch (error) {
            console.error("Failed to remove dates", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return

        // Trello Logic: select date updates the "focused" field or defaults to Due Date.
        // For simplicity: Update Due Date if enabled, else Start Date. 
        // Or if Start Date field is "focused" (we'd need state for that).
        // Let's assume user is picking Due Date mostly.

        // Better logic: 
        if (useDueDate) {
            setDueDate(date)
        } else if (useStartDate) {
            setStartDate(date)
        } else {
            setUseDueDate(true)
            setDueDate(date)
        }
    }

    const isOverdue = dueDate && new Date() > dueDate && !completed
    const isDueSoon = dueDate && new Date() <= dueDate && addDays(new Date(), 2) >= dueDate && !completed

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <CardActionButton
                        icon={CalendarIcon}
                        label={dueDate ? format(dueDate, "d 'de' MMM", { locale: ptBR }) : "Datas"}
                        active={!!dueDate}
                        variantTheme={isOverdue ? 'destructive' : isDueSoon ? 'warning' : 'default'}
                    />
                )}
            </PopoverTrigger>
            <PopoverContent
                className="w-auto min-w-[300px] p-0 shadow-xl rounded-xl border-border bg-popover"
                align="start"
                sideOffset={8}
            >
                <div className="flex flex-col">

                    <Calendar
                        mode="single"
                        selected={useDueDate ? dueDate : startDate}
                        onSelect={handleDateSelect}
                        locale={ptBR}
                    />

                    <div className="px-4 pb-4 space-y-4">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="check-start"
                                    checked={useStartDate}
                                    onChange={(e) => setUseStartDate(e.target.checked)}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary shadow-sm"
                                />
                                <Label htmlFor="check-start" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer">
                                    Data de início
                                </Label>
                            </div>
                            {useStartDate && (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            value={startDate ? format(startDate, "dd/MM/yyyy") : ""}
                                            readOnly
                                            className="h-8 text-sm bg-muted/50 border-transparent hover:bg-muted focus-visible:bg-background transition-colors text-center cursor-default"
                                        />
                                    </div>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-24 h-8 text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="check-due"
                                    checked={useDueDate}
                                    onChange={(e) => setUseDueDate(e.target.checked)}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary shadow-sm"
                                />
                                <Label htmlFor="check-due" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer">
                                    Data de entrega
                                </Label>
                            </div>
                            {useDueDate && (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            value={dueDate ? format(dueDate, "dd/MM/yyyy") : ""}
                                            readOnly
                                            className="h-8 text-sm bg-muted/50 border-transparent hover:bg-muted focus-visible:bg-background transition-colors text-center cursor-default"
                                        />
                                    </div>
                                    <Input
                                        type="time"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                        className="w-24 h-8 text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Reminder */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Definir lembrete
                            </Label>
                            <Select value={reminder} onValueChange={setReminder}>
                                <SelectTrigger className="h-8 w-full text-sm">
                                    <SelectValue placeholder="Sem lembrete" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    <SelectItem value="at_time">Na hora da entrega</SelectItem>
                                    <SelectItem value="5_min_before">5 minutos antes</SelectItem>
                                    <SelectItem value="10_min_before">10 minutos antes</SelectItem>
                                    <SelectItem value="15_min_before">15 minutos antes</SelectItem>
                                    <SelectItem value="1_hour_before">1 hora antes</SelectItem>
                                    <SelectItem value="2_hours_before">2 horas antes</SelectItem>
                                    <SelectItem value="1_day_before">1 dia antes</SelectItem>
                                    <SelectItem value="2_days_before">2 dias antes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <Button onClick={handleSave} disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                            <Button onClick={handleRemove} variant="ghost" disabled={loading} className="w-full h-8 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                                Remover
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
} 
