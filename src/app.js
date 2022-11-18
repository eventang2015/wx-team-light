const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = morgan("tiny");
const passport = require('passport')

const { notFound, errorHandler } = require('./config/errorHandler')

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

require('./config/passport')(app)
app.use(passport.initialize())

app.get("/", async (req, res) => {
  res.json({ message: "Welcome to Team Light application." });
});


// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

require("./routes/user.routes")(app);
require("./routes/team.routes")(app);
require("./routes/task.routes")(app);

app.use(notFound)
app.use(errorHandler)

// const port = process.env.PORT || 3000; // local
const port = process.env.PORT || 80; // prod

async function bootstrap() {
  const db = require("./models");
  await db.sequelize.sync({ force: true }); // drop and resync db
  // await db.sequelize.sync();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
