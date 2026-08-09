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
  assert.match(html, /<div id="equipped-background" aria-hidden="true"><\/div>/);
  assert.match(html, /<section id="hospital" class="hospital" hidden>/);
}

assert.match(css, /#equipped-background\{position:absolute;z-index:1;inset:0;pointer-events:none\}/);
assert.match(css, /\.farm>#equipped-background \.equipment-overlay\{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;object-fit:fill\}/);
assert.match(css, /\.cat-frame>#equipped-visual\{position:absolute;inset:0;pointer-events:none\}/);

assert.match(css, /background:url\("assets\/noxcat-device-shell-v6-sara\.svg"\)/);
assert.match(css, /\.device\{width:min\(100%,51\.020408svh\);max-width:none;aspect-ratio:1000\/1960\}/);
assert.doesNotMatch(css, /noxcat-paw-shell-v3-sara-final/);
assert.match(css, /background:url\("assets\/noxcat-device-button-v6-sara\.svg"\)/);
assert.match(css, /\.screen\{position:absolute;z-index:1;left:13\.5%;top:33\.9286%;width:73%;height:40\.3061%/);
assert.match(css, /#menu-left\{left:20\.4%;top:82\.602%;width:15\.2%;height:7\.7551%/);
assert.match(css, /#menu-confirm\{left:42\.4%;top:82\.602%;width:15\.2%;height:7\.7551%/);
assert.match(css, /#menu-right\{left:64\.4%;top:82\.602%;width:15\.2%;height:7\.7551%/);
assert.doesNotMatch(css, /\.device\{[^}]*border-radius:50%/);
assert.match(fs.readFileSync("assets/noxcat-device-shell-v6-sara.svg", "utf8"), /id="brandWordmark"/);

console.log("viewport layout contract tests passed");
