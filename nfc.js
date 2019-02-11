const NfcpyId = require("node-nfcpy-id").default;
const request = require("request");

const UID = process.env.UID;
const CLOUD_FUNCTION_ENDPOINT = process.env.CLOUD_FUNCTION_ENDPOINT;
const TOKEN = process.env.TOKEN;

const nfc = new NfcpyId().start();

nfc.on("touchstart", card => {
  if (card.id === UID) {
    console.log("req to cloud function");
    request(
      {
        url: CLOUD_FUNCTION_ENDPOINT,
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          console.log("success");
        }
      }
    );
  }
});
