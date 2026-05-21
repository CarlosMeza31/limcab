const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycxZSkreWvowxpT6xIhw17Ab8_o_0CRGDASNgOvYO0vhl-JBWB8yNjaP4c7PzvxY3b/exec";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    if (event.httpMethod === "GET") {
      // Traer citas ocupadas
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      // Guardar nueva cita
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.body
      });
      const data = await res.json();
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
