import s3Client from '../../libs/s3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const uploadsFolder = 'uploads';

const uploadFileToS3 = async function (filePath, fileName) {
   
    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
        Bucket: process.env.JOB_APPLICATION_BUCKET,
        Key: fileName,
        Body: fileStream,
    };

    const command = new PutObjectCommand(uploadParams);

    try {
        await s3Client.send(command);
       
        // Delete the file after successful upload
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder);
}

fs.watch(uploadsFolder, (eventType, fileName) => {
    if (eventType === 'rename') {
        const filePath = path.join(uploadsFolder, fileName);
        if (fs.existsSync(filePath)) {
            uploadFileToS3(filePath, fileName);
        }
    }
});

