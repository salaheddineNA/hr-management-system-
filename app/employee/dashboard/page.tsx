import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Mail, Phone, Briefcase } from "lucide-react"
import { redirect } from "next/navigation"
import EmployeeNavbar from "@/components/employee-navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function getEmployeeData(employeeId: number) {
  try {
    // Informations de l'employé
    const [employeeRows] = await pool.execute("SELECT * FROM employees WHERE id = ?", [employeeId])
    const employee = (employeeRows as any[])[0]

    // Demandes de congés de l'employé
    const [leaveRows] = await pool.execute(
      `SELECT * FROM leave_requests 
       WHERE employee_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [employeeId],
    )
    const leaveRequests = leaveRows as any[]

    // Statistiques des congés
    const [statsRows] = await pool.execute(
      `SELECT 
         COUNT(*) as total_requests,
         SUM(CASE WHEN status = 'approuve' THEN 1 ELSE 0 END) as approved_requests,
         SUM(CASE WHEN status = 'en_attente' THEN 1 ELSE 0 END) as pending_requests
       FROM leave_requests 
       WHERE employee_id = ?`,
      [employeeId],
    )
    const stats = (statsRows as any[])[0]

    return { employee, leaveRequests, stats }
  } catch (error) {
    console.error("Get employee data error:", error)
    return {
      employee: null,
      leaveRequests: [],
      stats: { total_requests: 0, approved_requests: 0, pending_requests: 0 },
    }
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

export default async function EmployeeDashboardPage() {
  const user = await requireAuth()

  if (user.type !== "employee") {
    redirect("/dashboard")
  }

  const { employee, leaveRequests, stats } = await getEmployeeData(user.id)

  if (!employee) {
    return <div>Erreur: Employé non trouvé</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bonjour, {employee.full_name}</h1>
          <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
        </div>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mes informations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-gray-600">{employee.phone || "Non renseigné"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Poste</p>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Date d'embauche</p>
                    <p className="text-sm text-gray-600">{new Date(employee.hire_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques des congés */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_requests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Congés approuvés</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved_requests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_requests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Link href="/employee/leave-request">
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Demander un congé
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historique des congés */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes demandes de congés</CardTitle>
              <CardDescription>Historique de vos demandes récentes</CardDescription>
            </div>
            <Link href="/employee/leaves">
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune demande de congé</p>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{getLeaveTypeLabel(request.leave_type)}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Du {new Date(request.start_date).toLocaleDateString("fr-FR")} au{" "}
                        {new Date(request.end_date).toLocaleDateString("fr-FR")}
                      </div>
                      {request.reason && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Motif:</span> {request.reason}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
