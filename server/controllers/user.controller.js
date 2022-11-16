const db = require("../models");
const User = db.Users;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        // Validate request
        if (!req.body.name) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }

        // Create a Tutorial
        const user = {
            avatar: 'default.jpg',
            name: req.body.name,
            phone: req.body.phone,
            password: '123'
        };

        // Save Tutorial in the database
        await User.create(user)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Tutorial."
                });
            });
    },
    async findAll(req, res) {
        const name = req.query.name;
        var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

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
    }
}