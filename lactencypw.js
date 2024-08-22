
const { chromium } = require('playwright');

(async () => {
    const numberOfBrowsers = 2;
    const pageURL = 'https://www.goethe.de/ins/de/en/prf/ort/fra/gzb2.cfm';
    const targetTime = '21:16:00'; // The exact time you want to start clicking (e.g., 10:30 AM)

    try {
        // Function to wait until the exact target time
        const waitUntilTime = (targetTime) => {
            return new Promise(resolve => {
                const now = new Date();
                const target = new Date(now.toDateString() + ' ' + targetTime);
                const delay = target.getTime() - now.getTime();

                if (delay > 0) {
                    setTimeout(resolve, delay);
                } else {
                    resolve();
                }
            });
        };

        // Function to perform the selection process in each browser
        async function selectModulesInBrowser(browserIndex) {
            const browser = await chromium.launch({
                headless: true, // Run in headless mode for faster execution
                args: ['--disable-gpu', '--no-sandbox'], // Reduce resource usage
            });

            const context = await browser.newContext({
                cacheEnabled: true, // Enable caching to speed up subsequent requests
            });

            const page = await context.newPage();

            // Block unnecessary resources like images and stylesheets
            await page.route('**/*.{png,jpg,jpeg,gif,css}', route => route.abort());  

            // Navigate to the page with minimal loading time
           await page.goto(pageURL, { waitUntil: 'domcontentloaded' });

            // Wait until the target time
            await waitUntilTime(targetTime);

 
            try {
                // Wait for the "SELECT MODULES" button to be available and click it
                await page.waitForSelector('.btnGruen.icon-double-arrow-right', { timeout: 5000 });
                await page.click('.btnGruen.icon-double-arrow-right');
                console.log(`Browser ${browserIndex + 1}: "SELECT MODULES" button clicked.`);

                // Wait for the "Continue" button to be available and click it
                await page.waitForSelector('.cs-button.cs-button--arrow_next', { timeout: 5000 });
                await page.click('.cs-button.cs-button--arrow_next');
                console.log(`Browser ${browserIndex + 1}: "Continue" button clicked.`);

            } catch (error) {
                console.error(`Browser ${browserIndex + 1}: Failed to complete the selection process.`, error);
            }

            // Close the browser after the process is complete to free up resources
            await browser.close();
        }

        // Launch the specified number of browsers in parallel
        const browserPromises = [];
        for (let i = 0; i < numberOfBrowsers; i++) {
            browserPromises.push(selectModulesInBrowser(i));
        }

        await Promise.all(browserPromises);

    } catch (error) {
        console.error('Error occurred:', error);
    }
})();