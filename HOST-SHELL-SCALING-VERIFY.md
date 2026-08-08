# Shell scaling host and live verification

Run these steps from the isolated checkout after a reviewer approves the patch.
Do not apply the patch or restart a service before approval.

```bash
npm install --no-save playwright
node shell-scaling-verify.js /tmp/noxcat-shell-scaling-viewports
node paw-shell-render-verify.js /tmp/noxcat-paw-shell-viewports
node noxcat-regression-test.js
node equipment-visuals-test.js
node viewport-layout-contract-test.js
```

`shell-scaling-verify.js` writes five screenshots and both analytic and DOM
measurements.  The result must show `scrollable: false`, device width at least
91% of viewport width, and three visible button hit areas in every viewport.

After the authorized maintainer applies the approved patch to the deployment
branch, run the same browser check against the published test page (replace
the `file://` target in the script with the live URL or use an equivalent
Playwright probe) and retain the five screenshots with the deployment commit.
