const axios = require("axios");

class Instafetch {
  constructor() {
    this.appendCall = this.appendCall.bind(this);
  }

  fetchInstagramProfileData(username) {
    return axios
      .get(`https://www.instagram.com/${username}/?__a=1`)
      .then(({ data: { graphql: { user: { is_verified } } } }) => {
        if (!is_verified) {
          return Promise.reject({
            message: "Instagram profile is not verified"
          });
        }
      });
  }

  generateAccessToken() {
    const { client_id, client_secret, refresh_token } =
      require("../credentials.json") || process.env;
    return axios.post(
      `https://oauth2.googleapis.com/token?client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`
    );
  }

  postToGoogleSheets(
    spreadsheet = "1B05lCFpWSxkNA7kdQavjZa0VARlbx21D2TMkrGcp0Os",
    range = "A1",
    lineHash,
    username,
    access_token
  ) {
    return axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/${range}:append?includeValuesInResponse=false&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=RAW`,
      {
        range,
        majorDimension: "ROWS",
        values: [[lineHash, username, "true", Date.now()]]
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json"
        }
      }
    );
  }

  appendCall({ body, query }, res) {
    const { SpreadsheetId, SpreadsheetRange } = body;
    const { LineHash, AuthorProfile } = query;
    this.fetchInstagramProfileData(AuthorProfile)
      .then(() => {
        return this.generateAccessToken();
      })
      .then(({ data: { access_token } }) => {
        return this.postToGoogleSheets(
          SpreadsheetId,
          SpreadsheetRange,
          LineHash,
          AuthorProfile,
          access_token
        );
      })
      .then(() => res.send({ message: "row added successfully" }))
      .catch(err => res.send(err));
  }

  instructions(req, res) {
    res.send({ message: "please post a LineHash and AuthorProfile" });
  }

  methodNotAllowed(req, res) {
    res.send({ message: "method not allowed" });
  }
}

module.exports = { Instafetch };
