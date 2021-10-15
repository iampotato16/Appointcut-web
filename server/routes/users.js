const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// Routes
// router.get('/', userController.view);
// router.post('/', userController.find);
// router.get('/adduser', userController.form);
// router.post('/adduser', userController.create);
// router.get('/edituser/:id', userController.edit);
// router.post('/edituser/:id', userController.update);
// router.get('/viewuser/:id', userController.viewall);
// router.get('/:id', userController.delete);/

router.get('/login', userController.viewLogin);
router.post('/login', userController.login);
router.get('/file-maintenance', userController.viewFileMaintenance);

module.exports = router;//