const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs/promises');
const fz = require('fs');
const prompt = require("prompt-sync")({ sigint: true });

(async () => {
  // Prompt user for url and optional selections
  const urlPrompt = prompt("Enter url https://");
  const choice = prompt("Would you like to add a selector? y/n ");
  let selector;
  if (choice == "y") {
    selector = prompt("Enter selector ");
  } else {
    selector = null;
  }


  const sectionAndPageShot = prompt("Would you like to enable sectionAndPageShot? y/n ");

  const url = "https://" + urlPrompt;
  const folderName = url.replace(/^(https?:\/\/)/, '');

  // Create the folder if it doesn't exist
  if (!fz.existsSync(folderName)) {
    fz.mkdirSync(folderName);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Go to page and wait until there are no network connections
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  // Get the height of the rendered page
  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();

  await scrollUpDown(page, height);

  // Full page screenshot
  await page.screenshot({
    path: path.join(folderName, 'root-page.png'),
    fullPage: true
  });

  // Checking if user added selector and if so, screenshot the selected element
  if (selector) {
    try {
      await fs.mkdir(path.join(urlPrompt, selector));
      await page.waitForSelector(selector);
      const selecShot = await page.$(selector);
      await selecShot.screenshot({
        path: path.join(folderName, selector, `${selector}.png`)
      });
    }
    // Catch error if the input selector wasn't found
    catch (TimeoutError) {
      console.log('Selected element could not be found.');
    }
  }

  // Check if user opted to enable sectionShot
  if (sectionAndPageShot == 'y') {
    
    try {
        await page.waitForSelector('.section');

        const sectionElements = await page.$$('.section');

        const screenshotsFolder = folderName+'\\sections';
        fz.mkdirSync(screenshotsFolder, { recursive: true});

        for (let i = 0; i < sectionElements.length; i++) {
            const sectionElement = sectionElements[i];
            const sectionName = await sectionElement.evaluate(el => el.getAttribute('data-wf-section'));
            const sectionFolder = path.join(screenshotsFolder, sectionName || `section_${i + 1}`);
            fz.mkdirSync(sectionFolder, { recursive: true});

            await sectionElement.scrollIntoView(); // Scroll to the section's position
            await wait(1000); // Wait for animations to complete

            const sectionScreenshotPath = path.join(sectionFolder, 'section.png');
            await sectionElement.screenshot({ path: sectionScreenshotPath });
            console.log(`Screenshots captured for section "${sectionName || `section_${i + 1}`}"`);
        }

        console.log('All screenshots captured successfully!');
    } catch (error) {
        console.error('Error capturing screenshots:', error);
    }
    
    /*
    try {
        // Adjust viewport to capture full-width elements
        await page.setViewport({
            width: 1280, // Set the desired viewport width
            height: 800, // Set an appropriate height
            deviceScaleFactor: 1,
        });


        // Get all elements that span the full width of the page
    const fullWidthElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('div'));
        const fullWidthElements = [];
  
        for (const element of elements) {
          const elementStyles = window.getComputedStyle(element);
          const width = element.offsetWidth;
          const isFullWidth =
            width >= window.innerWidth &&
            elementStyles.display !== 'none' &&
            elementStyles.visibility !== 'hidden';
  
          if (isFullWidth) {
            fullWidthElements.push(element);
          }
        }
  
        return fullWidthElements;
      });
  
      // Capture screenshots of each full-width element
      for (let i = 0; i < fullWidthElements.length; i++) {
        const elementHandle = await page.evaluateHandle((el) => el, fullWidthElements[i]);
  
        // Scroll the element into view
        await page.evaluate((el) => {
            el.scrollIntoView({ block: 'center' });
        }, elementHandle);
  
        // Wait for a short delay to ensure the element is fully visible
        await wait(80);
  
        // Capture a screenshot of the element
        await elementHandle.screenshot({
            path: '${i + 1}.png'
        });
  
        console.log(`Screenshot captured for element ${i + 1}`);
  
        // Dispose the element handle
        await elementHandle.dispose();
      }
  
      console.log('All screenshots captured successfully!');

    }
    catch (error) {
        console.log(error);
    }
    */
}
    


  await browser.close();
})();

async function scrollUpDown(page, height) {
  // Scroll to bottom of page
  const viewportHeight = page.viewport().height;
  let viewportIncr = 0;
  while (viewportIncr + viewportHeight < height) {
    await page.evaluate(_viewportHeight => {
      window.scrollBy(0, _viewportHeight);
    }, viewportHeight);
    await wait(80);
    viewportIncr = viewportIncr + viewportHeight;
  }

  // Scroll back to top
  await page.evaluate(_ => {
    window.scrollTo(0, 0);
  });

  // Some extra delay to let images load
  await wait(100);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}