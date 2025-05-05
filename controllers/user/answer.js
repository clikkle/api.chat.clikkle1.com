import express from 'express';
import create from '../../routes/user/answer/create.js';
import fetch from '../../routes/user/answer/fetch.js';

const answerRouter = express.Router();

answerRouter.get('/', fetch);
answerRouter.post('/', create);

export default answerRouter;
