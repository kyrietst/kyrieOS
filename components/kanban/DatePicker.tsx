"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, Bell, X } from "lucide-react"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PickerLayout } from "./PickerLayout"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
            setUseDueDate(!!initialDueDate)
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

            // Basic validation: End date usually after start date
            if (finalStartDate && finalDueDate && finalStartDate > finalDueDate) {
                // Just swap them or warn? For now, we'll let it be but maybe UI should prevent it.
            }

            await onUpdate({
                startDate: finalStartDate?.toISOString() || null,
                dueDate: finalDueDate?.toISOString() || null,
                reminder: reminder === "none" ? null : reminder // You might need to calculate actual reminder date based on selection
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                        <Clock className="mr-2 h-4 w-4" />
                        Datas
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="w-[300px] sm:w-auto bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                        <h4 className="font-semibold text-sm">Datas</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="p-0">
                        <Calendar
                            mode="single"
                            selected={useDueDate ? dueDate : (useStartDate ? startDate : undefined)}
                            onSelect={(date: Date | undefined) => {
                                if (useDueDate) setDueDate(date)
                                else if (useStartDate) setStartDate(date)
                                else {
                                    // Default to due date if nothing active
                                    setUseDueDate(true)
                                    setDueDate(date)
                                }
                            }}
                            locale={ptBR}
                            className="rounded-md border-b"
                        />
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Start Date Toggle */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Data de início</label>
                                <input
                                    type="checkbox"
                                    checked={useStartDate}
                                    onChange={(e) => setUseStartDate(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </div>
                            {useStartDate && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 justify-start text-left font-normal"
                                        onClick={() => { }} // Focus calendar?
                                    >
                                        {startDate ? format(startDate, "P", { locale: ptBR }) : "Selecione"}
                                    </Button>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Due Date Toggle */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Data de entrega</label>
                                <input
                                    type="checkbox"
                                    checked={useDueDate}
                                    onChange={(e) => setUseDueDate(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </div>
                            {useDueDate && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 justify-start text-left font-normal"
                                        onClick={() => { }} // Focus calendar?
                                    >
                                        {dueDate ? format(dueDate, "P", { locale: ptBR }) : "Selecione"}
                                    </Button>
                                    <input
                                        type="time"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                        className="w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Reminder */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Definir lembrete</label>
                            <Select value={reminder} onValueChange={setReminder}>
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    <SelectItem value="at_time">Na hora da entrega</SelectItem>
                                    <SelectItem value="15_min">15 minutos antes</SelectItem>
                                    <SelectItem value="1_hour">1 hora antes</SelectItem>
                                    <SelectItem value="1_day">1 dia antes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button onClick={handleSave} disabled={loading} className="w-full">
                                Salvar
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleRemove}
                                disabled={loading}
                                className="w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                                Remover datas
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
