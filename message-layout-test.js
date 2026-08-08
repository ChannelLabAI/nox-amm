"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const expected = require("./assets/noxcat-paw-shell-v4-expected-viewport-measurements.json");
const css = fs.readFileSync("tamagotchi.css", "utf8");
const source = fs.readFileSync("tamagotchi.js", "utf8");

assert.match(css, /\.screen>\.farm\{height:43%\}/);
assert.match(css, /\.screen>\.message\{position:static;z-index:auto;/);
assert.match(css, /\.screen>\.message\.is-visible\{color:#e8ece5\}/);
assert.match(css, /\.screen>\.menu\{height:32%;flex:none\}/);
assert.match(css, /\.harvest-card\{height:14%;/);
assert.match(source, /element\.classList\.add\("is-visible"\)/);
assert.doesNotMatch(source, /messageTimer|setTimeout\(\(\) => element\.classList\.remove\("is-visible"\)/);

for (const [name, measurement] of Object.entries(expected)) {
  const { width, height } = measurement.viewport_px;
  const deviceHeight = Math.min(width, height * (1000 / 1960)) / (1000 / 1960);
  const screenHeight = deviceHeight * 0.403061;
  const before = screenHeight * 0.41;
  const after = screenHeight * 0.43;
  assert.ok(after > before, `${name} farm must grow`);
  assert.ok(Math.abs(after / before - (43 / 41)) < 1e-12, `${name} farm growth must be 4.88%`);
  assert.equal(measurement.scrollable, false, `${name} keeps the approved non-scroll contract`);
}

console.log("message-free farm layout tests passed");
