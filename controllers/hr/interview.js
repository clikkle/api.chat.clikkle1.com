import express from 'express';
import send from '../../routes/hr/interview/send.js';

const interviewRouter = new express.Router();

// POST
interviewRouter.post('/', send);

export default interviewRouter;
