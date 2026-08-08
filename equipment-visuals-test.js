const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(`${__dirname}/tamagotchi.js`, "utf8");
const start = source.indexOf("  // Update this table");
const end = source.indexOf("  function animateCare");
const context = { window: {}, document: { querySelector: () => null } };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
const visuals = context.window.NoxCatEquipmentVisuals;

assert.equal(visuals.overlayLayersFor({ background: "spider-city", hat: "spider-mask", clothes: "spider-suit" }, "adult", "happy").map((layer) => layer.slot).join(","), "background,hat,clothes");
assert.equal(visuals.overlayPathFor("spider-preview", "adult", "normal"), "assets/equipment/spider/preview-dressed-normal-48px.png");
assert.equal(visuals.overlayPathFor("spider-preview", "adult", "happy"), "assets/equipment/spider/preview-dressed-happy-48px.png");
for (const [itemId, path] of Object.entries({
  sunset: "assets/equipment/sara/sunset-background-96px.png", night: "assets/equipment/sara/night-background-96px.png",
  cap: "assets/equipment/sara/cap-hat-overlay-48px.png", crown: "assets/equipment/sara/crown-hat-overlay-48px.png",
  apron: "assets/equipment/sara/apron-clothes-overlay-48px.png", cape: "assets/equipment/sara/cape-clothes-overlay-48px.png",
  flower: "assets/equipment/sara/flower-handheld-overlay-48px.png", wand: "assets/equipment/sara/wand-handheld-overlay-48px.png",
  "spider-city": "assets/equipment/sara/spider-city-background-96px.png", "spider-mask": "assets/equipment/sara/spider-mask-hat-overlay-48px.png", "spider-suit": "assets/equipment/sara/spider-suit-clothes-overlay-48px.png"
})) assert.equal(visuals.overlayPathFor(itemId, "adult", "happy"), path, `${itemId} must map to its approved Sara overlay`);
assert.equal(visuals.overlayPathFor("cap", "teen", "happy"), null);
assert.equal(visuals.overlayLayersFor({ hat: "cap" }, "teen", "happy").length, 0);

const container = { children: [], replaceChildren(...children) { this.children = children; } };
context.document.querySelector = (selector) => selector === "#equipped-visual" ? container : null;
context.document.createElement = () => ({ className: "", dataset: {}, style: {}, src: "", alt: "" });
visuals.renderEquipmentVisuals({ background: "spider-city", hat: "spider-mask", clothes: "spider-suit" }, "adult", "happy");
assert.equal(container.children.map((image) => image.dataset.slot).join(","), "background,hat,clothes");
assert.equal(container.children.map((image) => image.style.zIndex).join(","), "1,3,4");
visuals.renderEquipmentVisuals({ hat: "cap" }, "teen", "happy");
assert.equal(container.children.length, 0);
console.log("equipment visual config tests passed");
