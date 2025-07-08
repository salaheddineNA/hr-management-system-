import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface Employee {
  id: number
  full_name: string
}

async function getEmployees(): Promise<Employee[]> {
  try {
    const [rows] = await pool.execute("SELECT id, full_name FROM employees ORDER BY full_name")
    return rows as Employee[]
  } catch (error) {
    console.error("Get employees error:", error)
    return []
  }
}

async function addLeaveRequest(formData: FormData) {
  "use server"

  const employee_id = formData.get("employee_id") as string
  const start_date = formData.get("start_date") as string
  const end_date = formData.get("end_date") as string
  const leave_type = formData.get("leave_type") as string
  const reason = formData.get("reason") as string

  try {
    await pool.execute(
      "INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason) VALUES (?, ?, ?, ?, ?)",
      [employee_id, start_date, end_date, leave_type, reason || null],
    )
    redirect("/leaves")
  } catch (error) {
    console.error("Add leave request error:", error)
  }
}

export default async function AddLeavePage() {
  await requireAuth()
  const employees = await getEmployees()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/leaves" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux congés
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer une demande de congé</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addLeaveRequest} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employé *</Label>
                <Select name="employee_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input id="start_date" name="start_date" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input id="end_date" name="end_date" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave_type">Type de congé *</Label>
                <Select name="leave_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type de congé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annuel">Congé annuel</SelectItem>
                    <SelectItem value="maladie">Congé maladie</SelectItem>
                    <SelectItem value="exceptionnel">Congé exceptionnel</SelectItem>
                    <SelectItem value="maternite">Congé maternité</SelectItem>
                    <SelectItem value="paternite">Congé paternité</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Précisez le motif de la demande de congé..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">Créer la demande</Button>
                <Link href="/leaves">
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
