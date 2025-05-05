import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    name: 'clikkle.com',
    host: 'mail.clikkle.com',
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: 'hr@clikkle.com',
        pass: '!1c]dC&f3yUB',
    },
});

export default transporter;
