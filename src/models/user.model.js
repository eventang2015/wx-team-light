const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const User = sequelize.define("users", {
        phone: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.INTEGER,
            default: 0
        },
        password: {
            type: DataTypes.STRING
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
        },
        openId: {
            type: DataTypes.STRING,
            allowNull: true
        },
    });

    return User;
};