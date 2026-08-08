(() => {
  const STORAGE_KEY = "noxcat-tamagotchi-v1";
  const core = window.NoxCatCore;
  // Update this table only when new paper-doll assets arrive; renderer logic is
  // intentionally independent from asset paths and item art.
  const EQUIPMENT_OVERLAYS = Object.freeze({
    "spider-city": { adult: { default: "assets/equipment/spider/spider_city-background-96px.png" } },
    "spider-mask": { adult: { default: "assets/equipment/spider/spider_mask-hat-overlay-48px.png" } },
    "spider-suit": { adult: { default: "assets/equipment/spider/spider_suit-clothes-overlay-48px.png" } },
    // Verification-only: provided preview images prove per-mood replacement.
    "spider-preview": { adult: {
      normal: "assets/equipment/spider/preview-dressed-normal-48px.png",
      happy: "assets/equipment/spider/preview-dressed-happy-48px.png",
      hungry: "assets/equipment/spider/preview-dressed-hungry-48px.png",
      sick: "assets/equipment/spider/preview-dressed-sick-48px.png"
    } }
  });
  const EQUIPMENT_SLOT_ORDER = ["background", "hat", "clothes", "handheld"];
  const EQUIPMENT_Z_INDEX = { background: 1, hat: 3, clothes: 4, handheld: 5 };
  const now = () => Date.now(); const $ = (s) => document.querySelector(s);
  let state;
  let selectedMenu = 0;
  const load = () => { try { return core.normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)), now()); } catch { return core.freshState(now()); } };
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const equipped = () => { try { return { background: null, hat: null, clothes: null, handheld: null, ...JSON.parse(localStorage.getItem(core.EQUIPMENT_KEY)) }; } catch { return { background: null, hat: null, clothes: null, handheld: null }; } };
  const message = (text) => { $("#message").textContent = text; };
  const remaining = (ms) => `約 ${Math.max(1, Math.ceil(Math.max(0, ms) / 3600000))} 小時`;
  const stageName = { egg: "蛋", kitten: "幼貓", teen: "少年貓", adult: "成貓" };
  const moodName = { normal: "精神飽滿", happy: "開心到發亮", hungry: "肚子餓了", sick: "正在醫院" };
  const overlayPathFor = (itemId, stage, mood) => {
    const byStage = EQUIPMENT_OVERLAYS[itemId] && EQUIPMENT_OVERLAYS[itemId][stage];
    return byStage && (byStage[mood] || byStage.default) || null;
  };
  const overlayLayersFor = (gear, stage, mood) => EQUIPMENT_SLOT_ORDER.map((slot) => {
    const itemId = gear && gear[slot], path = itemId && overlayPathFor(itemId, stage, mood);
    return path ? { slot, itemId, path } : null;
  }).filter(Boolean);
  function renderEquipmentVisuals(gear, stage, mood) {
    const container = $("#equipped-visual"); if (!container) return [];
    const layers = overlayLayersFor(gear, stage, mood);
    container.replaceChildren(...layers.map(({ slot, itemId, path }) => {
      const image = document.createElement("img");
      image.className = `equipment-overlay equipment-overlay--${slot}`;
      image.dataset.slot = slot; image.dataset.itemId = itemId; image.src = path; image.alt = "";
      image.style.zIndex = EQUIPMENT_Z_INDEX[slot];
      return image;
    }));
    return layers;
  }
  window.NoxCatEquipmentVisuals = Object.freeze({ EQUIPMENT_OVERLAYS, EQUIPMENT_SLOT_ORDER, overlayPathFor, overlayLayersFor, renderEquipmentVisuals });
  function animateCare(kind) {
    if (kind !== "feed" && kind !== "play" && kind !== "clean") return;
    const cat = $("#cat"), frame = cat.parentElement, className = `care-${kind}`;
    cat.classList.remove("care-feed", "care-play", "care-clean"); void cat.offsetWidth; cat.classList.add(className);
    const effect = document.createElement("span"); effect.setAttribute("aria-hidden", "true");
    if (kind === "clean") {
      effect.className = "care-bubbles";
      [["16px","14%","18%","0ms"],["30px","43%","9%","35ms"],["22px","70%","22%","10ms"],["38px","18%","47%","55ms"],["18px","58%","43%","20ms"],["28px","76%","56%","70ms"],["24px","36%","70%","40ms"],["34px","61%","73%","85ms"]].forEach(([size, x, y, delay]) => {
        const bubble = document.createElement("span"); bubble.className = "care-bubble";
        bubble.style.setProperty("--bubble-size", size); bubble.style.setProperty("--bubble-x", x); bubble.style.setProperty("--bubble-y", y); bubble.style.setProperty("--bubble-delay", delay); effect.append(bubble);
      });
    } else {
      effect.className = `care-icon care-icon--${kind}`; effect.textContent = ({ feed: "🍚", play: "🎣" })[kind];
    }
    frame.append(effect); setTimeout(() => { cat.classList.remove(className); effect.remove(); }, 550);
  }
  function render() {
    state = core.normalize(state, now()); save();
    const mood = core.mood(state, now()), stage = core.stageFor(state.activeDays), hospital = core.isHospitalized(state, now()), key = core.dayKey(state.maxSeenAt), gear = equipped();
    $("#cat").src = core.spriteFor(stage, mood); $("#cat").alt = `${state.name || "NOX 喵喵喵"}：${moodName[mood]}`;
    renderEquipmentVisuals(gear, stage, mood);
    const stageLabel = $("#stage"); if (stageLabel) stageLabel.textContent = stageName[stage]; $("#mood").textContent = moodName[mood]; $("#hearts").textContent = state.hearts;
    $("#welcome").textContent = state.name ? `${state.name} 的農場日記` : "每天陪牠一下，收成愛心。";
    $("#warning").hidden = !core.warningDue(state, now()); $("#hospital").hidden = !hospital; $("#menu").hidden = hospital; $(".device-controls").hidden = hospital;
    const mealCount = state.feeds[key] || 0; $("#feed-label").textContent = mealCount >= 3 ? "今天吃飽了" : `餵食 ${mealCount + 1}/3`;
    const harvest = $("#harvest"), available = core.canHarvest(state, now()) && !hospital, bonus = core.equipmentBonus(gear);
    harvest.disabled = !available; harvest.textContent = available ? `收成今日愛心 +${1 + bonus}` : `明天再來（${remaining(state.lastHarvestAt + core.DAY - state.maxSeenAt)}）`;
    $("#equipment-bonus").textContent = bonus ? `已裝備 ${bonus} 格：所有愛心 +${bonus}` : "裝備付費道具可增加愛心";
    document.querySelectorAll("[data-menu-item]").forEach((item, index) => item.classList.toggle("is-selected", index === selectedMenu));
  }
  function care(kind) { const result = core.care(state, kind, now(), equipped()); state = result.state; save(); render(); if (!result.ok) return message(result.reason === "meals-full" ? "今天三餐已經準備好了。" : "牠正在醫院休息。"); animateCare(kind); message(result.bonus ? `互動完成！餵食＋玩耍額外獲得 ${result.bonus} 顆愛心。` : ({ feed: "吃飽飽！", play: "玩得好開心！", clean: "洗香香了！" })[kind]); }
  function harvestHearts() { const result = core.harvest(state, now(), equipped()); state = result.state; save(); render(); message(result.awarded ? `收下 ${result.awarded} 顆愛心！` : "今天的愛心已經收成過了。"); }
  function openNameDialog() { $("#pet-name").value = state.name; $("#name-dialog").showModal(); }
  function moveMenu(direction) { selectedMenu = core.moveMenuCursor(selectedMenu, direction); render(); }
  function confirmMenuSelection() {
    const action = {
      feed: () => care("feed"), play: () => care("play"), clean: () => care("clean"), harvest: harvestHearts,
      share: sharePet, name: openNameDialog, shop: () => $("#open-shop").click()
    }[core.menuItemAt(selectedMenu)];
    action();
  }
  async function makeShareCard() {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 630; const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1A1A1A"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#AAFF00"; ctx.fillRect(0, 0, canvas.width, 26); ctx.fillStyle = "#fff"; ctx.font = "bold 60px sans-serif"; ctx.fillText(state.name || "NOX 喵喵喵", 70, 120); ctx.font = "32px sans-serif"; ctx.fillStyle = "#AAFF00"; ctx.fillText(`${stageName[core.stageFor(state.activeDays)]} · ♥ ${state.hearts}`, 70, 178);
    const image = new Image(); image.src = $("#cat").src; await image.decode(); ctx.imageSmoothingEnabled = false; ctx.drawImage(image, 760, 140, 330, 330); ctx.fillStyle = "#fff"; ctx.font = "bold 42px sans-serif"; ctx.fillText("NOXCAT FARM", 70, 560);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }
  async function sharePet() {
    try { const blob = await makeShareCard(), file = new File([blob], "noxcat-pet.png", { type: "image/png" }); let complete = false;
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ title: "我的 NOX 喵喵喵", text: `${state.name || "NOX 喵喵喵"} 的農場日記`, files: [file] }); complete = true; }
      else { const url = URL.createObjectURL(blob), link = Object.assign(document.createElement("a"), { href: url, download: "noxcat-pet.png" }); link.click(); URL.revokeObjectURL(url); complete = true; }
      if (complete) { const result = core.share(state, now(), equipped()); state = result.state; save(); render(); message(`分享完成，獲得 ${result.awarded} 顆愛心！`); }
    } catch (error) { if (error && error.name !== "AbortError") message("分享卡建立失敗，請再試一次。"); }
  }
  document.addEventListener("DOMContentLoaded", () => {
    state = load(); render();
    if (!state.name) $("#name-dialog").showModal(); $("#pet-name").value = state.name;
    $("#harvest").addEventListener("click", harvestHearts);
    $("#confirm-follow").addEventListener("click", () => { state = core.revive(state, now()); save(); render(); message("謝謝你的支持！牠已經康復。") });
    $("#share").addEventListener("click", sharePet); $("#open-settings").addEventListener("click", openNameDialog);
    $("#save-name").addEventListener("click", () => { const name = $("#pet-name").value.trim(); if (name) { state.name = name; save(); render(); } });
    $("#menu-left").addEventListener("click", () => moveMenu(-1)); $("#menu-right").addEventListener("click", () => moveMenu(1)); $("#menu-confirm").addEventListener("click", confirmMenuSelection);
    window.addEventListener("noxcat-equipment-changed", render);
  });
})();
