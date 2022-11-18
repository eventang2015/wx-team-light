const db = require("../models");
const bcrypt = require('bcrypt');
const { generateJWT } = require('../utils/jwt');
const { downloadResource, toPagingData, getWxOpenId } = require('../utils/utility')
const constants = require('../config/constants');
const role = require("../config/role");
const User = db.Users;
const TeamUser = db.TeamUsers;
const Task = db.Tasks;
const Team = db.Teams;
const Op = db.Sequelize.Op;

module.exports = {
    async signup(req, res) {
        // Validate request
        if (!req.body.phone) throw new Error("手机号码不能为空!")
        if (!req.body.name) throw new Error("姓名不能为空!")
        if (!req.body.password) throw new Error("密码不能为空!")
        const openId = await getWxOpenId(req)

        try {
            const existUser = await User.findOne({
                where: { phone: req.body.phone }
            })
            if (existUser) {
                throw new Error("手机号码已注册！")
            }

            const user = await User.create({
                avatar: 'default.jpg',
                name: req.body.name.trim(),
                phone: req.body.phone.trim(),
                password: await bcrypt.hash(req.body.password.trim(), 10),
                status: constants.user.status.active,
                role: 999,
                openId
            })

            if (user) {
                if (user.dataValues.password)
                    delete user.dataValues.password
                user.dataValues.accessToken = await generateJWT(user)
                return res.status(200).json(user)
            } else {
                return res.status(400).json({ message: '注册失败！' })
            }

        } catch (err) {
            return res.status(422).json({ message: err.message || "创建用户时出错。" })
        }
    },
    async signin(req, res) {
        const openId = await getWxOpenId(req)
        // Validate request
        if (!req.body.phone) throw new Error("手机号码不能为空！")
        if (!req.body.password) throw new Error("密码不能为空！")

        try {
            const user = await User.findOne({
                where: {
                    phone: req.body.phone.trim()
                }
            })

            if (!user) {
                res.status(401)
                throw new Error('没有此手机号码的用户！')
            }
            const passwordMatch = await bcrypt.compare(req.body.password.trim(), user.password)
            if (!passwordMatch) {
                res.status(401)
                throw new Error('手机号或密码错误！')
            }
            await user.update({ openId, updatedAt: new Date() })
            delete user.dataValues.password
            user.dataValues.accessToken = await generateJWT(user)
            return res.json(user)

        } catch (err) {
            const status = res.statusCode ? res.statusCode : 500
            return res.status(status).json({ message: err.message || "用户登录时发生错误。" })
        }
    },
    async getCurrent(req, res) {
        try {
            const user = req.user
            return res.json(user)

        } catch (err) {
            return res.status(500).json({
                message: err.message || "Access Token not Found"
            })
        }
    },
    async findAll(req, res) {
        const { terms, pagesize = 20, pageindex = 1 } = req.query;
        try {
            const offset = pagesize * (pageindex * 1 - 1)
            let condition = null
            if (terms) {
                condition = { [Op.or]: [{ name: { [Op.like]: `%${terms}%` } }, { phone: { [Op.like]: `%${terms}%` } }] }
            }

            const total = await User.count({ where: condition })
            const items = await User.findAll({
                attributes: { exclude: ['password'] },
                where: condition,
                limit: parseInt(pagesize),
                offset: parseInt(offset),
            })

            const result = toPagingData(total, pageindex, pagesize, items)
            return res.json(result)
        } catch (err) {
            return res.status(400).json({ message: err.message || "检索用户列表发生错误！" })
        }
    },
    async findOne(req, res) {
        const id = req.params.id;
        try {
            const user = await User.findByPk(id)
            if (!user) {
                res.status(404).send({ message: `未找到用户id=${id}.` });
            }
            delete user.dataValues.password
            return res.json(user)
        } catch (err) {
            return res.status(500).json({ message: "检索用户时出错id=" + id })
        }
    },
    async updateProfile(req, res) {
        const id = req.params.id;
        if (!req.body.phone) throw new Error("手机号码不能为空!")
        if (!req.body.name) throw new Error("姓名不能为空!")

        if (!role.isAdmin(req.user.role) && req.user.id !== id) {
            throw new Error("未授权!")
        }
        try {
            const name = req.body.name.trim()
            const phone = req.body.phone.trim()
            const user = await User.findByPk(id)
            if (!user) {
                throw new Error("不存在此用户!")
            }
            if (user.phone !== phone) {
                const existUser = await User.findOne({
                    where: { phone: phone }
                })
                if (existUser) {
                    throw new Error("手机号码已注册！")
                }
            }
            const updatedUser = await user.update({ name: name, phone: phone, updatedAt: new Date() })
            delete updatedUser.dataValues.password
            return res.json(updatedUser)
        } catch (err) {
            return res.status(400).json({ message: err.message || "更新用户信息时发生错误。" })
        }

    },
    async delete(req, res) {
        const id = req.params.id;
        try {
            await User.destroy({ where: { id: id } })
            return res.json({ success: true })
        } catch (err) {
            return res.status(400).json({ message: err.message || "删除用户时发生错误。" })
        }

    },
    async uploadAvatar(req, res) {

    },

    async updatePassword(req, res) {
        if (!req.body.password) throw new Error("密码不能为空！")
        const id = req.params.id;
        if (!role.isAdmin(req.user.role) && req.user.id !== id) {
            throw new Error("未授权!")
        }
        try {
            const user = await User.findByPk(id)
            if (!user) {
                throw new Error("不存在此用户!")
            }
            const password = await bcrypt.hash(req.body.password.trim(), 10)
            await user.update({ password, updatedAt: new Date() })
            return res.json({ success: true })
        } catch (err) {
            return res.status(400).json({ message: err.message || "更新用户密码时发生错误。" })
        }
    },

    async import(req, res) {
        const files = req.files
        let totalCount = 0
        let successCount = 0
        let errorCount = 0
        let ignoreCount = 0
        const details = await Promise.all(
            files.map(async (file) => {
                const fileContents = Buffer.from(file.buffer)
                const lines = fileContents.toString().split('\r\n')
                if (lines.length < 2) {
                    return
                }
                return await Promise.all(
                    lines.map(async line => {
                        totalCount += 1
                        if (!line.length || line === 'name,phone,password') {
                            ignoreCount += 1
                            return { line: line, status: 'Ignored' }
                        }
                        const data = line.toString().split(',')
                        if (data.length < 3) {
                            ignoreCount += 1
                            return { line: line, status: 'Ignored' }
                        }
                        try {
                            const name = data[0].trim()
                            const phone = data[1].trim()
                            const password = data[2].trim()

                            const existUser = await User.findOne({
                                where: {
                                    phone: phone
                                }
                            })
                            if (existUser) {
                                ignoreCount += 1
                                return { line: line, status: '手机号码已注册。', phone }
                            }

                            const user = await User.create({
                                avatar: 'default.jpg',
                                name: name,
                                phone: phone,
                                password: await bcrypt.hash(password, 10),
                                status: constants.user.status.active,
                                role: 0
                            })
                            successCount += 1

                            return { line: line, status: '导入成功。' }
                        } catch (e) {
                            errorCount += 1
                            return { line: line, status: '发生错误', error: e.message }
                        }
                    })
                )
            })
        )
        const data = { totalCount, successCount, errorCount, ignoreCount, details }

        return res.json(data)
    },
    async export(req, res) {
        const users = await User.findAll({ attributes: { exclude: ['password'] } })
        const fields = [
            { label: '编号', value: 'id' },
            { label: '姓名', value: 'name' },
            { label: '手机号码', value: 'phone' },
            { label: '状态', value: 'status' },
            { label: '角色', value: 'role' },
            { label: '注册时间', value: 'createdAt' }
        ]
        return downloadResource(res, 'users.csv', fields, users)
    },

    async getUserTeams(req, res) {
        const id = req.params.id;
        try {
            const teamUsers = await TeamUser.findAll({ where: { userId: id }, })
            const teamIds = teamUsers.map(i => i.teamId)
            const teams = await Team.findAll({
                where: { id: { [Op.in]: teamIds } },
            })
            res.json(teams)
        } catch (err) {
            return res.status(500).json({ message: "检索用户所在工作组时出错id=" + id })
        }
    },

    async getUserTasks(req, res) {
        const id = req.params.id;
        try {
            const { terms, teamid, status, pagesize = 20, pageindex = 1 } = req.query;
            const offset = pagesize * (pageindex * 1 - 1)
            let condition = {
                userId: id
            }
            if (terms) {
                condition.name = { [Op.like]: `%${name}%` }
            }
            if (teamid) {
                condition.teamId = parseInt(teamid)
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
}