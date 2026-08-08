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
assert.equal(visuals.overlayPathFor("cap", "adult", "happy"), null);
assert.equal(visuals.overlayLayersFor({ hat: "cap" }, "adult", "happy").length, 0);

const container = { children: [], replaceChildren(...children) { this.children = children; } };
context.document.querySelector = (selector) => selector === "#equipped-visual" ? container : null;
context.document.createElement = () => ({ className: "", dataset: {}, style: {}, src: "", alt: "" });
visuals.renderEquipmentVisuals({ background: "spider-city", hat: "spider-mask", clothes: "spider-suit" }, "adult", "happy");
assert.equal(container.children.map((image) => image.dataset.slot).join(","), "background,hat,clothes");
assert.equal(container.children.map((image) => image.style.zIndex).join(","), "1,3,4");
visuals.renderEquipmentVisuals({ hat: "cap" }, "adult", "happy");
assert.equal(container.children.length, 0);
console.log("equipment visual config tests passed");
