import express from 'express';
import listingCreate from '../../routes/hr/jobListing/create.js';
import listingFetch from '../../routes/hr/jobListing/fetch.js';
import listingDelete from '../../routes/hr/jobListing/delete.js';
import listingUpdate from '../../routes/hr/jobListing/update.js';
import changeOrder from '../../routes/hr/jobListing/changeOrder.js';
import getAll from '../../routes/hr/jobListing/getAll.js';
const jobListingRouter = new express.Router();

//get
jobListingRouter.get('/', listingFetch);
jobListingRouter.get('/getAll', getAll);

jobListingRouter.get('/:id', listingFetch);

//post
jobListingRouter.post('/', listingCreate);

//delete
jobListingRouter.delete('/:id', listingDelete);

//patch
jobListingRouter.patch('/order', changeOrder);
jobListingRouter.patch('/:id', listingUpdate);

export default jobListingRouter;
