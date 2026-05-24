const https = require("https");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv__Cv9GwUCvEM0RBUxGQlIQLpqXT3ylAC44UeFKXK0JkHTrYaue--KgkaVfOgkkiq/exec";

function hacerPeticion(url, method, cuerpo) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const config = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": cuerpo ? Buffer.byteLength(cuerpo) : 0
      }
    };

    const req = https.request(config, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return hacerPeticion(res.headers.location, method, cuerpo)
          .then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ raw: data }); }
      });
    });

    req.on("error", reject);
    if (cuerpo) req.write(cuerpo);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  try {
    if (req.method === "GET") {
      const data = await hacerPeticion(SCRIPT_URL, "GET", null);
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = JSON.stringify(req.body);
      const data = await hacerPeticion(SCRIPT_URL, "POST", body);
      return res.status(200).json(data);
    }

  } catch (err) {
    return res.status(500).json({ ok: false, msg: err.message });
  }
};
