const Sequelize = require("sequelize");
// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

const sequelize = new Sequelize("team_light", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql",
});
// const sequelize = new Sequelize("team_light", 'root', 'Test123!', {
//   host: 'localhost',
//   port: '3306',
//   dialect: "mysql",
// });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Users = require("./user.model.js")(sequelize, Sequelize);
db.Teams = require("./team.model.js")(sequelize, Sequelize);
db.TeamUsers = require("./team.user.model.js")(sequelize, Sequelize);
db.Tasks = require("./task.model.js")(sequelize, Sequelize);

module.exports = db;