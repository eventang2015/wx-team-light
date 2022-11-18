const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const Team = sequelize.define("teams", {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
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
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        editorId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    });

    return Team;
};