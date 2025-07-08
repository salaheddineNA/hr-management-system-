import { redirect } from "next/navigation"
import { login, setAuthCookie, getAuthCookie } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

async function loginAction(formData: FormData) {
  "use server"

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email et mot de passe requis" }
  }

  const admin = await login(email, password)

  if (!admin) {
    return { error: "Email ou mot de passe incorrect" }
  }

  await setAuthCookie(admin, "admin")
  redirect("/dashboard")
}

export default async function LoginPage() {
  const user = await getAuthCookie()
  if (user) {
    if (user.type === "admin") {
      redirect("/dashboard")
    } else {
      redirect("/employee/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-500">Connexion RH</CardTitle>
          <CardDescription>Connectez-vous à votre espace d'administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@rh.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              Se connecter
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Compte de test :</p>
            <p>Email: admin@rh.com</p>
            <p>Mot de passe: password</p>
          </div>
          <div className="mt-4 text-center">
            <Link href="/employee-login" className="text-sm text-orange-600 hover:text-orange-800">
              Connexion Employé
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
