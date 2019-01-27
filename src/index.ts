import * as puppeteer from "puppeteer";
import { google } from "googleapis";
import { WebClient } from "@slack/client";
import * as fs from "fs";

const token = process.env.SLACK_TOKEN;
const conversationId = process.env.CONVERSATION_ID;
// const message = process.env.MESSAGE;
const BUCKET = process.env.BUCKET;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const COMPANY_DOMAIN = EMAIL.split("@")[1];
const LOGIN_URL = "https://tm.minagine.net/index.html";

const loginAndScreenshot = async (req: any, res: any) => {
  const cmd: "work" | "home" = req.query.cmd;

  if (!cmd) {
    return res.send('params["cmd"] is blank');
  }

  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1000,
    height: 800
  });

  await page.goto(LOGIN_URL);

  await page.waitForSelector("#login_form > div:nth-child(5) > div > input");
  await page.type("#user_cntrctr_dmn", COMPANY_DOMAIN);
  await page.type("#user_login", EMAIL);
  await page.type("#user_password", PASSWORD);

  page.click("#login_form > div:nth-child(5) > div > input");

  if (cmd === "work") {
    await page.waitForSelector("#button0");
    await page.evaluate(() => {
      const workButton = document.querySelector("#button0") as HTMLElement;
      workButton.click();
    });
  }

  if (cmd === "home") {
    await page.waitForSelector("#button1");
    await page.evaluate(() => {
      const homeButton = document.querySelector("#button1") as HTMLElement;
      homeButton.click();
    });
  }

  await page.waitForSelector("table.none_sortable_table");
  const clip = await page.evaluate(() => {
    const el = document.querySelector("table.none_sortable_table");
    const { width, height, top: y, left: x } = el.getBoundingClientRect();
    return { width, height, x, y };
  });

  await page.screenshot({ clip, path: "result.png" });
  await browser.close();
};

const sendResultToSlack = () => {
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

const getAccessToken = (header: any) => {
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+([^\s]+)$/);
  return match ? match[1] : null;
};

const authorized = async (req: any, res: any) => {
  loginAndScreenshot(req, res).then(() => {
    sendResultToSlack();
    res.send("success");
  });
};

exports.echo = async (req: any, res: any) => {
  const accessToken = getAccessToken(req.get("Authorization"));
  console.log("accessTOken", accessToken);
  const oauth = new google.auth.OAuth2();
  oauth.setCredentials({ access_token: accessToken });

  const permission = "storage.buckets.get"; // 権限の種類
  const gcs = google.storage("v1");
  await gcs.buckets.testIamPermissions(
    { bucket: BUCKET, permissions: [permission], auth: oauth },
    {},
    async (err, response) => {
      if (err) {
        console.error(err);
      }
      if (
        response !== null &&
        response !== undefined &&
        response.data.permissions.includes(permission)
      ) {
        await authorized(req, res);
      } else {
        res.status(403).send("It is an invalid account.");
      }
    }
  );
};
