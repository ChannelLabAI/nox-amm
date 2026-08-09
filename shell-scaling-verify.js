"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const sizes = [[375, 667], [390, 844], [414, 896], [360, 740], [430, 932]];
const baselineWidth = ([width, height]) => Math.min(.82 * width, 300, .46 * height);
const repairedWidth = ([width, height]) => Math.min(width, height * 1000 / 1960);
const outputArg = process.argv.slice(2).find((arg) => arg !== "--analytic-only");
const output = outputArg || path.join(process.cwd(), "shell-scaling-viewports");

function expected(size) {
  const before = baselineWidth(size);
  const after = repairedWidth(size);
  return {
    before: { width: before, height: before * 1.3, fillWidthRatio: before / size[0] },
    after: { width: after, height: after * 1.96, fillWidthRatio: after / size[0] },
  };
}

async function main() {
  const css = fs.readFileSync("tamagotchi.css", "utf8");
  assert.match(css, /\.device\{position:relative;width:min\(92vw,72svh\)/);
  assert.doesNotMatch(css, /width:min\(82vw,300px,46svh\)/);
  assert.match(css, /background:url\("assets\/noxcat-device-shell-v6-sara\.svg"\)/);
  assert.match(css, /background:url\("assets\/noxcat-device-button-v6-sara\.svg"\)/);
  assert.match(css, /aspect-ratio:1000\/1960/);

  const analytic = Object.fromEntries(sizes.map((size) => [`${size[0]}x${size[1]}`, expected(size)]));
  for (const [name, measurements] of Object.entries(analytic)) {
    const [viewportWidth, viewportHeight] = name.split("x").map(Number);
    const areaFill = measurements.after.width * measurements.after.height / (viewportWidth * viewportHeight);
    assert.ok(areaFill >= .8, `${name}: v6 shell area fill must stay at or above 80%`);
    assert.ok(measurements.after.width > measurements.before.width, `${name}: repaired shell must be larger than baseline`);
  }
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, "analytic-before-after.json"), `${JSON.stringify(analytic, null, 2)}\n`);
  if (process.argv.includes("--analytic-only")) {
    console.log("shell scaling analytic verification passed");
    return;
  }

  const { chromium } = require("playwright");
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const rendered = {};
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`file://${path.join(process.cwd(), "tamagotchi-test.html")}`, { waitUntil: "load" });
    rendered[`${width}x${height}`] = await page.evaluate(() => {
      const device = document.querySelector(".device").getBoundingClientRect();
      const buttons = [...document.querySelectorAll(".device-controls button")].map((button) => {
        const box = button.getBoundingClientRect();
        const style = getComputedStyle(button);
        return { visible: box.width >= 30 && box.height >= 30 && style.color !== "rgba(0, 0, 0, 0)", width: box.width, height: box.height };
      });
      return {
        scrollable: document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1,
        device: { width: device.width, height: device.height, fillWidthRatio: device.width / innerWidth },
        buttons,
      };
    });
    const metrics = rendered[`${width}x${height}`];
    assert.equal(metrics.scrollable, false, `${width}x${height}: viewport must not scroll`);
    const fitted = expected([width, height]).after;
    assert.ok(Math.abs(metrics.device.fillWidthRatio - fitted.fillWidthRatio) <= .01, `${width}x${height}: shell must use fitted 1000:1960 width`);
    assert.ok(metrics.device.height <= height + 1, `${width}x${height}: shell must fit viewport height`);
    assert.ok(metrics.buttons.every((button) => button.visible), `${width}x${height}: every control needs a visible hit area`);
    await page.screenshot({ path: path.join(output, `viewport-${width}x${height}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, "rendered-measurements.json"), `${JSON.stringify(rendered, null, 2)}\n`);
  console.log("shell scaling verification passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
