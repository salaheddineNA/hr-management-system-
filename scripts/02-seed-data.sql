-- Données d'exemple pour les employés
INSERT INTO employees (full_name, email, phone, position, hire_date, salary) VALUES
('Jean Dupont', 'jean.dupont@entreprise.com', '0123456789', 'Développeur Senior', '2023-01-15', 45000.00),
('Marie Martin', 'marie.martin@entreprise.com', '0123456790', 'Chef de Projet', '2023-02-01', 50000.00),
('Pierre Durand', 'pierre.durand@entreprise.com', '0123456791', 'Designer UX/UI', '2023-03-10', 40000.00),
('Sophie Leroy', 'sophie.leroy@entreprise.com', '0123456792', 'Développeur Frontend', '2023-04-05', 42000.00),
('Thomas Bernard', 'thomas.bernard@entreprise.com', '0123456793', 'DevOps Engineer', '2023-05-20', 48000.00)
ON DUPLICATE KEY UPDATE email = email;

-- Données d'exemple pour les demandes de congés
INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, status, reason) VALUES
(1, '2024-02-01', '2024-02-05', 'annuel', 'approuve', 'Vacances d\'hiver'),
(2, '2024-02-15', '2024-02-16', 'maladie', 'approuve', 'Grippe'),
(3, '2024-03-01', '2024-03-15', 'annuel', 'en_attente', 'Vacances de printemps'),
(4, '2024-03-10', '2024-03-12', 'exceptionnel', 'refuse', 'Événement familial'),
(5, '2024-04-01', '2024-04-03', 'annuel', 'en_attente', 'Long weekend')
ON DUPLICATE KEY UPDATE employee_id = employee_id;
