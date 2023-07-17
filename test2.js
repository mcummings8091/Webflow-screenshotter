const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const templateUrl = 'https://gaze-webflow-template.webflow.io';
    const sitemapUrl = `${templateUrl}/sitemap.xml`;

    await page.goto(sitemapUrl, { waitUntil: 'networkidle0' });

    const response = await axios.get(sitemapUrl);
    const xml = response.data;

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    const urls = result.urlset.url.map(url => url.loc[0]);

    const screenshotsDir = path.join(__dirname, 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const filename = url.replace(/(^\w+:|^)\/\//, '').replace(/[^a-zA-Z0-9]/g, '');

      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, `${filename}.png`), fullPage: true });

      console.log(`Screenshot captured for page: ${url}`);
    }

    console.log('All screenshots captured successfully!');
    await browser.close();
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  }
})();
/*
const puppeteer = require('puppeteer');
const fs = require('fs');

async function screenshotWebflowSections(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for all the elements to load on the page
  await page.waitForSelector('.section');

  // Get the bounding rectangles of all the sections
  const sectionRects = await page.$$eval('.section', sections => {
    return sections.map(section => {
      const rect = section.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    });
  });

  // Create the "sections" folder if it doesn't exist
  const folderName = 'sections';
  fs.mkdirSync(folderName, { recursive: true });

  // Capture screenshots of all the sections
  for (let i = 0; i < sectionRects.length; i++) {
    const sectionRect = sectionRects[i];

    // Scroll to the section
    await page.evaluate((rect) => {
      window.scrollTo(rect.x, rect.y);
    }, sectionRect);

    // Wait for a brief moment to allow the content to settle
    await page.waitForTimeout(500);

    // Capture screenshot of the section
    await page.screenshot({
      path: `${folderName}/section_${i + 1}.png`,
      clip: sectionRect
    });
  }

  await browser.close();
}

// Usage: node script.js <webflow_template_url>
const webflowTemplateUrl = process.argv[2];
screenshotWebflowSections(webflowTemplateUrl)
  .then(() => console.log('Screenshots captured successfully.'))
  .catch(error => console.error('Error capturing screenshots:', error));
  */