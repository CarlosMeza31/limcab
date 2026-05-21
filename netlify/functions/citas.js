const https = require("https");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv__Cv9GwUCvEM0RBUxGQlIQLpqXT3ylAC44UeFKXK0JkHTrYaue--KgkaVfOgkkiq/exec";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

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
        const nuevaUrl = res.headers.location;
        console.log("Redirigiendo a:", nuevaUrl);
        return hacerPeticion(nuevaUrl, method, cuerpo)
          .then(resolve).catch(reject);
      }

      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        console.log("Respuesta de Google:", data);
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ raw: data }); }
      });
    });

    req.on("error", (err) => {
      console.log("Error en peticion:", err.message);
      reject(err);
    });

    if (cuerpo) req.write(cuerpo);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log("Metodo:", event.httpMethod);
  console.log("Body recibido:", event.body);

  try {
    if (event.httpMethod === "GET") {
      const data = await hacerPeticion(SCRIPT_URL, "GET", null);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const data = await hacerPeticion(SCRIPT_URL, "POST", event.body);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

  } catch (err) {
    console.log("Error general:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, msg: err.message })
    };
  }
};
