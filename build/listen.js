"use strict";

var _require = require("./app"),
    app = _require.app;

var port = process.env.PORT || 3000;

app.listen(port, function () {
  return console.log("listening on port " + port);
});
//# sourceMappingURL=listen.js.map