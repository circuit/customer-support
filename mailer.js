
const nodemailer = require('nodemailer');

// Use Smtp Protocol to send Email
const transporter = nodemailer.createTransport('smtps://circuitfinance01%40gmail.com:GoCircuit!@smtp.gmail.com');

/*
var transporter = nodemailer.createTransport("SMTP",{
  host: "smtp.gmail.com",
  secureConnection: false,
  port: 587,
  requiresAuth: true,
  domains: ["gmail.com", "googlemail.com"],
  auth: {
    user: "circuitfinance01@gmail.com",
    pass: "GoCircuit!"
  }
});
*/



function send(to, msg) {
  var mail = {
      from: 'Circuit Customer Support <no-reply@circuit.com>',
      to: 'rurscheler@gmail.com',
      subject: "Send Email Using Node.js",
      text: "Node.js New world for me",
      html: "<b>Node.js New world for me</b>"
  }

  transporter.sendMail(mail, (error, response) => {
      if (error) {
          console.log(error);
          return;
      }
      console.log('Email sent to ' + mail.to);
  });
}

module.exports = {
  send
}