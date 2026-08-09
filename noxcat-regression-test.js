"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const core = require("./core.js");

const test = (name, fn) => { fn(); process.stdout.write(`ok - ${name}\n`); };
const NOW = core.DAY * 100;

test("care and harvest keep their existing daily awards", () => {
  let state = core.freshState(NOW);
  let result = core.care(state, "feed", NOW, {}); state = result.state;
  assert.equal(result.bonus, 0);
  result = core.care(state, "play", NOW, {}); state = result.state;
  assert.equal(result.bonus, 1);
  result = core.care(state, "play", NOW, {}); state = result.state;
  assert.equal(result.bonus, 0);
  result = core.harvest(state, NOW, {}); state = result.state;
  assert.equal(result.awarded, 1);
  assert.equal(core.harvest(state, NOW, {}).awarded, 0);
  assert.equal(state.hearts, 2);
});

test("equipment bonus still applies to each awarded heart action", () => {
  const gear = { background: "sunset", hat: "cap", clothes: "apron", handheld: "flower" };
  let state = core.freshState(NOW);
  const harvest = core.harvest(state, NOW, gear); state = harvest.state;
  const share = core.share(state, NOW, gear); state = share.state;
  assert.equal(harvest.awarded, 5);
  assert.equal(share.awarded, 5);
  assert.equal(state.hearts, 10);
});

test("share awards only once inside a rolling 24-hour window", () => {
  let state = core.freshState(NOW);
  const first = core.share(state, NOW, {}); state = first.state;
  const repeated = core.share(state, NOW + core.DAY - 1, {}); state = repeated.state;
  const nextDay = core.share(state, NOW + core.DAY, {});
  assert.equal(first.awarded, 1);
  assert.equal(repeated.awarded, 0);
  assert.equal(repeated.state.hearts, 1);
  assert.equal(nextDay.awarded, 1);
  assert.equal(nextDay.state.hearts, 2);
});

test("share cooldown survives old saved states and clock rollback", () => {
  const migrated = core.normalize({ hearts: 3 }, NOW);
  assert.equal(migrated.lastShareAt, 0);
  const first = core.share(migrated, NOW, {});
  assert.equal(core.share(first.state, NOW - core.DAY, {}).awarded, 0);
});

function loadShop() {
  const elements = new Map();
  const element = () => ({ textContent: "", innerHTML: "", hidden: false, disabled: false, showModal() {}, close() {} });
  const document = {
    querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return element(); },
    head: { append() {} }
  };
  const storage = new Map();
  const context = {
    document,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    window: { dispatchEvent() {} },
    Event: class Event {},
    console
  };
  vm.runInNewContext(fs.readFileSync("./shop.js", "utf8"), context);
  return context.window.NoxCatShop;
}

function loadShopIntegration(initialState, testMode) {
  const elements = new Map(), listeners = new Map(), storage = new Map();
  let buyButtons = [], buyButtonsHtml = "";
  storage.set("noxcat-tamagotchi-v1", JSON.stringify(initialState));
  const element = () => ({ textContent: "", innerHTML: "", hidden: false, disabled: false, showModal() { this.open = true; }, close() { this.open = false; } });
  const document = {
    querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
    querySelectorAll(selector) {
      if (selector !== "[data-buy]") return [];
      const html = elements.get("#shop-items").innerHTML;
      if (html !== buyButtonsHtml) {
        buyButtonsHtml = html;
        buyButtons = Array.from(html.matchAll(/<button data-buy="([^"]+)"\s*(disabled)?>([^<]+)<\/button>/g), (match) => ({ dataset: { buy: match[1] }, disabled: Boolean(match[2]), textContent: match[3], onclick: null }));
      }
      return buyButtons;
    },
    addEventListener(name, callback) { listeners.set(name, callback); }
  };
  const context = {
    document,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    window: { dispatchEvent() {}, NOXCAT_TEST_MODE: Boolean(testMode) },
    Event: class Event {},
    console
  };
  vm.runInNewContext(fs.readFileSync("./shop.js", "utf8"), context);
  listeners.get("DOMContentLoaded")();
  elements.get("#open-shop").onclick();
  return { context, elements, storage };
}

test("shop prices form the documented 1-to-4-day progression", () => {
  const shop = loadShop();
  const baselineIds = new Set(["sunset", "night", "cap", "crown", "apron", "cape", "flower", "wand"]);
  const baseline = shop.ITEMS.filter((entry) => baselineIds.has(entry.id));
  assert.deepEqual(Array.from(baseline, (entry) => entry.price).sort((a, b) => a - b), [2, 3, 4, 4, 5, 6, 7, 8]);
  assert.equal(Math.min(...baseline.map((entry) => entry.price / 2)), 1);
  assert.equal(Math.max(...baseline.map((entry) => entry.price / 2)), 4);
  assert.ok(new Set(baseline.map((entry) => entry.price / 2)).size > 1);
});

test("spider premium tier prices at or above the baseline ceiling", () => {
  const shop = loadShop();
  const premiumIds = ["spider-city", "spider-mask", "spider-suit"];
  const premium = premiumIds.map((id) => shop.ITEMS.find((entry) => entry.id === id));
  assert.ok(premium.every(Boolean), "all three spider items must exist in ITEMS");
  assert.ok(premium.every((entry) => entry.price >= 8), "premium tier must price at/above the 8-heart baseline ceiling");
  assert.deepEqual(premium.map((entry) => entry.price), [8, 9, 11], "spider-city <= spider-mask < spider-suit, ranked by original NOX price 16/18/22");
});

test("ten lightweight shop items keep their approved slots, labels, and prices", () => {
  const shop = loadShop();
  const expected = [
    ["rainbow", "background", "🌈", "雨後彩虹農場", 6],
    ["snowfield", "background", "❄️", "冰雪農場", 7],
    ["strawberry-hat", "hat", "🍓", "草莓帽", 3],
    ["bow", "hat", "🎀", "蝴蝶結", 4],
    ["space-helmet", "hat", "🪖", "太空頭盔", 9],
    ["vest", "clothes", "🦺", "漁夫背心", 5],
    ["star-cloak", "clothes", "🌠", "星空斗篷", 8],
    ["fishing-rod", "handheld", "🎣", "釣魚竿", 3],
    ["lollipop", "handheld", "🍭", "音符棒棒糖", 4],
    ["lantern", "handheld", "🏮", "小提燈", 6]
  ];
  assert.deepEqual(expected.map(([id]) => id), expected.map(([id]) => shop.ITEMS.find((entry) => entry.id === id)?.id));
  for (const [id, slot, icon, name, price] of expected) {
    const entry = shop.ITEMS.find((candidate) => candidate.id === id);
    assert.deepEqual({ ...entry }, { id, slot, icon, name, price });
    const exchange = shop.exchangeHearts({ hearts: 20 }, [], entry);
    assert.equal(exchange.ok, true, `${id} must be purchasable`);
    assert.equal(exchange.state.hearts, 20 - price, `${id} must deduct its approved price exactly once`);
  }
});

test("golden warrior set matches the established premium tier", () => {
  const shop = loadShop();
  const setIds = ["mini-planet", "golden-flame-hair", "battle-gi"];
  const set = setIds.map((id) => shop.ITEMS.find((entry) => entry.id === id));
  assert.ok(set.every(Boolean), "all three golden warrior items must exist in ITEMS");
  assert.deepEqual(set.map((entry) => entry.slot), ["background", "hat", "clothes"]);
  assert.deepEqual(set.map((entry) => entry.price), [8, 9, 11]);
});

test("heart exchange deducts exactly once and never goes negative", () => {
  const shop = loadShop(), flower = shop.ITEMS.find((entry) => entry.id === "flower");
  const success = shop.exchangeHearts({ hearts: 3, name: "Mochi" }, [], flower);
  assert.equal(success.ok, true);
  assert.equal(success.state.hearts, 1);
  assert.equal(success.state.name, "Mochi");
  assert.deepEqual(Array.from(success.owned), ["flower"]);
  const insufficient = shop.exchangeHearts({ hearts: 1 }, [], flower);
  assert.equal(insufficient.ok, false);
  assert.match(insufficient.reason, /愛心不足/);
  assert.equal(insufficient.state.hearts, 1);
  const duplicate = shop.exchangeHearts({ hearts: 9 }, ["flower"], flower);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.state.hearts, 9);
});

test("each golden warrior item can be bought with its exact heart price", () => {
  for (const [id, price] of [["mini-planet", 8], ["golden-flame-hair", 9], ["battle-gi", 11]]) {
    const { context, elements, storage } = loadShopIntegration({ hearts: price, name: "Mochi" });
    const button = context.document.querySelectorAll("[data-buy]").find((candidate) => candidate.dataset.buy === id);
    assert.equal(button.disabled, false, `${id} must be purchasable at ${price} hearts`);
    button.onclick();
    elements.get("#confirm-purchase").onclick();
    assert.equal(JSON.parse(storage.get("noxcat-tamagotchi-v1")).hearts, 0, `${id} must deduct exactly ${price} hearts`);
    assert.deepEqual(JSON.parse(storage.get("noxcat_owned_items")), [id]);
  }
});

test("real shop click exchanges hearts locally without a wallet", () => {
  const { context, elements, storage } = loadShopIntegration({ hearts: 3, name: "Mochi" });
  const buttons = context.document.querySelectorAll("[data-buy]");
  const flower = buttons.find((button) => button.dataset.buy === "flower");
  assert.equal(flower.disabled, false);
  flower.onclick();
  elements.get("#confirm-purchase").onclick();
  assert.equal(JSON.parse(storage.get("noxcat-tamagotchi-v1")).hearts, 1);
  assert.deepEqual(JSON.parse(storage.get("noxcat_owned_items")), ["flower"]);
  assert.match(elements.get("#shop-status").textContent, /兌換成功/);
});

test("shop disables unaffordable items with a clear label", () => {
  const { context, storage } = loadShopIntegration({ hearts: 1 });
  const flower = context.document.querySelectorAll("[data-buy]").find((button) => button.dataset.buy === "flower");
  assert.equal(flower.disabled, true);
  assert.equal(flower.textContent, "愛心不足");
  assert.equal(JSON.parse(storage.get("noxcat-tamagotchi-v1")).hearts, 1);
  assert.equal(storage.has("noxcat_owned_items"), false);
});

test("test mode bypasses heart cost without touching balance", () => {
  const { context, elements, storage } = loadShopIntegration({ hearts: 0, name: "Mochi" }, true);
  const buttons = context.document.querySelectorAll("[data-buy]");
  const wand = buttons.find((button) => button.dataset.buy === "wand");
  assert.equal(wand.disabled, false, "test mode must not disable items for insufficient hearts");
  assert.equal(wand.textContent, "兌換");
  wand.onclick();
  elements.get("#confirm-purchase").onclick();
  assert.equal(JSON.parse(storage.get("noxcat-tamagotchi-v1")).hearts, 0, "test mode must not deduct hearts");
  assert.deepEqual(JSON.parse(storage.get("noxcat_owned_items")), ["wand"]);
  assert.match(elements.get("#shop-status").textContent, /測試模式/);
});

test("production mode (test flag unset) keeps the real heart cost enforced", () => {
  const { context, storage } = loadShopIntegration({ hearts: 0 }, false);
  const wand = context.document.querySelectorAll("[data-buy]").find((button) => button.dataset.buy === "wand");
  assert.equal(wand.disabled, true, "without the test flag, insufficient hearts must still block purchase");
  assert.equal(wand.textContent, "愛心不足");
  assert.equal(storage.has("noxcat_owned_items"), false);
});

test("shop purchase source contains no wallet or chain transaction call", () => {
  const source = fs.readFileSync("./shop.js", "utf8");
  assert.doesNotMatch(source, /ethereum\.request|eth_sendTransaction|wallet_switchEthereumChain|tokenAddress/);
});

process.stdout.write("all noxcat regression tests passed\n");
