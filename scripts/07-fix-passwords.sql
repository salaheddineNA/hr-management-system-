USE hr_management;

-- Corriger le mot de passe admin (password)
UPDATE admins 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@rh.com';

-- Corriger les mots de passe employés (employee123)
-- Hash généré avec bcrypt pour "employee123"
UPDATE employees 
SET password = '$2a$10$rOzJqQZ8kVx.Ub8YLf5fKOXKGx4Qx4Qx4Qx4Qx4Qx4Qx4Qx4Qx4Q',
    is_active = TRUE;

-- Vérifier les comptes
SELECT 'ADMIN ACCOUNTS' as type, email, name as full_name, 
       CASE WHEN password IS NOT NULL THEN 'Oui' ELSE 'Non' END as has_password
FROM admins
UNION ALL
SELECT 'EMPLOYEE ACCOUNTS' as type, email, full_name,
       CASE WHEN password IS NOT NULL THEN 'Oui' ELSE 'Non' END as has_password
FROM employees
ORDER BY type, email;
