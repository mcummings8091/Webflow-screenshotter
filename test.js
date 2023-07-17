const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const url = 'https://gaze-webflow-template.webflow.io'; // Replace with your webflow template URL
    const folderName = url.replace(/^(https?:\/\/)/, '');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    // Scroll to the bottom of the page
    await autoScroll(page);

    const divElements = await page.$$('div');
    const classNames = {};

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    for (let i = 0; i < divElements.length; i++) {
      const divElement = divElements[i];
      const className = await divElement.evaluate(el => el.className);
      const fileName = classNames[className] ? `${className}_${classNames[className]}.png` : `${className}.png`;

      if (classNames[className]) {
        classNames[className]++;
      } else {
        classNames[className] = 1;
      }

      try {
        // Capture the screenshot of the div element
        await divElement.screenshot({ path: `${folderName}/${fileName}` });
        console.log(`Screenshot captured for div with class: ${className}`);
      } catch (error) {
        console.error(`Error occurred for div with class: ${className}`, error);
      }
    }

    await browser.close();
    console.log('Screenshot capturing completed!');
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}






/*
(async() => {

    
    const urlPrompt = prompt("Enter url https://");

    url = "https://"+urlPrompt;


    fs.mkdir(urlPrompt);


    const browser = await puppeteer.launch();

    const page = await browser.newPage();


    // Go to page and wait until theres no network connections 
    await page.goto(url, {
        waitUntil: 'networkidle0',
    });
    

    function wait (ms) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }

    // Get the height of the rendered page
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();


    // Scroll to bottom of page
    const viewportHeight = page.viewport().height;
    let viewportIncr = 0;
    while (viewportIncr + viewportHeight < height) {
        await page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
        }, viewportHeight);
        await wait(50);
        viewportIncr = viewportIncr + viewportHeight;
    }


    // Scroll back to top
    await page.evaluate(_ => {
        window.scrollTo(0, 0);
    });


    // Some extra delay to let images load
    await wait(100);




    // get a list of all elements, same as "document.querySelectorAll('div')"
    const divs = await page.$$eval('div', (elements) => {
        const divs = [];
        for (let i = 0; i < elements.length; i++) {
          const div = {};
          div.className = elements[i].className;
          div.innerHTML = elements[i].innerHTML;
          divs.push(div);
        }
        return divs;
    });

    //const elements = page.$$('divs');

    const elements = await page.evaluate(() => {
        
        return Array.from(document.querySelectorAll("div"))

    });

    /*
    for (let i = 0; i < divs.length; i++) {
        console.log(divs[i].className);
        try {
            const shot = await page.waitForSelector('.${divs[i].className}');
            await shot.screenshot({
                path: urlPrompt+'\\'+divs[i].className+'${i}.png'
            })   
        }
        catch (TimeoutError) {
            console.log("Element could not be screenshot. Element is likely invisible");
        }
    };
    */

    /*

    elements.forEach((element, i) => {
        const className = divs.className[i];
        try {
            // get screenshot of a particular element
            element.screenshot({
                path: urlPrompt+'\\'+`${divs.className[i]}.png`
            })
        } catch(e) {
            // if element is 'not visible', spit out error and continue
            console.log(`couldnt take screenshot of element with index: ${i}. cause: `,  e)
        }

      });
*/

/*
    for (let i = 0; i < elements.length; i++) {
        try {
            // get screenshot of a particular element
            await elements[i].screenshot({
                path: urlPrompt+'\\'+`${i}.png`
            })
        } catch(e) {
            // if element is 'not visible', spit out error and continue
            console.log(`couldnt take screenshot of element with index: ${i}. cause: `,  e)
        }
        }
       
    await browser.close();


})();

/*
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function screenshotWebflowDivs(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Wait for all the elements to load on the page
  await page.waitForSelector('div');
  
  // Get the div class names
  const divClassNames = await page.$$eval('div', divs => {
    return divs.map(div => div.getAttribute('class'));
  });
  
  // Create a folder named after the site URL
  const folderName = url.replace(/(^\w+:|^)\/\//, '').replace(/\./g, '_');
  const folderPath = path.join(__dirname, folderName);
  fs.mkdirSync(folderPath, { recursive: true });
  
  // Capture screenshots of all the divs
  for (let i = 0; i < divClassNames.length; i++) {
    const divClassName = divClassNames[i];
    const screenshotPath = path.join(folderPath, `${divClassName}.png`);
    
    // Scroll to the div element to ensure it's visible
    await page.evaluate((className) => {
      const div = document.querySelector(`.${className}`);
      div.scrollIntoView();
    }, divClassName);
    
    // Capture screenshot of the div element
    await page.screenshot({ path: screenshotPath });
  }
  
  await browser.close();
}

// Usage: node script.js <webflow_template_url>
const webflowTemplateUrl = process.argv[2];
screenshotWebflowDivs(webflowTemplateUrl)
  .then(() => console.log('Screenshots captured successfully.'))
  .catch(error => console.error('Error capturing screenshots:', error));




Full page screenshot
await page.screenshot({
    path: urlPrompt+'\\'+'root-page.png',
    fullPage: true
});
*/