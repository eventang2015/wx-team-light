const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const Task = sequelize.define("tasks", {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // 任务人ID
        directorId: {
            type: DataTypes.INTEGER,
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true
        },
        logs: {
            type: DataTypes.JSON,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM,
            values: ['pending', 'inProgress', 'completed']
        },
    });

    return Task;
};