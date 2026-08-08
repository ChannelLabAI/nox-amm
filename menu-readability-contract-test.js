"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const expected = require("./assets/noxcat-paw-shell-v4-expected-viewport-measurements.json");
const css = fs.readFileSync("tamagotchi.css", "utf8");

assert.match(css, /\.screen>\.menu\{height:32%;flex:none\}/, "menu allocation must retain the approved v4 layout");
assert.match(css, /\.screen>\.menu \.menu-item\{font-size:\.5rem\}/, "v4 labels must be materially enlarged");
assert.match(css, /\.screen>\.menu \.menu-item img\{width:20px;height:20px\}/, "v4 icons must be materially enlarged");

for (const [name, measurement] of Object.entries(expected)) {
  const { width, height } = measurement.viewport_px;
  const deviceWidth = Math.min(width, height * (1000 / 1960));
  const screenHeight = (deviceWidth / (1000 / 1960)) * 0.403061;
  const menuHeight = screenHeight * 0.32;
  const twoRowsAtMinimum = (20 + (16 * 0.5 * 1.1) + 2) * 2 + 2;
  assert.ok(menuHeight >= twoRowsAtMinimum, `${name} keeps both enlarged menu rows inside the fixed menu area`);
  assert.equal(measurement.scrollable, false, `${name} retains the non-scroll viewport contract`);
  assert.ok(measurement.area_fill_ratio >= 0.9, `${name} retains at least 90% shell area fill`);
}

console.log("menu readability layout contract tests passed");
