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
router.post('/editBrgy/:id', userController.editBrgy);
router.get('/:id', userController.removeBrgy);

module.exports = router;//