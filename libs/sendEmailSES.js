
import AWS from'aws-sdk';
// Configure the AWS SDK with your credentials and region
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});
// Create an SES object
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

const sendSESEmail = async ( { from,   to,  subject, html  }) => {

    // Define email parameters
    const params = {
        Destination: {
            ToAddresses: [to ] // dynamic recipient
        },
        Message: {
            Body: {
                Html: { Data: html }
            },
            Subject: { Data: subject }
        },
        Source: from // dynamic sender
    };

    // Send the email
    ses.sendEmail(params, (err, data) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent successfully:', data);
        }
    });
};

// Function to verify an email address
const verifyEmailAddressSES = async(email) => {
    const params = {
        EmailAddress: email
    };

    ses.verifyEmailIdentity(params, (err, data) => {
        if (err) {
            console.error('Error verifying email address:', err);
        } else {
            console.log('Verification email sent to:', email);
        }
    });
};

export { sendSESEmail  , verifyEmailAddressSES}
