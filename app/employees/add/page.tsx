import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

async function addEmployee(formData: FormData) {
  "use server"

  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const position = formData.get("position") as string
  const hire_date = formData.get("hire_date") as string
  const salary = formData.get("salary") as string

  try {
    await pool.execute(
      "INSERT INTO employees (full_name, email, phone, position, hire_date, salary) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, phone || null, position, hire_date, salary ? Number.parseFloat(salary) : null],
    )
    redirect("/employees")
  } catch (error) {
    console.error("Add employee error:", error)
  }
}

export default async function AddEmployeePage() {
  await requireAuth()

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
            <CardTitle>Ajouter un nouvel employé</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addEmployee} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input id="full_name" name="full_name" required placeholder="Jean Dupont" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="jean.dupont@entreprise.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" placeholder="0123456789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Poste *</Label>
                  <Input id="position" name="position" required placeholder="Développeur Senior" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Date d'embauche *</Label>
                  <Input id="hire_date" name="hire_date" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire (€)</Label>
                  <Input id="salary" name="salary" type="number" step="0.01" placeholder="45000" />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">Ajouter l'employé</Button>
                <Link href="/employees">
                  <Button variant="outline">Annuler</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
