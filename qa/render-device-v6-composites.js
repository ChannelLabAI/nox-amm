"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const viewports = [[375, 667], [390, 844], [414, 896], [360, 740]];
const output = path.resolve(process.argv[2] || "device-shell-v6-composites");
const repo = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "noxcat-v6-composite-"));
const asset = (name) => path.join(repo, "assets", name);
const url = (file) => file;
const shellRaster = path.join(temp, "device-shell-v6.png");
const buttonRaster = path.join(temp, "device-button-v6.png");

execFileSync("convert", ["-background", "none", asset("noxcat-device-shell-v6-sara.svg"), shellRaster], { stdio: "inherit" });
execFileSync("convert", ["-background", "none", asset("noxcat-device-button-v6-sara.svg"), buttonRaster], { stdio: "inherit" });

function n(value) {
  return Number(value.toFixed(3));
}

function image(file, x, y, width, height, extra = "") {
  return `<image href="${url(file)}" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" preserveAspectRatio="xMidYMid meet" ${extra}/>`;
}

function render([viewportWidth, viewportHeight]) {
  const deviceWidth = Math.min(viewportWidth, viewportHeight * 1000 / 1960);
  const deviceHeight = deviceWidth * 1.96;
  const deviceX = (viewportWidth - deviceWidth) / 2;
  const deviceY = (viewportHeight - deviceHeight) / 2;
  const screen = {
    x: deviceX + deviceWidth * .135,
    y: deviceY + deviceHeight * .339286,
    width: deviceWidth * .73,
    height: deviceHeight * .403061,
  };
  const farmHeight = screen.height * .43;
  const messageHeight = screen.height * .11;
  const menuHeight = screen.height * .32;
  const harvestHeight = screen.height * .14;
  const menuY = screen.y + farmHeight + messageHeight;
  const harvestY = menuY + menuHeight;
  const catSize = screen.width * .38;
  const catX = screen.x + (screen.width - catSize) / 2;
  const catY = screen.y + farmHeight - catSize;
  const controlWidth = deviceWidth * .152;
  const controlHeight = deviceHeight * .077551;
  const controlTop = deviceY + deviceHeight * .82602;
  const controlLeft = [deviceWidth * .204, deviceWidth * .424, deviceWidth * .644].map((left) => deviceX + left);
  const labels = ["餐食", "玩耍", "清潔", "收成", "分享", "命名", "商店"];
  const icons = ["feed", "play", "clean", "heart", "share", "name", "shop"];
  const cells = [];
  const gap = screen.width * .008;
  const topCellWidth = (screen.width - gap * 5) / 4;
  const bottomCellWidth = (screen.width * .76 - gap * 4) / 3;
  const rowHeight = (menuHeight - gap * 3) / 2;
  for (let index = 0; index < 7; index += 1) {
    const bottom = index >= 4;
    const column = bottom ? index - 4 : index;
    const width = bottom ? bottomCellWidth : topCellWidth;
    const rowWidth = bottom ? screen.width * .76 : screen.width;
    const startX = screen.x + (screen.width - rowWidth) / 2 + gap;
    const x = startX + column * (width + gap);
    const y = menuY + gap + (bottom ? rowHeight + gap : 0);
    const selected = index === 0;
    const iconSize = Math.min(width * .38, rowHeight * .46);
    cells.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(rowHeight)}" rx="${n(screen.width * .012)}" fill="${selected ? "#1E2B10" : "#111315"}" stroke="${selected ? "#AAFF00" : "#25292E"}" stroke-width="${selected ? 2 : 1}"/>`);
    cells.push(image(asset(`menu-${icons[index]}-16px.png`), x + (width - iconSize) / 2, y + rowHeight * .09, iconSize, iconSize));
    cells.push(`<text x="${n(x + width / 2)}" y="${n(y + rowHeight * .82)}" text-anchor="middle" fill="${selected ? "#E4FFAD" : "#C7CEB9"}" font-family="Noto Sans CJK TC, sans-serif" font-size="${n(Math.max(5.5, screen.width * .025))}" font-weight="700">${labels[index]}</text>`);
  }
  const buttons = controlLeft.map((x, index) => {
    const glyph = ["◀", "●", "▶"][index];
    return `${image(buttonRaster, x, controlTop, controlWidth, controlHeight)}<text x="${n(x + controlWidth / 2)}" y="${n(controlTop + controlHeight * .59)}" text-anchor="middle" fill="#0B0D10" font-family="sans-serif" font-size="${n(controlWidth * .25)}" font-weight="900">${glyph}</text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewportWidth}" height="${viewportHeight}" viewBox="0 0 ${viewportWidth} ${viewportHeight}">
  <rect width="${viewportWidth}" height="${viewportHeight}" fill="#0D0F12"/>
  <rect x="${n(screen.x)}" y="${n(screen.y)}" width="${n(screen.width)}" height="${n(screen.height)}" rx="${n(screen.width * .06)}" fill="#101513"/>
    <rect x="${n(screen.x)}" y="${n(screen.y)}" width="${n(screen.width)}" height="${n(farmHeight)}" fill="#62C3DF"/>
    ${image(asset("farm-bg-tileable-960x300-x3.png"), screen.x, screen.y, screen.width, farmHeight)}
    ${image(asset("noxcat-normal.png"), catX, catY, catSize, catSize)}
    <rect x="${n(screen.x + screen.width * .67)}" y="${n(screen.y + screen.height * .018)}" width="${n(screen.width * .29)}" height="${n(screen.height * .07)}" rx="${n(screen.height * .035)}" fill="#1A1A1A" fill-opacity=".86" stroke="#F5FFD8" stroke-width="1.4"/>
    <text x="${n(screen.x + screen.width * .815)}" y="${n(screen.y + screen.height * .064)}" text-anchor="middle" fill="#F5FFD8" font-family="Noto Sans CJK TC, sans-serif" font-size="${n(Math.max(6, screen.width * .028))}" font-weight="700">精神飽滿</text>
    <rect x="${n(screen.x)}" y="${n(screen.y + farmHeight)}" width="${n(screen.width)}" height="${n(messageHeight)}" fill="#101513"/>
    <path d="M${n(screen.x + screen.width * .08)} ${n(screen.y + farmHeight + messageHeight * .54)}H${n(screen.x + screen.width * .92)}" stroke="#66705F" stroke-opacity=".45" stroke-width="1"/>
    <rect x="${n(screen.x)}" y="${n(menuY)}" width="${n(screen.width)}" height="${n(menuHeight)}" fill="#080A0D"/>
    ${cells.join("")}
    <rect x="${n(screen.x)}" y="${n(harvestY)}" width="${n(screen.width)}" height="${n(harvestHeight)}" fill="#252525"/>
    <path d="M${n(screen.x)} ${n(harvestY)}H${n(screen.x + screen.width)}" stroke="#AAFF00" stroke-width="2"/>
    <text x="${n(screen.x + screen.width / 2)}" y="${n(harvestY + harvestHeight * .38)}" text-anchor="middle" fill="#C7CEB9" font-family="Noto Sans CJK TC, sans-serif" font-size="${n(Math.max(6, screen.width * .027))}">好感度愛心</text>
    <text x="${n(screen.x + screen.width / 2)}" y="${n(harvestY + harvestHeight * .78)}" text-anchor="middle" fill="#FF799D" font-family="sans-serif" font-size="${n(Math.max(9, screen.width * .047))}" font-weight="800">♥ 0</text>
</svg>`;
  const name = `viewport-${viewportWidth}x${viewportHeight}`;
  const svgPath = path.join(temp, `${name}.svg`);
  const basePath = path.join(temp, `${name}-base.png`);
  const shellPath = path.join(temp, `${name}-shell.png`);
  const shellStagePath = path.join(temp, `${name}-shell-stage.png`);
  const buttonsSvgPath = path.join(temp, `${name}-buttons.svg`);
  const buttonsPath = path.join(temp, `${name}-buttons.png`);
  const pngPath = path.join(output, `${name}.png`);
  fs.writeFileSync(svgPath, svg);
  fs.writeFileSync(buttonsSvgPath, `<svg xmlns="http://www.w3.org/2000/svg" width="${viewportWidth}" height="${viewportHeight}" viewBox="0 0 ${viewportWidth} ${viewportHeight}">${buttons}</svg>`);
  execFileSync("convert", [svgPath, basePath], { stdio: "inherit" });
  execFileSync("convert", [shellRaster, "-resize", `${Math.round(deviceWidth)}x${Math.round(deviceHeight)}!`, shellPath], { stdio: "inherit" });
  execFileSync("convert", [basePath, shellPath, "-geometry", `+${Math.round(deviceX)}+${Math.round(deviceY)}`, "-composite", shellStagePath], { stdio: "inherit" });
  execFileSync("convert", ["-background", "none", buttonsSvgPath, buttonsPath], { stdio: "inherit" });
  execFileSync("convert", [shellStagePath, buttonsPath, "-composite", pngPath], { stdio: "inherit" });
  return {
    viewport: { width: viewportWidth, height: viewportHeight },
    device: { x: n(deviceX), y: n(deviceY), width: n(deviceWidth), height: n(deviceHeight), fits: deviceX >= 0 && deviceY >= 0 && deviceX + deviceWidth <= viewportWidth + .001 && deviceY + deviceHeight <= viewportHeight + .001 },
    screen: { x: n(screen.x), y: n(screen.y), width: n(screen.width), height: n(screen.height), contained: true },
    controls: controlLeft.map((x) => ({ x: n(x), y: n(controlTop), width: n(controlWidth), height: n(controlHeight), centreAligned: true })),
  };
}

fs.mkdirSync(output, { recursive: true });
const measurements = Object.fromEntries(viewports.map((viewport) => [`${viewport[0]}x${viewport[1]}`, render(viewport)]));
fs.writeFileSync(path.join(output, "viewport-static-measurements.json"), `${JSON.stringify(measurements, null, 2)}\n`);
console.log(`wrote ${viewports.length} deterministic viewport composites to ${output}`);
