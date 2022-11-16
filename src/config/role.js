const _ = require("lodash");
const constants = require('./constants');

const role = {
    admin: { name: 'admin', id: 999 },
    user: { name: 'user', id: 0 },
    manager: { name: 'merchant', id: 1 },
}

let roles = {
    admin: {
        id: 999,
        can: []
    },
    user: {
        id: 0,
        can: []
    },
    manager: {
        id: 1,
        can: [
        ]
    },
}

function isAdmin(roleObj) {
    return roleObj === roles.admin.id
}
function isManager(roleObj) {
    return roleObj === roles.manager.id
}

function can(role, operation) {
    if (isAdmin(role))
        return true

    let matchingRole = _.filter(roles, function (o) { return o.id === role; });

    return matchingRole[0] && matchingRole[0].can.indexOf(operation) !== -1;
}

function userCan(operation) {
    return [function (req, res, next) {
        const userRole = req.user.role;

        // if ((userRole === roles.user.id || userRole === roles.token_admin.id)
        //     && (operation === constants.operations.USERS_DETAIL && req.user.key === req.params.key)) {
        //     return next()
        // }

        if (can(userRole, operation)) {
            return next()
        }

        return res.sendStatus(401);

    }]
}

module.exports = {
    requireAdmin: function () {
        return [function (req, res, next) {
            if (req.user.role == roles.admin.id) {
                next();
            } else {
                return res.sendStatus(401);
            }
        }];
    },
    requireManager: function () {
        return [function (req, res, next) {
            if (req.user.role == roles.admin.id || req.user.role == roles.merchant.id) {
                next();
            } else {
                return res.sendStatus(401);
            }
        }];
    },

    requireOwner: function (section) {
        return [function (req, res, next) {
            if (req.user.role == roles.admin.id) {
                return next();
            } else {
                if (section == 'users') {
                    if (req.user.id == req.params.id || can(req.user.role, constants.operations.update_profile)) {
                        return next();
                    }
                }
                return res.sendStatus(401);
            }
        }];
    },
    isAdmin,
    isManager,
    can,
    userCan,
    role
}
