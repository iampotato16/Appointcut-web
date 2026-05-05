USE appointcutdb;

-- ---------------------------------------------------------
-- VIEWS TO ACCOMMODATE THE INCONSISTENT NAMING CONVENTIONS
-- AND REQUIRED JOINS FOR TEMPLATES AND BUSINESS LOGIC.
-- ---------------------------------------------------------

-- 1. Owner View
CREATE OR REPLACE VIEW owner AS
SELECT 
    OwnerID,
    CONCAT(firstName, ' ', lastName) AS FullName,
    email AS Email,
    password AS Password,
    contact AS Contact,
    status AS Status
FROM tblowner;

-- 2. Customer View
CREATE OR REPLACE VIEW customer AS
SELECT 
    CustomersID, RedTag,
    CONCAT(firstName, ' ', lastName) AS FullName,
    email AS Email,
    password AS Password,
    contact AS Contact,
    status AS Status
FROM tblcustomers;

-- 3. Shop View
CREATE OR REPLACE VIEW shop AS
SELECT 
    s.ShopID, s.cityID, s.barangayID, 
    s.imgpath, s.imgfilename,
    s.shopName AS ShopName,
    s.email AS Email,
    s.shopContact AS Contact,
    s.status AS Status,
    s.street AS Street,
    c.Name AS City,
    b.Name AS Barangay,
    s.appStatus AS AppStatus
FROM tblshop s
LEFT JOIN tblcity c ON s.cityID = c.CityID
LEFT JOIN tblbarangay b ON s.barangayID = b.BarangayID;

-- 4. Employee View
CREATE OR REPLACE VIEW employee AS
SELECT 
    e.EmployeeID,
    e.employeeTypeID, e.salaryTypeID, e.salaryTypeValue, e.balance, e.shopID,
    CONCAT(e.firstName, ' ', e.lastName) AS FullName,
    et.Name AS EmployeeType,
    st.Name AS SalaryType,
    e.email AS Email,
    e.password AS Password,
    e.contact AS Contact,
    e.status AS Status
FROM tblemployee e
LEFT JOIN tblemployeetype et ON e.employeeTypeID = et.EmployeeTypeID
LEFT JOIN tblsalarytype st ON e.salaryTypeID = st.SalaryTypeID;

-- 5. Appointment View
CREATE OR REPLACE VIEW appointment AS
SELECT 
    a.AppointmentID, a.Name, a.WalkInName, a.CustomerName, a.CustomersID,
    a.ShopID, a.EmployeeID, a.ShopServicesID, a.TimeIn, a.TimeOut, a.Date,
    a.AppStatusID,
    CASE a.AppStatusID
        WHEN 0 THEN 'No Show'
        WHEN 1 THEN 'Approved'
        WHEN 2 THEN 'Completed'
        WHEN 3 THEN 'Cancelled'
        ELSE a.AppointmentStatus
    END AS AppointmentStatus,
    a.appointmentType,
    a.AmountDue AS Amount,
    s.shopName AS ShopName,
    CONCAT(e.firstName, ' ', e.lastName) AS EmployeeName,
    ser.Name AS Service
FROM tblappointment a
LEFT JOIN tblshop s ON a.ShopID = s.ShopID
LEFT JOIN tblemployee e ON a.EmployeeID = e.EmployeeID
LEFT JOIN tblshopservices ss ON a.ShopServicesID = ss.ShopServicesID
LEFT JOIN tblservices ser ON ss.servicesID = ser.ServicesID;

-- 6. Shop Services View
CREATE OR REPLACE VIEW shopservices AS
SELECT 
    ss.ShopServicesID, ss.ShopServicesID AS ID, ss.shopID, ss.servicesID,
    s.Name AS Service,
    s.CategoryID,
    ss.price AS Price,
    ss.duration AS Duration,
    ss.status AS Status
FROM tblshopservices ss
JOIN tblservices s ON ss.servicesID = s.ServicesID;

-- 7. Employee Specialization View
CREATE OR REPLACE VIEW employeespecialization AS
SELECT 
    es.EmployeeSpecializationID,
    CONCAT(e.firstName, ' ', e.lastName) AS Name,
    es.employeeID AS EmployeeID,
    es.shopServicesID AS ShopServicesID,
    es.status AS Status
FROM tblemployeespecialization es
JOIN tblemployee e ON es.employeeID = e.EmployeeID;

-- 8. Shop Ownership View
CREATE OR REPLACE VIEW shopownership AS
SELECT 
    so.ownerID AS OwnerID,
    so.shopID AS ShopID,
    s.shopName AS ShopName,
    s.street AS Street,
    b.Name AS Barangay,
    c.Name AS City,
    s.email AS Email,
    s.shopContact AS Contact,
    s.status AS Status,
    s.appStatus,
    s.appStatus AS appStatusID,
    s.cityID AS CityID,
    s.barangayID AS BarangayID
FROM tblshopownership so
JOIN tblshop s ON so.shopID = s.ShopID
JOIN tblcity c ON s.cityID = c.CityID
JOIN tblbarangay b ON s.barangayID = b.BarangayID;

-- 9. Shop Application View
CREATE OR REPLACE VIEW shopapplication AS
SELECT 
    sa.ShopApplicationID,
    sa.bir_fileName AS BIR_fileName,
    sa.bp_fileName AS BP_fileName,
    sa.shopID AS ShopID,
    sa.ownerID AS OwnerID,
    s.shopName,
    CONCAT(s.street, ', ', b.Name, ', ', c.Name) AS address,
    CONCAT(o.firstName, ' ', o.lastName) AS ownerName,
    o.contact AS ownerContact,
    s.appStatus
FROM tblshopapplication sa
JOIN tblshop s ON sa.shopID = s.ShopID
JOIN tblowner o ON sa.ownerID = o.OwnerID
JOIN tblbarangay b ON s.barangayID = b.BarangayID
JOIN tblcity c ON s.cityID = c.CityID;

-- 10. Transactions View
CREATE OR REPLACE VIEW transactions AS
SELECT * FROM tbltransactions;

-- 11. Unified Users View
CREATE OR REPLACE VIEW users AS
SELECT 
    CustomersID AS UserID, 
    firstName, 
    lastName, 
    CONCAT(firstName, ' ', lastName) AS FullName,
    email, 
    contact, 
    status, 
    'Customer' AS Role 
FROM tblcustomers
UNION ALL
SELECT 
    EmployeeID AS UserID, 
    firstName, 
    lastName, 
    CONCAT(firstName, ' ', lastName) AS FullName,
    email, 
    contact, 
    status, 
    'Employee' AS Role 
FROM tblemployee
UNION ALL
SELECT 
    OwnerID AS UserID, 
    firstName, 
    lastName, 
    CONCAT(firstName, ' ', lastName) AS FullName,
    email, 
    contact, 
    status,
    'Owner' AS Role 
FROM tblowner;

-- 12. Schedule View
CREATE OR REPLACE VIEW schedule AS
SELECT 
    tblScheduleID,
    employeeID AS EmployeeID,
    Date,
    timeIn AS TimeIn,
    timeOut AS TimeOut,
    dayStatus
FROM tblschedule;

-- 13. Services View
CREATE OR REPLACE VIEW services AS
SELECT 
    s.*,
    c.Name AS Category
FROM tblservices s
LEFT JOIN tblcategory c ON s.CategoryID = c.CategoryID;
