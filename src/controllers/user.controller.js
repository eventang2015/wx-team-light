const db = require("../models");
const bcrypt = require('bcrypt');
const generateJWT = require('../utils/jwt');
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
            // Save User in the database
            const user = await User.create({
                avatar: 'default.jpg',
                name: req.body.name,
                phone: req.body.phone,
                password: await bcrypt.hash(req.body.password, 10),
                status: constants.user.status.active,
                role: 999
            })
            if (user.dataValues.password)
                delete user.dataValues.password
            user.accessToken = await generateJWT(user)
            res.status(201).json({ user })

        } catch (err) {
            res.status(422).json({
                message: err.message || "创建用户时发生错误."
            })
        }
    },
    async signin(req, res) {
        // Validate request
        if (!req.body.phone) throw new Error("手机号码不能为空!")
        if (!req.body.password) throw new Error("密码不能为空!")

        try {
            const user = await User.findByPk(req.body.phone)

            if (!user) {
                res.status(401)
                throw new Error('没有此手机号码的用户')
            }
            const passwordMatch = await bcrypt.compare(req.body.password, user.password)
            if (!passwordMatch) {
                res.status(401)
                throw new Error('手机号或密码错误！')
            }

            if (user.password)
                delete user.password
            user.accessToken = await generateJWT(user)
            res.status(200).json({ user })

        } catch (err) {
            res.status(422).json({
                message: err.message || "用户登录时发生错误."
            })
        }
    },
    async getCurrent(req, res) {
        try {
            const user = req.user
            res.status(200).json({ user })

        } catch (err) {
            res.status(500).json({
                message: err.message || "Access Token not Found"
            })
        }
    },
    async findAll(req, res) {
        const terms = req.query.terms;
        const condition = terms ? { name: { [Op.like]: `%${terms}%` } } : null;

        User.findAll({ where: condition })
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });
    },
    async findOne(req, res) {
        const id = req.params.id;
        User.findByPk(id)
            .then(data => {
                if (data) {
                    res.send(data);
                } else {
                    res.status(404).send({
                        message: `未找到用户id=${id}.`
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error retrieving Tutorial with id=" + id
                });
            });
    },
    async update(req, res) {
        const id = req.params.id;
        User.update(req.body, {
            where: { id: id }
        })
            .then(num => {
                if (num == 1) {
                    res.send({
                        message: "Tutorial was updated successfully."
                    });
                } else {
                    res.send({
                        message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error updating Tutorial with id=" + id
                });
            })
    },
    async delete(req, res) {
        const id = req.params.id;
        User.destroy({
            where: { id: id }
        })
            .then(num => {
                if (num == 1) {
                    res.send({
                        message: "Tutorial was deleted successfully!"
                    });
                } else {
                    res.send({
                        message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Could not delete Tutorial with id=" + id
                });
            });
    },
}