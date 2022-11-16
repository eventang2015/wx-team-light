const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const Team = sequelize.define("teams", {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        //负责人编号
        managerIds: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true
        },
    });

    return Team;
};