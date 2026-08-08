"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("tamagotchi.js", "utf8");
const css = fs.readFileSync("tamagotchi.css", "utf8");
for (const asset of [
  "assets/care/noxcat-prop-feed-bowl-20x16.png",
  "assets/care/noxcat-prop-play-wand-34x34.png",
  "assets/care/noxcat-prop-clean-fullbody-48x48.png"
]) {
  assert.ok(source.includes(asset), `${asset} must be wired into animateCare`);
  assert.ok(fs.existsSync(asset), `${asset} must be committed`);
}
assert.doesNotMatch(source, /🍚|🎣|care-bubble|care-bubbles/);
assert.ok(css.includes(".care-effect--feed{left:76px;top:94px;width:60px;height:48px}"));
assert.ok(css.includes(".care-effect--play{left:68px;top:-17px;width:102px;height:102px"));
assert.ok(css.includes(".care-effect--clean{inset:0;width:144px;height:144px}"));
assert.doesNotMatch(css, /\.care-bubble/);
console.log("care illustration effect tests passed");
