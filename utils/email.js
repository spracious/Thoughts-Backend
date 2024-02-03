const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, code) {
    
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.code = code;
    this.from = `Box Street <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.MODE === "PROD") {
      // sendgrid
      return nodemailer.createTransport({
        service: "SendGrid",
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template

    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        code: this.code,
        subject,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: html,
      text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendSignupVerification() {
    await this.send("activate", "Activate Your Account!");
  }

  async sendForgotPassword() {
    await this.send("forgotpassword", "Forgot Password!");
  }
};

// const sendEmail = async options => {

//     const mailOptions = {
//         from: 'Box Street <alimipraisejoe@gmail.com'>,
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     await this.newTransport().sendEmail(mailOptions);
// }

// const sendEmail = async (options) => {
//   // 1) create a Transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: "Box Street <hello@jonas.io>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
