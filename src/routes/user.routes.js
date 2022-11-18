const asyncHandler = require('express-async-handler')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', { session: false })
const role = require('../config/role');
const multer = require('multer')
const upload = multer({ inMemory: true });

module.exports = app => {
    const users = require("../controllers/user.controller.js");

    const router = require("express").Router();

    router.post("/signup", asyncHandler(users.signup));
    router.post("/signin", asyncHandler(users.signin));
    router.get('/current', requireAuth, asyncHandler(users.getCurrent))
    router.get("/", asyncHandler(users.findAll));
    router.get("/:id", asyncHandler(users.findOne));
    router.put("/:id", requireAuth, asyncHandler(users.updateProfile));
    router.delete("/:id", requireAuth, role.requireAdmin(), asyncHandler(users.delete));
    router.put('/avatar', requireAuth, upload.any(), asyncHandler(users.uploadAvatar))
    router.put('/:id/password', requireAuth, asyncHandler(users.updatePassword))
    router.post('/list/import', requireAuth, upload.any(), asyncHandler(users.import))
    router.get('/list/export', requireAuth, asyncHandler(users.export))

    router.get("/:id/teams", asyncHandler(users.getUserTeams));
    router.get("/:id/teams/:teamId/tasks", asyncHandler(users.getUserTasks));

    app.use('/api/users', router);
};