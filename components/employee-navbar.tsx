import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, LogOut, User, Calendar } from "lucide-react"
import { logout } from "@/lib/auth"

async function logoutAction() {
  "use server"
  await logout()
}

export default function EmployeeNavbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/employee/dashboard" className="text-xl font-bold text-green-600">
              Mon Espace
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/employee/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
              <Link
                href="/employee/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600"
              >
                <User className="h-4 w-4" />
                <span>Mon profil</span>
              </Link>
              <Link
                href="/employee/leaves"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600"
              >
                <Calendar className="h-4 w-4" />
                <span>Mes congés</span>
              </Link>
              <Link
                href="/employee/leave-request"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600"
              >
                <Calendar className="h-4 w-4" />
                <span>Demander un congé</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <form action={logoutAction}>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
