USE hr_management;

-- Vérifier la structure de la table leave_requests
DESCRIBE leave_requests;

-- Vérifier les employés actifs
SELECT id, full_name, email, is_active 
FROM employees 
WHERE is_active = TRUE;

-- Vérifier les demandes de congés existantes
SELECT 
    lr.id,
    e.full_name,
    lr.start_date,
    lr.end_date,
    lr.leave_type,
    lr.status,
    lr.created_at
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.id
ORDER BY lr.created_at DESC;

-- Test d'insertion manuelle
INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status) 
VALUES (1, '2024-03-01', '2024-03-05', 'annuel', 'Test de congé', 'en_attente');

-- Vérifier l'insertion
SELECT * FROM leave_requests WHERE reason = 'Test de congé';
