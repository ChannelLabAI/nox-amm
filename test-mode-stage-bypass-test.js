"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("tamagotchi.js", "utf8");
const testPage = fs.readFileSync("tamagotchi-test.html", "utf8");
const productionPage = fs.readFileSync("tamagotchi.html", "utf8");

assert.match(testPage, /window\.NOXCAT_TEST_MODE = true/);
assert.doesNotMatch(productionPage, /NOXCAT_TEST_MODE/);
assert.match(source, /const TEST_MODE = window\.NOXCAT_TEST_MODE === true/);
assert.match(source, /STAGE_ACTIVE_DAYS = Object\.freeze\(\{ egg: 0, kitten: 3, teen: 9, adult: 16 \}\)/);
assert.match(source, /if \(TEST_MODE\) window\.NoxCatTest = Object\.freeze\(\{ stageActiveDays: STAGE_ACTIVE_DAYS, setStage: setTestStage \}\)/);
assert.match(source, /if \(!TEST_MODE \|\| !Object\.hasOwn\(STAGE_ACTIVE_DAYS, stage\)\) return false/);

console.log("test-mode stage bypass contract tests passed");
