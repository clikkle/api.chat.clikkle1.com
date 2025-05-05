import express from 'express';
import create from '../../routes/hr/notice/create.js';
import fetch from '../../routes/hr/notice/fetch.js';
import update from '../../routes/hr/notice/update.js';
import _delete from '../../routes/hr/notice/delete.js';
import fetchbyId from '../../routes/hr/notice/fetchbyId.js'

const noticeRouter = express.Router();

noticeRouter.get('/', fetch);
noticeRouter.get('/:noticeId', fetchbyId);

noticeRouter.post('/', create);

// Patch
noticeRouter.patch('/:noticeId', update);

// Delete
noticeRouter.delete('/:noticeId', _delete);

export default noticeRouter;
