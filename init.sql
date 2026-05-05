CREATE DATABASE IF NOT EXISTS appointcutdb;
USE appointcutdb;

CREATE TABLE IF NOT EXISTS tbladmin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tblowner (
    OwnerID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    contact VARCHAR(50),
    status INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tblcity (
    CityID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tblbarangay (
    BarangayID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    CityID INT,
    FOREIGN KEY (CityID) REFERENCES tblcity(CityID)
);

CREATE TABLE IF NOT EXISTS tblhaircuts (
    haircutsID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS hairstyle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_link VARCHAR(2048),
    text_link VARCHAR(2048)
);

CREATE TABLE IF NOT EXISTS tblcategory (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tblservices (
    ServicesID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    CategoryID INT,
    FOREIGN KEY (CategoryID) REFERENCES tblcategory(CategoryID)
);

CREATE TABLE IF NOT EXISTS tblemployeetype (
    EmployeeTypeID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tblsalarytype (
    SalaryTypeID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tblcustomers (
    CustomersID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    contact VARCHAR(50),
    RedTag INT DEFAULT 0,
    status INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tblshop (
    ShopID INT AUTO_INCREMENT PRIMARY KEY,
    shopName VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    shopContact VARCHAR(50),
    cityID INT,
    barangayID INT,
    street VARCHAR(255),
    appStatus INT DEFAULT 0,
    imgpath VARCHAR(255),
    imgfilename VARCHAR(255),
    status INT DEFAULT 1,
    FOREIGN KEY (cityID) REFERENCES tblcity(CityID),
    FOREIGN KEY (barangayID) REFERENCES tblbarangay(BarangayID)
);

CREATE TABLE IF NOT EXISTS tblshopownership (
    ownerID INT,
    shopID INT,
    PRIMARY KEY (ownerID, shopID),
    FOREIGN KEY (ownerID) REFERENCES tblowner(OwnerID),
    FOREIGN KEY (shopID) REFERENCES tblshop(ShopID)
);

CREATE TABLE IF NOT EXISTS tblshopapplication (
    ShopApplicationID INT AUTO_INCREMENT PRIMARY KEY,
    bir_img VARCHAR(255),
    bir_fileName VARCHAR(255),
    bp_img VARCHAR(255),
    bp_fileName VARCHAR(255),
    shopID INT,
    ownerID INT,
    FOREIGN KEY (shopID) REFERENCES tblshop(ShopID),
    FOREIGN KEY (ownerID) REFERENCES tblowner(OwnerID)
);

CREATE TABLE IF NOT EXISTS tblshopservices (
    ShopServicesID INT AUTO_INCREMENT PRIMARY KEY,
    shopID INT,
    servicesID INT,
    price DECIMAL(10,2),
    duration INT,
    status INT DEFAULT 1,
    FOREIGN KEY (shopID) REFERENCES tblshop(ShopID),
    FOREIGN KEY (servicesID) REFERENCES tblservices(ServicesID)
);

CREATE TABLE IF NOT EXISTS tblshopschedules (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    Day VARCHAR(50),
    TimeIn TIME,
    TimeOut TIME,
    status INT DEFAULT 1,
    shopID INT,
    FOREIGN KEY (shopID) REFERENCES tblshop(ShopID)
);

CREATE TABLE IF NOT EXISTS tblemployee (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255),
    contact VARCHAR(50),
    employeeTypeID INT,
    salaryTypeID INT,
    salaryTypeValue DECIMAL(10,2),
    status INT DEFAULT 1,
    balance DECIMAL(10,2) DEFAULT 0.00,
    shopID INT,
    FOREIGN KEY (employeeTypeID) REFERENCES tblemployeetype(EmployeeTypeID),
    FOREIGN KEY (salaryTypeID) REFERENCES tblsalarytype(SalaryTypeID),
    FOREIGN KEY (shopID) REFERENCES tblshop(ShopID)
);

CREATE TABLE IF NOT EXISTS tblschedule (
    tblScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    employeeID INT,
    Date VARCHAR(50),
    TimeIn TIME,
    TimeOut TIME,
    dayStatus BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (employeeID) REFERENCES tblemployee(EmployeeID)
);

CREATE TABLE IF NOT EXISTS tblemployeespecialization (
    EmployeeSpecializationID INT AUTO_INCREMENT PRIMARY KEY,
    shopServicesID INT,
    employeeID INT,
    status INT DEFAULT 1,
    FOREIGN KEY (shopServicesID) REFERENCES tblshopservices(ShopServicesID),
    FOREIGN KEY (employeeID) REFERENCES tblemployee(EmployeeID)
);

CREATE TABLE IF NOT EXISTS tblappointment (
    AppointmentID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    WalkInName VARCHAR(255),
    CustomerName VARCHAR(255),
    CustomersID INT,
    ShopID INT,
    EmployeeID INT,
    ShopServicesID INT,
    TimeIn TIME,
    TimeOut TIME,
    Date DATE,
    AmountDue DECIMAL(10, 2),
    AppStatusID INT,
    AppointmentStatus VARCHAR(255),
    appointmentType VARCHAR(255),
    FOREIGN KEY (CustomersID) REFERENCES tblcustomers(CustomersID),
    FOREIGN KEY (ShopID) REFERENCES tblshop(ShopID),
    FOREIGN KEY (EmployeeID) REFERENCES tblemployee(EmployeeID),
    FOREIGN KEY (ShopServicesID) REFERENCES tblshopservices(ShopServicesID)
);

CREATE TABLE IF NOT EXISTS tbltransactions (
    transactionID VARCHAR(255) PRIMARY KEY,
    Date DATE,
    Time TIME,
    Street VARCHAR(255),
    Barangay VARCHAR(255),
    City VARCHAR(255),
    Contact VARCHAR(50),
    customerName VARCHAR(255),
    WalkIn VARCHAR(255),
    Service VARCHAR(255),
    Employee VARCHAR(255),
    Amount DECIMAL(10,2),
    ShopID INT,
    FOREIGN KEY (ShopID) REFERENCES tblshop(ShopID)
);

CREATE TABLE IF NOT EXISTS tblaccesstoken (
    token VARCHAR(255) PRIMARY KEY,
    userID INT,
    expiry DATETIME,
    userType VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS tblverificationtoken (
    token VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    expiry DATETIME
);
