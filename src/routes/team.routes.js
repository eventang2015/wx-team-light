const asyncHandler = require('express-async-handler')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', { session: false })
const role = require('../config/role');

module.exports = app => {
    const teams = require("../controllers/team.controller.js");

    const router = require("express").Router();

    router.post("/", requireAuth, role.requireAdmin(), asyncHandler(teams.createTeam));
    router.get('/', asyncHandler(teams.findAllTeams))
    router.get("/:id", asyncHandler(teams.findTeam));
    router.put("/:id", requireAuth, role.requireAdmin(), asyncHandler(teams.updateTeam));
    router.delete("/:id", requireAuth, role.requireAdmin(), asyncHandler(teams.deleteTeam));

    router.post('/:id/users', requireAuth, role.requireAdmin(), asyncHandler(teams.addTeamUsers))
    router.delete('/:id/users', requireAuth, role.requireAdmin(), asyncHandler(teams.removeTeamUsers))
    router.get('/:id/users', requireAuth, asyncHandler(teams.getTeamUsers))

    router.put('/:id/users/leader', requireAuth, role.requireAdmin(), asyncHandler(teams.addLeader))
    router.delete('/:id/users/leader', requireAuth, role.requireAdmin(), asyncHandler(teams.removeLeader))

    app.use('/api/teams', router);
};