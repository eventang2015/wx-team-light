const asyncHandler = require('express-async-handler')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', { session: false })
const role = require('../config/role');

module.exports = app => {
    const users = require("../controllers/user.controller.js");

    const router = require("express").Router();

    // Register a new user
    router.post("/signup", asyncHandler(users.signup));
    router.post("/signin", asyncHandler(users.signin));
    router.get('/current', requireAuth, asyncHandler(users.getCurrent))
    // Retrieve all users
    router.get("/", asyncHandler(users.findAll));

    // // Retrieve all published Tutorials
    // router.get("/published", tutorials.findAllPublished);

    // Retrieve a single User with id
    router.get("/:id", asyncHandler(users.findOne));

    // Update a User with id
    router.put("/:id", asyncHandler(users.update));

    // Delete a User with id
    router.delete("/:id", requireAuth, role.requireAdmin(), asyncHandler(users.delete));

    // // Delete all Tutorials
    // router.delete("/", tutorials.deleteAll);

    app.use('/api/users', router);
};