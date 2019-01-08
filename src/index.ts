import NfcpyId from "node-nfcpy-id";
import * as Configstore from "configstore";
import { doSomethingInMinagine } from "./minagine";
import { sendResultToSlack, sendAlertToSlack } from "./slack";
import * as Sentry from "@sentry/node";

const credential = new Configstore("taikinman", {}, { globalConfigPath: true });

if (
  !credential.has("slackToken") ||
  !credential.has("conversationId") ||
  !credential.has("sentryDsn")
) {
  console.error("Need to edit credential file.");
  console.log(
    `Set 'slackToken', 'conversationId', 'sentryDsn' in config file located at ${
      credential.path
    }`
  );
  process.exit(1);
}

Sentry.init({
  dsn: credential.get("sentryDsn")
});

const nfc = new NfcpyId();
const uid = credential.get("uid");
nfc.start();

nfc.on("touchstart", card => {
  const now = new Date();
  if (card.id === uid) {
    if (now.getHours() < 15) {
      // start work
      console.log("touchstart", "id:", card.id, "type:", card.type);
      doSomethingInMinagine("work")
        .then(sendResultToSlack)
        .catch(console.error);
    } else {
      // go home
      console.log("touchstart", "id:", card.id, "type:", card.type);
      doSomethingInMinagine("home")
        .then(sendResultToSlack)
        .catch(console.error);
    }
  } else {
    sendAlertToSlack(card.id);
  }
});
