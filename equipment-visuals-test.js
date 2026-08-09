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
const expectedOverlays = {
  sunset: "assets/equipment/sara/sunset-background-96px.png", night: "assets/equipment/sara/night-background-96px.png",
  cap: "assets/equipment/sara/cap-hat-overlay-48px.png", crown: "assets/equipment/sara/crown-hat-overlay-48px.png",
  apron: "assets/equipment/sara/apron-clothes-overlay-48px.png", cape: "assets/equipment/sara/cape-clothes-overlay-48px.png",
  flower: "assets/equipment/sara/flower-handheld-overlay-48px.png", wand: "assets/equipment/sara/wand-handheld-overlay-48px.png",
  rainbow: "assets/equipment/sara/rainbow-background-96px.png", snowfield: "assets/equipment/sara/snowfield-background-96px.png",
  "strawberry-hat": "assets/equipment/sara/strawberry-hat-hat-overlay-48px.png", bow: "assets/equipment/sara/bow-hat-overlay-48px.png",
  "space-helmet": "assets/equipment/sara/space-helmet-hat-overlay-48px.png", vest: "assets/equipment/sara/vest-clothes-overlay-48px.png",
  "star-cloak": "assets/equipment/sara/star-cloak-clothes-overlay-48px.png", "fishing-rod": "assets/equipment/sara/fishing-rod-handheld-overlay-48px.png",
  lollipop: "assets/equipment/sara/lollipop-handheld-overlay-48px.png", lantern: "assets/equipment/sara/lantern-handheld-overlay-48px.png",
  "spider-city": "assets/equipment/sara/spider-city-background-96px.png", "spider-mask": "assets/equipment/sara/spider-mask-hat-overlay-48px.png", "spider-suit": "assets/equipment/sara/spider-suit-clothes-overlay-48px.png",
  "mini-planet": "assets/equipment/sara/mini-planet-background-96px.png", "golden-flame-hair": "assets/equipment/sara/golden-flame-hair-hat-overlay-48px.png", "battle-gi": "assets/equipment/sara/battle-gi-clothes-overlay-48px.png"
};
for (const [itemId, path] of Object.entries(expectedOverlays)) {
  assert.equal(visuals.overlayPathFor(itemId, "adult", "happy"), path, `${itemId} must map to its approved Sara overlay`);
  const png = fs.readFileSync(`${__dirname}/${path}`);
  assert.equal(png.toString("ascii", 1, 4), "PNG", `${itemId} must point to a PNG file`);
  const expectedSize = path.includes("background-96px") ? 96 : 48;
  assert.equal(png.readUInt32BE(16), expectedSize, `${itemId} overlay width`);
  assert.equal(png.readUInt32BE(20), expectedSize, `${itemId} overlay height`);
}
assert.equal(visuals.overlayPathFor("cap", "teen", "happy"), null);
assert.equal(visuals.overlayLayersFor({ hat: "cap" }, "teen", "happy").length, 0);

const backgroundContainer = { children: [], replaceChildren(...children) { this.children = children; } };
const characterContainer = { children: [], replaceChildren(...children) { this.children = children; } };
context.document.querySelector = (selector) => selector === "#equipped-background" ? backgroundContainer : selector === "#equipped-visual" ? characterContainer : null;
context.document.createElement = () => ({ className: "", dataset: {}, style: {}, src: "", alt: "" });
visuals.renderEquipmentVisuals({ background: "spider-city", hat: "spider-mask", clothes: "spider-suit" }, "adult", "happy");
assert.equal(backgroundContainer.children.map((image) => image.dataset.slot).join(","), "background");
assert.equal(backgroundContainer.children.map((image) => image.style.zIndex).join(","), "1");
assert.equal(characterContainer.children.map((image) => image.dataset.slot).join(","), "hat,clothes");
assert.equal(characterContainer.children.map((image) => image.style.zIndex).join(","), "3,4");
visuals.renderEquipmentVisuals({ background: "mini-planet", hat: "golden-flame-hair", clothes: "battle-gi" }, "adult", "normal");
assert.equal(backgroundContainer.children.map((image) => image.dataset.itemId).join(","), "mini-planet");
assert.equal(characterContainer.children.map((image) => image.dataset.itemId).join(","), "golden-flame-hair,battle-gi");
visuals.renderEquipmentVisuals({ hat: "cap" }, "teen", "happy");
assert.equal(backgroundContainer.children.length, 0);
assert.equal(characterContainer.children.length, 0);
console.log("equipment visual config tests passed");
