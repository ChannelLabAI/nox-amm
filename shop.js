(() => {
  const STATE_KEY = "noxcat-tamagotchi-v1";
  const OWNED_KEY = "noxcat_owned_items", EQUIPPED_KEY = "noxcat_equipped";
  const ITEMS = [
    { id: "sunset", slot: "background", icon: "🌇", name: "夕陽農場", price: 4 },
    { id: "night", slot: "background", icon: "🌌", name: "星夜農場", price: 5 },
    { id: "cap", slot: "hat", icon: "🧢", name: "嫩芽帽", price: 3 },
    { id: "crown", slot: "hat", icon: "👑", name: "小皇冠", price: 7 },
    { id: "apron", slot: "clothes", icon: "👕", name: "農場圍裙", price: 4 },
    { id: "cape", slot: "clothes", icon: "🧥", name: "夜行披風", price: 6 },
    { id: "flower", slot: "handheld", icon: "🌻", name: "向日葵", price: 2 },
    { id: "wand", slot: "handheld", icon: "🪄", name: "螢光魔杖", price: 8 },
    { id: "rainbow", slot: "background", icon: "🌈", name: "雨後彩虹農場", price: 6 },
    { id: "snowfield", slot: "background", icon: "❄️", name: "冰雪農場", price: 7 },
    { id: "strawberry-hat", slot: "hat", icon: "🍓", name: "草莓帽", price: 3 },
    { id: "bow", slot: "hat", icon: "🎀", name: "蝴蝶結", price: 4 },
    { id: "space-helmet", slot: "hat", icon: "🪖", name: "太空頭盔", price: 9 },
    { id: "vest", slot: "clothes", icon: "🦺", name: "漁夫背心", price: 5 },
    { id: "star-cloak", slot: "clothes", icon: "🌠", name: "星空斗篷", price: 8 },
    { id: "fishing-rod", slot: "handheld", icon: "🎣", name: "釣魚竿", price: 3 },
    { id: "lollipop", slot: "handheld", icon: "🍭", name: "音符棒棒糖", price: 4 },
    { id: "lantern", slot: "handheld", icon: "🏮", name: "小提燈", price: 6 },
    { id: "spider-city", slot: "background", icon: "🌃", name: "蛛網夜城", price: 8 },
    { id: "spider-mask", slot: "hat", icon: "🕷️", name: "蛛網俠面罩", price: 9 },
    { id: "spider-suit", slot: "clothes", icon: "🦸", name: "蛛網俠戰衣", price: 11 },
    { id: "webslinger-city", slot: "background", icon: "🌆", name: "赤藍蛛網城", price: 8 },
    { id: "webslinger-mask", slot: "hat", icon: "🕸️", name: "赤藍蛛網面罩", price: 9 },
    { id: "webslinger-suit", slot: "clothes", icon: "🦸", name: "赤藍蛛網戰衣", price: 11 },
    { id: "mini-planet", slot: "background", icon: "🪐", name: "迷你星球道場", price: 8 },
    { id: "golden-flame-hair", slot: "hat", icon: "🔥", name: "爆髮金焰", price: 9 },
    { id: "battle-gi", slot: "clothes", icon: "👊", name: "橙藍鬥氣戰袍", price: 11 },
    { id: "bubble-spirit", slot: "handheld", icon: "🌺", name: "琥珀花靈", price: 9 },
    { id: "fluffy-chick", slot: "handheld", icon: "🐣", name: "絨毛雛鳥", price: 9 },
    { id: "mini-bot", slot: "handheld", icon: "🤖", name: "迷你機器人", price: 9 }
  ];
  const TEST_MODE = typeof window !== "undefined" && window.NOXCAT_TEST_MODE === true;
  let selected, purchasing = false;
  const $ = (s) => document.querySelector(s);
  const load = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const owned = () => load(OWNED_KEY, []);
  const equipped = () => ({ background: null, hat: null, clothes: null, handheld: null, ...load(EQUIPPED_KEY, {}) });
  const petState = () => load(STATE_KEY, {});
  const heartBalance = () => Math.max(0, Number(petState().hearts) || 0);
  const item = (id) => ITEMS.find((candidate) => candidate.id === id);
  const status = (text) => { $("#shop-status").textContent = text; };
  function exchangeHearts(state, mine, entry) {
    const hearts = Math.max(0, Number(state && state.hearts) || 0);
    if (!entry) return { ok: false, reason: "找不到這件道具。", state, owned: mine };
    if (mine.includes(entry.id)) return { ok: false, reason: "你已經擁有這件道具。", state, owned: mine };
    if (!TEST_MODE && hearts < entry.price) return { ok: false, reason: `愛心不足：需要 ${entry.price} 顆，目前只有 ${hearts} 顆。`, state, owned: mine };
    return { ok: true, state: { ...state, hearts: TEST_MODE ? hearts : hearts - entry.price }, owned: [...mine, entry.id] };
  }
  function render() {
    const mine = owned(), gear = equipped(), hearts = heartBalance();
    status(TEST_MODE ? `測試模式：兌換不扣愛心，目前有 ${hearts} 顆愛心。` : `目前有 ${hearts} 顆愛心；兌換道具不會連接錢包。`);
    $("#shop-items").innerHTML = ITEMS.map((entry) => {
      const hasItem = mine.includes(entry.id), affordable = TEST_MODE || hearts >= entry.price;
      const label = hasItem ? "已擁有" : affordable ? "兌換" : "愛心不足";
      return `<article class="shop-item"><span class="item-icon">${entry.icon}</span><div><strong>${entry.name}</strong><p>${entry.slot} · ♥ ${entry.price}</p></div><button data-buy="${entry.id}" ${hasItem || !affordable ? "disabled" : ""}>${label}</button></article>`;
    }).join("");
    const list = mine.map((id) => { const entry = item(id); return `<div><span>${entry.icon} ${entry.name}</span><button data-equip="${id}">${gear[entry.slot] === id ? "卸下" : "裝備"}</button></div>`; }).join("");
    $("#owned-items").hidden = !mine.length; $("#owned-list").innerHTML = list;
    document.querySelectorAll("[data-buy]").forEach((button) => button.onclick = () => confirm(item(button.dataset.buy)));
    document.querySelectorAll("[data-equip]").forEach((button) => button.onclick = () => toggleEquip(button.dataset.equip));
  }
  function confirm(entry) { selected = entry; $("#confirm-copy").textContent = TEST_MODE ? `測試模式：免費解鎖「${entry.name}」，不扣愛心。` : `使用 ${entry.price} 顆愛心兌換「${entry.name}」。`; $("#confirm-wallet-note").textContent = TEST_MODE ? "測試模式：不扣愛心、不連接錢包。" : "愛心會立即扣除；本流程不會連接錢包或發送鏈上交易。"; $("#confirm-dialog").showModal(); }
  function toggleEquip(id) { const entry = item(id), gear = equipped(); gear[entry.slot] = gear[entry.slot] === id ? null : id; save(EQUIPPED_KEY, gear); render(); window.dispatchEvent(new Event("noxcat-equipment-changed")); }
  function buy() {
    if (purchasing || !selected) return;
    purchasing = true; $("#confirm-purchase").disabled = true;
    try {
      const result = exchangeHearts(petState(), owned(), selected);
      if (!result.ok) throw new Error(result.reason);
      save(STATE_KEY, result.state); save(OWNED_KEY, result.owned);
      $("#confirm-dialog").close(); render();
      status(TEST_MODE ? `測試模式：「${selected.name}」已加入收藏，未扣愛心。` : `兌換成功！已扣除 ${selected.price} 顆愛心，道具已加入收藏。`);
      window.dispatchEvent(new Event("noxcat-state-changed"));
    } catch (error) { status(error.message || "兌換失敗，未扣除愛心。"); }
    finally { purchasing = false; $("#confirm-purchase").disabled = false; }
  }
  document.addEventListener("DOMContentLoaded", () => { $("#open-shop").onclick = () => { render(); $("#shop-dialog").showModal(); }; $("#confirm-purchase").onclick = buy; document.querySelectorAll("[data-close]").forEach((button) => button.onclick = () => $("#" + button.dataset.close).close()); });
  window.NoxCatShop = { STATE_KEY, ITEMS, exchangeHearts, render, buy };
})();
