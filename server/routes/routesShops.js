const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()

const title = "Shops"

router.get('/',(req,res)=>{
    res.render('shops',{layout:'home-admin',title});
})

module.exports = router;