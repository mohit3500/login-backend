const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const register = async (req, res) => {
  const { username, password, email, profile } = req.body;

  const existUsername = await User.findOne({ username });
  if (existUsername)
    return res.status(409).json('Please use an unique username');

  const existEmail = await User.findOne({ email });
  if (existEmail) return res.status(409).json('Please use an unique email');

  const hashPass = bcrypt.hashSync(password, 10);

  try {
    const user = await User.create({
      username,
      password: hashPass,
      email,
      profile: profile || '',
    });
    return res.status(201).json({ msg: 'User created successfully', user });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json('No User Found');

  const verifyPass = bcrypt.compareSync(password, user.password);
  if (!verifyPass) return res.status(400).json('Password is wrong');

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.secretKey
  );
  try {
    res.status(201).json({ msg: 'Login Successful', user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getUser = async (req, res) => {
  const { username } = req.params;

  if (!username) return res.status(400).json({ msg: 'Invalid Username' });

  const user = await User.findOne({ username }).select('-password');
  if (!user) return res.status(400).json({ msg: 'No User Found' });

  try {
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.user;

  const body = req.body;

  const updatedUser = await User.updateOne({ _id: userId }, body);

  if (!updatedUser) return res.status(400).json({ msg: 'User Not Found' });

  const user = await User.findOne({ _id: userId });

  try {
    res.status(201).json({ msg: 'Record Updated', user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const generateOTP = async (req, res) => {
  req.app.locals.OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).json({ code: req.app.locals.OTP });
};

const verifyOTP = async (req, res) => {
  const { code } = req.body;
  if (parseInt(code) === parseInt(req.app.locals.OTP)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).json({ msg: 'Verify Successfully!' });
  }
  res.status(400).json({ msg: 'Invalid OTP!' });
};

const createResetSessions = async (req, res) => {
  if (req.app.locals.resetSession) {
    return res.status(201).json({ flag: req.app.locals.resetSession });
  }
  res.status(440).json({ error: 'Session expired' });
};

const resetPassword = async (req, res) => {
  if (!req.app.locals.resetSession)
    return res.status(440).json({ error: 'Session expired' });

  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: 'Username not found' });

  const hashPass = bcrypt.hashSync(password, 10);

  const updateUser = await User.updateOne(
    { username: user.username },
    { password: hashPass }
  );

  if (!updateUser) {
    req.app.locals.resetSession = false;
  }

  try {
    return res.status(201).json({ msg: 'Record Updated' });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  register,
  login,
  getUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSessions,
  resetPassword,
};
