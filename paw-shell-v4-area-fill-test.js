"use strict";

const assert = require("node:assert/strict");
const expected = require("./assets/noxcat-paw-shell-v4-expected-viewport-measurements.json");

const ratio = 1000 / 1960;
for (const [name, measurement] of Object.entries(expected)) {
  const { width, height } = measurement.viewport_px;
  const deviceWidth = Math.min(width, height * ratio);
  const deviceHeight = deviceWidth / ratio;
  const areaFill = (deviceWidth * deviceHeight) / (width * height);

  assert.ok(areaFill >= 0.8, `${name} area fill must be at least 80%`);
  assert.ok(Math.abs(areaFill - measurement.area_fill_ratio) < 0.00001, `${name} must match approved v4 geometry`);
  assert.ok(deviceWidth <= width && deviceHeight <= height, `${name} shell must fit without clipping`);
  assert.equal(measurement.scrollable, false, `${name} must not scroll`);
}

console.log("v4 area-fill geometry tests passed");
