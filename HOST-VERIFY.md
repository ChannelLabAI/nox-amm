# Host visual verification

The isolated checkout passes its Node renderer tests. Chrome cannot run in the
Codex sandbox (`setsockopt: Operation not permitted`), so an authorized host
runner must capture the AC4 screenshots before approving:

1. Open `tamagotchi-test.html`; this page alone enables `window.NoxCatTest`.
   In DevTools run `NoxCatTest.setStage("adult")`. It returns `true`; the
   normal `tamagotchi.html` page must not expose `window.NoxCatTest`.
2. Buy and equip each item from the test-mode shop, capturing a screenshot per
   item: `sunset`, `night`, `cap`, `crown`, `apron`, `cape`, `flower`, `wand`,
   `spider-city`, `spider-mask`, and `spider-suit`.
3. For each background item, inspect `#equipped-background img` and confirm
   its rendered bounds equal the full `.farm` bounds. Confirm it sits behind
   `#cat`; the background must not be in `#equipped-visual`.
4. For each hat/clothes/handheld item, inspect `#equipped-visual img` and
   confirm its bounds equal `.cat-frame`, with the image visible over the cat.
5. Save the 11 screenshots with the review evidence. There must be no broken
   image or JavaScript-console error.
