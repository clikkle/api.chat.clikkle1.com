import s3Client from '../libs/s3Client.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export default async function (req, res, next) {
    try {
        const fileKey = req.url.slice(1);
      
        const config = {
            Bucket: process.env.JOB_APPLICATION_BUCKET,
            Key: fileKey,
        };

        const command = new GetObjectCommand(config);
        const s3Object = await s3Client.send(command);

        s3Object.Body.pipe(res);
    } catch (err) {
        next(err);
    }
}
