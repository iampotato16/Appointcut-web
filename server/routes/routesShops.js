const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()
const ModalConstructor = acu.ModalConstructor;

const title = "Shops"

router.route('/')
 .get(async (req,res)=>{
    await acu.startConnection();
    const rows = await acu.getAllFrom('tblshop')
        .catch(err => {
            console.error("Error getting all from customer:" + err)
        });
    // const rows = [{
    //     "ID":1,
    //     "ownerID":12,
    //     "shopName":"Ang Bohok",
    //     "longitude":12.42,
    //     "latitude":135.63,
    //     "address":"Your moms house",
    //     "contact":"099912412",
    //     "email":"mamamo@gmail.com",
    //     "barangayID":2,
    //     "cityID":3
    // }]

    const mc = new ModalConstructor(title);
    mc.setAddAction('/shops');
    mc.setEditAction('/shops/edit');
    mc.addField("Shop ID",ModalConstructor.TYPE_TEXT,"",ModalConstructor.VISIBILITY_EDIT,"readonly")
    mc.addField("Shop Name",ModalConstructor.TYPE_TEXT);
    mc.addField("Owner ID",ModalConstructor.TYPE_TEXT);
    mc.addField("Longitude",ModalConstructor.TYPE_TEXT);
    mc.addField("Latitude",ModalConstructor.TYPE_TEXT);
    mc.addField("Address",ModalConstructor.TYPE_TEXT);
    mc.addField("Contact",ModalConstructor.TYPE_TEXT);
    mc.addField("E-mail",ModalConstructor.TYPE_EMAIL);
    mc.addField("Barangay ID",ModalConstructor.TYPE_TEXT);
    mc.addField("City ID",ModalConstructor.TYPE_TEXT);

    let shopsModal = mc.construct();
    // res.json(rows);
    res.render('shops',{layout:'home-admin',title,rows,shopsModal});
})
.post((req,res) => {
    res.json(req.body)
})

router.post("/edit", (req,res) =>{
    res.json(req.body)
})

module.exports = router;