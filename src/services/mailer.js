const nodemailer = require('nodemailer');

let transporter;

function initTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP not fully configured; mailer will noop');
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: port === '465' || false,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

async function send(mailOptions) {
  const t = initTransporter();
  if (!t) {
    console.log('Mailer noop; would send:', mailOptions);
    return;
  }
  return t.sendMail(mailOptions);
}

module.exports = { send };
