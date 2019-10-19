const axios = require("axios");
const {
  client_id,
  client_secret,
  refresh_token
} = require("./credentials.json");

class Instafetch {
  constructor() {}

  generateAccessToken = () => {
    return axios.post(
      `https://oauth2.googleapis.com/token?client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`
    );
  };

  generateGSheetsAppendCallUrl = (reqSpreadsheet, reqRange) => {
    let spreadsheet = "1B05lCFpWSxkNA7kdQavjZa0VARlbx21D2TMkrGcp0Os";
    let range = "A1";
    if (reqSpreadsheet) spreadsheet = reqSpreadsheet;
    if (reqRange) range = reqRange;
    return `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/${range}:append?includeValuesInResponse=false&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=RAW`;
  };

  appendCall = ({ body, query }, res) => {
    const { LineHash, AuthorProfile } = query;
    const { SpreadsheetId: reqSpreadsheet, SpreadsheetRange: reqRange } = body;
    return axios
      .get(`https://www.instagram.com/${AuthorProfile}/?__a=1`)
      .then(({ data }) => {
        return data.graphql.user.is_verified;
      })
      .then(isVerified => {
        if (!isVerified)
          res.send({ message: "Instagram profile is not verified" });
        return this.generateAccessToken();
      })
      .then(({ data }) => {
        axios.post(
          this.generateGSheetsAppendCallUrl(reqSpreadsheet, reqRange),
          {
            range: this.spreadsheetRange,
            majorDimension: "ROWS",
            values: [[LineHash, AuthorProfile, "true", Date.now()]]
          },
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
              "Content-Type": "application/json"
            }
          }
        );
        res.send({ message: "row added successfully" });
      })
      .catch(err => console.log(err));
  };

  instructions = (req, res) => {
    res.send({ message: "please post a LineHash and AuthorProfile" });
  };

  methodNotAllowed = (req, res) => {
    res.send({ message: "method not allowed" });
  };
}

module.exports = { Instafetch };
