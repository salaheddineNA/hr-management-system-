import { requireAdminAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, User, Clock } from "lucide-react"
import Link from "next/link"

interface LeaveRequest {
  id: number
  employee_name: string
  start_date: string
  end_date: string
  leave_type: string
  status: string
  reason: string
  created_at: string
}

async function getLeaveRequests(statusFilter?: string): Promise<LeaveRequest[]> {
  try {
    let query = `
      SELECT lr.*, e.full_name as employee_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
    `
    let params: any[] = []

    if (statusFilter && statusFilter !== "all") {
      query += " WHERE lr.status = ?"
      params = [statusFilter]
    }

    query += " ORDER BY lr.created_at DESC"

    const [rows] = await pool.execute(query, params)
    return rows as LeaveRequest[]
  } catch (error) {
    console.error("Get leave requests error:", error)
    return []
  }
}

async function updateLeaveStatus(formData: FormData) {
  "use server"

  const id = formData.get("id") as string
  const status = formData.get("status") as string

  try {
    await pool.execute("UPDATE leave_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      status,
      id,
    ])
  } catch (error) {
    console.error("Update leave status error:", error)
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approuve":
      return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
    case "refuse":
      return <Badge className="bg-red-100 text-red-800">Refusé</Badge>
    case "en_attente":
      return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
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

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdminAuth()
  const { status } = await searchParams
  const leaveRequests = await getLeaveRequests(status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des congés</h1>
            <p className="text-gray-600">Gérez les demandes de congés de vos employés</p>
          </div>
          <Link href="/leaves/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </Link>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form method="GET" className="flex gap-4">
              <Select name="status" defaultValue={status || "all"}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuve">Approuvé</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Filtrer</Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des demandes */}
        <div className="grid gap-4">
          {leaveRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucune demande de congé trouvée</p>
              </CardContent>
            </Card>
          ) : (
            leaveRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{request.employee_name}</span>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            Du {new Date(request.start_date).toLocaleDateString("fr-FR")} au{" "}
                            {new Date(request.end_date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium">Type:</span> {getLeaveTypeLabel(request.leave_type)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Demandé le {new Date(request.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium">Motif:</span>
                          <p className="text-sm text-gray-700 mt-1">{request.reason}</p>
                        </div>
                      )}
                    </div>

                    {request.status === "en_attente" && (
                      <div className="flex gap-2 ml-4">
                        <form action={updateLeaveStatus}>
                          <input type="hidden" name="id" value={request.id} />
                          <input type="hidden" name="status" value="approuve" />
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approuver
                          </Button>
                        </form>
                        <form action={updateLeaveStatus}>
                          <input type="hidden" name="id" value={request.id} />
                          <input type="hidden" name="status" value="refuse" />
                          <Button size="sm" variant="destructive">
                            Refuser
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
