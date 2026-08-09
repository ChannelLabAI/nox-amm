# Shell scaling host and live verification

Run these steps from the isolated checkout after a reviewer approves the patch.
Do not apply the patch or restart a service before approval.

```bash
npm install --no-save playwright
node shell-scaling-verify.js /tmp/noxcat-shell-scaling-viewports
node paw-shell-render-verify.js /tmp/noxcat-device-shell-v6-viewports
node device-shell-v6-test.js
node noxcat-regression-test.js
node equipment-visuals-test.js
node viewport-layout-contract-test.js
```

`shell-scaling-verify.js` writes five screenshots and both analytic and DOM
measurements.  The result must show `scrollable: false`, device width equal to
the maximum allowed by the fitted 1000:1960 geometry, and three visible button
hit areas in every viewport. The historical `paw-shell-render-verify.js`
filename now checks the v6 screen opening and all three v6 control centres at
375x667, 390x844, 414x896, and 360x740.

After the authorized maintainer applies the approved patch to the deployment
branch, run the same browser check against the published test page (replace
the `file://` target in the script with the live URL or use an equivalent
Playwright probe) and retain the five screenshots with the deployment commit.
