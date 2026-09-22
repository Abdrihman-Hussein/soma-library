-- =====================================================================
-- SEED: admin.sql
-- Abuuritaanka koontada maamulaha (Admin Account) oo wata Bcrypt Hash dhab ah
-- Password-ka la hash-gareeyay waa: Admin123!
-- =====================================================================

USE soma_library;

-- Hubinta inaysan abuurmin laba jeer (Idempotency) iyadoo la eegayo email-ka
INSERT INTO users (name, email, password_hash, role, status)
SELECT 'System Administrator', 'admin@somalibrary.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@somalibrary.com'
);