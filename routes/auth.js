const express = require('express');

const authController = require('../controllers/auth');

const isAuth = require('../middleware/authjwt');

const router = express.Router();



router.post('/signup', authController.signup);

router.post('/active',isAuth.verifyToken ,authController.active);

router.post('/login', authController.login);

router.post('/edit',isAuth.verifyToken ,authController.edit);

router.post('/forgot',authController.forgot);

router.post('/checkCode',isAuth.verifyTokenShort ,authController.checkVerCode);

router.post('/resetpass',isAuth.verifyTokenShort ,authController.resetpass);









module.exports = router;