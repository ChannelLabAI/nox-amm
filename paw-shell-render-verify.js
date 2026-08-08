"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const sizes = [[375, 667], [390, 844], [414, 896]];
const geometry = {
  screen: { left: 20, top: 43.8462, width: 60, height: 36.1538 },
  buttonCenters: [[32, 88.4615], [50, 88.4615], [68, 88.4615]],
};
const output = process.argv[2] || path.join(process.cwd(), "paw-shell-viewports");

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const results = {};
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${path.join(process.cwd(), "tamagotchi-test.html")}`, { waitUntil: "load" });
    const metrics = await page.evaluate((expected) => {
      const device = document.querySelector(".device").getBoundingClientRect();
      const screen = document.querySelector(".screen").getBoundingClientRect();
      const cutout = {
        left: device.left + device.width * expected.screen.left / 100,
        top: device.top + device.height * expected.screen.top / 100,
        right: device.left + device.width * (expected.screen.left + expected.screen.width) / 100,
        bottom: device.top + device.height * (expected.screen.top + expected.screen.height) / 100,
      };
      const buttonCentersPct = [...document.querySelectorAll(".device-controls button")].map((button) => {
        const box = button.getBoundingClientRect();
        return [+(100 * (box.left + box.width / 2 - device.left) / device.width).toFixed(3), +(100 * (box.top + box.height / 2 - device.top) / device.height).toFixed(3)];
      });
      return {
        scrollable: document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1,
        shellFits: device.left >= 0 && device.top >= 0 && device.right <= innerWidth && device.bottom <= innerHeight,
        screenInsideCutout: screen.left >= cutout.left - .75 && screen.top >= cutout.top - .75 && screen.right <= cutout.right + .75 && screen.bottom <= cutout.bottom + .75,
        maxEdgeGapPx: +Math.max(Math.abs(screen.left - cutout.left), Math.abs(screen.top - cutout.top), Math.abs(screen.right - cutout.right), Math.abs(screen.bottom - cutout.bottom)).toFixed(3),
        buttonCentersPct,
      };
    }, geometry);
    metrics.pageErrors = pageErrors;
    results[`${width}x${height}`] = metrics;
    await page.screenshot({ path: path.join(output, `viewport-${width}x${height}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, "viewport-measurements.json"), `${JSON.stringify(results, null, 2)}\n`);
  for (const [size, metrics] of Object.entries(results)) {
    console.log(`${size} scrollable=${metrics.scrollable} shellFits=${metrics.shellFits} screenInsideCutout=${metrics.screenInsideCutout} maxEdgeGapPx=${metrics.maxEdgeGapPx}`);
    if (metrics.scrollable || !metrics.shellFits || !metrics.screenInsideCutout || metrics.maxEdgeGapPx > .75 || metrics.pageErrors.length) process.exitCode = 1;
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
