const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

//LOGIN
router.get('/login', userController.viewLogin);
router.post('/login', userController.login);

//VIEW FILE MAINTENANCE
router.get('/file-maintenance', userController.viewFileMaintenance);

//BRGY
router.post('/addBrgy', userController.addBrgy);
router.get('/:id', userController.removeBrgy);
router.post('/editBrgy/:id', userController.editBrgy);


module.exports = router;//