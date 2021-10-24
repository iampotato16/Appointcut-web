const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()
const ModalConstructor = acu.ModalConstructor;

const title = "Owners"

router.route('/')
.get(async(req,res) => {
    await acu.startConnection();
    const rows = await acu.getAllFrom('tblowner')
        .catch(err => {
            console.error("Error getting all from customer:" + err)
        });
    // const rows = [{
    //     ID:2,
    //     givenName:"Zeraora",
    //     familyName:"Nominos",
    //     email:"NZora@gmail.com",
    //     contact:"09992415",
    //     password:"we really shouldnt be showing this"
    // }]

    const mc = new ModalConstructor(title);
    mc.setAddAction("/owners");
    mc.setEditAction("/owners/edit");
    mc.addField("Owner ID",ModalConstructor.TYPE_TEXT,"",ModalConstructor.VISIBILITY_EDIT,"readonly");
    mc.addField("given Name",ModalConstructor.TYPE_TEXT);
    mc.addField("family Name",ModalConstructor.TYPE_TEXT);
    mc.addField("e-mail",ModalConstructor.TYPE_EMAIL);
    mc.addField("contact"),ModalConstructor.TYPE_TEXT;
    mc.addField("password",ModalConstructor.TYPE_PASSWORD);

    const ownerModal = mc.construct();
    // res.json(rows)
    res.render('owners',{layout:'home-admin',title,rows, ownerModal})
})
.post((req,res) => {
    res.json(req.body)
})

router.post('/edit', (req,res) => {
    res.json(req.body)

})


module.exports = router;