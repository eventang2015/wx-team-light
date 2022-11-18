const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const Task = sequelize.define("tasks", {
        teamId: {
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // 任务人ID
        userId: {
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
        status: {
            type: DataTypes.ENUM,
            values: ['pending', 'inProgress', 'completed']
        },
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        editorId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        logs: {
            type: DataTypes.JSON,
            allowNull: true
        },
    });

    return Task;
};