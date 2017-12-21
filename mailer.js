const nodemailer = require('nodemailer');
const config = require('./config.json');

let smtpTransport = nodemailer.createTransport(config.email.nodemailer);

function sendInitialMsg(complaint) {
  send({
      from: config.email.sender, // This will not work with gmail. The email from auth will be used.
      to: complaint.customer.email,
      subject: 'Customer Complaint accepted',
      html: `Hi ${complaint.customer.name},<br><br>Thank you for contacting us. We will get back to you within 24 hours.<br>You can view the conversation or post additional messages at <a href=\"${config.host}/complaint/?id=${complaint.complaintId}\">here</a>.<br><br>Company xyz`
  });
}

function sendUpdate(complaint, msg, complaintId) {
  send({
      from: config.email.sender, // This will not work with gmail. The email from auth will be used.
      to: complaint.customer.email,
      subject: 'Customer Support has replied',
      html: `Hi ${complaint.customer.name},<br><br>Your complaint has been updated.<br><br><i>${msg}</i><br><br>You can also view the whole conversation <a href=\"${config.host}/complaint/?id=${complaintId}\">here</a>.<br><br>Company xyz`
  });
}

function send(mail) {
  smtpTransport.sendMail(mail, (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent to ' + mail.to);
      }
  });
  smtpTransport.close();
}

module.exports = {
  sendInitialMsg,
  sendUpdate
}