import { redirect } from "next/navigation"
import { getAuthCookie } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  const user = await getAuthCookie()

  if (user) {
    if (user.type === "admin") {
      redirect("/dashboard")
    } else {
      redirect("/employee/dashboard")
    }
  }

  // Page d'accueil pour les utilisateurs non connectés
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-500">RH Manager</h1>
          <p className="text-gray-600 mt-2">Système de gestion des ressources humaines</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Administration RH</CardTitle>
              <CardDescription>Accès complet à la gestion RH</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">Connexion Admin</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Espace Employé</CardTitle>
              <CardDescription>Consultez vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/employee-login">
                <Button variant="outline" className="w-full bg-orange-500 text-white hover:bg-orange-600">
                  Connexion Employé
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
