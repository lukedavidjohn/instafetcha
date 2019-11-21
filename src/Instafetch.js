const axios = require("axios");

class Instafetch {
  constructor() {
    this.appendCall = this.appendCall.bind(this);
  }

  fetchInstagramProfileData(username, verifiedOnly) {
    return axios
      .get(`https://www.instagram.com/${username}/?__a=1`)
      .then(({ data: { graphql: { user } } }) => {
        const { is_verified } = user;
        const userValues = Object.values(user).map(ele => {
          if (typeof ele === "object") return JSON.stringify(ele);
          else return ele;
        });
        if (verifiedOnly === "true") verifiedOnly = true;
        if (verifiedOnly === "false") verifiedOnly = false;
        if (!verifiedOnly || (verifiedOnly && is_verified)) return userValues;
        if (verifiedOnly && !is_verified) {
          return Promise.reject({
            message: "Instagram profile is not verified"
          });
        }
      });
  }

  generateAccessToken(instaData) {
    const { client_id, client_secret, refresh_token } =
      require("../credentials.json") || process.env;
    return Promise.all([
      axios.post(
        `https://oauth2.googleapis.com/token?client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`
      ),
      instaData
    ]);
  }

  postToGoogleSheets(
    spreadsheet = "1B05lCFpWSxkNA7kdQavjZa0VARlbx21D2TMkrGcp0Os",
    range = "A1",
    lineHash,
    instaData,
    access_token
  ) {
    try {
      return axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/${range}:append?includeValuesInResponse=false&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=RAW`,
        {
          range,
          majorDimension: "ROWS",
          values: [[new Date(), lineHash, ...instaData]]
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  appendCall(
    {
      query: {
        AuthorProfile,
        LineHash,
        SpreadsheetId,
        SpreadsheetRange,
        VerifiedOnly
      }
    },
    res
  ) {
    this.fetchInstagramProfileData(AuthorProfile, VerifiedOnly)
      .then(instaData => {
        return this.generateAccessToken(instaData)
          .then(([{ data: { access_token } }, instaData]) => {
            return this.postToGoogleSheets(
              SpreadsheetId,
              SpreadsheetRange,
              LineHash,
              instaData,
              access_token
            );
          })
          .then(() => res.send({ message: "row added successfully" }))
          .catch(error => res.send({ innerError: error }));
      })
      .catch(error => res.send({ outerError: error }));
  }

  instructions(req, res) {
    res.send({ message: "please post a LineHash and AuthorProfile" });
  }

  methodNotAllowed(req, res) {
    res.send({ message: "method not allowed" });
  }
}

module.exports = { Instafetch };
