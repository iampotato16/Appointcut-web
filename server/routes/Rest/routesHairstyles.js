const express = require('express')
const { route } = require('./routesAppointments')
const router = express.Router()
const HairstyleRepository = require('../../../classes/repositories/HairstyleRepository')
const hr = new HairstyleRepository

router.route("/")
.get(async (req,res) =>{
    const list = await hr.getAll()
    console.log(JSON.stringify(list))
    res.json(list);
})


module.exports = router