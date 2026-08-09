"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const sizes = [[375, 667], [414, 896]];
const items = [
  ["rainbow", "background"],
  ["snowfield", "background"],
  ["strawberry-hat", "hat"],
  ["bow", "hat"],
  ["space-helmet", "hat"],
  ["vest", "clothes"],
  ["star-cloak", "clothes"],
  ["fishing-rod", "handheld"],
  ["lollipop", "handheld"],
  ["lantern", "handheld"]
];
const output = process.argv[2] || path.join(process.cwd(), "qa", "browser-equipment-viewports");

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const results = {};
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`file://${path.join(process.cwd(), "tamagotchi-test.html")}`, { waitUntil: "load" });
    if (await page.locator("#name-dialog").evaluate((dialog) => dialog.open)) {
      await page.locator("#pet-name").fill("Nox");
      await page.locator("#save-name").click();
    }
    for (const [itemId, slot] of items) {
      const metrics = await page.evaluate(async ({ itemId, slot }) => {
        localStorage.setItem("noxcat_equipped", JSON.stringify({ [slot]: itemId }));
        window.dispatchEvent(new Event("noxcat-equipment-changed"));
        const overlay = document.querySelector(`[data-item-id="${itemId}"]`);
        if (overlay && !overlay.complete) await overlay.decode();
        const box = overlay && overlay.getBoundingClientRect();
        return overlay ? {
          itemId: overlay.dataset.itemId,
          slot: overlay.dataset.slot,
          src: overlay.getAttribute("src"),
          naturalWidth: overlay.naturalWidth,
          naturalHeight: overlay.naturalHeight,
          renderedWidth: box.width,
          renderedHeight: box.height,
          visible: getComputedStyle(overlay).visibility === "visible" && box.width > 0 && box.height > 0
        } : null;
      }, { itemId, slot });
      assert.ok(metrics, `${width}x${height}: ${itemId} must create an overlay element`);
      assert.equal(metrics.itemId, itemId, `${width}x${height}: ${itemId} data id`);
      assert.equal(metrics.slot, slot, `${width}x${height}: ${itemId} slot`);
      assert.equal(metrics.naturalWidth, slot === "background" ? 96 : 48, `${width}x${height}: ${itemId} source width`);
      assert.equal(metrics.naturalHeight, slot === "background" ? 96 : 48, `${width}x${height}: ${itemId} source height`);
      assert.equal(metrics.visible, true, `${width}x${height}: ${itemId} must render visibly`);
      results[`${width}x${height}/${itemId}`] = metrics;
      await page.locator(".farm").screenshot({ path: path.join(output, `${itemId}-${width}x${height}.png`) });
    }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, "measurements.json"), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`lightweight equipment browser verification passed (${items.length * sizes.length} renders)`);
}

main().catch((error) => { console.error(error); process.exit(1); });
