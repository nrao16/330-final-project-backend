const { Router } = require("express");
const bcrypt = require('bcrypt');
const router = Router();
const jwtToken = require('jsonwebtoken');

const userDAO = require('../daos/user');
const { isAuthorized } = require('./middleware/auth')

// signup with user email and password
router.post("/signup", async (req, res, next) => {
    const user = req.body;

    if (!user || JSON.stringify(user) === '{}' || !user.email || !user.password) {
        res.status(400).send('user email and password are required');
    } else {
        try {
            // check if a email is already associated with a user
            const userExists = await userDAO.getUserByEmail(user.email);

            if (userExists) {
                return res.status(409).send('User email already signed up.')
            } else {
                const hashedPassword = await bcrypt.hash(user.password, 4);
                // default role of 'user' is always added
                await userDAO.createUser({ email: user.email, password: hashedPassword.toString(), roles: ['user'] });
                return res.status(200).send(`Signed up user email ${user.email}`);
            }
        } catch (e) {
            next(e);
        }
    }
});

// login with email and password to get a jwt token
router.post("/", async (req, res, next) => {
    const user = req.body;

    if (!user || JSON.stringify(user) === '{}' || !user.email || !user.password) {
        return res.status(400).send('user email and password required');
    } else {
        try {
            const savedUser = await userDAO.getUserByEmail(user.email);

            if (!savedUser) {
                return res.status(401).send(`user with ${user.email} not found.`)
            }
            const isPasswordMatch = await bcrypt.compare(user.password, savedUser.password);

            if (isPasswordMatch) {
                // create a jwt token with user _id, and roles valid for 2 hours
                const token = jwtToken.sign({
                    _id: savedUser._id,
                    email: savedUser.email,
                    roles: savedUser.roles,
                }, 'secret', { expiresIn: "2h" });;

                return res.json({ token: token });
            } else {
                return res.status(401).send('Invalid password');
            }
        } catch (e) {
            next(e);
        }
    }
});

// update password with jwt token
router.post("/password", isAuthorized, async (req, res, next) => {
    const { password } = req.body;
    const decodedUser = req.user;

    if (!password) {
        res.status(400).send('password is required');
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 4);
            const updatedUser = await userDAO.updateUserPassword(decodedUser._id, hashedPassword.toString());
            if (updatedUser.matchedCount > 0) {
                res.status(200).send('Password updated');
            } else {
                res.status(401).send('Unable to update password');
            }
        } catch (e) {
            next(e);
        }
    }
});

module.exports = router;


