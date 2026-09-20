-- Default admin login: username = admin / password = Admin@123
-- (BCrypt hash below corresponds to "Admin@123" - CHANGE IT immediately after first login)
INSERT INTO users (username, password, full_name, email, role, active)
VALUES ('admin', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5L8pw6TjyxT6qxCpBd8yPmLZzk3Uu', 'System Administrator', 'admin@example.com', 'ADMIN', TRUE);

INSERT INTO categories (name, type, description) VALUES
 ('Beverages', 'PRODUCT', 'Ready to sell drinks'),
 ('Bakery', 'PRODUCT', 'Baked finished goods'),
 ('Flour & Grains', 'RAW_MATERIAL', 'Raw baking ingredients'),
 ('Packaging', 'RAW_MATERIAL', 'Boxes, bags, wrapping material'),
 ('Fabric', 'RAW_MATERIAL', 'Textile raw material sold by the metre');
