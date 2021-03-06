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

const EMAIL = credential.get("email");
const PASSWORD = credential.get("password");
const COMPANY_DOMAIN = EMAIL.split("@")[1];

const LOGIN_URL = "https://tm.minagine.net/index.html";

export async function doSomethingInMinagine(cmd: "home" | "work") {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/chromium-browser"
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
}
