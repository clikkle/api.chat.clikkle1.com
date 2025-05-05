import { SESv2Client } from '@aws-sdk/client-sesv2';

const config = { region: 'us-east-1' };

const client = new SESv2Client(config);

export default client;
