#!/usr/bin/env node

const fs = require("fs");
const puppeteer = require("puppeteer");

const email = process.argv[2];
const password = process.argv[3];
const companyDomain = email.match(/\w+([-.]\w+)*\.\w+([-.]\w+)*$/)[0];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://minagine.awg.co.jp/hcm/user/login");

  await page.type("#user_cntrctr_dmn", companyDomain);
  await page.type("#user_login", email);
  await page.type("#user_password", password);
  await page.click("#login_form > div:nth-child(4) > div > input");

  await page.waitFor(5000);

  if (process.argv[4] === "0") {
    // start work
    await page.click("#button0");
    console.log("good morning");
  } else if (process.argv[4] === 1) {
    // go home
    await page.click("#button1");
    console.log("see you again");
  }

  await page.waitFor(5000);
  await page.screenshot({ path: "result.png" });

  browser.close();
})();
