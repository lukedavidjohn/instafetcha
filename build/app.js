"use strict";

var express = require("express");
var cors = require("cors");
var app = express();
var apiRouter = express.Router();

var _require = require("./Instafetch.js"),
    Instafetch = _require.Instafetch;

var instafetch = new Instafetch();

apiRouter.route("/").options(cors({ methods: ["GET", "OPTIONS", "POST"] })).get(cors(), instafetch.instructions).post(cors(), instafetch.appendCall).all(instafetch.methodNotAllowed);

app.use(express.json());
app.use(apiRouter);

module.exports = { app: app };
//# sourceMappingURL=app.js.map