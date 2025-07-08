import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import pool from "./db"

export interface Admin {
  id: number
  email: string
  name: string
}

export interface Employee {
  id: number
  email: string
  full_name: string
  position: string
}

export interface User {
  id: number
  email: string
  name: string
  type: "admin" | "employee"
}

// Fonction pour l'authentification des employés
export async function loginEmployee(email: string, password: string): Promise<Employee | null> {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, full_name, position, password FROM employees WHERE email = ? AND is_active = TRUE",
      [email],
    )

    const employees = rows as any[]
    if (employees.length === 0) return null

    const employee = employees[0]
    const isValid = await bcrypt.compare(password, employee.password)

    if (!isValid) return null

    // Mettre à jour la dernière connexion
    await pool.execute("UPDATE employees SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [employee.id])

    return {
      id: employee.id,
      email: employee.email,
      full_name: employee.full_name,
      position: employee.position,
    }
  } catch (error) {
    console.error("Employee login error:", error)
    return null
  }
}

// Fonction pour créer un compte employé
export async function createEmployeeAccount(employeeId: number, password: string): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.execute("UPDATE employees SET password = ?, is_active = TRUE WHERE id = ?", [hashedPassword, employeeId])
    return true
  } catch (error) {
    console.error("Create employee account error:", error)
    return false
  }
}

// Fonction pour désactiver un compte employé
export async function deactivateEmployeeAccount(employeeId: number): Promise<boolean> {
  try {
    await pool.execute("UPDATE employees SET is_active = FALSE WHERE id = ?", [employeeId])
    return true
  } catch (error) {
    console.error("Deactivate employee account error:", error)
    return false
  }
}

export async function login(email: string, password: string): Promise<Admin | null> {
  try {
    const [rows] = await pool.execute("SELECT * FROM admins WHERE email = ?", [email])

    const admins = rows as any[]
    if (admins.length === 0) return null

    const admin = admins[0]
    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) return null

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    }
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

export async function setAuthCookie(user: Admin | Employee, type: "admin" | "employee") {
  const cookieStore = await cookies()
  const userData = {
    id: user.id,
    email: user.email,
    name: type === "admin" ? (user as Admin).name : (user as Employee).full_name,
    type: type,
  }

  cookieStore.set("user", JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getAuthCookie(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) return null

    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("user")
  redirect("/login")
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthCookie()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdminAuth(): Promise<User> {
  const user = await getAuthCookie()
  if (!user || user.type !== "admin") {
    redirect("/login")
  }
  return user
}
