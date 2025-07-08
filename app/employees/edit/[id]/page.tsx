import { requireAdminAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface Employee {
  id: number
  full_name: string
  email: string
  phone: string
  position: string
  hire_date: string
  salary: number
}

async function getEmployee(id: number): Promise<Employee | null> {
  try {
    const [rows] = await pool.execute("SELECT * FROM employees WHERE id = ?", [id])
    const employees = rows as Employee[]
    return employees.length > 0 ? employees[0] : null
  } catch (error) {
    console.error("Get employee error:", error)
    return null
  }
}

async function updateEmployee(formData: FormData) {
  "use server"

  const id = formData.get("id") as string
  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const position = formData.get("position") as string
  const hire_date = formData.get("hire_date") as string
  const salary = formData.get("salary") as string

  try {
    await pool.execute(
      `UPDATE employees 
       SET full_name = ?, email = ?, phone = ?, position = ?, hire_date = ?, salary = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [full_name, email, phone || null, position, hire_date, salary ? Number.parseFloat(salary) : null, id],
    )
    redirect("/employees")
  } catch (error) {
    console.error("Update employee error:", error)
    return { error: "Erreur lors de la mise à jour de l'employé" }
  }
}

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminAuth()
  const { id } = await params
  const employee = await getEmployee(Number.parseInt(id))

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Employé non trouvé</p>
              <Link href="/employees" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                Retour à la liste des employés
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/employees" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modifier l'employé : {employee.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateEmployee} className="space-y-6">
              <input type="hidden" name="id" value={employee.id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    required
                    defaultValue={employee.full_name}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={employee.email}
                    placeholder="jean.dupont@entreprise.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" defaultValue={employee.phone || ""} placeholder="0123456789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Poste *</Label>
                  <Input
                    id="position"
                    name="position"
                    required
                    defaultValue={employee.position}
                    placeholder="Développeur Senior"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Date d'embauche *</Label>
                  <Input id="hire_date" name="hire_date" type="date" required defaultValue={employee.hire_date} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire (€)</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    step="0.01"
                    defaultValue={employee.salary || ""}
                    placeholder="45000"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">Mettre à jour l'employé</Button>
                <Link href="/employees">
                  <Button variant="outline">Annuler</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Compte créé le</p>
                <p className="text-gray-600">{new Date(employee.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Dernière modification</p>
                <p className="text-gray-600">{new Date(employee.updated_at).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/employees/accounts" className="text-blue-600 hover:text-blue-800 text-sm">
                Gérer le compte de connexion de cet employé →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
