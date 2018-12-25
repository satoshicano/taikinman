import { WebClient } from "@slack/client";
import * as Configstore from "configstore";
import * as fs from "fs";

const credential = new Configstore("taikinman", {}, { globalConfigPath: true });

if (
  !credential.has("slackToken") ||
  !credential.has("conversationId") ||
  !credential.has("message")
) {
  console.error("Need to edit credential file.");
  console.log(
    `Set 'slackToken', 'conversationId', 'message' in config file located at ${
      credential.path
    }`
  );
  process.exit(1);
}

const token = credential.get("slackToken");
const conversationId = credential.get("conversationId");
const message = credential.get("message");

export const sendResultToSlack = () => {
  const web = new WebClient(token);
  web.files
    .upload({
      fileName: "勤怠つけたよ",
      file: fs.createReadStream("./result.png"),
      channels: conversationId
    })
    .then(res => console.log(res.ok))
    .catch(console.error);
};

export const sendAlertToSlack = (id: number) => {
  const web = new WebClient(token);
  web.chat.postMessage({
    channel: conversationId,
    text: `${message} id: ${id}`
  });
};
