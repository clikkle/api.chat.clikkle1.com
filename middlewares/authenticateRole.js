import Jwt from 'jsonwebtoken';
function authenticateRole(role) {
    return async function (req, res, next) {
        try {
            const user = req.user;
            let userId  =   String(user.id)
            req.user.id =  userId;

            // if (user.role !== role) {
            //     Error.throw('You are not allowed to view this resource', 403);
            // }
            // req.orgId = "666fc89dc53c1dde21a36a73"

            if(role =='hr'){
                const path = req.path;
                if ( !path.startsWith('/organization')) {
                    if (!typeof req.headers['org-token'] === 'string') return Error.throw('org Invalid token' , 403);
                    const token = req.headers['org-token'];
                    if (!token) return Error.throw('JWT must be provided', 403);
                    const org = Jwt.verify(token, process.env.JWT_SECRET);
                    req.orgId = org.id;
                    // console.log("req.orgId" , org )
                }
            }
  
            next();
        } catch (e) {
            console.log(e);
            res.status(403).error(String( e?.message) );
        }
    };
}
export default authenticateRole;