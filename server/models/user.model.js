module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        avatar: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        }
    });

    return User;
};