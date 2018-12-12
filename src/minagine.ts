import * as puppeteer from "puppeteer";
import * as Configstore from "configstore";

const credential = new Configstore("taikinman", {}, { globalConfigPath: true });

if (!credential.has("email") || !credential.has("password")) {
  console.error("Need to edit credential file.");
  console.log(
    `Set 'email' and 'password' in config file located at ${credential.path}`
  );
  process.exit(1);
}

const email: string = credential.get("email");
const password = credential.get("password");
const companyDomain = email.split("@")[1];

type command = "home" | "work";

export async function doSomethingInMinagine(cmd: command) {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1000,
    height: 800
  });

  await page.goto("https://tm.minagine.net/index.html");

  await page.type("#user_cntrctr_dmn", companyDomain);
  await page.type("#user_login", email);
  await page.type("#user_password", password);

  page.click("#login_form > div:nth-child(5) > div > input");

  if (cmd === "work") {
    await page.waitForSelector("#button0");
    page.click("#button0");
  }

  if (cmd === "home") {
    await page.waitForSelector("#button1");
    page.click("#button1");
  }

  await page.waitForNavigation({ waitUntil: "load" });
  await page.screenshot({ path: "result.png" });

  await browser.close();
}
