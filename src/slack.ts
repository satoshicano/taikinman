import { WebClient } from "@slack/client";
import * as Configstore from "configstore";
import * as fs from "fs";

const credential = new Configstore("taikinman", {}, { globalConfigPath: true });

if (!credential.has("slackToken") || !credential.has("conversationId")) {
  console.error("Need to edit credential file.");
  console.log(
    `Set 'slackToken' and 'conversationId' in config file located at ${
      credential.path
    }`
  );
  process.exit(1);
}

const token = credential.get("slackToken");
const conversationId = credential.get("conversationId");

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
    text: `誰かが勤怠押そうとしてます id: ${id}`
  });
};
