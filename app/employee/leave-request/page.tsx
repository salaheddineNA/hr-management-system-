import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import EmployeeNavbar from "@/components/employee-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

async function createLeaveRequest(formData: FormData) {
  "use server"

  const employee_id = formData.get("employee_id") as string
  const start_date = formData.get("start_date") as string
  const end_date = formData.get("end_date") as string
  const leave_type = formData.get("leave_type") as string
  const reason = formData.get("reason") as string

  console.log("Form data received:", {
    employee_id,
    start_date,
    end_date,
    leave_type,
    reason,
  })

  // Validation des champs requis
  if (!employee_id || !start_date || !end_date || !leave_type) {
    console.error("Champs manquants:", { employee_id, start_date, end_date, leave_type })
    return
  }

  // Validation des dates
  const startDate = new Date(start_date)
  const endDate = new Date(end_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (startDate < today) {
    console.error("Date de début dans le passé")
    return
  }

  if (endDate < startDate) {
    console.error("Date de fin antérieure à la date de début")
    return
  }

  try {
    const result = await pool.execute(
      "INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status) VALUES (?, ?, ?, ?, ?, 'en_attente')",
      [employee_id, start_date, end_date, leave_type, reason || null],
    )
    console.log("Leave request created successfully:", result)
    redirect("/employee/dashboard")
  } catch (error) {
    console.error("Create leave request error:", error)
  }
}

export default async function EmployeeLeaveRequestPage() {
  const user = await requireAuth()

  if (user.type !== "employee") {
    redirect("/dashboard")
  }

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/employee/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Demande de congé</h1>
          <p className="text-gray-600">Créez une nouvelle demande de congé</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Nouvelle demande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createLeaveRequest} className="space-y-6">
              <input type="hidden" name="employee_id" value={user.id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input id="start_date" name="start_date" type="date" required min={today} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input id="end_date" name="end_date" type="date" required min={today} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave_type">Type de congé *</Label>
                <select
                  name="leave_type"
                  id="leave_type"
                  required
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
                  name="reason"
                  placeholder="Précisez le motif de votre demande de congé..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Créer la demande
                </Button>
                <Link href="/employee/dashboard">
                  <Button variant="outline">Annuler</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Informations importantes :</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Votre demande sera soumise à l'approbation de l'administration RH</li>
                <li>• Vous pouvez suivre le statut de votre demande depuis votre tableau de bord</li>
                <li>• Les congés ne peuvent pas commencer dans le passé</li>
                <li>• Assurez-vous que les dates sont correctes avant de soumettre</li>
                <li>• La date de fin doit être postérieure ou égale à la date de début</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
