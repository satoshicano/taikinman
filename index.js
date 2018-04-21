#!/usr/bin/env node

const Configstore = require("configstore");
const Puppeteer = require("puppeteer");
const PkgInfo = require("./package.json");

const credential = new Configstore(PkgInfo.name, {}, { globalConfigPath: true })

if (!credential.has("email") || !credential.has("password")) {
  console.error("Need to edit credential file.")
  console.log(`Set 'email' and 'password' in config file located at ${credential.path}`)
  process.exit(1)
}

const email = credential.get("email");
const password = credential.get("password");
const companyDomain = email.match(/\w+([-.]\w+)*\.\w+([-.]\w+)*$/)[0];

(async () => {
  const browser = await Puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://minagine.awg.co.jp/hcm/user/login");

  await page.type("#user_cntrctr_dmn", companyDomain);
  await page.type("#user_login", email);
  await page.type("#user_password", password);
  await page.click("#login_form > div:nth-child(4) > div > input");

  await page.waitFor(5000);

  if (process.argv[2] === "work") {
    // start work
    await page.click("#button0");
    console.log("good morning");
  }

  if (process.argv[2] === "home") {
    // go home
    await page.click("#button1");
    console.log("see you again");
  }

  await page.waitFor(5000);
  await page.screenshot({ path: "result.png" });

  browser.close();
})();
