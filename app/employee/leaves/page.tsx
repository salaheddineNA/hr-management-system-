import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import EmployeeNavbar from "@/components/employee-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface LeaveRequest {
  id: number
  start_date: string
  end_date: string
  leave_type: string
  status: string
  reason: string
  created_at: string
  admin_comment: string
}

async function getEmployeeLeaves(employeeId: number): Promise<LeaveRequest[]> {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM leave_requests 
       WHERE employee_id = ? 
       ORDER BY created_at DESC`,
      [employeeId],
    )
    return rows as LeaveRequest[]
  } catch (error) {
    console.error("Get employee leaves error:", error)
    return []
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approuve":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approuvé
        </Badge>
      )
    case "refuse":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Refusé
        </Badge>
      )
    case "en_attente":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getLeaveTypeLabel(type: string) {
  const types: Record<string, string> = {
    annuel: "Congé annuel",
    maladie: "Congé maladie",
    exceptionnel: "Congé exceptionnel",
    maternite: "Congé maternité",
    paternite: "Congé paternité",
  }
  return types[type] || type
}

function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}

export default async function EmployeeLeavesPage() {
  const user = await requireAuth()

  if (user.type !== "employee") {
    redirect("/dashboard")
  }

  const leaves = await getEmployeeLeaves(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes congés</h1>
            <p className="text-gray-600">Historique de toutes vos demandes de congé</p>
          </div>
          <Link href="/employee/leave-request">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </Link>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total demandes</p>
                  <p className="text-2xl font-bold">{leaves.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approuvées</p>
                  <p className="text-2xl font-bold">{leaves.filter((l) => l.status === "approuve").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold">{leaves.filter((l) => l.status === "en_attente").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {leaves.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Aucune demande de congé</p>
                <Link href="/employee/leave-request">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer votre première demande
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            leaves.map((leave) => (
              <Card key={leave.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{getLeaveTypeLabel(leave.leave_type)}</h3>
                      {getStatusBadge(leave.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Demandé le {new Date(leave.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Période</p>
                        <p className="text-sm text-gray-600">
                          Du {new Date(leave.start_date).toLocaleDateString("fr-FR")} au{" "}
                          {new Date(leave.end_date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Durée</p>
                        <p className="text-sm text-gray-600">
                          {calculateDuration(leave.start_date, leave.end_date)} jour(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4" /> {/* Spacer */}
                      <div>
                        <p className="text-sm font-medium">Statut</p>
                        <p className="text-sm text-gray-600">
                          {leave.status === "approuve"
                            ? "Congé approuvé"
                            : leave.status === "refuse"
                              ? "Demande refusée"
                              : "En cours d'examen"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {leave.reason && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Motif :</p>
                      <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                    </div>
                  )}

                  {leave.admin_comment && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-700">Commentaire de l'administration :</p>
                      <p className="text-sm text-blue-600 mt-1">{leave.admin_comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
