import axios from 'axios';
import https from 'https';
import User from '../../schema/User.js';
import SubscriptionSchema from '../../schema/Subscription.js';
import Employee from '../../schema/Employee.js';
import { signToken } from '../../utils/functions.js';
import { getCache, setCache } from '../../libs/cacheStore.js';

export default async function (req, res, next) {
    try {
        const { refreshToken, userId , userType } = req.body;

        let url = `${process.env.AUTH_SERVER}/api/auth/verify_login`
        const response = await axios.post(url, {
            refreshToken
        }, {
            httpsAgent: new https.Agent({ 
                rejectUnauthorized: false 
            })
        });

        if (response.data && response.data.success) {
            let { user } = response.data;
            if (String(user._id) == userId) {
                user.role =  'user'
                 if(userType ==='hr'){
                   const result = await SubscriptionSchema.findOne({ userId: userId, isActive: true })
                   if (result) {
                    user.role  =  'hr'
                   }
                 }
                 else if(userType ==='employee'){
                    const result = await Employee.findById(userId)
                    //console.log("result", result);
                    if (result && result.status==="Active") {
                        user.role  =  'employee'
                    }  
                }

                const token = signToken(user);
                let userKey =   'user-info-'+String(user._id)
                setCache(userKey, user);
                res.status(200).json({
                    success :  true ,
                    message: 'Session created successfully',
                    token,
                    user
                });
            }else {
                res.status(403).json({
                    success :  false ,
                    message: 'User not matched ',
                });
            }

        }else {
            res.status(response.status).json({
                message: response.data.message ?? "Internal server error",
                success: false,
            });

        }
    } catch (e) {
        console.log(e);
        next(e);
    }
}
