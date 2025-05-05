import express from 'express';
import getProfile from '../../routes/employee/profile/getProfile.js';
import edit from '../../routes/employee/profile/edit.js';
import upload from '../../libs/multer.js';
import updatePic from '../../routes/employee/profile/updatePic.js';
import updateBank from '../../routes/employee/profile/updateBank.js';

const profileRouter = express.Router();

profileRouter.get('/:employeeId', getProfile);

profileRouter.patch('/:employeeId', edit);
profileRouter.patch('/:employeeId/bank', updateBank);
profileRouter.patch('/picture/:id', upload.single('photo'), updatePic);

export default profileRouter;
