const constants = require("../config/constants");
const { downloadResource, toPagingData, getWxOpenId } = require('../utils/utility')
const db = require("../models");
const Task = db.Tasks;
const Team = db.Teams;
const Op = db.Sequelize.Op;

module.exports = {
    async createTask(req, res) {
        let { teamId, name, description, tags, userId, color } = req.body
        if (!teamId) throw new Error("未选择工作组！")
        if (!name) throw new Error("任务名称不能为空！")
        const creatorId = req.user.id
        const editorId = creatorId
        try {
            const team = await Team.findOne({
                where: { id: teamId }
            })
            if (!team) {
                return res.status(400).send({ message: `未找到工作组id=${id}.` });
            }
            const task = await Task.create({
                teamId, name, description, tags, userId, color,
                status: constants.task.status.pending,
                creatorId, editorId
            })
            return res.json(task)
        } catch (err) {
            res.status(400).json({ message: err.message || "创建任务失败！" })
        }
    },
    async findAllTasks(req, res) {
        try {
            const { terms, teamid, userid, status, pagesize = 20, pageindex = 1 } = req.query;
            const offset = pagesize * (pageindex * 1 - 1)
            let condition = {}
            if (terms) {
                condition.name = { [Op.like]: `%${name}%` }
            }
            if (teamid) {
                condition.teamId = parseInt(teamid)
            }
            if (userid) {
                condition.userId = parseInt(userid)
            }
            if (status) {
                condition.status = status
            }

            const total = await Task.count({ where: condition })
            const items = await Task.findAll({
                where: condition,
                order: [['id', 'DESC']],
                limit: parseInt(pagesize),
                offset: parseInt(offset),
            })
            const result = toPagingData(total, pageindex, pagesize, items)
            return res.json(result)
        } catch (err) {
            res.status(400).json({ message: err.message || "检索任务列表发生错误！" })
        }
    },
    async findTask(req, res) {
        const id = req.params.id;
        try {
            const task = await Task.findByPk(id)
            if (!task) {
                return res.status(404).send({ message: `未找到任务id=${id}.` });
            }
            return res.json(task)
        } catch (err) {
            return res.status(500).json({ message: "检索任务时出错id=" + id })
        }
    },
    async updateTask(req, res) {
        const id = req.params.id
        let { name, description, tags, userId, color } = req.body
        
        if (!name) throw new Error("任务名称不能为空！")

        try {
            const task = await Task.findByPk(id)
            if (!task) {
                return res.status(404).send({ message: `未找到任务id=${id}.` });
            }
            const updatedTask = await task.update({ name, description, tags, userId, color, updatedAt: new Date() })
            return res.json(updatedTask)
        } catch (err) {
            return res.status(500).json({ message: "更新任务时出错id=" + id })
        }
    },
    async deleteTask(req, res) {
        const id = req.params.id
        try {
            await Task.destroy({ where: { id: id } });
            return res.json({ success: true })
        } catch (err) {
            return res.status(400).json({ message: err.message || "删除任务时发生错误！" })
        }
    },
    async assignTask(req, res) {
        const id = req.params.id
        let { userId } = req.body
        if (!userId) throw new Error("未选择任务责任人！")
        try {
            const task = await Task.findByPk(id)
            if (!task) {
                return res.status(404).send({ message: `未找到任务id=${id}.` });
            }
            const updatedTask = await task.update({ userId, updatedAt: new Date() })
            return res.json(updatedTask)
        } catch (err) {
            return res.status(500).json({ message: "分配任务时出错id=" + id })
        }
    },
    async updateTaskColor(req, res) {
        const id = req.params.id
        let { color } = req.body
        try {
            const task = await Task.findByPk(id)
            if (!task) {
                return res.status(404).send({ message: `未找到任务id=${id}.` });
            }
            const updatedTask = await task.update({ color, updatedAt: new Date() })
            return res.json(updatedTask)
        } catch (err) {
            return res.status(500).json({ message: "更新任务等级时出错id=" + id })
        }
    },

    async updateStatus(req, res) {
        const id = req.params.id
        let { status } = req.body
        try {
            const task = await Task.findByPk(id)
            if (!task) {
                return res.status(404).send({ message: `未找到任务id=${id}.` });
            }
            const updatedTask = await task.update({ status, updatedAt: new Date() })
            return res.json(updatedTask)
        } catch (err) {
            return res.status(500).json({ message: "更新任务等级时出错id=" + id })
        }
    },

    async addTaskLog(req, res) {
        const id = req.params.id

        let { log, status } = req.body
        const userId = req.user.id
        const userName = req.user.name
        try {
            const task = await Task.findByPk(id)
            if (!task) {
                return res.status(404).send({ message: `未找到任务id=${id}.` });
            }
            let logs = task.logs || []
            logs.push({
                userId,
                userName,
                log,
                status,
                date: new Date()
            })

            const updatedTask = await task.update({ status, logs, updatedAt: new Date() })
            return res.json(updatedTask)
        } catch (err) {
            return res.status(500).json({ message: "添加任务日志出错id=" + id })
        }
    },

}