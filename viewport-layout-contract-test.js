"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const css = fs.readFileSync("tamagotchi.css", "utf8");

assert.match(css, /body\{height:100svh;min-height:0;overflow:hidden\}/);
assert.match(css, /\.game-shell\{height:100svh;min-height:0;/);
assert.match(css, /\.farm\{height:clamp\(178px,27svh,300px\)/);
assert.match(css, /\.screen\{overflow:hidden/);
assert.match(css, /max-height:700px/);
assert.match(css, /#hospital:not\(\[hidden\]\)\{position:fixed;z-index:10;inset:0;/);
assert.match(css, /#hospital:not\(\[hidden\]\).*overflow-y:auto/);

for (const page of ["tamagotchi.html", "tamagotchi-test.html"]) {
  const html = fs.readFileSync(page, "utf8");
  assert.match(html, /<section class="device"/);
  assert.match(html, /class="device-controls"/);
  assert.match(html, /class="screen"/);
  assert.match(html, /<section id="hospital" class="hospital" hidden>/);
}

console.log("viewport layout contract tests passed");
