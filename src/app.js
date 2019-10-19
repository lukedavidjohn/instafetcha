const express = require("express");
const cors = require("cors");
const app = express();
const apiRouter = express.Router();
const { Instafetch } = require("./Instafetch.js");

const instafetch = new Instafetch();

apiRouter
  .route("/")
  .options(cors({ methods: ["GET", "OPTIONS", "POST"] }))
  .get(cors(), instafetch.instructions)
  .post(cors(), instafetch.appendCall)
  .all(instafetch.methodNotAllowed);

app.use(express.json());
app.use(apiRouter);

module.exports = { app };
