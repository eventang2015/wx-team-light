const db = require("../models");
const bcrypt = require('bcrypt');
const { generateJWT } = require('../utils/jwt');
const { downloadResource } = require('../utils/utility')
const constants = require('../config/constants')
const User = db.Users;
const Op = db.Sequelize.Op;

module.exports = {
    async signup(req, res) {
        // Validate request
        if (!req.body.phone) throw new Error("手机号码不能为空!")
        if (!req.body.name) throw new Error("姓名不能为空!")
        if (!req.body.password) throw new Error("密码不能为空!")

        try {
            const existUser = await User.findOne({
                where: {
                    phone: req.body.phone
                }
            })
            if (existUser) {
                throw new Error("手机号码已注册！")
            }

            // Save User in the database
            const user = await User.create({
                avatar: 'default.jpg',
                name: req.body.name.trim(),
                phone: req.body.phone.trim(),
                password: await bcrypt.hash(req.body.password.trim(), 10),
                status: constants.user.status.active,
                role: 999
            })

            if (user) {
                if (user.dataValues.password)
                    delete user.dataValues.password
                user.dataValues.accessToken = await generateJWT(user)
                res.status(201).json(user)
            } else {
                res.status(400).json({ message: '注册失败！' })
            }

        } catch (err) {
            res.status(422).json({ message: err.message || "创建用户时发生错误。" })
        }
    },
    async signin(req, res) {
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

            delete user.dataValues.password
            user.dataValues.accessToken = await generateJWT(user)
            res.json(user)

        } catch (err) {
            res.status(422).json({
                message: err.message || "用户登录时发生错误。"
            })
        }
    },
    async getCurrent(req, res) {
        try {
            const user = req.user
            res.json(user)

        } catch (err) {
            res.status(500).json({
                message: err.message || "Access Token not Found"
            })
        }
    },
    async findAll(req, res) {
        const terms = req.query.terms;
        const condition = terms ? { name: { [Op.like]: `%${terms}%` } } : null;

        const users = await User.findAll({ attributes: { exclude: ['password'] }, where: condition })
        res.json(users)

    },
    async findOne(req, res) {
        const id = req.params.id;
        const user = await User.findByPk(id)
        delete user.dataValues.password
        res.json(user)
    },
    async update(req, res) {
        const id = req.params.id;
        await User.update({ name: req.body.name }, { where: { id: id } })
        res.json({ success: true })
    },
    async delete(req, res) {
        const id = req.params.id;
        await User.destroy({ where: { id: id } })
        res.json({ success: true })
    },

    async uploadAvatar(req, res) {

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

                            return { line: line, status: '导入成功。', email: email, code: codeRes.code }
                        } catch (e) {
                            errorCount += 1
                            return { line: line, status: '发生错误', error: e }
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
            { label: 'Id', value: 'id' },
            { label: 'Name', value: 'name' },
            { label: 'Phone', value: 'phone' },
            { label: 'Status', value: 'status' },
            { label: 'Role', value: 'role' },
            { label: 'CreatedAt', value: 'createdAt' }
        ]
        return downloadResource(res, 'users.csv', fields, users)
    },
}