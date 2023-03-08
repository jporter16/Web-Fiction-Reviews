const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  console.log("user,", process.env.EMAIL_USERNAME);
  console.log("password", process.env.PASS);
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      // service: process.env.SERVICE,
      // i'm taking the service line out because i don't understand it.
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;
