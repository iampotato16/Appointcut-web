const acu = require('../../AppointCutUtils')
const ModalConstructor = acu.ModalConstructor
const express = require('express')
const router = express.Router()
const mysql2 = require('mysql2/promise')

const title = "Customers"

router.route('/')
    .get(async (req, res) => {
        acu.startConnection();
        const rows = await acu.getAllFrom('appointcutdb.customer')
        res.render('customers', { layout: 'home-admin', title , rows});
    })
    .post(async (req, res) => {
        var {lastName, firstName, email, contact, guest, status} = req.body;
        if (guest == null){guest = 0}
        if (status == null) {status = 0}
        acu.startConnection()
        console.log(lastName, firstName, email, contact, guest, status)
        await acu.insertInto('tblcustomers (firstName, lastName, email, contact, isGuest, status)', '( "' + firstName + '", "' + lastName + '", "' + email + '", "' + contact + '", "' + guest + '", "' + status + '" )')
        res.redirect('/customers');
    })

router.get('/setInactive:id', async(req, res) => {
    var id = req.params.id; 
    acu.startConnection()
    await acu.updateSet('tblcustomers', 'status = 0', 'CustomersID = ' + id)
    res.redirect('/customers')
})

router.get('/setActive:id', async(req, res) => {
    var id = req.params.id; 
    acu.startConnection()
    await acu.updateSet('tblcustomers', 'status = 1', 'CustomersID = ' + id)
    res.redirect('/customers')
})

//edit
router.post('/edit:id', async(req, res) => {
    var {lastName, firstName, email, contact, guest, status} = req.body;
    if (guest == null){guest = 0}
    if (status == null) {status = 0}
    acu.startConnection()
    await acu.updateSet('tblcustomers', 'firstName = "' + firstName + '", lastName = "' + lastName + '", email = "' + email + '", contact = "' + contact + '", isGuest = "' + guest + '", status = "' + status + '"', 'CustomersID = ' + req.params.id )      
    res.redirect('/customers');
}) 

//views
router.get('/view:id', async (req, res) => {
    acu.startConnection();
    const row1 = await acu.getAllFromWhere('appointcutdb.customer', 'CustomersID = ' + req.params.id)
    const rowCust = row1[0]
    const rowAppt = await acu.getAllFromWhere('appointcutdb.appointment', 'CustomersID = ' + req.params.id)
    var title = rowCust.FullName    
    res.render('customersView', {layout: 'home-admin', title: title, rowCust, rowAppt})
})



module.exports = router;


