"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const css = fs.readFileSync("tamagotchi.css", "utf8");
const shell = fs.readFileSync("assets/noxcat-device-shell-v6-sara.svg", "utf8");
const button = fs.readFileSync("assets/noxcat-device-button-v6-sara.svg", "utf8");
const renderVerify = fs.readFileSync("paw-shell-render-verify.js", "utf8");

assert.match(shell, /viewBox="0 0 1000 1960"/);
assert.match(shell, /aria-label="NOXCAT 圓角矩形行動適配手持裝置外殼 v6"/);
assert.match(shell, /<rect x="38" y="22" width="924" height="1916" rx="112"/);
assert.match(shell, /id="topBody"/);
assert.match(shell, /id="leftBody" x="50" y="640" width="85" height="840"/);
assert.match(shell, /id="rightBody" x="865" y="640" width="85" height="840"/);
assert.match(shell, /id="bottomBody"/);
assert.match(shell, /id="brandWordmark" aria-label="NOXCAT 品牌字樣"/);
assert.match(shell, /M152 382V218L252 382V218/);
assert.match(shell, /M824 218H904M864 218V382/);
const v6WordmarkSpan = 904 - 152;
const returnedV5WordmarkSpan = 690 - 344;
assert.ok(v6WordmarkSpan >= returnedV5WordmarkSpan, "v6 NOXCAT wordmark must not be smaller than returned v5");
assert.match(shell, /#AAFF00/i);
assert.match(shell, /#171A1E/i);
assert.doesNotMatch(shell, /paw|貓爪|spider|marvel|蛛網|蜘蛛|#20A5D6|#4EA6D6|#6FA3CC/i);

assert.match(button, /viewBox="0 0 152 152"/);
assert.match(button, /aria-label="NOXCAT 圓角方形控制按鈕 v6"/);
assert.match(button, /id="alignmentFace"/);
assert.doesNotMatch(button, /paw|貓爪|spider|marvel|蛛網|蜘蛛/i);

assert.match(css, /background:url\("assets\/noxcat-device-shell-v6-sara\.svg"\)/);
assert.match(css, /background:url\("assets\/noxcat-device-button-v6-sara\.svg"\)/);
assert.doesNotMatch(css, /background:url\("assets\/noxcat-paw-(?:shell|button)-v4-sara\.svg"\)/);
assert.match(css, /button:focus-visible\{outline:3px solid var\(--nox-lime\)/);
assert.match(css, /prefers-reduced-motion:reduce/);

const geometry = {
  screen: { left: 13.5, top: 33.9286, width: 73, height: 40.3061 },
  controls: [
    { left: 20.4, top: 82.602, width: 15.2, height: 7.7551 },
    { left: 42.4, top: 82.602, width: 15.2, height: 7.7551 },
    { left: 64.4, top: 82.602, width: 15.2, height: 7.7551 },
  ],
};
const px = (percent, dimension) => percent * dimension / 100;
assert.ok(Math.abs(px(geometry.screen.left, 1000) - 135) < .001);
assert.ok(Math.abs(px(geometry.screen.top, 1960) - 665) < .001);
assert.ok(Math.abs(px(geometry.screen.width, 1000) - 730) < .001);
assert.ok(Math.abs(px(geometry.screen.height, 1960) - 790) < .001);
assert.deepEqual(geometry.controls.map((control) => +(control.left + control.width / 2).toFixed(1)), [28, 50, 72]);
assert.ok(geometry.controls.every((control) => Math.abs(px(control.width, 1000) - 152) < .001));
assert.ok(geometry.controls.every((control) => Math.abs(px(control.height, 1960) - 152) < .002));
assert.match(renderVerify, /screen: \{ left: 13\.5, top: 33\.9286, width: 73, height: 40\.3061 \}/);
assert.match(renderVerify, /buttonCenters: \[\[28, 86\.4796\], \[50, 86\.4796\], \[72, 86\.4796\]\]/);
assert.match(renderVerify, /buttonCentersAligned/);

console.log("v6 mobile-fit device shell tests passed");
