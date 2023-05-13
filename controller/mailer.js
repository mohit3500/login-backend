const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

let mailConfig = {
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.emailUser,
    pass: process.env.emailPass,
  },
};

let transporter = nodemailer.createTransport(mailConfig);

let MailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Mailgen',
    link: 'https://mailgen.js/',
  },
});

const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  var email = {
    body: {
      name: username,
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);
  let message = {
    from: process.env.emailUser,
    to: userEmail,
    subject: subject || 'SignUp successful',
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res
        .status(201)
        .json({ msg: 'You should receive an email from us.' });
    })
    .catch((error) => {
      res.status(400).send(error.message);
    });
};

module.exports = registerMail;
