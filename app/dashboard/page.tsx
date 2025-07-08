import { requireAdminAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Clock } from "lucide-react"

async function getDashboardStats() {
  try {
    // Total des employés
    const [employeesCount] = await pool.execute("SELECT COUNT(*) as count FROM employees")
    const totalEmployees = (employeesCount as any[])[0].count

    // Employés par poste
    const [positionStats] = await pool.execute(`
      SELECT position, COUNT(*) as count 
      FROM employees 
      GROUP BY position 
      ORDER BY count DESC
    `)

    // Derniers employés ajoutés
    const [recentEmployees] = await pool.execute(`
      SELECT full_name, position, hire_date 
      FROM employees 
      ORDER BY created_at DESC 
      LIMIT 5
    `)

    // Demandes de congés en attente
    const [pendingLeaves] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM leave_requests 
      WHERE status = 'en_attente'
    `)

    // Congés approuvés ce mois
    const [approvedThisMonth] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM leave_requests 
      WHERE status = 'approuve' 
      AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `)

    return {
      totalEmployees,
      positionStats: positionStats as any[],
      recentEmployees: recentEmployees as any[],
      pendingLeaves: (pendingLeaves as any[])[0].count,
      approvedThisMonth: (approvedThisMonth as any[])[0].count,
    }
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return {
      totalEmployees: 0,
      positionStats: [],
      recentEmployees: [],
      pendingLeaves: 0,
      approvedThisMonth: 0,
    }
  }
}

export default async function DashboardPage() {
  await requireAdminAuth()
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de la gestion RH</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-teal-500 text-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground text-stone-50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card className="bg-cyan-500 text-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Congés en attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground text-stone-50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            </CardContent>
          </Card>

          <Card className="bg-lime-500 text-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Congés approuvés ce mois</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground text-stone-50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedThisMonth}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Croissance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground text-stone-50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employés par poste */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par poste</CardTitle>
              <CardDescription>Nombre d'employés par fonction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.positionStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stat.position}</span>
                    <span className="text-sm text-gray-600">{stat.count} employé(s)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Derniers employés */}
          <Card>
            <CardHeader>
              <CardTitle>Derniers employés ajoutés</CardTitle>
              <CardDescription>Les 5 dernières embauches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentEmployees.map((employee, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{employee.full_name}</p>
                      <p className="text-xs text-gray-600">{employee.position}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(employee.hire_date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
