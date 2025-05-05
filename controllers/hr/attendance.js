import express from 'express';
import overview from '../../routes/hr/attendance/overview.js';
import byUser from '../../routes/hr/attendance/byUser.js';
import leaves from '../../routes/hr/attendance/leaves.js';
import approveLeave from '../../routes/hr/attendance/approveLeave.js';
import createLeavesType from '../../routes/hr/attendance/createLeavesType.js';
import listAll from '../../routes/common/leaveType/listAll.js';
import editLeavesType from '../../routes/hr/attendance/editLeavesType.js';
import metricsByUser from '../../routes/hr/attendance/metricsByUser.js';
import dashboardOverview from '../../routes/hr/attendance/dashboardOverview.js';

import view from '../../routes/hr/attendance/view.js';
import recent from '../../routes/hr/attendance/recent.js';
import deleteLeaveTypes from '../../routes/hr/attendance/deleteLeaveTypes.js';

const attendanceRouter = express.Router();

attendanceRouter.get('/', overview);
attendanceRouter.get('/view', view);
attendanceRouter.get('/recent', recent);
attendanceRouter.get('/by-user', byUser);
attendanceRouter.get('/leaves', leaves);
attendanceRouter.get('/leaves-types', listAll);
attendanceRouter.get('/metrics-by-user/:employeeId', metricsByUser);
attendanceRouter.get('/overview', dashboardOverview);
attendanceRouter.get('/overview/:employeeId', dashboardOverview);

attendanceRouter.post('/leaves/approve/:leaveId', approveLeave('Approved'));
attendanceRouter.post('/leaves/deny/:leaveId', approveLeave('Rejected'));
 attendanceRouter.post('/leaves-type/', createLeavesType);

attendanceRouter.patch('/leaves-types/:id', editLeavesType);
attendanceRouter.delete('/leaves-types/:id', deleteLeaveTypes);

export default attendanceRouter;
