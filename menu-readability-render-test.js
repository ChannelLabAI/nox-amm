"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const sizes = [[375, 667], [390, 844], [414, 896], [390, 700], [430, 932]];
const output = process.argv[2] || path.join(process.cwd(), "menu-readability-viewports");

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const metrics = {};
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`file://${path.join(process.cwd(), "tamagotchi-test.html")}`, { waitUntil: "load" });
    const dialogOpen = await page.evaluate(() => document.querySelector("#name-dialog").open);
    if (dialogOpen) {
      await page.evaluate(() => {
        document.querySelector("#pet-name").value = "Nox";
        document.querySelector("#save-name").click();
      });
    }
    assert.equal(await page.evaluate(() => document.querySelector("#name-dialog").open), false, `${width}x${height} screenshot must not be obscured by the naming dialog`);
    metrics[`${width}x${height}`] = await page.evaluate(() => {
      const menu = document.querySelector(".screen > .menu").getBoundingClientRect();
      const items = [...document.querySelectorAll(".screen > .menu .menu-item")].map((item) => {
        const label = getComputedStyle(item);
        const icon = item.querySelector("img").getBoundingClientRect();
        const box = item.getBoundingClientRect();
        return { fontSize: Number.parseFloat(label.fontSize), iconWidth: icon.width, bottom: box.bottom };
      });
      return { scrollable: document.documentElement.scrollHeight > innerHeight + 1, menuBottom: menu.bottom, items };
    });
    const current = metrics[`${width}x${height}`];
    assert.equal(current.scrollable, false, `${width}x${height} must not scroll`);
    assert.ok(current.items.every((item) => item.fontSize >= 8 && item.iconWidth >= 20 && item.bottom <= current.menuBottom + 0.5), `${width}x${height} must show enlarged labels/icons without clipping`);
    await page.screenshot({ path: path.join(output, `menu-${width}x${height}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, "measurements.json"), `${JSON.stringify(metrics, null, 2)}\n`);
  console.log("menu readability rendered viewport tests passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
