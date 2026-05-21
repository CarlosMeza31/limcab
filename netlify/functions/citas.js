const https = require("https");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycxZSkreWvowxpT6xIhw17Ab8_o_0CRGDASNgOvYO0vhl-JBWB8yNjaP4c7PzvxY3b/exec";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

// Función helper para hacer peticiones HTTP con el módulo nativo de Node
function hacerPeticion(url, opciones, cuerpo) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const config = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: opciones.method || "GET",
      headers: opciones.headers || {}
    };

    const req = https.request(config, (res) => {
      // Google redirige — seguimos la redirección manualmente
      if (res.statusCode === 302 || res.statusCode === 301) {
        return hacerPeticion(res.headers.location, opciones, cuerpo)
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

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const data = await hacerPeticion(SCRIPT_URL, { method: "GET" });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const data = await hacerPeticion(
        SCRIPT_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        },
        event.body
      );
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, msg: err.message })
    };
  }
};
