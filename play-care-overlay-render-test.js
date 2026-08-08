"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const sizes = [[375, 667], [390, 844], [414, 896]];
const output = process.argv[2] || path.join(process.cwd(), "play-care-overlay-viewports");

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const results = {};
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`file://${path.join(process.cwd(), "tamagotchi-test.html")}`, { waitUntil: "load" });
    await page.locator("#menu-right").click();
    await page.locator("#menu-confirm").click();
    await page.locator(".care-effect--play").waitFor();
    await page.waitForTimeout(120);
    const metrics = await page.evaluate(() => {
      const farm = document.querySelector(".farm").getBoundingClientRect();
      const ball = document.querySelector(".care-effect--play").getBoundingClientRect();
      return {
        asset: document.querySelector(".care-effect--play").getAttribute("src"),
        fullyInsideFarm: ball.top >= farm.top && ball.bottom <= farm.bottom && ball.left >= farm.left && ball.right <= farm.right,
        farm: { left: farm.left, top: farm.top, right: farm.right, bottom: farm.bottom },
        ball: { left: ball.left, top: ball.top, right: ball.right, bottom: ball.bottom },
      };
    });
    assert.equal(metrics.asset, "assets/care/noxcat-prop-play-yarn-ball-34x34.png", `${width}x${height}: play must use yarn ball`);
    assert.equal(metrics.fullyInsideFarm, true, `${width}x${height}: yarn ball must not be clipped by .farm`);
    results[`${width}x${height}`] = metrics;
    await page.screenshot({ path: path.join(output, `play-${width}x${height}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, "measurements.json"), `${JSON.stringify(results, null, 2)}\n`);
  console.log("play care overlay render verification passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
