"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");

const source = fs.readFileSync("tamagotchi.js", "utf8");
const css = fs.readFileSync("tamagotchi.css", "utf8");
for (const asset of [
  "assets/care/noxcat-prop-feed-bowl-20x16.png",
  "assets/care/noxcat-prop-play-yarn-ball-34x34.png",
  "assets/care/noxcat-prop-clean-fullbody-48x48.png"
]) {
  assert.ok(source.includes(asset), `${asset} must be wired into animateCare`);
  assert.ok(fs.existsSync(asset), `${asset} must be committed`);
}
assert.doesNotMatch(source, /🍚|🎣|care-bubble|care-bubbles/);
assert.ok(css.includes(".care-effect--feed{width:60px;height:48px}"));
assert.ok(css.includes(".care-effect--play{left:60px;top:-62px;width:102px;height:102px;transform-origin:50% 100%}"));
assert.ok(css.includes(".care-effect--clean{inset:0;width:144px;height:144px}"));
assert.doesNotMatch(css, /\.care-bubble/);
assert.match(source, /animateCare\(kind, core\.stageFor\(state\.activeDays\)\)/);
childProcess.execFileSync("python3", ["-c", String.raw`
import re
from pathlib import Path
from PIL import Image

source = Path("tamagotchi.js").read_text()
positions = {
    stage: tuple(map(int, re.search(
        rf"{stage}: Object\.freeze\(\{{ left: (\d+), top: (\d+) \}}\)", source
    ).groups()))
    for stage in ("kitten", "teen", "adult")
}
assert set(positions) == {"kitten", "teen", "adult"}, "feed needs positions for every character stage"
bowl = Image.open("assets/care/noxcat-prop-feed-bowl-20x16.png").convert("RGBA").resize((60, 48), Image.Resampling.NEAREST)

# The animation ends with translateY(-8px). Validate that its highest position
# still leaves every original white cuff pixel visible, rather than merely
# asserting the CSS numbers that this test expects.
for stage, prefix in (("kitten", "kitten"), ("teen", "teen"), ("adult", "noxcat")):
    left, top = positions[stage]
    for mood in ("happy", "hungry", "normal", "sick"):
        base = Image.open(f"assets/{prefix}-{mood}.png").convert("RGBA").resize((144, 144), Image.Resampling.NEAREST)
        composite = base.copy()
        composite.alpha_composite(bowl, (left, top - 8))
        for side, x_range in (("left", range(0, 72)), ("right", range(72, 144))):
            cuff_pixels = [
                (x, y) for y in range(80, 130) for x in x_range
                if base.getpixel((x, y))[:3] == (255, 255, 255)
            ]
            assert cuff_pixels, f"{stage}-{mood} {side} cuff reference pixels missing"
            obscured = [point for point in cuff_pixels if composite.getpixel(point) != base.getpixel(point)]
            assert not obscured, f"feed bowl obscures {stage}-{mood} {side} white cuff at {obscured[:3]}"
`], { stdio: "inherit" });
console.log("care illustration effect tests passed");
