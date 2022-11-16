const passport = require('passport');
const passportJWT = require('passport-jwt');
const db = require("../models");
const User = db.Users;
const JWT_SECRET = process.env.JWT_SECRET || 'wx:miniprogram-team-light:passport';

const JwtStrategy = passportJWT.Strategy
const ExtractJwt = passportJWT.ExtractJwt
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
}

module.exports = function () {
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        User.findByPk(jwt_payload.id)
            .then(user => {
                if (!user) {
                    return done(null, false);
                } else {
                    if (user.status === 'suspend') {
                        return done(null, false);
                    }
                    delete user.dataValues.password
                    return done(null, user);
                }
            }).catch(error => {
                return done(error);
            });
    }));
}