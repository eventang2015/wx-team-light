const asyncHandler = require('express-async-handler')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', { session: false })
const role = require('../config/role');

module.exports = app => {
    const tasks = require("../controllers/task.controller.js");

    const router = require("express").Router();

    router.post("/", requireAuth, role.requireAdmin(), asyncHandler(tasks.createTask));
    router.get('/', asyncHandler(tasks.findAllTasks))
    router.get("/:id", asyncHandler(tasks.findTask));
    router.put("/:id", requireAuth, role.requireAdmin(), asyncHandler(tasks.updateTask));
    router.delete("/:id", requireAuth, role.requireAdmin(), asyncHandler(tasks.deleteTask));

    router.post('/:id/assign', requireAuth, asyncHandler(tasks.assignTask))
    router.post('/:id/color', requireAuth, asyncHandler(tasks.updateTaskColor))
    router.put('/:id/status', requireAuth, asyncHandler(tasks.updateStatus))
    router.post('/:id/logs', requireAuth, asyncHandler(tasks.addTaskLog))

    app.use('/api/tasks', router);
};