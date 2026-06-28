const { exec } = require('child_process');
const puppeteer = require('puppeteer');
const assert = require('assert');

const waitPort = async (port, timeout = 45000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok || res.status === 404 || res.status === 200) {
        return true;
      }
    } catch (e) {
      // Ignore connection errors
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Timeout waiting for port ${port}`);
};

(async () => {
  console.log("=== Launching E2E UI Validation Test (Self-contained) ===");
  
  // Ensure port 3000 is clean
  try {
    console.log("Cleaning up port 3000 just in case...");
    exec('npx kill-port 3000');
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {}

  console.log("Starting Next.js dev server on port 3000...");
  const devServer = exec('npm run dev', {
    cwd: __dirname,
    env: { ...process.env, PORT: '3000' }
  });

  let browser;
  try {
    await waitPort(3000, 45000);
    console.log("Dev server is ready! Launching browser...");
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200 });
    
    console.log("Navigating to http://localhost:3000/...");
    const response = await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    assert.strictEqual(response.status(), 200, "Homepage must return HTTP 200");
    
    console.log("Waiting for dynamic content to render...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("--- Testing H01: Header Navigation ---");
    const headerLinks = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.custom-nav-item, nav a, nav button'));
      return items.map(item => item.textContent.trim());
    });
    console.log("Found header elements:", headerLinks.slice(0, 10));
    
    const requiredHeaderItems = ["Buy", "Rent", "Businesses", "Explore", "Resources", "About Us", "Saved", "List My Business"];
    for (const item of requiredHeaderItems) {
      const match = headerLinks.some(text => text.includes(item));
      assert.ok(match, `Navbar must contain element: "${item}"`);
    }
    console.log("✅ H01 Header checks passed successfully!");

    console.log("--- Testing H02: Hero Search Banner ---");
    const hasSearchInput = await page.evaluate(() => {
      return !!document.querySelector('form input[placeholder*="Search homes, businesses"]');
    });
    assert.ok(hasSearchInput, "Hero search banner must contain a search input");
    console.log("✅ H02 Hero Search banner checks passed!");

    console.log("--- Testing H03: Quick Search Categories ---");
    const quickCats = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href="/realty"], a[href="/business"], a[href="/merchants-media-pros"]'));
      return links.map(l => l.textContent.trim());
    });
    console.log("Found quick search category titles:", quickCats);
    assert.ok(quickCats.some(text => text.includes("Homes")), "Quick categories must contain 'Homes'");
    assert.ok(quickCats.some(text => text.includes("Businesses")), "Quick categories must contain 'Businesses'");
    assert.ok(quickCats.some(text => text.includes("Communities")), "Quick categories must contain 'Communities'");
    assert.ok(quickCats.some(text => text.includes("Media Pros")), "Quick categories must contain 'Media Pros'");
    console.log("✅ H03 Quick Search Categories checks passed!");

    console.log("--- Testing H04: Watch Video Section ---");
    const hasSpotlightVideo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(a => a.querySelector('img') && a.innerHTML.includes('bx-play'));
    });
    assert.ok(hasSpotlightVideo, "Watch section must contain at least one spotlight video with a play icon");
    console.log("✅ H04 Watch Video Section checks passed!");

    console.log("--- Testing H05: Explore Locations Map ---");
    const mapSVGContents = await page.evaluate(() => {
      const svg = document.querySelector('svg[viewBox="0 0 400 200"]');
      if (!svg) return null;
      const paths = Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('class'));
      const texts = Array.from(svg.querySelectorAll('text')).map(t => t.textContent.trim());
      return { pathsCount: paths.length, texts };
    });
    assert.ok(mapSVGContents, "Locations map SVG (viewBox 0 0 400 200) must be rendered");
    assert.strictEqual(mapSVGContents.pathsCount, 4, "Locations map must have 4 distinct colored region paths");
    console.log("Found map labels:", mapSVGContents.texts);
    const requiredLabels = ["FrederickDirections.com", "BaltimoreDirections.com", "AnnapolisDirections.com", "OceanCityDirections.com"];
    for (const label of requiredLabels) {
      assert.ok(mapSVGContents.texts.includes(label), `Map must contain labels for: ${label}`);
    }
    console.log("✅ H05 Locations Map checks passed successfully!");

    console.log("--- Testing H09: Site Footer ---");
    const footerText = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.textContent : '';
    });
    assert.ok(footerText.includes("Buy") && footerText.includes("Rent") && footerText.includes("Businesses") && footerText.includes("Explore") && footerText.includes("Company"), "Footer must contain link columns");
    assert.ok(footerText.includes("Realty Directions Network"), "Footer must mention Realty Directions Network affiliation");
    assert.ok(footerText.includes("VIDEOHOMES"), "Footer must mention VIDEOHOMES brand");
    console.log("✅ H09 Site Footer checks passed successfully!");

    // Capture visual proof of completed revamp
    const screenshotPath = `/Users/apple/.gemini/antigravity-cli/brain/380a2504-f443-4f90-bbf2-94b9bc7b2860/revamped_homepage.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved full page proof screenshot to ${screenshotPath}`);

    console.log("\n🎉 ALL E2E REVAMP UI VALIDATION TESTS COMPLETED SUCCESSFULLY! 🎉");
  } catch (err) {
    console.error("❌ Test validation failed:", err.message);
    process.exit(1);
  } finally {
    console.log("Cleaning up resources...");
    if (browser) {
      await browser.close();
    }
    devServer.kill('SIGKILL');
    process.exit(0);
  }
})();
