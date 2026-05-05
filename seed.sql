USE appointcutdb;

-- -------------------------------------------------------------
-- DATA SEED SCRIPT
-- Run this script after init.sql and init_views.sql to populate
-- application lookups and defaults.
-- -------------------------------------------------------------

-- 1. City Defaults
INSERT INTO tblcity (Name) VALUES 
('Metro Manila'), 
('Quezon City'), 
('Makati'), 
('Taguig'), 
('Pasig');

-- 2. Barangay Defaults (Mapped to the simulated Cities)
INSERT INTO tblbarangay (Name, CityID) VALUES 
-- Metro Manila (CityID 1)
('Barangay 1', 1), 
('Barangay 76', 1),
-- Quezon City (CityID 2)
('Diliman', 2), 
('Cubao', 2),
('Loyola Heights', 2),
-- Makati (CityID 3)
('Poblacion', 3), 
('Bel-Air', 3),
-- Taguig (CityID 4)
('BGC', 4), 
('Signal Village', 4),
-- Pasig (CityID 5)
('Kapitolyo', 5), 
('San Antonio', 5);

-- 3. Category Defaults
INSERT INTO tblcategory (Name) VALUES 
('Haircut'), 
('Beard Grooming'), 
('Massage'), 
('Coloring');

-- 4. Service Defaults (Mapped to the simulated Categories)
INSERT INTO tblservices (Name, CategoryID) VALUES 
-- Haircuts (CategoryID 1)
('Classic Fade', 1), 
('Buzz Cut', 1), 
('Scissor Cut', 1),
-- Beard (CategoryID 2)
('Beard Trim', 2), 
('Hot Towel Shave', 2),
-- Massage (CategoryID 3)
('Head Massage', 3), 
('Shoulder Massage', 3),
-- Coloring (CategoryID 4)
('Hair Dyeing', 4), 
('Highlights', 4);

-- 5. Employee Type Defaults 
-- Often the backend expects specific IDs (1: Barber, 2: Desk)
INSERT INTO tblemployeetype (Name) VALUES 
('Barber'), 
('Desk Employee');

-- 6. Salary Type Defaults
INSERT INTO tblsalarytype (Name) VALUES 
('Percentage/Commission'), 
('Fixed Daily'), 
('Fixed Monthly');

-- 7. Haircut Master List
INSERT INTO tblhaircuts (name) VALUES 
('Pompadour'), 
('Quiff'), 
('French Crop'), 
('Mullet'), 
('Comb Over'),
('Undercut');

-- 8. Hairstyle References
INSERT INTO hairstyle (name, image_link, text_link) VALUES 
('Pompadour', 'https://via.placeholder.com/150/0000FF/808080?Text=Pompadour', 'https://en.wikipedia.org/wiki/Pompadour_(hairstyle)'),
('Quiff', 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Quiff', 'https://en.wikipedia.org/wiki/Quiff'),
('French Crop', 'https://via.placeholder.com/150/FFFF00/000000?Text=French_Crop', 'https://en.wikipedia.org/wiki/Crop_(hairstyle)');

-- 9. Setup Default Accounts
INSERT INTO tbladmin (email, password) VALUES 
('admin@gmail.com', 'admin12345');

INSERT INTO tblowner (firstName, lastName, email, password, contact) VALUES 
('John', 'Owner', 'owner@gmail.com', 'owner12345', '09123456789');

INSERT INTO tblcustomers (firstName, lastName, email, password, contact) VALUES 
('Jane', 'Customer', 'customer@gmail.com', 'customer12345', '09987654321');
