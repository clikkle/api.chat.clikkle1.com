import Jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import Employee from '../schema/Employee.js';
async function authenticate(req, res, next) {
    try {

        if (!typeof req.headers.authorization === 'string') Error.throw('Invalid token');
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return Error.throw('JWT must be provided', 401);
        const user = Jwt.verify(token, process.env.JWT_SECRET);
         //console.log(user);
        req.user = user;
        req.user.id = new Types.ObjectId(user.id);
        const employeeData = await Employee.findOne({_id:req.user.id});
    if(employeeData)
      
        req.user.orgId=employeeData.adminId;
        next();
    } catch (e) {
        console.log(e);
        res.status(401).error( String(e?.message));
    }
}

export default authenticate;
