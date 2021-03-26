const request = require("request");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const fetch = require("node-fetch");
global.Headers = fetch.Headers;

const querystring = require("querystring");
const { post } = require("request");

app.use(cors());

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const redirect_uri = process.env.redirect_uri;
const port = process.env.PORT || 8888;

const generateRandomString = function (length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/login", function (req, res) {
  // your application requests authorization
  const state = generateRandomString(16);

  const scope = "user-read-private user-read-email";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", function (req, res) {
  console.log(req.url);

  const str =
    "http://localhost:8888/callback?code=AQBrR3hbnSk5mLNvesCUxihvErsW9i1FJNJWmAIUDSn7PxeQgenHSUfcji0WnrruDjE6B3ilPy19-iki-uqnaDL8eS2srXJeV3Z75LfPvTNymbRPVpe-iSVSxMYo-7jgSzWqDAkN5YlSLzl44SZ42JZAezNGG_kUGb2C2Tf6_NAcTW7reXxAfS4S9rO9dluF6iyppW1hK82QFomr8F93KJTzqdxDBw";

  // const code = str.split("=")[1];
  const code = req.url.split("=")[1];
  const state = generateRandomString(16);

  console.log(code);

  // const code = req.query.code || null;
  // const state = req.query.state || null;
  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    const data = {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    };
    let endocedStr = "";
    for (let prop in data) {
      if (endocedStr) {
        endocedStr += "&";
      }
      endocedStr += prop + "=" + data[prop];
    }
    const authOptions = {
      method: "POST",
      headers: new Headers({
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
        "content-type": "application/x-www-form-urlencoded",
      }),
      body: endocedStr,
      json: true,
    };
    fetch("https://accounts.spotify.com/api/token", authOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.access_token) {
          // res.send(`${result.access_token},${result.refresh_token}`);
          // res.end();
          res.status(301).redirect("my-demo1://demo1/");
        } else {
          res.redirect(
            "/#" +
              querystring.stringify({
                error: "invalid_token",
              })
          );
        }
      });
  }
});

app.listen(port, function () {
  console.log("server started " + port);
});

// function getToken() {
//   app.get("/", function (req, res) {
//     const authOptions = {
//       url: "https://accounts.spotify.com/api/token",
//       headers: {
//         Authorization:
//           "Basic " +
//           Buffer.from(client_id + ":" + client_secret).toString("base64"),
//       },
//       form: {
//         grant_type: "client_credentials",
//       },
//       json: true,
//     };

//     request.post(authOptions, function (error, response, body) {
//       if (!error && response.statusCode === 200) {
//         res.send(body.access_token);
//         console.log(body.access_token);
//       }
//     });
//   });
// }
