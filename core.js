(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NoxCatCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const DAY = 86400000;
  const NEGLECT_DAYS = 3;
  const EQUIPMENT_KEY = "noxcat_equipped";
  const SLOTS = ["background", "hat", "clothes", "handheld"];
  const dayKey = (time) => new Date(time).toISOString().slice(0, 10);
  const freshState = (now) => ({ bornAt: now, maxSeenAt: now, lastCareAt: now, lastHarvestAt: 0, hearts: 0, activeDays: 0, activeDay: "", feeds: {}, playedDays: {}, bonusDays: {}, name: "", revived: false });
  function normalize(state, now) {
    const source = state || {};
    const safeNow = Math.max(Number(now) || 0, Number(source.maxSeenAt) || 0);
    return { ...freshState(safeNow), ...source, maxSeenAt: safeNow, feeds: source.feeds || {}, playedDays: source.playedDays || {}, bonusDays: source.bonusDays || {} };
  }
  const effectiveNow = (state, now) => Math.max(Number(now) || 0, state.maxSeenAt || 0);
  const isHospitalized = (state, now) => effectiveNow(state, now) - state.lastCareAt >= NEGLECT_DAYS * DAY;
  const warningDue = (state, now) => !isHospitalized(state, now) && effectiveNow(state, now) - state.lastCareAt >= 2 * DAY;
  function mood(state, now) {
    if (isHospitalized(state, now)) return "sick";
    if (warningDue(state, now) || effectiveNow(state, now) - state.lastCareAt >= DAY) return "hungry";
    const key = dayKey(effectiveNow(state, now));
    return state.playedDays[key] ? "happy" : "normal";
  }
  function stageFor(activeDays) { return activeDays <= 2 ? "egg" : activeDays <= 8 ? "kitten" : activeDays <= 15 ? "teen" : "adult"; }
  const spritePrefixFor = (stage) => ({ kitten: "kitten", teen: "teen", adult: "noxcat" })[stage] || "noxcat";
  const spriteFor = (stage, catMood) => `assets/${spritePrefixFor(stage)}-${catMood}.png`;
  function equipmentBonus(equipped) { return SLOTS.reduce((total, slot) => total + (equipped && equipped[slot] ? 1 : 0), 0); }
  function award(state, base, equipped) { const amount = base + equipmentBonus(equipped); state.hearts += amount; return amount; }
  function care(state, kind, now, equipped) {
    const next = normalize(state, now); const key = dayKey(next.maxSeenAt);
    if (isHospitalized(next, now)) return { state: next, ok: false, reason: "hospital" };
    if (kind === "feed" && (next.feeds[key] || 0) >= 3) return { state: next, ok: false, reason: "meals-full" };
    if (next.activeDay !== key) { next.activeDay = key; next.activeDays += 1; }
    if (kind === "feed") next.feeds[key] = (next.feeds[key] || 0) + 1;
    if (kind === "play") next.playedDays[key] = true;
    next.lastCareAt = next.maxSeenAt;
    let bonus = 0;
    if ((next.feeds[key] || 0) > 0 && next.playedDays[key] && !next.bonusDays[key]) { next.bonusDays[key] = true; bonus = award(next, 1, equipped); }
    return { state: next, ok: true, bonus, feedsToday: next.feeds[key] };
  }
  function canHarvest(state, now) { return effectiveNow(state, now) - state.lastHarvestAt >= DAY; }
  function harvest(state, now, equipped) {
    const next = normalize(state, now);
    if (!canHarvest(next, now) || isHospitalized(next, now)) return { state: next, awarded: 0 };
    next.lastHarvestAt = next.maxSeenAt;
    return { state: next, awarded: award(next, 1, equipped) };
  }
  function share(state, now, equipped) { const next = normalize(state, now); return { state: next, awarded: award(next, 1, equipped) }; }
  function revive(state, now) { const next = normalize(state, now); next.lastCareAt = next.maxSeenAt; next.revived = true; return next; }
  return { DAY, NEGLECT_DAYS, EQUIPMENT_KEY, SLOTS, dayKey, freshState, normalize, isHospitalized, warningDue, mood, stageFor, spritePrefixFor, spriteFor, equipmentBonus, care, canHarvest, harvest, share, revive };
});
