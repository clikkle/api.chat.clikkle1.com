import express from 'express';
import create from '../../routes/user/jobApplication/create.js';
import upload from '../../libs/multer.js';

const jobApplicationRouter = new express.Router();

//post

jobApplicationRouter.post(
    '/',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'resume', maxCount: 1 },
    ]),
    create
);

export default jobApplicationRouter;
