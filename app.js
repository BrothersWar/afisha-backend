const request = require("request");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const fetch = require("node-fetch");
global.Headers = fetch.Headers;

const querystring = require("querystring");
const { post } = require("request");
const nodemailer = require("nodemailer");

app.use(cors());

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const redirect_uri = process.env.redirect_uri;
const port = process.env.PORT || 8888;

const mail_login = process.env.mail_login;
const mail_pass = process.env.mail_pass;

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
          const redirUri = encodeURIComponent(
            `afisha://main/?access_token=${result.access_token}&refresh_token=${result.refresh_token}`
          );
          res
            .status(301)
            .redirect(
              `https://proyecto26.github.io/react-native-inappbrowser?redirect_url=${redirUri}`
            );
          // .redirect(
          //   `afisha://main/?access_token=${result.access_token}&refresh_token=${result.refresh_token}`
          // );
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

app.get("/refresh", function (req, res) {
  console.log(req.url);

  const refreshToken = req.url.split("=")[1];

  const data = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };
  var endocedStr = "";
  for (var prop in data) {
    if (endocedStr) {
      endocedStr += "&";
    }
    endocedStr += prop + "=" + data[prop];
  }

  console.log(data);

  var authOptions = {
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
    .then((r) => {
      console.log(r);

      if (r.access_token) {
        res.send(r.access_token);
      } else {
        console.log("err to parse accesstoken");
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get("/send-mail", function (req, res) {
  console.log(req.url);

  let string = req.url.split("?")[1].split("&");

  const mail = string[0].split("=")[1];
  const code = string[1].split("=")[1];

  const transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: mail_login, // generated ethereal user
      pass: mail_pass, // generated ethereal password
    },
  });

  const options = {
    from: "no-reply-afisha@yandex.ru", // sender address
    to: mail, // list of receivers
    subject: "Код для Восстановления доступа", // Subject line
    text: `Ваш код восстановления к приложению Афиша: ${code}`, // plain text body
    //html: "<b>Hello world?</b>" // html body
  };

  // send mail with defined transport object
  transporter.sendMail(options, function (err, info) {
    if (err) {
      // return err;
      return "Не удалось отправить код на почту";
    }
    return "Код успешно отправлен";
  });
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
