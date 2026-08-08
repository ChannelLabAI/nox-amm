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
    { id: "spider-city", slot: "background", icon: "🌃", name: "蛛網夜城", price: 8 },
    { id: "spider-mask", slot: "hat", icon: "🕷️", name: "蛛網俠面罩", price: 9 },
    { id: "spider-suit", slot: "clothes", icon: "🦸", name: "蛛網俠戰衣", price: 11 }
  ];
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
    if (hearts < entry.price) return { ok: false, reason: `愛心不足：需要 ${entry.price} 顆，目前只有 ${hearts} 顆。`, state, owned: mine };
    return { ok: true, state: { ...state, hearts: hearts - entry.price }, owned: [...mine, entry.id] };
  }
  function render() {
    const mine = owned(), gear = equipped(), hearts = heartBalance();
    status(`目前有 ${hearts} 顆愛心；兌換道具不會連接錢包。`);
    $("#shop-items").innerHTML = ITEMS.map((entry) => {
      const hasItem = mine.includes(entry.id), affordable = hearts >= entry.price;
      const label = hasItem ? "已擁有" : affordable ? "兌換" : "愛心不足";
      return `<article class="shop-item"><span class="item-icon">${entry.icon}</span><div><strong>${entry.name}</strong><p>${entry.slot} · ♥ ${entry.price}</p></div><button data-buy="${entry.id}" ${hasItem || !affordable ? "disabled" : ""}>${label}</button></article>`;
    }).join("");
    const list = mine.map((id) => { const entry = item(id); return `<div><span>${entry.icon} ${entry.name}</span><button data-equip="${id}">${gear[entry.slot] === id ? "卸下" : "裝備"}</button></div>`; }).join("");
    $("#owned-items").hidden = !mine.length; $("#owned-list").innerHTML = list;
    document.querySelectorAll("[data-buy]").forEach((button) => button.onclick = () => confirm(item(button.dataset.buy)));
    document.querySelectorAll("[data-equip]").forEach((button) => button.onclick = () => toggleEquip(button.dataset.equip));
  }
  function confirm(entry) { selected = entry; $("#confirm-copy").textContent = `使用 ${entry.price} 顆愛心兌換「${entry.name}」。`; $("#confirm-dialog").showModal(); }
  function toggleEquip(id) { const entry = item(id), gear = equipped(); gear[entry.slot] = gear[entry.slot] === id ? null : id; save(EQUIPPED_KEY, gear); render(); window.dispatchEvent(new Event("noxcat-equipment-changed")); }
  function buy() {
    if (purchasing || !selected) return;
    purchasing = true; $("#confirm-purchase").disabled = true;
    try {
      const result = exchangeHearts(petState(), owned(), selected);
      if (!result.ok) throw new Error(result.reason);
      save(STATE_KEY, result.state); save(OWNED_KEY, result.owned);
      $("#confirm-dialog").close(); render();
      status(`兌換成功！已扣除 ${selected.price} 顆愛心，道具已加入收藏。`);
      window.dispatchEvent(new Event("noxcat-state-changed"));
    } catch (error) { status(error.message || "兌換失敗，未扣除愛心。"); }
    finally { purchasing = false; $("#confirm-purchase").disabled = false; }
  }
  document.addEventListener("DOMContentLoaded", () => { $("#open-shop").onclick = () => { render(); $("#shop-dialog").showModal(); }; $("#confirm-purchase").onclick = buy; document.querySelectorAll("[data-close]").forEach((button) => button.onclick = () => $("#" + button.dataset.close).close()); });
  window.NoxCatShop = { STATE_KEY, ITEMS, exchangeHearts, render, buy };
})();
