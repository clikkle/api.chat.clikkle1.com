import express from 'express';

import step from '../../routes/user/onBoardingStep/step.js';

const onBoardingRouter = new express.Router();

//post

onBoardingRouter.get('/', step);

export default onBoardingRouter;
