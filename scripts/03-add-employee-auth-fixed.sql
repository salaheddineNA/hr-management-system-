USE hr_management;

-- Ajouter les colonnes d'authentification à la table employees
ALTER TABLE employees 
ADD COLUMN password VARCHAR(255) NULL,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN last_login TIMESTAMP NULL;

-- Créer un index sur l'email pour optimiser les connexions
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Mettre à jour les employés existants avec des mots de passe par défaut (hachés)
-- Mot de passe par défaut : "employee123"
UPDATE employees 
SET password = '$2a$10$rOzJqQZ8kVx.Ub8YLf5fKOXKGx4Qx4Qx4Qx4Qx4Qx4Qx4Qx4Qx4Q',
    is_active = TRUE
WHERE password IS NULL;

-- Vérifier que les employés ont bien des comptes
SELECT 
    id,
    full_name,
    email,
    CASE 
        WHEN password IS NOT NULL THEN 'Oui' 
        ELSE 'Non' 
    END as has_password,
    is_active
FROM employees;
