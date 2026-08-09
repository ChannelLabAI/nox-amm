"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const output = process.argv[2] || path.join(process.cwd(), "care-equipment-overlay-evidence");
const careKinds = ["feed", "play", "clean"];

async function openPet(browser, gear) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const now = Date.now();
  await page.addInitScript(({ equipped, savedAt }) => {
    localStorage.setItem("noxcat_equipped", JSON.stringify(equipped));
    localStorage.setItem("noxcat-tamagotchi-v1", JSON.stringify({
      bornAt: savedAt,
      maxSeenAt: savedAt,
      lastCareAt: savedAt,
      activeDays: 16,
      name: "Overlay QA"
    }));
  }, { equipped: gear, savedAt: now });
  await page.goto(pathToFileURL(path.join(process.cwd(), "tamagotchi-test.html")).href, { waitUntil: "load" });
  return page;
}

async function triggerCare(page, kind, outputPrefix) {
  if (kind !== "feed") await page.locator("#menu-right").click();
  await page.locator("#menu-confirm").click();
  await page.locator(`#cat.care-${kind}`).waitFor();
  await page.waitForTimeout(120);
  const metrics = await page.evaluate((careKind) => {
    const cat = document.querySelector("#cat");
    const foreground = Array.from(document.querySelectorAll("#equipped-visual .equipment-overlay"));
    const background = document.querySelector("#equipped-background .equipment-overlay");
    const effect = document.querySelector(`.care-effect--${careKind}`);
    return {
      careKind,
      catZIndex: Number(getComputedStyle(cat).zIndex),
      catAnimation: getComputedStyle(cat).animationName,
      foregroundSlots: foreground.map((element) => element.dataset.slot),
      foregroundZIndexes: foreground.map((element) => Number(getComputedStyle(element).zIndex)),
      backgroundSlot: background && background.dataset.slot,
      backgroundZIndex: background && Number(getComputedStyle(background).zIndex),
      effectZIndex: effect && Number(getComputedStyle(effect).zIndex)
    };
  }, kind);
  await page.screenshot({ path: path.join(output, `${outputPrefix}-${kind}.png`), fullPage: true });
  await page.waitForFunction((careKind) => !document.querySelector("#cat").classList.contains(`care-${careKind}`), kind);
  metrics.restingCatZIndex = await page.locator("#cat").evaluate((cat) => Number(getComputedStyle(cat).zIndex));
  return metrics;
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const results = { equipped: {}, unequipped: {} };

  const equippedPage = await openPet(browser, {
    background: "sunset",
    hat: "cap",
    clothes: "apron",
    handheld: "flower"
  });
  for (const kind of careKinds) {
    const metrics = await triggerCare(equippedPage, kind, "equipped");
    assert.deepEqual(metrics.foregroundSlots, ["hat", "clothes", "handheld"], `${kind}: all foreground equipment must render`);
    assert.equal(metrics.backgroundSlot, "background", `${kind}: background equipment must remain in its own layer`);
    assert.equal(metrics.backgroundZIndex, 1, `${kind}: background equipment layering must remain unchanged`);
    assert.match(metrics.catAnimation, new RegExp(`(^|, )care-${kind}($|, )`), `${kind}: care animation must be active`);
    assert.ok(metrics.catZIndex > Math.max(...metrics.foregroundZIndexes), `${kind}: animated cat must be above foreground equipment`);
    assert.ok(metrics.effectZIndex >= metrics.catZIndex, `${kind}: care prop must stay visible above the animated cat`);
    assert.ok(metrics.restingCatZIndex < Math.min(...metrics.foregroundZIndexes), `${kind}: equipment must cover the cat again after care ends`);
    results.equipped[kind] = metrics;
  }
  await equippedPage.close();

  const unequippedPage = await openPet(browser, {});
  for (const kind of careKinds) {
    const metrics = await triggerCare(unequippedPage, kind, "unequipped");
    assert.deepEqual(metrics.foregroundSlots, [], `${kind}: unequipped care must not create equipment layers`);
    assert.match(metrics.catAnimation, new RegExp(`(^|, )care-${kind}($|, )`), `${kind}: unequipped care animation must remain active`);
    results.unequipped[kind] = metrics;
  }
  await unequippedPage.close();

  await browser.close();
  fs.writeFileSync(path.join(output, "measurements.json"), `${JSON.stringify(results, null, 2)}\n`);
  console.log("care equipment overlay render verification passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
