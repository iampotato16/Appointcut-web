const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()
const ModalConstructor = acu.ModalConstructor;

const title = "Barber Applications"

router.route('/')
   .get(async (req, res) => {
      await acu.startConnection();
      const rows = await acu.getAllFromWhere('tblowner', 'appstatusID = 0')
         .catch(err => {
            console.error("Error getting all from customer:" + err)
         });

      const mc = new ModalConstructor(title);
      mc.setAddAction("/barberApps");
      mc.setEditAction("/barberApps/edit");
      mc.addField("Owner ID", ModalConstructor.TYPE_TEXT, "", ModalConstructor.VISIBILITY_EDIT, "readonly");
      mc.addField("First Name", ModalConstructor.TYPE_TEXT);
      mc.addField("Last Name", ModalConstructor.TYPE_TEXT);
      mc.addField("Email", ModalConstructor.TYPE_EMAIL);
      mc.addField("contact"), ModalConstructor.TYPE_TEXT;
      mc.addField("password", ModalConstructor.TYPE_PASSWORD);

      const ownerModal = mc.construct();
      // res.json(rows)
      res.render('barberApps', { layout: 'home-admin', title, rows, ownerModal })
   })
   .post((req, res) => {
      res.json(req.body)
   })

router.post('/edit', (req, res) => {
   res.json(req.body)

})


module.exports = router;