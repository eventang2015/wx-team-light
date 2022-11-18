const db = require("../models");
const _ = require('lodash')
const Team = db.Teams;
const TeamUser = db.TeamUsers;
const User = db.Users;
const Op = db.Sequelize.Op;

module.exports = {
    async createTeam(req, res) {
        let { name, description, tags, color } = req.body
        if (!name) throw new Error("团队名称不能为空!")
        const creatorId = req.user.id
        const editorId = creatorId

        try {
            const team = await Team.create({ name, description, tags, color, creatorId, editorId })
            return res.json(team)
        } catch (err) {
            return res.status(400).json({ message: err.message || "创建团队失败！" })
        }
    },
    async findAllTeams(req, res) {
        try {
            const terms = req.query.terms;
            const condition = terms ? { name: { [Op.like]: `%${name}%` } } : null;

            const teams = await Team.findAll({ where: condition })
            return res.json(teams)
        } catch (err) {
            return res.status(500).json({ message: "检索工作组时出错！" })
        }

    },
    async findTeam(req, res) {
        const id = req.params.id;
        try {
            const team = await Team.findByPk(id)
            if (!team) {
                return res.status(404).send({ message: `未找到工作组id=${id}.` });
            }
            return res.json(team)
        } catch (err) {
            return res.status(500).json({ message: "检索工作组时出错id=" + id })
        }
    },
    async updateTeam(req, res) {
        const id = req.params.id
        let { name, description, tags, color } = req.body
        if (!name) throw new Error("团队名称不能为空!")
        try {
            const team = await Team.findByPk(id)
            if (!team) {
                return res.status(404).send({ message: `未找到工作组id=${id}.` });
            }
            const updatedTeam = await team.update({ name, description, tags, color , updatedAt: new Date()})
            return res.json(updatedTeam)
        } catch (err) {
            return res.status(500).json({ message: "更新工作组时出错id=" + id })
        }
    },
    async deleteTeam(req, res) {
        const id = req.params.id
        try {
            await Team.destroy({ where: { id: id } });
            await TeamUser.destroy({ where: { teamId: id } });
            return res.json({ success: true })
        } catch (err) {
            return res.status(400).json({ message: err.message || "删除工作组时发生错误！" })
        }
    },
    async addTeamUsers(req, res) {
        const id = req.params.id
        if (!req.body.userIds) throw new Error("未选中用户!")
        const userIds = req.body.userIds.trim().split(',')
        try {
            const team = await Team.findByPk(id)
            if (!team) {
                return res.status(404).send({ message: `未找到工作组id=${id}.` });
            }
            for (let i in userIds) {
                const existUser = await TeamUser.findOne({
                    where: { teamId: id, userId: userIds[i] }
                })
                if (existUser) {
                    throw new Error("已添加此用户！")
                }
                await TeamUser.create({ teamId: id, userId: userIds[i] })
            }
            return res.json({ success: true })
        }
        catch (err) {
            return res.status(400).json({ message: err.message || "添加组员时发生错误！" })
        }
    },
    async removeTeamUsers(req, res) {
        const id = req.params.id

        if (!req.body.userIds) throw new Error("未选中用户!")
        const userIds = req.body.userIds.trim().split(',')
        try {
            await TeamUser.destroy({ where: { teamId: id, userId: { [Op.in]: userIds } } })
            return res.json({ success: true })
        } catch (err) {
            return res.status(400).json({ message: err.message || "移除组员时发生错误！" })
        }

    },
    async getTeamUsers(req, res) {
        const id = req.params.id
        try {
            const teamUsers = await TeamUser.findAll({ order: [['isLeader', 'DESC']], where: { teamId: id }, })
            const userIds = teamUsers.map(i => i.userId)
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                where: { id: { [Op.in]: userIds } },
            })
            for (let i in teamUsers) {
                const user = _.find(users, { id: teamUsers[i].userId })
                teamUsers[i].dataValues.user = user
            }
            res.json(teamUsers)
        } catch (err) {
            return res.status(400).json({ message: err.message || "检索组员时发生错误！" })
        }

    },

    async addLeader(req, res) {
        const id = req.params.id
        if (!req.body.userIds) throw new Error("未选中用户!")
        const userIds = req.body.userIds.trim().split(',')
        try {
            const team = await Team.findByPk(id)
            if (!team) {
                return res.status(404).send({ message: `未找到工作组id=${id}.` });
            }
            for (let i in userIds) {
                await TeamUser.update({ isLeader: true }, { where: { teamId: id, userId: userIds[i] } })
            }
            return res.json({ success: true })
        }
        catch (err) {
            return res.status(400).json({ message: err.message || "设置组长时发生错误！" })
        }
    },
    async removeLeader(req, res) {
        const id = req.params.id
        if (!req.body.userIds) throw new Error("未选中用户!")
        const userIds = req.body.userIds.trim().split(',')
        try {
            const team = await Team.findByPk(id)
            if (!team) {
                return res.status(404).send({ message: `未找到工作组id=${id}.` });
            }
            for (let i in userIds) {
                await TeamUser.update({ isLeader: false }, { where: { teamId: id, userId: userIds[i] } })
            }
            return res.json({ success: true })
        }
        catch (err) {
            return res.status(400).json({ message: err.message || "设置组长时发生错误！" })
        }
    },
}