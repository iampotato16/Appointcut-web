const express = require('express')
const { route } = require('./routesAppointments')
const router = express.Router()
const HairstyleRepository = require('../../../classes/repositories/HairstyleRepository')
const hr = new HairstyleRepository

//Path: /rest/hairstyles
router.route("/:id")
.get(async (req, res) => {
    const hairstyle = await hr.get(req.params.id)
    console.log(`Hairstyle ID: ${req.params.id}`)
    console.log(JSON.stringify(hairstyle))
    res.json(hairstyle)
})

//Path: /rest/hairstyles
router.route("/")
.get(async (req,res) =>{
    const list = await hr.getAll()
    console.log(JSON.stringify(list))
    res.json(list);
})


module.exports = router