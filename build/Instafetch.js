"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require("axios");
var _process$env = process.env,
    client_id = _process$env.client_id,
    client_secret = _process$env.client_secret,
    refresh_token = _process$env.refresh_token;

var Instafetch = function () {
  function Instafetch() {
    _classCallCheck(this, Instafetch);

    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateGSheetsAppendCallUrl = this.generateGSheetsAppendCallUrl.bind(this);
    this.appendCall = this.appendCall.bind(this);
    this.instructions = this.instructions.bind(this);
    this.methodNotAllowed = this.methodNotAllowed.bind(this);
  }

  _createClass(Instafetch, [{
    key: "generateAccessToken",
    value: function generateAccessToken() {
      return axios.post("https://oauth2.googleapis.com/token?client_id=" + client_id + "&client_secret=" + client_secret + "&refresh_token=" + refresh_token + "&grant_type=refresh_token");
    }
  }, {
    key: "generateGSheetsAppendCallUrl",
    value: function generateGSheetsAppendCallUrl(reqSpreadsheet, reqRange) {
      var spreadsheet = "1B05lCFpWSxkNA7kdQavjZa0VARlbx21D2TMkrGcp0Os";
      var range = "A1";
      if (reqSpreadsheet) spreadsheet = reqSpreadsheet;
      if (reqRange) range = reqRange;
      return "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheet + "/values/" + range + ":append?includeValuesInResponse=false&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=RAW";
    }
  }, {
    key: "appendCall",
    value: function appendCall(_ref, res) {
      var _this = this;

      var body = _ref.body,
          query = _ref.query;
      var LineHash = query.LineHash,
          AuthorProfile = query.AuthorProfile;
      var reqSpreadsheet = body.SpreadsheetId,
          reqRange = body.SpreadsheetRange;

      return axios.get("https://www.instagram.com/" + AuthorProfile + "/?__a=1").then(function (_ref2) {
        var data = _ref2.data;

        return data.graphql.user.is_verified;
      }).then(function (isVerified) {
        if (!isVerified) res.send({ message: "Instagram profile is not verified" });
        return _this.generateAccessToken();
      }).then(function (_ref3) {
        var data = _ref3.data;

        axios.post(_this.generateGSheetsAppendCallUrl(reqSpreadsheet, reqRange), {
          range: _this.spreadsheetRange,
          majorDimension: "ROWS",
          values: [[LineHash, AuthorProfile, "true", Date.now()]]
        }, {
          headers: {
            Authorization: "Bearer " + data.access_token,
            "Content-Type": "application/json"
          }
        });
        res.send({ message: "row added successfully" });
      }).catch(function (err) {
        return console.log(err);
      });
    }
  }, {
    key: "instructions",
    value: function instructions(req, res) {
      res.send({ message: "please post a LineHash and AuthorProfile" });
    }
  }, {
    key: "methodNotAllowed",
    value: function methodNotAllowed(req, res) {
      res.send({ message: "method not allowed" });
    }
  }]);

  return Instafetch;
}();

module.exports = { Instafetch: Instafetch };
//# sourceMappingURL=Instafetch.js.map