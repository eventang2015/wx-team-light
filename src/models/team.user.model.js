const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const TeamUser = sequelize.define("team_users", {
        teamId: {
            type: DataTypes.INTEGER
        },
        userId: {
            type: DataTypes.INTEGER,
        },
        isLeader: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    });

    return TeamUser;
};