const jwt = require('jsonwebtoken');
const userDAO = require('../../daos/user');

// check if user has admin role
const isAdmin = async (req, res, next) => {
    if (!req?.user?.roles?.includes('admin')) {
        return res.status(403).send('Not an admin user');
    }
    else {
        next();
    }
}

// middleware function to check for valid bearer token
const isAuthorized = async (req, res, next) => {
    const reqHeader = req?.headers?.authorization;
    const bearerToken = reqHeader?.indexOf('Bearer ') != -1 ? reqHeader?.substring(reqHeader?.indexOf('Bearer ') + 7) : "";

    if (!bearerToken) {
        return res.status(401).send('Bearer token required');
    } else {
        // get userId, email, roles from jwt token
        const decodedJwt = (jwt.decode(bearerToken));
        console.log(`decodedJwt - ${JSON.stringify(decodedJwt)}`);
         // check if has not expired and token has a valid user

         if (!decodedJwt || Date.now() >= decodedJwt.exp * 1000) {
            return res.status(401).send('Invalid Bearer token');
        }

        const userExists = await userDAO.getUserById(decodedJwt?._id);
        console.log(`userExists - ${JSON.stringify(userExists)}`)
        if(!userExists || !userExists._id ) {
            return res.status(401).send('Invalid User.');
        }
       
        else {
            req.user = { _id: userExists._id, email: userExists.email, roles: decodedJwt.roles };
            next();
        }
    }
};

module.exports = { isAuthorized, isAdmin };