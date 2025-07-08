import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BarChart3, LogOut } from "lucide-react"
import { logout } from "@/lib/auth"

async function logoutAction() {
  "use server"
  await logout()
}

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-orange-500">
              RH Manager
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
              <Link
                href="/employees"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <Users className="h-4 w-4" />
                <span>Employés</span>
              </Link>
              <Link
                href="/leaves"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <Calendar className="h-4 w-4" />
                <span>Congés</span>
              </Link>
              <Link
                href="/employees/accounts"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <Users className="h-4 w-4" />
                <span>Comptes</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center text-red-600">
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="hover:text-gray-50 hover:bg-red-600">
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
