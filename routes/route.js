const { Router } = require('express');
const {
  register,
  login,
  getUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSessions,
  resetPassword,
} = require('../controller/userController');
const { auth } = require('../middleware/verify');
const registerMail = require('../controller/mailer');

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/verifyOTP').post(verifyOTP);
router.route('/registerMail').post(registerMail);

router.route('/user/:username').get(getUser);
router.route('/generateOTP').get(generateOTP);
router.route('/createResetSession').get(createResetSessions);

router.route('/update').put(auth, updateUser);
router.route('/resetPassword').put(resetPassword);

module.exports = router;
