import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const sendMail = async (Options) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Task Manager',
      link: 'https://eadbooks.in/',
    },
  });

  const emailText = mailGenerator.generatePlaintext(Options.mailgenContent);
  const emailHtml = mailGenerator.generate(Options.mailgenContent);

  //configuration smtp
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_HOST,
    port: process.env.MAIL_TRAP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });

  const mail = {
    from: 'mail.taskmanager@example.com', // sender address
    to: Options.email, // list of receivers
    subject: Options.subject, // Subject line
    text: emailText, // plain text body
    html: emailHtml, // html body
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.log('Error while sending email', error);
  }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to App ! We're very excited to have you on board.",
      
      action: {
        instructions: 'To get started with our App, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'verify your email',
          link: verificationUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
const emailRestPasswordMailGenContent = (username, resetPasswordUrl) => {
  return {
    body: {
      name: username,
      intro:
        'You have received this email because a password reset request for your account was received.',
      action: {
        instructions: 'Click the button below to reset your password',
        button: {
          color: '#DC4D2F', // Optional action button color
          text: 'Reset your password',
          link: resetPasswordUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const projectAssignMailGenContent = (username, assignedUrl) => {
  return {
    body: {
      name: username,
      intro: "You have been assigned to a new project",
      action: {
        instructions: 'Click the button below to access the project, pleae signup if you haven\'t. account already.',
        button: {
          color: '#DC4D2F', // Optional action button color
          text: 'Access the project',
          link: assignedUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
        }

export {
  sendMail,
  emailVerificationMailGenContent,
  emailRestPasswordMailGenContent,
  projectAssignMailGenContent
};
