"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface LeaveRequestFormProps {
  employeeId: number
  onSubmit: (formData: FormData) => Promise<void>
}

export default function LeaveRequestForm({ employeeId, onSubmit }: LeaveRequestFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [leaveType, setLeaveType] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const validateForm = () => {
    if (!startDate || !endDate || !leaveType) {
      setError("Veuillez remplir tous les champs obligatoires")
      return false
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    if (start < todayDate) {
      setError("La date de début ne peut pas être dans le passé")
      return false
    }

    if (end < start) {
      setError("La date de fin ne peut pas être antérieure à la date de début")
      return false
    }

    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("employee_id", employeeId.toString())
      formData.append("start_date", startDate)
      formData.append("end_date", endDate)
      formData.append("leave_type", leaveType)
      formData.append("reason", reason)

      await onSubmit(formData)
    } catch (error) {
      setError("Erreur lors de la création de la demande")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="start_date">Date de début *</Label>
          <Input
            id="start_date"
            type="date"
            required
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Date de fin *</Label>
          <Input
            id="end_date"
            type="date"
            required
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leave_type">Type de congé *</Label>
        <select
          id="leave_type"
          required
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">-- Sélectionner le type de congé --</option>
          <option value="annuel">Congé annuel</option>
          <option value="maladie">Congé maladie</option>
          <option value="exceptionnel">Congé exceptionnel</option>
          <option value="maternite">Congé maternité</option>
          <option value="paternite">Congé paternité</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Motif (optionnel)</Label>
        <Textarea
          id="reason"
          placeholder="Précisez le motif de votre demande de congé..."
          className="min-h-[100px]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Création en cours..." : "Créer la demande"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
