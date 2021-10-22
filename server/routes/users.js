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
router.get('/removeBrgy:id', userController.removeBrgy);
router.post('/editBrgy', userController.editBrgy);

//CATEGORY
router.post('/addCategory', userController.addCategory);
router.get('/removeCategory:id', userController.removeCategory);
router.post('/editCategory:id', userController.editCategory);

//SPECIALIZATION 
router.post('/addSpec', userController.addSpec);
router.get('/removeSpec:id', userController.removeSpec);
router.post('/editSpec:id', userController.editSpec);

//CITY
router.post('/addCity', userController.addCity);
router.get('/removeCity:id', userController.removeCity);
router.post('/editCity:id', userController.editCity);

//FACE SHAPE
router.post('/addFaceShape', userController.addFaceShape);
router.get('/removeFaceShape:id', userController.removeFaceShape);
router.post('/editFaceShape:id', userController.editFaceShape);

//HAIRCUT
router.post('/addHaircut', userController.addHaircut);
router.get('/removeHaircut:id', userController.removeHaircut);
router.post('/editHaircut:id', userController.editHaircut);

//SERVICES
router.post('/addServices', userController.addServices);
router.get('/removeServices:id', userController.removeServices);
router.post('/editServices:id', userController.editServices);

//USERTYPE -- nakacomment kasi di pa nagagawa 
// router.post('/addUserType', userController.addUserType);
// router.get('/removeUserType:id', userController.removeUserType);
// router.post('/editUserType:id', userController.editUserType);

module.exports = router;//