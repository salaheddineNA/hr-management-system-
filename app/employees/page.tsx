import { requireAdminAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Employee {
  id: number
  full_name: string
  email: string
  phone: string
  position: string
  hire_date: string
  salary: number
}

async function getEmployees(search?: string): Promise<Employee[]> {
  try {
    let query = "SELECT * FROM employees"
    let params: any[] = []

    if (search) {
      query += " WHERE full_name LIKE ? OR email LIKE ? OR position LIKE ?"
      params = [`%${search}%`, `%${search}%`, `%${search}%`]
    }

    query += " ORDER BY created_at DESC"

    const [rows] = await pool.execute(query, params)
    return rows as Employee[]
  } catch (error) {
    console.error("Get employees error:", error)
    return []
  }
}

async function deleteEmployee(formData: FormData) {
  "use server"

  const id = formData.get("id") as string

  try {
    await pool.execute("DELETE FROM employees WHERE id = ?", [id])
  } catch (error) {
    console.error("Delete employee error:", error)
  }
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  await requireAdminAuth()
  const { search } = await searchParams
  const employees = await getEmployees(search)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Gestion des employés</h1>
            <p className="text-gray-600">Gérez votre équipe et leurs informations</p>
          </div>
          <Link href="/employees/add">
            <Button className="bg-orange-500">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un employé
            </Button>
          </Link>
        </div>

        {/* Barre de recherche */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form method="GET" className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  name="search"
                  placeholder="Rechercher par nom, email ou poste..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-orange-500">Rechercher</Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des employés */}
        <div className="grid gap-4">
          {employees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucun employé trouvé</p>
              </CardContent>
            </Card>
          ) : (
            employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{employee.full_name}</h3>
                        <Badge variant="secondary">{employee.position}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {employee.email}
                        </div>
                        <div>
                          <span className="font-medium">Téléphone:</span> {employee.phone || "Non renseigné"}
                        </div>
                        <div>
                          <span className="font-medium">Date d'embauche:</span>{" "}
                          {new Date(employee.hire_date).toLocaleDateString("fr-FR")}
                        </div>
                        <div>
                          <span className="font-medium">Salaire:</span>{" "}
                          {employee.salary ? `${employee.salary.toLocaleString("fr-FR")} €` : "Non renseigné"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/employees/edit/${employee.id}`}>
                        <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-300 hover:text-white; ">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteEmployee}>
                        <input type="hidden" name="id" value={employee.id} />
                        <Button variant="outline" size="sm" type="submit" className="bg-red-500 text-white hover:bg-red-300 hover:text-white;">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
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
