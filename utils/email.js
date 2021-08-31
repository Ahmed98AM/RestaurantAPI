const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //// Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //// Define the email options
  const mailOptions = {
    from: 'Amedo Plaze <amedo@yahoo.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  ////send the email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
