import { WebClient } from "@slack/client";
import * as fs from "fs";

const token = process.env.SLACK_TOKEN;
const conversationId = process.env.CONVERSATION_ID;

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
