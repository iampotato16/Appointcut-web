const fs = require('fs');
const mysql = require('mysql2/promise');

async function testCycle() {
    console.log("=== AppointCut 1 Cycle Test ===");
    
    const db = await mysql.createConnection({
        host: '127.0.0.1', user: 'admin', password: 'admin', database: 'appointcutdb'
    });

    console.log("1. Simulating Shop Creation (Owner + Shop + Application + Ownership)...");
    const [ownerRes] = await db.query(`INSERT INTO tblowner (firstName, lastName, email, password, contact, status) VALUES ('Test', 'Owner', 'testowner@test.com', 'pass', '123456', 1)`);
    const ownerId = ownerRes.insertId;

    const [shopRes] = await db.query(`INSERT INTO tblshop (shopName, email, shopContact, cityID, barangayID, street, imgpath, imgfilename, appStatus) VALUES ('Test Shop', 'shop@test.com', '123456', 1, 1, 'Test St', 'path/img', 'img.jpg', 0)`);
    const shopId = shopRes.insertId;

    await db.query(`INSERT INTO tblshopownership (ownerID, shopID) VALUES (?, ?)`, [ownerId, shopId]);
    const [appRes] = await db.query(`INSERT INTO tblshopapplication (bir_img, bir_fileName, bp_img, bp_fileName, shopID, ownerID) VALUES ('path/bir', 'bir.jpg', 'path/bp', 'bp.jpg', ?, ?)`, [shopId, ownerId]);
    
    console.log("2. Simulating Admin Approving Shop...");
    // Admin approves shop sets appStatus=1 and adds schedules
    await db.query(`UPDATE tblshop SET appStatus = 1 WHERE ShopID = ?`, [shopId]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (let day of days) {
        await db.query(`INSERT INTO tblshopschedules (shopID, day, timeIn, timeOut, status) VALUES (?, ?, '08:00:00', '17:00:00', 1)`, [shopId, day]);
    }

    console.log("3. Owner Adds a Barber (Employee)...");
    const [empRes] = await db.query(`INSERT INTO tblemployee (firstName, lastName, email, password, contact, employeeTypeID, salaryTypeID, salaryTypeValue, status, shopID) VALUES ('Test', 'Barber', 'barber@test.com', 'pass', '123', 1, 1, 50, 1, ?)`, [shopId]);
    const empId = empRes.insertId;

    console.log("4. Owner Adds a Service...");
    // Assign serviceID 1 (Classic Fade) to the shop
    const [ssRes] = await db.query(`INSERT INTO tblshopservices (shopID, servicesID, price, duration, status) VALUES (?, 1, 150.00, 30, 1)`, [shopId]);
    const ssId = ssRes.insertId;

    console.log("5. Owner Assigns Barber to Service (Specialization)...");
    await db.query(`INSERT INTO tblemployeespecialization (shopServicesID, employeeID, status) VALUES (?, ?, 1)`, [ssId, empId]);

    console.log("6. Customer Books an Appointment...");
    // Direct HTTP request to the customerOnline route to test the logic
    const qs = require('querystring');
    try {
        const resp = await fetch('http://localhost:3000/customerOnline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: qs.stringify({
                shop: shopId,
                service: ssId,
                employee: empId,
                date: '2026-05-01',
                time: '10:00:00',
                name: 'Test Customer'
            })
        });
        console.log("HTTP Status:", resp.status);
    } catch(e) {
        console.error("HTTP POST Error:", e.message);
    }

    console.log("7. Verifying Appointment Insertion...");
    const [apptRes] = await db.query(`SELECT * FROM tblappointment WHERE ShopID = ?`, [shopId]);
    console.log("Appointments found:", apptRes.length);
    if(apptRes.length > 0) {
        console.log("Sample appointment:", apptRes[0]);
    }

    await db.end();
}

testCycle().catch(console.error);
