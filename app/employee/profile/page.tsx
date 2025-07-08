import { requireAuth } from "@/lib/auth"
import pool from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Briefcase, Calendar, DollarSign, Key } from "lucide-react"
import { redirect } from "next/navigation"
import EmployeeNavbar from "@/components/employee-navbar"
import bcrypt from "bcryptjs"

async function getEmployeeProfile(employeeId: number) {
  try {
    const [rows] = await pool.execute("SELECT * FROM employees WHERE id = ?", [employeeId])
    return (rows as any[])[0] || null
  } catch (error) {
    console.error("Get employee profile error:", error)
    return null
  }
}

async function updateEmployeeProfile(formData: FormData) {
  "use server"

  const employeeId = Number.parseInt(formData.get("employeeId") as string)
  const phone = formData.get("phone") as string

  try {
    await pool.execute("UPDATE employees SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      phone || null,
      employeeId,
    ])
  } catch (error) {
    console.error("Update employee profile error:", error)
  }
}

async function changePassword(formData: FormData) {
  "use server"

  const employeeId = Number.parseInt(formData.get("employeeId") as string)
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Tous les champs sont requis" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas" }
  }

  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" }
  }

  try {
    // Vérifier le mot de passe actuel
    const [rows] = await pool.execute("SELECT password FROM employees WHERE id = ?", [employeeId])
    const employee = (rows as any[])[0]

    if (!employee) {
      return { error: "Employé non trouvé" }
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password)
    if (!isCurrentPasswordValid) {
      return { error: "Mot de passe actuel incorrect" }
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    await pool.execute("UPDATE employees SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      hashedNewPassword,
      employeeId,
    ])

    return { success: "Mot de passe modifié avec succès" }
  } catch (error) {
    console.error("Change password error:", error)
    return { error: "Erreur lors de la modification du mot de passe" }
  }
}

export default async function EmployeeProfilePage() {
  const user = await requireAuth()

  if (user.type !== "employee") {
    redirect("/dashboard")
  }

  const employee = await getEmployeeProfile(user.id)

  if (!employee) {
    return <div>Erreur: Profil employé non trouvé</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>Vos données personnelles et professionnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nom complet</p>
                    <p className="text-gray-900">{employee.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Poste</p>
                    <Badge variant="secondary">{employee.position}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date d'embauche</p>
                    <p className="text-gray-900">{new Date(employee.hire_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>

                {employee.salary && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Salaire</p>
                      <p className="text-gray-900">{employee.salary.toLocaleString("fr-FR")} €</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Formulaire pour modifier le téléphone */}
              <form action={updateEmployeeProfile} className="space-y-4 pt-4 border-t">
                <input type="hidden" name="employeeId" value={employee.id} />
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={employee.phone || ""}
                    placeholder="0123456789"
                  />
                </div>
                <Button type="submit" size="sm">
                  Mettre à jour le téléphone
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Changement de mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>Modifiez votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={changePassword} className="space-y-4">
                <input type="hidden" name="employeeId" value={employee.id} />

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                </div>

                <Button type="submit" className="w-full">
                  Changer le mot de passe
                </Button>
              </form>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Conseils de sécurité :</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Utilisez au moins 6 caractères</li>
                  <li>• Mélangez lettres, chiffres et symboles</li>
                  <li>• Ne partagez jamais votre mot de passe</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations de compte */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations de compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Statut du compte</p>
                <Badge className="mt-1 bg-green-100 text-green-800">{employee.is_active ? "Actif" : "Inactif"}</Badge>
              </div>
              <div>
                <p className="font-medium text-gray-700">Dernière connexion</p>
                <p className="text-gray-600 mt-1">
                  {employee.last_login ? new Date(employee.last_login).toLocaleString("fr-FR") : "Jamais connecté"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Compte créé le</p>
                <p className="text-gray-600 mt-1">{new Date(employee.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
