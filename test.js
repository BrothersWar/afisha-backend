const fetch = require("node-fetch");
global.Headers = fetch.Headers;

var myHeaders = new Headers();
myHeaders.append(
  "sec-ch-ua",
  '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"'
);
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("Upgrade-Insecure-Requests", "1");
myHeaders.append(
  "User-Agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
);
myHeaders.append(
  "Accept",
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
);
myHeaders.append("Sec-Fetch-Site", "none");
myHeaders.append("Sec-Fetch-Mode", "navigate");
myHeaders.append("Sec-Fetch-User", "?1");
myHeaders.append("Sec-Fetch-Dest", "document");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

fetch("http://localhost:8888/login", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log("error", error));
