const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function screenshotWebflowSections(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForSelector('.section');

    const sectionElements = await page.$$('.section');

    const screenshotsFolder = 'sections';
    fs.mkdirSync(screenshotsFolder, { recursive: true });

    for (let i = 0; i < sectionElements.length; i++) {
      const sectionElement = sectionElements[i];
      const sectionName = await sectionElement.evaluate(el => el.getAttribute('data-wf-section'));
      const sectionFolder = path.join(screenshotsFolder, sectionName || `section_${i + 1}`);
      fs.mkdirSync(sectionFolder, { recursive: true });

      await sectionElement.scrollIntoView(); // Scroll to the section's position
      await wait(1000); // Wait for animations to complete

      const elements = await sectionElement.$$('*');
      const elementCounts = {};

      for (let j = 0; j < elements.length; j++) {
        const element = elements[j];
        const elementClassName = await element.evaluate(el => el.className);

        // Check if the element has a valid width before capturing the screenshot
        const boundingBox = await element.boundingBox();
        if (boundingBox && boundingBox.width > 0) {
          const elementIndex = elementCounts[elementClassName] || 1;
          elementCounts[elementClassName] = elementIndex + 1;

          const elementScreenshotPath = path.join(sectionFolder, `${elementClassName}_${elementIndex}.png`);
          await element.screenshot({ path: elementScreenshotPath });
        }
      }

      const sectionScreenshotPath = path.join(sectionFolder, 'section.png');
      await sectionElement.screenshot({ path: sectionScreenshotPath });
      console.log(`Screenshots captured for section "${sectionName || `section_${i + 1}`}"`);
    }

    console.log('All screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Usage: node script.js <webflow_template_url>
const webflowTemplateUrl = process.argv[2];
screenshotWebflowSections(webflowTemplateUrl);