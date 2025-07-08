const bcrypt = require("bcryptjs")

// Test des mots de passe
async function testPasswords() {
  console.log("=== Test des mots de passe ===")

  // Test mot de passe admin
  const adminPassword = "password"
  const adminHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
  const adminValid = await bcrypt.compare(adminPassword, adminHash)
  console.log(`Admin password "${adminPassword}": ${adminValid ? "✅ Valide" : "❌ Invalide"}`)

  // Test mot de passe employé
  const employeePassword = "employee123"
  const employeeHash = await bcrypt.hash(employeePassword, 10)
  const employeeValid = await bcrypt.compare(employeePassword, employeeHash)
  console.log(`Employee password "${employeePassword}": ${employeeValid ? "✅ Valide" : "❌ Invalide"}`)

  // Générer un nouveau hash pour employee123
  console.log("\n=== Nouveau hash pour employee123 ===")
  console.log(employeeHash)
}

testPasswords().catch(console.error)
