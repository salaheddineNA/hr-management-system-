import { requireAdminAuth } from "@/lib/auth"
import pool from "@/lib/db"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Key, UserX } from "lucide-react"
import Link from "next/link"
import { createEmployeeAccount, deactivateEmployeeAccount } from "@/lib/auth"

interface EmployeeAccount {
  id: number
  full_name: string
  email: string
  position: string
  has_account: boolean
  is_active: boolean
  last_login: string | null
}

async function getEmployeesAccounts(): Promise<EmployeeAccount[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, 
        full_name, 
        email, 
        position,
        CASE WHEN password IS NOT NULL THEN TRUE ELSE FALSE END as has_account,
        is_active,
        last_login
      FROM employees 
      ORDER BY full_name
    `)
    return rows as EmployeeAccount[]
  } catch (error) {
    console.error("Get employees accounts error:", error)
    return []
  }
}

async function createAccountAction(formData: FormData) {
  "use server"

  const employeeId = Number.parseInt(formData.get("employeeId") as string)
  const password = "employee123" // Mot de passe par défaut

  await createEmployeeAccount(employeeId, password)
}

async function deactivateAccountAction(formData: FormData) {
  "use server"

  const employeeId = Number.parseInt(formData.get("employeeId") as string)
  await deactivateEmployeeAccount(employeeId)
}

export default async function EmployeeAccountsPage() {
  await requireAdminAuth()
  const employees = await getEmployeesAccounts()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Comptes employés</h1>
          <p className="text-gray-600">Gérez les accès de vos employés à leur espace personnel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des employés et leurs comptes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{employee.full_name}</h3>
                      <Badge variant="secondary">{employee.position}</Badge>
                      {employee.has_account && employee.is_active && (
                        <Badge className="bg-green-100 text-green-800">Compte actif</Badge>
                      )}
                      {employee.has_account && !employee.is_active && (
                        <Badge className="bg-red-100 text-red-800">Compte désactivé</Badge>
                      )}
                      {!employee.has_account && <Badge variant="outline">Pas de compte</Badge>}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Email: {employee.email}</p>
                      {employee.last_login && (
                        <p>Dernière connexion: {new Date(employee.last_login).toLocaleDateString("fr-FR")}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!employee.has_account ? (
                      <form action={createAccountAction}>
                        <input type="hidden" name="employeeId" value={employee.id} />
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Créer compte
                        </Button>
                      </form>
                    ) : employee.is_active ? (
                      <>
                        <form action={deactivateAccountAction}>
                          <input type="hidden" name="employeeId" value={employee.id} />
                          <Button size="sm" variant="destructive">
                            <UserX className="h-4 w-4 mr-2" />
                            Désactiver
                          </Button>
                        </form>
                      </>
                    ) : (
                      <form action={createAccountAction}>
                        <input type="hidden" name="employeeId" value={employee.id} />
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Réactiver
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Informations importantes :</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Le mot de passe par défaut est : <code className="bg-blue-100 px-1 rounded">employee123</code>
            </li>
            <li>
              • Les employés peuvent se connecter sur :{" "}
              <Link href="/employee-login" className="underline">
                /employee-login
              </Link>
            </li>
            <li>• Ils pourront voir leurs informations personnelles et l'historique de leurs congés</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
