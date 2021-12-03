const express = require('express')
const router = express.Router()

router.route('/')
.get((req,res) => {
	res.send("Please ask Leela Banco Germany Campus for a homepage")
})

module.exports = router;
