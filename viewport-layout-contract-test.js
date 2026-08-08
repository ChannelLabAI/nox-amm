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

assert.match(css, /background:url\("assets\/noxcat-paw-shell-v3-sara-final\.svg"\)/);
assert.match(css, /\.screen\{position:absolute;z-index:1;left:20%;top:43\.8462%;width:60%;height:36\.1538%/);
assert.match(css, /#menu-left\{left:25\.8%;top:83\.6923%/);
assert.match(css, /#menu-confirm\{left:43\.8%;top:83\.6923%/);
assert.match(css, /#menu-right\{left:61\.8%;top:83\.6923%/);
assert.doesNotMatch(css, /\.device\{[^}]*border-radius:50%/);
assert.match(fs.readFileSync("assets/noxcat-paw-shell-v3-sara-final.svg", "utf8"), /id="officialLogo"/);

console.log("viewport layout contract tests passed");
