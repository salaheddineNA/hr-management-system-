import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import EmployeeNavbar from "@/components/employee-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function testDatabaseConnection() {
  try {
    const [rows] = await pool.execute("SELECT 1 as test")
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function getEmployeeInfo(employeeId: number) {
  try {
    const [rows] = await pool.execute("SELECT * FROM employees WHERE id = ?", [employeeId])
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testLeaveRequestInsert(employeeId: number) {
  try {
    const testData = {
      employee_id: employeeId,
      start_date: "2024-03-01",
      end_date: "2024-03-05",
      leave_type: "annuel",
      reason: "Test debug",
      status: "en_attente",
    }

    const [result] = await pool.execute(
      "INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        testData.employee_id,
        testData.start_date,
        testData.end_date,
        testData.leave_type,
        testData.reason,
        testData.status,
      ],
    )

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default async function DebugLeavePage() {
  const user = await requireAuth()

  if (user.type !== "employee") {
    return <div>Accès refusé</div>
  }

  const dbTest = await testDatabaseConnection()
  const employeeInfo = await getEmployeeInfo(user.id)
  const insertTest = await testLeaveRequestInsert(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug - Demande de congé</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test de connexion base de données</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(dbTest, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations employé</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(employeeInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test d'insertion demande de congé</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(insertTest, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
