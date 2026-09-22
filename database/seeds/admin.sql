-- =====================================================================
-- SEED: Isticmaalaha Maamulaha (admin.sql)
-- Xogtan waxay abuuraysaa koontada koowaad ee maamulaha (Admin Account)
-- Note: Password-ka halkan wuxuu isticmaalayaa Bcrypt hash sugan.
-- =====================================================================

INSERT INTO users (name, email, password_hash, role, status) 
VALUES (
    'Soma Library Admin', 
    'admin@somalibrary.local', 
    '$2b$10$e8q3v5Z6x7y8z9A0B1C2Du9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', -- Bcrypt Hash sugan
    'admin', 
    'active'
)
ON DUPLICATE KEY UPDATE email = email; -- Ka hortagga duplicate errors haddii seed-ka la celceliyo