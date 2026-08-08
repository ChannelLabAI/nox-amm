"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const core = require("./core.js");

const STORAGE_KEY = "noxcat-tamagotchi-v1";

function loadPage(testMode) {
  const elements = new Map();
  const domListeners = new Map();
  const storage = new Map();
  const element = () => ({
    textContent: "", hidden: false, disabled: false, src: "", alt: "", value: "",
    parentElement: null, classList: { add() {}, remove() {}, toggle() {} },
    replaceChildren() {}, showModal() {}, addEventListener() {},
    get offsetWidth() { return 0; }
  });
  const cat = element(); cat.parentElement = element(); elements.set("#cat", cat);
  const document = {
    querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
    querySelectorAll() { return []; },
    addEventListener(event, listener) { domListeners.set(event, listener); },
    createElement() { return element(); }
  };
  const window = {
    NoxCatCore: core, NOXCAT_TEST_MODE: testMode,
    addEventListener() {}, dispatchEvent() {}
  };
  const context = {
    window, document, localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    Event: class Event {}, Date, JSON, Object, setTimeout() {}, console
  };
  vm.runInNewContext(fs.readFileSync("./tamagotchi.js", "utf8"), context);
  domListeners.get("DOMContentLoaded")();
  return { state: JSON.parse(storage.get(STORAGE_KEY)), window };
}

const testPage = loadPage(true);
assert.equal(core.stageFor(testPage.state.activeDays), "adult");
assert.equal(testPage.state.activeDays, 16);
assert.equal(typeof testPage.window.NoxCatTest.setStage, "function");

const productionPage = loadPage(false);
assert.equal(core.stageFor(productionPage.state.activeDays), "egg");
assert.equal(productionPage.window.NoxCatTest, undefined);

console.log("test-mode default adult behavior tests passed");
