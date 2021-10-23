const express = require('express');
const router = express.Router();

//LOGIN
router.route('/')
   .get((req, res) => {
      var title = "Create an Account"
      res.render('signup', { layout: 'main', title });
   })
   .post(async (req, res) => {
      console.log('i post')
   })

module.exports = router;

