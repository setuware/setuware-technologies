import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user/a8eb3acf-0796-55d5-bdc9-be41e87f4683/scratchpad/run";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell" });
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const [path, shots] of [
    ["/", [["r-about", "section:has(h2:text('One partner from strategy to launch'))"], ["r-whyus", "section[aria-labelledby=industry-heading]"]]],
    ["/about", [["r-about-page-who", "section:has(h2:text('A digital studio for'))"], ["r-about-page-founder", "section:has(h2:text('Meet our founder'))"]]],
  ]) {
    await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(120); }
    await page.waitForTimeout(800);
    const ov = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    console.log(w, path, "overflow", ov[0] > ov[1] ? `YES ${ov}` : "no");
    for (const [name, sel] of shots) {
      const el = page.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
      await el.screenshot({ path: `${OUT}/${name}-${w}.png` });
    }
    if (path === "/about") await page.screenshot({ path: `${OUT}/r-about-page-full-${w}.png`, fullPage: true });
  }
  console.log(w, "errors:", JSON.stringify(errors));
  await ctx.close();
}
await browser.close();
