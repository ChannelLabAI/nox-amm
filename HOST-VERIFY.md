# Host visual verification

The isolated checkout passes its Node renderer tests. Chrome cannot run in the
Codex sandbox (`setsockopt: Operation not permitted`), so run this on a normal
host before approving:

1. Open `tamagotchi-test.html` from this checkout in Chrome DevTools and set:

   ```js
   localStorage.setItem("noxcat-tamagotchi-v1", JSON.stringify({
     bornAt: Date.now() - 20 * 86400000, maxSeenAt: Date.now(),
     lastCareAt: Date.now(), lastHarvestAt: 0, hearts: 0, activeDays: 20,
     activeDay: "", feeds: {}, playedDays: {}, bonusDays: {}, name: "", revived: false
   }));
   localStorage.setItem("noxcat_equipped", JSON.stringify({background:"spider-city",hat:"spider-mask",clothes:"spider-suit",handheld:null}));
   location.reload();
   ```

2. Confirm three `#equipped-visual img` elements render in this order:
   `background`, `hat`, `clothes`; background is behind `#cat`, while hat and
   clothes are above it.
3. In DevTools run `localStorage.setItem("noxcat_equipped", "{}")` and reload.
   Confirm `#equipped-visual` is empty.
4. Set `{"hat":"cap"}` and reload. Confirm it remains empty and Console has
   no broken-image or JavaScript error.
5. For the mood mapping proof, set `{"clothes":"spider-preview"}`, trigger
   each mood in the existing game, and verify the selected image path changes
   among the four `preview-dressed-*-48px.png` entries. Changing only the
   `EQUIPMENT_OVERLAYS` table is sufficient to point future art at new paths.
