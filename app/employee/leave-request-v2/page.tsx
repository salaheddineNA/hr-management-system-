"use client"

import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import EmployeeNavbar from "@/components/employee-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import LeaveRequestForm from "@/components/leave-request-form"

async function createLeaveRequest(formData: FormData) {
  "use server"

  const employee_id = formData.get("employee_id") as string
  const start_date = formData.get("start_date") as string
  const end_date = formData.get("end_date") as string
  const leave_type = formData.get("leave_type") as string
  const reason = formData.get("reason") as string

  try {
    await pool.execute(
      "INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status) VALUES (?, ?, ?, ?, ?, 'en_attente')",
      [employee_id, start_date, end_date, leave_type, reason || null],
    )
    redirect("/employee/dashboard")
  } catch (error) {
    console.error("Create leave request error:", error)
    throw new Error("Erreur lors de la création de la demande")
  }
}

export default async function EmployeeLeaveRequestV2Page() {
  const user = await requireAuth()

  if (user.type !== "employee") {
    redirect("/dashboard")
  }

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
            <LeaveRequestForm employeeId={user.id} onSubmit={createLeaveRequest} />
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
